# WeThru website-first conversion preview — 2026-11-06

**Status: UNRELEASED FEATURE BRANCH. NO PRODUCTION DEPLOYMENT.**

Branch: `feat/website-first-conversion-20261106` from `main`. DO NOT merge, publish, alter GitHub Pages/Vercel DNS, edit CNAME, or map wethru.com to this branch without the owner's explicit approval.

## Purpose
Pivot the WeThru homepage from government-funded business plan/IR-first to:
1. industry-tailored website creation,
2. service/business proof and customer trust information,
3. clear search-readable SEO content with appropriate expectations about AEO/AI search,
4. consultation and actual booking handoff (bookings only after authorized live integrations).

Hero: "사업 하나 하는데, 준비할 게 이렇게나 많다고요?"
Audience: small owner-operated companies, interior/landscape contractors, beauty/appointment services, car detailing, professional services. Pain: buried portfolio, repetitive DM/phone Q&A, scattered service information, calendar back-and-forth, poor mobile discovery. No assertion that websites guarantee sales or AI search exposure.

## Files changed
- `index.html`: branch-only homepage, `noindex,nofollow`, original WeThru wordmark path retained.
- `content/website-first.html`: homepage canonical source for this branch.
- `css/website-first.css`: desktop/mobile styles, keyboard focus and reduced motion.
- `js/website-first.js`: lead form prefills **existing Google Form**; customer must press submit on Google Forms. No hidden lead capture. Optional booking UI fails closed until configured.
- `api/booking.js`: reusable multi-tenant Cal.com v2 server-side adapter, requires configured external backend and anti-abuse controls. GitHub Pages **cannot execute** this handler.
- `tools/build.mjs`: if website-first source exists, copies it to root `index.html`; otherwise previous business-plan site generator behavior remains.
- `docs/WEBSITE_FIRST_CONVERSION_PREVIEW.md`: this note.

## Local review without deployment
```bash
git clone https://github.com/ceoYS/Wethru_website.git
cd Wethru_website
git fetch origin feat/website-first-conversion-20261106
git switch --track origin/feat/website-first-conversion-20261106
node tools/build.mjs
python3 -m http.server 8080 --bind 127.0.0.1
# open http://127.0.0.1:8080/ on desktop or mobile emulator
```

Do not push changes to main or enable auto-deployment. Old approved pages and assets are retained on main.

## Status at commit time
- New website-first copy, layout, SEO text, industry pains, actual portfolio links, FAQ: **committed; visual/manual browser QA still required**.
- Website lead intake: existing Google Forms remains an actual submission option, but the homepage itself **does not submit** until the user completes Google Forms.
- Booking API: **code committed, NOT live**. No Cal.com credentials, event type, Turnstile keys, private policy or dedicated backend deployment have been activated or tested with real appointments.
- AI chat: **not implemented**. Do not describe this branch as a live AI chat agent. A structured FAQ/form and booking handoff should be tested before adding an LLM.
- Analytics/conversion improvement: **not verified**.
- Government business plan/IR: mentioned as secondary service, original detailed guide remains on main. No business plan/IR outcome guarantee.
- OG preview visual: original government-program image deliberately removed. Before production, create and approve a new accurate OG asset.

## Architecture after separate approval
One independent Vercel Node backend at an API subdomain; client sites call it with their own `tenant` IDs. An independent Cal.com event type and API key per provider. The three initial tenants would be `wethru`, `interior` (same host/calendar rules may be shared with WeThru where intended), and `ikki`. Never mix calendars, incoming leads or API permissions. Tenants are *server-configured*, never accepted wholesale from the visitor.

### Required secret configuration on a separate server
Do not put these in GitHub, a public JavaScript file, chat or source control.

```text
WETHRU_TENANTS_JSON={"wethru":{"eventTypeId":123,"apiKeyEnv":"CAL_API_KEY_WETHRU","origins":["https://wethru.com"]},"ikki":{"eventTypeId":456,"apiKeyEnv":"CAL_API_KEY_IKKI","origins":["https://ikkiarchive.com"]}}
CAL_API_KEY_WETHRU=<secret from operator's Cal.com account>
CAL_API_KEY_IKKI=<separately authorized secret from Ikki operator>
TURNSTILE_SECRET_KEY=<server-only secret>
```

All IDs above are **illustrative placeholders**, not existing event IDs. Enable each client only after its own schedule, host access, and customer consent policy have been confirmed. Clients set `window.WETHRU_BOOKING_API_BASE` to the separate backend origin and `window.WETHRU_TURNSTILE_SITE_KEY` to the approved *public* sitekey before loading `js/website-first.js`. The public sitekey is not a secret; the Turnstile secret stays server-side.

### API contract (after integration)
- `GET /api/booking?tenant=wethru&action=slots` → `{"slots":["2026-11-12T06:00:00.000Z",...]}`
- `POST /api/booking?tenant=wethru` JSON: `tenant,kind,service,url,pain,name,email,start,consent,turnstileToken` → only `accepted` or `pending` after a Cal.com booking UID is returned.
- Cal.com slot is rechecked server-side immediately before creating a booking. Cal.com is the booking source of truth; no client-side false confirmation.
- CORS origin, tenant map, server-side Turnstile verification and field validation are required. Add upstream request rate limiting/WAF, idempotent submission handling and retention policies before launch.

## Production release blockers / acceptance gates
1. Owner approves revised positioning, copy, logo, price (79만원 VAT 별도 basic package), specific scope and delivery terms.
2. Verify current portfolio URLs and any permission to publish Ikki as a case; no unsupported conversion metrics.
3. Confirm Google Forms checkbox options and privacy disclosure, and manual 2-way end-to-end submissions.
4. Set up tenant-specific Cal.com event types, authorized calendars, emails, anti-spam limits and privacy policy (including third-party processing and retention).
5. Real test on desktop and mobile: slots → one booking → actual email/calendar event → cancel/reschedule; error cases (conflict, double click, provider error, token expiry), accessibility and keyboard, broken images, contrast, page speed.
6. Explicitly decide when to add AI Q&A with a verified per-tenant knowledge base and human handoff; do not invent quotations, prices or available slots.
7. Review SEO canonical/OG; remove preview `noindex` only for approved production release and submit sitemap.
8. Verify no `main`, domain, GitHub Pages, Vercel production aliases or unrelated branches were changed. No release/merge without owner approval.

### Official technical references
- Google Search AI search basics: https://developers.google.com/search/docs/appearance/ai-features?hl=ko
- Naver Search Advisor: https://searchadvisor.naver.com/guide/report-seo
- Cal.com v2 API: https://cal.com/docs/api-reference/v2
- Cloudflare Turnstile client + server: https://developers.cloudflare.com/turnstile/get-started/
