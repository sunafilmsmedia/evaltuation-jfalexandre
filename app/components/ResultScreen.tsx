"use client";

import { motion } from "framer-motion";
import type { ScoreResult } from "@/app/lib/scoring";

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
  leadStored: boolean;
  leadName?: string;
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

export default function ResultScreen({
  score,
  report,
  leadStored,
  leadName,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="rounded-3xl bg-white/85 backdrop-blur-md border border-blue-100 shadow-xl shadow-blue-100/40 p-8 md:p-10">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
          <VerdictBadge verdict={score.verdict} />
          <span className="text-xs text-slate-400 uppercase tracking-wider">
            Rapport personnalisé
          </span>
        </div>

        <h1 className="font-display text-3xl md:text-4xl text-[#0a2540] leading-tight mb-3">
          {leadName ? `${leadName.split(" ")[0]}, ` : ""}
          {report.headline}
        </h1>
        <p className="text-slate-600 text-lg leading-relaxed mb-8">
          {report.summary}
        </p>

        {/* Score ring + stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="relative rounded-2xl bg-gradient-to-br from-[#0a2540] to-[#1d4ed8] p-7 text-white overflow-hidden">
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute -right-16 -bottom-16 w-56 h-56 rounded-full bg-white/5" />
            <div className="relative">
              <span className="text-xs uppercase tracking-wider text-blue-200">
                Score d'opportunité
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-display text-7xl font-semibold">
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

          <div className="grid grid-cols-1 gap-3">
            {report.stats.slice(1, 4).map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-blue-100 bg-white/70 backdrop-blur-sm px-4 py-3"
              >
                <div className="flex justify-between items-baseline">
                  <span className="text-xs uppercase tracking-wider text-slate-500">
                    {stat.label}
                  </span>
                  <span className="font-display text-xl text-[#1d4ed8]">
                    {stat.value}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-snug">
                  {stat.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Market insight */}
        <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-5 mb-8">
          <span className="text-xs uppercase tracking-wider text-[#1d4ed8] font-semibold">
            Donnée du marché
          </span>
          <p className="text-[#0a2540] mt-1 leading-relaxed">
            {report.marketInsight}
          </p>
        </div>

        {/* Why factors */}
        {score.factors.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-2xl text-[#0a2540] mb-4">
              Pourquoi ce verdict
            </h2>
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
                    <p className="text-sm text-slate-600 mt-0.5">{f.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Next steps */}
        <div>
          <h2 className="font-display text-2xl text-[#0a2540] mb-4">
            Les étapes à suivre
          </h2>
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
                  <h3 className="font-semibold text-[#0a2540]">{step.title}</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>

        {/* Lead status note */}
        <div className="mt-8 pt-6 border-t border-blue-50 text-sm text-slate-500">
          {leadStored ? (
            <p>
              Un courtier prendra contact avec vous dans les prochains jours
              ouvrables.
            </p>
          ) : (
            <p>
              Conformément à notre promesse, vos coordonnées n'ont pas été
              conservées puisque le moment ne semble pas optimal pour vendre.
              Revenez nous voir dans quelques mois — le marché évolue
              rapidement.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
