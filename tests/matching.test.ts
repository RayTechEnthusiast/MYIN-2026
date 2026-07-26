import assert from "node:assert/strict";
import test from "node:test";
import { calculateMatch } from "../lib/matching";
import { seedState } from "../lib/seed";

const state = seedState();
const student = state.students[0];
const strong = state.opportunities[0];

test("strong match is explainable and capped at 100", () => {
  const result = calculateMatch(student, strong);
  assert.ok(result.total >= 70);
  assert.ok(result.total <= 100);
  assert.equal(
    Object.values(result.breakdown).reduce((sum, value) => sum + value, 0),
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
  const a = calculateMatch({ ...student, name: "Synthetic Student A" }, strong);
  const b = calculateMatch({ ...student, name: "Synthetic Student B" }, strong);
  assert.equal(a.total, b.total);
  assert.deepEqual(a.breakdown, b.breakdown);
});
