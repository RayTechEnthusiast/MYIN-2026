import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function DemoGuidePage() {
  return (
    <>
      <SiteHeader />
      <main className="static-page">
        <section className="page-hero container"><span className="kicker">Judge-ready demonstration</span><h1>Show the product working. Explain the pitch while you click.</h1><p>No slide deck is needed during judging. Start already logged in and demonstrate the complete value loop in 3–5 minutes.</p></section>
        <section className="container section">
          <div className="demo-timeline">
            {[
              ["0:00–0:30", "Problem", "Opportunities are scattered; organizations cannot efficiently find the right youth."],
              ["0:30–1:15", "Student", "Show the rich profile, transparent 100-point match, faith-aware filters, confidence, and best recommended action."],
              ["1:15–2:00", "Organization + AI", "Paste rough opportunity text, let Gemini create an editable draft, reveal missing safety information, then publish."],
              ["2:00–2:35", "Connection", "Student expresses interest, organization sees the staged safe profile, and a controlled conversation opens."],
              ["2:35–3:00", "Impact + future", "Show portfolio proof, safety/ethics, community impact, and expansion beyond one community without erasing the Muslim mission."],
            ].map(([time,title,text]) => <article key={time}><strong>{time}</strong><div><h3>{title}</h3><p>{text}</p></div></article>)}
          </div>
        </section>
        <section className="container section scoring-grid">
          {[['Working demonstration','30','Nothing critical faked or skipped.'],['Innovation','30','Transparent AI + staged identity + two-sided matching.'],['Impact & relevance','25','Specific, believable benefit to Muslim youth and organizations.'],['Pitch clarity','15','Problem, solution, users, business model, and impact explained aloud.'],['AI bonus','+5','AI adds visible value while uncertainty and human review remain clear.']].map(([title,points,text]) => <article className="score-card" key={title}><strong>{points}</strong><h3>{title}</h3><p>{text}</p></article>)}
        </section>
        <section className="container section"><div className="notice warning"><strong>Reliability rule:</strong> if a risky integration is not proven in the deployed build, demo the polished fallback and state the limitation. Never claim real Gmail sending, production moderation, organization verification, or broad crawling.</div><Link className="button" href="/auth?mode=login">Enter demo account</Link></section>
      </main>
    </>
  );
}
