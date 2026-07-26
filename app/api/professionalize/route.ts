import { NextResponse } from "next/server";
import { z } from "zod";
import { generateJson, geminiConfigured } from "@/lib/gemini";

const Input = z.object({
  text: z.string().trim().min(5).max(5000),
  context: z.enum(["experience", "email", "bio", "opportunity"]).default("experience"),
});

function fallback(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).replace(/\s*([.!?])?$/, ".");
}

export async function POST(request: Request) {
  const parsed = Input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter text to improve." }, { status: 400 });
  const { text, context } = parsed.data;

  if (!geminiConfigured()) return NextResponse.json({ mode: "demo-fallback", text: fallback(text) });

  try {
    const result = await generateJson<{ text?: string }>(`
Rewrite the following ${context} text professionally while preserving its exact facts. Do not add credentials, hours, results, or claims that were not supplied. Keep it concise and youth-appropriate. Return JSON: {"text":"..."}.
TEXT:\n${text}
`);
    return NextResponse.json({ mode: "gemini", text: result.text?.trim() || fallback(text) });
  } catch {
    return NextResponse.json({ mode: "safe-fallback", text: fallback(text), warning: "Gemini was unavailable." });
  }
}
