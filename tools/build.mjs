// WeThru V7 (design) — 정적 페이지 빌드 스크립트 (외부 패키지 없음)
// 사용법: node tools/build.mjs
// content/site.mjs → index.html, sitemap.xml
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as C from '../content/site.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { site, links, company, seo, nav, hero, work, services, approach, timing, process, faq, others, contact } = C;

const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// 화면에 보이는 텍스트에서만, 붙어 있는 가운뎃점(예: 제공·확인) 앞뒤 줄바꿈을 막습니다(U+2060).
// 속성값(Google Form 미리 채우기 값 등)과 <script>는 건드리지 않습니다.
const joinDots = (doc) => doc.replace(/(<script[\s\S]*?<\/script>)|(<[^>]+>)|([^<]+)/g,
  (m, script, tag, text) => (text ? text.replace(/(\S)·(?=\S)/g, '$1\u2060·\u2060') : m));
const won = (n) => n.toLocaleString('ko-KR');
const brackets = (s) => esc(s).replace(/\[([^\]]+)\]/g, '<mark>[$1]</mark>');
const hash = (p) => createHash('sha1').update(readFileSync(join(root, p))).digest('hex').slice(0, 8);
const ext = (href) => `href="${esc(href)}" target="_blank" rel="noopener noreferrer"`;
const abs = (p) => new URL(p, site.url).href;
const pad2 = (n) => String(n).padStart(2, '0');

const ARROW = '<span class="arr" aria-hidden="true">→</span>';
const OUT = '<span class="arr" aria-hidden="true">↗</span>';

// 섹션 머리 — label은 왼쪽 여백 칸, 제목·리드는 본문 칸
const head = ({ id, label, title, lede, mod = '' }) => `
    <header class="sh${mod ? ` sh--${mod}` : ''}">
      <p class="sh__label">${esc(label)}</p>
      <h2 class="sh__title" id="${id}-title">${esc(title)}</h2>
      ${lede ? `<p class="sh__lede">${esc(lede)}</p>` : ''}
    </header>`;

// ---- Header -------------------------------------------------------------
const header = () => `
<header class="mast" id="top">
  <div class="mast__in">
    <a class="logo" href="#top" aria-label="WeThru 처음으로">
      <img src="assets/brand/wethru-wordmark.png" width="998" height="454" alt="WeThru">
    </a>
    <nav class="gnav" id="gnav" aria-label="주요 메뉴">
      ${nav.map((n) => `<a href="${n.href}">${esc(n.label)}</a>`).join('\n      ')}
      <a class="gnav__cta" href="#contact" data-track="cta_nav_mobile">${esc(hero.ctaPrimary)} ${ARROW}</a>
    </nav>
    <a class="btn btn--sm mast__cta" href="#contact" data-track="cta_nav">${esc(hero.ctaPrimary)}</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="gnav"><span class="menu-btn__bars" aria-hidden="true"></span><span class="menu-btn__txt">메뉴</span></button>
  </div>
</header>`;

