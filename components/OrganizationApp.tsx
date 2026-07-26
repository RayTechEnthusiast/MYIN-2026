"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "./AppShell";
import { Modal } from "./Modal";
import { CandidateMatchCard } from "./CandidateMatchCard";
import { WeeklyTalentBrief } from "./WeeklyTalentBrief";
import { useApp } from "./AppProvider";
import { calculateMatch } from "@/lib/matching";
import type { Opportunity, OrganizationProfile, OutreachLead, StudentProfile } from "@/lib/types";
import { formatDate, id, initials, splitList } from "@/lib/utils";

const tabs = ["Overview", "Opportunities", "Candidates", "Messages", "Organization Profile", "Website Research"];

const emptyDraft = {
  title: "",
  type: "Volunteer",
  description: "",
  skills: [] as string[],
  interests: [] as string[],
  careerGoals: [] as string[],
  location: "",
  zip: "",
  format: "In person",
  availableDays: [] as string[],
  commitment: "",
  weeklyHours: 0,
  ageMin: 14,
  ageMax: 18,
  experienceLevel: "Beginner",
  deadline: "",
  paid: false,
  compensation: "",
  urgent: false,
  prayerBreaks: false,
  prayerSpace: false,
  halalFood: false,
  jummahCompatible: false,
  supervision: "",
  applicationSteps: "",
  impact: "",
  missingFields: [] as string[],
  confidence: 0.5,
};

type Draft = typeof emptyDraft;

