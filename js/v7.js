/* WeThru V7 — page behaviour. No dependencies.
   This page does not collect or send personal data. Consultation requests are submitted
   by the visitor on Google Forms; the picker below only pre-fills that form's URL. */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      if (gnav.classList.contains('is-open') && !e.target.closest('.masthead')) setMenu(false);
    });
  }

  /* ---- hero: reviewer notes linked to the deliverable ---- */
  var review = $('.review');
  if (review) {
    var pins = $$('.review__pins li', review);
    var notes = $$('.review__notes li', review);
    var tourTimer = null;
    var setOn = function (n) {
      pins.concat(notes).forEach(function (el) { el.classList.toggle('is-on', el.getAttribute('data-pin') === n); });
    };
    var stopTour = function () { if (tourTimer) { clearTimeout(tourTimer); tourTimer = null; } };
    notes.forEach(function (li) {
      li.addEventListener('mouseenter', function () { stopTour(); setOn(li.getAttribute('data-pin')); });
      li.addEventListener('mouseleave', function () { setOn(null); });
    });
    var start = function () {
      review.classList.add('is-ready');
      if (reduceMotion) return;
      // one guided pass through the notes, then rest
      var i = 0;
      var step = function () {
        if (i >= notes.length) { setOn(null); tourTimer = null; return; }
        setOn(notes[i].getAttribute('data-pin'));
        i += 1;
        tourTimer = setTimeout(step, 1300);
      };
      tourTimer = setTimeout(step, 1200);
    };
    var img = $('img', review);
    if (img && !img.complete) { img.addEventListener('load', start, { once: true }); img.addEventListener('error', start, { once: true }); }
    else start();
  }

  /* ---- timeline bars grow when visible ---- */
  var gantt = $('.gantt');
  if (gantt) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { gantt.classList.add('is-in'); io.disconnect(); } });
      }, { threshold: 0.35 });
      io.observe(gantt);
    } else gantt.classList.add('is-in');
  }

  /* ---- work tabs (ARIA tabs with roving focus) ---- */
  var tabs = $$('.wtab');
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.classList.toggle('is-active', on);
    });
    if (focus) tab.focus();
    if (tab.scrollIntoView && window.matchMedia('(max-width: 819px)').matches) {
      tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab, false); track('work_tab', tab.id.replace('tab-', '')); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

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

  /* ---- pricing: one plan at a time on small screens ---- */
  var switchBtns = $$('.plan-switch button');
  function showPlan(id) {
    switchBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-plan') === id)); });
    $$('.plan').forEach(function (p) { p.classList.toggle('is-active', p.id === 'plan-' + id); });
  }
  switchBtns.forEach(function (b) { b.addEventListener('click', function () { showPlan(b.getAttribute('data-plan')); }); });

  /* ---- consultation picker → Google Forms pre-fill URL ---- */
  var picker = $('#picker');
  var formLink = $('#form-link');
  var summary = $('#picker-summary');
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

  // "이 상품으로 상담하기" buttons pre-select the matching option
  $$('[data-pick]').forEach(function (a) {
    a.addEventListener('click', function () {
      var v = a.getAttribute('data-pick');
      var input = picker && $('input[name="service"][value="' + v + '"]', picker);
      if (input) { input.checked = true; updateForm(); }
    });
  });
})();
