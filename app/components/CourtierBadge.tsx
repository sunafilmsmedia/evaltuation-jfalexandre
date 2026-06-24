import Image from "next/image";

export default function CourtierBadge() {
  return (
    <div
      className="
        fixed z-30 pointer-events-none
        bottom-4 right-4
        md:bottom-6 md:right-6
      "
    >
      <div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-white/95 backdrop-blur-md border border-red-100 shadow-xl shadow-red-200/50 pl-2 pr-4 py-2 md:pl-2.5 md:pr-5 md:py-2.5">
        <div className="relative">
          <Image
            src="/courtier.webp"
            alt="Jean-François Alexandre, courtier immobilier"
            width={120}
            height={120}
            priority
            className="w-16 h-16 md:w-14 md:h-14 rounded-xl object-cover object-top ring-2 ring-white"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>
        <div className="leading-tight">
          <p className="text-[11px] uppercase tracking-wider text-[#DC2626] font-semibold">
            Votre courtier
          </p>
          <p className="font-display text-base md:text-[15px] text-[#7F1D1D] font-semibold">
            JF Alexandre
          </p>
          <p className="text-[11px] text-slate-500 hidden md:block">
            Disponible aujourd'hui
          </p>
        </div>
      </div>
    </div>
  );
}
