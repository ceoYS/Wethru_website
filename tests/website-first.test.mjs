// Run on the preview branch: node --test tests/website-first.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const home=read('index.html'),source=read('content/website-first.html'),css=read('css/website-first.css'),
  frontend=read('js/website-first.js'),booking=read('api/booking.js');
test('preview source and generated index match',()=>{
 assert.equal(home,'<!-- REVIEW BRANCH ONLY: no production deployment; source content/website-first.html -->\n'+source);
});
test('brand and user-approved website-first positioning remain',()=>{
 assert.match(home,/사업 하나 하는데,/);
 assert.match(home,/서비스가 좋아도/);
 assert.match(home,/홈페이지 제작/);
 assert.match(home,/SEO/);
 assert.match(home,/AI 검색/);
 assert.match(home,/검색 순위, AI 추천, 매출 증가는 보장하지 않습니다/);
 assert.doesNotMatch(home,/hero-zolv|wethru-v7-og\.png/);
});
test('Pretendard Variable with non-neon editorial palette',()=>{
 assert.match(home,/pretendardvariable-dynamic-subset\.min\.css/);
 assert.match(css,/font-family:'Pretendard Variable',PretendardLocal/);
 assert.match(css,/#F6F4F0/);
 assert.match(css,/#191D1C/);
 assert.match(css,/#365F53/);
 assert.doesNotMatch(css,/#4382FE|#347afa/i);
});
test('header navigation, index directory and all section targets exist',()=>{
 assert.match(home,/aria-label="주요 목차"/);
 assert.match(home,/aria-label="페이지 목차"/);
 for (const id of ['services','work','process','about','resources','contact']) {
  assert.match(home,new RegExp('href="#'+id+'"'));
  assert.match(home,new RegExp('id="'+id+'"'));
 }
 assert.match(home,/aria-controls="primary-nav"/);
 assert.match(frontend,/menuToggle/);
 assert.match(frontend,/aria-expanded/);
 assert.match(frontend,/Escape/);
});
test('about includes grounded operator and resource links',()=>{
 assert.match(home,/주식회사 나이츄얼랩스/);
 assert.match(home,/service-guide\.html#websites/);
 assert.match(home,/profile\.wethru\.com/);
 assert.match(home,/interior\.wethru\.com/);
 assert.match(home,/guides\.wethru\.com/);
});
test('simple real-channel inquiry with no mandatory on-site form or dead booking CTA',()=>{
 assert.match(home,/href="https:\/\/pf\.kakao\.com\/_wRVBX\/chat"[^>]*data-track="hero_kakao"/);
 assert.match(home,/href="https:\/\/pf\.kakao\.com\/_wRVBX\/chat"[^>]*data-track="contact_kakao"/);
 assert.match(home,/forms\.gle\/d66adwLQzBpE8VDg6/);
 assert.match(home,/mailto:ceo@nitual\.com/);
 assert.doesNotMatch(home,/<form\b/);
 assert.doesNotMatch(home,/id="check-slots"|id="booking-submit"/);
 assert.match(home,/AI 상담·예약·별도 운영 서비스는 추가 협의/);
});
test('pre-release guards and booking backend remain separate',()=>{
 assert.match(home,/name="robots" content="noindex,nofollow"/);
 assert.match(read('docs/WEBSITE_FIRST_CONVERSION_PREVIEW.md'),/NO PRODUCTION DEPLOYMENT/);
 assert.match(booking,/TURNSTILE_SECRET_KEY/);
 assert.match(booking,/WETHRU_TENANTS_JSON/);
 assert.match(booking,/return bad\(res,503/);
});
test('optional conversion event only; no hidden submission',()=>{
 assert.match(frontend,/typeof window\.gtag === 'function'/);
 assert.doesNotMatch(frontend,/fetch\(/);
 assert.match(home,/css\/website-first\.css/);
 assert.match(home,/js\/website-first\.js/);
});