// ---- Hero ---------------------------------------------------------------
// 시각 영역 좌표계 1000 × 1000. 위치는 CSS 변수(%)로 넘깁니다.
const HV = {
  page: { x: 43, y: 4, w: 51 },            // A4 (833×1157) → 높이 70.84
  slide: { x: 0, y: 47, w: 76 },           // 16:9 (1440×802) → 높이 42.33
  notes: [
    { x: 16.5, y: 10.5, w: 24, dot: [44.4, 14.8] },
    { x: 16.5, y: 29.5, w: 24, dot: [47.3, 45.6] },
    { x: 0, y: 91.4, w: 44, dot: [9.6, 52.6] },
  ],
};
function heroSec() {
  const V = hero.visual;
  const pageH = (HV.page.w * V.page.h) / V.page.w;
  const slideH = (HV.slide.w * V.slide.h) / V.slide.w;
  return `
<section class="hero pg" aria-labelledby="hero-title">
  <div class="hero__copy">
    <p class="kicker">${esc(hero.kicker)}</p>
    <h1 class="hero__title" id="hero-title">${hero.titleLines.map((l, i) => `<span class="ln"><span style="--i:${i}">${esc(l)}</span></span>`).join('')}</h1>
    <p class="hero__lede">${esc(hero.lede)}</p>
    <div class="hero__actions">
      <a class="btn" href="#contact" data-track="cta_hero">${esc(hero.ctaPrimary)} ${ARROW}</a>
      <a class="tlink" href="#work" data-track="cta_hero_work">${esc(hero.ctaSecondary)}</a>
    </div>
    <ul class="hero__meta">
      ${hero.meta.map((m) => `<li>${esc(m)}</li>`).join('\n      ')}
    </ul>
  </div>
  <figure class="hv" aria-labelledby="hv-cap">
    <div class="hv__stage">
      <span class="hv__mist" aria-hidden="true"></span>
      <img class="hv__slide" src="${V.slide.src}" width="${V.slide.w}" height="${V.slide.h}" alt="${esc(V.slide.alt)}" style="--x:${HV.slide.x}%;--y:${HV.slide.y}%;--w:${HV.slide.w}%;--h:${slideH.toFixed(2)}%" fetchpriority="high">
      <img class="hv__page" src="${V.page.src}" width="${V.page.w}" height="${V.page.h}" alt="${esc(V.page.alt)}" style="--x:${HV.page.x}%;--y:${HV.page.y}%;--w:${HV.page.w}%;--h:${pageH.toFixed(2)}%" fetchpriority="high">
      <svg class="hv__pencil" viewBox="0 0 1000 1000" aria-hidden="true" focusable="false">
        <g class="pen">
          <path class="mk" style="--d:0" pathLength="1" d="M466 145c-9 1-17 4-18 15-2 21 1 47-1 66 0 6 7 9 17 9"/>
          <path class="mk" style="--d:1" pathLength="1" d="M486 452c6-14 70-19 128-17 52 2 92 9 92 22 0 15-61 21-122 20-58-1-104-7-103-21 1-9 22-15 52-17"/>
          <path class="mk" style="--d:2" pathLength="1" d="M108 528c-11 0-14 9-14 22l1 300c0 18 4 31 20 31h284c13 0 17-9 17-24V553c0-15-5-25-19-25H170"/>
        </g>
        <g class="lead">
          <path class="ld" style="--d:0" pathLength="1" d="M408 136 C 424 140, 434 146, 444 152"/>
          <path class="ld" style="--d:1" pathLength="1" d="M408 326 C 446 352, 468 400, 480 440"/>
          <path class="ld" style="--d:2" pathLength="1" d="M60 912 C 62 900, 68 892, 80 884"/>
        </g>
      </svg>
      ${HV.notes.map((n, i) => `<span class="hv__dot" style="--dx:${n.dot[0]}%;--dy:${n.dot[1]}%;--d:${i}" aria-hidden="true">${i + 1}</span>`).join('\n      ')}
    </div>
    <ol class="hv__notes">
      ${V.notes.map((n, i) => `<li style="--x:${HV.notes[i].x}%;--y:${HV.notes[i].y}%;--w:${HV.notes[i].w}%;--d:${i}"><span class="hv__n" aria-hidden="true">${i + 1}</span><b>${esc(n.t)}</b><span>${esc(n.q)}</span></li>`).join('\n      ')}
    </ol>
    <figcaption class="hv__cap" id="hv-cap">${esc(V.caption)}</figcaption>
  </figure>
</section>`;
}

// ---- Work ---------------------------------------------------------------
const zoomBtn = (c, alt, cls, sizes) => `<button class="${cls}" type="button" data-zoom="assets/work/${c.img}.webp" data-zoom-w="${c.w}" data-zoom-h="${c.h}" data-zoom-cap="${esc(alt)}" aria-label="${esc(`${c.client} ${c.doc} 크게 보기`)}">
          <img src="assets/work/${c.img}-sm.webp" srcset="assets/work/${c.img}-sm.webp 760w, assets/work/${c.img}.webp ${c.w}w" sizes="${sizes}" width="${c.w}" height="${c.h}" loading="lazy" decoding="async" alt="${esc(alt)}">
          <span class="zoomhint" aria-hidden="true">크게 보기 +</span>
        </button>`;

