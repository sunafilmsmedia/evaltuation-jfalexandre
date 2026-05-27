export type QuestionType =
  | "single"
  | "multi"
  | "number"
  | "currency"
  | "text"
  | "tel"
  | "lead";

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
    id: "purchasePrice",
    type: "currency",
    title: "À combien l'avez-vous achetée ?",
    subtitle: "Prix d'achat initial.",
    placeholder: "350 000",
    min: 0,
    step: 1000,
    required: true,
  },
  {
    id: "estimatedValue",
    type: "currency",
    title: "Selon vous, combien vaut-elle aujourd'hui ?",
    subtitle: "Votre estimation personnelle, on raffinera ensuite.",
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
    id: "hasKids",
    type: "single",
    title: "Avez-vous des enfants en ce moment ?",
    required: true,
    options: [
      { value: "yes", label: "Oui" },
      { value: "no", label: "Non" },
    ],
  },
  {
    id: "kidsStatus",
    type: "single",
    title: "Où en sont vos enfants ?",
    subtitle:
      "Cela influence beaucoup l'espace dont vous aurez besoin dans les prochaines années.",
    required: true,
    showIf: (a) => a.hasKids === "yes",
    options: [
      { value: "leftHome", label: "Ils ont déjà quitté la maison" },
      {
        value: "leavingSoon",
        label: "Ils vont quitter bientôt (moins de 3 ans)",
      },
      { value: "stillHome", label: "Ils vivent encore à la maison" },
      { value: "growing", label: "Ils sont jeunes, on manque d'espace" },
    ],
  },
  {
    id: "planningKids",
    type: "single",
    title: "Pensez-vous en avoir bientôt ?",
    subtitle: "Et auriez-vous besoin d'agrandir votre espace ?",
    required: true,
    showIf: (a) => a.hasKids === "no",
    options: [
      { value: "yesSoon", label: "Oui, dans les prochaines années" },
      { value: "maybe", label: "Peut-être, on y pense" },
      { value: "no", label: "Non, ce n'est pas dans nos plans" },
    ],
  },
  {
    id: "jobStability",
    type: "single",
    title: "Votre situation d'emploi est-elle stable ?",
    subtitle:
      "C'est un facteur important pour la pré-approbation hypothécaire.",
    required: true,
    options: [
      { value: "stable", label: "Oui, très stable" },
      { value: "ok", label: "Stable mais pas certain·e à 100 %" },
      { value: "transition", label: "En transition / nouveau poste" },
      { value: "unstable", label: "Instable en ce moment" },
    ],
  },
  {
    id: "householdIncome",
    type: "single",
    title: "Quel est le revenu annuel de votre ménage ?",
    subtitle:
      "Cela nous aide à estimer votre nouveau pouvoir d'achat hypothécaire.",
    required: true,
    options: [
      { value: "lt75", label: "Moins de 75 000 $" },
      { value: "75to125", label: "Entre 75 000 $ et 125 000 $" },
      { value: "125to200", label: "Entre 125 000 $ et 200 000 $" },
      { value: "gt200", label: "Plus de 200 000 $" },
      { value: "skip", label: "Je préfère ne pas répondre" },
    ],
  },
  {
    id: "region",
    type: "single",
    title: "Dans quelle région se situe votre propriété ?",
    required: true,
    options: [
      { value: "montreal", label: "Grand Montréal" },
      { value: "quebec", label: "Région de Québec" },
      { value: "rive-sud", label: "Rive-Sud / Montérégie" },
      { value: "rive-nord", label: "Rive-Nord / Laurentides / Lanaudière" },
      { value: "estrie", label: "Estrie / Cantons-de-l'Est" },
      { value: "autre", label: "Autre région du Québec" },
    ],
  },
  {
    id: "reason",
    type: "multi",
    title: "Pourquoi songez-vous à vendre ?",
    subtitle: "Plusieurs choix possibles.",
    required: true,
    options: [
      { value: "bigger", label: "Avoir plus grand" },
      { value: "smaller", label: "Avoir plus petit / réduire" },
      { value: "location", label: "Changer de quartier ou de ville" },
      { value: "financial", label: "Libérer de l'équité / mieux financier" },
      { value: "lifeChange", label: "Changement de vie (couple, retraite…)" },
      { value: "investment", label: "Investir ailleurs" },
      { value: "curious", label: "Juste curieux·se du marché" },
    ],
  },
  {
    id: "timeline",
    type: "single",
    title: "Dans quel horizon envisagez-vous de vendre ?",
    required: true,
    options: [
      { value: "now", label: "Le plus tôt possible" },
      { value: "3to6", label: "Dans 3 à 6 mois" },
      { value: "6to12", label: "Dans 6 à 12 mois" },
      { value: "12plus", label: "Plus d'un an, j'évalue" },
    ],
  },
  {
    id: "lead",
    type: "lead",
    title: "Recevez votre rapport personnalisé",
    subtitle:
      "Nous combinons vos réponses avec les données du marché pour générer votre rapport.",
    required: true,
  },
];
