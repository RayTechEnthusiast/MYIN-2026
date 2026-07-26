# MYIN — Muslim Youth Internship Network

<p align="center">
  <img src="./public/myin-logo.png" alt="MYIN logo" width="220" />
</p>

<p align="center">
  <strong>One trusted network. Two sides of the connection.</strong><br />
  Connecting Muslim youth with meaningful opportunities while helping community organizations understand, prepare for, and reach emerging youth talent.
</p>

<p align="center">
  <a href="https://myin-2026.onrender.com">Live Demo</a> ·
  <a href="https://myin-2026.onrender.com/demo-guide">Demo Guide</a> ·
  <a href="https://myin-2026.onrender.com/ethics">AI Ethics & Safety</a>
</p>

---

## Hackathon submission

MYIN was built for **MYHack 2026**, a Muslim youth hackathon focused on technology for social good.

This repository contains the working prototype developed during the official hacking window. Pre-event preparation was limited to problem exploration and visual planning; implementation and integration were completed during the event. The project is publicly available and licensed under the **MIT License**.

### Submission links

- **Live application:** https://myin-2026.onrender.com
- **Source code:** https://github.com/RayTechEnthusiast/MYIN-2026
- **Demo guide:** https://myin-2026.onrender.com/demo-guide
- **Ethics and safety:** https://myin-2026.onrender.com/ethics
- **License:** [MIT](./LICENSE)
- **Recorded demo and pitch deck:** provided through the final MYHack Devpost submission

---

## Short description

**MYIN is a two-sided opportunity intelligence platform for Muslim youth and community organizations.**

Students discover internships, volunteering, mentorship, leadership, and community projects through transparent, explainable matching. Organizations can turn rough opportunity ideas into safe, editable listings, identify gaps between youth interests and current community offerings, and receive privacy-safe weekly talent briefings.

MYIN does not use AI as an unexplained hiring authority. Gemini assists with text structure, research, and professional wording, while a deterministic 100-point rubric calculates student-opportunity fit. Human review remains required before publishing opportunities or acting on recommendations.

---

## The problem

Muslim youth opportunities are often scattered across:

- WhatsApp groups
- Mosque announcements
- Email chains
- Social media posts
- Flyers
- Personal networks
- Informal word of mouth

This fragmentation creates two connected failures:

1. **Youth miss opportunities** that match their interests, skills, schedule, location, faith needs, and experience level.
2. **Organizations lack visibility into youth demand**, so they may create too few roles, create the wrong roles, or struggle to find prepared candidates.

The talent already exists. The connection system does not.

---

## Our solution

MYIN improves both sides of the opportunity market.

### For students

- Build a detailed youth profile
- Import `.txt` or `.md` resume information
- Receive explainable opportunity matches out of 100
- See exactly why an opportunity fits
- Filter by opportunity type, format, location, schedule, compensation, urgency, and faith-aware accommodations
- Receive a grounded Growth Plan based on current opportunity demand
- Save, dismiss, or express interest in opportunities
- Build a printable Proof Portfolio with clearly labeled verification status

### For organizations

- Create an organization account or use the email-only pilot flow
- Turn rough opportunity text into an editable structured draft
- Research a public organization page with controlled, single-page retrieval
- Review missing safety information before publishing
- See privacy-safe candidate signals
- Request controlled introductions rather than unrestricted direct access to minors
- Use Community Opportunity Gap Radar to compare youth demand with current opportunity supply
- Receive a weekly Gmail talent brief focused on the employer's selected areas

### Two-way opportunity intelligence

MYIN does not only match existing supply and demand.

It also:

- helps students prepare for the opportunities organizations need filled;
- helps organizations create the opportunities youth actually need;
- identifies community gaps using aggregate, privacy-aware signals;
- recommends editable opportunity concepts rather than making automatic decisions.

> **MYIN helps organizations create what youth need and helps students prepare for what employers need.**

---

## Why this creates social good

MYIN strengthens the Muslim community by making access to opportunity more transparent, equitable, and actionable.

The platform can help:

- youth without strong personal networks discover meaningful pathways;
- mosques and Muslim nonprofits recruit youth more effectively;
- small organizations create safer and clearer opportunities;
- students build evidence of service, leadership, and technical growth;
- communities understand where youth demand is not being met;
- organizations convert youth talent into mentorship, service, education, and career development.

The long-term goal is not simply more listings. It is a stronger pipeline between Muslim youth potential and community impact.

---

## Islamic relevance

MYIN is built around the needs of Muslim youth rather than applying Islamic branding after the fact.

Faith-aware product considerations include:

