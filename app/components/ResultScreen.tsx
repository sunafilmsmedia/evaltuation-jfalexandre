"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ScoreResult } from "@/app/lib/scoring";
import { trackFbEvent } from "@/app/lib/fbq";

export type AIReport = {
  headline: string;
  summary: string;
  stats: { label: string; value: string; detail: string }[];
  steps: { title: string; description: string }[];
  marketInsight: string;
};

type Props = {
  score: ScoreResult;
  report: AIReport;
  answers: Record<string, unknown>;
};

type LeadDraft = {
  name: string;
  email: string;
  phone: string;
  consent: boolean;
};

function VerdictBadge({ verdict }: { verdict: ScoreResult["verdict"] }) {
  const map = {
    favorable: {
      label: "Moment favorable",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    moyen: {
      label: "Moment correct",
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    defavorable: {
      label: "Patienter recommandé",
      color: "bg-rose-50 text-rose-700 border-rose-200",
    },
  } as const;
  const cfg = map[verdict];
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full border ${cfg.color}`}
    >
      {cfg.label}
    </span>
  );
}

function ScoreCard({ score }: { score: ScoreResult }) {
  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-[#0a2540] to-[#1d4ed8] p-6 md:p-7 text-white overflow-hidden">
      <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
      <div className="absolute -right-16 -bottom-16 w-56 h-56 rounded-full bg-white/5" />
      <div className="relative">
        <span className="text-xs uppercase tracking-wider text-blue-200">
          Score d&apos;opportunité
        </span>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-display text-6xl md:text-7xl font-semibold">
            {score.score}
          </span>
          <span className="text-xl text-blue-200">/ 100</span>
        </div>
        <div className="mt-4 h-2 bg-white/15 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score.score}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="h-full bg-gradient-to-r from-[#c9a96e] to-white rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

export default function ResultScreen({ score, report, answers }: Props) {
  const [lead, setLead] = useState<LeadDraft>({
    name: "",
    email: "",
    phone: "",
    consent: false,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedStored, setSubmittedStored] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    Boolean(lead.name) &&
    Boolean(lead.email) &&
    Boolean(lead.phone) &&
    lead.consent &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          consent: lead.consent,
          answers,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        stored?: boolean;
      };

      // Fire Meta Pixel "Lead" (= "Prospect" FR)
      trackFbEvent("Lead", {
        score: score.score,
        verdict: score.verdict,
      });

      setSubmittedStored(Boolean(json.stored));
    } catch (err) {
      console.error(err);
      setError("Un problème est survenu. Réessaie dans un instant.");
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitted = submittedStored !== null;
  const firstName = lead.name ? lead.name.trim().split(" ")[0] : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto"
    >
      {/* --- Preview card: always visible --- */}
      <div className="rounded-2xl md:rounded-3xl bg-white/90 backdrop-blur-md border border-blue-100 shadow-xl shadow-blue-100/40 p-6 md:p-9">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <VerdictBadge verdict={score.verdict} />
          <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider">
            Évaluation préliminaire
          </span>
        </div>

        <h1 className="font-display text-2xl md:text-4xl text-[#0a2540] leading-tight mb-2 md:mb-3">
          {report.headline}
        </h1>
        <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-5 md:mb-7">
          {report.summary}
        </p>

        <ScoreCard score={score} />
      </div>

      {/* --- Lead form (shows below preview, hides once submitted) --- */}
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.form
            key="lead-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-5 rounded-2xl md:rounded-3xl bg-white/90 backdrop-blur-md border border-blue-100 shadow-xl shadow-blue-100/40 p-6 md:p-9"
          >
            <h2 className="font-display text-xl md:text-2xl text-[#0a2540] leading-tight mb-1.5">
              À quel courriel je peux t&apos;envoyer les démarches à suivre&nbsp;?
            </h2>
            <p className="text-slate-500 text-sm md:text-base mb-5 leading-relaxed">
              Reçois ton plan personnalisé pour vendre ta propriété — étapes
              concrètes, ordre des choses à faire, et conseils sur mesure.
            </p>

            <div className="grid gap-3">
              <label className="block">
                <span className="text-xs md:text-sm font-medium text-slate-600 block mb-1.5">
                  Prénom et nom
                </span>
                <input
                  type="text"
                  value={lead.name}
                  onBlur={() => setTouched({ ...touched, name: true })}
                  onChange={(e) => setLead({ ...lead, name: e.target.value })}
                  placeholder="Marie Tremblay"
                  className="w-full px-4 py-3 text-base md:text-lg text-[#0a2540] bg-white border border-blue-100 rounded-xl focus:outline-none focus:border-[#1d4ed8] focus:ring-4 focus:ring-blue-100"
                />
                {touched.name && !lead.name && (
                  <span className="text-xs text-rose-500 mt-1 block">
                    Ton nom est requis
                  </span>
                )}
              </label>

              <label className="block">
                <span className="text-xs md:text-sm font-medium text-slate-600 block mb-1.5">
                  Courriel
                </span>
                <input
                  type="email"
                  value={lead.email}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  onChange={(e) => setLead({ ...lead, email: e.target.value })}
                  placeholder="marie@exemple.com"
                  className="w-full px-4 py-3 text-base md:text-lg text-[#0a2540] bg-white border border-blue-100 rounded-xl focus:outline-none focus:border-[#1d4ed8] focus:ring-4 focus:ring-blue-100"
                />
                {touched.email && !lead.email && (
                  <span className="text-xs text-rose-500 mt-1 block">
                    Ton courriel est requis pour recevoir tes démarches
                  </span>
                )}
              </label>

              <label className="block">
                <span className="text-xs md:text-sm font-medium text-slate-600 block mb-1.5">
                  Numéro de téléphone
                </span>
                <input
                  type="tel"
                  value={lead.phone}
                  onBlur={() => setTouched({ ...touched, phone: true })}
                  onChange={(e) => setLead({ ...lead, phone: e.target.value })}
                  placeholder="(514) 555-0123"
                  className="w-full px-4 py-3 text-base md:text-lg text-[#0a2540] bg-white border border-blue-100 rounded-xl focus:outline-none focus:border-[#1d4ed8] focus:ring-4 focus:ring-blue-100"
                />
                {touched.phone && !lead.phone && (
                  <span className="text-xs text-rose-500 mt-1 block">
                    Pour pouvoir t&apos;appeler au besoin
                  </span>
                )}
              </label>
            </div>

            <label className="flex items-start gap-3 cursor-pointer mt-4">
              <input
                type="checkbox"
                checked={lead.consent}
                onChange={(e) =>
                  setLead({ ...lead, consent: e.target.checked })
                }
                className="mt-1 w-5 h-5 rounded border-blue-200 text-[#1d4ed8] focus:ring-blue-200"
              />
              <span className="text-xs md:text-sm text-slate-600 leading-relaxed">
                J&apos;accepte d&apos;être contacté·e au sujet de l&apos;évaluation de ma
                propriété.
              </span>
            </label>

            {error && (
              <p className="text-rose-500 text-sm mt-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#1d4ed8] text-white text-base font-medium shadow-lg shadow-blue-200 hover:bg-[#1e40af] disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all"
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
                  Envoi…
                </>
              ) : (
                <>
                  Recevoir mes démarches
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
          </motion.form>
        ) : (
          <motion.div
            key="full-report"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-5 rounded-2xl md:rounded-3xl bg-white/90 backdrop-blur-md border border-blue-100 shadow-xl shadow-blue-100/40 p-6 md:p-9"
          >
            {/* Confirmation message */}
            <div className="mb-7 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm md:text-base">
              {submittedStored ? (
                <>
                  ✓ Parfait{firstName ? `, ${firstName}` : ""}&nbsp;! Tes
                  démarches arrivent dans ta boîte courriel sous peu. Un
                  courtier prendra aussi contact avec toi dans les prochains
                  jours ouvrables.
                </>
              ) : (
                <>
                  ✓ Merci pour ta participation. Comme le moment ne semble pas
                  optimal pour vendre, tes coordonnées n&apos;ont pas été conservées
                  — c&apos;est notre promesse. Revis-nous voir dans quelques
                  mois&nbsp;!
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-3 mb-7">
              {report.stats.slice(1, 4).map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-blue-100 bg-white/70 backdrop-blur-sm px-4 py-3"
                >
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] md:text-xs uppercase tracking-wider text-slate-500">
                      {stat.label}
                    </span>
                    <span className="font-display text-lg md:text-xl text-[#1d4ed8]">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">
                    {stat.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* Market insight */}
            <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-5 mb-7">
              <span className="text-xs uppercase tracking-wider text-[#1d4ed8] font-semibold">
                Donnée du marché
              </span>
              <p className="text-[#0a2540] mt-1 leading-relaxed text-sm md:text-base">
                {report.marketInsight}
              </p>
            </div>

            {/* Why factors */}
            {score.factors.length > 0 && (
              <div className="mb-7">
                <h3 className="font-display text-xl md:text-2xl text-[#0a2540] mb-3">
                  Pourquoi ce verdict
                </h3>
                <div className="grid gap-2">
                  {score.factors.map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-xl border border-blue-50 bg-white/60"
                    >
                      <span
                        className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                          f.impact === "positif"
                            ? "bg-emerald-500"
                            : f.impact === "negatif"
                              ? "bg-rose-500"
                              : "bg-slate-400"
                        }`}
                      />
                      <div>
                        <span className="font-medium text-[#0a2540] text-sm">
                          {f.label}
                        </span>
                        <p className="text-sm text-slate-600 mt-0.5">
                          {f.detail}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Next steps */}
            <div>
              <h3 className="font-display text-xl md:text-2xl text-[#0a2540] mb-3">
                Les étapes à suivre
              </h3>
              <ol className="grid gap-3">
                {report.steps.map((step, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="flex gap-4 p-4 rounded-xl border border-blue-100 bg-white/70"
                  >
                    <span className="shrink-0 w-9 h-9 rounded-full bg-[#1d4ed8] text-white font-display flex items-center justify-center text-lg">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-[#0a2540]">
                        {step.title}
                      </h4>
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
