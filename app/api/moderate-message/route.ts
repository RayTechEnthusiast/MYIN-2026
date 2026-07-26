import { NextResponse } from "next/server";
import { z } from "zod";
import { generateJson, geminiConfigured } from "@/lib/gemini";

const Input = z.object({
  text: z.string().trim().min(1).max(2000),
  senderRole: z.enum(["student", "organization"]),
});

const riskyPatterns = [
  { pattern: /\b(phone|number|snapchat|instagram|discord|whatsapp)\b/i, reason: "Requests to move a youth conversation off-platform need controlled approval." },
  { pattern: /\b(home address|where do you live|come alone|meet alone)\b/i, reason: "Private location or unsupervised meeting language is not allowed." },
  { pattern: /\b(password|login code|social security|ssn)\b/i, reason: "Sensitive account or identity information should never be shared." },
];

export async function POST(request: Request) {
  const parsed = Input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a message." }, { status: 400 });
  const { text, senderRole } = parsed.data;

  const localFlag = riskyPatterns.find(({ pattern }) => pattern.test(text));
  if (localFlag) {
    return NextResponse.json({
      status: "flagged",
      reason: localFlag.reason,
      suggestion: "Keep the conversation focused on the opportunity, schedule, role requirements, and the controlled introduction process.",
      mode: "safety-rules",
    });
  }

  if (!geminiConfigured()) {
    return NextResponse.json({ status: "clear", mode: "safety-rules", note: "No obvious safety-rule issue was detected. This is not a guarantee or a religious ruling." });
  }

  try {
    const result = await generateJson<{ status?: string; reason?: string; suggestion?: string }>(`
Review this ${senderRole} message in a controlled youth-opportunity conversation. Flag only concrete safety, privacy, harassment, pressure, off-platform contact, private-location, or clearly unprofessional risks. Do not make religious rulings. Return JSON with status "clear" or "flagged", reason, and suggestion.
MESSAGE:\n${text}
`);
    return NextResponse.json({
      status: result.status === "flagged" ? "flagged" : "clear",
      reason: result.reason || "",
      suggestion: result.suggestion || "",
      mode: "gemini-assisted",
      note: "Assistive moderation only; human review is required in a real deployment.",
    });
  } catch {
    return NextResponse.json({ status: "clear", mode: "safe-fallback", note: "Gemini was unavailable; local safety rules found no obvious issue." });
  }
}
