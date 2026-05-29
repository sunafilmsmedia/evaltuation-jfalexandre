import FormFlow from "./components/FormFlow";
import CourtierBadge from "./components/CourtierBadge";
import MontrealMapClient from "./components/MontrealMapClient";

export default function Home() {
  return (
    <main className="relative min-h-screen page-vignette overflow-hidden">
      {/* Montreal map background (blue tint, low opacity) */}
      <MontrealMapClient />

      {/* Soft white gradient overlay for legibility (lighter to let the map show through) */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/40 to-white/70 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center px-5 md:px-8 py-10 md:py-14 min-h-screen">
        {/* Header */}
        <header className="w-full max-w-3xl mb-10 md:mb-14 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-blue-100 text-xs text-[#1d4ed8] uppercase tracking-widest mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1d4ed8] animate-pulse" />
            Estimation personnalisée
          </div>

          <h1 className="font-display text-4xl md:text-6xl text-[#0a2540] leading-[1.05] tracking-tight">
            Est-ce le bon moment
            <br />
            pour vendre votre propriété ?
          </h1>

          <p className="mt-5 text-slate-600 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            En quelques questions, découvrez si le marché — et votre situation
            — jouent en votre faveur.
          </p>

          <p className="mt-4 font-display italic text-xl md:text-2xl text-[#1d4ed8]">
            Boosté par l'intelligence artificielle
            <span className="inline-block ml-2 align-middle w-1.5 h-1.5 rounded-full bg-[#c9a96e]" />
          </p>
        </header>

        {/* Form */}
        <section className="w-full">
          <FormFlow />
        </section>

        {/* Footer reassurance — extra bottom padding so it never sits under the courtier badge */}
        <footer className="mt-12 mb-28 md:mb-24 text-center text-xs text-slate-400 max-w-md">
          Vos réponses restent confidentielles. Aucun engagement, aucun frais.
        </footer>
      </div>

      {/* Floating courtier card (more prominent on mobile) */}
      <CourtierBadge />
    </main>
  );
}