function caseBlock(c, i) {
  const alt = `${c.client} ${c.doc} 전체 페이지 축소 이미지 (${c.spec.join(', ')})`;
  const layout = ['wide', 'left', 'right'][i] || 'wide';
  const sizes = layout === 'wide' ? '(min-width: 1360px) 1320px, 94vw' : '(min-width: 1360px) 980px, (min-width: 900px) 70vw, 94vw';
  const dl = [['과제', c.problem], ['작업', c.work], ['결과물', c.deliverable]];
  if (c.result) dl.push(['결과', c.result]);
  return `
    <article class="case case--${layout}" aria-labelledby="case-${c.id}">
      <div class="case__media rv rv--wipe">
        ${zoomBtn(c, alt, 'case__img', sizes)}
      </div>
      <div class="case__id">
        <p class="case__kind">${esc(c.doc)}</p>
        <h3 class="case__client" id="case-${c.id}">${esc(c.client)}</h3>
        <p class="case__purpose">${esc(c.purpose)}</p>
        <p class="case__spec">${c.spec.map((s) => `<span>${esc(s)}</span>`).join('')}</p>
      </div>
      <dl class="case__dl">
        ${dl.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('\n        ')}
      </dl>
      ${c.flow ? `<div class="flow rv">
        <p class="flow__title">${esc(c.flowTitle)}</p>
        <ol class="flow__list">${c.flow.map((f) => `<li>${esc(f)}</li>`).join('')}</ol>
      </div>` : ''}
    </article>`;
}

const workSec = () => `
<section class="work on-dark" id="work" aria-labelledby="work-title">
  <div class="pg">
    ${head({ id: 'work', label: work.label, title: work.title, lede: work.lede, mod: 'split' })}
    ${work.featured.map(caseBlock).join('\n')}
    <div class="more">
      <h3 class="more__title">${esc(work.moreTitle)}</h3>
      <ul class="more__list">
        ${work.more.map((c) => {
          const alt = `${c.client} ${c.doc} 전체 페이지 축소 이미지 (${c.spec})`;
          return `<li>
          <button class="more__row" type="button" data-zoom="assets/work/${c.img}.webp" data-zoom-w="${c.w}" data-zoom-h="${c.h}" data-zoom-cap="${esc(alt)}">
            <span class="more__client">${esc(c.client)}</span>
            <span class="more__doc">${esc(c.doc)}${c.purpose ? `<small>${esc(c.purpose)}</small>` : ''}</span>
            <span class="more__spec">${esc(c.spec)}</span>
            <span class="more__see">보기 +</span>
          </button>
        </li>`;
        }).join('\n        ')}
      </ul>
      <p class="more__policy">${esc(work.policy)}</p>
    </div>
  </div>
</section>`;

