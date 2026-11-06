/* WeThru website-first review branch. No fake submissions or booking confirmations. */
(() => {
  'use strict';
  document.querySelectorAll('a[data-track]').forEach(link => {
    link.addEventListener('click', () => {
      const name = link.dataset.track || 'contact';
      // Optional measurement only. Links work normally without analytics setup.
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'contact_click', { channel: name, page: 'website_first' });
      }
    });
  });
})();
