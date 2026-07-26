import { NextResponse } from "next/server";
import {
  matchesConfiguredPilotEmployerEmail,
  sendPilotSignupConfirmation,
} from "@/lib/gmail-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

let lastSuccessfulSignupAt = 0;
const MINIMUM_SIGNUP_INTERVAL_MS = 30_000;

const validEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Enter the employer signup details again.",
      },
      { status: 400 },
    );
  }

  const data =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

  const organizationName =
    typeof data.organizationName === "string"
      ? data.organizationName.trim()
      : "";
  const email =
    typeof data.email === "string" ? data.email.trim() : "";
  const consent = data.consent === true;

  if (organizationName.length < 2 || organizationName.length > 80) {
    return NextResponse.json(
      {
        ok: false,
        error: "Enter a valid organization name.",
      },
      { status: 400 },
    );
  }

  if (!validEmail(email)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Enter a valid employer email address.",
      },
      { status: 400 },
    );
  }

  if (!consent) {
    return NextResponse.json(
      {
        ok: false,
        error: "Consent is required for weekly email delivery.",
      },
      { status: 400 },
    );
  }

  if (!matchesConfiguredPilotEmployerEmail(email)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "This single-employer hackathon pilot is configured for a different test email.",
      },
      { status: 400 },
    );
  }

  if (
    Date.now() - lastSuccessfulSignupAt <
    MINIMUM_SIGNUP_INTERVAL_MS
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "A confirmation was just sent. Wait briefly before trying again.",
      },
      { status: 429 },
    );
  }

  try {
    const result = await sendPilotSignupConfirmation({
      organizationName,
      email,
    });

    lastSuccessfulSignupAt = Date.now();

    return NextResponse.json({
      ...result,
      message:
        "Email-only pilot signup confirmed. Check the employer inbox.",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The employer signup confirmation could not be sent.";

    console.error("Pilot employer signup failed:", message);

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
