import { calculateMatch } from "./matching";
import { buildCommunityOpportunityAnalysis } from "./opportunity-intelligence";
import { seedState } from "./seed";
import { initials } from "./utils";

export interface WeeklyPilotEmail {
  subject: string;
  body: string;
  generatedAt: string;
  candidateCount: number;
  gapCount: number;
  focusAreas: string[];
}

const normalize = (value: string) => value.trim().toLowerCase();

const uniqueClean = (values: string[]) =>
  [...new Set(values.map((value) => value.trim()).filter(Boolean))];

const textMatchesFocus = (values: string[], focusAreas: string[]) => {
  const haystack = normalize(values.join(" "));
  return focusAreas.some((focusArea) => {
    const focus = normalize(focusArea);
    if (!focus) return false;
    return (
      haystack.includes(focus) ||
      focus
        .split(/\s+/)
        .filter(Boolean)
        .every((token) => haystack.includes(token))
    );
  });
};

export function buildWeeklyPilotEmail(
  employerName: string,
  requestedFocusAreas: string[] = ["Technology", "Robotics", "Engineering"],
  now = new Date(),
): WeeklyPilotEmail {
  const state = seedState();
  const focusAreas = uniqueClean(requestedFocusAreas);
  const effectiveFocusAreas = focusAreas.length
    ? focusAreas
    : ["Technology", "Robotics", "Engineering"];

  const analysis = buildCommunityOpportunityAnalysis(
    state.students,
    state.opportunities,
  );

  const relevantOpportunities = state.opportunities.filter(
    (opportunity) =>
      opportunity.status === "open" &&
      textMatchesFocus(
        [
          opportunity.title,
          opportunity.description,
          opportunity.orgName,
          opportunity.type,
          opportunity.format,
          ...opportunity.skills,
          ...opportunity.interests,
          ...opportunity.careerGoals,
        ],
        effectiveFocusAreas,
      ),
  );

  const rankedRows = relevantOpportunities
    .flatMap((opportunity) =>
      state.students
        .filter((student) => student.discoverable)
        .map((student) => ({
          student,
          opportunity,
          match: calculateMatch(student, opportunity),
          focusOverlap: effectiveFocusAreas.filter((focusArea) =>
            textMatchesFocus(
              [
                student.bio,
                ...student.skills,
                ...student.interests,
                ...student.careerGoals,
                ...student.causes,
              ],
              [focusArea],
            ),
          ).length,
        })),
    )
    .filter(({ match }) => match.eligible && match.total >= 70)
    .sort(
      (a, b) =>
        b.match.total - a.match.total ||
        b.focusOverlap - a.focusOverlap ||
        b.match.confidence - a.match.confidence ||
        a.student.id.localeCompare(b.student.id),
    );

  const candidateRows: typeof rankedRows = [];
  const includedStudents = new Set<string>();

  for (const row of rankedRows) {
    if (includedStudents.has(row.student.id)) continue;
    includedStudents.add(row.student.id);
    candidateRows.push(row);
    if (candidateRows.length === 3) break;
  }

  const topGaps = analysis.gaps
    .filter((gap) =>
      textMatchesFocus(
        [
          gap.topic,
          gap.recommendedTitle,
          gap.recommendedType,
          gap.recommendedFormat,
          ...gap.recommendedSkills,
          ...gap.recommendedCareerGoals,
        ],
        effectiveFocusAreas,
      ),
    )
    .slice(0, 3);

  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(now);

  const gapLines = topGaps.length
    ? topGaps.flatMap((gap, index) => [
        `${index + 1}. ${gap.topic}`,
        `   Youth demand: ${gap.demandCount} interested youth signals`,
        `   Current supply: ${gap.supplyCount} matching ${
          gap.supplyCount === 1 ? "listing" : "listings"
        }`,
        `   Recommended: ${gap.recommendedTitle}`,
        `   Suggested format/day: ${gap.recommendedFormat} · ${gap.recommendedDay}`,
        `   Suggested skills: ${
          gap.recommendedSkills.join(", ") || "Confirm with the community"
        }`,
        "",
      ])
    : [
        "No aggregate opportunity gap currently matches the employer's selected focus areas.",
        "",
      ];

  const candidateLines = candidateRows.length
    ? candidateRows.flatMap(({ student, opportunity, match }, index) => [
        `${index + 1}. Candidate ${initials(student.name)} — ${match.total}% match`,
        `   Strongest relevant pathway: ${opportunity.title}`,
        `   Why connected: ${match.explanations.slice(0, 2).join(" ")}`,
        `   Confidence: ${match.confidence}%`,
        "",
      ])
    : [
        "No unique privacy-safe candidate currently meets both the employer focus and the 70% visibility threshold.",
        "",
      ];

  const subject = `MYIN Weekly Talent Brief — ${dateLabel}`;
  const body = [
    `Assalamu alaikum ${employerName},`,
    "",
    "Here is your automated MYIN pilot talent briefing for this week.",
    `Focus areas: ${effectiveFocusAreas.join(", ")}`,
    "",
    "COMMUNITY OPPORTUNITY GAPS",
    ...gapLines,
    "PRIVACY-SAFE TALENT SIGNALS",
    ...candidateLines,
    `Prototype snapshot: ${analysis.discoverableStudents} discoverable synthetic demo profiles, ${analysis.openOpportunities} open demo opportunities, and ${relevantOpportunities.length} employer-relevant opportunities were analyzed.`,
    "",
    "Each student appears at most once, using that student's strongest relevant pathway for this employer. MYIN does not expose student contact information in this briefing. Candidate initials are privacy-safe demo labels, and all matches remain explainable recommendations rather than hiring decisions.",
    "",
    "Pilot disclosure: this automated email currently uses MYIN's synthetic demo cohort. A production version would use consented, persisted organization and youth data with subscription and unsubscribe controls.",
    "",
    "Jazakum Allahu khayran,",
    "MYIN",
  ].join("\n");

  return {
    subject,
    body,
    generatedAt: now.toISOString(),
    candidateCount: candidateRows.length,
    gapCount: topGaps.length,
    focusAreas: effectiveFocusAreas,
  };
}
