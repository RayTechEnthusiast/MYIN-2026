"use client";

import { calculateMatch } from "@/lib/matching";
import { buildOrganizationCandidateInsights } from "@/lib/match-insights";
import type { Opportunity, StudentProfile } from "@/lib/types";
import { initials } from "@/lib/utils";

export function CandidateMatchCard({
  student,
  opportunity,
  interested,
  onView,
  onRequestIntroduction,
}: {
  student: StudentProfile;
  opportunity: Opportunity;
  interested: boolean;
  onView: () => void;
  onRequestIntroduction?: () => void;
}) {
  const match = calculateMatch(student, opportunity);
  const insights = buildOrganizationCandidateInsights(
    student,
    opportunity,
    match,
    interested,
  );

  return (
    <article className={`candidate-card ${interested ? "interested" : ""}`}>
      <header>
        <span className="safe-avatar">{initials(student.name)}</span>
        <div>
          <span className="kicker">
            {interested
              ? "Student initiated interest"
              : "Discoverable safe profile"}
          </span>
          <h2>
            {interested
              ? "Interested candidate"
              : `Candidate ${initials(student.name)}`}
          </h2>
        </div>
        <strong className="score-badge">{match.total}%</strong>
      </header>

      <p>
        <strong>For:</strong> {opportunity.title}
      </p>

      <div className="chip-row">
        {student.skills.slice(0, 5).map((skill) => (
          <span className="feature-chip" key={skill}>
            {skill}
          </span>
        ))}
      </div>

      <p>
        <strong>Availability:</strong>{" "}
        {student.availableDays.join(", ") || "Not fully provided"} ·{" "}
        {student.weeklyHours} hrs/week
      </p>

      <p>
        <strong>Evidence:</strong> {student.experiences.length} experience
        items · {student.verifiedServiceHours} verified hours
      </p>

      <section className="match-insight-card compact">
        <div className="match-insight-heading">
          <div>
            <span className="kicker">Transparent shortlist review</span>
            <h4>Why MYIN matched this candidate</h4>
          </div>
          <span className="match-method-badge">
            {match.confidence}% confidence
          </span>
        </div>

        <div className="match-insight-grid">
          <div className="match-insight-panel reasons">
            <strong>Match reasons</strong>
            <ul>
              {insights.reasons.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="match-insight-panel pros">
            <strong>Pros</strong>
            <ul>
              {insights.pros.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="match-insight-panel cons">
            <strong>Considerations</strong>
            <ul>
              {insights.cons.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className="microcopy">
          MYIN explains fit; the organization still performs human review and
          makes every decision.
        </p>
      </section>

      <div className="card-actions">
        <button className="button" onClick={onView}>
          View safe profile
        </button>

        {onRequestIntroduction && (
          <button className="button secondary" onClick={onRequestIntroduction}>
            Request controlled introduction
          </button>
        )}
      </div>
    </article>
  );
}