- Jumu'ah availability
- prayer-break flexibility
- prayer-space disclosures
- halal-food disclosures
- modesty and supervision considerations
- community service and mentorship pathways
- controlled adult-to-minor introductions
- transparency, consent, privacy, and human responsibility

The platform does not issue religious rulings or judge a person's faith. Faith-related fields are treated as practical disclosures that help students and organizations make informed decisions.

---

## Meaningful and ethical use of AI

MYIN separates **generative assistance** from **decision logic**.

### Gemini assists with

- structuring rough opportunity descriptions;
- improving professional wording;
- enriching profile text after user consent;
- extracting editable fields;
- surfacing missing information;
- supporting controlled organization research;
- generating contextual summaries.

### Gemini does not

- secretly decide who deserves an opportunity;
- publish an opportunity without human review;
- expose private student contact details;
- replace eligibility requirements;
- make religious judgments;
- present generated confidence as objective truth.

### Explainable matching

Student-opportunity ranking is produced by a deterministic rubric:

| Category | Points |
|---|---:|
| Interests | 25 |
| Skills | 20 |
| Career goals | 15 |
| Availability | 15 |
| Eligibility | 10 |
| Location and format | 10 |
| Opportunity-type preference | 5 |
| **Total** | **100** |

Only eligible matches scoring at least **70%** are shown as recommended results. Clearly ineligible students are capped below the visible threshold.

Match confidence represents profile and listing completeness—not certainty, truth, worth, or hiring quality.

---

## Privacy and youth safety

MYIN is designed as a youth opportunity network, so privacy and supervision are core product requirements.

Current safeguards include:

- staged student identity for organizations;
- initials instead of contact information in weekly briefs;
- no unrestricted adult-to-minor direct messaging;
- controlled introduction requests;
- moderated demo messaging;
- explicit consent before AI profile enrichment;
- human review before opportunity publication;
- aggregate-only Community Opportunity Gap Radar;
- a 70% recommendation threshold;
- visible confidence and missing-data explanations;
- synthetic data throughout the hackathon demonstration.

A production version would add verified organizations, guardian workflows where appropriate, persistent consent records, minimum cohort privacy thresholds, reporting tools, unsubscribe controls, professional moderation, and audited data retention policies.

---

## Key features

### Student experience

- Detailed onboarding and profile editor
- Explainable 100-point matching
- Faith-aware opportunity filters
- Opportunity Readiness Coach
- Skill constellation and connection lenses
- Opportunity Radar
- Saved and dismissed opportunities
- Interest workflow and email drafting
- Proof Portfolio with verification labels

### Organization experience

- Organization onboarding
- AI-assisted opportunity drafting
- Public-page organization research
- Editable safety and eligibility fields
- Opportunity publishing workflow
- Candidate matching and privacy-safe profiles
- Community Opportunity Gap Radar
- Recommended opportunity creation
- Controlled introduction requests
- Weekly Gmail Talent Brief

### Weekly employer briefing pilot

The pilot briefing:

- is sent from a server-authorized Gmail account;
- runs through a protected Next.js endpoint;
- is scheduled by GitHub Actions every Monday;
- filters around configured employer focus areas;
- includes each student at most once;
- selects each student's strongest relevant pathway;
- shows privacy-safe initials rather than contact details;
- includes community opportunity gaps;
- clearly discloses that the current cohort is synthetic demo data.

The public quick-signup form currently supports one preconfigured pilot employer email. It sends a real confirmation email but does not claim to be a production mailing-list system.

---

## Architecture

```text
Browser
  ├─ Landing page and mobile-responsive hero
  ├─ Student and organization dashboards
  ├─ Browser-local demo accounts and state
  └─ Email-only employer signup

Next.js server routes
  ├─ Gemini-assisted profile and opportunity tools
  ├─ Controlled organization research
  ├─ Message moderation
  ├─ Opportunity intelligence
  ├─ Gmail OAuth token exchange
  ├─ Weekly briefing generation
  └─ Protected weekly-send endpoint

External services
  ├─ Google Gemini API
  ├─ Gmail API
  ├─ GitHub Actions scheduler
  └─ Render hosting
```

### Data approach

- Student and organization demo accounts are stored in the browser.
- Seeded profiles and opportunities are fictional and synthetic.
- Gmail credentials and API keys remain server-side.
- No production database is included in the hackathon prototype.
- No real student contact information is used in the demonstration.

---

## Technology stack

- **Framework:** Next.js 16
- **UI:** React 19
- **Language:** TypeScript
- **Validation:** Zod
- **AI:** Google Gemini API
- **Email:** Gmail API with OAuth 2.0 refresh-token flow
- **Scheduling:** GitHub Actions
- **Hosting:** Render
- **Testing:** Node test runner through `tsx`
- **License:** MIT

