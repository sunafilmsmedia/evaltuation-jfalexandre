import Image from "next/image";

export default function AgencyLogo() {
  return (
    <div className="fixed top-3 left-3 md:top-5 md:left-6 z-30 pointer-events-none">
      <div className="pointer-events-auto rounded-xl bg-white/85 backdrop-blur-md border border-red-100 shadow-md shadow-red-200/40 px-2.5 py-1.5 md:px-3 md:py-2">
        <Image
          src="/agency-logo.png"
          alt="The Agency"
          width={1920}
          height={842}
          priority
          className="h-8 md:h-10 w-auto"
        />
      </div>
    </div>
  );
}
