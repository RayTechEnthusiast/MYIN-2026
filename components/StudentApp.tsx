"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { AppShell } from "./AppShell";
import { Modal } from "./Modal";
import { OpportunityCard } from "./OpportunityCard";
import { RadarChart } from "./RadarChart";
import { useApp } from "./AppProvider";
import { calculateMatch, scoreRadar } from "@/lib/matching";
import type { ExperienceItem, Opportunity, StudentProfile } from "@/lib/types";
import { formatDate, id, initials, profileCompleteness, splitList } from "@/lib/utils";

const tabs = ["Home", "Opportunities", "Opportunity Radar", "Messages", "Profile", "Portfolio"];

interface FilterState {
  type: string;
  format: string;
  paid: string;
  urgent: boolean;
  prayerSpace: boolean;
  prayerBreaks: boolean;
  halalFood: boolean;
  jummah: boolean;
  status: string;
  maxDistance: number;
  availability: string;
  experienceLevel: string;
  deadline: string;
  sort: string;
}

const defaultFilters: FilterState = {
  type: "All",
  format: "All",
  paid: "All",
  urgent: false,
  prayerSpace: false,
  prayerBreaks: false,
  halalFood: false,
  jummah: false,
  status: "Available",
  maxDistance: 50,
  availability: "Any availability",
  experienceLevel: "All levels",
  deadline: "Any deadline",
  sort: "Best fit",
};

function DetailPanel({ opportunity, student }: { opportunity: Opportunity; student: StudentProfile }) {
  const match = calculateMatch(student, opportunity);
  return (
    <div className="detail-grid">
      <section>
        <div className="score-hero"><strong>{match.total}%</strong><span>transparent match</span></div>
        <h3>{opportunity.orgName}</h3>
        <p>{opportunity.description}</p>
        <div className="chip-row">
          <span className="feature-chip">{opportunity.type}</span><span className="feature-chip">{opportunity.format}</span><span className="feature-chip">{opportunity.paid ? "Paid" : "Unpaid"}</span>
          {opportunity.urgent && <span className="urgent-chip">Immediate</span>}
        </div>
        <dl className="detail-list">
          <div><dt>Location</dt><dd>{opportunity.location} · {opportunity.distanceMiles} miles</dd></div>
          <div><dt>Deadline</dt><dd>{formatDate(opportunity.deadline)}</dd></div>
          <div><dt>Commitment</dt><dd>{opportunity.commitment}</dd></div>
          <div><dt>Eligibility</dt><dd>Ages {opportunity.ageMin}–{opportunity.ageMax} · {opportunity.experienceLevel}</dd></div>
          <div><dt>Supervision</dt><dd>{opportunity.supervision || "Not yet disclosed"}</dd></div>
          <div><dt>Application</dt><dd>{opportunity.applicationSteps || "Not yet disclosed"}</dd></div>
        </dl>
      </section>
      <section>
        <h3>Score breakdown</h3>
        {Object.entries(match.breakdown).map(([label, value]) => (
          <div className="breakdown-row" key={label}><span>{label.replace(/([A-Z])/g, " $1")}</span><strong>{value}</strong></div>
        ))}
        <h3>Why MYIN connected this</h3>
        <ul className="check-list">{match.explanations.map((item) => <li key={item}>{item}</li>)}</ul>
        <h3>Confidence: {match.confidence}%</h3>
        <ul className="plain-list">{match.confidenceInputs.map((item) => <li key={item}>{item}</li>)}</ul>
        {match.missingData.length > 0 && <div className="notice warning">Missing for stronger confidence: {match.missingData.join(", ")}.</div>}
        <h3>Ethical-fit signals</h3>
        <p className="microcopy">These are disclosures, not a moral judgment or guarantee.</p>
        <div className="signal-grid">{Object.entries(opportunity.safetySignals).map(([key, value]) => <span className={value ? "positive" : "unknown"} key={key}>{value ? "✓" : "?"} {key.replace(/([A-Z])/g, " $1")}</span>)}</div>
      </section>
    </div>
  );
}

