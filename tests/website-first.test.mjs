// Run: node --test tests/website-first.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const home=read('index.html'),source=read('content/website-first.html'),css=read('css/website-first.css'),
 frontend=read('js/website-first.js'),booking=read('api/booking.js'),guide=read('service-guide.html');
test('review-only source matches committed homepage',()=>{
 assert.equal(home,'<!-- REVIEW BRANCH ONLY: no production deployment; source content/website-first.html -->\n'+source);
 assert.match(home,/name="robots" content="noindex,nofollow"/);
});
test('Toss-inspired but independent white/blue brand system is in use',()=>{
 assert.match(css,/--white:#FFFFFF/);
 assert.match(css,/--surface:#F7F8FA/);
 assert.match(css,/--ink:#191F28/);
 assert.match(css,/--blue:#0064FF/);
 assert.match(css,/--blue-pale:#EAF2FF/);
 assert.doesNotMatch(css,/#365F53|#E8E4DC|#F6F4F0|#191D1C/i);
 assert.match(home,/assets\/brand\/wethru-wordmark.png/);
 assert.doesNotMatch(home,/toss\.png|toss\.svg|Toss Design System/);
});
test('Pretendard genuinely loads on primary and supporting guide pages',()=>{
 assert.match(home,/pretendardvariable-dynamic-subset\.min\.css/);
 assert.match(css,/@font-face\{font-family:'Pretendard Local'/);
 assert.match(css,/font:400 16px\/1\.68 'Pretendard Variable','Pretendard Local'/);
 assert.match(guide,/pretendardvariable-dynamic-subset\.min\.css/);
 assert.match(guide,/font-family:"Pretendard Variable","Pretendard Local"/);
});
test('core website-first copy remains and external results not invented',()=>{
 assert.match(home,/사업 하나 하는데,/);
 assert.match(home,/홈페이지 제작|웹사이트 제작/);
 assert.match(home,/SEO/);
 assert.match(home,/AI 검색/);
 assert.match(home,/검색 순위, AI 추천, 매출 증가는 보장하지 않습니다/);
 assert.doesNotMatch(home,/hero-zolv|wethru-v7-og\.png/);
});
test('header has concise directory and responsive menu',()=>{
 assert.match(home,/aria-label="주요 목차"/);
 for(const id of ['services','work','process','about','resources','contact']){
  assert.match(home,new RegExp('href="#'+id+'"'));
  assert.match(home,new RegExp('id="'+id+'"'));
 }
 assert.match(home,/aria-controls="primary-nav"/);
 assert.match(frontend,/aria-expanded/);
 assert.match(frontend,/Escape/);
});
test('one-click Kakao consultation and alternative channels stay usable',()=>{
 assert.match(home,/data-track="hero_kakao"/);
 assert.match(home,/data-track="contact_kakao"/);
 assert.match(home,/pf\.kakao\.com\/_wRVBX\/chat/);
 assert.match(home,/forms\.gle\/d66adwLQzBpE8VDg6/);
 assert.match(home,/mailto:ceo@nitual\.com/);
 assert.doesNotMatch(home,/<form\b|id="booking-submit"/);
});
test('transparent visual demo and reliable about/resources links',()=>{
 assert.match(home,/hero-demo/);
 assert.match(home,/실제 예약 기능이 연결된 화면은 아닙니다/);
 assert.match(home,/주식회사 나이츄얼랩스/);
 for(const x of ['service-guide.html#websites','profile.wethru.com','interior.wethru.com','guides.wethru.com']) assert.ok(home.includes(x));
});
test('backend is retained but no live booking is claimed',()=>{
 assert.match(booking,/WETHRU_TENANTS_JSON/);
 assert.match(booking,/TURNSTILE_SECRET_KEY/);
 assert.match(read('docs/WEBSITE_FIRST_CONVERSION_PREVIEW.md'),/NO PRODUCTION DEPLOYMENT/);
 assert.doesNotMatch(home,/실예약 가능|예약 완료되었습니다|예약 확정되었습니다/);
});
test('click tracking is optional and not fake lead collection',()=>{
 assert.match(frontend,/typeof window\.gtag === 'function'/);
 assert.doesNotMatch(frontend,/fetch\(/);
});
