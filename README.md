# MYIN — Muslim Youth Internship Network (2026)

MYIN is a polished hackathon prototype connecting Muslim youth with internships, volunteering, mentorship, community projects, and urgent opportunities. It reduces scattered opportunity discovery while giving organizations a low-friction, safety-aware way to publish roles and find relevant youth talent.

## Core distinction

- Gemini assists with text structure and professional wording.
- MYIN's deterministic, explainable 100-point rubric ranks student-opportunity fit.
- AI output is reviewable and editable.
- Youth identity is staged before a controlled introduction.

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3001`.

### Demo accounts

- Student: `amina_test` / `demo123`
- Organization: `org_test` / `demo123`

You can also create new browser-local student and organization accounts. This is demo authentication, not production authentication.

## Gemini setup

Copy `.env.example` to `.env.local` and set a new server-only key:

```bash
GEMINI_API_KEY=your_new_key_here
GEMINI_MODEL=gemini-2.5-flash
```

Never prefix the key with `NEXT_PUBLIC_`. Never commit `.env` or `.env.local`.

Without a key, MYIN uses honest local fallback behavior:

- Profile enrichment uses a limited keyword/text parser.
- Opportunity extraction preserves the submitted text and surfaces missing fields.
- Professional wording uses a minimal cleanup fallback.
- Message moderation uses local safety rules.

## Main product flows

### Student

- Long profile onboarding with required and optional data
- Free-text profile enrichment with explicit consent and review
- `.txt` / `.md` resume import; no OCR or PDF parsing
- Explainable 100-point matching
- 70% minimum result threshold
- Filters for type, format, location, paid/unpaid, urgency, status, and faith-aware accommodations
- Match confidence and missing-data explanations
- Skill constellation and connection lenses: core edge, adjacent expansion, rounding opportunity
- Save, dismiss, express interest, email draft, and controlled messaging
- Opportunity Radar with ZIP/browser-location handling
- Printable and downloadable Proof Portfolio with verification labels

### Organization

- Account workflow or email-only organization start
- Safe single-page public website research, respecting robots restrictions and timeouts
- Gemini-assisted opportunity extraction into editable fields
- Missing safety information and extraction confidence
- Paid/unpaid and candidate metrics
- Staged candidate identity and privacy-safe profile view
- Controlled introduction requests and moderated demo messaging

### Ethics and safety

- Dedicated `/ethics` page
- Live synthetic fairness audit for irrelevant identity labels
- Deterministic matching
- Confidence as completeness, not truth
- Ethical-fit signals as disclosures, not moral judgment
- No unrestricted adult-to-minor direct messaging
- Explicit prototype limitations

## Matching rubric

- Interests: 25
- Skills: 20
- Career goals: 15
- Availability: 15
- Eligibility: 10
- Location and format: 10
- Opportunity-type preference: 5

Clearly ineligible students are capped below the visible 70% threshold.

## Validation

```bash
npm run typecheck
npm run test
npm run build
npm run start
```

Then smoke-test in a private browser window and on a phone-sized viewport.

## Render

A starter `render.yaml` is included. Add `GEMINI_API_KEY` only in Render environment variables. After every deployment attempt, use the newest build log as the source of truth.

## Hackathon demo path

1. Begin already logged in as the organization.
2. Paste a rough opportunity description.
3. Show Gemini or the safe fallback creating an editable review draft.
4. Confirm safety fields and publish.
5. Switch to the student account.
6. Show the 100-point score and explanation.
7. Express interest and draft an email.
8. Switch back to the organization.
9. Open the privacy-safe candidate profile and request a controlled introduction.
10. Close with ethics, impact, and future expansion.

## Known prototype limitations

- Browser-local accounts and data
- No production database or identity verification
- No real Gmail sending
- No broad web crawler
- No OCR
- No production moderation or religious rulings
- No real guardian approval infrastructure
- Demo verification badges and fictional data only

## License

MIT
