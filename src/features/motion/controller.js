export function initMotion(c) {
  const header = c.$('#site-header');
  const root = document.documentElement;
  function syncHeaderHeight() {
    const height = `${header.offsetHeight}px`;
    if (root.style.getPropertyValue('--site-header-height') !== height) {
      root.style.setProperty('--site-header-height', height);
      c.measureGeo();
    }
  }
  syncHeaderHeight();
  const headerObserver = new ResizeObserver(() => c.raf(syncHeaderHeight));
  headerObserver.observe(header, { box: 'border-box' });
  c.cleanups.push(() => {
    headerObserver.disconnect();
    root.style.removeProperty('--site-header-height');
  });

  let scrollPending = false;
  function updateScroll() {
    scrollPending = false;
    c.updateGeoMotion();
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 30);
    const max = document.documentElement.scrollHeight - innerHeight;
    c.$('#page-progress').style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    c.$('#back-top').classList.toggle('show', y > innerHeight);
  }
  c.listen(
    window,
    'scroll',
    () => {
      if (!scrollPending) {
        scrollPending = true;
        c.raf(updateScroll);
      }
    },
    { passive: true },
  );
  if ('IntersectionObserver' in window) {
    const observer = c.observer(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.06 },
    );
    c.$$('.reveal').forEach((node) => observer.observe(node));
    if (c.$('#inicio'))
      c.observer(
        (entries) => {
          c.heroVisible = entries[0].isIntersecting;
          c.scheduleHero();
        },
        { threshold: 0.05 },
      ).observe(c.$('#inicio'));
    const navObserver = c.observer(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            for (const link of c.$$('.desktop-nav a, #mobile-menu a')) {
              const current = link.hash === `#${entry.target.id}`;
              link.classList.toggle('active', current);
              if (current) link.setAttribute('aria-current', 'location');
              else link.removeAttribute('aria-current');
            }
          }
        });
      },
      { rootMargin: '-10% 0px -70% 0px' },
    );
    ['explorar', 'historia', 'naturaleza', 'aprender', 'visita'].forEach(
      (id) => document.getElementById(id) && navObserver.observe(document.getElementById(id)),
    );
  } else {
    c.$$('.reveal').forEach((node) => node.classList.add('visible'));
  }
  c.listen(
    window,
    'resize',
    () => {
      c.raf(() => {
        if (!c.$('#mobile-toggle').getClientRects().length && !c.$('#mobile-menu').hidden)
          c.toggleMenu(false);
      });
    },
    { passive: true },
  );

  Object.defineProperties(c, {
    scrollPending: {
      configurable: true,
      get: () => scrollPending,
      set: (value) => {
        scrollPending = value;
      },
    },
    updateScroll: { configurable: true, get: () => updateScroll },
  });
}
