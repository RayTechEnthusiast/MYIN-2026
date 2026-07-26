import { NextResponse } from "next/server";
import { z } from "zod";
import { generateJson, geminiConfigured } from "@/lib/gemini";
import { fetchPublicOrganizationPage } from "@/lib/safe-research";

const Input = z.object({
  businessName: z.string().trim().min(2).max(160),
  website: z.string().trim().url().max(500),
  email: z.string().trim().email().max(250),
  suppliedContent: z.string().trim().max(15000).optional(),
});

const Draft = z.object({
  name: z.string(),
  website: z.string(),
  email: z.string(),
  mission: z.string().default(""),
  programs: z.array(z.string()).default([]),
  audience: z.array(z.string()).default([]),
  location: z.string().default(""),
  contactName: z.string().default(""),
  youthSafety: z.string().default(""),
  privacyStandards: z.string().default(""),
  accommodations: z.string().default(""),
  missingFields: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).default(0.4),
  sourceNotes: z.array(z.string()).default([]),
});

export async function POST(request: Request) {
  const parsed = Input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a business name, valid public website, and email." }, { status: 400 });

  const input = parsed.data;
  let page: Awaited<ReturnType<typeof fetchPublicOrganizationPage>> | null = null;
  let fetchWarning = "";
  try {
    page = input.suppliedContent
      ? { requestedUrl: input.website, finalUrl: input.website, title: input.businessName, description: "Employer-supplied content", text: input.suppliedContent }
      : await fetchPublicOrganizationPage(input.website);
  } catch (error) {
    fetchWarning = error instanceof Error ? error.message : "The public page could not be retrieved.";
  }

  const sourceText = page?.text || input.suppliedContent || "";
  if (!geminiConfigured() || !sourceText) {
    const missingFields = ["mission", "programs", "audience", "location", "contact person", "youth-safety process", "privacy standards", "accommodations"];
    return NextResponse.json({
      mode: "review-required",
      warning: fetchWarning || (!geminiConfigured() ? "Gemini is not configured; MYIN created a minimal review draft." : "No public text was available."),
      draft: Draft.parse({
        name: input.businessName,
        website: input.website,
        email: input.email,
        mission: page?.description || "",
        programs: [],
        audience: [],
        location: "",
        contactName: "",
        youthSafety: "",
        privacyStandards: "",
        accommodations: "",
        missingFields,
        confidence: page ? 0.48 : 0.25,
        sourceNotes: page ? [`Reviewed one public page: ${page.finalUrl}`] : ["No public page was used."],
      }),
    });
  }

  try {
    const result = await generateJson<unknown>(`
Create a reviewable organization profile draft using only the supplied public or employer-provided text. Do not invent verification, youth-safety practices, privacy standards, accommodations, contacts, or programs. Put unsupported required information in missingFields.
Return JSON: name, website, email, mission, programs[], audience[], location, contactName, youthSafety, privacyStandards, accommodations, missingFields[], confidence (0-1), sourceNotes[].
Business name supplied: ${input.businessName}
Website: ${input.website}
Email: ${input.email}
PUBLIC TEXT:\n${sourceText}
`);
    const draft = Draft.parse({ ...(result as object), name: (result as { name?: string }).name || input.businessName, website: input.website, email: input.email });
    return NextResponse.json({ mode: "gemini-review-draft", draft, warning: fetchWarning || undefined });
  } catch {
    return NextResponse.json({
      mode: "safe-fallback",
      warning: "Gemini could not structure the public text. MYIN kept a minimal editable draft.",
      draft: Draft.parse({
        name: input.businessName,
        website: input.website,
        email: input.email,
        mission: page?.description || "",
        missingFields: ["programs", "audience", "location", "contact person", "youth-safety process", "privacy standards", "accommodations"],
        confidence: 0.35,
        sourceNotes: page ? [`Reviewed one public page: ${page.finalUrl}`] : ["No public page was used."],
      }),
    });
  }
}
