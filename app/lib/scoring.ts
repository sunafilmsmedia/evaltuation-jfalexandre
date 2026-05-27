export type Answers = Record<string, unknown>;

export type ScoreResult = {
  score: number; // 0 to 100
  verdict: "favorable" | "moyen" | "defavorable";
  factors: {
    label: string;
    impact: "positif" | "neutre" | "negatif";
    detail: string;
  }[];
  appreciation: {
    absolute: number;
    percent: number;
    annualized: number;
  } | null;
};

export function computeScore(answers: Answers): ScoreResult {
  let score = 50;
  const factors: ScoreResult["factors"] = [];

  const yearsOwned = Number(answers.yearsOwned) || 0;
  const purchase = Number(answers.purchasePrice) || 0;
  const estimated = Number(answers.estimatedValue) || 0;

  // Appreciation
  let appreciation: ScoreResult["appreciation"] = null;
  if (purchase > 0 && estimated > 0) {
    const absolute = estimated - purchase;
    const percent = (absolute / purchase) * 100;
    const annualized =
      yearsOwned > 0
        ? (Math.pow(estimated / purchase, 1 / yearsOwned) - 1) * 100
        : percent;
    appreciation = { absolute, percent, annualized };

    if (percent >= 50) {
      score += 18;
      factors.push({
        label: "Forte plus-value",
        impact: "positif",
        detail: `Votre propriété s'est appréciée d'environ ${percent.toFixed(0)} % — un excellent point de départ pour vendre.`,
      });
    } else if (percent >= 20) {
      score += 10;
      factors.push({
        label: "Belle plus-value",
        impact: "positif",
        detail: `Une appréciation de ${percent.toFixed(0)} % vous donne une bonne marge nette à la revente.`,
      });
    } else if (percent >= 0) {
      score += 2;
      factors.push({
        label: "Plus-value modeste",
        impact: "neutre",
        detail: `Une appréciation de ${percent.toFixed(0)} % est positive mais limitée. Attendre pourrait améliorer le rendement.`,
      });
    } else {
      score -= 12;
      factors.push({
        label: "Valeur en baisse",
        impact: "negatif",
        detail: `Votre estimation actuelle est inférieure au prix d'achat. Vendre maintenant risque de cristalliser une perte.`,
      });
    }
  }

  // Durée de possession
  if (yearsOwned >= 5) {
    score += 6;
    factors.push({
      label: "Équité accumulée",
      impact: "positif",
      detail: `Avec ${yearsOwned} ans de possession, vous avez probablement remboursé une part significative de votre capital.`,
    });
  } else if (yearsOwned >= 2) {
    score += 2;
  } else {
    score -= 8;
    factors.push({
      label: "Possession récente",
      impact: "negatif",
      detail: `Vendre après moins de 2 ans implique des frais de mutation et peu d'équité accumulée.`,
    });
  }

  // Hypothèque
  const mortgage = answers.mortgageStatus as string | undefined;
  if (mortgage === "paid") {
    score += 10;
    factors.push({
      label: "Hypothèque payée",
      impact: "positif",
      detail:
        "Vous récupérerez la quasi-totalité de la valeur nette à la vente.",
    });
  } else if (mortgage === "less25") {
    score += 6;
  } else if (mortgage === "more50") {
    score -= 4;
  }

  // Situation familiale
  const hasKids = answers.hasKids;
  const kidsStatus = answers.kidsStatus;
  const planningKids = answers.planningKids;

  if (hasKids === "yes") {
    if (kidsStatus === "leftHome") {
      score += 10;
      factors.push({
        label: "Nid vide",
        impact: "positif",
        detail:
          "Vos enfants ont quitté la maison — un excellent moment pour réduire ou changer de style de vie.",
      });
    } else if (kidsStatus === "leavingSoon") {
      score += 6;
      factors.push({
        label: "Transition familiale",
        impact: "positif",
        detail:
          "Vos enfants partent bientôt : planifier la vente dans les prochains mois est cohérent.",
      });
    } else if (kidsStatus === "growing") {
      score += 8;
      factors.push({
        label: "Besoin d'espace",
        impact: "positif",
        detail:
          "Avec une famille qui grandit, monter en gamme maintenant évite d'avoir à le faire en urgence plus tard.",
      });
    }
  } else if (hasKids === "no") {
    if (planningKids === "yesSoon") {
      score += 8;
      factors.push({
        label: "Famille à venir",
        impact: "positif",
        detail:
          "Avant l'arrivée d'enfants, c'est le bon moment pour passer à une propriété plus grande.",
      });
    } else if (planningKids === "maybe") {
      score += 3;
    }
  }

  // Stabilité emploi
  const job = answers.jobStability as string | undefined;
  if (job === "stable") {
    score += 8;
    factors.push({
      label: "Emploi stable",
      impact: "positif",
      detail:
        "Une situation d'emploi solide facilite grandement la pré-approbation hypothécaire pour votre prochaine propriété.",
    });
  } else if (job === "ok") {
    score += 3;
  } else if (job === "transition" || job === "unstable") {
    score -= 10;
    factors.push({
      label: "Emploi en transition",
      impact: "negatif",
      detail:
        "Les prêteurs exigent généralement plusieurs mois d'historique stable. Mieux vaut sécuriser l'emploi avant de vendre.",
    });
  }

  // Revenu du ménage
  const income = answers.householdIncome as string | undefined;
  if (income === "gt200" || income === "125to200") {
    score += 4;
  } else if (income === "lt75") {
    score -= 2;
  }

  // Raison
  const reasons = (answers.reason as string[]) || [];
  if (reasons.includes("curious")) {
    score -= 6;
    factors.push({
      label: "Motivation exploratoire",
      impact: "neutre",
      detail:
        "Vous êtes en phase d'exploration. Un bilan de marché peut vous aider à clarifier vos options sans engagement.",
    });
  }
  if (reasons.includes("financial") || reasons.includes("investment")) {
    score += 4;
  }
  if (reasons.includes("lifeChange") || reasons.includes("smaller")) {
    score += 3;
  }

  // Horizon
  const timeline = answers.timeline as string | undefined;
  if (timeline === "now" || timeline === "3to6") {
    score += 4;
  } else if (timeline === "12plus") {
    score -= 3;
  }

  // Cap final
  score = Math.max(0, Math.min(100, Math.round(score)));

  const verdict: ScoreResult["verdict"] =
    score >= 65 ? "favorable" : score >= 45 ? "moyen" : "defavorable";

  return { score, verdict, factors, appreciation };
}
