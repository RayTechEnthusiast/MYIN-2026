import { NextResponse } from "next/server";
import { getWeeklyGmailStatus } from "@/lib/gmail-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getWeeklyGmailStatus(), {
    headers: {
      "cache-control": "no-store",
    },
  });
}
