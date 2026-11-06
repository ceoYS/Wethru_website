# WeThru — Editorial Website Benchmark & Design Rationale
Date: 2026-11-06
Status: review-only / `feat/website-first-conversion-20261106` / **NO PRODUCTION DEPLOYMENT**

## Benchmarked websites and decisions
Read official public websites; notes below are design interpretations, not a claim of exact measured colors or licensed design assets.

1. **Instrument** — https://www.instrument.com/ : primary directory for Work, Services, About, Latest, Contact; strongly prioritized selected work. Takeaway: put actual work early and let primary navigation explain the full studio scope.
2. **Work & Co** — https://www.work.co/ : explicit index for practice areas, outcomes, process, leadership and insights. Takeaway: separate important supporting materials without turning the hero into a massive sales brochure.
3. **PORTO ROCHA** — https://www.portorocha.com/ : typography-led directory with concise project labels. Takeaway: restrained accents, editorial rhythm, accessible work entry points; avoid imitating their copyrighted layouts/assets.

Secondary research:
- https://www.a1.gallery/type/agency
- https://10web.io/blog/agency-websites/

No competitor imagery, names, logos, copy or source code are reused on the site.

## Site architecture
Sticky header with six visitor intentions:
- 서비스 → `#services`
- 제작 사례 → `#work`
- 진행 방식 → `#process`
- WeThru 소개 → `#about`
- 자료실 → `#resources`
- 상담하기 → existing KakaoTalk channel (direct no required fields).

Secondary numbered page index under the hero repeats the section directory, including `#contact`. On small screens the header links become an accessible menu controlled by a button with expanded state and Escape/close-on-navigation. A compact CTA remains available.

Content order: clear hero → customer pain → services/pricing → selected real-work links → process → SEO/AEO rationale → about → resource links → FAQ → direct contact. Older business-plan/IR offering stays under "Other Services"; no false claims of performance, reviews or booking completions.

## Color direction: Warm Editorial
These are **WeThru proposals**, not copied or sampled from the benchmark websites:
- paper / warm off-white: `#F6F4F0`
- warm white: `#FFFEFC`
- stone: `#E8E4DC`
- charcoal: `#191D1C`
- muted sage: `#647166`
- deep green accent: `#365F53`

Do not return to the former bright-blue cards/large gradients. Use one restrained accent, high typography contrast, whitespace and simple dividers. Original WeThru wordmark continues from `assets/brand/wethru-wordmark.png`.

Font: Pretendard Variable via existing external stylesheet, local Pretendard subset as fallback. Check the font is actually loaded in computed styles on the target browser; remote font CDN may be blocked.

## Source files
Canonical page: `content/website-first.html`.
Generated synchronized root: `index.html`.
Styles: `css/website-first.css`.
Navigation/optional gtag click tracking: `js/website-first.js`.
Review-only build guard: `tools/build.mjs` prefers `content/website-first.html` on this branch.
Smoke tests: `tests/website-first.test.mjs`.

## Actual links and caveats
- Existing project `ikkiarchive.com` (the public project link previously used by WeThru). Site availability and publishing permission must be rechecked before public release; the text-only tile is **not** a screenshot.
- Interior service showcase `https://interior.wethru.com/` (not a client result).
- Actual company service and contract information `service-guide.html#websites`, file exists in repository.
- Business profile `https://profile.wethru.com/`.
- WeThru AI guide link `https://guides.wethru.com/#guide/harvey-core` — not consistently accessible from verification network; validate in an actual browser before launch.
- Existing Google Forms URL and KakaoTalk channel retained. New site does not collect, process or submit an on-page lead form.
- `api/booking.js` remains **unconnected**: no production API, Cal.com credentials, active AI assistant, booking confirmations or actual booking performance claims.

## QA gate: required before any release
```bash
git status --short
git branch --show-current
node tools/build.mjs
node --test tests/website-first.test.mjs
node --check js/website-first.js
python3 -m http.server 8081 --bind 127.0.0.1 --directory "$PWD"
```

Manual real-browser review at 390×844, 768×1024, 1440×900:
- no horizontal overflow, no broken typography; Pretendard computed
- sticky header always readable, hamburger menu keyboard/touch works, Escape and close-on-anchor
- every index link lands at correct section; navigation visible on desktop
- pages `ikkiarchive.com`, `interior.wethru.com`, `profile.wethru.com`, `guides.wethru.com` and the local service guide open
- direct KakaoTalk opens without an extra on-page form; customer must still send a message
- pricing disclaimer, SEO/AI search no-guarantee, and secondary services are accurate
- monitor layout shift, contrast, focus, SEO metadata and console errors
- compare branch `main` and ensure no updates to domain, DNS, CNAME, production Vercel/GitHub Pages and no branch merges

No automatic publishing or production aliases from this branch. User must explicitly approve release.
