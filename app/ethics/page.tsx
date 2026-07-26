import { SiteHeader } from "@/components/SiteHeader";
import { EthicsAudit } from "@/components/EthicsAudit";

export default function EthicsPage() {
  return (
    <>
      <SiteHeader />
      <main className="static-page">
        <section className="page-hero container">
          <span className="kicker">AI ethics, safety, and trust</span>
          <h1>Everything AI touches, MYIN should show its work. Everything sensitive, MYIN should protect before reveal.</h1>
          <p>MYIN is designed around transparent assistance, deterministic matching, staged identity, data minimization, and human review—not automated moral judgment.</p>
        </section>

        <section className="container section ethics-principles">
          {[
            ["AI assists; humans confirm", "Gemini can structure rough text, suggest professional wording, and identify missing fields. Its output remains editable and cannot publish an opportunity automatically."],
            ["Matching is deterministic", "The 100-point rubric is the ranking source. The same supported inputs produce the same score and category breakdown."],
            ["Confidence is not truth", "Confidence shows how complete and verified the profile and listing data are. Missing information is surfaced instead of hidden."],
            ["Ethical-fit signals are disclosures", "Mission alignment, supervision, privacy, accessibility, accommodation clarity, and community trust are transparent signals—not a declaration that an organization is morally perfect."],
            ["Protect identity before reveal", "Candidate views begin with initials, relevant skills, availability, and match reasoning. Contact information is not exposed on public candidate cards."],
            ["No automated religious rulings", "Message review can flag concrete safety, privacy, pressure, or professionalism risks. It does not declare every conversation halal or haram."],
          ].map(([title,text]) => <article className="feature-card" key={title}><h2>{title}</h2><p>{text}</p></article>)}
        </section>

        <section className="section dark-band">
          <div className="container split-section">
            <div>
              <span className="kicker">Live fairness audit</span>
              <h2>Test a property instead of asking judges to trust a promise.</h2>
              <p>The panel compares synthetic profiles that are identical except for an identity label. Names and other irrelevant fields never enter the published scoring function.</p>
            </div>
            <EthicsAudit />
          </div>
        </section>

        <section className="container section">
          <div className="section-heading"><span className="kicker">Youth safety model</span><h2>A controlled introduction, not an open inbox.</h2></div>
          <div className="journey-grid">
            {[
              ["1", "Student controls first interest", "An organization cannot start an unrestricted direct message with a minor profile."],
              ["2", "Minimum profile view", "The organization receives only the skills, availability, experience evidence, and match context needed to evaluate fit."],
              ["3", "Approval-aware introduction", "Guardian, admin, or organization verification steps can be required based on age and opportunity type."],
              ["4", "Audit-friendly history", "Reporting, blocking, moderation flags, and message history are visible. Production would add trained human moderators and formal escalation."],
            ].map(([number,title,text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section className="container section">
          <div className="limitations-card">
            <h2>Prototype limitations stated plainly</h2>
            <ul>
              <li>Browser-local accounts are not production authentication.</li>
              <li>Demo moderation is not a guarantee and requires human review in production.</li>
              <li>Organization badges and fictional data do not prove real-world verification.</li>
              <li>The website research flow reviews one public page or employer-supplied content; it is not a broad crawler.</li>
              <li>Email tools create editable drafts only. They do not send mail.</li>
              <li>Production use would require legal, privacy, safeguarding, retention, accessibility, and security review.</li>
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