export function StudentApp() {
  const {
    state,
    currentStudent,
    updateStudent,
    toggleSaved,
    dismissOpportunity,
    expressInterest,
    sendMessage,
    addExperience,
    refreshMatches,
  } = useApp();
  const [active, setActive] = useState("Home");
  const [filters, setFilters] = useState(defaultFilters);
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [emailOpportunity, setEmailOpportunity] = useState<Opportunity | null>(null);
  const [emailDraft, setEmailDraft] = useState("");
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailNotice, setEmailNotice] = useState("");
  const [emailStatus, setEmailStatus] = useState<"draft" | "approval" | "copied" | "opened">("draft");
  const [profileDraft, setProfileDraft] = useState<StudentProfile | null>(currentStudent);
  const [profileNotice, setProfileNotice] = useState("");
  const [enrichment, setEnrichment] = useState<Record<string, string[]> | null>(null);
  const [busy, setBusy] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [messageNotice, setMessageNotice] = useState("");
  const [mapZip, setMapZip] = useState(currentStudent?.zip || "");
  const [mapCenter, setMapCenter] = useState({ lat: 39.04, lon: -77.11, label: "Demo center — DC metro" });
  const [mapNotice, setMapNotice] = useState("");
  const [newExperience, setNewExperience] = useState({ title: "", organization: "", description: "", skills: "" });

  if (!currentStudent) return <div className="loading-screen">Student profile not found.</div>;
  const student = currentStudent;
  if (!profileDraft || profileDraft.id !== student.id) setProfileDraft(student);

  const saved = state.savedOpportunityIds[student.id] || [];
  const dismissed = state.dismissedOpportunityIds[student.id] || [];
  const applied = state.appliedOpportunityIds[student.id] || [];

  const ranked = useMemo(() => state.opportunities
    .map((opportunity) => ({ opportunity, match: calculateMatch(student, opportunity) }))
    .filter(({ opportunity, match }) => opportunity.status === "open" && match.total >= 70)
    .sort((a, b) => b.match.total - a.match.total), [state.opportunities, student, state.lastMatchRefresh]);

  const filtered = useMemo(() => {
    const list = ranked.filter(({ opportunity }) => {
      if (filters.type !== "All" && opportunity.type !== filters.type) return false;
      if (filters.format !== "All" && opportunity.format !== filters.format) return false;
      if (filters.paid === "Paid" && !opportunity.paid) return false;
      if (filters.paid === "Unpaid" && opportunity.paid) return false;
      if (filters.urgent && !opportunity.urgent) return false;
      if (filters.prayerSpace && !opportunity.prayerSpace) return false;
      if (filters.prayerBreaks && !opportunity.prayerBreaks) return false;
      if (filters.halalFood && !opportunity.halalFood) return false;
      if (filters.jummah && !opportunity.jummahCompatible) return false;
      if (opportunity.distanceMiles > filters.maxDistance && opportunity.format !== "Remote") return false;
      if (filters.status === "Saved" && !saved.includes(opportunity.id)) return false;
      if (filters.status === "Applied" && !applied.includes(opportunity.id)) return false;
      if (filters.status === "Not interested" && !dismissed.includes(opportunity.id)) return false;
      if (filters.status === "Available" && dismissed.includes(opportunity.id)) return false;
      if (filters.availability === "Strong availability" && calculateMatch(student, opportunity).breakdown.availability < 11) return false;
      if (filters.experienceLevel !== "All levels" && opportunity.experienceLevel !== filters.experienceLevel) return false;
      if (filters.deadline !== "Any deadline") {
        const limit = Number(filters.deadline.split(" ")[1]);
        const days = Math.ceil((new Date(opportunity.deadline).getTime() - Date.now()) / 86_400_000);
        if (days < 0 || days > limit) return false;
      }
      return true;
    });
    return [...list].sort((a, b) => {
      if (filters.sort === "Newest") return new Date(b.opportunity.createdAt).getTime() - new Date(a.opportunity.createdAt).getTime();
      if (filters.sort === "Nearest") return a.opportunity.distanceMiles - b.opportunity.distanceMiles;
      if (filters.sort === "Deadline") return new Date(a.opportunity.deadline).getTime() - new Date(b.opportunity.deadline).getTime();
      if (filters.sort === "Urgency") return Number(b.opportunity.urgent) - Number(a.opportunity.urgent);
      return b.match.total - a.match.total;
    });
  }, [ranked, filters, saved, applied, dismissed]);

  const top = ranked[0];
  const completeness = profileCompleteness(student);
  const bestAction = top?.opportunity.urgent
    ? { title: "Respond to an immediate community need", text: `${top.opportunity.title} is urgent and currently a ${top.match.total}% match.`, action: "View urgent match" }
    : completeness < 80
      ? { title: "Strengthen your profile", text: `Your profile is ${completeness}% complete. Adding evidence can improve confidence and matching.`, action: "Open profile" }
      : { title: "Act on your strongest connection", text: `${top?.opportunity.title || "Your top opportunity"} is currently your best fit.`, action: "View best match" };

  const openEmail = (opportunity: Opportunity) => {
    const relevant = opportunity.skills.filter((skill) =>
      student.skills
        .map((item) => item.toLowerCase())
        .includes(skill.toLowerCase()),
    );
    const organization = state.organizations.find(
      (item) => item.id === opportunity.orgId,
    );

    setEmailOpportunity(opportunity);
    setEmailRecipient(organization?.email || "");
    setEmailNotice("");
    setEmailDraft(
      `Subject: Interest in ${opportunity.title}\n\n` +
        `Assalamu alaikum ${opportunity.orgName} team,\n\n` +
        `I’m interested in the ${opportunity.title} opportunity. ` +
        `My experience with ${relevant.join(", ") || "related community work"}, ` +
        `along with my interest in ${student.interests.slice(0, 2).join(" and ")}, ` +
        `makes me excited to contribute. My current availability includes ` +
        `${student.availableDays.join(", ") || "flexible times"}.\n\n` +
        `I would appreciate the chance to learn more through MYIN’s controlled introduction process.\n\n` +
        `Jazakum Allahu khayran,\n${student.name}`,
    );
    setEmailStatus("draft");
  };

  const openInEmailApp = () => {
    const recipient = emailRecipient.trim();

    if (!recipient) {
      setEmailNotice(
        "Add the organization’s email address before opening the draft.",
      );
      return;
    }

    const lines = emailDraft.split("\n");
    const subjectMatch = lines[0]?.match(/^Subject:\s*(.*)$/i);
    const subject =
      subjectMatch?.[1]?.trim() ||
      `Interest in ${emailOpportunity?.title || "MYIN opportunity"}`;
    const body = subjectMatch
      ? lines.slice(1).join("\n").trimStart()
      : emailDraft;

    const mailtoUrl =
      `mailto:${encodeURIComponent(recipient)}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    setEmailStatus("opened");
    setEmailNotice(
      "Your email app was opened with this draft. MYIN has not sent anything.",
    );
    window.location.href = mailtoUrl;
  };

  const polishEmail = async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/professionalize", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: emailDraft, context: "email" }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not improve email.");
      setEmailDraft(data.text);
      setEmailStatus("approval");
    } catch (error) {
      setProfileNotice(error instanceof Error ? error.message : "Could not improve email.");
    } finally { setBusy(false); }
  };

  const handleEnrich = async () => {
    if (!profileDraft) return;
    setBusy(true); setProfileNotice(""); setEnrichment(null);
    try {
      const response = await fetch("/api/profile-enrich", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: profileDraft.freeText, consent: true }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not enrich profile.");
      setEnrichment(data.data);
      setProfileNotice(data.warning || `${data.mode === "gemini" ? "Gemini" : "Demo parser"} created reviewable suggestions. Nothing was saved automatically.`);
    } catch (error) { setProfileNotice(error instanceof Error ? error.message : "Could not enrich profile."); }
    finally { setBusy(false); }
  };

  const applyEnrichment = () => {
    if (!profileDraft || !enrichment) return;
    const merge = (a: string[], b?: string[]) => Array.from(new Set([...a, ...(b || [])]));
    setProfileDraft({ ...profileDraft, skills: merge(profileDraft.skills, enrichment.skills), interests: merge(profileDraft.interests, enrichment.interests), strengths: merge(profileDraft.strengths, enrichment.strengths), growthAreas: merge(profileDraft.growthAreas, enrichment.growthAreas), careerGoals: merge(profileDraft.careerGoals, enrichment.careerGoals) });
    setProfileNotice("Suggestions added to the editable form. Press Save profile to keep them.");
  };

  const importText = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profileDraft) return;
    if (!/\.(txt|md)$/i.test(file.name)) { setProfileNotice("This demo accepts .txt and .md files only. OCR and PDF parsing are intentionally not included."); return; }
    const text = await file.text();
    setProfileDraft({ ...profileDraft, freeText: [profileDraft.freeText, text.slice(0, 8000)].filter(Boolean).join("\n\n") });
    setProfileNotice(`${file.name} was added to the review text. Use Enrich, then review suggestions before saving.`);
  };

  const addExperienceNow = async () => {
    if (!newExperience.title.trim() || !newExperience.description.trim()) { setProfileNotice("Add an experience title and description."); return; }
    setBusy(true);
    let description = newExperience.description;
    try {
      const response = await fetch("/api/professionalize", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: description, context: "experience" }) });
      const data = await response.json();
      if (response.ok) description = data.text;
    } finally { setBusy(false); }
    const item: ExperienceItem = { id: id("exp"), title: newExperience.title, organization: newExperience.organization || "Self-entered", description, skills: splitList(newExperience.skills), verification: "self-entered" };
    addExperience(student.id, item);
    setNewExperience({ title: "", organization: "", description: "", skills: "" });
    setProfileNotice("Professionalized experience added as self-entered evidence.");
  };

  const searchMap = async (useLocation = false) => {
    setMapNotice("Locating opportunities…");
    try {
      let query = `zip=${encodeURIComponent(mapZip)}`;
      if (useLocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 }));
        query = `lat=${position.coords.latitude}&lon=${position.coords.longitude}`;
      }
      const response = await fetch(`/api/opportunity-radar?${query}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Location search failed.");
      setMapCenter({ ...data.center, label: data.label });
      setMapNotice(data.warning || `Map centered using ${data.source}. Nearby markers are MYIN demo opportunities, not automatically confirmed public listings.`);
    } catch (error) {
      setMapNotice(error instanceof GeolocationPositionError && error.code === 1 ? "Location permission was denied. Search by ZIP instead." : error instanceof Error ? error.message : "Location search failed.");
    }
  };

  const studentConversations = state.conversations.filter((conversation) => conversation.studentId === student.id);
  const sendCurrentMessage = async (conversationId: string) => {
    if (!messageInput.trim()) return;
    setBusy(true); setMessageNotice("");
    try {
      const response = await fetch("/api/moderate-message", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: messageInput, senderRole: "student" }) });
      const data = await response.json();
      if (data.status === "flagged") { setMessageNotice(`${data.reason} ${data.suggestion}`); return; }
      sendMessage(conversationId, "student", student.name, messageInput, "clear"); setMessageInput(""); setMessageNotice(data.note || "Message added to the controlled demo conversation.");
    } finally { setBusy(false); }
  };

  return (
    <AppShell tabs={tabs} active={active} onTab={setActive}>
      {active === "Home" && (
        <div className="dashboard-stack">
          <header className="app-page-header"><div><span className="kicker">Student command center</span><h1>Assalamu alaikum, {student.name.split(" ")[0]}</h1><p>Your best next move, transparent matches, and growth signals—without the noise.</p></div><button className="button" onClick={() => { refreshMatches(); setProfileNotice("MYIN recomputed all deterministic matches from the latest local data."); }}>Refresh MYIN Matches</button></header>
          <section className="recommended-action"><div><span className="kicker">Best recommended action</span><h2>{bestAction.title}</h2><p>{bestAction.text}</p></div><button className="button secondary" onClick={() => { if (completeness < 80) setActive("Profile"); else if (top) setSelected(top.opportunity); }}>{bestAction.action}</button></section>
          <div className="metric-grid"><article><span>Profile strength</span><strong>{completeness}%</strong><small>More evidence improves confidence</small></article><article><span>Top match</span><strong>{top?.match.total || 0}%</strong><small>{top?.opportunity.title || "Complete your profile"}</small></article><article><span>Verified hours</span><strong>{student.verifiedServiceHours}</strong><small>Separate from self-entered work</small></article><article><span>Visible matches</span><strong>{ranked.length}</strong><small>Only 70% and above</small></article></div>
          <div className="two-panel-grid">
            <section className="panel-card"><div className="panel-heading"><div><span className="kicker">Today’s email preview</span><h2>{top?.opportunity.title}</h2></div><span className="score-badge">{top?.match.total}%</span></div><p>{top?.match.explanations.slice(0,2).join(" ")}</p><div className="card-actions"><button className="button" onClick={() => top && setSelected(top.opportunity)}>View opportunity</button><button className="button secondary" onClick={() => top && openEmail(top.opportunity)}>Draft interest email</button></div><p className="microcopy">Preview only. Nothing is sent without explicit approval.</p></section>
            <section className="panel-card"><div className="panel-heading"><div><span className="kicker">Skill constellation</span><h2>Where your profile is strongest</h2></div></div><RadarChart values={scoreRadar(student)} /></section>
          </div>
          <section className="panel-card"><div className="section-heading compact"><span className="kicker">Connection intelligence</span><h2>Strengthen your edge without becoming one-dimensional.</h2></div><div className="three-card-grid compact-cards">{["Core edge","Adjacent expansion","Rounding opportunity"].map((lens) => { const item = ranked.find((entry) => entry.match.connectionLens === lens); return <article key={lens}><span className="kicker">{lens}</span><h3>{item?.opportunity.title || "No current match"}</h3><p>{lens === "Core edge" ? "Deepens the skills and mission areas already making you distinctive." : lens === "Adjacent expansion" ? "Adds a complementary ability close to your current path." : "Builds a weaker area without becoming random or disconnected."}</p></article>; })}</div></section>
        </div>
      )}

      {active === "Opportunities" && (
        <div className="dashboard-stack">
          <header className="app-page-header"><div><span className="kicker">Explainable opportunity finder</span><h1>Best fit first. Nothing below 70%.</h1><p>Filter the result set without changing the underlying 100-point rubric.</p></div><button className="button" onClick={refreshMatches}>Force refresh finder</button></header>
          <section className="filter-panel">
            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}><option>All</option><option>Internship</option><option>Volunteer</option><option>Mentorship</option><option>Community Project</option></select>
            <select value={filters.format} onChange={(e) => setFilters({ ...filters, format: e.target.value })}><option>All</option><option>Remote</option><option>Hybrid</option><option>In person</option></select>
            <select value={filters.paid} onChange={(e) => setFilters({ ...filters, paid: e.target.value })}><option>All</option><option>Paid</option><option>Unpaid</option></select>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option>Available</option><option>Saved</option><option>Applied</option><option>Not interested</option><option>All</option></select>
            <select value={filters.availability} onChange={(e) => setFilters({ ...filters, availability: e.target.value })}><option>Any availability</option><option>Strong availability</option></select>
            <select value={filters.experienceLevel} onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}><option>All levels</option><option>Beginner</option><option>Developing</option><option>Experienced</option></select>
            <select value={filters.deadline} onChange={(e) => setFilters({ ...filters, deadline: e.target.value })}><option>Any deadline</option><option>Within 7 days</option><option>Within 14 days</option><option>Within 30 days</option></select>
            <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}><option>Best fit</option><option>Match score</option><option>Newest</option><option>Nearest</option><option>Deadline</option><option>Urgency</option></select>
            <label className="range-field">Distance {filters.maxDistance} mi<input type="range" min="1" max="50" value={filters.maxDistance} onChange={(e) => setFilters({ ...filters, maxDistance: Number(e.target.value) })} /></label>
            {[['urgent','Immediate'],['prayerSpace','Prayer space'],['prayerBreaks','Prayer breaks'],['halalFood','Halal food'],['jummah','Jumu’ah']].map(([key,label]) => <label className="check-chip" key={key}><input type="checkbox" checked={Boolean(filters[key as keyof FilterState])} onChange={(e) => setFilters({ ...filters, [key]: e.target.checked })} />{label}</label>)}
            <button className="text-button" onClick={() => setFilters(defaultFilters)}>Clear filters</button>
          </section>
          <div className="results-summary"><strong>{filtered.length} opportunities</strong><span>{ranked.length} total above the 70% threshold</span></div>
          {filtered.length ? filtered.map(({ opportunity, match }) => <OpportunityCard key={opportunity.id} opportunity={opportunity} match={match} saved={saved.includes(opportunity.id)} applied={applied.includes(opportunity.id)} onView={() => setSelected(opportunity)} onSave={() => toggleSaved(student.id, opportunity.id)} onInterest={() => expressInterest(student.id, opportunity.id)} onDismiss={() => dismissOpportunity(student.id, opportunity.id)} onDraftEmail={() => openEmail(opportunity)} />) : <div className="empty-state"><h2>No opportunities match these filters.</h2><p>Clear one filter or strengthen your profile. MYIN does not fill empty states with fake results.</p></div>}
        </div>
      )}

      {active === "Opportunity Radar" && (
        <div className="dashboard-stack">
          <header className="app-page-header"><div><span className="kicker">Opportunity Radar</span><h1>See strong connections around you.</h1><p>Markers are color-coded by transparent match score. Nearby public places would be discovery leads until confirmed by an organization.</p></div></header>
          <section className="map-controls"><input value={mapZip} onChange={(e) => setMapZip(e.target.value)} placeholder="ZIP code" maxLength={5} /><button className="button" onClick={() => searchMap(false)}>Search ZIP</button><button className="button secondary" onClick={() => searchMap(true)}>Use browser location</button></section>
          {mapNotice && <div className="notice">{mapNotice}</div>}
          <section className="radar-map">
            <div className="map-grid-lines" />
            <div className="map-center-label">{mapCenter.label}</div>
            {ranked.map(({ opportunity, match }, index) => {
              const x = 18 + ((index * 23 + Math.abs(opportunity.longitude * 10)) % 70);
              const y = 18 + ((index * 31 + Math.abs(opportunity.latitude * 10)) % 64);
              return <button key={opportunity.id} onClick={() => setSelected(opportunity)} className={`map-marker ${match.total >= 90 ? "elite" : match.total >= 80 ? "strong" : "good"}`} style={{ left: `${x}%`, top: `${y}%` }} title={`${opportunity.title}: ${match.total}%`}><strong>{match.total}</strong><span>{opportunity.title}</span></button>;
            })}
          </section>
          <div className="map-legend"><span><i className="elite" />90–100%</span><span><i className="strong" />80–89%</span><span><i className="good" />70–79%</span></div>
        </div>
      )}

      {active === "Messages" && (
        <div className="dashboard-stack">
          <header className="app-page-header"><div><span className="kicker">Controlled introductions</span><h1>Opportunity-focused communication.</h1><p>Students initiate interest. The demo flags concrete safety and privacy risks but does not make religious rulings.</p></div></header>
          {studentConversations.length === 0 ? <div className="empty-state"><h2>No conversations yet.</h2><p>Express interest in an opportunity to open a controlled introduction.</p><button className="button" onClick={() => setActive("Opportunities")}>Find opportunities</button></div> : studentConversations.map((conversation) => { const opportunity = state.opportunities.find((item) => item.id === conversation.opportunityId); return <section className="conversation-card" key={conversation.id}><header><div><h2>{opportunity?.title}</h2><p>{opportunity?.orgName} · {conversation.introductionStatus} introduction</p></div><span className="safe-badge">Audit history on</span></header><div className="message-history">{conversation.messages.map((message) => <article className={message.senderRole === "student" ? "mine" : "theirs"} key={message.id}><strong>{message.senderLabel}</strong><p>{message.text}</p><small>{new Date(message.createdAt).toLocaleString()}</small></article>)}</div><div className="message-composer"><textarea value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Ask about the role, schedule, supervision, or application process…" /><button className="button" disabled={busy} onClick={() => sendCurrentMessage(conversation.id)}>Review & add message</button></div>{messageNotice && <div className="notice warning">{messageNotice}</div>}</section>; })}
        </div>
      )}

      {active === "Profile" && profileDraft && (
        <div className="dashboard-stack">
          <header className="app-page-header"><div><span className="kicker">Profile intelligence</span><h1>Give MYIN enough context to find better opportunities.</h1><p>Required fields establish eligibility. Optional details improve relevance and confidence. Review every AI suggestion before saving.</p></div><button className="button" onClick={() => { updateStudent(profileDraft); setProfileNotice("Profile saved in this browser demo."); }}>Save profile</button></header>
          <div className="notice">The more complete your profile is, the more accurate and useful your recommendations become. Avoid private information you would not want used for matching.</div>
          <section className="profile-form panel-card">
            <h2>Basics <span className="required-label">required</span></h2>
            <div className="form-grid three"><label>Name<input value={profileDraft.name} onChange={(e) => setProfileDraft({ ...profileDraft, name: e.target.value })} /></label><label>Age<input type="number" value={profileDraft.age} onChange={(e) => setProfileDraft({ ...profileDraft, age: Number(e.target.value) })} /></label><label>Grade<input value={profileDraft.grade} onChange={(e) => setProfileDraft({ ...profileDraft, grade: e.target.value })} /></label><label>ZIP<input value={profileDraft.zip} onChange={(e) => setProfileDraft({ ...profileDraft, zip: e.target.value })} /></label><label>City<input value={profileDraft.city} onChange={(e) => setProfileDraft({ ...profileDraft, city: e.target.value })} /></label><label>Travel miles<input type="number" value={profileDraft.travelMiles} onChange={(e) => setProfileDraft({ ...profileDraft, travelMiles: Number(e.target.value) })} /></label></div>
            <h2>Skills, interests, and direction <span className="required-label">required</span></h2>
            <div className="form-grid two"><label>Skills (comma separated)<textarea value={profileDraft.skills.join(", ")} onChange={(e) => setProfileDraft({ ...profileDraft, skills: splitList(e.target.value) })} /></label><label>Interests<textarea value={profileDraft.interests.join(", ")} onChange={(e) => setProfileDraft({ ...profileDraft, interests: splitList(e.target.value) })} /></label><label>Career goals<textarea value={profileDraft.careerGoals.join(", ")} onChange={(e) => setProfileDraft({ ...profileDraft, careerGoals: splitList(e.target.value) })} /></label><label>Causes you care about<textarea value={profileDraft.causes.join(", ")} onChange={(e) => setProfileDraft({ ...profileDraft, causes: splitList(e.target.value) })} /></label><label>Strengths<textarea value={profileDraft.strengths.join(", ")} onChange={(e) => setProfileDraft({ ...profileDraft, strengths: splitList(e.target.value) })} /></label><label>Growth areas<textarea value={profileDraft.growthAreas.join(", ")} onChange={(e) => setProfileDraft({ ...profileDraft, growthAreas: splitList(e.target.value) })} /></label></div>
            <h2>Availability and faith-aware preferences</h2>
            <div className="form-grid three"><label>Available days<textarea value={profileDraft.availableDays.join(", ")} onChange={(e) => setProfileDraft({ ...profileDraft, availableDays: splitList(e.target.value) })} /></label><label>Weekly hours<input type="number" value={profileDraft.weeklyHours} onChange={(e) => setProfileDraft({ ...profileDraft, weeklyHours: Number(e.target.value) })} /></label><label>Jumu’ah availability<select value={profileDraft.jummahAvailability} onChange={(e) => setProfileDraft({ ...profileDraft, jummahAvailability: e.target.value as StudentProfile['jummahAvailability'] })}><option>Available</option><option>Needs flexibility</option><option>Not applicable</option></select></label><label className="toggle-label"><input type="checkbox" checked={profileDraft.prayerBreaks} onChange={(e) => setProfileDraft({ ...profileDraft, prayerBreaks: e.target.checked })} />Prefer flexible prayer breaks</label><label className="toggle-label"><input type="checkbox" checked={profileDraft.prayerSpace} onChange={(e) => setProfileDraft({ ...profileDraft, prayerSpace: e.target.checked })} />Prefer prayer area</label><label className="toggle-label"><input type="checkbox" checked={profileDraft.halalFood} onChange={(e) => setProfileDraft({ ...profileDraft, halalFood: e.target.checked })} />Prefer halal food disclosure</label><label className="toggle-label"><input type="checkbox" checked={profileDraft.urgentOptIn} onChange={(e) => setProfileDraft({ ...profileDraft, urgentOptIn: e.target.checked })} />Immediate community alerts</label><label className="toggle-label"><input type="checkbox" checked={profileDraft.discoverable} onChange={(e) => setProfileDraft({ ...profileDraft, discoverable: e.target.checked })} />Discoverable through safe profile</label><label className="toggle-label"><input type="checkbox" checked={profileDraft.guardianApproval} onChange={(e) => setProfileDraft({ ...profileDraft, guardianApproval: e.target.checked })} />Guardian approval recorded</label></div>
            <div className="form-grid two"><label>Flexibility<textarea value={profileDraft.flexibility} onChange={(e) => setProfileDraft({ ...profileDraft, flexibility: e.target.value })} /></label><label>Transportation<textarea value={profileDraft.transportation} onChange={(e) => setProfileDraft({ ...profileDraft, transportation: e.target.value })} /></label><label>Accommodation notes<textarea value={profileDraft.accommodations} onChange={(e) => setProfileDraft({ ...profileDraft, accommodations: e.target.value })} /></label><label>Professional bio<textarea value={profileDraft.bio} onChange={(e) => setProfileDraft({ ...profileDraft, bio: e.target.value })} /></label></div>
            <h2>Tell MYIN anything else <span className="optional-label">optional</span></h2>
            <textarea className="large-textarea" value={profileDraft.freeText} onChange={(e) => setProfileDraft({ ...profileDraft, freeText: e.target.value })} placeholder="Experiences, previous opportunities, strengths, weaknesses, goals, flexibility, projects, or context you want MYIN to understand…" />
            <div className="card-actions"><button className="button" onClick={handleEnrich} disabled={busy}>{busy ? "Analyzing…" : "Convert text into reviewable profile suggestions"}</button><label className="button secondary file-button">Import .txt or .md<input type="file" accept=".txt,.md,text/plain,text/markdown" onChange={importText} /></label></div>
            {enrichment && <div className="enrichment-review"><h3>Review suggestions</h3>{Object.entries(enrichment).map(([key, values]) => <div key={key}><strong>{key}</strong><span>{values.join(", ") || "No supported items found"}</span></div>)}<button className="button" onClick={applyEnrichment}>Add selected suggestions to form</button></div>}
          </section>
          <section className="panel-card"><h2>Strengthen my profile</h2><p>Add truthful evidence. “Make it professional” improves wording but does not invent results.</p><div className="form-grid two"><label>Experience or project title<input value={newExperience.title} onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })} /></label><label>Organization<input value={newExperience.organization} onChange={(e) => setNewExperience({ ...newExperience, organization: e.target.value })} /></label><label>Description<textarea value={newExperience.description} onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })} /></label><label>Skills demonstrated<textarea value={newExperience.skills} onChange={(e) => setNewExperience({ ...newExperience, skills: e.target.value })} /></label></div><button className="button" onClick={addExperienceNow} disabled={busy}>Make it professional & add</button></section>
          {profileNotice && <div className="notice">{profileNotice}</div>}
        </div>
      )}

      {active === "Portfolio" && (
        <div className="dashboard-stack portfolio-page">
          <header className="app-page-header no-print"><div><span className="kicker">Proof Portfolio</span><h1>A resume that separates claims from evidence.</h1><p>Use your browser’s print dialog to save a polished PDF. Verification labels remain visible.</p></div><div className="card-actions"><button className="button" onClick={() => window.print()}>Print / Save PDF</button><button className="button secondary" onClick={() => { const text = `${student.name}\n${student.bio}\n\nSkills: ${student.skills.join(", ")}\n\nExperiences:\n${student.experiences.map((item) => `- ${item.title} — ${item.organization} [${item.verification}]\n  ${item.description}`).join("\n")}`; const blob = new Blob([text], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${student.name.replace(/\s+/g,'-')}-MYIN-Portfolio.txt`; a.click(); URL.revokeObjectURL(url); }}>Download text portfolio</button></div></header>
          <section className="portfolio-sheet"><header><div className="portfolio-monogram">{initials(student.name)}</div><div><h1>{student.name}</h1><p>{student.bio}</p><span>{student.city || student.zip} · {student.grade}</span></div></header><div className="portfolio-columns"><section><h2>Core skills</h2><div className="chip-row">{student.skills.map((item) => <span className="feature-chip" key={item}>{item}</span>)}</div><h2>Experience</h2>{student.experiences.map((item) => <article className="portfolio-item" key={item.id}><div><h3>{item.title}</h3><span>{item.organization}</span></div><span className={`verification ${item.verification}`}>{item.verification}</span><p>{item.description}</p><small>{item.skills.join(" · ")}{item.hours ? ` · ${item.hours} hours` : ""}</small></article>)}</section><aside><h2>Impact proof</h2><div className="portfolio-stat"><strong>{student.verifiedServiceHours}</strong><span>verified service hours</span></div><h2>Strengths</h2><ul>{student.strengths.map((item) => <li key={item}>{item}</li>)}</ul><h2>Growth direction</h2><ul>{student.growthAreas.map((item) => <li key={item}>{item}</li>)}</ul><h2>Availability</h2><p>{student.availableDays.join(", ")} · {student.weeklyHours} hours/week</p></aside></div><footer>Generated by MYIN · Self-entered, organization-confirmed, and verified evidence are labeled separately.</footer></section>
        </div>
      )}

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title || "Opportunity"} wide>{selected && <DetailPanel opportunity={selected} student={student} />}</Modal>
      <Modal
        open={Boolean(emailOpportunity)}
        onClose={() => setEmailOpportunity(null)}
        title={`Email draft — ${emailOpportunity?.title || "Opportunity"}`}
        wide
      >
        <div className="email-state-row">
          <span className={emailStatus === "draft" ? "active" : ""}>
            Draft
          </span>
          <span className={emailStatus === "approval" ? "active" : ""}>
            Requires approval
          </span>
          <span className={emailStatus === "opened" ? "active" : ""}>
            Opened in email app
          </span>
          <span className={emailStatus === "copied" ? "active" : ""}>
            Copied
          </span>
        </div>

        <label>
          Organization email
          <input
            type="email"
            value={emailRecipient}
            onChange={(event) => {
              setEmailRecipient(event.target.value);
              setEmailStatus("approval");
              setEmailNotice("");
            }}
            placeholder="organization@example.org"
          />
        </label>

        <textarea
          className="email-editor"
          value={emailDraft}
          onChange={(event) => {
            setEmailDraft(event.target.value);
            setEmailStatus("approval");
            setEmailNotice("");
          }}
        />

        <div className="notice">
          Nothing is sent automatically. Review the draft, then open it in your
          own email app and press Send yourself.
        </div>

        {emailNotice && <div className="notice warning">{emailNotice}</div>}

        <div className="card-actions">
          <button
            className="button secondary"
            onClick={polishEmail}
            disabled={busy}
          >
            {busy ? "Polishing…" : "Polish wording with Gemini"}
          </button>

          <button
            className="button"
            onClick={openInEmailApp}
            disabled={!emailRecipient.trim()}
          >
            Open in email app
          </button>

          <button
            className="button ghost"
            onClick={async () => {
              await navigator.clipboard.writeText(emailDraft);
              setEmailStatus("copied");
              setEmailNotice("Draft copied. MYIN has not sent anything.");
            }}
          >
            Copy draft
          </button>
        </div>

        <p className="microcopy">
          This hackathon demo uses a consent-first mailto handoff instead of
          Gmail OAuth. MYIN never stores Gmail credentials or sends without
          approval.
        </p>
      </Modal>
    </AppShell>
  );
}