---

## Run locally

### Requirements

- Node.js **22.13.0 or newer**
- npm

### Installation

```bash
git clone https://github.com/RayTechEnthusiast/MYIN-2026.git
cd MYIN-2026
npm install
```

### Environment setup

Create `.env.local` in the repository root.

```env
# Gemini — optional because honest local fallbacks are available
GEMINI_API_KEY=your_server_side_key
GEMINI_MODEL=gemini-3.6-flash

# Gmail weekly pilot — required only for real pilot email delivery
GMAIL_CLIENT_ID=your_google_oauth_client_id
GMAIL_CLIENT_SECRET=your_google_oauth_client_secret
GMAIL_REFRESH_TOKEN=your_google_refresh_token
GMAIL_SENDER_EMAIL=authorized_sender@gmail.com

# Single-employer pilot configuration
WEEKLY_EMPLOYER_NAME=Crescent Robotics
WEEKLY_EMPLOYER_EMAIL=pilot-recipient@example.com
WEEKLY_EMPLOYER_FOCUS_AREAS=Technology,Robotics,Engineering
WEEKLY_CRON_SECRET=generate_a_long_random_secret
```

Security rules:

- Never prefix secrets with `NEXT_PUBLIC_`.
- Never commit `.env`, `.env.local`, OAuth tokens, or API keys.
- The Gmail sender must match the account authorized through OAuth.
- The same `WEEKLY_CRON_SECRET` must be configured in Render and GitHub Actions.

### Start development

```bash
npm run dev
```

Open:

```text
http://localhost:3001
```

---

## Demo accounts

| Role | Username | Password |
|---|---|---|
| Student | `amina_test` | `demo123` |
| Organization | `org_test` | `demo123` |

These are fictional browser-local demo accounts, not production authentication.

---

## Validation

Run the complete local check:

```bash
npm run typecheck
npm run test
npm run build
```

The automated test suite covers:

- bounded and explainable matching;
- ineligible-student score protection;
- deterministic behavior under irrelevant identity changes;
- missing-skill edge cases;
- grounded student growth recommendations;
- aggregate community intelligence privacy;
- weekly email demo disclosures;
- unique, employer-relevant candidate selection.

After automated checks, smoke-test:

- the landing page on desktop;
- the mobile hero at narrow phone widths;
- student and organization demo logins;
- opportunity creation and matching;
- the email-only employer signup;
- the health and Gmail-status endpoints.

---

## Important routes

| Route | Purpose |
|---|---|
| `/` | Public landing page and employer email signup |
| `/auth` | Demo authentication |
| `/app` | Student and organization application |
| `/demo-guide` | Recommended judging path |
| `/ethics` | AI ethics, privacy, safety, and fairness |
| `/future` | Long-term product direction |
| `/api/health` | Deployment health check |
| `/api/gmail/weekly/status` | Non-secret weekly pilot configuration status |
| `/api/gmail/weekly/send` | Protected weekly briefing sender |
| `/api/pilot-employer/signup` | Single-employer pilot confirmation |

---

## Deployment on Render

The repository includes `render.yaml` with:

- Node runtime
- `npm ci && npm run build`
- `npm start`
- `/api/health` health check
- Node.js 22 configuration

Add all required secrets through the Render Environment dashboard. Do not place secret values in `render.yaml` or source control.

After deployment, verify:

```text
https://myin-2026.onrender.com/api/health
https://myin-2026.onrender.com/api/gmail/weekly/status
```

The Gmail status endpoint should report:

```json
{
  "configured": true,
  "missingCount": 0
}
```

---

## Weekly automation

The GitHub Actions workflow is located at:

```text
.github/workflows/weekly-talent-brief.yml
```

It can be run manually and is also scheduled weekly. The repository must contain an Actions secret named:

```text
WEEKLY_CRON_SECRET
```

That value must exactly match the Render environment variable with the same name.

---

## Recommended judge demo

1. Open the mobile-responsive landing page through the QR code.
2. Explain the fragmented-opportunity problem.
3. Log in as the organization.
4. Paste a rough opportunity description.
5. Show Gemini creating an editable draft rather than auto-publishing.
6. Confirm safety and eligibility fields, then publish.
7. Switch to the student demo account.
8. Show the explainable score, breakdown, and confidence.
9. Open the student's Growth Plan.
10. Return to the organization and show Community Opportunity Gap Radar.
11. Show the email-only pilot and privacy-safe weekly Gmail brief.
12. Close on ethics, Islamic relevance, community impact, and scalability.

