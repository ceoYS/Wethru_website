// WeThru V7 — 정적 페이지 빌드 스크립트 (외부 패키지 없음)
// 사용법: node tools/build.mjs
// content/site.mjs → index.html, sitemap.xml
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as C from '../content/site.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { site, links, company, seo, season, heroVisual, scope, work, pricing, process, faq, others, contact, nav } = C;

const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const won = (n) => n.toLocaleString('ko-KR');
const brackets = (s) => esc(s).replace(/\[([^\]]+)\]/g, '<mark>[$1]</mark>');
const hash = (p) => createHash('sha1').update(readFileSync(join(root, p))).digest('hex').slice(0, 8);
const ext = (href) => `href="${esc(href)}" target="_blank" rel="noopener noreferrer"`;
const abs = (p) => new URL(p, site.url).href;

const ARROW = '<span class="arr" aria-hidden="true">→</span>';
const OUT = '<span class="arr" aria-hidden="true">↗</span>';

// ---- Google Form 미리 채우기 URL (JS가 없을 때의 기본값과 JS 계산식이 같도록 여기서도 사용)
function formUrl(formValues = [], memo = '') {
  const u = new URL(links.formBase);
  u.searchParams.set('usp', 'pp_url');
  formValues.forEach((v) => u.searchParams.append(links.formEntries.service, v));
  if (memo) u.searchParams.set(links.formEntries.memo, memo);
  return u.href;
}

// ---- 섹션 ---------------------------------------------------------------
const header = () => `
<header class="masthead" id="top">
  <div class="masthead__in">
    <a class="brand" href="#top" aria-label="WeThru 처음으로">
      <img src="assets/brand/wethru-wordmark.png" width="998" height="454" alt="WeThru">
    </a>
    <nav class="gnav" id="gnav" aria-label="주요 메뉴">
      ${nav.map((n) => `<a href="${n.href}">${esc(n.label)}</a>`).join('\n      ')}
      <a class="gnav__cta" href="#contact" data-track="cta_nav_mobile">${esc(season.ctaPrimary)}</a>
    </nav>
    <a class="btn btn--sm masthead__cta" href="#contact" data-track="cta_nav">${esc(season.ctaPrimary)}</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="gnav"><span class="menu-btn__bars" aria-hidden="true"></span><span class="menu-btn__txt">메뉴</span></button>
  </div>
</header>`;

const hero = () => `
<section class="hero" aria-labelledby="hero-title">
  <div class="wrap hero__grid">
    <div class="hero__copy">
      <p class="eyebrow">${esc(season.eyebrow)}</p>
      <h1 class="hero__title" id="hero-title">${season.titleLines.map((l) => `<span>${esc(l)}</span>`).join(' ')}</h1>
      <div class="hero__lede">
        ${season.lede.map((p) => `<p>${esc(p)}</p>`).join('\n        ')}
      </div>
      <div class="hero__actions">
        <a class="btn" href="#contact" data-track="cta_hero">${esc(season.ctaPrimary)} ${ARROW}</a>
        <a class="link" href="#work" data-track="cta_hero_work">${esc(season.ctaSecondary)}</a>
      </div>
      <ul class="hero__meta">
        ${season.heroMeta.map((m) => `<li>${esc(m)}</li>`).join('\n        ')}
      </ul>
    </div>
    <figure class="review" aria-labelledby="review-cap">
      <div class="review__desk">
        <div class="review__sheet">
          <img src="${heroVisual.img}" width="${heroVisual.width}" height="${heroVisual.height}" alt="${esc(heroVisual.alt)}" fetchpriority="high">
          <ol class="review__pins" aria-hidden="true">
            ${heroVisual.notes.map((n, i) => `<li data-pin="${i + 1}" style="--x:${n.x}%;--y:${n.y}%;--w:${heroVisual.slide.w}%;--h:${heroVisual.slide.h}%"><span>${i + 1}</span></li>`).join('\n            ')}
          </ol>
        </div>
        <figcaption class="review__cap" id="review-cap">${esc(heroVisual.caption)}</figcaption>
      </div>
      <ol class="review__notes">
        ${heroVisual.notes.map((n, i) => `<li data-pin="${i + 1}"><span class="review__n" aria-hidden="true">${i + 1}</span><b>${esc(n.t)}</b><span>${esc(n.q)}</span></li>`).join('\n        ')}
      </ol>
    </figure>
  </div>
</section>`;

