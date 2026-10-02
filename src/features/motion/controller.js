export function initMotion(c) {
  let scrollPending = false;
  function updateScroll() {
    scrollPending = false;
    c.updateGeoMotion();
    const y = window.scrollY;
    c.$('#site-header').classList.toggle('scrolled', y > 30);
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
          if (entry.isIntersecting)
            c.$$('.desktop-nav a').forEach((a) =>
              a.classList.toggle('active', a.hash === `#${entry.target.id}`),
            );
        });
      },
      { rootMargin: '-10% 0px -70% 0px' },
    );
    ['explorar', 'historia', 'territorio', 'naturaleza', 'visita'].forEach(
      (id) => document.getElementById(id) && navObserver.observe(document.getElementById(id)),
    );
  } else {
    c.$$('.reveal').forEach((node) => node.classList.add('visible'));
  }
  c.listen(
    window,
    'resize',
    () => {
      if (innerWidth > 900 && !c.$('#mobile-menu').hidden) c.toggleMenu(false);
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
