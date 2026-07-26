"use client";

import { FormEvent, useEffect, useState } from "react";

interface WeeklyGmailStatus {
  configured: boolean;
  recipient: string;
  sender: string;
  employerName: string;
  focusAreas: string[];
  schedule: string;
  dataMode: string;
  signupMode: string;
  missingCount: number;
}

export function EmailOnlyEmployerSignup() {
  const [status, setStatus] = useState<WeeklyGmailStatus | null>(null);
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/gmail/weekly/status", {
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Status unavailable.");
        return (await response.json()) as WeeklyGmailStatus;
      })
      .then((result) => {
        if (!active) return;
        setStatus(result);
        setOrganizationName(result.employerName);
      })
      .catch(() => {
        if (active) setStatus(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const submitSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/pilot-employer/signup", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          organizationName,
          email,
          consent,
        }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(
          result.error || "The email-only signup could not be completed.",
        );
      }

      setNotice(
        result.message ||
          "Email-only pilot signup confirmed. Check the employer inbox.",
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "The email-only signup could not be completed.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="employer-brief" className="section container">
      <div className="section-heading centered">
        <span className="kicker">Email-only employer pilot</span>
        <h2>Receive community intelligence without creating a full account.</h2>
        <p>
          One pilot employer can confirm its email and receive a
          privacy-safe, employer-specific talent briefing every week.
        </p>
      </div>

      <div className="two-panel-grid align-start">
        <article className="panel-card">
          <span className="kicker">What arrives weekly</span>
          <h2>The strongest relevant signals—not a generic candidate dump.</h2>
          <p>
            MYIN filters the demo cohort around the employer’s focus,
            selects each student only once, and uses that student’s
            strongest relevant pathway.
          </p>

          <div className="chip-row">
            {(status?.focusAreas || [
              "Technology",
              "Robotics",
              "Engineering",
            ]).map((focusArea) => (
              <span className="feature-chip" key={focusArea}>
                {focusArea}
              </span>
            ))}
          </div>

          <div className="notice">
            {status?.configured
              ? `Pilot delivery is configured from ${status.sender} to ${status.recipient}.`
              : "Server-side pilot delivery is not configured in this environment yet."}
          </div>

          <p className="microcopy">
            Hackathon scope: one preconfigured test employer, one
            central MYIN Gmail sender, and synthetic demo data. A
            production signup list would require persistent database
            storage and unsubscribe controls.
          </p>
        </article>

        <form className="panel-card form-stack" onSubmit={submitSignup}>
          <div>
            <span className="kicker">Quick signup</span>
            <h2>Confirm the pilot employer.</h2>
          </div>

          <label>
            Organization name
            <input
              type="text"
              value={organizationName}
              onChange={(event) =>
                setOrganizationName(event.target.value)
              }
              placeholder="Crescent Robotics"
              maxLength={80}
              required
            />
          </label>

          <label>
            Employer email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Use the configured test-employer email"
              required
            />
          </label>

          <label className="check-chip">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            I consent to receive the weekly MYIN pilot briefing.
          </label>

          <button
            className="button full"
            type="submit"
            disabled={!status?.configured || submitting}
          >
            {submitting
              ? "Sending confirmation…"
              : "Confirm email-only signup"}
          </button>

          {notice && (
            <div
              className={
                notice.toLowerCase().includes("confirmed")
                  ? "notice success"
                  : "notice warning"
              }
            >
              {notice}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
