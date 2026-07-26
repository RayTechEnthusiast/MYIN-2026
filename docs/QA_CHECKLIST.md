# MYIN Hackathon QA Checklist

Mark each item only after testing the exact build being demonstrated.

## Accounts and profile

- [ ] Student demo login: `amina_test` / `demo123`
- [ ] Organization demo login: `org_test` / `demo123`
- [ ] Create a new student account; entered name appears in header and profile
- [ ] Create a new organization account; entered name appears everywhere
- [ ] Explicit login and signup buttons work from landing page
- [ ] Browser-local account warning is visible
- [ ] Legacy profile migration does not crash unknown data
- [ ] Profile inputs accept spaces, punctuation, paste, and multiline text
- [ ] Profile saves and survives refresh
- [ ] `.txt` and `.md` import works
- [ ] Unsupported file type gives an honest error
- [ ] Profile enrichment with Gemini key
- [ ] Profile enrichment without Gemini key
- [ ] AI suggestions require review before save
- [ ] “Make it professional” preserves facts

## Opportunity results

- [ ] Default sort is best fit
- [ ] Nothing below 70% appears
- [ ] Match score totals to 100 or less
- [ ] Strong, partial, weak, and ineligible cases behave correctly
- [ ] Ineligible case is capped below 70%
- [ ] Type filters
- [ ] Remote / hybrid / in-person filters
- [ ] Paid / unpaid filter
- [ ] Distance filter
- [ ] Strong availability filter
- [ ] Urgent filter
- [ ] Prayer space filter
- [ ] Prayer-break filter
- [ ] Halal-food filter
- [ ] Jumu’ah filter
- [ ] Experience-level filter
- [ ] Deadline filter
- [ ] Saved / applied / not-interested states
- [ ] Sort by match, newest, nearest, deadline, and urgency
- [ ] Save, dismiss, and interest actions survive refresh
- [ ] Double interest click does not create duplicate records
- [ ] View opportunity opens real details
- [ ] Today’s email “View opportunity” opens details
- [ ] Email draft, approval, and copied states are distinct
- [ ] No claim that email was sent

## Confidence, ethics, and safety

- [ ] Match confidence explains profile and listing inputs
- [ ] Missing information is visible
- [ ] Ethical-fit signals are described as disclosures, not moral judgment
- [ ] Fairness audit shows identical scores when only identity label changes
- [ ] Safe candidate profile opens
- [ ] Safe candidate profile hides email, phone, school, and precise address
- [ ] Student controls first interest signal
- [ ] Organization cannot start a conversation without student interest
- [ ] Controlled introduction request changes status
- [ ] Off-platform contact language is flagged
- [ ] Private-location or “meet alone” language is flagged
- [ ] UI does not claim automated halal/haram rulings
- [ ] Reporting / blocking / audit language is visible as future production work

## Organization workflow

- [ ] Rough opportunity text extracts with Gemini key
- [ ] Extraction without key uses honest local fallback
- [ ] Empty or short description is rejected clearly
- [ ] Original text is preserved after failure
- [ ] Extracted fields are editable
- [ ] Missing supervision, location, or deadline blocks publication
- [ ] Published listing appears immediately for students
- [ ] Paid/unpaid metrics update
- [ ] Candidate shortlist updates
- [ ] Website research accepts a public URL
- [ ] Invalid URL is rejected
- [ ] Local/private network URL is rejected
- [ ] Robots “Disallow: /” is respected
- [ ] Website timeout/failure produces a reviewable minimal draft
- [ ] Nothing is automatically published or emailed

## Opportunity Radar

- [ ] Valid ZIP search
- [ ] Invalid ZIP
- [ ] No geocoder result
- [ ] Browser location allowed
- [ ] Browser location denied
- [ ] External service failure fallback
- [ ] Markers are color-coded by score
- [ ] Clicking a marker opens opportunity details
- [ ] Discovery-lead disclaimer is visible

## Portfolio

- [ ] Print view
- [ ] Save as PDF through browser print dialog
- [ ] Text portfolio download
- [ ] Self-entered, organization-confirmed, and verified evidence are distinct
- [ ] Mobile portfolio remains readable

## Landing, layout, and deployment

- [ ] Every landing CTA works
- [ ] Mission section is visible below hero
- [ ] Ethics page works
- [ ] Future page works
- [ ] Demo guide works
- [ ] Student layout at phone width
- [ ] Organization layout at phone width
- [ ] Empty, loading, error, and success states
- [ ] Browser console has no critical error
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] `npm run start` production smoke test
- [ ] Public deployment opens in incognito
- [ ] Public deployment works on a second device
- [ ] `/api/health` returns success
- [ ] No `.env` committed
- [ ] No Gemini key in browser source, Git history, logs, screenshots, or responses
- [ ] Local backup works
- [ ] Backup screen recording exists
