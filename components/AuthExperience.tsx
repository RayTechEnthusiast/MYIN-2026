"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "./SiteHeader";
import { useApp } from "./AppProvider";
import type { OutreachLead, Role } from "@/lib/types";
import { id } from "@/lib/utils";

export function AuthExperience() {
  const router = useRouter();
  const { login, createAccount, addOutreachLead } = useApp();
  const [mode, setMode] = useState<"login" | "signup" | "outreach">("login");
  const [role, setRole] = useState<Role>("student");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [research, setResearch] = useState<OutreachLead["researchDraft"] | null>(null);

  useEffect(() => {
    const selected = new URLSearchParams(window.location.search).get("mode");
    if (selected === "signup" || selected === "outreach" || selected === "login") setMode(selected);
  }, []);

  const handleLogin = (formData: FormData) => {
    const result = login(String(formData.get("username") || ""), String(formData.get("password") || ""));
    setMessage(result.message);
    if (result.ok) router.push("/app");
  };

  const handleSignup = (formData: FormData) => {
    const result = createAccount({
      role,
      displayName: String(formData.get("displayName") || ""),
      username: String(formData.get("username") || ""),
      password: String(formData.get("password") || ""),
      email: String(formData.get("email") || ""),
      zip: String(formData.get("zip") || ""),
      age: Number(formData.get("age") || 15),
    });
    setMessage(result.message);
    if (result.ok) router.push("/app");
  };

  const handleOutreach = async (formData: FormData) => {
    setBusy(true);
    setMessage("");
    setResearch(null);
    const businessName = String(formData.get("businessName") || "");
    const website = String(formData.get("website") || "");
    const email = String(formData.get("email") || "");
    const suppliedContent = String(formData.get("suppliedContent") || "");
    try {
      const response = await fetch("/api/org-research", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ businessName, website, email, suppliedContent: suppliedContent || undefined }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Research request failed.");
      const lead: OutreachLead = {
        id: id("lead"),
        businessName,
        website,
        email,
        status: "needs-review",
        researchDraft: data.draft,
      };
      addOutreachLead(lead);
      setResearch(data.draft);
      setMessage(data.warning || "Review draft created. Nothing has been published or emailed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Research request failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="auth-page">
        <section className="auth-intro">
          <span className="kicker">Choose your MYIN path</span>
          <h1>One trusted network. Two sides of the connection.</h1>
          <p>Students find explainable matches. Organizations create safe, reviewable opportunities with less friction.</p>
          <div className="auth-trust-grid">
            <span>Browser-local demo accounts</span>
            <span>Server-only Gemini key</span>
            <span>No unrestricted adult-to-minor messaging</span>
            <span>Human review before publishing</span>
          </div>
        </section>

        <section className="auth-card">
          <div className="segmented-control">
            <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Log in</button>
            <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Create account</button>
            <button className={mode === "outreach" ? "active" : ""} onClick={() => setMode("outreach")}>Email-only org start</button>
          </div>

          {mode === "login" && (
            <form action={handleLogin} className="form-stack">
              <div className="demo-credentials">
                <button type="button" onClick={() => { const u = document.querySelector<HTMLInputElement>('#login-user'); const p = document.querySelector<HTMLInputElement>('#login-pass'); if (u && p) { u.value = 'amina_test'; p.value = 'demo123'; } }}>
                  Student demo: <strong>amina_test</strong> / demo123
                </button>
                <button type="button" onClick={() => { const u = document.querySelector<HTMLInputElement>('#login-user'); const p = document.querySelector<HTMLInputElement>('#login-pass'); if (u && p) { u.value = 'org_test'; p.value = 'demo123'; } }}>
                  Organization demo: <strong>org_test</strong> / demo123
                </button>
              </div>
              <label>Username<input id="login-user" name="username" autoComplete="username" required /></label>
              <label>Password<input id="login-pass" name="password" type="password" autoComplete="current-password" required /></label>
              <button className="button full" type="submit">Log in to MYIN</button>
              <p className="microcopy">Hackathon demo authentication only. Credentials and accounts are stored in this browser, not in a production identity system.</p>
            </form>
          )}

          {mode === "signup" && (
            <form action={handleSignup} className="form-stack">
              <div className="role-picker">
                <button type="button" className={role === "student" ? "active" : ""} onClick={() => setRole("student")}>I’m a student</button>
                <button type="button" className={role === "organization" ? "active" : ""} onClick={() => setRole("organization")}>I represent an organization</button>
              </div>
              <label>{role === "student" ? "Your name" : "Organization name"}<input name="displayName" required /></label>
              <div className="two-column-fields">
                <label>Username<input name="username" required /></label>
                <label>Password<input name="password" type="password" required /></label>
              </div>
              {role === "student" ? (
                <div className="two-column-fields">
                  <label>Age<input name="age" type="number" min="13" max="24" defaultValue="15" required /></label>
                  <label>ZIP code<input name="zip" inputMode="numeric" pattern="[0-9]{5}" /></label>
                </div>
              ) : <label>Organization email<input name="email" type="email" /></label>}
              <button className="button full" type="submit">Create {role} demo account</button>
              <p className="microcopy">New accounts display the name entered here. The onboarding profile can be expanded after account creation.</p>
            </form>
          )}

          {mode === "outreach" && (
            <div>
              <form action={handleOutreach} className="form-stack">
                <div className="notice">Start with a name, public website, and email. MYIN reviews one relevant public page or content you supply—never a broad or aggressive crawler.</div>
                <label>Business or organization name<input name="businessName" required /></label>
                <label>Public website<input name="website" type="url" placeholder="https://example.org" required /></label>
                <label>Email<input name="email" type="email" required /></label>
                <label>Optional content to analyze<textarea name="suppliedContent" rows={4} placeholder="Paste an About page or program description when automated access is unavailable." /></label>
                <button className="button full" type="submit" disabled={busy}>{busy ? "Creating review draft…" : "Create organization review draft"}</button>
              </form>
              {research && (
                <div className="research-preview">
                  <h3>{research.name}</h3>
                  <p>{research.mission || "Mission not found."}</p>
                  <p><strong>Confidence:</strong> {Math.round((research.confidence || 0) * 100)}%</p>
                  <p><strong>Missing before youth visibility:</strong> {(research.missingFields || []).join(", ") || "No missing fields reported—still requires human confirmation."}</p>
                </div>
              )}
            </div>
          )}

          {message && <div className="notice">{message}</div>}
        </section>
      </main>
    </>
  );
}
