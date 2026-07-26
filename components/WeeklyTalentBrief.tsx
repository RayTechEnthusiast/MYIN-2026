"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateMatch } from "@/lib/matching";
import { buildOrganizationCandidateInsights } from "@/lib/match-insights";
import type { Opportunity, StudentProfile } from "@/lib/types";
import { initials } from "@/lib/utils";

export interface TalentBriefCandidate {
  student: StudentProfile;
  opportunity: Opportunity;
  score: number;
  interested: boolean;
}

interface WeeklyGmailStatus {
  configured: boolean;
  recipient: string;
  sender: string;
  employerName: string;
  schedule: string;
  dataMode: string;
  missingCount: number;
}

export function WeeklyTalentBrief({
  candidates,
  organizationName,
  organizationEmail,
}: {
  candidates: TalentBriefCandidate[];
  organizationName: string;
  organizationEmail: string;
}) {
  const topCandidates = useMemo(() => candidates.slice(0, 3), [candidates]);
  const [draft, setDraft] = useState("");
  const [recipient, setRecipient] = useState(organizationEmail);
  const [notice, setNotice] = useState("");
  const [gmailStatus, setGmailStatus] =
    useState<WeeklyGmailStatus | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/gmail/weekly/status", {
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Status unavailable.");
        return (await response.json()) as WeeklyGmailStatus;
      })
      .then((status) => {
        if (active) setGmailStatus(status);
      })
      .catch(() => {
        if (active) setGmailStatus(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const generateBrief = () => {
    if (!topCandidates.length) {
      setDraft("");
      setNotice(
        "No candidates currently meet the 70% visibility threshold.",
      );
      return;
    }

    const candidateSections = topCandidates.flatMap((row, index) => {
      const match = calculateMatch(row.student, row.opportunity);
      const insights = buildOrganizationCandidateInsights(
        row.student,
        row.opportunity,
        match,
        row.interested,
      );

      return [
        `${index + 1}. Candidate ${initials(row.student.name)} — ${
          match.total
        }% match`,
        `Opportunity: ${row.opportunity.title}`,
        `Why matched: ${insights.reasons.join(" ")}`,
        `Pros: ${insights.pros.join(" ")}`,
        `Considerations: ${insights.cons.join(" ")}`,
        `Confidence: ${match.confidence}%`,
        "",
      ];
    });

    const subject = `MYIN Weekly Talent Brief — ${
      topCandidates.length
    } strong candidate${topCandidates.length === 1 ? "" : "s"}`;

    setDraft(
      [
        `Subject: ${subject}`,
        "",
        `Assalamu alaikum ${organizationName} team,`,
        "",
        `MYIN identified ${topCandidates.length} privacy-safe candidate match${
          topCandidates.length === 1 ? "" : "es"
        } for review this week.`,
        "",
        ...candidateSections,
        "These are explainable recommendations, not hiring decisions. Review each privacy-safe profile before requesting a controlled introduction.",
        "",
        "This editable browser preview has not been sent. The separate server-side pilot sends its own scheduled demo brief.",
        "",
        "Jazakum Allahu khayran,",
        "MYIN",
      ].join("\n"),
    );

    setRecipient(organizationEmail);
    setNotice(
      "Brief generated from the same transparent rankings shown on the candidate cards.",
    );
  };

  const openInEmail = () => {
    if (!recipient.trim()) {
      setNotice("Add the organization email address first.");
      return;
    }

    if (!draft.trim()) {
      setNotice("Generate the weekly talent brief first.");
      return;
    }

    const lines = draft.split("\n");
    const subjectMatch = lines[0]?.match(/^Subject:\s*(.*)$/i);
    const subject =
      subjectMatch?.[1]?.trim() || "MYIN Weekly Talent Brief";
    const body = subjectMatch
      ? lines.slice(1).join("\n").trimStart()
      : draft;

    window.location.href =
      `mailto:${encodeURIComponent(recipient.trim())}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    setNotice(
      "Your email app was opened. This browser draft was not sent automatically.",
    );
  };

  const copyBrief = async () => {
    if (!draft.trim()) {
      setNotice("Generate the weekly talent brief first.");
      return;
    }

    await navigator.clipboard.writeText(draft);
    setNotice("Weekly talent brief copied. Nothing was sent.");
  };

  return (
    <section className="weekly-brief-shell">
      <div className="two-panel-grid align-start">
        <div className="panel-card">
          <span className="kicker">Weekly talent brief</span>
          <h2>Turn the strongest matches into a reviewable digest.</h2>
          <p>
            MYIN summarizes up to three privacy-safe candidates, including
            match reasons, pros, considerations, and confidence.
          </p>

          <div className="card-actions">
            <button className="button" onClick={generateBrief}>
              Generate weekly brief
            </button>

            <button
              className="button secondary"
              onClick={() => {
                setDraft("");
                setNotice("");
              }}
              disabled={!draft}
            >
              Clear brief
            </button>
          </div>
        </div>

        <div className="panel-card">
          <span className="kicker">This week’s shortlist</span>
          <h2>
            {topCandidates.length
              ? `${topCandidates.length} candidates ready`
              : "No candidates ready"}
          </h2>

          {topCandidates.map((row) => (
            <div
              className="candidate-mini"
              key={`${row.student.id}-${row.opportunity.id}`}
            >
              <span className="safe-avatar">
                {initials(row.student.name)}
              </span>
              <div>
                <strong>
                  {row.interested
                    ? "Interested candidate"
                    : `Candidate ${initials(row.student.name)}`}
                </strong>
                <small>{row.opportunity.title}</small>
              </div>
              <span className="score-badge">{row.score}%</span>
            </div>
          ))}

          {!topCandidates.length && (
            <p className="muted">
              Publish or strengthen an opportunity to create a shortlist.
            </p>
          )}
        </div>
      </div>

      <section className="panel-card">
        <div className="panel-heading">
          <div>
            <span className="kicker">Email-only pilot employer</span>
            <h2>
              {gmailStatus?.configured
                ? "Automatic weekly Gmail delivery is configured."
                : "Weekly Gmail delivery is not configured here yet."}
            </h2>
          </div>

          <span
            className={
              gmailStatus?.configured
                ? "confidence-pill high"
                : "confidence-pill medium"
            }
          >
            {gmailStatus?.configured ? "Pilot active" : "Setup pending"}
          </span>
        </div>

        {gmailStatus?.configured ? (
          <>
            <p>
              MYIN is configured to send a server-generated weekly talent and
              opportunity-intelligence brief from {gmailStatus.sender} to{" "}
              {gmailStatus.recipient}.
            </p>
            <div className="chip-row">
              <span className="feature-chip">{gmailStatus.schedule}</span>
              <span className="feature-chip">{gmailStatus.dataMode}</span>
            </div>
            <p className="microcopy">
              The pilot uses one central MYIN Gmail sender. Employers only
              receive the email; they do not need to connect Gmail. Website
              communication remains inside MYIN.
            </p>
          </>
        ) : (
          <p className="muted">
            The existing Open in email app and Copy brief options still work.
            Server credentials must be added before automatic delivery becomes
            active.
          </p>
        )}
      </section>

      {draft && (
        <section className="panel-card form-stack">
          <div>
            <span className="kicker">Consent-first email preview</span>
            <h2>Review before opening your email app.</h2>
          </div>

          <label>
            Organization email
            <input
              type="email"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              placeholder="organization@example.org"
            />
          </label>

          <textarea
            className="email-editor"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />

          <div className="notice">
            This editable browser draft does not send automatically. The
            separate pilot schedule uses a protected server endpoint and the
            fixed test-employer address.
          </div>

          <div className="card-actions">
            <button
              className="button"
              onClick={openInEmail}
              disabled={!recipient.trim()}
            >
              Open brief in email app
            </button>

            <button className="button secondary" onClick={copyBrief}>
              Copy brief
            </button>
          </div>
        </section>
      )}

      {notice && <div className="notice">{notice}</div>}
    </section>
  );
}
