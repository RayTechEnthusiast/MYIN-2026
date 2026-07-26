import { NextResponse } from "next/server";
import { z } from "zod";
import { generateJson, geminiConfigured } from "@/lib/gemini";

const Input = z.object({
  description: z.string().trim().min(20).max(10000),
});

const OpportunityDraft = z.object({
  title: z.string().default("Opportunity draft"),
  type: z
    .enum(["Internship", "Volunteer", "Mentorship", "Community Project"])
    .default("Volunteer"),
  description: z.string(),
  skills: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  careerGoals: z.array(z.string()).default([]),
  location: z.string().default("Location not provided"),
  zip: z.string().default(""),
  format: z.enum(["Remote", "Hybrid", "In person"]).default("In person"),
  availableDays: z.array(z.string()).default([]),
  commitment: z.string().default("Not provided"),
  weeklyHours: z.number().min(0).max(60).default(0),
  ageMin: z.number().min(10).max(30).default(14),
  ageMax: z.number().min(10).max(35).default(18),
  experienceLevel: z
    .enum(["Beginner", "Developing", "Experienced"])
    .default("Beginner"),
  deadline: z.string().default(""),
  paid: z.boolean().default(false),
  compensation: z.string().default("Not provided"),
  urgent: z.boolean().default(false),
  prayerBreaks: z.boolean().default(false),
  prayerSpace: z.boolean().default(false),
  halalFood: z.boolean().default(false),
  jummahCompatible: z.boolean().default(false),
  supervision: z.string().default(""),
  applicationSteps: z.string().default(""),
  impact: z.string().default(""),
  missingFields: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).default(0.5),
});

type Opportunity = z.infer<typeof OpportunityDraft>;

function infer(description: string): Opportunity {
  const lower = description.toLowerCase();

  const type: Opportunity["type"] = lower.includes("intern")
    ? "Internship"
    : lower.includes("mentor")
      ? "Mentorship"
      : lower.includes("project")
        ? "Community Project"
        : "Volunteer";

  const skills = [
    "Canva",
    "Graphic design",
    "Figma",
    "Photography",
    "Social media",
    "Coding",
    "Tutoring",
    "Writing",
    "Leadership",
    "Event support",
    "Robotics",
  ].filter((item) => lower.includes(item.toLowerCase()));

  const availableDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ].filter((day) => lower.includes(day.toLowerCase()));

  const titleLine = description.split(/[.\n]/)[0]?.trim().slice(0, 100);

  const missingFields: string[] = [];

  if (!/\b(location|address|remote|hybrid|in person|in-person)\b/i.test(description)) {
    missingFields.push("location");
  }

  if (!/\b(deadline|apply by|applications close)\b/i.test(description)) {
    missingFields.push("application deadline");
  }

  if (!/\b(supervision|supervisor|coordinator|director)\b/i.test(description)) {
    missingFields.push("supervision");
  }

  if (!/\b(age|ages|grade|grades)\b/i.test(description)) {
    missingFields.push("age eligibility");
  }

  if (!/\b(paid|unpaid|stipend|compensation|\$|undecided)\b/i.test(description)) {
    missingFields.push("compensation");
  }

  return OpportunityDraft.parse({
    title:
      titleLine && titleLine.length > 8
        ? titleLine
        : "Reviewable opportunity draft",
    type,
    description,
    skills,
    interests: [],
    careerGoals: [],
    location: "Location not provided",
    zip: "",
    format: lower.includes("remote")
      ? "Remote"
      : lower.includes("hybrid")
        ? "Hybrid"
        : "In person",
    availableDays,
    commitment: "Not provided",
    weeklyHours: 0,
    ageMin: 14,
    ageMax: 18,
    experienceLevel: lower.includes("experienced")
      ? "Experienced"
      : lower.includes("beginner")
        ? "Beginner"
        : "Developing",
    deadline: "",
    paid: /\b(paid|stipend|\$)\b/i.test(description),
    compensation: /\b(paid|stipend|\$)\b/i.test(description)
      ? "Review compensation details"
      : "Not provided",
    urgent: /\b(urgent|immediate|this weekend|tomorrow)\b/i.test(description),
    prayerBreaks: /\b(prayer break|salah break|maghrib break)\b/i.test(
      description,
    ),
    prayerSpace: /\b(prayer space|musalla)\b/i.test(description),
    halalFood: /\b(halal food|halal meal)\b/i.test(description),
    jummahCompatible: /\b(jumuah|jumu'ah|jummah|friday prayer)\b/i.test(
      description,
    ),
    supervision: "",
    applicationSteps: "",
    impact: "",
    missingFields,
    confidence: 0.48,
  });
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["true", "yes", "available"].includes(normalized)) return true;
    if (["false", "no", "unavailable"].includes(normalized)) return false;
  }

  return fallback;
}

function asNumber(
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(parsed)) return fallback;

  return Math.min(maximum, Math.max(minimum, parsed));
}

function normalizeType(value: unknown): Opportunity["type"] {
  const normalized = asString(value).toLowerCase();

  if (normalized.includes("intern")) return "Internship";
  if (normalized.includes("mentor")) return "Mentorship";
  if (normalized.includes("community") || normalized.includes("project")) {
    return "Community Project";
  }

  return "Volunteer";
}

