import { calculateMatch } from "./matching";
import type {
  Opportunity,
  OpportunityFormat,
  OpportunityType,
  StudentProfile,
} from "./types";

const normalize = (value: string) => value.trim().toLowerCase();

const titleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const countValues = (values: string[]) => {
  const counts = new Map<string, { label: string; count: number }>();
  for (const value of values.filter(Boolean)) {
    const key = normalize(value);
    const current = counts.get(key);
    counts.set(key, {
      label: current?.label || value.trim(),
      count: (current?.count || 0) + 1,
    });
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
};

const experienceRanks = {
  Beginner: 1,
  Developing: 2,
  Experienced: 3,
} as const;

const openAndRelevant = (student: StudentProfile, opportunities: Opportunity[]) =>
  opportunities.filter((opportunity) => {
    if (opportunity.status !== "open") return false;
    if (student.age < opportunity.ageMin || student.age > opportunity.ageMax) return false;
    return (
      experienceRanks[student.experienceLevel] >=
      Math.max(1, experienceRanks[opportunity.experienceLevel] - 1)
    );
  });

export type GrowthRecommendationKind = "skill" | "availability" | "evidence";

export interface StudentGrowthRecommendation {
  id: string;
  kind: GrowthRecommendationKind;
  title: string;
  summary: string;
  action: string;
  caution: string;
  demandCount: number;
  unlockedCount: number;
  averageScoreGain: number;
  opportunityIds: string[];
  metricText: string;
}

export interface StudentGrowthPlan {
  visibleMatches: number;
  relevantOpportunities: number;
  averageMatch: number;
  recommendations: StudentGrowthRecommendation[];
}

export function buildStudentGrowthPlan(
  student: StudentProfile,
  opportunities: Opportunity[],
): StudentGrowthPlan {
  const relevant = openAndRelevant(student, opportunities);
  const baseline = new Map(
    relevant.map((opportunity) => [opportunity.id, calculateMatch(student, opportunity)]),
  );
  const baselineScores = [...baseline.values()].map((match) => match.total);
  const currentSkills = new Set(student.skills.map(normalize));
  const currentDays = new Set(student.availableDays.map(normalize));

  const skillDemand = countValues(relevant.flatMap((opportunity) => opportunity.skills))
    .filter((item) => !currentSkills.has(normalize(item.label)))
    .map((item) => {
      const simulated: StudentProfile = {
        ...student,
        skills: [...student.skills, item.label],
      };
      const affected = relevant.filter((opportunity) =>
        opportunity.skills.some((skill) => normalize(skill) === normalize(item.label)),
      );
      const improvements = affected.map((opportunity) => {
        const before = baseline.get(opportunity.id)?.total || 0;
        const after = calculateMatch(simulated, opportunity).total;
        return { opportunity, before, after };
      });
      const unlocked = improvements.filter(
        ({ before, after }) => before < 70 && after >= 70,
      );
      const averageGain = improvements.length
        ? Math.round(
            improvements.reduce(
              (sum, improvement) => sum + Math.max(0, improvement.after - improvement.before),
              0,
            ) / improvements.length,
          )
        : 0;

      return {
        item,
        affected,
        unlocked,
        averageGain,
        totalGain: improvements.reduce(
          (sum, improvement) => sum + Math.max(0, improvement.after - improvement.before),
          0,
        ),
      };
    })
    .sort(
      (a, b) =>
        b.unlocked.length - a.unlocked.length ||
        b.totalGain - a.totalGain ||
        b.item.count - a.item.count,
    );

  const dayDemand = countValues(relevant.flatMap((opportunity) => opportunity.availableDays))
    .filter((item) => !currentDays.has(normalize(item.label)))
    .map((item) => {
      const simulated: StudentProfile = {
        ...student,
        availableDays: [...student.availableDays, item.label],
      };
      const affected = relevant.filter((opportunity) =>
        opportunity.availableDays.some((day) => normalize(day) === normalize(item.label)),
      );
      const improvements = affected.map((opportunity) => {
        const before = baseline.get(opportunity.id)?.total || 0;
        const after = calculateMatch(simulated, opportunity).total;
        return { opportunity, before, after };
      });
      const unlocked = improvements.filter(
        ({ before, after }) => before < 70 && after >= 70,
      );
      const averageGain = improvements.length
        ? Math.round(
            improvements.reduce(
              (sum, improvement) => sum + Math.max(0, improvement.after - improvement.before),
              0,
            ) / improvements.length,
          )
        : 0;

      return {
        item,
        affected,
        unlocked,
        averageGain,
        totalGain: improvements.reduce(
          (sum, improvement) => sum + Math.max(0, improvement.after - improvement.before),
          0,
        ),
      };
    })
    .sort(
      (a, b) =>
        b.unlocked.length - a.unlocked.length ||
        b.totalGain - a.totalGain ||
        b.item.count - a.item.count,
    );

  const evidenceText = student.experiences
    .flatMap((experience) => [experience.title, experience.description, ...experience.skills])
    .join(" ")
    .toLowerCase();
  const evidenceDemand = countValues(
    relevant.flatMap((opportunity) => opportunity.skills),
  ).filter(
    (item) =>
      currentSkills.has(normalize(item.label)) &&
      !evidenceText.includes(normalize(item.label)),
  );

  const recommendations: StudentGrowthRecommendation[] = [];
  const bestSkill = skillDemand[0];
  if (bestSkill) {
    recommendations.push({
      id: `skill-${normalize(bestSkill.item.label).replace(/[^a-z0-9]+/g, "-")}`,
      kind: "skill",
      title: `Build ${titleCase(bestSkill.item.label)}`,
      summary: `${bestSkill.item.label} appears in ${bestSkill.item.count} current ${bestSkill.item.count === 1 ? "opportunity" : "opportunities"}. Adding it to your profile would only be appropriate after you genuinely learn or practice it.`,
      action: `Learn the basics, complete a small project, then add honest evidence to your profile.`,
      caution: "MYIN never recommends claiming a skill you have not earned.",
      demandCount: bestSkill.item.count,
      unlockedCount: bestSkill.unlocked.length,
      averageScoreGain: bestSkill.averageGain,
      opportunityIds: bestSkill.affected.map(({ id }) => id),
      metricText: bestSkill.unlocked.length
        ? `Could unlock ${bestSkill.unlocked.length} additional visible ${bestSkill.unlocked.length === 1 ? "match" : "matches"}`
        : `Could improve alignment across ${bestSkill.affected.length} ${bestSkill.affected.length === 1 ? "opportunity" : "opportunities"}`,
    });
  }

  const bestDay = dayDemand[0];
  if (bestDay) {
    recommendations.push({
      id: `availability-${normalize(bestDay.item.label).replace(/[^a-z0-9]+/g, "-")}`,
      kind: "availability",
      title: `Review ${bestDay.item.label} availability`,
      summary: `${bestDay.item.count} current ${bestDay.item.count === 1 ? "opportunity uses" : "opportunities use"} ${bestDay.item.label}.`,
      action: `Add ${bestDay.item.label} only when it genuinely works with school, family, faith, transportation, and rest.`,
      caution: "Availability is a real-life constraint, not a weakness to hide.",
      demandCount: bestDay.item.count,
      unlockedCount: bestDay.unlocked.length,
      averageScoreGain: bestDay.averageGain,
      opportunityIds: bestDay.affected.map(({ id }) => id),
      metricText: bestDay.unlocked.length
        ? `Could unlock ${bestDay.unlocked.length} additional visible ${bestDay.unlocked.length === 1 ? "match" : "matches"}`
        : `Could improve schedule fit on ${bestDay.affected.length} ${bestDay.affected.length === 1 ? "opportunity" : "opportunities"}`,
    });
  }

  const bestEvidence = evidenceDemand[0];
  if (bestEvidence) {
    const affected = relevant.filter((opportunity) =>
      opportunity.skills.some(
        (skill) => normalize(skill) === normalize(bestEvidence.label),
      ),
    );
    recommendations.push({
      id: `evidence-${normalize(bestEvidence.label).replace(/[^a-z0-9]+/g, "-")}`,
      kind: "evidence",
      title: `Prove your ${titleCase(bestEvidence.label)} skill`,
      summary: `You list ${bestEvidence.label}, but your current experience evidence does not clearly demonstrate it. Employers request it in ${bestEvidence.count} current ${bestEvidence.count === 1 ? "opportunity" : "opportunities"}.`,
      action: "Add a truthful project, school assignment, volunteer result, portfolio link, or organization-confirmed example.",
      caution: "Evidence increases confidence; it does not guarantee acceptance.",
      demandCount: bestEvidence.count,
      unlockedCount: 0,
      averageScoreGain: 0,
      opportunityIds: affected.map(({ id }) => id),
      metricText: `Could strengthen confidence for ${affected.length} ${affected.length === 1 ? "opportunity" : "opportunities"}`,
    });
  }

  return {
    visibleMatches: baselineScores.filter((score) => score >= 70).length,
    relevantOpportunities: relevant.length,
    averageMatch: baselineScores.length
      ? Math.round(baselineScores.reduce((sum, score) => sum + score, 0) / baselineScores.length)
      : 0,
    recommendations: recommendations.slice(0, 3),
  };
}

export interface OpportunityGap {
  id: string;
  topic: string;
  demandCount: number;
  supplyCount: number;
  unmetDemand: number;
  recommendedTitle: string;
  recommendedType: OpportunityType;
  recommendedFormat: OpportunityFormat;
  recommendedDay: string;
  recommendedSkills: string[];
  recommendedCareerGoals: string[];
  eligibleYouth: number;
  confidence: "early signal" | "developing signal" | "strong signal";
}

export interface CommunityOpportunityAnalysis {
  discoverableStudents: number;
  syntheticDemoStudents: number;
  openOpportunities: number;
  privacyThresholdMet: boolean;
  productionPrivacyThreshold: number;
  gaps: OpportunityGap[];
}

export function buildCommunityOpportunityAnalysis(
  students: StudentProfile[],
  opportunities: Opportunity[],
  productionPrivacyThreshold = 5,
): CommunityOpportunityAnalysis {
  const discoverable = students.filter((student) => student.discoverable);
  const open = opportunities.filter((opportunity) => opportunity.status === "open");
  const interestDemand = countValues(discoverable.flatMap((student) => student.interests));

  const gaps = interestDemand
    .map((interest) => {
      const segment = discoverable.filter((student) =>
        student.interests.some((value) => normalize(value) === normalize(interest.label)),
      );
      const supply = open.filter((opportunity) =>
        opportunity.interests.some(
          (value) => normalize(value) === normalize(interest.label),
        ),
      );
      const day = countValues(segment.flatMap((student) => student.availableDays))[0]?.label || "Flexible";
      const format = (countValues(segment.flatMap((student) => student.formats))[0]?.label ||
        "Hybrid") as OpportunityFormat;
      const skills = countValues(segment.flatMap((student) => student.skills))
        .slice(0, 3)
        .map((item) => item.label);
      const careerGoals = countValues(segment.flatMap((student) => student.careerGoals))
        .slice(0, 2)
        .map((item) => item.label);
      const beginnerShare = segment.length
        ? segment.filter((student) => student.experienceLevel === "Beginner").length /
          segment.length
        : 0;
      const recommendedType: OpportunityType =
        supply.length === 0 || beginnerShare >= 0.4
          ? "Mentorship"
          : "Community Project";
      const unmetDemand = Math.max(0, interest.count - supply.length);
      const confidence: OpportunityGap["confidence"] =
        interest.count >= productionPrivacyThreshold
          ? "strong signal"
          : interest.count >= 3
            ? "developing signal"
            : "early signal";

      return {
        id: `gap-${normalize(interest.label).replace(/[^a-z0-9]+/g, "-")}`,
        topic: interest.label,
        demandCount: interest.count,
        supplyCount: supply.length,
        unmetDemand,
        recommendedTitle: `${titleCase(interest.label)} ${recommendedType}`,
        recommendedType,
        recommendedFormat: format,
        recommendedDay: day,
        recommendedSkills: skills,
        recommendedCareerGoals: careerGoals,
        eligibleYouth: segment.length,
        confidence,
        rank: interest.count * 4 - supply.length * 3 + unmetDemand * 2,
      };
    })
    .filter((gap) => gap.demandCount > 0)
    .sort((a, b) => b.rank - a.rank || b.demandCount - a.demandCount)
    .slice(0, 3)
    .map(({ rank: _rank, ...gap }) => gap);

  return {
    discoverableStudents: discoverable.length,
    syntheticDemoStudents: discoverable.filter((student) =>
      student.id.startsWith("student_cohort_"),
    ).length,
    openOpportunities: open.length,
    privacyThresholdMet: discoverable.length >= productionPrivacyThreshold,
    productionPrivacyThreshold,
    gaps,
  };
}
