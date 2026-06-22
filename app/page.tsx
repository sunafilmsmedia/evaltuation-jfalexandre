import FormFlow from "./components/FormFlow";
import CourtierBadge from "./components/CourtierBadge";
import MontrealMapClient from "./components/MontrealMapClient";

export default function Home() {
  return (
    <main className="relative min-h-screen page-vignette overflow-hidden">
      {/* Montreal map background (blue tint, low opacity) */}
      <MontrealMapClient />

      {/* Soft white gradient overlay for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/40 to-white/70 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center px-4 md:px-8 py-6 md:py-12 min-h-screen">
        <div className="w-full flex-1 flex flex-col">
          {/* Compact brand chip on top of the form */}
          <div className="w-full max-w-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-blue-100 text-[10px] text-[#1d4ed8] uppercase tracking-widest">
              <span className="w-1 h-1 rounded-full bg-[#1d4ed8] animate-pulse" />
              Évaluation boostée par l&apos;IA
            </span>
          </div>

          <FormFlow />
        </div>
      </div>

      {/* Floating courtier card (more prominent on mobile) */}
      <CourtierBadge />
    </main>
  );
}
