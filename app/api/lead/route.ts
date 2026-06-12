import { NextRequest, NextResponse } from "next/server";
import { computeScore } from "@/app/lib/scoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LeadPayload = {
  name: string;
  phone: string;
  email?: string;
  consent: boolean;
  answers: Record<string, unknown>;
};

/**
 * Build a payload that GoHighLevel (and most CRMs) will map automatically.
 * Top-level fields use the field names GHL's contact mapper recognizes.
 */
function buildGhlPayload(
  fullName: string,
  phone: string,
  email: string | undefined,
  score: ReturnType<typeof computeScore>,
  answers: Record<string, unknown>,
) {
  const trimmed = fullName.trim();
  const firstSpace = trimmed.indexOf(" ");
  const firstName = firstSpace === -1 ? trimmed : trimmed.slice(0, firstSpace);
  const lastName = firstSpace === -1 ? "" : trimmed.slice(firstSpace + 1);

  const tags = [
    "courtier-form",
    `verdict-${score.verdict}`,
    `score-${score.score}`,
  ];

  return {
    source: "courtier-form",
    receivedAt: new Date().toISOString(),

    // GHL-recognized contact fields (top-level)
    firstName,
    lastName,
    name: trimmed,
    phone,
    email: email ?? "",
    tags,

    // Lead qualification
    score: score.score,
    verdict: score.verdict,

    // Full context (custom fields / workflow lookups)
    propertyType: answers.propertyType ?? null,
    yearsOwned: answers.yearsOwned ?? null,
    purchasePrice: answers.purchasePrice ?? null,
    estimatedValue: answers.estimatedValue ?? null,
    mortgageStatus: answers.mortgageStatus ?? null,
    hasKids: answers.hasKids ?? null,
    kidsStatus: answers.kidsStatus ?? null,
    planningKids: answers.planningKids ?? null,
    financialSituation: answers.financialSituation ?? null,
    region: answers.region ?? null,

    // Derived numbers for easy use in GHL workflows / emails
    appreciationPercent: score.appreciation
      ? Math.round(score.appreciation.percent)
      : null,
    appreciationAmount: score.appreciation
      ? Math.round(score.appreciation.absolute)
      : null,
    annualizedReturnPercent: score.appreciation
      ? Number(score.appreciation.annualized.toFixed(2))
      : null,

    // Keep the raw bundle for debugging / future-proofing
    answers,
  };
}

/**
 * Forwards qualified leads to a configurable CRM webhook.
 * Rules:
 *  - If the verdict is "defavorable" (not a good time to sell), we DO NOT
 *    forward personal data anywhere. The lead is dropped on the floor —
 *    matching the user-facing promise.
 *  - Otherwise we POST a normalized payload to CRM_WEBHOOK_URL.
 */
export async function POST(req: NextRequest) {
  let payload: LeadPayload;
  try {
    payload = (await req.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, phone, consent, answers } = payload;

  if (!name || !phone) {
    return NextResponse.json(
      { error: "Nom et téléphone requis" },
      { status: 400 },
    );
  }
  if (!consent) {
    return NextResponse.json(
      { error: "Consentement requis" },
      { status: 400 },
    );
  }

  const score = computeScore(answers || {});

  // Honor the deletion promise: if not a good time, do not store/forward.
  if (score.verdict === "defavorable") {
    return NextResponse.json({
      stored: false,
      reason: "verdict_defavorable",
      score,
    });
  }

  const webhookUrl = process.env.CRM_WEBHOOK_URL;
  if (!webhookUrl) {
    // No CRM configured yet — accept the lead but log it server-side.
    console.log("[lead] No CRM_WEBHOOK_URL set. Lead would be:", {
      name,
      phone,
      score: score.score,
    });
    return NextResponse.json({
      stored: true,
      forwarded: false,
      score,
    });
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.CRM_WEBHOOK_SECRET
          ? { "X-Webhook-Secret": process.env.CRM_WEBHOOK_SECRET }
          : {}),
      },
      body: JSON.stringify(buildGhlPayload(name, phone, payload.email, score, answers)),
    });

    if (!res.ok) {
      throw new Error(`CRM responded ${res.status}`);
    }

    return NextResponse.json({ stored: true, forwarded: true, score });
  } catch (err) {
    console.error("[lead] CRM forward failed:", err);
    return NextResponse.json(
      { stored: true, forwarded: false, score, warning: "crm_unreachable" },
      { status: 202 },
    );
  }
}
