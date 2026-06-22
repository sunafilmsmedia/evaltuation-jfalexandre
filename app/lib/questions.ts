export type QuestionType =
  | "single"
  | "multi"
  | "number"
  | "currency"
  | "text"
  | "tel"
  | "lead"
  | "region-map";

export type Option = {
  value: string;
  label: string;
  hint?: string;
};

export type Question = {
  id: string;
  type: QuestionType;
  title: string;
  subtitle?: string;
  placeholder?: string;
  options?: Option[];
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  required?: boolean;
  // Conditional: only show this question if the predicate returns true
  showIf?: (answers: Record<string, unknown>) => boolean;
};

export const questions: Question[] = [
  {
    id: "propertyType",
    type: "single",
    title: "Quel type de propriété possédez-vous ?",
    subtitle: "Cela nous aide à mieux contextualiser votre situation.",
    required: true,
    options: [
      { value: "maison", label: "Maison unifamiliale" },
      { value: "condo", label: "Condo / Appartement" },
      { value: "plex", label: "Plex (duplex, triplex…)" },
      { value: "chalet", label: "Chalet / Secondaire" },
    ],
  },
  {
    id: "yearsOwned",
    type: "number",
    title: "Depuis combien d'années possédez-vous votre propriété ?",
    subtitle: "Une estimation suffit.",
    placeholder: "Ex. 7",
    suffix: "ans",
    min: 0,
    max: 60,
    step: 1,
    required: true,
  },
  {
    id: "estimatedValue",
    type: "currency",
    title: "Combien penses-tu qu'elle vaut aujourd'hui ?",
    subtitle: "Ton estimation honnête, on raffinera ensuite.",
    placeholder: "525 000",
    min: 0,
    step: 1000,
    required: true,
  },
  {
    id: "mortgageStatus",
    type: "single",
    title: "Où en êtes-vous avec votre hypothèque ?",
    required: true,
    options: [
      { value: "paid", label: "Entièrement payée" },
      { value: "less25", label: "Il reste moins de 25 % à payer" },
      { value: "less50", label: "Il reste entre 25 % et 50 %" },
      { value: "more50", label: "Il reste plus de 50 %" },
      { value: "unsure", label: "Je ne suis pas certain·e" },
    ],
  },
  {
    id: "financialSituation",
    type: "single",
    title: "Quelle est votre situation financière ?",
    subtitle:
      "Cela influence votre pouvoir d'achat hypothécaire pour la suite.",
    required: true,
    options: [
      { value: "employed", label: "Emploi stable (salarié·e)" },
      { value: "selfEmployed", label: "Travailleur·euse autonome" },
      {
        value: "entrepreneur",
        label: "Entrepreneur·e / propriétaire d'entreprise",
      },
      { value: "investor", label: "Revenus de placements / investisseur·euse" },
      { value: "retired", label: "Retraité·e" },
      { value: "transition", label: "En transition (entre deux postes)" },
    ],
  },
  {
    id: "region",
    type: "region-map",
    title: "Où se situe votre propriété ? (à peu près)",
    subtitle: "Clique sur la ville ou le secteur le plus proche.",
    required: true,
  },
];
