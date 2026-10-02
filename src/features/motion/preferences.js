export function initPreferences(c) {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let manualMotion = null;
  try {
    manualMotion = localStorage.getItem(c.MOTION_KEY);
  } catch {
    /* The native enhancement is optional. */
  }
  let reduced = manualMotion === null ? media.matches : manualMotion === 'reduce';
  function applyMotion() {
    document.documentElement.classList.add('js');
    document.documentElement.classList.toggle('motion', !reduced);
    document.documentElement.classList.toggle('reduce-motion', reduced);
    c.$('#motion-toggle').setAttribute('aria-pressed', String(reduced));
    c.$('#motion-toggle').innerHTML =
      c.icon(reduced ? 'play' : 'pause') +
      `<span>${reduced ? 'Activar movimiento' : 'Reducir movimiento'}</span>`;
    c.scheduleHero();
    c.configureGeoMotion();
  }
  c.listen(c.$('#motion-toggle'), 'click', () => {
    reduced = !reduced;
    manualMotion = reduced ? 'reduce' : 'full';
    try {
      localStorage.setItem(c.MOTION_KEY, manualMotion);
    } catch {
      /* The native enhancement is optional. */
    }
    applyMotion();
  });
  c.listen(media, 'change', () => {
    if (manualMotion === null) {
      reduced = media.matches;
      applyMotion();
    }
  });

  Object.defineProperties(c, {
    media: { configurable: true, get: () => media },
    manualMotion: {
      configurable: true,
      get: () => manualMotion,
      set: (value) => {
        manualMotion = value;
      },
    },
    reduced: {
      configurable: true,
      get: () => reduced,
      set: (value) => {
        reduced = value;
      },
    },
    applyMotion: { configurable: true, get: () => applyMotion },
  });
}
