"use client";

import { useState } from "react";

export type LeadData = {
  name: string;
  phone: string;
  email: string;
  consent: boolean;
};

type Props = {
  value: LeadData;
  onChange: (v: LeadData) => void;
};

export default function LeadCapture({ value, onChange }: Props) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const update = (patch: Partial<LeadData>) => onChange({ ...value, ...patch });

  return (
    <div className="grid gap-5">
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 backdrop-blur-sm p-5 text-sm text-[#0a2540] leading-relaxed">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 mt-0.5 text-[#1d4ed8] shrink-0"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M12 8v4M12 16h.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <div>
            <p className="font-semibold mb-1">Avant de continuer</p>
            <p className="text-slate-700">
              Si notre analyse conclut que ce <em>n'est pas</em> le bon moment
              pour vous de vendre, vos coordonnées seront automatiquement
              supprimées de notre base de données. Aucun courtier ne vous
              contactera. Promis.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        <label className="block">
          <span className="text-sm font-medium text-slate-600 block mb-1.5">
            Prénom et nom
          </span>
          <input
            type="text"
            value={value.name}
            onBlur={() => setTouched({ ...touched, name: true })}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Marie Tremblay"
            className="w-full px-4 py-3 text-lg text-[#0a2540] bg-white/90 border border-blue-100 rounded-xl focus:outline-none focus:border-[#1d4ed8] focus:ring-4 focus:ring-blue-100"
          />
          {touched.name && !value.name && (
            <span className="text-xs text-red-500 mt-1 block">
              Ton nom est requis
            </span>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-600 block mb-1.5">
            Numéro de téléphone
          </span>
          <input
            type="tel"
            value={value.phone}
            onBlur={() => setTouched({ ...touched, phone: true })}
            onChange={(e) => update({ phone: e.target.value })}
            placeholder="(514) 555-0123"
            className="w-full px-4 py-3 text-lg text-[#0a2540] bg-white/90 border border-blue-100 rounded-xl focus:outline-none focus:border-[#1d4ed8] focus:ring-4 focus:ring-blue-100"
          />
          {touched.phone && !value.phone && (
            <span className="text-xs text-red-500 mt-1 block">
              Le téléphone est requis
            </span>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-600 block mb-1.5">
            Courriel <span className="text-slate-400">(optionnel)</span>
          </span>
          <input
            type="email"
            value={value.email}
            onChange={(e) => update({ email: e.target.value })}
            placeholder="marie@exemple.com"
            className="w-full px-4 py-3 text-lg text-[#0a2540] bg-white/90 border border-blue-100 rounded-xl focus:outline-none focus:border-[#1d4ed8] focus:ring-4 focus:ring-blue-100"
          />
        </label>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={value.consent}
          onChange={(e) => update({ consent: e.target.checked })}
          className="mt-1 w-5 h-5 rounded border-blue-200 text-[#1d4ed8] focus:ring-blue-200"
        />
        <span className="text-sm text-slate-700 leading-relaxed">
          J'accepte que mes coordonnées soient utilisées uniquement pour me
          contacter au sujet de l'évaluation de ma propriété. Je peux retirer
          mon consentement en tout temps.
        </span>
      </label>
    </div>
  );
}
