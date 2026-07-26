import assert from "node:assert/strict";
import test from "node:test";
import { calculateMatch } from "../lib/matching";
import {
  buildCommunityOpportunityAnalysis,
  buildStudentGrowthPlan,
} from "../lib/opportunity-intelligence";
import { seedState } from "../lib/seed";
import { buildWeeklyPilotEmail } from "../lib/weekly-email";

const state = seedState();
const student = state.students[0];
const strong = state.opportunities[0];

test("strong match is explainable and capped at 100", () => {
  const result = calculateMatch(student, strong);
  assert.ok(result.total >= 70);
  assert.ok(result.total <= 100);
  assert.equal(
    Object.values(result.breakdown).reduce(
      (sum, value) => sum + value,
      0,
    ),
    result.total,
  );
  assert.ok(result.explanations.length > 0);
});

test("clearly ineligible student cannot receive a misleading high score", () => {
  const result = calculateMatch({ ...student, age: 11 }, strong);
  assert.equal(result.eligible, false);
  assert.ok(result.total <= 49);
});

test("no requested skills does not crash and score remains bounded", () => {
  const result = calculateMatch(student, { ...strong, skills: [] });
  assert.ok(result.total >= 0 && result.total <= 100);
});

test("irrelevant identity changes do not change deterministic score", () => {
  const a = calculateMatch(
    { ...student, name: "Synthetic Student A" },
    strong,
  );
  const b = calculateMatch(
    { ...student, name: "Synthetic Student B" },
    strong,
  );
  assert.equal(a.total, b.total);
  assert.deepEqual(a.breakdown, b.breakdown);
});

test("student growth plan is grounded in active opportunity demand", () => {
  const plan = buildStudentGrowthPlan(student, state.opportunities);
  assert.ok(plan.relevantOpportunities > 0);
  assert.ok(plan.recommendations.length > 0);
  assert.ok(plan.recommendations.every((item) => item.demandCount > 0));
});

test("community intelligence exposes aggregate gaps without student names", () => {
  const analysis = buildCommunityOpportunityAnalysis(
    state.students,
    state.opportunities,
  );
  assert.ok(analysis.gaps.length > 0);
  assert.equal(analysis.productionPrivacyThreshold, 5);
  assert.ok(
    analysis.gaps.every(
      (gap) => !gap.recommendedTitle.includes(student.name),
    ),
  );
});

test("weekly pilot email is privacy-safe and clearly labeled as demo data", () => {
  const email = buildWeeklyPilotEmail(
    "Crescent Robotics",
    ["Technology", "Engineering", "Robotics"],
    new Date("2026-07-27T13:17:00.000Z"),
  );

  assert.match(email.subject, /MYIN Weekly Talent Brief/);
  assert.match(email.body, /synthetic demo cohort/i);
  assert.match(
    email.body,
    /Focus areas: Technology, Engineering, Robotics/,
  );
  assert.equal(email.body.includes(student.name), false);
  assert.ok(email.candidateCount > 0);
  assert.ok(email.gapCount > 0);
});

test("weekly pilot selects each student once and only from employer-relevant pathways", () => {
  const email = buildWeeklyPilotEmail(
    "Crescent Robotics",
    ["Technology", "Engineering", "Robotics"],
    new Date("2026-07-27T13:17:00.000Z"),
  );

  const candidateLabels = [
    ...email.body.matchAll(/^\d+\. Candidate ([A-Z]{1,3})/gm),
  ].map((match) => match[1]);

  assert.equal(
    candidateLabels.length,
    new Set(candidateLabels).size,
  );
  assert.equal(
    (email.body.match(/Candidate AR/g) || []).length,
    1,
  );
  assert.equal(
    email.body.includes("Community Food Drive Creative Team"),
    false,
  );
  assert.ok(email.candidateCount <= 3);
});