---

## How MYIN maps to the judging criteria

### Impact

MYIN addresses a real Muslim-community problem: disconnected youth, scattered opportunities, and organizations that lack clear youth-demand signals.

### Innovation

The project combines explainable matching with two-way opportunity intelligence. It improves both the supply of opportunities and the readiness of youth rather than functioning as a basic listing board.

### Feasibility

The prototype is deployed, mobile-responsive, testable through demo accounts, and built with a realistic web stack. The email pilot proves an organization can receive automated value without repeatedly opening the platform.

### Technical execution

MYIN includes typed data models, server-side API routes, deterministic scoring, validation, automated tests, OAuth-based Gmail delivery, protected automation, responsive UI, and a deployment health check.

### Presentation

The repository includes a dedicated demo guide, realistic synthetic data, clear demo accounts, and a QR-accessible live deployment.

### Use of AI

AI is used for high-friction language and structuring tasks, while matching and eligibility remain deterministic and explainable. Human review is required before consequential actions.

### Islamic relevance

The product is built around Muslim youth, Muslim organizations, service, mentorship, community development, prayer accommodations, Jumu'ah flexibility, privacy, consent, and responsible stewardship.

---

## What inspired us

We saw that Muslim youth often have ability and ambition but lack one trusted place to discover relevant opportunities. At the same time, Muslim organizations frequently need help from young people but do not always know what youth are interested in, what skills they have, or how to design accessible entry-level roles.

MYIN was inspired by the belief that community talent should not depend entirely on who someone already knows.

---

## Challenges we faced

- Designing meaningful AI features without turning AI into a hidden decision-maker
- Creating a transparent score that stays understandable to students and judges
- Protecting youth privacy while still showing organizations useful talent signals
- Demonstrating community analytics without exposing small-group identities
- Integrating Gmail OAuth and scheduled delivery within a hackathon timeframe
- Keeping the prototype honest about browser-local data and production limitations
- Making the animated hero scale correctly on narrow mobile screens used through the judge QR code
- Balancing feature depth with a reliable end-to-end demonstration

---

## What we learned

- AI is most trustworthy when its role is narrow, visible, and reviewable.
- Explainability is part of the product experience, not only a technical detail.
- A marketplace becomes more useful when it improves both supply and demand.
- Youth platforms require privacy and supervision decisions from the beginning.
- A smaller working pilot is more persuasive than an oversized unfinished promise.
- Mobile testing matters when the first judge interaction begins with a QR code.

---

## Known prototype limitations

- Browser-local demo authentication and application state
- No production database
- No real identity or organization verification
- One preconfigured employer for the Gmail pilot
- Synthetic student profiles, organizations, opportunities, and metrics
- No production guardian-consent infrastructure
- No production moderation team or reporting workflow
- No OCR or PDF resume parsing
- No broad web crawler
- Controlled single-page public research only
- Gmail OAuth testing configuration may require future production verification
- Weekly briefing subscriptions and unsubscribe state are not persisted
- Community insights demonstrate the concept with synthetic aggregate data

These limitations are disclosed throughout the product so the prototype does not misrepresent its current maturity.

---

## Future roadmap

### Phase 1 — Hackathon prototype

- Explainable matching
- AI-assisted opportunity creation
- Growth Plan
- Community Opportunity Gap Radar
- Weekly Gmail employer pilot
- Mobile-responsive live deployment

### Phase 2 — Community pilot

- Persistent database
- Verified organizations
- Real consented youth profiles
- Subscription and unsubscribe controls
- Organization-admin roles
- Guardian and supervision workflows
- Auditable introductions and messaging

### Phase 3 — Scaled network

- Multi-masjid and regional opportunity networks
- Schools, nonprofits, and youth-development partners
- Longitudinal skill and service portfolios
- Community workforce and mentorship analytics
- Privacy-preserving regional demand signals
- Integrations with calendars, applicant tracking, and volunteer systems

---

## Project originality, assets, and licenses

- The project implementation in this repository was created for MYHack 2026.
- The project uses openly available development frameworks, APIs, and SDKs.
- The prototype uses fictional and synthetic demonstration data.
- Team-created source code is released under the MIT License.
- Third-party packages and services remain governed by their respective licenses and terms.
- No secret keys, OAuth credentials, or private student data should ever be committed.

See [`LICENSE`](./LICENSE) for the full project license.

---

## Team

Built by the **MYIN Hackathon Team** for MYHack 2026.

All official team members and short biographies should be listed in the final Devpost submission.

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

<p align="center">
  <strong>MYIN does not just match supply and demand. It improves both.</strong>
</p>
