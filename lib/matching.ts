import type { MatchResult, Opportunity, StudentProfile } from "./types";
import { clamp } from "./utils";

const normalize = (value: string) => value.trim().toLowerCase();

const overlapRatio = (source: string[], target: string[]) => {
  if (target.length === 0) return 1;
  const sourceSet = new Set(source.map(normalize));
  const matches = target.filter((item) => sourceSet.has(normalize(item))).length;
  return matches / target.length;
};

const anyOverlap = (source: string[], target: string[]) => overlapRatio(source, target) > 0;

const levelRank = { Beginner: 1, Developing: 2, Experienced: 3 } as const;

export function calculateMatch(student: StudentProfile, opportunity: Opportunity): MatchResult {
  const explanations: string[] = [];
  const cautions: string[] = [];
  const missingData: string[] = [];
  const confidenceInputs: string[] = [];

  const interestRatio = overlapRatio(student.interests, opportunity.interests);
  const skillRatio = overlapRatio(student.skills, opportunity.skills);
  const goalRatio = overlapRatio(student.careerGoals, opportunity.careerGoals);
  const dayRatio = overlapRatio(student.availableDays, opportunity.availableDays);

  const interests = Math.round(interestRatio * 25);
  const skills = Math.round(skillRatio * 20);
  const careerGoals = Math.round(goalRatio * 15);

  const hoursFit = student.weeklyHours >= opportunity.weeklyHours ? 1 : student.weeklyHours / Math.max(1, opportunity.weeklyHours);
  const availability = Math.round(((dayRatio * 0.7) + (hoursFit * 0.3)) * 15);

  const ageEligible = student.age >= opportunity.ageMin && student.age <= opportunity.ageMax;
  const experienceEligible = levelRank[student.experienceLevel] >= Math.max(1, levelRank[opportunity.experienceLevel] - 1);
  const eligible = ageEligible && experienceEligible;
  const eligibility = ageEligible ? (experienceEligible ? 10 : 5) : 0;

  const formatFit = student.formats.includes(opportunity.format);
  const distanceFit = opportunity.format === "Remote" || opportunity.distanceMiles <= student.travelMiles;
  const locationFormat = (formatFit ? 5 : 1) + (distanceFit ? 5 : Math.max(0, 5 - Math.round((opportunity.distanceMiles - student.travelMiles) / 5)));

  const opportunityType = student.opportunityTypes.includes(opportunity.type) ? 5 : 1;

  let total = interests + skills + careerGoals + availability + eligibility + locationFormat + opportunityType;
  if (!ageEligible) {
    total = Math.min(total, 49);
    cautions.push(`Age eligibility is ${opportunity.ageMin}–${opportunity.ageMax}; this profile is currently outside that range.`);
  }
  total = clamp(Math.round(total));

  if (interestRatio > 0) explanations.push("Your interests overlap with the organization’s mission and role focus.");
  if (skillRatio >= 0.66) explanations.push("Most requested skills are already supported by your profile.");
  else if (skillRatio > 0) explanations.push("You have some of the requested skills, with clear room to grow.");
  else explanations.push("This could broaden your skills, but the current skill overlap is limited.");
  if (goalRatio > 0) explanations.push("The opportunity supports at least one stated career goal.");
  if (availability >= 11) explanations.push("The schedule and weekly commitment fit your availability.");
  if (formatFit && distanceFit) explanations.push("The format and travel distance fit your preferences.");
  if (opportunity.jummahCompatible && student.jummahAvailability === "Needs flexibility") explanations.push("The listing explicitly supports Friday/Jumu’ah flexibility.");
  if (student.prayerSpace && opportunity.prayerSpace) explanations.push("Prayer-space preference is clearly supported.");
  if (student.prayerBreaks && opportunity.prayerBreaks) explanations.push("Flexible prayer breaks are disclosed.");
  if (student.halalFood && opportunity.halalFood) explanations.push("Halal food availability is disclosed.");

  if (!opportunity.skills.length) missingData.push("requested skills");
  if (!opportunity.availableDays.length) missingData.push("schedule days");
  if (!opportunity.supervision.trim()) missingData.push("supervision details");
  if (!student.careerGoals.length) missingData.push("student career goals");
  if (!student.experiences.length) missingData.push("student experience evidence");
  if (!student.zip) missingData.push("student location");

  const profileSignals = [
    student.skills.length >= 3,
    student.interests.length >= 2,
    student.careerGoals.length >= 1,
    student.availableDays.length >= 1,
    student.experiences.length >= 1,
    Boolean(student.zip),
  ];
  const listingSignals = [
    opportunity.skills.length > 0,
    opportunity.interests.length > 0,
    opportunity.availableDays.length > 0,
    Boolean(opportunity.supervision),
    Boolean(opportunity.deadline),
    opportunity.missingFields.length === 0,
    opportunity.verified,
  ];
  const confidence = Math.round(
    ((profileSignals.filter(Boolean).length / profileSignals.length) * 45) +
      ((listingSignals.filter(Boolean).length / listingSignals.length) * 45) +
      opportunity.confidence * 10,
  );
  confidenceInputs.push(`${profileSignals.filter(Boolean).length}/${profileSignals.length} profile data signals complete`);
  confidenceInputs.push(`${listingSignals.filter(Boolean).length}/${listingSignals.length} listing verification signals complete`);
  confidenceInputs.push(`AI/extraction confidence supplied as ${Math.round(opportunity.confidence * 100)}%`);

  let connectionLens: MatchResult["connectionLens"] = "Rounding opportunity";
  if (skillRatio >= 0.66 && interestRatio >= 0.5) connectionLens = "Core edge";
  else if (skillRatio > 0 || goalRatio > 0 || anyOverlap(student.strengths, opportunity.skills)) connectionLens = "Adjacent expansion";

  return {
    total,
    breakdown: {
      interests,
      skills,
      careerGoals,
      availability,
      eligibility,
      locationFormat,
      opportunityType,
    },
    explanations,
    cautions,
    confidence: clamp(confidence),
    confidenceInputs,
    missingData,
    eligible,
    connectionLens,
  };
}

export function scoreRadar(student: StudentProfile) {
  const experienceDepth = Math.min(100, student.experiences.length * 24 + student.verifiedServiceHours / 2);
  const skillDepth = Math.min(100, student.skills.length * 12 + student.strengths.length * 8);
  const reliability = Math.min(100, 45 + student.availableDays.length * 7 + (student.guardianApproval ? 10 : 0));
  const community = Math.min(100, 35 + student.causes.length * 12 + student.verifiedServiceHours / 3);
  const leadership = Math.min(100, 30 + student.experiences.filter((item) => /lead|captain|organ|mentor/i.test(item.description + item.title)).length * 20 + student.strengths.length * 5);
  const readiness = Math.min(100, (skillDepth + experienceDepth + reliability) / 3);

  return [
    { label: "Skills", value: Math.round(skillDepth) },
    { label: "Experience", value: Math.round(experienceDepth) },
    { label: "Reliability", value: Math.round(reliability) },
    { label: "Community", value: Math.round(community) },
    { label: "Leadership", value: Math.round(leadership) },
    { label: "Readiness", value: Math.round(readiness) },
  ];
}
