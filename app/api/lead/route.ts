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
      body: JSON.stringify({
        source: "courtier-form",
        receivedAt: new Date().toISOString(),
        lead: {
          name,
          phone,
          email: payload.email ?? null,
        },
        scoring: {
          score: score.score,
          verdict: score.verdict,
        },
        answers,
      }),
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
