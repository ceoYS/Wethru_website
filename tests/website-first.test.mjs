// Run: node --test tests/website-first.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p,root),'utf8');
const home=read('index.html');
const source=read('content/website-first.html');
const booking=read('api/booking.js');
const frontend=read('js/website-first.js');
test('review source is the complete committed homepage',()=>{
 assert.equal(home,'<!-- REVIEW BRANCH ONLY: no production deployment; source content/website-first.html -->\n'+source);
});
test('owner-requested positioning appears with no unsupported ranking guarantee',()=>{
 assert.match(home,/사업 하나 하는데,/);
 assert.match(home,/대표님의 서비스가 탄탄하더라도/);
 assert.match(home,/인스타그램/);
 assert.match(home,/SEO/);
 assert.match(home,/AEO/);
 assert.match(home,/노출·AI 추천·순위는 보장되지 않습니다/);
 assert.doesNotMatch(home,/hero-zolv|wethru-v7-og\.png/);
});
test('unreleased content is noindex and no production deployment instruction',()=>{
 assert.match(home,/name="robots" content="noindex,nofollow"/);
 assert.match(read('docs/WEBSITE_FIRST_CONVERSION_PREVIEW.md'),/NO PRODUCTION DEPLOYMENT/);
});
test('actual leads use existing explicit Google Forms submission',()=>{
 assert.match(frontend,/forms\/d\/e\/1FAIpQLSe_/);
 assert.match(frontend,/entry\.307446677/);
 assert.match(home,/Google Forms에서 최종 제출/);
});
test('booking does not produce fake confirmation without live backend',()=>{
 assert.match(frontend,/if \(!apiBase\)/);
 assert.match(booking,/TURNSTILE_SECRET_KEY/);
 assert.match(booking,/WETHRU_TENANTS_JSON/);
 assert.match(booking,/return bad\(res,503/);
 assert.match(booking,/if\(!\['accepted','pending'\].includes\(booking.status\)\)/);
});
test('embedded assets exist in this branch',()=>{
 assert.match(home,/css\/website-first\.css/);
 assert.match(home,/js\/website-first\.js/);
 assert.ok(read('css/website-first.css').length>1000);
 assert.ok(frontend.length>1000);
});
