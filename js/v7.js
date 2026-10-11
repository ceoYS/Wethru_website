/* WeThru V7 (design) — page behaviour. No dependencies.
   This page does not collect or send personal data. Consultation requests are submitted
   by the visitor on Google Forms; the picker below only pre-fills that form's URL. */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ---- analytics hook: forwards to a tag manager only if one is installed ---- */
  function track(name, detail) {
    var payload = { event: 'wethru_click', wethru_action: name };
    if (detail) payload.wethru_detail = detail;
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(payload);
    try { document.dispatchEvent(new CustomEvent('wethru:track', { detail: payload })); } catch (e) { /* old browsers */ }
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-track]');
    if (el) track(el.getAttribute('data-track'), el.getAttribute('data-pick') || '');
  });

  /* ---- header: hairline once the page scrolls ---- */
  var mast = $('.mast');
  var onScroll = function () { if (mast) mast.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- mobile menu ---- */
  var menuBtn = $('.menu-btn');
  var gnav = $('#gnav');
  function setMenu(open) {
    if (!menuBtn || !gnav) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    gnav.classList.toggle('is-open', open);
  }
  if (menuBtn && gnav) {
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    gnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && gnav.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (gnav.classList.contains('is-open') && !e.target.closest('.mast')) setMenu(false);
    });
  }

  /* ---- scroll reveal: one pass, then stays ---- */
  var revealEls = $$('.rv, .flow');
  if (hasIO && !reduceMotion) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); rio.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { rio.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---- current section in the nav ---- */
  var navLinks = $$('.gnav a[href^="#"]').filter(function (a) { return a.getAttribute('href').length > 1 && !a.classList.contains('gnav__cta'); });
  var sections = navLinks.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var navTick = false;
  function markNav() {
    navTick = false;
    var line = window.innerHeight * 0.4;
    var current = null;
    sections.forEach(function (s, i) {
      if (!s) return;
      var r = s.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) current = navLinks[i];
    });
    navLinks.forEach(function (a) { a.classList.toggle('is-current', a === current); });
  }
  if (navLinks.length) {
    window.addEventListener('scroll', function () { if (!navTick) { navTick = true; requestAnimationFrame(markNav); } }, { passive: true });
    markNav();
  }

  /* ---- mobile quick bar: after the hero, hidden over the contact section ---- */
  var mbar = $('.mbar');
  var heroEl = $('.hero');
  var contactEl = $('#contact');
  if (mbar && hasIO && heroEl) {
    var pastHero = false;
    var atContact = false;
    var sync = function () { mbar.classList.toggle('is-shown', pastHero && !atContact); };
    new IntersectionObserver(function (en) { pastHero = !en[0].isIntersecting; sync(); }, { threshold: 0 }).observe(heroEl);
    if (contactEl) new IntersectionObserver(function (en) { atContact = en[0].isIntersecting; sync(); }, { threshold: 0 }).observe(contactEl);
  } else if (mbar) mbar.classList.add('is-shown');

  /* ---- zoom dialog ---- */
  var dlg = $('#zoom');
  var dlgImg = $('#zoom-img');
  var dlgCap = $('#zoom-cap');
  var lastTrigger = null;
  $$('[data-zoom]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!dlg || typeof dlg.showModal !== 'function') { window.open(btn.getAttribute('data-zoom'), '_blank', 'noopener'); return; }
      lastTrigger = btn;
      dlgImg.src = btn.getAttribute('data-zoom');
      dlgImg.width = Number(btn.getAttribute('data-zoom-w')) || 0;
      dlgImg.height = Number(btn.getAttribute('data-zoom-h')) || 0;
      dlgImg.alt = btn.getAttribute('data-zoom-cap') || '';
      dlgCap.textContent = btn.getAttribute('data-zoom-cap') || '';
      dlg.showModal();
      track('work_zoom', btn.getAttribute('data-zoom'));
    });
  });
  if (dlg) {
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || e.target.closest('[data-close]')) dlg.close();
    });
    dlg.addEventListener('close', function () { if (lastTrigger) lastTrigger.focus(); });
  }

  /* ---- consultation picker → Google Forms pre-fill URL ---- */
  var picker = $('#picker');
  var formLink = $('#form-link');
  var summary = $('#picker-summary');
  var alias = {};
  try { alias = JSON.parse((picker && picker.getAttribute('data-alias')) || '{}'); } catch (e) { alias = {}; }
  function checked(name) { return picker ? $('input[name="' + name + '"]:checked', picker) : null; }
  function updateForm() {
    if (!picker || !formLink) return;
    var svc = checked('service');
    var prog = checked('program');
    if (!svc && !prog) { summary.textContent = ''; return; }
    var url = new URL(picker.getAttribute('data-form-base'));
    url.searchParams.set('usp', 'pp_url');
    var parts = [];
    if (svc) {
      JSON.parse(svc.getAttribute('data-form') || '[]').forEach(function (v) {
        url.searchParams.append(picker.getAttribute('data-entry-service'), v);
      });
      parts.push('관심 상품: ' + svc.getAttribute('data-label'));
    }
    if (prog) parts.push('지원 예정 사업: ' + prog.value);
    url.searchParams.set(picker.getAttribute('data-entry-memo'), '[wethru.com] ' + parts.join(' / ') + '\n');
    formLink.href = url.href;
    summary.textContent = parts.join(' · ') + ' — 신청서에 미리 입력됩니다.';
  }
  if (picker) picker.addEventListener('change', updateForm);

  // "이 상품으로 상담 신청" links pre-select the matching option
  $$('[data-pick]').forEach(function (a) {
    a.addEventListener('click', function () {
      var v = a.getAttribute('data-pick');
      v = alias[v] || v;
      var input = picker && $('input[name="service"][value="' + v + '"]', picker);
      if (input) { input.checked = true; updateForm(); }
    });
  });
})();
