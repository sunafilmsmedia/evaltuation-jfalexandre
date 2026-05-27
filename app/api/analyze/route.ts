import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { computeScore } from "@/app/lib/scoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AnalyzePayload = {
  answers: Record<string, unknown>;
};

type AIReport = {
  headline: string;
  summary: string;
  stats: { label: string; value: string; detail: string }[];
  steps: { title: string; description: string }[];
  marketInsight: string;
};

function fallbackReport(
  answers: Record<string, unknown>,
  score: ReturnType<typeof computeScore>,
): AIReport {
  const yearsOwned = Number(answers.yearsOwned) || 0;
  const appreciation = score.appreciation;
  const isFavorable = score.verdict === "favorable";
  const isMoyen = score.verdict === "moyen";

  return {
    headline: isFavorable
      ? "Le moment vous est largement favorable."
      : isMoyen
        ? "Le moment est correct, mais peut être optimisé."
        : "Attendre quelques mois pourrait être plus profitable.",
    summary: isFavorable
      ? "Votre profil combine plusieurs signaux positifs (équité, stabilité, contexte de vie) qui rendent la vente avantageuse maintenant."
      : isMoyen
        ? "Plusieurs facteurs jouent en votre faveur, mais d'autres pourraient être améliorés pour maximiser votre rendement."
        : "Certains éléments importants (équité, emploi ou marché) suggèrent qu'attendre quelques mois pourrait donner un bien meilleur résultat.",
    stats: [
      {
        label: "Score d'opportunité",
        value: `${score.score}/100`,
        detail: "Basé sur 8 critères clés du marché et de votre situation.",
      },
      appreciation
        ? {
            label: "Plus-value estimée",
            value: `${appreciation.percent >= 0 ? "+" : ""}${appreciation.percent.toFixed(0)} %`,
            detail: `Soit environ ${Math.abs(appreciation.absolute).toLocaleString("fr-CA")} $ ${appreciation.absolute >= 0 ? "de gain" : "de perte"} brute depuis l'achat.`,
          }
        : {
            label: "Plus-value estimée",
            value: "—",
            detail: "Estimation indisponible.",
          },
      {
        label: "Années de possession",
        value: `${yearsOwned} ans`,
        detail:
          yearsOwned >= 5
            ? "Vous avez accumulé une équité significative."
            : "Vous êtes encore tôt dans votre cycle d'amortissement.",
      },
      {
        label: "Rendement annualisé",
        value: appreciation
          ? `${appreciation.annualized.toFixed(1)} %/an`
          : "—",
        detail: "Croissance moyenne de votre propriété par année.",
      },
    ],
    steps: [
      {
        title: "Évaluation professionnelle gratuite",
        description:
          "Obtenez une analyse comparative du marché pour valider la valeur réelle de votre propriété.",
      },
      {
        title: "Pré-approbation hypothécaire",
        description:
          "Connaître votre nouveau pouvoir d'achat est la clé pour planifier la suite.",
      },
      {
        title: "Plan de mise en marché",
        description:
          "Photos, home staging, stratégie de prix : on prépare votre propriété pour maximiser les offres.",
      },
      {
        title: "Trouver votre prochain chez-vous",
        description:
          "On coordonne la vente et l'achat pour éviter les transitions stressantes.",
      },
    ],
    marketInsight:
      "Les inscriptions bien préparées se vendent en moyenne 2 à 3 fois plus vite et à un meilleur prix au pied carré que celles mises en ligne sans stratégie.",
  };
}

export async function POST(req: NextRequest) {
  let payload: AnalyzePayload;
  try {
    payload = (await req.json()) as AnalyzePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const answers = payload.answers ?? {};
  const score = computeScore(answers);

  // If no API key, return the deterministic fallback report.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      score,
      report: fallbackReport(answers, score),
      ai: false,
    });
  }

  try {
    const client = new Anthropic({ apiKey });

    const system = `Tu es un conseiller immobilier québécois expert et bienveillant. Tu rédiges des rapports personnalisés en français du Québec, ton chaleureux et professionnel, jamais agressif. Tu utilises le tutoiement neutre et tu évites le jargon. Tu retournes EXCLUSIVEMENT du JSON valide qui suit le schéma demandé, sans texte autour.`;

    const userPrompt = `Voici les réponses d'un propriétaire qui se demande si c'est un bon moment pour vendre :

${JSON.stringify(answers, null, 2)}

Score calculé : ${score.score}/100 (verdict: ${score.verdict})
Facteurs détectés : ${JSON.stringify(score.factors, null, 2)}
Appréciation : ${score.appreciation ? JSON.stringify(score.appreciation) : "non calculée"}

Rédige un rapport personnalisé avec EXACTEMENT cette structure JSON :
{
  "headline": "phrase d'accroche percutante de 1 ligne",
  "summary": "résumé de 2-3 phrases qui explique le verdict",
  "stats": [
    { "label": "Score d'opportunité", "value": "X/100", "detail": "explication courte" },
    { "label": "Plus-value estimée", "value": "+X%", "detail": "..." },
    { "label": "Années de possession", "value": "X ans", "detail": "..." },
    { "label": "Rendement annualisé", "value": "X%/an", "detail": "..." }
  ],
  "steps": [
    { "title": "...", "description": "..." },
    { "title": "...", "description": "..." },
    { "title": "...", "description": "..." },
    { "title": "...", "description": "..." }
  ],
  "marketInsight": "une statistique ou un fait du marché immobilier québécois pertinent à leur situation"
}

Adapte le contenu à leur situation spécifique. Si le verdict est défavorable, sois honnête mais constructif (que peuvent-ils faire d'ici 6-12 mois ?). Retourne UNIQUEMENT le JSON.`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      system,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in AI response");

    const report = JSON.parse(jsonMatch[0]) as AIReport;

    return NextResponse.json({ score, report, ai: true });
  } catch (err) {
    console.error("AI analysis failed, falling back:", err);
    return NextResponse.json({
      score,
      report: fallbackReport(answers, score),
      ai: false,
    });
  }
}
