import { useEffect } from 'react';

export default function useReveal({ selector = '.reveal', base = 0, step = 160, options = {} } = {}) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(selector));
    if (!('IntersectionObserver' in window) || els.length === 0) {
      els.forEach(el => el.classList.add('in'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        if (entry.isIntersecting) {
          // si el elemento no trae data-reveal-delay, calculamos automático según su índice
          const i = els.indexOf(el);
          const delayAttr = el.getAttribute('data-reveal-delay');
          const delayMs = delayAttr ? parseInt(delayAttr, 10) : base + i * step;

          el.style.transitionDelay = `${delayMs}ms`;
          el.classList.add('in');
          io.unobserve(el); // revelar una vez
        }
      });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1, ...options });

    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [selector, base, step, options]);
}
