import type {
  MatchResult,
  Opportunity,
  StudentProfile,
} from "./types";

export interface MatchCardInsights {
  reasons: string[];
  pros: string[];
  cons: string[];
}

const unique = (items: string[]) =>
  [...new Set(items.map((item) => item.trim()).filter(Boolean))];

const organizationVoice = (value: string) =>
  value
    .replace(/^Your /, "The candidate’s ")
    .replace(/^You have /, "The candidate has ")
    .replace(/^This could /, "This match could ");

export function buildStudentOpportunityInsights(
  student: StudentProfile,
  opportunity: Opportunity,
  match: MatchResult,
): MatchCardInsights {
  const pros: string[] = [];
  const cons: string[] = [];

  if (match.breakdown.skills >= 14) {
    pros.push("Strong overlap with the skills requested by the organization.");
  } else if (match.breakdown.skills > 0) {
    pros.push("Some relevant skills are already present, with room to grow.");
  }

  if (match.breakdown.availability >= 11) {
    pros.push("The schedule and weekly commitment fit the profile well.");
  }

  if (match.breakdown.locationFormat >= 8) {
    pros.push("The location and work format fit current preferences.");
  }

  if (match.breakdown.eligibility === 10) {
    pros.push("Age and experience eligibility appear to be satisfied.");
  }

  const faithSignals = [
    student.prayerSpace && opportunity.prayerSpace
      ? "Prayer-space preference is supported."
      : "",
    student.prayerBreaks && opportunity.prayerBreaks
      ? "Flexible prayer breaks are supported."
      : "",
    student.halalFood && opportunity.halalFood
      ? "Halal-food availability is disclosed."
      : "",
    student.jummahAvailability === "Needs flexibility" &&
    opportunity.jummahCompatible
      ? "Friday/Jumu’ah flexibility is disclosed."
      : "",
  ].filter(Boolean);

  pros.push(...faithSignals);

  if (opportunity.verified) {
    pros.push("The demo listing includes an organization-verification signal.");
  }

  if (match.breakdown.skills < 10) {
    cons.push("Current skill overlap is limited for part of the role.");
  }

  if (match.breakdown.availability < 9) {
    cons.push("Schedule or weekly-hour fit may require clarification.");
  }

  if (match.breakdown.locationFormat < 7) {
    cons.push("Travel distance or work format may be less convenient.");
  }

  if (match.breakdown.eligibility < 10) {
    cons.push("Age or experience eligibility needs closer review.");
  }

  if (match.confidence < 70) {
    cons.push("Match confidence is limited by incomplete profile or listing data.");
  }

  cons.push(...match.cautions);
  cons.push(
    ...match.missingData
      .slice(0, 2)
      .map((field) => `Still missing: ${field}.`),
  );

  return {
    reasons: unique(match.explanations).slice(0, 3),
    pros: unique(pros).slice(0, 3),
    cons: unique(cons).slice(0, 3).length
      ? unique(cons).slice(0, 3)
      : ["No major mismatch detected; confirm role details before applying."],
  };
}

export function buildOrganizationCandidateInsights(
  student: StudentProfile,
  opportunity: Opportunity,
  match: MatchResult,
  interested = false,
): MatchCardInsights {
  const pros: string[] = [];
  const cons: string[] = [];

  const matchingSkills = student.skills.filter((skill) =>
    opportunity.skills.some(
      (requested) => requested.toLowerCase() === skill.toLowerCase(),
    ),
  );

  if (interested) {
    pros.push("The student has already sent the first interest signal.");
  }

  if (matchingSkills.length) {
    pros.push(
      `Relevant skill evidence: ${matchingSkills.slice(0, 3).join(", ")}.`,
    );
  }

  if (match.breakdown.availability >= 11) {
    pros.push("Availability aligns well with the listed schedule.");
  }

  if (student.experiences.length || student.verifiedServiceHours) {
    pros.push(
      `${student.experiences.length} experience item${
        student.experiences.length === 1 ? "" : "s"
      } and ${student.verifiedServiceHours} verified service hours are visible.`,
    );
  }

  if (match.breakdown.eligibility === 10) {
    pros.push("Age and experience eligibility appear compatible.");
  }

  if (match.breakdown.skills < 10) {
    cons.push("The candidate may need development in requested skills.");
  }

  if (match.breakdown.availability < 9) {
    cons.push("Schedule or weekly-hour fit should be confirmed.");
  }

  if (match.breakdown.locationFormat < 7) {
    cons.push("Location or work-format fit may be weaker.");
  }

  if (!student.experiences.length) {
    cons.push("The profile currently has limited experience evidence.");
  }

  if (match.confidence < 70) {
    cons.push("Incomplete profile or listing data lowers match confidence.");
  }

  cons.push(...match.cautions);
  cons.push(
    ...match.missingData
      .slice(0, 2)
      .map((field) => `Still verify: ${field}.`),
  );

  return {
    reasons: unique(match.explanations.map(organizationVoice)).slice(0, 3),
    pros: unique(pros).slice(0, 3),
    cons: unique(cons).slice(0, 3).length
      ? unique(cons).slice(0, 3)
      : ["No major concern detected; complete normal human review."],
  };
}