// ---- Services -----------------------------------------------------------
function planBlock(p) {
  const L = services.detailLabels;
  const val = (v) => (Array.isArray(v) ? `<ul>${v.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : `<p>${esc(v)}</p>`);
  return `
          <li class="plan" id="plan-${p.id}">
            <div class="plan__line">
              <h4 class="plan__name">${esc(p.name)}</h4>
              <span class="plan__lead" aria-hidden="true"></span>
              <p class="plan__price"><b>${p.priceLabel ? esc(p.priceLabel) : won(p.price)}</b>${p.priceLabel ? "" : "원"}</p>
            </div>
            <p class="plan__for">${esc(p.for)}</p>
            <details class="plan__more">
              <summary>포함 범위 보기</summary>
              <dl class="plan__dl">
                ${['scope', 'need', 'deliver', 'terms'].map((k) => `<div><dt>${esc(L[k])}</dt><dd>${val(p[k])}</dd></div>`).join('\n                ')}
              </dl>
              <a class="tlink tlink--sm" href="#contact" data-pick="${p.id}" data-track="cta_plan_${p.id}">이 상품으로 상담 신청 ${ARROW}</a>
            </details>
          </li>`;
}

const servicesSec = () => `
<section class="services" id="services" aria-labelledby="services-title">
  <div class="pg">
    ${head({ id: 'services', label: services.label, title: services.title, lede: services.lede, mod: 'split' })}
    <div class="svc-list">
      ${services.groups.map((g) => `<section class="svc rv" id="svc-${g.id}" aria-labelledby="svc-${g.id}-name">
        <div class="svc__head">
          <h3 class="svc__name" id="svc-${g.id}-name">${esc(g.name)}</h3>
          <p class="svc__when">${esc(g.when)}</p>
        </div>
        <ul class="svc__plans">${g.plans.map(planBlock).join('')}
        </ul>
        ${g.extra ? `<div class="extra">
          <h4 class="extra__title">${esc(g.extraTitle)}</h4>
          <ul class="extra__list">
            ${g.extra.map((x) => `<li><a href="#contact" data-pick="${x.id}" data-track="cta_plan_${x.id}"><span class="extra__name">${esc(x.name)}</span><span class="extra__spec">${esc(x.spec)}</span><span class="extra__price"><b>${won(x.price)}</b>원</span></a></li>`).join('\n            ')}
          </ul>
        </div>` : ''}
      </section>`).join('\n      ')}
    </div>
    <ul class="svc-notes">
      ${services.notes.map((n) => `<li>${esc(n)}</li>`).join('\n      ')}
    </ul>
  </div>
</section>`;

// ---- Approach -----------------------------------------------------------
const approachSec = () => {
  const E = approach.example;
  return `
<section class="approach on-mist" id="approach" aria-labelledby="approach-title">
  <div class="pg">
    ${head({ id: 'approach', label: approach.label, title: approach.title, lede: approach.lede })}
    <aside class="approach__note"><p>${esc(approach.note)}</p></aside>
    <ol class="qlist">
      ${approach.items.map((it, i) => `<li class="q rv">
        <span class="q__n" aria-hidden="true">${pad2(i + 1)}</span>
        <h3 class="q__t">${esc(it.t)}</h3>
        <p class="q__q">${esc(it.q)}</p>
        <p class="q__d">${esc(it.d)}</p>
      </li>`).join('\n      ')}
    </ol>
    <figure class="sheet rv" aria-labelledby="sheet-cap">
      <figcaption class="sheet__cap" id="sheet-cap"><b>${esc(E.label)}</b><span>${esc(E.disclaimer)}</span></figcaption>
      <div class="sheet__col sheet__col--before">
        <p class="sheet__tag">정리 전</p>
        <p class="sheet__text"><s>${esc(E.before)}</s></p>
        <p class="pnote">${esc(E.beforeNote)}</p>
      </div>
      <div class="sheet__col sheet__col--after">
        <p class="sheet__tag">정리 후</p>
        <ol class="sheet__lines">
          ${E.after.map((l) => `<li><p class="sheet__text">${brackets(l.text)}</p><p class="pnote">${esc(l.note)}</p></li>`).join('\n          ')}
        </ol>
      </div>
    </figure>
  </div>
</section>`;
};

// ---- Timing -------------------------------------------------------------
function timingSec() {
  const T = timing;
  const start = Date.parse(T.axis.start);
  const end = Date.parse(T.axis.end) + 86400000;
  const day = 86400000;
  const pct = (d) => ((Date.parse(d) - start) / (end - start)) * 100;
  const ticks = T.axis.months.map((m) => {
    const [y, mo] = m.split('.').map(Number);
    return { label: m, p: pct(`${y}-${pad2(mo)}-01`).toFixed(2) };
  });
  const rows = T.events.map((e) => {
    const s = e.kind === 'point' ? pct(e.date) : pct(e.start);
    const w = e.kind === 'point' ? 0 : pct(e.end) - pct(e.start) + (day / (end - start)) * 100;
    return `<li class="tl__row tl__row--${e.kind}">
            <span class="tl__label">${esc(e.label)}<sup><a href="#src-${e.src}" aria-label="출처 ${e.src}">${e.src}</a></sup></span>
            <span class="tl__track"><i style="--s:${s.toFixed(2)}%;--w:${w.toFixed(2)}%"></i></span>
            <span class="tl__when">${esc(e.detail)}</span>
          </li>`;
  }).join('\n          ');
  return `
<section class="timing" id="timing" aria-labelledby="timing-title">
  <div class="pg">
    ${head({ id: 'timing', label: T.label, title: T.title, mod: 'big' })}
    <div class="timing__lede">
      ${T.lede.map((p) => `<p>${esc(p)}</p>`).join('\n      ')}
    </div>
    <figure class="tl" aria-labelledby="tl-cap">
      <figcaption class="tl__cap" id="tl-cap"><b>${esc(T.refTitle)}</b><span>${esc(T.refNote)}</span></figcaption>
      <div class="tl__axis" aria-hidden="true">${ticks.map((t) => `<span style="--p:${t.p}%">${esc(t.label)}</span>`).join('')}</div>
      <ol class="tl__rows">
          ${rows}
      </ol>
      <ol class="tl__src">
        ${T.sources.map((s) => `<li id="src-${s.n}"><span>${s.n}</span>${s.url ? `<a ${ext(s.url)}>${esc(s.text)}</a>` : esc(s.text)}</li>`).join('\n        ')}
      </ol>
    </figure>
    <div class="prep">
      <h3 class="prep__title">${esc(T.prepTitle)}</h3>
      <ul class="prep__list">
        ${T.prep.map((p) => `<li class="rv"><h4>${esc(p.t)}</h4><p class="prep__q">${esc(p.q)}</p><p>${esc(p.d)}</p></li>`).join('\n        ')}
      </ul>
    </div>
  </div>
</section>`;
}

// ---- Process & roles ----------------------------------------------------
const processSec = () => {
  const R = process.roles;
  return `
<section class="process on-dark" id="process" aria-labelledby="process-title">
  <div class="pg">
    ${head({ id: 'process', label: process.label, title: process.title })}
    <ol class="steps rv">
      ${process.steps.map((s, i) => `<li class="step" style="--i:${i}"><span class="step__n">${pad2(i + 1)}</span><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join('\n      ')}
    </ol>
    <div class="roles">
      <div class="roles__lead">
        <p class="roles__statement">${esc(R.statement)}</p>
        <p class="roles__sub">${esc(R.sub)}</p>
      </div>
      <div class="roles__cols">
        <div><h3 class="roles__who">${esc(R.us.t)}</h3><ul>${R.us.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
        <div><h3 class="roles__who">${esc(R.you.t)}</h3><ul>${R.you.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
      </div>
      <p class="roles__foot">${esc(R.foot)}</p>
    </div>
    <div class="contract">
      <h3 class="contract__title">${esc(process.contractTitle)}</h3>
      <ul class="contract__list">${process.contract.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
    </div>
  </div>
</section>`;
};

// ---- FAQ ----------------------------------------------------------------
const faqSec = () => `
<section class="faq" id="faq" aria-labelledby="faq-title">
  <div class="pg">
    ${head({ id: 'faq', label: faq.label, title: faq.title, mod: 'side' })}
    <div class="faq__list">
      ${faq.items.map((f) => `<details class="qa">
        <summary><h3>${esc(f.q)}</h3><span class="qa__icon" aria-hidden="true"></span></summary>
        <div class="qa__a"><p>${esc(f.a)}</p></div>
      </details>`).join('\n      ')}
    </div>
  </div>
</section>`;

// ---- Contact ------------------------------------------------------------
const contactSec = () => `
<section class="contact on-dark" id="contact" aria-labelledby="contact-title">
  <div class="pg">
    <div class="contact__copy">
      <p class="sh__label">${esc(contact.label)}</p>
      <h2 class="contact__title" id="contact-title">${esc(contact.title)}</h2>
      <p class="contact__lede">${esc(contact.lede)}</p>
      <dl class="contact__meta">
        ${contact.meta.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${k === '이메일' ? `<a href="mailto:${esc(v)}">${esc(v)}</a>` : esc(v)}</dd></div>`).join('\n        ')}
      </dl>
    </div>
    <div class="picker" id="picker" data-form-base="${esc(links.formBase)}" data-entry-service="${links.formEntries.service}" data-entry-memo="${links.formEntries.memo}" data-alias="${esc(JSON.stringify(contact.pickAlias))}">
      <h3 class="picker__title">${esc(contact.pickerTitle)}</h3>
      <p class="picker__hint">${esc(contact.pickerHint)}</p>
      <fieldset class="picker__set">
        <legend>${esc(contact.serviceLabel)}</legend>
        <div class="chips">
          ${contact.services.map((s) => `<label class="chip"><input type="radio" name="service" value="${s.v}" data-form="${esc(JSON.stringify(s.form))}" data-label="${esc(s.label)}"><span>${esc(s.label)}</span></label>`).join('\n          ')}
        </div>
      </fieldset>
      <fieldset class="picker__set">
        <legend>${esc(contact.programLabel)}</legend>
        <div class="chips">
          ${contact.programs.map((p) => `<label class="chip"><input type="radio" name="program" value="${esc(p)}"><span>${esc(p)}</span></label>`).join('\n          ')}
        </div>
      </fieldset>
      <div class="picker__actions">
        <a class="btn btn--light" id="form-link" ${ext(links.formShort)} data-track="form_open">${esc(contact.formButton)} ${OUT}</a>
        <a class="btn btn--ghost" ${ext(links.kakaoChat)} data-track="kakao_open">${esc(contact.kakaoButton)} ${OUT}</a>
      </div>
      <p class="picker__summary" id="picker-summary" aria-live="polite"></p>
      <p class="picker__note">${esc(contact.disclosure)}</p>
    </div>
  </div>
</section>`;

// ---- Others + Footer ----------------------------------------------------
const othersSec = () => `
<aside class="others" aria-labelledby="others-title">
  <div class="pg">
    <h2 class="others__title" id="others-title">${esc(others.title)}</h2>
    <ul class="others__list">
      ${others.items.map((o) => `<li><a ${o.ext ? ext(o.href) : `href="${o.href}" data-pick="web"`} data-track="other_${o.ext ? new URL(o.href).hostname.split('.')[0] : 'web'}">${esc(o.t)} ${o.ext ? OUT : ARROW}</a></li>`).join('\n      ')}
    </ul>
  </div>
</aside>`;

const footer = () => `
<footer class="foot">
  <div class="pg">
    <div class="foot__brand">
      <a class="logo logo--foot" href="#top" aria-label="WeThru 맨 위로">
        <img src="assets/brand/wethru-wordmark.png" width="998" height="454" alt="WeThru" loading="lazy">
      </a>
      <p>${esc(company.tagline)}</p>
    </div>
    <nav class="foot__nav" aria-label="하단 메뉴">
      ${nav.map((n) => `<a href="${n.href}">${esc(n.label)}</a>`).join('\n      ')}
      <a ${ext(links.kakaoChannel)}>카카오톡 채널 ${OUT}</a>
      <a href="service-guide.html">서비스 · 계약 안내 ${ARROW}</a>
    </nav>
    <dl class="foot__info">
      <div><dt>운영사</dt><dd>${esc(company.operator)}</dd></div>
      <div><dt>대표자</dt><dd>${esc(company.ceo)}</dd></div>
      <div><dt>사업자등록번호</dt><dd>${esc(company.bizNo)}</dd></div>
      <div><dt>이메일</dt><dd><a href="mailto:${esc(company.email)}">${esc(company.email)}</a></dd></div>
      <div><dt>운영시간</dt><dd>${esc(company.hours)}</dd></div>
    </dl>
    <p class="foot__note">${esc(company.note)}</p>
    <p class="foot__end">© ${site.checkedAt.slice(0, 4)} WeThru. All rights reserved.</p>
  </div>
</footer>`;

const mbar = () => `
<div class="mbar" aria-label="빠른 상담">
  <a class="mbar__kk" ${ext(links.kakaoChat)} data-track="kakao_open_mbar">카카오톡 상담</a>
  <a class="mbar__go" href="#contact" data-track="cta_mbar">${esc(hero.ctaPrimary)}</a>
</div>`;

const zoom = () => `
<dialog class="zoom" id="zoom" aria-label="작업물 크게 보기">
  <div class="zoom__bar"><p class="zoom__cap" id="zoom-cap"></p><button class="zoom__close" type="button" data-close>닫기</button></div>
  <div class="zoom__view"><img id="zoom-img" alt=""></div>
</dialog>`;

function jsonLd() {
  const org = `${site.url}#org`;
  const plans = services.groups.flatMap((g) => [...g.plans, ...(g.extra || [])]);
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization', '@id': org, name: 'WeThru', alternateName: '위쓰루', url: site.url,
        logo: abs('assets/brand/wethru-wordmark.png'), email: company.email,
        parentOrganization: { '@type': 'Organization', name: company.operator, taxID: company.bizNo },
        sameAs: [links.kakaoChannel],
      },
      { '@type': 'WebSite', '@id': `${site.url}#website`, url: site.url, name: 'WeThru 위쓰루', inLanguage: 'ko-KR', publisher: { '@id': org } },
      {
        '@type': 'Service', '@id': `${site.url}#service`, name: '사업계획서 · IR 자료 준비 지원', serviceType: '사업계획서 컨설팅',
        provider: { '@id': org }, areaServed: { '@type': 'Country', name: 'KR' }, url: site.url,
        offers: plans.map((p) => ({ '@type': 'Offer', name: p.name, price: String(p.price), priceCurrency: 'KRW' })),
      },
      {
        '@type': 'FAQPage', '@id': `${site.url}#faq`,
        mainEntity: faq.items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  };
  return JSON.stringify(data, null, 1).replace(/</g, '\\u003c');
}

