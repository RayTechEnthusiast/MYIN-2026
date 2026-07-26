# Architecture and Data Boundaries

## Client

- Next.js App Router UI
- Browser-local demo accounts and state
- Deterministic matching in `lib/matching.ts`
- Fictional seed data in `lib/seed.ts`
- No API key in client code

## Server routes

- `/api/profile-enrich`: user-approved free-text enrichment
- `/api/professionalize`: fact-preserving writing improvement
- `/api/opportunity-extract`: opportunity structure and missing fields
- `/api/org-research`: one public page or employer-supplied content
- `/api/opportunity-radar`: ZIP or browser-coordinate centering
- `/api/moderate-message`: assistive safety review, not religious judgment
- `/api/health`: deployment health check

## Matching

The ranking is deterministic and does not send student profiles to Gemini.

- Interests: 25
- Skills: 20
- Career goals: 15
- Availability: 15
- Eligibility: 10
- Location and format: 10
- Opportunity type: 5

## Production work not claimed by this prototype

- Real authentication and role authorization
- Shared database
- Verified organizations and background checks
- Guardian consent infrastructure
- Trained human moderation and escalation
- Gmail OAuth and sending
- Large-scale crawling
- Legal and safeguarding review
