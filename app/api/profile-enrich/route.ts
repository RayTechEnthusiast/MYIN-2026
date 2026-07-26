import { NextResponse } from "next/server";
import { z } from "zod";
import { generateJson, geminiConfigured } from "@/lib/gemini";

const Input = z.object({
  text: z.string().trim().min(20).max(6000),
  consent: z.literal(true),
});

const clean = (items: unknown) =>
  Array.isArray(items)
    ? Array.from(new Set(items.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean))).slice(0, 12)
    : [];

function localFallback(text: string) {
  const lower = text.toLowerCase();
  const dictionary: Record<string, string[]> = {
    skills: ["Canva", "Graphic design", "Social media", "Tutoring", "Public speaking", "Writing", "Coding", "Web design", "Photography", "Leadership", "Organization"],
    interests: ["Technology", "Youth education", "Community service", "Digital media", "Health", "Business", "Research", "Environment"],
  };
  const found = (category: keyof typeof dictionary) => dictionary[category].filter((item) => lower.includes(item.toLowerCase()));
  const sentences = text.split(/[.!?]\s+/).map((item) => item.trim()).filter(Boolean);
  return {
    skills: found("skills"),
    interests: found("interests"),
    strengths: sentences.filter((s) => /good at|strong|help|lead|reliable|organ/i.test(s)).slice(0, 4),
    growthAreas: sentences.filter((s) => /improve|weak|learn|grow|better/i.test(s)).slice(0, 4),
    careerGoals: sentences.filter((s) => /want to|goal|career|future|become/i.test(s)).slice(0, 4),
    experiences: sentences.filter((s) => /worked|volunteer|helped|made|built|designed|tutored|organized/i.test(s)).slice(0, 5),
    reviewNote: "Demo fallback used. Review every suggestion before adding it to the profile.",
  };
}

export async function POST(request: Request) {
  const parsed = Input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Add at least 20 characters and confirm consent." }, { status: 400 });

  const { text } = parsed.data;
  if (!geminiConfigured()) return NextResponse.json({ mode: "demo-fallback", data: localFallback(text) });

  try {
    const result = await generateJson<Record<string, unknown>>(`
You are assisting a youth user who explicitly chose to submit the following free-text paragraph for profile enrichment.
Extract only facts supported by the text. Do not infer sensitive attributes. Do not invent achievements.
Return JSON with arrays: skills, interests, strengths, growthAreas, careerGoals, experiences, plus reviewNote.
Each item must be concise and suitable for human review before saving.
TEXT:\n${text}
`);
    return NextResponse.json({
      mode: "gemini",
      data: {
        skills: clean(result.skills),
        interests: clean(result.interests),
        strengths: clean(result.strengths),
        growthAreas: clean(result.growthAreas),
        careerGoals: clean(result.careerGoals),
        experiences: clean(result.experiences),
        reviewNote: typeof result.reviewNote === "string" ? result.reviewNote : "Review every suggestion before saving.",
      },
    });
  } catch {
    return NextResponse.json({ mode: "safe-fallback", data: localFallback(text), warning: "Gemini was unavailable, so MYIN used a local text parser." });
  }
}
