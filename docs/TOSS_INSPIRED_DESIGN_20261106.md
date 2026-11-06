# WeThru — Toss-inspired design revision / 2026-11-06

**Status: PREVIEW ONLY, NOT DEPLOYED.**
Branch: `feat/toss-inspired-pretendard-20261106`
Base: `feat/website-first-conversion-20261106`
Do not merge to `main`, change GitHub Pages or Vercel production branch/aliases, connect `wethru.com`, or update DNS without explicit owner approval.

## Official research and adaptation
- [Toss official brand resources](https://brand.toss.im/): Toss Blue is **#0064FF** and Toss Gray is **#202632**. Those are Toss brand colors; WeThru only borrows a restrained functional-blue approach as a design study; the existing WeThru wordmark remains unchanged.
- [Toss Tech, brand research about brand recognition](https://toss.tech/article/43061): white space, dark bold text, blue signifier are recognizable in combination. We adapt **layout principles**, not brand assets.
- [Toss Tech, TDS palette update](https://toss.tech/article/tds-color-system-update): semantic roles for colors (target/role/variant), harmonized visual contrast and accessibility. We use role-based CSS tokens and avoid decorative random shades.
- [Toss design system on accessibility](https://toss.tech/article/toss-design-system): typography and controls should work at various viewport sizes and sizes.

This is an independent WeThru website. No Toss logo, imagery, source code, distinctive UI text, interface screenshots, or trademarks are included.

## Proposed WeThru role-based tokens
- `--white: #FFFFFF`: main surface (dominant)
- `--surface: #F7F8FA`: alternate neutral section
- `--surface-blue: #F3F7FF`: only occasional search/feature section
- `--ink: #191F28`: text
- `--text-secondary: #4E5968`: body descriptions
- `--text-tertiary: #6B7684`: microcopy
- `--border: #E5E8EB`: dividers
- `--blue: #0064FF`: CTA, small accent, active state — **reference to Toss blue**; this can be adjusted to a unique WeThru shade before production signoff
- `--blue-hover: #0056D9`: button hover
- `--blue-pale: #EAF2FF`: small visual accents

No former warm-ivory, sage-green or charcoal section blocks. White-first UI with an occasional, limited blue contact section.

## Font implementation
- Main `index.html` and `service-guide.html`: Pretendard Variable v1.3.9 dynamic subset stylesheet included.
- Self-hosted `assets/fonts/pretendard-wt.woff2` as local Pretendard fallback. The file already exists in this repo; no new font file was added.
- Main stylesheet body font stack: `'Pretendard Variable','Pretendard Local', ...`
- Inspect the actual browser Fonts panel/Network tab before signoff: CSS declarations do **not** prove that remote font loaded. If corporate network blocks CDN, local WOFF2 should be used. Verify Korean glyph shaping and synthetic bold weights.

## Conversion and product copy
- Hero retains user-approved question: “사업 하나 하는데, 준비할 게 이렇게나 많다고요?”
- Above-fold clear product: web design, SEO structure and consultation handoff.
- Top navigation: Services, Work, Process, About, Resources. Direct Kakao CTA is always present.
- Reduced redundant section index beneath hero (was duplicate navigation); simpler content progression.
- Right-side hero mock depicts a general website with services, past work, and contact. Explicitly labeled **not** an actual live-booking interface.
- Direct Kakao inquiry is the primary no-form CTA; Google Forms and email remain backups. Contact is not confirmed until customer sends the message.
- Separate `api/booking.js` is **NOT connected to an actual booking calendar**. No live AI assistant or appointment booking claims.
- Original company identity, services, pricing (79만원부터; scope and VAT disclosure), project links, FAQ and resources remain. No invented reviews, conversion improvement or SEO guarantees.

## Changed files
- `content/website-first.html`: canonical homepage source
- `index.html`: synchronized preview output
- `css/website-first.css`: color tokens, Pretendard, typography, responsive layout
- `service-guide.html`: Pretendard loaded, body content not changed
- `tests/website-first.test.mjs`: new regression checks
- This design note

## Review / test locally
```bash
git switch feat/toss-inspired-pretendard-20261106
node tools/build.mjs
node --test tests/website-first.test.mjs
node --check js/website-first.js
python3 -m http.server 8081 --bind 127.0.0.1 --directory "$PWD"
```
Open `http://127.0.0.1:8081/index.html` in a local desktop browser. Do not serve your WSL home directory. If 8081 is in use, stop the earlier server or use 8082.

## Release gates
1. Review actual layout at 390×844, 768×1024, 1440×900; typography readability and contrast.
2. Confirm Fonts panel shows Pretendard (variable font or local fallback) for Korean headings/body.
3. Confirm all navigation, examples, real portfolio links, and 1-click Kakao CTA work.
4. Manually verify service-guide URL/anchor and exact policy/pricing.
5. Compare with `main`; no production release/merge/aliases/dns updates.
6. Do not say AI/booking is live. Real booking requires tenant calendars, secrets, privacy and end-to-end tests.
