/* WeThru review branch: accessible navigation and optional outbound CTA measurement. */
(() => {
  'use strict';
  const header = document.getElementById('siteHeader');
  const button = document.getElementById('menuToggle');
  const nav = document.getElementById('primary-nav');
  if (header && button && nav) {
    const close = () => {
      header.removeAttribute('data-open');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', '메뉴 열기');
    };
    const open = () => {
      header.setAttribute('data-open', 'true');
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-label', '메뉴 닫기');
    };
    button.addEventListener('click', () => {
      button.getAttribute('aria-expanded') === 'true' ? close() : open();
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
        close(); button.focus();
      }
    });
    document.addEventListener('pointerdown', event => {
      if (!header.contains(event.target)) close();
    });
    window.matchMedia('(min-width: 901px)').addEventListener('change', event => {
      if (event.matches) close();
    });
  }
  document.querySelectorAll('a[data-track]').forEach(link => {
    link.addEventListener('click', () => {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'contact_click', {
          channel: link.dataset.track || 'contact',
          page: 'website_first'
        });
      }
    });
  });
})();