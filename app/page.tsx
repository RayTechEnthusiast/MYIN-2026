import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { CyclingHeroText } from "@/components/CyclingHeroText";
import { FloatingImpactBubbles } from "@/components/FloatingImpactBubbles";
import { EmailOnlyEmployerSignup } from "@/components/EmailOnlyEmployerSignup";

const orbitBranches = [
  { label: "Internships", icon: "▣", angle: "-90deg" },
  { label: "Volunteering", icon: "♥", angle: "-30deg" },
  { label: "Leadership", icon: "★", angle: "30deg" },
  { label: "Community", icon: "●", angle: "90deg" },
  { label: "Scholarships", icon: "◆", angle: "150deg" },
  { label: "Mentorship", icon: "◉", angle: "210deg" },
];

const satellitePeople = ["-72deg", "-24deg", "18deg", "63deg", "111deg", "157deg", "198deg", "246deg"];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="network-hero">
          <div className="network-noise" aria-hidden="true" />
          <div className="network-mosque" aria-hidden="true" />
          <div className="container network-hero-grid">
            <div className="network-copy">
              <FloatingImpactBubbles />
              <span className="network-eyebrow">Muslim Youth Internship Network</span>
              <CyclingHeroText />
              <div className="network-divider"><span>✦</span></div>
              <p>
                MYIN connects Muslim youth with internships, mentors, volunteer roles,
                leadership programs, and career-growth opportunities—rooted in faith,
                purpose, transparency, and community.
              </p>
              <div className="network-actions">
                <Link className="button network-primary" href="/auth?mode=login">Explore opportunities</Link>
                <Link className="button network-secondary" href="/auth?mode=signup">Join MYIN</Link>
                <Link className="button network-secondary" href="#employer-brief">Employer email brief</Link>
              </div>
              <div className="network-values" aria-label="MYIN values">
                <span>◇ Faith-aligned</span><span>● Community-driven</span><span>✦ Purpose-powered</span>
              </div>
            </div>

            <div className="network-visual" aria-label="MYIN opportunity network">
              <div className="network-aura" />
              <div className="orbit-line orbit-line-one" />
              <div className="orbit-line orbit-line-two" />

              <div className="orbit-wheel orbit-wheel-main">
                {orbitBranches.map((branch) => (
                  <div
                    key={branch.label}
                    className="orbit-position"
                    style={{ "--angle": branch.angle } as React.CSSProperties}
                  >
                    <div className="orbit-counter">
                      <div className="orbit-branch-node">
                        <span className="orbit-icon">{branch.icon}</span>
                      </div>
                      <strong>{branch.label}</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div className="orbit-wheel orbit-wheel-people">
                {satellitePeople.map((angle) => (
                  <div
                    key={angle}
                    className="orbit-position small"
                    style={{ "--angle": angle } as React.CSSProperties}
                  >
                    <div className="orbit-counter reverse">
                      <span className="person-node" aria-hidden="true">●</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="network-center">
                <div className="network-center-ring" />
                <Image
                  src="/myin-logo.png"
                  alt="MYIN logo"
                  width={290}
                  height={210}
                  priority
                />
              </div>
            </div>
          </div>

          <div className="container network-stats">
            <div><strong>1,000+</strong><span>Opportunity pathways</span></div>
            <div><strong>500+</strong><span>Mentor connections</span></div>
            <div><strong>10,000+</strong><span>Youth-growth potential</span></div>
            <div><strong>25,000+</strong><span>Community-impact hours</span></div>
          </div>
        </section>

        <section id="mission" className="section container">
          <div className="section-heading centered">
            <span className="kicker">The mission</span>
            <h2>The talent already exists. The connection system does not.</h2>
            <p>Opportunities are scattered across WhatsApp, mosque announcements, Instagram, email, flyers, and personal networks. MYIN turns that fragmentation into one trusted pathway.</p>
          </div>
          <div className="three-card-grid">
            <article className="feature-card"><span className="feature-number">01</span><h3>For students</h3><p>See opportunities ranked by fit and filtered around real life—including location, schedule, Jumu’ah, prayer, compensation, and experience level.</p></article>
            <article className="feature-card"><span className="feature-number">02</span><h3>For organizations</h3><p>Start from a rough paragraph or public page. AI prepares an editable draft, identifies missing safety information, and never publishes without human confirmation.</p></article>
            <article className="feature-card"><span className="feature-number">03</span><h3>For the community</h3><p>Turn youth talent into service, mentorship, leadership, stronger organizations, and measurable pathways into college and careers.</p></article>
          </div>
        </section>

        <EmailOnlyEmployerSignup />

        <section className="section dark-band">
          <div className="container split-section">
            <div>
              <span className="kicker">Not another black box</span>
              <h2>AI reduces friction. It does not secretly decide a student’s future.</h2>
              <p>Gemini can structure text, improve writing, and surface context. MYIN’s deterministic 100-point rubric calculates fit across interests, skills, goals, availability, eligibility, location and format, and opportunity preference.</p>
              <Link className="button secondary" href="/ethics">See AI ethics and safety</Link>
            </div>
            <div className="rubric-card">
              {[['Interests',25],['Skills',20],['Career goals',15],['Availability',15],['Eligibility',10],['Location & format',10],['Opportunity type',5]].map(([label, points]) => (
                <div key={String(label)}><span>{label}</span><strong>{points} pts</strong></div>
              ))}
              <footer><span>Total</span><strong>100 pts</strong></footer>
            </div>
          </div>
        </section>

        <section className="section container future-teaser">
          <span className="kicker">Start authentic. Scale the values.</span>
          <h2>Built first for Muslim youth—not as a temporary skin, but as the core mission.</h2>
          <p>Long term, the same principles can support other underserved communities, schools, nonprofits, and youth networks without erasing the identity and trust that made MYIN meaningful.</p>
          <Link className="button" href="/future">Explore the future of MYIN</Link>
        </section>
      </main>
      <footer className="footer"><div className="container"><strong>MYIN 2026</strong><span>Hackathon prototype · Fictional demo data · Privacy-first by design</span></div></footer>
    </>
  );
}
