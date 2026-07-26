"use client";

import { useMemo } from "react";
import {
  buildCommunityOpportunityAnalysis,
  buildStudentGrowthPlan,
  type OpportunityGap,
} from "@/lib/opportunity-intelligence";
import type { Opportunity, StudentProfile } from "@/lib/types";

const recommendationLabel = {
  skill: "Skill leverage",
  availability: "Availability insight",
  evidence: "Evidence leverage",
} as const;

export function StudentGrowthPlanPanel({
  student,
  opportunities,
  onViewOpportunity,
  onOpenProfile,
}: {
  student: StudentProfile;
  opportunities: Opportunity[];
  onViewOpportunity: (opportunity: Opportunity) => void;
  onOpenProfile: () => void;
}) {
  const plan = useMemo(
    () => buildStudentGrowthPlan(student, opportunities),
    [student, opportunities],
  );

  return (
    <div className="dashboard-stack">
      <header className="app-page-header">
        <div>
          <span className="kicker">Opportunity Readiness Coach</span>
          <h1>See what employers need—and your highest-leverage next step.</h1>
          <p>
            MYIN compares your current profile with active opportunity requirements.
            Recommendations are deterministic, explainable, and never permission to
            claim skills or availability you do not actually have.
          </p>
        </div>
        <button className="button" onClick={onOpenProfile}>
          Update my profile
        </button>
      </header>

      <section className="recommended-action">
        <div>
          <span className="kicker">Two-way opportunity intelligence</span>
          <h2>MYIN does not just match supply and demand. It improves both.</h2>
          <p>
            Employers receive aggregated opportunity-gap signals. You receive
            transparent, voluntary steps that may improve readiness for real roles.
          </p>
        </div>
      </section>

      <div className="metric-grid">
        <article>
          <span>Visible matches</span>
          <strong>{plan.visibleMatches}</strong>
          <small>Current matches at 70% or higher</small>
        </article>
        <article>
          <span>Relevant opportunities</span>
          <strong>{plan.relevantOpportunities}</strong>
          <small>Open and reasonably eligible</small>
        </article>
        <article>
          <span>Average alignment</span>
          <strong>{plan.averageMatch}%</strong>
          <small>Across relevant opportunities</small>
        </article>
        <article>
          <span>Growth actions</span>
          <strong>{plan.recommendations.length}</strong>
          <small>Prioritized from current demand</small>
        </article>
      </div>

      {plan.recommendations.length ? (
        <div className="three-card-grid compact-cards">
          {plan.recommendations.map((recommendation, index) => {
            const opportunity = opportunities.find(
              (item) => item.id === recommendation.opportunityIds[0],
            );
            return (
              <article key={recommendation.id}>
                <span className="kicker">
                  {index + 1}. {recommendationLabel[recommendation.kind]}
                </span>
                <h3>{recommendation.title}</h3>
                <p>{recommendation.summary}</p>
                <div className="chip-row">
                  <span className="feature-chip">
                    Demand: {recommendation.demandCount}
                  </span>
                  {recommendation.averageScoreGain > 0 && (
                    <span className="feature-chip">
                      Avg. potential gain: +{recommendation.averageScoreGain}
                    </span>
                  )}
                </div>
                <p>
                  <strong>{recommendation.metricText}</strong>
                </p>
                <p>{recommendation.action}</p>
                <div className="notice warning">{recommendation.caution}</div>
                <div className="card-actions">
                  {opportunity && (
                    <button
                      className="button secondary"
                      onClick={() => onViewOpportunity(opportunity)}
                    >
                      See opportunity behind this
                    </button>
                  )}
                  <button className="button ghost" onClick={onOpenProfile}>
                    Open profile
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <h2>Add more profile detail to generate a growth plan.</h2>
          <p>
            Skills, interests, availability, and experience evidence make the
            recommendations more useful.
          </p>
          <button className="button" onClick={onOpenProfile}>
            Complete profile
          </button>
        </div>
      )}

      <section className="panel-card">
        <span className="kicker">How recommendations work</span>
        <h2>Demand evidence first. Encouragement second.</h2>
        <ul className="check-list">
          <li>MYIN counts requirements in active opportunities.</li>
          <li>It simulates only transparent profile changes, one at a time.</li>
          <li>It shows how many listings are affected and which listing caused the signal.</li>
          <li>It never guarantees acceptance or tells a student to misrepresent themselves.</li>
          <li>Gemini may help explain text elsewhere, but it does not secretly rank students.</li>
        </ul>
      </section>
    </div>
  );
}

export function CommunityOpportunityGapsPanel({
  students,
  opportunities,
  onCreateOpportunity,
}: {
  students: StudentProfile[];
  opportunities: Opportunity[];
  onCreateOpportunity: (gap: OpportunityGap) => void;
}) {
  const analysis = useMemo(
    () => buildCommunityOpportunityAnalysis(students, opportunities),
    [students, opportunities],
  );

  return (
    <div className="dashboard-stack">
      <header className="app-page-header">
        <div>
          <span className="kicker">Community Opportunity Gap Radar</span>
          <h1>Stop guessing what youth need. Build around real demand.</h1>
          <p>
            MYIN compares opt-in student interests and constraints with current
            opportunity supply, then recommends useful programs organizations can
            review and create.
          </p>
        </div>
      </header>

      <section className="recommended-action">
        <div>
          <span className="kicker">Organization optimization</span>
          <h2>Turn community demand into better-designed opportunities.</h2>
          <p>
            Each recommendation is generated from aggregate profile fields and
            current listings—not individual student weaknesses.
          </p>
        </div>
      </section>

      <div className="metric-grid">
        <article>
          <span>Discoverable youth</span>
          <strong>{analysis.discoverableStudents}</strong>
          <small>Opted into opportunity discovery</small>
        </article>
        <article>
          <span>Open supply</span>
          <strong>{analysis.openOpportunities}</strong>
          <small>Current opportunity listings</small>
        </article>
        <article>
          <span>Detected gaps</span>
          <strong>{analysis.gaps.length}</strong>
          <small>Prioritized demand-supply signals</small>
        </article>
        <article>
          <span>Privacy threshold</span>
          <strong>{analysis.productionPrivacyThreshold}+</strong>
          <small>Planned minimum cohort size</small>
        </article>
      </div>

      {analysis.syntheticDemoStudents > 0 && (
        <div className="notice">
          Demo-data disclosure: {analysis.syntheticDemoStudents} profiles in this cohort are
          clearly fictional seed profiles used to demonstrate aggregation. These numbers are
          not evidence of real adoption or measured community demand.
        </div>
      )}

      {!analysis.privacyThresholdMet && (
        <div className="notice warning">
          Prototype transparency: this browser demo contains only {analysis.discoverableStudents}{" "}
          discoverable synthetic {analysis.discoverableStudents === 1 ? "profile" : "profiles"}.
          A production dashboard would hide community trends until at least {analysis.productionPrivacyThreshold}{" "}
          opted-in students contribute, preventing small groups from revealing individuals.
        </div>
      )}

      {analysis.gaps.length ? (
        <div className="three-card-grid compact-cards">
          {analysis.gaps.map((gap, index) => (
            <article key={gap.id}>
              <span className="kicker">
                {index + 1}. {gap.confidence}
              </span>
              <h3>{gap.recommendedTitle}</h3>
              <p>
                <strong>{gap.demandCount}</strong> interested youth signal versus{" "}
                <strong>{gap.supplyCount}</strong> current matching {gap.supplyCount === 1 ? "listing" : "listings"}.
              </p>
              <div className="chip-row">
                <span className="feature-chip">{gap.recommendedType}</span>
                <span className="feature-chip">{gap.recommendedFormat}</span>
                <span className="feature-chip">Best day: {gap.recommendedDay}</span>
              </div>
              <p>
                <strong>Suggested starting skills:</strong>{" "}
                {gap.recommendedSkills.join(", ") || "Beginner-friendly participation"}
              </p>
              <p>
                <strong>Potentially relevant youth:</strong> {gap.eligibleYouth}
              </p>
              <button className="button" onClick={() => onCreateOpportunity(gap)}>
                Create recommended opportunity
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No aggregate demand signals yet.</h2>
          <p>
            Signals appear as discoverable student profiles and organization listings
            enter this browser demo.
          </p>
        </div>
      )}

      <section className="panel-card">
        <span className="kicker">Privacy boundary</span>
        <h2>Organizations see community patterns—not named student weaknesses.</h2>
        <ul className="check-list">
          <li>Only discoverable, opted-in profiles contribute.</li>
          <li>Cards use aggregate interests, availability, formats, and skills.</li>
          <li>No student name is shown in a community-gap recommendation.</li>
          <li>Every generated opportunity remains editable before publication.</li>
          <li>Production deployment should enforce a minimum cohort threshold.</li>
        </ul>
      </section>
    </div>
  );
}