function timing() {
  const T = season.timing;
  const start = Date.parse(T.axis.start);
  const end = Date.parse(T.axis.end) + 86400000;
  const pct = (d) => (((Date.parse(d) - start) / (end - start)) * 100).toFixed(2);
  const monthTicks = T.axis.months.map((m) => {
    const [y, mo] = m.split('.').map(Number);
    const d = `${y}-${String(mo).padStart(2, '0')}-01`;
    return { label: m, p: pct(d) };
  });
  const rows = T.events.map((e) => {
    const s = e.kind === 'point' ? pct(e.date) : pct(e.start);
    const w = e.kind === 'point' ? 0 : (pct(e.end) - pct(e.start) + (100 / ((end - start) / 86400000))).toFixed(2);
    const when = e.kind === 'point' ? e.date.replace(/-/g, '.') : e.detail;
    return `<li class="gantt__row gantt__row--${e.kind}">
            <span class="gantt__label">${esc(e.label)}<sup><a href="#src-${e.src}" aria-label="출처 ${e.src}">${e.src}</a></sup>${e.kind === 'point' ? `<small>${esc(e.detail)}</small>` : ''}</span>
            <span class="gantt__track"><i class="gantt__bar" style="--s:${s}%;--w:${w}%"></i></span>
            <span class="gantt__when">${esc(when)}</span>
          </li>`;
  }).join('\n          ');

  return `
<section class="timing" id="timing" aria-labelledby="timing-title">
  <div class="wrap">
    <header class="sec-head sec-head--split">
      <div>
        <p class="eyebrow">${esc(T.eyebrow)}</p>
        <h2 class="sec-title" id="timing-title">${esc(T.title)}</h2>
      </div>
      <p class="sec-lede">${esc(T.lede)}</p>
    </header>
    <figure class="gantt" aria-labelledby="gantt-cap" style="${monthTicks.slice(1).map((t, i) => `--m${i + 1}:${t.p}%`).join(';')}">
      <figcaption class="gantt__cap" id="gantt-cap"><b>${esc(T.chartTitle)}</b><span>${esc(T.chartNote)}</span></figcaption>
      <div class="gantt__body">
        <div class="gantt__axis" aria-hidden="true">
          ${monthTicks.map((t) => `<span style="--p:${t.p}%">${esc(t.label)}</span>`).join('\n          ')}
        </div>
        <ol class="gantt__rows">
          ${rows}
        </ol>
      </div>
      <ol class="gantt__src">
        ${T.sources.map((s) => `<li id="src-${s.n}"><span>${s.n}</span> ${s.url ? `<a ${ext(s.url)}>${esc(s.text)}</a>` : esc(s.text)}</li>`).join('\n        ')}
      </ol>
    </figure>
    <div class="prep">
      <h3 class="prep__title">${esc(T.prepTitle)}</h3>
      <ul class="prep__list">
        ${T.prep.map((p) => `<li class="prep__item">
          <h4>${esc(p.t)}</h4>
          <p class="prep__q">${esc(p.q)}</p>
          <p>${esc(p.d)}</p>
        </li>`).join('\n        ')}
      </ul>
    </div>
  </div>
</section>`;
}

const scopeSec = () => `
<section class="scope" id="scope" aria-labelledby="scope-title">
  <div class="wrap">
    <header class="sec-head sec-head--split">
      <div>
        <p class="eyebrow">${esc(scope.eyebrow)}</p>
        <h2 class="sec-title" id="scope-title">${esc(scope.title)}</h2>
      </div>
      <p class="sec-lede">${esc(scope.lede)}</p>
    </header>
    <table class="toc">
      <thead><tr>${scope.headers.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>
        ${scope.items.map((it) => `<tr>
          <th scope="row"><h3>${esc(it.t)}</h3></th>
          <td class="toc__q" data-label="${esc(scope.headers[1])}">${esc(it.q)}</td>
          <td class="toc__d" data-label="${esc(scope.headers[2])}">${esc(it.d)}</td>
        </tr>`).join('\n        ')}
      </tbody>
    </table>
    <p class="note">${esc(scope.note)}</p>
    <figure class="redline" aria-labelledby="redline-cap">
      <figcaption class="redline__cap" id="redline-cap"><b>${esc(scope.example.label)}</b><span>${esc(scope.example.disclaimer)}</span></figcaption>
      <div class="redline__col redline__col--before">
        <p class="redline__tag">정리 전</p>
        <p class="redline__text"><s>${esc(scope.example.before)}</s></p>
      </div>
      <div class="redline__col redline__col--after">
        <p class="redline__tag">정리 후</p>
        <ol class="redline__lines">
          ${scope.example.after.map((l) => `<li><p class="redline__text">${brackets(l.text)}</p><span class="redline__note">${esc(l.note)}</span></li>`).join('\n          ')}
        </ol>
      </div>
    </figure>
  </div>
</section>`;

