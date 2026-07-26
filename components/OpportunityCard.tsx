"use client";

import type { MatchResult, Opportunity } from "@/lib/types";
import { daysUntil, formatDate } from "@/lib/utils";

export function OpportunityCard({
  opportunity,
  match,
  saved,
  applied,
  onView,
  onSave,
  onInterest,
  onDismiss,
  onDraftEmail,
}: {
  opportunity: Opportunity;
  match: MatchResult;
  saved: boolean;
  applied: boolean;
  onView: () => void;
  onSave: () => void;
  onInterest: () => void;
  onDismiss: () => void;
  onDraftEmail: () => void;
}) {
  const ethicalCount = Object.values(opportunity.safetySignals).filter(Boolean).length;
  const deadlineDays = daysUntil(opportunity.deadline);
  return (
    <article className="opportunity-card">
      <div className="opportunity-score" aria-label={`${match.total}% match`}>
        <strong>{match.total}</strong><span>% match</span>
      </div>
      <div className="opportunity-content">
        <div className="opportunity-heading">
          <div>
            <div className="eyebrow-row">
              <span>{opportunity.type}</span>
              <span>{opportunity.format}</span>
              <span>{opportunity.paid ? "Paid" : "Unpaid"}</span>
              {opportunity.urgent && <span className="urgent-chip">Immediate</span>}
            </div>
            <h3>{opportunity.title}</h3>
            <p className="muted">{opportunity.orgName} · {opportunity.location} · {opportunity.distanceMiles.toFixed(1)} miles</p>
          </div>
          <span className={`confidence-pill ${match.confidence >= 85 ? "high" : match.confidence >= 65 ? "medium" : "low"}`}>{match.confidence}% confidence</span>
        </div>
        <p>{opportunity.description}</p>
        <div className="match-summary">
          <strong>{match.connectionLens}</strong>
          <span>{match.explanations[0]}</span>
        </div>
        <div className="chip-row">
          {opportunity.prayerSpace && <span className="feature-chip">Prayer space</span>}
          {opportunity.prayerBreaks && <span className="feature-chip">Flexible prayer breaks</span>}
          {opportunity.jummahCompatible && <span className="feature-chip">Jumu’ah compatible</span>}
          {opportunity.halalFood && <span className="feature-chip">Halal food</span>}
          <span className="feature-chip">{ethicalCount}/6 ethical-fit signals disclosed</span>
        </div>
        <div className="opportunity-meta">
          <span><strong>Deadline:</strong> {formatDate(opportunity.deadline)} {deadlineDays <= 7 && deadlineDays >= 0 ? `(${deadlineDays} days)` : ""}</span>
          <span><strong>Commitment:</strong> {opportunity.commitment}</span>
          <span><strong>Compensation:</strong> {opportunity.compensation}</span>
        </div>
        {match.cautions.length > 0 && <div className="notice warning">{match.cautions[0]}</div>}
        <div className="card-actions">
          <button className="button" onClick={onView}>View opportunity</button>
          <button className="button secondary" onClick={onDraftEmail}>Draft email</button>
          <button className="button ghost" onClick={onSave}>{saved ? "Saved" : "Save"}</button>
          <button className="button ghost" onClick={onInterest} disabled={applied}>{applied ? "Interest sent" : "I’m interested"}</button>
          <button className="text-button" onClick={onDismiss}>Not interested</button>
        </div>
      </div>
    </article>
  );
}
