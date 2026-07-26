"use client";

import { useMemo, useState } from "react";
import { calculateMatch } from "@/lib/matching";
import { seedState } from "@/lib/seed";

export function EthicsAudit() {
  const [showIdentity, setShowIdentity] = useState(false);
  const [opportunityIndex, setOpportunityIndex] = useState(0);
  const state = useMemo(() => seedState(), []);
  const opportunity = state.opportunities[opportunityIndex];
  const base = state.students[0];
  const profileA = { ...base, name: "Synthetic Student A" };
  const profileB = { ...base, name: "Synthetic Student B" };
  const a = calculateMatch(profileA, opportunity);
  const b = calculateMatch(profileB, opportunity);

  return (
    <div className="audit-panel">
      <div className="audit-controls">
        <label>Test opportunity
          <select value={opportunityIndex} onChange={(event) => setOpportunityIndex(Number(event.target.value))}>
            {state.opportunities.slice(0, 4).map((item, index) => <option value={index} key={item.id}>{item.title}</option>)}
          </select>
        </label>
        <button className="button ghost" onClick={() => setShowIdentity((value) => !value)}>{showIdentity ? "Hide identity" : "Reveal synthetic labels"}</button>
      </div>
      <div className="audit-comparison">
        {[{ label: showIdentity ? profileA.name : "Candidate ••A", result: a }, { label: showIdentity ? profileB.name : "Candidate ••B", result: b }].map(({ label, result }) => (
          <article key={label}>
            <span className="safe-avatar">{showIdentity ? label.split(" ").map((part) => part[0]).join("").slice(0,2) : "••"}</span>
            <h3>{label}</h3>
            <strong className="audit-score">{result.total}%</strong>
            <p>Same skills, goals, schedule, eligibility, and location inputs.</p>
          </article>
        ))}
      </div>
      <div className={`notice ${a.total === b.total ? "success" : "warning"}`}>
        {a.total === b.total ? "Pass: changing only the synthetic identity label did not change the deterministic score." : "Audit warning: the scores differ and should be investigated."}
      </div>
      <p className="microcopy">This narrow test does not prove the whole product is bias-free. It demonstrates one auditable property: fields outside the published rubric do not enter this score.</p>
    </div>
  );
}