function workSec() {
  const groupLabel = Object.fromEntries(work.groups.map((g) => [g.id, g.label]));
  const tabs = work.cases.map((c, i) => `<button class="wtab${i === 0 ? ' is-active' : ''}" type="button" role="tab" id="tab-${c.id}" aria-controls="case-${c.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">
          <b>${esc(c.client)}</b><span>${esc(c.doc)}</span><em>${esc(c.size)}</em>
        </button>`).join('\n        ');
  const panels = work.cases.map((c, i) => {
    const alt = `${c.client} ${c.doc} 페이지 축소 이미지 (${c.format}, ${c.size})`;
    const meta = [
      ['고객사', c.client], ['문서', c.doc], ['용도', c.purpose], ['형식 · 분량', `${c.format} · ${c.size}`],
      ['결과', c.result],
    ].filter(([, v]) => v);
    return `<article class="case${i === 0 ? ' is-active' : ''}" role="tabpanel" id="case-${c.id}" aria-labelledby="tab-${c.id}" tabindex="0">
          <button class="case__img" type="button" data-zoom="assets/work/${c.img}.webp" data-zoom-w="${c.w}" data-zoom-h="${c.h}" data-zoom-cap="${esc(alt)}" aria-label="${esc(`${c.client} ${c.doc} 크게 보기`)}">
            <img src="assets/work/${c.img}-sm.webp" srcset="assets/work/${c.img}-sm.webp 760w, assets/work/${c.img}.webp ${c.w}w" sizes="(min-width: 1100px) 780px, 92vw" width="${c.w}" height="${c.h}" loading="lazy" decoding="async" alt="${esc(alt)}">
            <span class="case__zoom" aria-hidden="true">크게 보기 +</span>
          </button>
          <div class="case__info">
            <p class="case__kind">${esc(groupLabel[c.group])}</p>
            <h3 class="case__title">${esc(c.client)} <span>${esc(c.doc)}</span></h3>
            <dl class="case__meta">
              ${meta.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('\n              ')}
            </dl>
            ${c.structure.length ? `<div class="case__structure">
              <p class="case__sub">확인 가능한 구성</p>
              <ol>${c.structure.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
            </div>` : `<p class="case__private">세부 내용은 고객 정보 보호를 위해 축소 이미지로만 공개합니다.</p>`}
          </div>
        </article>`;
  }).join('\n        ');

  return `
<section class="work on-dark" id="work" aria-labelledby="work-title">
  <div class="wrap">
    <header class="sec-head sec-head--split">
      <div>
        <p class="eyebrow">${esc(work.eyebrow)}</p>
        <h2 class="sec-title" id="work-title">${esc(work.title)}</h2>
      </div>
      <p class="sec-lede">${esc(work.lede)}</p>
    </header>
    <div class="work__body">
      <div class="work__tabs" role="tablist" aria-label="작업 사례 목록">
        ${tabs}
      </div>
      <div class="work__stage">
        ${panels}
      </div>
    </div>
    <p class="work__policy">${esc(work.policy)}</p>
  </div>
</section>`;
}

function pricingSec() {
  const P = pricing;
  const rowVal = (plan, key) => {
    const v = plan[key];
    return Array.isArray(v) ? `<ul>${v.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : `<p>${esc(v)}</p>`;
  };
  return `
<section class="pricing" id="pricing" aria-labelledby="pricing-title">
  <div class="wrap">
    <header class="sec-head sec-head--split">
      <div>
        <p class="eyebrow">${esc(P.eyebrow)}</p>
        <h2 class="sec-title" id="pricing-title">${esc(P.title)}</h2>
      </div>
      <p class="sec-lede">${esc(P.lede)}</p>
    </header>
    <div class="plan-switch" role="group" aria-label="상품 선택">
      ${P.plans.map((p, i) => `<button type="button" data-plan="${p.id}" aria-pressed="${i === 0}">${esc(p.name)}</button>`).join('\n      ')}
    </div>
    <div class="quote">
      <div class="quote__labels" aria-hidden="true">
        <span class="quote__corner">사업계획서</span>
        ${P.rows.map((r) => `<span>${esc(r.label)}</span>`).join('\n        ')}
        <span></span>
      </div>
      ${P.plans.map((p, i) => `<article class="plan${i === 0 ? ' is-active' : ''}" id="plan-${p.id}" aria-labelledby="plan-${p.id}-name">
        <header class="plan__head">
          <h3 class="plan__name" id="plan-${p.id}-name">${esc(p.name)}</h3>
          <p class="plan__price"><b>${won(p.price)}</b>원</p>
        </header>
        <dl class="plan__rows">
          ${P.rows.map((r) => `<div class="plan__row plan__row--${r.key}"><dt>${esc(r.label)}</dt><dd>${rowVal(p, r.key)}</dd></div>`).join('\n          ')}
        </dl>
        <a class="btn btn--line plan__cta" href="#contact" data-pick="${p.id}" data-track="cta_plan_${p.id}">이 상품으로 상담하기</a>
      </article>`).join('\n      ')}
    </div>
    <div class="pricing__foot">
      <div class="mini">
        <h3 class="mini__title">${esc(P.extraTitle)}</h3>
        <table>
          <tbody>
            ${P.extra.map((x) => `<tr><th scope="row">${esc(x.name)}</th><td>${esc(x.spec)}</td><td class="mini__price">${won(x.price)}원</td></tr>`).join('\n            ')}
          </tbody>
        </table>
      </div>
      <ul class="pricing__notes">
        ${P.notes.map((n) => `<li>${esc(n)}</li>`).join('\n        ')}
      </ul>
    </div>
    <div class="roles">
      <h3 class="roles__title">${esc(P.roles.title)}</h3>
      <div class="roles__cols">
        <div class="roles__col"><p class="roles__who">${esc(P.roles.us.t)}</p><ul>${P.roles.us.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
        <div class="roles__col roles__col--you"><p class="roles__who">${esc(P.roles.you.t)}</p><ul>${P.roles.you.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
      </div>
      <p class="roles__foot">${esc(P.roles.foot)}</p>
    </div>
  </div>
</section>`;
}

const processSec = () => `
<section class="process" id="process" aria-labelledby="process-title">
  <div class="wrap">
    <header class="sec-head">
      <p class="eyebrow">${esc(process.eyebrow)}</p>
      <h2 class="sec-title" id="process-title">${esc(process.title)}</h2>
    </header>
    <div class="process__grid">
      <ol class="steps">
        ${process.steps.map((s, i) => `<li class="step"><span class="step__n" aria-hidden="true">${i + 1}</span><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join('\n        ')}
      </ol>
      <aside class="contract" aria-labelledby="contract-title">
        <h3 id="contract-title">${esc(process.contractTitle)}</h3>
        <ul>${process.contract.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
      </aside>
    </div>
  </div>
</section>`;

const faqSec = () => `
<section class="faq" id="faq" aria-labelledby="faq-title">
  <div class="wrap faq__grid">
    <header class="sec-head">
      <p class="eyebrow">${esc(faq.eyebrow)}</p>
      <h2 class="sec-title" id="faq-title">${esc(faq.title)}</h2>
    </header>
    <div class="faq__list">
      ${faq.items.map((f) => `<details class="qa">
        <summary><h3>${esc(f.q)}</h3></summary>
        <div class="qa__a"><p>${esc(f.a)}</p></div>
      </details>`).join('\n      ')}
    </div>
  </div>
</section>`;

const othersSec = () => `
<section class="others" aria-labelledby="others-title">
  <div class="wrap others__in">
    <h2 class="others__title" id="others-title">${esc(others.title)}</h2>
    <ul class="others__list">
      ${others.items.map((o) => `<li><a ${o.ext ? ext(o.href) : `href="${o.href}" data-pick="web"`} data-track="other_${o.ext ? new URL(o.href).hostname.split('.')[0] : 'web'}"><b>${esc(o.t)}</b><span>${esc(o.d)}</span>${o.ext ? OUT : ARROW}</a></li>`).join('\n      ')}
    </ul>
  </div>
</section>`;

const contactSec = () => `
<section class="contact on-dark" id="contact" aria-labelledby="contact-title">
  <div class="wrap contact__grid">
    <div class="contact__copy">
      <p class="eyebrow">${esc(contact.eyebrow)}</p>
      <h2 class="sec-title" id="contact-title">${esc(contact.title)}</h2>
      <p class="sec-lede">${esc(contact.lede)}</p>
      <dl class="contact__meta">
        ${contact.meta.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${k === '이메일' ? `<a href="mailto:${esc(v)}">${esc(v)}</a>` : esc(v)}</dd></div>`).join('\n        ')}
      </dl>
    </div>
    <div class="picker" id="picker" data-form-base="${esc(links.formBase)}" data-entry-service="${links.formEntries.service}" data-entry-memo="${links.formEntries.memo}">
      <h3 class="picker__title">${esc(contact.pickerTitle)}</h3>
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
        <a class="btn" id="form-link"${ext(links.formShort)} data-track="form_open">${esc(contact.formButton)} ${OUT}</a>
        <a class="btn btn--kakao" ${ext(links.kakaoChat)} data-track="kakao_open">${esc(contact.kakaoButton)} ${OUT}</a>
      </div>
      <p class="picker__summary" id="picker-summary" aria-live="polite"></p>
      <p class="picker__note">${esc(contact.disclosure)}</p>
    </div>
  </div>
</section>`;

const footer = () => `
<footer class="colophon">
  <div class="wrap">
    <div class="colophon__top">
      <div class="colophon__brand">
        <img src="assets/brand/wethru-wordmark.png" width="998" height="454" alt="WeThru" loading="lazy">
        <p>대표님의 사업, 함께 관통합니다.</p>
      </div>
      <nav class="colophon__nav" aria-label="하단 메뉴">
        ${nav.map((n) => `<a href="${n.href}">${esc(n.label)}</a>`).join('\n        ')}
        <a ${ext(links.kakaoChannel)}>카카오톡 채널</a>
      </nav>
      <dl class="colophon__info">
        <div><dt>운영사</dt><dd>${esc(company.operator)}</dd></div>
        <div><dt>대표자</dt><dd>${esc(company.ceo)}</dd></div>
        <div><dt>사업자등록번호</dt><dd>${esc(company.bizNo)}</dd></div>
        <div><dt>이메일</dt><dd><a href="mailto:${esc(company.email)}">${esc(company.email)}</a></dd></div>
        <div><dt>운영시간</dt><dd>${esc(company.hours)}</dd></div>
      </dl>
    </div>
    <p class="colophon__note">${esc(company.note)}</p>
    <p class="colophon__end">© ${site.checkedAt.slice(0, 4)} WeThru. All rights reserved.</p>
  </div>
</footer>`;

const mbar = () => `
<div class="mbar" aria-label="빠른 상담">
  <a class="mbar__kk" ${ext(links.kakaoChat)} data-track="kakao_open_mbar">카카오톡 상담</a>
  <a class="mbar__go" href="#contact" data-track="cta_mbar">상담 신청서</a>
</div>`;

const zoom = () => `
<dialog class="zoom" id="zoom" aria-label="작업물 크게 보기">
  <div class="zoom__bar"><p class="zoom__cap" id="zoom-cap"></p><button class="zoom__close" type="button" data-close>닫기</button></div>
  <div class="zoom__view"><img id="zoom-img" alt=""></div>
</dialog>`;

function jsonLd() {
  const org = `${site.url}#org`;
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
        offers: [...pricing.plans, ...pricing.extra].map((p) => ({ '@type': 'Offer', name: p.name, price: String(p.price), priceCurrency: 'KRW' })),
      },
      {
        '@type': 'FAQPage', '@id': `${site.url}#faq`,
        mainEntity: faq.items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  };
  return JSON.stringify(data, null, 1).replace(/</g, '\\u003c');
}

const v = { css: hash('css/v7.css'), js: hash('js/v7.js') };

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
<meta name="theme-color" content="#172333">
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@500;600;700&amp;display=swap">
<link rel="stylesheet" href="css/v7.css?v=${v.css}">
<script>document.documentElement.classList.add('js')</script>
<script type="application/ld+json">${jsonLd()}</script>
</head>
<body>
<a class="skip" href="#main">본문 바로가기</a>
${header()}
<main id="main">
${hero()}
${timing()}
${scopeSec()}
${workSec()}
${pricingSec()}
${processSec()}
${faqSec()}
${othersSec()}
${contactSec()}
</main>
${footer()}
${mbar()}
${zoom()}
<script src="js/v7.js?v=${v.js}" defer></script>
</body>
</html>
`;

writeFileSync(join(root, 'index.html'), html);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site.url}</loc>
    <lastmod>${site.checkedAt}</lastmod>
  </url>
</urlset>
`;
writeFileSync(join(root, 'sitemap.xml'), sitemap);

// 미리 채우기 URL 예시를 출력해 검수에 활용
console.log('built index.html', `(${Buffer.byteLength(html)} bytes)`, 'css', v.css, 'js', v.js);
console.log('form prefill sample:', formUrl(['사업계획서 첨삭·보완'], '[wethru.com] 관심 상품: 첨삭 · 보완 / 지원 예정: 예비창업패키지'));
