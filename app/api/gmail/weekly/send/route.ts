import { NextResponse } from "next/server";
import {
  isWeeklyCronAuthorized,
  sendWeeklyPilotEmail,
} from "@/lib/gmail-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isWeeklyCronAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized weekly brief request.",
      },
      {
        status: 401,
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  }

  try {
    const result = await sendWeeklyPilotEmail();
    return NextResponse.json(result, {
      headers: {
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Weekly talent brief could not be sent.";

    console.error("Weekly Gmail pilot send failed:", message);

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      {
        status: 500,
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  }
}
