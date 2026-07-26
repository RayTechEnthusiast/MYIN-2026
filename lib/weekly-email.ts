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
}

export function buildWeeklyPilotEmail(
  employerName: string,
  now = new Date(),
): WeeklyPilotEmail {
  const state = seedState();
  const analysis = buildCommunityOpportunityAnalysis(
    state.students,
    state.opportunities,
  );

  const candidateRows = state.opportunities
    .filter((opportunity) => opportunity.status === "open")
    .flatMap((opportunity) =>
      state.students
        .filter((student) => student.discoverable)
        .map((student) => ({
          student,
          opportunity,
          match: calculateMatch(student, opportunity),
        })),
    )
    .filter(({ match }) => match.eligible && match.total >= 70)
    .sort(
      (a, b) =>
        b.match.total - a.match.total ||
        b.match.confidence - a.match.confidence,
    )
    .slice(0, 3);

  const topGaps = analysis.gaps.slice(0, 3);
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
    : ["No aggregate opportunity gaps are available in the current demo data.", ""];

  const candidateLines = candidateRows.length
    ? candidateRows.flatMap(({ student, opportunity, match }, index) => [
        `${index + 1}. Candidate ${initials(student.name)} — ${match.total}% match`,
        `   Current opportunity: ${opportunity.title}`,
        `   Why connected: ${match.explanations.slice(0, 2).join(" ")}`,
        `   Confidence: ${match.confidence}%`,
        "",
      ])
    : ["No privacy-safe candidate signals currently meet the 70% threshold.", ""];

  const subject = `MYIN Weekly Talent Brief — ${dateLabel}`;
  const body = [
    `Assalamu alaikum ${employerName},`,
    "",
    "Here is your automated MYIN pilot talent briefing for this week.",
    "",
    "COMMUNITY OPPORTUNITY GAPS",
    ...gapLines,
    "PRIVACY-SAFE TALENT SIGNALS",
    ...candidateLines,
    `Prototype snapshot: ${analysis.discoverableStudents} discoverable synthetic demo profiles and ${analysis.openOpportunities} open demo opportunities were analyzed.`,
    "",
    "MYIN does not expose student contact information in this briefing. Candidate initials are privacy-safe demo labels, and all matches remain explainable recommendations rather than hiring decisions.",
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
  };
}
