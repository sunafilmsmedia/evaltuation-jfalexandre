export type Answers = Record<string, unknown>;

export type ScoreResult = {
  score: number; // 0 to 100
  verdict: "favorable" | "moyen" | "defavorable";
  factors: {
    label: string;
    impact: "positif" | "neutre" | "negatif";
    detail: string;
  }[];
  // Kept for backwards-compat with consumers (fallback report, GHL payload).
  // Always null now that we don't ask for purchase price.
  appreciation: null;
};

export function computeScore(answers: Answers): ScoreResult {
  let score = 50;
  const factors: ScoreResult["factors"] = [];

  const yearsOwned = Number(answers.yearsOwned) || 0;
  const estimated = Number(answers.estimatedValue) || 0;

  // Durée de possession — proxy for equity build-up
  if (yearsOwned >= 8) {
    score += 14;
    factors.push({
      label: "Équité solide",
      impact: "positif",
      detail: `Avec ${yearsOwned} ans de possession, vous avez bâti une équité importante dans votre propriété.`,
    });
  } else if (yearsOwned >= 5) {
    score += 9;
    factors.push({
      label: "Bonne équité accumulée",
      impact: "positif",
      detail: `Après ${yearsOwned} ans, une part significative de votre capital a été remboursée.`,
    });
  } else if (yearsOwned >= 2) {
    score += 3;
  } else {
    score -= 12;
    factors.push({
      label: "Possession récente",
      impact: "negatif",
      detail: `Vendre après moins de 2 ans implique des frais de mutation et peu d'équité accumulée.`,
    });
  }

  // Valeur estimée — proxy for whether seller has assets to leverage
  if (estimated >= 750000) {
    score += 6;
    factors.push({
      label: "Propriété de valeur élevée",
      impact: "positif",
      detail:
        "Une propriété au-dessus de 750 000 $ vous donne un excellent levier financier pour la suite.",
    });
  } else if (estimated >= 450000) {
    score += 3;
  }

  // Hypothèque — most direct equity signal
  const mortgage = answers.mortgageStatus as string | undefined;
  if (mortgage === "paid") {
    score += 18;
    factors.push({
      label: "Hypothèque payée",
      impact: "positif",
      detail:
        "Vous récupérerez la quasi-totalité de la valeur nette à la vente.",
    });
  } else if (mortgage === "less25") {
    score += 12;
    factors.push({
      label: "Hypothèque presque remboursée",
      impact: "positif",
      detail:
        "Avec moins de 25 % restant à rembourser, votre équité est très avantageuse.",
    });
  } else if (mortgage === "less50") {
    score += 4;
  } else if (mortgage === "more50") {
    score -= 6;
    factors.push({
      label: "Hypothèque encore élevée",
      impact: "negatif",
      detail:
        "Avec plus de la moitié de l'hypothèque à rembourser, l'équité disponible à la vente reste limitée.",
    });
  }

  // Situation financière — drives next-mortgage qualification
  const finance = answers.financialSituation as string | undefined;
  if (finance === "employed" || finance === "retired") {
    score += 12;
    factors.push({
      label: "Profil financier solide",
      impact: "positif",
      detail:
        "Votre situation financière prévisible facilite l'obtention d'une nouvelle pré-approbation hypothécaire.",
    });
  } else if (finance === "investor") {
    score += 9;
    factors.push({
      label: "Revenus de placements",
      impact: "positif",
      detail:
        "Des revenus de placements stables sont bien vus par les prêteurs, surtout si bien documentés.",
    });
  } else if (finance === "selfEmployed" || finance === "entrepreneur") {
    score += 4;
    factors.push({
      label: "Revenus d'affaires",
      impact: "neutre",
      detail:
        "Les prêteurs demanderont généralement 2 ans d'avis de cotisation. À préparer en amont avec votre comptable.",
    });
  } else if (finance === "transition") {
    score -= 14;
    factors.push({
      label: "En transition financière",
      impact: "negatif",
      detail:
        "Les prêteurs exigent généralement plusieurs mois d'historique de revenu stable. Mieux vaut sécuriser votre situation avant de vendre.",
    });
  }

  // Cap final
  score = Math.max(0, Math.min(100, Math.round(score)));

  const verdict: ScoreResult["verdict"] =
    score >= 65 ? "favorable" : score >= 45 ? "moyen" : "defavorable";

  return { score, verdict, factors, appreciation: null };
}