export function OrganizationApp() {
  const {
    state,
    currentOrganization,
    updateOrganization,
    publishOpportunity,
    requestIntroduction,
    sendMessage,
    addOutreachLead,
    updateOutreachLead,
  } = useApp();
  const [active, setActive] = useState("Overview");
  const [roughText, setRoughText] = useState("");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [extractMode, setExtractMode] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<{ student: StudentProfile; opportunity: Opportunity } | null>(null);
  const [orgDraft, setOrgDraft] = useState<OrganizationProfile | null>(currentOrganization);
  const [messageInput, setMessageInput] = useState("");
  const [messageNotice, setMessageNotice] = useState("");
  const [onboardingMode, setOnboardingMode] = useState(false);
  const [outreach, setOutreach] = useState({ businessName: "", website: "", email: "", suppliedContent: "" });

  useEffect(() => {
    if (!currentOrganization) return;

    setOutreach((current) => ({
      businessName: current.businessName || currentOrganization.name,
      website: current.website || currentOrganization.website,
      email: current.email || currentOrganization.email,
      suppliedContent: current.suppliedContent,
    }));

    const params = new URLSearchParams(window.location.search);
    if (params.get("onboarding") === "website-research") {
      setActive("Website Research");
      setOnboardingMode(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [currentOrganization?.id]);

  if (!currentOrganization) return <div className="loading-screen">Organization profile not found.</div>;
  const organization = currentOrganization;
  const profileNeedsImport = !organization.website || !organization.mission;
  if (!orgDraft || orgDraft.id !== organization.id) setOrgDraft(organization);

  const ownOpportunities = state.opportunities.filter((item) => item.orgId === organization.id);
  const orgInterests = state.interests.filter((interest) => interest.organizationId === organization.id);
  const conversations = state.conversations.filter((conversation) => conversation.organizationId === organization.id);
  const researchDrafts = state.outreachLeads.filter((lead) =>
    (organization.email &&
      lead.email.toLowerCase() === organization.email.toLowerCase()) ||
    lead.businessName.toLowerCase() === organization.name.toLowerCase(),
  );

  const candidateRows = useMemo(() => {
    const rows: { student: StudentProfile; opportunity: Opportunity; score: number; interestId?: string; interested: boolean }[] = [];
    for (const opportunity of ownOpportunities) {
      for (const student of state.students.filter((item) => item.discoverable)) {
        const match = calculateMatch(student, opportunity);
        if (match.total < 70) continue;
        const interest = orgInterests.find((item) => item.studentId === student.id && item.opportunityId === opportunity.id);
        rows.push({ student, opportunity, score: match.total, interestId: interest?.id, interested: Boolean(interest) });
      }
    }
    return rows.sort((a, b) => Number(b.interested) - Number(a.interested) || b.score - a.score);
  }, [ownOpportunities, state.students, orgInterests]);

  const stats = {
    open: ownOpportunities.filter((item) => item.status === "open").length,
    interested: orgInterests.length,
    paid: ownOpportunities.filter((item) => item.paid).length,
    unpaid: ownOpportunities.filter((item) => !item.paid).length,
    strongCandidates: candidateRows.filter((item) => item.score >= 85).length,
  };

  const extractOpportunity = async () => {
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/opportunity-extract", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ description: roughText }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Extraction failed.");
      setDraft({ ...emptyDraft, ...data.draft });
      setExtractMode(data.mode);
      setNotice(data.warning || `Created a ${data.mode === "gemini" ? "Gemini" : "local fallback"} review draft. Every field remains editable.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Extraction failed."); }
    finally { setBusy(false); }
  };

  const publish = () => {
    const requiredMissing = [!draft.title && "title", !draft.description && "description", !draft.location && "location", !draft.supervision && "supervision", !draft.deadline && "deadline"].filter(Boolean) as string[];
    if (requiredMissing.length) { setNotice(`Complete required fields before youth visibility: ${requiredMissing.join(", ")}.`); return; }
    const opportunity: Opportunity = {
      id: id("opp"),
      orgId: organization.id,
      orgName: organization.name,
      title: draft.title,
      type: draft.type as Opportunity["type"],
      description: draft.description,
      skills: draft.skills,
      interests: draft.interests,
      careerGoals: draft.careerGoals,
      location: draft.location,
      zip: draft.zip,
      latitude: 39.08,
      longitude: -77.15,
      distanceMiles: 7.5,
      format: draft.format as Opportunity["format"],
      availableDays: draft.availableDays,
      commitment: draft.commitment,
      weeklyHours: draft.weeklyHours,
      ageMin: draft.ageMin,
      ageMax: draft.ageMax,
      experienceLevel: draft.experienceLevel as Opportunity["experienceLevel"],
      deadline: draft.deadline,
      createdAt: new Date().toISOString(),
      paid: draft.paid,
      compensation: draft.compensation,
      urgent: draft.urgent,
      prayerBreaks: draft.prayerBreaks,
      prayerSpace: draft.prayerSpace,
      halalFood: draft.halalFood,
      jummahCompatible: draft.jummahCompatible,
      supervision: draft.supervision,
      applicationSteps: draft.applicationSteps,
      impact: draft.impact,
      verified: organization.verified,
      status: "open",
      confidence: draft.confidence,
      missingFields: draft.missingFields,
      safetySignals: {
        adultSupervision: Boolean(draft.supervision),
        privacyPolicy: Boolean(organization.privacyStandards),
        accessibility: /access|accommodation/i.test(organization.accommodations),
        accommodationClarity: draft.prayerBreaks || draft.prayerSpace || draft.halalFood || draft.jummahCompatible,
        communityTrust: organization.verified,
        missionAlignment: Boolean(organization.mission),
      },
    };
    publishOpportunity(opportunity);
    setNotice("Opportunity published to the local demo. It is immediately available for deterministic student matching.");
    setDraft(emptyDraft); setRoughText(""); setExtractMode("");
  };

  const sendOrgMessage = async (conversationId: string) => {
    if (!messageInput.trim()) return;
    setBusy(true); setMessageNotice("");
    try {
      const response = await fetch("/api/moderate-message", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: messageInput, senderRole: "organization" }) });
      const data = await response.json();
      if (data.status === "flagged") { setMessageNotice(`${data.reason} ${data.suggestion}`); return; }
      sendMessage(conversationId, "organization", organization.name, messageInput, "clear"); setMessageInput(""); setMessageNotice(data.note || "Message added to the controlled conversation.");
    } finally { setBusy(false); }
  };

  const researchOutreach = async () => {
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/org-research", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(outreach) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Research failed.");
      const lead: OutreachLead = { id: id("lead"), businessName: outreach.businessName, website: outreach.website, email: outreach.email, status: "needs-review", researchDraft: data.draft };
      addOutreachLead(lead);
      setNotice(data.warning || "Reviewable organization draft created. Nothing was published or emailed.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Research failed."); }
    finally { setBusy(false); }
  };

  const applyResearchToOrganization = (lead: OutreachLead) => {
    const researched = lead.researchDraft;

    const nextProfile: OrganizationProfile = {
      ...organization,
      name: researched?.name?.trim() || organization.name,
      website: lead.website || organization.website,
      email: lead.email || organization.email,
      mission: researched?.mission?.trim() || organization.mission,
      programs: researched?.programs?.length
        ? researched.programs
        : organization.programs,
      audience: researched?.audience?.length
        ? researched.audience
        : organization.audience,
      location: researched?.location?.trim() || organization.location,
      contactName:
        researched?.contactName?.trim() || organization.contactName,
      youthSafety:
        researched?.youthSafety?.trim() || organization.youthSafety,
      privacyStandards:
        researched?.privacyStandards?.trim() ||
        organization.privacyStandards,
      accommodations:
        researched?.accommodations?.trim() ||
        organization.accommodations,
      lastUpdated: new Date().toISOString(),
    };

    updateOrganization(nextProfile);
    setOrgDraft(nextProfile);
    updateOutreachLead({ ...lead, status: "confirmed" });
    setOnboardingMode(false);
    setNotice(
      "Website research was applied to your organization profile. Review and edit any remaining fields before publishing opportunities.",
    );
    setActive("Organization Profile");
  };

  return (
    <AppShell tabs={tabs} active={active} onTab={setActive}>
      {active === "Overview" && (
        <div className="dashboard-stack">
          <header className="app-page-header"><div><span className="kicker">Organization command center</span><h1>{organization.name}</h1><p>Publish safer opportunities, understand candidate fit, and reduce recruiting friction without exposing unnecessary student information.</p></div><button className="button" onClick={() => setActive("Opportunities")}>Create opportunity</button></header>
          <section className="recommended-action">
            <div>
              <span className="kicker">Best recommended action</span>
              <h2>
                {profileNeedsImport
                  ? "Import your organization information"
                  : orgInterests.length
                    ? "Review a student-initiated interest signal"
                    : ownOpportunities.length
                      ? "Improve listing confidence"
                      : "Publish your first opportunity"}
              </h2>
              <p>
                {profileNeedsImport
                  ? "Paste one public website link. MYIN retrieves available organization details, structures them with Gemini, and leaves every field reviewable."
                  : orgInterests.length
                    ? `${orgInterests.length} student interest signal${orgInterests.length === 1 ? "" : "s"} can now move into a controlled introduction.`
                    : ownOpportunities.length
                      ? "Clear missing safety and accommodation fields to improve trust and match confidence."
                      : "Paste a rough announcement. AI will structure it into an editable review draft."}
              </p>
            </div>
            <button
              className="button secondary"
              onClick={() =>
                setActive(
                  profileNeedsImport
                    ? "Website Research"
                    : orgInterests.length
                      ? "Candidates"
                      : "Opportunities",
                )
              }
            >
              {profileNeedsImport ? "Import from website" : "Take action"}
            </button>
          </section>
          <div className="metric-grid"><article><span>Open opportunities</span><strong>{stats.open}</strong><small>Published in the local demo</small></article><article><span>Student interest</span><strong>{stats.interested}</strong><small>Student-controlled first signal</small></article><article><span>Strong candidates</span><strong>{stats.strongCandidates}</strong><small>85%+ deterministic fit</small></article><article><span>Paid / unpaid</span><strong>{stats.paid} / {stats.unpaid}</strong><small>Compensation is visible before applying</small></article></div>
          <div className="two-panel-grid"><section className="panel-card"><span className="kicker">Candidate pipeline</span><h2>Fit before identity</h2>{candidateRows.slice(0,3).map((row) => <div className="candidate-mini" key={`${row.student.id}-${row.opportunity.id}`}><span className="safe-avatar">{initials(row.student.name)}</span><div><strong>{row.interested ? "Interested candidate" : "Discoverable candidate"}</strong><small>{row.opportunity.title}</small></div><span className="score-badge">{row.score}%</span></div>)}{candidateRows.length === 0 && <p className="muted">No candidates above 70% yet.</p>}</section><section className="panel-card"><span className="kicker">Trust readiness</span><h2>Organization profile signals</h2>{[['Mission',organization.mission],['Youth safety',organization.youthSafety],['Privacy',organization.privacyStandards],['Accommodations',organization.accommodations]].map(([label,value]) => <div className="readiness-row" key={label}><span>{label}</span><strong>{value ? "Disclosed" : "Missing"}</strong></div>)}<button className="button ghost" onClick={() => setActive("Organization Profile")}>Strengthen organization profile</button></section></div>
        </div>
      )}

      {active === "Opportunities" && (
        <div className="dashboard-stack">
          <header className="app-page-header"><div><span className="kicker">Low-friction opportunity creation</span><h1>Start rough. Publish only after review.</h1><p>Gemini structures the announcement; the organization confirms every youth-facing detail.</p></div></header>
          <section className="two-panel-grid align-start">
            <div className="panel-card"><h2>1. Paste a rough opportunity</h2><textarea className="large-textarea" value={roughText} onChange={(e) => setRoughText(e.target.value)} placeholder="Example: We need youth volunteers next Saturday to help with a food drive. We need a photographer and someone who can make a social-media flyer. Adult coordinators will be present…" /><button className="button full" onClick={extractOpportunity} disabled={busy || roughText.trim().length < 20}>{busy ? "Creating review draft…" : "Extract opportunity details"}</button><p className="microcopy">If Gemini is unavailable, MYIN preserves the original text and creates a limited local draft—never an unrelated fake listing.</p></div>
            <div className="panel-card"><h2>2. Review AI confidence</h2><div className="score-hero small"><strong>{Math.round(draft.confidence * 100)}%</strong><span>extraction confidence</span></div><p><strong>Mode:</strong> {extractMode || "No extraction yet"}</p><p><strong>Missing or uncertain:</strong> {draft.missingFields.length ? draft.missingFields.join(", ") : "No extraction result yet. Human review remains required."}</p><div className="notice warning">Confidence measures extraction completeness—not truth, safety, or moral quality.</div></div>
          </section>
          <section className="panel-card profile-form"><h2>3. Editable publication review</h2><div className="form-grid two"><label>Title<input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label><label>Type<select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}><option>Internship</option><option>Volunteer</option><option>Mentorship</option><option>Community Project</option></select></label><label className="full-span">Description<textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label><label>Skills<textarea value={draft.skills.join(", ")} onChange={(e) => setDraft({ ...draft, skills: splitList(e.target.value) })} /></label><label>Interests<textarea value={draft.interests.join(", ")} onChange={(e) => setDraft({ ...draft, interests: splitList(e.target.value) })} /></label><label>Career goals supported<textarea value={draft.careerGoals.join(", ")} onChange={(e) => setDraft({ ...draft, careerGoals: splitList(e.target.value) })} /></label><label>Available days<textarea value={draft.availableDays.join(", ")} onChange={(e) => setDraft({ ...draft, availableDays: splitList(e.target.value) })} /></label><label>Location<input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} /></label><label>ZIP<input value={draft.zip} onChange={(e) => setDraft({ ...draft, zip: e.target.value })} /></label><label>Format<select value={draft.format} onChange={(e) => setDraft({ ...draft, format: e.target.value })}><option>Remote</option><option>Hybrid</option><option>In person</option></select></label><label>Commitment<input value={draft.commitment} onChange={(e) => setDraft({ ...draft, commitment: e.target.value })} /></label><label>Weekly hours<input type="number" value={draft.weeklyHours} onChange={(e) => setDraft({ ...draft, weeklyHours: Number(e.target.value) })} /></label><label>Age minimum<input type="number" value={draft.ageMin} onChange={(e) => setDraft({ ...draft, ageMin: Number(e.target.value) })} /></label><label>Age maximum<input type="number" value={draft.ageMax} onChange={(e) => setDraft({ ...draft, ageMax: Number(e.target.value) })} /></label><label>Experience level<select value={draft.experienceLevel} onChange={(e) => setDraft({ ...draft, experienceLevel: e.target.value })}><option>Beginner</option><option>Developing</option><option>Experienced</option></select></label><label>Deadline<input type="date" value={draft.deadline} onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} /></label><label>Compensation<input value={draft.compensation} onChange={(e) => setDraft({ ...draft, compensation: e.target.value })} /></label><label>Supervision <span className="required-label">required</span><textarea value={draft.supervision} onChange={(e) => setDraft({ ...draft, supervision: e.target.value })} /></label><label>Application steps<textarea value={draft.applicationSteps} onChange={(e) => setDraft({ ...draft, applicationSteps: e.target.value })} /></label><label>Community impact<textarea value={draft.impact} onChange={(e) => setDraft({ ...draft, impact: e.target.value })} /></label></div><div className="form-grid three"><label className="toggle-label"><input type="checkbox" checked={draft.paid} onChange={(e) => setDraft({ ...draft, paid: e.target.checked })} />Paid opportunity</label><label className="toggle-label"><input type="checkbox" checked={draft.urgent} onChange={(e) => setDraft({ ...draft, urgent: e.target.checked })} />Immediate / urgent</label><label className="toggle-label"><input type="checkbox" checked={draft.prayerBreaks} onChange={(e) => setDraft({ ...draft, prayerBreaks: e.target.checked })} />Flexible prayer breaks</label><label className="toggle-label"><input type="checkbox" checked={draft.prayerSpace} onChange={(e) => setDraft({ ...draft, prayerSpace: e.target.checked })} />Prayer space</label><label className="toggle-label"><input type="checkbox" checked={draft.halalFood} onChange={(e) => setDraft({ ...draft, halalFood: e.target.checked })} />Halal food</label><label className="toggle-label"><input type="checkbox" checked={draft.jummahCompatible} onChange={(e) => setDraft({ ...draft, jummahCompatible: e.target.checked })} />Jumu’ah compatible</label></div><button className="button" onClick={publish}>Confirm & publish to demo</button></section>
          <section className="panel-card"><h2>Published opportunities</h2>{ownOpportunities.map((item) => <div className="published-row" key={item.id}><div><strong>{item.title}</strong><span>{item.type} · {item.format} · {item.paid ? "Paid" : "Unpaid"}</span></div><div><span>{Math.round(item.confidence*100)}% confidence</span><strong>{formatDate(item.deadline)}</strong></div></div>)}</section>
          {notice && <div className="notice">{notice}</div>}
        </div>
      )}

      {active === "Candidates" && (
        <div className="dashboard-stack">
          <header className="app-page-header"><div><span className="kicker">Privacy-safe candidate view</span><h1>Evaluate fit before requesting identity.</h1><p>Only fictional demo profiles are used. Initials, skills, evidence, and availability appear before controlled introduction.</p></div></header>
          <WeeklyTalentBrief
            candidates={candidateRows}
            organizationName={organization.name}
            organizationEmail={organization.email}
          />
          {candidateRows.length ? (
            <div className="candidate-grid">
              {candidateRows.map((row) => (
                <CandidateMatchCard
                  key={`${row.student.id}-${row.opportunity.id}`}
                  student={row.student}
                  opportunity={row.opportunity}
                  interested={row.interested}
                  onView={() =>
                    setSelectedCandidate({
                      student: row.student,
                      opportunity: row.opportunity,
                    })
                  }
                  onRequestIntroduction={
                    row.interestId
                      ? () => requestIntroduction(row.interestId!)
                      : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2>No candidates above 70%.</h2>
              <p>
                Publish a complete opportunity or improve its skills,
                schedule, eligibility, and supervision fields.
              </p>
            </div>
          )}
        </div>
      )}

      {active === "Messages" && (
        <div className="dashboard-stack"><header className="app-page-header"><div><span className="kicker">Controlled organization messaging</span><h1>Reply only after student interest.</h1><p>Private contact requests and unsupervised meeting language are flagged before being added.</p></div></header>{conversations.length === 0 ? <div className="empty-state"><h2>No student-initiated conversations.</h2><p>Organizations cannot open unrestricted conversations with youth profiles.</p></div> : conversations.map((conversation) => { const opportunity = state.opportunities.find((item) => item.id === conversation.opportunityId); const student = state.students.find((item) => item.id === conversation.studentId); return <section className="conversation-card" key={conversation.id}><header><div><h2>{opportunity?.title}</h2><p>Candidate {student ? initials(student.name) : "••"} · {conversation.introductionStatus}</p></div><span className="safe-badge">Student initiated</span></header><div className="message-history">{conversation.messages.map((message) => <article className={message.senderRole === "organization" ? "mine" : "theirs"} key={message.id}><strong>{message.senderLabel}</strong><p>{message.text}</p><small>{new Date(message.createdAt).toLocaleString()}</small></article>)}</div><div className="message-composer"><textarea value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Reply about role details, schedule, supervision, or next controlled steps…" /><button className="button" onClick={() => sendOrgMessage(conversation.id)} disabled={busy}>Review & add reply</button></div>{messageNotice && <div className="notice warning">{messageNotice}</div>}</section>; })}</div>
      )}

      {active === "Organization Profile" && orgDraft && (
        <div className="dashboard-stack"><header className="app-page-header"><div><span className="kicker">Organization trust profile</span><h1>Disclose what youth and guardians need to know.</h1><p>A badge alone is not safety. Clear supervision, privacy, accommodations, and contacts improve trust.</p></div><button className="button" onClick={() => { updateOrganization(orgDraft); setNotice("Organization profile saved in this browser demo."); }}>Save profile</button></header><section className="panel-card profile-form"><div className="form-grid two"><label>Name<input value={orgDraft.name} onChange={(e) => setOrgDraft({ ...orgDraft, name: e.target.value })} /></label><label>Website<input value={orgDraft.website} onChange={(e) => setOrgDraft({ ...orgDraft, website: e.target.value })} /></label><label>Email<input value={orgDraft.email} onChange={(e) => setOrgDraft({ ...orgDraft, email: e.target.value })} /></label><label>Location<input value={orgDraft.location} onChange={(e) => setOrgDraft({ ...orgDraft, location: e.target.value })} /></label><label>Contact name<input value={orgDraft.contactName} onChange={(e) => setOrgDraft({ ...orgDraft, contactName: e.target.value })} /></label><label>Phone / contact process<input value={orgDraft.phone} onChange={(e) => setOrgDraft({ ...orgDraft, phone: e.target.value })} /></label><label className="full-span">Mission<textarea value={orgDraft.mission} onChange={(e) => setOrgDraft({ ...orgDraft, mission: e.target.value })} /></label><label>Programs<textarea value={orgDraft.programs.join(", ")} onChange={(e) => setOrgDraft({ ...orgDraft, programs: splitList(e.target.value) })} /></label><label>Audience<textarea value={orgDraft.audience.join(", ")} onChange={(e) => setOrgDraft({ ...orgDraft, audience: splitList(e.target.value) })} /></label><label>Youth safety<textarea value={orgDraft.youthSafety} onChange={(e) => setOrgDraft({ ...orgDraft, youthSafety: e.target.value })} /></label><label>Privacy standards<textarea value={orgDraft.privacyStandards} onChange={(e) => setOrgDraft({ ...orgDraft, privacyStandards: e.target.value })} /></label><label>Accessibility and accommodations<textarea value={orgDraft.accommodations} onChange={(e) => setOrgDraft({ ...orgDraft, accommodations: e.target.value })} /></label><label className="toggle-label"><input type="checkbox" checked={orgDraft.verified} onChange={(e) => setOrgDraft({ ...orgDraft, verified: e.target.checked })} />Hackathon demo verification badge</label></div><div className="notice warning">The demo badge is fictional. Production verification would require real identity, organization, safeguarding, and human-review processes.</div></section>{notice && <div className="notice">{notice}</div>}</div>
      )}

      {active === "Website Research" && (
        <div className="dashboard-stack">
          <header className="app-page-header">
            <div>
              <span className="kicker">AI website research</span>
              <h1>Paste one link. Start with a nearly complete profile.</h1>
              <p>
                MYIN retrieves one relevant public page, structures available
                information with Gemini, and keeps every field editable before
                it is applied.
              </p>
            </div>
          </header>

          {onboardingMode && (
            <section className="recommended-action">
              <div>
                <span className="kicker">Organization onboarding</span>
                <h2>Import organization information from your website</h2>
                <p>
                  Your organization name and email are already filled in.
                  Add the public website, retrieve available details, then
                  review before applying them to your profile.
                </p>
              </div>
              <button
                className="button secondary"
                onClick={() => {
                  setOnboardingMode(false);
                  setActive("Overview");
                }}
              >
                Skip for now
              </button>
            </section>
          )}

          <section className="two-panel-grid align-start">
            <div className="panel-card form-stack">
              <label>
                Business or organization name
                <input
                  value={outreach.businessName}
                  onChange={(event) =>
                    setOutreach({
                      ...outreach,
                      businessName: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Public website
                <input
                  type="url"
                  value={outreach.website}
                  onChange={(event) =>
                    setOutreach({
                      ...outreach,
                      website: event.target.value,
                    })
                  }
                  placeholder="https://yourorganization.org/about"
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={outreach.email}
                  onChange={(event) =>
                    setOutreach({
                      ...outreach,
                      email: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Optional supplied content
                <textarea
                  value={outreach.suppliedContent}
                  onChange={(event) =>
                    setOutreach({
                      ...outreach,
                      suppliedContent: event.target.value,
                    })
                  }
                  placeholder="Paste an About page or program description only when the public page cannot be retrieved."
                />
              </label>

              <button
                className="button"
                onClick={researchOutreach}
                disabled={
                  busy ||
                  !outreach.businessName.trim() ||
                  !outreach.website.trim() ||
                  !outreach.email.trim()
                }
              >
                {busy
                  ? "Retrieving one public source…"
                  : "Retrieve online information"}
              </button>

              <p className="microcopy">
                MYIN retrieves one public page rather than broadly crawling the
                internet. Missing information stays visibly missing.
              </p>
            </div>

            <div className="panel-card">
              <h2>Safety boundary</h2>
              <ul className="check-list">
                <li>One public URL, not a broad crawler</li>
                <li>Robots restrictions and timeouts respected</li>
                <li>Only public or employer-supplied text</li>
                <li>Missing youth-safety information is surfaced</li>
                <li>Organization reviews before applying information</li>
              </ul>
            </div>
          </section>

          <section className="panel-card">
            <h2>Review drafts</h2>

            {researchDrafts.length ? (
              researchDrafts.map((lead) => (
                <article className="research-row" key={lead.id}>
                  <div>
                    <h3>{lead.researchDraft?.name || lead.businessName}</h3>
                    <p>
                      {lead.researchDraft?.mission ||
                        "Mission not found in reviewed content."}
                    </p>
                    <small>{lead.website}</small>
                  </div>

                  <div>
                    <span className="confidence-pill medium">
                      {Math.round(
                        (lead.researchDraft?.confidence || 0) * 100,
                      )}
                      % confidence
                    </span>
                    <p>
                      <strong>Missing:</strong>{" "}
                      {lead.researchDraft?.missingFields?.join(", ") ||
                        "Human confirmation still required"}
                    </p>

                    <div className="card-actions">
                      <button
                        className="button"
                        onClick={() => applyResearchToOrganization(lead)}
                      >
                        Apply to my organization profile
                      </button>

                      <button
                        className="button ghost"
                        onClick={() =>
                          updateOutreachLead({
                            ...lead,
                            status: "confirmed",
                          })
                        }
                      >
                        {lead.status === "confirmed"
                          ? "Reviewed"
                          : "Mark reviewed only"}
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="muted">
                No review drafts yet. Paste your website above to begin.
              </p>
            )}
          </section>

          {notice && <div className="notice">{notice}</div>}
        </div>
      )}

      <Modal open={Boolean(selectedCandidate)} onClose={() => setSelectedCandidate(null)} title="Privacy-safe candidate profile" wide>
        {selectedCandidate && (() => { const { student, opportunity } = selectedCandidate; const match = calculateMatch(student, opportunity); return <div className="safe-profile"><header><span className="safe-avatar large">{initials(student.name)}</span><div><span className="kicker">Identity staged</span><h2>Candidate {initials(student.name)}</h2><p>Relevant information only. No email, phone, school, or precise home location.</p></div><strong className="score-badge">{match.total}%</strong></header><div className="two-panel-grid"><section><h3>Relevant skills</h3><div className="chip-row">{student.skills.map((skill) => <span className="feature-chip" key={skill}>{skill}</span>)}</div><h3>Experience proof</h3>{student.experiences.map((item) => <article className="portfolio-item" key={item.id}><h4>{item.title}</h4><p>{item.description}</p><span className={`verification ${item.verification}`}>{item.verification}</span></article>)}</section><section><h3>Match explanation</h3><ul className="check-list">{match.explanations.map((item) => <li key={item}>{item}</li>)}</ul><h3>Availability</h3><p>{student.availableDays.join(", ")} · {student.weeklyHours} hours/week</p><h3>Faith-aware needs</h3><p>{[student.prayerSpace && "Prayer space", student.prayerBreaks && "Flexible breaks", student.halalFood && "Halal-food disclosure", student.jummahAvailability].filter(Boolean).join(" · ")}</p><div className="notice">Requesting an introduction changes status only. It does not reveal contact information in this prototype.</div></section></div></div>; })()}
      </Modal>
    </AppShell>
  );
}
