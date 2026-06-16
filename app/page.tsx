"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FormFlow from "./components/FormFlow";
import CourtierBadge from "./components/CourtierBadge";
import MontrealMapClient from "./components/MontrealMapClient";

export default function Home() {
  const [started, setStarted] = useState(false);

  return (
    <main className="relative min-h-screen page-vignette overflow-hidden">
      {/* Montreal map background (blue tint, low opacity) */}
      <MontrealMapClient />

      {/* Soft white gradient overlay for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/40 to-white/70 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center px-4 md:px-8 py-6 md:py-12 min-h-screen">
        <AnimatePresence mode="wait">
          {!started ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-3xl text-center flex-1 flex flex-col justify-center"
            >
              <div className="inline-flex self-center items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-blue-100 text-xs text-[#1d4ed8] uppercase tracking-widest mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1d4ed8] animate-pulse" />
                Estimation personnalisée
              </div>

              <h1 className="font-display text-4xl md:text-6xl text-[#0a2540] leading-[1.05] tracking-tight">
                Est-ce le bon moment
                <br />
                pour vendre votre propriété&nbsp;?
              </h1>

              <p className="mt-5 text-slate-600 text-base md:text-xl max-w-xl mx-auto leading-relaxed">
                En quelques questions, découvrez si le marché — et votre
                situation — jouent en votre faveur.
              </p>

              <p className="mt-4 font-display italic text-lg md:text-2xl text-[#1d4ed8]">
                Boosté par l'intelligence artificielle
                <span className="inline-block ml-2 align-middle w-1.5 h-1.5 rounded-full bg-[#c9a96e]" />
              </p>

              <button
                type="button"
                onClick={() => setStarted(true)}
                className="mt-10 self-center inline-flex items-center gap-3 px-10 py-4 md:py-5 rounded-full bg-[#1d4ed8] text-white text-lg md:text-xl font-medium shadow-2xl shadow-blue-300 hover:bg-[#1e40af] hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Commencer
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 10h12m0 0l-4-4m4 4l-4 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <p className="mt-6 text-xs text-slate-400">
                Vos réponses restent confidentielles. Aucun engagement.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="w-full flex-1 flex flex-col"
            >
              {/* Compact brand chip on top of the form */}
              <div className="w-full max-w-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-blue-100 text-[10px] text-[#1d4ed8] uppercase tracking-widest">
                  <span className="w-1 h-1 rounded-full bg-[#1d4ed8] animate-pulse" />
                  Évaluation en cours
                </span>
              </div>

              <FormFlow />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating courtier card (more prominent on mobile) */}
      <CourtierBadge />
    </main>
  );
}
