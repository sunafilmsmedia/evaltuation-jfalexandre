"use client";

import { motion } from "framer-motion";

type Props = {
  onChoice: (choice: "contact" | "direct") => void;
};

export default function ResultGate({ onChoice }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="rounded-2xl md:rounded-3xl bg-white/95 backdrop-blur-md border border-red-100 shadow-xl shadow-red-100/40 p-6 md:p-10 text-center">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Évaluation prête
        </span>

        <h2 className="font-display text-2xl md:text-3xl text-[#7F1D1D] leading-tight mb-3">
          Ta réponse est prête&nbsp;!
        </h2>
        <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-7 max-w-md mx-auto">
          Avant de voir la réponse, veux-tu recevoir une{" "}
          <strong className="text-[#7F1D1D]">analyse gratuite</strong>{" "}
          personnalisée de ta propriété&nbsp;?
        </p>

        <div className="flex flex-col items-center gap-4">
          {/* Primary CTA — visually dominant */}
          <button
            type="button"
            onClick={() => onChoice("contact")}
            className="w-full max-w-md flex flex-col items-center gap-1 px-6 py-5 rounded-2xl bg-[#DC2626] text-white shadow-xl shadow-red-300 hover:bg-[#991B1B] hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <span className="text-base md:text-lg font-semibold">
              Oui, je veux voir la réponse
            </span>
            <span className="text-xs md:text-sm text-red-100 font-normal">
              Reçois ton analyse par téléphone
            </span>
          </button>

          {/* Secondary — intentionally smaller / less prominent */}
          <button
            type="button"
            onClick={() => onChoice("direct")}
            className="text-xs md:text-sm text-slate-400 hover:text-slate-600 underline underline-offset-2 mt-1 transition-colors"
          >
            Non, je veux juste savoir si c&apos;est le bon moment
          </button>
        </div>
      </div>
    </motion.div>
  );
}
