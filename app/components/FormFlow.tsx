"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { questions } from "@/app/lib/questions";
import type { ScoreResult } from "@/app/lib/scoring";
import QuestionInput from "./QuestionInput";
import ResultScreen, { type AIReport } from "./ResultScreen";
import RegionPickerMapClient from "./RegionPickerMapClient";
import AILoading from "./AILoading";
import ResultGate from "./ResultGate";

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
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    score: ScoreResult;
    report: AIReport;
  } | null>(null);
  // Whether the user has chosen to gate behind the contact form (option 1)
  // or skip straight to the result with optional form below (option 2).
  const [gateChoice, setGateChoice] = useState<"contact" | "direct" | null>(
    null,
  );

  // Filter visible questions based on conditional branching
  const visibleQuestions = useMemo(
    () => questions.filter((q) => !q.showIf || q.showIf(answers)),
    [answers],
  );

  const current = visibleQuestions[index];
  const total = visibleQuestions.length;
  const progress = ((index + 1) / total) * 100;

  const isValid = (value: unknown): boolean => {
    if (!current) return false;
    if (!current.required) return true;
    if (current.type === "multi")
      return Array.isArray(value) && (value as string[]).length > 0;
    return value !== undefined && value !== null && value !== "";
  };

  const canAdvance = (): boolean => isValid(answers[current?.id ?? ""]);

  // Accepts an optional explicit value to bypass React state-flush timing —
  // when called right after `onChange`, the new answer isn't in `answers` yet.
  const next = async (explicitValue?: unknown) => {
    if (submitting || !current) return;
    const valueToCheck =
      explicitValue !== undefined ? explicitValue : answers[current.id];
    if (!isValid(valueToCheck)) return;
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
      // Run the analyze request and a 2-second min display of the AI loader
      // in parallel — show the result only when BOTH finish, so the loader
      // is always visible long enough to read regardless of API latency.
      const minDelay = new Promise((resolve) => setTimeout(resolve, 2000));
      const fetchPromise = fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const [analyzeRes] = await Promise.all([fetchPromise, minDelay]);
      if (!analyzeRes.ok) throw new Error("Analyse impossible");
      const data = (await analyzeRes.json()) as {
        score: ScoreResult;
        report: AIReport;
      };

      setResult({
        score: data.score,
        report: data.report,
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

  if (submitting) {
    return <AILoading />;
  }

  if (result && !gateChoice) {
    return <ResultGate onChoice={setGateChoice} />;
  }

  if (result && gateChoice) {
    return (
      <ResultScreen
        score={result.score}
        report={result.report}
        answers={answers}
        mode={gateChoice === "contact" ? "gated" : "open"}
      />
    );
  }

  if (!current) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-1.5 text-[11px] md:text-xs text-slate-500">
          <span>
            Question {index + 1} sur {total}
          </span>
          <span>{Math.round(progress)} %</span>
        </div>
        <div className="h-1 bg-red-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#DC2626] to-[#EF4444] rounded-full"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Animated question card */}
      <div className="relative">
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
            className="rounded-2xl md:rounded-3xl bg-white/90 backdrop-blur-md border border-red-100 shadow-xl shadow-red-100/40 p-5 md:p-8"
          >
            <h2 className="font-display text-xl md:text-2xl text-[#7F1D1D] leading-tight mb-1.5">
              {current.title}
            </h2>
            {current.subtitle && (
              <p className="text-slate-500 text-sm md:text-base mb-4 md:mb-5 leading-relaxed">
                {current.subtitle}
              </p>
            )}
            {!current.subtitle && <div className="mb-3 md:mb-4" />}

            {current.type === "region-map" ? (
              <RegionPickerMapClient
                value={answers[current.id] as string | undefined}
                onChange={(v) => {
                  setAnswer(current.id, v);
                  // Pass v explicitly so the post-delay next() doesn't read
                  // a stale closure. 500ms gives time to see the marker confirm.
                  setTimeout(() => next(v), 500);
                }}
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
      <div className="flex items-center justify-between mt-4 md:mt-5">
        <button
          type="button"
          onClick={back}
          disabled={index === 0 || submitting}
          className="text-xs md:text-sm font-medium text-slate-500 hover:text-[#DC2626] disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 md:px-3 py-2"
        >
          ← Précédent
        </button>

        <button
          type="button"
          onClick={next}
          disabled={!canAdvance() || submitting}
          className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-[#DC2626] text-white text-sm md:text-base font-medium shadow-lg shadow-red-200 hover:bg-[#991B1B] disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all"
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
              Voir mon évaluation
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
