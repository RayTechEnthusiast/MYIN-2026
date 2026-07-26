import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function FuturePage() {
  return (
    <>
      <SiteHeader />
      <main className="static-page">
        <section className="page-hero container">
          <span className="kicker">The future of MYIN</span>
          <h1>Begin with Muslim youth and community trust. Expand without erasing the mission.</h1>
          <p>MYIN can become infrastructure for youth development: a trusted opportunity network, proof portfolio, mentorship pathway, and community-impact engine.</p>
        </section>
        <section className="container section roadmap-grid">
          {[
            ["Now", "A reliable hackathon loop", "Profiles, transparent matching, opportunity extraction, safe interest signals, local persistence, portfolio, map radar, and visible AI boundaries."],
            ["Next", "Verified community network", "Real authentication, organization verification, guardian workflows, human moderation, service-hour confirmation, retention rules, and partner onboarding."],
            ["Scale", "Muslim youth infrastructure", "Regional masjid and school partnerships, scholarships, mentorship pathways, sponsored internships, leadership programs, and community-impact analytics."],
            ["Beyond", "Values that travel", "Schools, nonprofits, and underserved youth networks can adopt the same safety, transparency, cultural respect, and access principles while MYIN’s Muslim identity stays clear."],
          ].map(([phase,title,text]) => <article className="feature-card" key={phase}><span className="kicker">{phase}</span><h2>{title}</h2><p>{text}</p></article>)}
        </section>
        <section className="container section split-section">
          <div><h2>Sustainable pathways</h2><p>Potential models include sponsored internships, organization subscriptions for advanced recruiting tools, grants for youth development, school and mosque partnerships, and impact reporting for nonprofits. The core student opportunity experience should remain accessible.</p></div>
          <div className="quote-card">“Every Muslim student should know where their skills can make a difference, and every Muslim organization should be able to find the young people who can help it grow.”</div>
        </section>
        <section className="cta-band"><div className="container"><h2>See the working product story.</h2><Link className="button large" href="/auth?mode=login">Open the demo</Link></div></section>
      </main>
    </>
  );
}
