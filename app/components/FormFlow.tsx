"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { questions } from "@/app/lib/questions";
import type { ScoreResult } from "@/app/lib/scoring";
import QuestionInput from "./QuestionInput";
import LeadCapture, { type LeadData } from "./LeadCapture";
import ResultScreen, { type AIReport } from "./ResultScreen";
import RegionPickerMapClient from "./RegionPickerMapClient";

type Answers = Record<string, unknown>;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export default function FormFlow() {
  const [answers, setAnswers] = useState<Answers>({});
  const [lead, setLead] = useState<LeadData>({
    name: "",
    phone: "",
    email: "",
    consent: false,
  });
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    score: ScoreResult;
    report: AIReport;
    leadStored: boolean;
  } | null>(null);

  // Filter visible questions based on conditional branching
  const visibleQuestions = useMemo(
    () => questions.filter((q) => !q.showIf || q.showIf(answers)),
    [answers],
  );

  const current = visibleQuestions[index];
  const total = visibleQuestions.length;
  const progress = ((index + 1) / total) * 100;

  const canAdvance = (): boolean => {
    if (!current) return false;
    if (current.type === "lead") {
      return Boolean(lead.name && lead.phone && lead.consent);
    }
    if (!current.required) return true;
    const v = answers[current.id];
    if (current.type === "multi")
      return Array.isArray(v) && (v as string[]).length > 0;
    return v !== undefined && v !== null && v !== "";
  };

  const next = async () => {
    if (!canAdvance() || submitting) return;
    if (index === total - 1) {
      await submit();
      return;
    }
    setDirection(1);
    setIndex((i) => Math.min(i + 1, total - 1));
  };

  const back = () => {
    if (index === 0) return;
    setDirection(-1);
    setIndex((i) => Math.max(i - 1, 0));
  };

  const setAnswer = (id: string, v: unknown) => {
    setAnswers((a) => ({ ...a, [id]: v }));
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!analyzeRes.ok) throw new Error("Analyse impossible");
      const data = (await analyzeRes.json()) as {
        score: ScoreResult;
        report: AIReport;
      };

      const leadRes = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          phone: lead.phone,
          email: lead.email || undefined,
          consent: lead.consent,
          answers,
        }),
      });
      const leadJson = (await leadRes.json().catch(() => ({}))) as {
        stored?: boolean;
      };

      setResult({
        score: data.score,
        report: data.report,
        leadStored: Boolean(leadJson.stored),
      });
    } catch (err) {
      console.error(err);
      setError(
        "Un problème est survenu. Réessaie dans un instant, on travaille toujours sur ton rapport.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <ResultScreen
        score={result.score}
        report={result.report}
        leadStored={result.leadStored}
        leadName={lead.name}
      />
    );
  }

  if (!current) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
          <span>
            Question {index + 1} sur {total}
          </span>
          <span>{Math.round(progress)} %</span>
        </div>
        <div className="h-1 bg-blue-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6] rounded-full"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Animated question card */}
      <div className="relative min-h-[460px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 320, damping: 32 },
              opacity: { duration: 0.2 },
            }}
            className="rounded-3xl bg-white/85 backdrop-blur-md border border-blue-100 shadow-xl shadow-blue-100/40 p-7 md:p-9"
          >
            <h2 className="font-display text-2xl md:text-3xl text-[#0a2540] leading-tight mb-2">
              {current.title}
            </h2>
            {current.subtitle && (
              <p className="text-slate-500 text-base mb-6 leading-relaxed">
                {current.subtitle}
              </p>
            )}
            {!current.subtitle && <div className="mb-6" />}

            {current.type === "lead" ? (
              <LeadCapture value={lead} onChange={setLead} />
            ) : current.type === "region-map" ? (
              <RegionPickerMapClient
                value={answers[current.id] as string | undefined}
                onChange={(v) => setAnswer(current.id, v)}
              />
            ) : (
              <QuestionInput
                question={current}
                value={answers[current.id]}
                onChange={(v) => setAnswer(current.id, v)}
                onAdvance={next}
              />
            )}

            {error && (
              <p className="text-rose-500 text-sm mt-4">{error}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          type="button"
          onClick={back}
          disabled={index === 0 || submitting}
          className="text-sm font-medium text-slate-500 hover:text-[#1d4ed8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-2"
        >
          ← Précédent
        </button>

        <button
          type="button"
          onClick={next}
          disabled={!canAdvance() || submitting}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1d4ed8] text-white font-medium shadow-lg shadow-blue-200 hover:bg-[#1e40af] disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all"
        >
          {submitting ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-25"
                />
                <path
                  d="M4 12a8 8 0 018-8"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              Analyse en cours…
            </>
          ) : index === total - 1 ? (
            <>
              Obtenir mon rapport
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4 10h12m0 0l-4-4m4 4l-4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          ) : (
            <>
              Suivant
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4 10h12m0 0l-4-4m4 4l-4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