const v = { css: hash('css/v7.css'), js: hash('js/v7.js'), font: hash('assets/fonts/pretendard-wt.woff2') };

const html = `<!doctype html>
<!-- 이 파일은 tools/build.mjs가 content/site.mjs로부터 생성합니다. 직접 수정하지 말고 content/site.mjs를 고친 뒤 빌드하세요. -->
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(seo.title)}</title>
<meta name="description" content="${esc(seo.description)}">
<link rel="canonical" href="${site.url}">
<meta name="robots" content="index,follow">
<meta name="theme-color" content="#0C1A2E">
<meta property="og:type" content="website">
<meta property="og:site_name" content="WeThru 위쓰루">
<meta property="og:locale" content="ko_KR">
<meta property="og:url" content="${site.url}">
<meta property="og:title" content="${esc(seo.title)}">
<meta property="og:description" content="${esc(seo.description)}">
<meta property="og:image" content="${abs(seo.ogImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(seo.ogImageAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(seo.title)}">
<meta name="twitter:description" content="${esc(seo.description)}">
<meta name="twitter:image" content="${abs(seo.ogImage)}">
<link rel="icon" type="image/png" sizes="32x32" href="assets/brand/favicon-32.png">
<link rel="icon" type="image/png" sizes="64x64" href="assets/brand/favicon-64.png">
<link rel="apple-touch-icon" href="assets/brand/apple-touch-icon.png">
<link rel="preload" href="assets/fonts/pretendard-wt.woff2?v=${v.font}" as="font" type="font/woff2" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&amp;family=IBM+Plex+Sans+KR:wght@500;600;700&amp;display=swap">
<link rel="stylesheet" href="css/v7.css?v=${v.css}">
<script>document.documentElement.classList.add('js')</script>
<script type="application/ld+json">${jsonLd()}</script>
</head>
<body>
<a class="skip" href="#main">본문 바로가기</a>
${header()}
<main id="main">
${heroSec()}
${workSec()}
${servicesSec()}
${approachSec()}
${timingSec()}
${processSec()}
${faqSec()}
${contactSec()}
</main>
${othersSec()}
${footer()}
${mbar()}
${zoom()}
<script src="js/v7.js?v=${v.js}" defer></script>
</body>
</html>
`;

const bodyAt = html.indexOf('<body>');
writeFileSync(join(root, 'index.html'), html.slice(0, bodyAt) + joinDots(html.slice(bodyAt)));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site.url}</loc>
    <lastmod>${site.checkedAt}</lastmod>
  </url>
</urlset>
`;
writeFileSync(join(root, 'sitemap.xml'), sitemap);

console.log('built index.html', `(${Buffer.byteLength(html)} bytes)`, 'css', v.css, 'js', v.js, 'font', v.font);
