"use client";

import type { Question } from "@/app/lib/questions";

type Props = {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
  onAdvance: () => void;
};

export default function QuestionInput({
  question,
  value,
  onChange,
  onAdvance,
}: Props) {
  if (question.type === "single") {
    return (
      <div className="grid gap-3">
        {question.options?.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                // Instant advance — no delay.
                onAdvance();
              }}
              className={`text-left px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl border transition-all duration-200 ${
                selected
                  ? "border-[#1d4ed8] bg-[#1d4ed8] text-white shadow-lg shadow-blue-200"
                  : "border-blue-100 bg-white/80 backdrop-blur-sm text-[#0a2540] hover:border-[#1d4ed8] hover:bg-blue-50"
              }`}
            >
              <span className="block text-sm md:text-base font-medium">{opt.label}</span>
              {opt.hint && (
                <span
                  className={`block text-xs mt-1 ${selected ? "text-blue-100" : "text-slate-500"}`}
                >
                  {opt.hint}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "multi") {
    const arr = Array.isArray(value) ? (value as string[]) : [];
    const toggle = (v: string) => {
      if (arr.includes(v)) onChange(arr.filter((x) => x !== v));
      else onChange([...arr, v]);
    };
    return (
      <div className="grid gap-3">
        {question.options?.map((opt) => {
          const selected = arr.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`text-left px-5 py-4 rounded-2xl border transition-all duration-200 flex items-center gap-3 ${
                selected
                  ? "border-[#1d4ed8] bg-blue-50 text-[#0a2540]"
                  : "border-blue-100 bg-white/80 backdrop-blur-sm text-[#0a2540] hover:border-[#1d4ed8]"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-colors ${
                  selected
                    ? "bg-[#1d4ed8] border-[#1d4ed8]"
                    : "border-blue-200"
                }`}
              >
                {selected && (
                  <svg
                    className="w-3 h-3 text-white"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2 6l3 3 5-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span className="text-base font-medium">{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "number") {
    const num = typeof value === "number" ? value : 0;
    return (
      <div className="grid gap-4">
        <div className="flex items-baseline gap-3">
          <input
            type="number"
            inputMode="numeric"
            value={value === undefined || value === null ? "" : String(value)}
            placeholder={question.placeholder}
            min={question.min}
            max={question.max}
            step={question.step}
            onChange={(e) => {
              const v = e.target.value;
              onChange(v === "" ? undefined : Number(v));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") onAdvance();
            }}
            className="w-full px-5 py-4 text-3xl font-display text-[#0a2540] bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl focus:outline-none focus:border-[#1d4ed8] focus:ring-4 focus:ring-blue-100"
          />
          {question.suffix && (
            <span className="text-xl text-slate-500 font-medium">
              {question.suffix}
            </span>
          )}
        </div>
        {question.min !== undefined && question.max !== undefined && (
          <input
            type="range"
            min={question.min}
            max={question.max}
            step={question.step ?? 1}
            value={num}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        )}
      </div>
    );
  }

  if (question.type === "currency") {
    const raw =
      value === undefined || value === null ? "" : String(value);
    const formatted = raw
      ? Number(raw).toLocaleString("fr-CA")
      : "";
    return (
      <div className="grid gap-3">
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={formatted}
            placeholder={question.placeholder}
            onChange={(e) => {
              const digits = e.target.value.replace(/[^\d]/g, "");
              onChange(digits === "" ? undefined : Number(digits));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") onAdvance();
            }}
            className="w-full pl-10 pr-5 py-4 text-3xl font-display text-[#0a2540] bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl focus:outline-none focus:border-[#1d4ed8] focus:ring-4 focus:ring-blue-100"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-slate-400">
            $
          </span>
        </div>
      </div>
    );
  }

  if (question.type === "text") {
    return (
      <input
        type="text"
        value={(value as string) ?? ""}
        placeholder={question.placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onAdvance();
        }}
        className="w-full px-5 py-4 text-xl text-[#0a2540] bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl focus:outline-none focus:border-[#1d4ed8] focus:ring-4 focus:ring-blue-100"
      />
    );
  }

  return null;
}