function normalizeFormat(value: unknown): Opportunity["format"] {
  const normalized = asString(value).toLowerCase();

  if (normalized.includes("remote") || normalized.includes("virtual")) {
    return "Remote";
  }

  if (normalized.includes("hybrid")) {
    return "Hybrid";
  }

  return "In person";
}

function normalizeExperience(
  value: unknown,
): Opportunity["experienceLevel"] {
  const normalized = asString(value).toLowerCase();

  if (
    normalized.includes("experienced") ||
    normalized.includes("advanced") ||
    normalized.includes("expert")
  ) {
    return "Experienced";
  }

  if (
    normalized.includes("developing") ||
    normalized.includes("intermediate")
  ) {
    return "Developing";
  }

  return "Beginner";
}

function normalizeGeminiResult(
  result: unknown,
  originalDescription: string,
): Opportunity {
  const raw =
    result && typeof result === "object"
      ? (result as Record<string, unknown>)
      : {};

  return OpportunityDraft.parse({
    title: asString(raw.title, "Opportunity draft"),
    type: normalizeType(raw.type),
    description: asString(raw.description, originalDescription),
    skills: asStringArray(raw.skills),
    interests: asStringArray(raw.interests),
    careerGoals: asStringArray(raw.careerGoals),
    location: asString(raw.location, "Location not provided"),
    zip: asString(raw.zip),
    format: normalizeFormat(raw.format),
    availableDays: asStringArray(raw.availableDays),
    commitment: asString(raw.commitment, "Not provided"),
    weeklyHours: asNumber(raw.weeklyHours, 0, 0, 60),
    ageMin: asNumber(raw.ageMin, 14, 10, 30),
    ageMax: asNumber(raw.ageMax, 18, 10, 35),
    experienceLevel: normalizeExperience(raw.experienceLevel),
    deadline: asString(raw.deadline),
    paid: asBoolean(raw.paid),
    compensation: asString(raw.compensation, "Not provided"),
    urgent: asBoolean(raw.urgent),
    prayerBreaks: asBoolean(raw.prayerBreaks),
    prayerSpace: asBoolean(raw.prayerSpace),
    halalFood: asBoolean(raw.halalFood),
    jummahCompatible: asBoolean(raw.jummahCompatible),
    supervision: asString(raw.supervision),
    applicationSteps: asString(raw.applicationSteps),
    impact: asString(raw.impact),
    missingFields: asStringArray(raw.missingFields),
    confidence: asNumber(raw.confidence, 0.5, 0, 1),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = Input.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Paste at least 20 characters." },
      { status: 400 },
    );
  }

  const { description } = parsed.data;

  if (!geminiConfigured()) {
    return NextResponse.json({
      mode: "demo-fallback",
      draft: infer(description),
      warning: "Gemini is not configured. Using local demo extraction.",
    });
  }

  try {
    const result = await generateJson<unknown>(`
You are MYIN's ethical opportunity-structuring assistant.

Extract a youth opportunity from the organization text below.

Rules:
- Use only information explicitly supported by the supplied text.
- Never invent safety, supervision, verification, compensation, deadlines, addresses, accommodations, or eligibility.
- Put missing or uncertain information in missingFields.
- Return one valid JSON object only.
- Do not include markdown or explanation outside the JSON.

Return these exact fields:

{
  "title": "string",
  "type": "Internship | Volunteer | Mentorship | Community Project",
  "description": "string",
  "skills": ["string"],
  "interests": ["string"],
  "careerGoals": ["string"],
  "location": "string",
  "zip": "string",
  "format": "Remote | Hybrid | In person",
  "availableDays": ["string"],
  "commitment": "string",
  "weeklyHours": 0,
  "ageMin": 14,
  "ageMax": 18,
  "experienceLevel": "Beginner | Developing | Experienced",
  "deadline": "YYYY-MM-DD or empty string",
  "paid": false,
  "compensation": "string",
  "urgent": false,
  "prayerBreaks": false,
  "prayerSpace": false,
  "halalFood": false,
  "jummahCompatible": false,
  "supervision": "string",
  "applicationSteps": "string",
  "impact": "string",
  "missingFields": ["string"],
  "confidence": 0.5
}

ORGANIZATION TEXT:

${description}
`);

    const draft = normalizeGeminiResult(result, description);

    console.log("Gemini opportunity extraction succeeded:", {
      title: draft.title,
      confidence: draft.confidence,
      missingFieldCount: draft.missingFields.length,
    });

    return NextResponse.json({
      mode: "gemini",
      draft,
      meta: {
        source: "gemini",
        model: (
          process.env.GEMINI_MODEL || "gemini-3.6-flash"
        ).replace(/^models\//, ""),
        humanReviewRequired: true,
      },
    });
  } catch (error) {
    console.error(
      "Gemini opportunity extraction failed:",
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json({
      mode: "safe-fallback",
      draft: infer(description),
      warning:
        "Gemini was unavailable or returned an invalid response. Review the locally inferred fields.",
    });
  }
}