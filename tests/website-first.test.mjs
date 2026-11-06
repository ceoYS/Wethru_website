// Run: node --test tests/website-first.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const home = read('index.html');
const source = read('content/website-first.html');
const booking = read('api/booking.js');
const frontend = read('js/website-first.js');
const css = read('css/website-first.css');
test('branch-only homepage matches the canonical source', () => {
 assert.equal(home, '<!-- REVIEW BRANCH ONLY: no production deployment; source content/website-first.html -->\n' + source);
});
test('core positioning stays direct and SEO/AEO without unsupported promises', () => {
 assert.match(home, /사업 하나 하는데,/);
 assert.match(home, /대표님의 서비스가 좋아도/);
 assert.match(home, /홈페이지 제작/);
 assert.match(home, /SEO/);
 assert.match(home, /AI 검색/);
 assert.match(home, /검색 순위·AI 추천·매출 증가는 보장하지 않습니다/);
 assert.doesNotMatch(home, /hero-zolv|wethru-v7-og\.png/);
});
test('Pretendard Variable is loaded with font-family priority', () => {
 assert.match(home, /pretendardvariable-dynamic-subset\.min\.css/);
 assert.match(css, /font:16px\/1\.7 'Pretendard Variable',Pretendard/);
});
test('contact is one click with optional alternative channels', () => {
 assert.match(home, /href="https:\/\/pf\.kakao\.com\/_wRVBX\/chat"[^>]*data-track="hero_kakao"/);
 assert.match(home, /href="https:\/\/pf\.kakao\.com\/_wRVBX\/chat"[^>]*data-track="contact_kakao"/);
 assert.match(home, /https:\/\/forms\.gle\/d66adwLQzBpE8VDg6/);
 assert.match(home, /mailto:ceo@nitual\.com/);
 assert.doesNotMatch(home, /<form\b/);
 assert.doesNotMatch(home, /id="check-slots"/);
 assert.doesNotMatch(home, /예약 완료되었습니다|예약 확정되었습니다/);
});
test('review branch remains unreleased and back-end booking is not falsely live', () => {
 assert.match(home, /name="robots" content="noindex,nofollow"/);
 assert.match(read('docs/WEBSITE_FIRST_CONVERSION_PREVIEW.md'), /NO PRODUCTION DEPLOYMENT/);
 assert.match(booking, /TURNSTILE_SECRET_KEY/);
 assert.match(booking, /WETHRU_TENANTS_JSON/);
 assert.match(booking, /return bad\(res,503/);
});
test('CTA script tracks only when analytics is configured', () => {
 assert.match(frontend, /typeof window\.gtag === 'function'/);
 assert.match(frontend, /data-track/);
 assert.doesNotMatch(frontend, /fetch\(|Google Forms/);
 assert.match(home, /css\/website-first\.css/);
 assert.match(home, /js\/website-first\.js/);
});
