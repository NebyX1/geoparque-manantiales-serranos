export function initHero(c) {
  const hero = c.$('#inicio');
  if (!hero) return;
  const caption = c.$('#hero-caption a');
  const slides = c.$$('.hero-image', hero);
  let slide = 0,
    heroPaused = false,
    heroVisible = true,
    heroTimer;
  let alive = true;
  c.cleanups.push(() => {
    alive = false;
  });
  function showHero(index, focus = false) {
    slide = (index + 4) % 4;
    const requested = slide;
    const incoming = slides[requested];
    const image = incoming.querySelector('img');
    image.loading = 'eager';
    incoming.hidden = false;
    const commit = () => {
      if (!alive || slide !== requested) return;
      incoming.hidden = false;
      slides.forEach((node, i) => {
        node.classList.toggle('active', i === requested);
        if (i !== requested)
          c.timeout(() => {
            if (i !== slide && !node.classList.contains('active')) node.hidden = true;
          }, 1200);
      });
      hero.dataset.landscape = String(requested);
      const photo = c.photoInfo(image.dataset.photoKey);
      caption.textContent = photo.caption;
      caption.href = photo.auditUrl;
    };
    // Keep the previous landscape visible until the next photo is ready.
    // Let the browser select the lazy picture's source before asking it to decode.
    c.raf(() => {
      if (slide !== requested) return;
      image.decode().then(commit, () => {
        if (alive && slide === requested)
          c.toast('No pudimos cargar ese paisaje. Probá nuevamente.');
      });
    });
    c.$$('[data-hero]').forEach((btn, i) => {
      btn.setAttribute('aria-selected', String(i === slide));
      btn.tabIndex = i === slide ? 0 : -1;
    });
    c.$('#hero-counter').textContent = `0${slide + 1} / 04`;
    if (focus) c.$$('[data-hero]')[slide].focus();
  }
  function scheduleHero() {
    clearInterval(heroTimer);
    if (!c.reduced && !heroPaused && heroVisible && !document.hidden)
      heroTimer = c.interval(() => showHero(slide + 1), 8500);
    const paused = heroPaused || c.reduced;
    c.$('#hero-pause').setAttribute('aria-pressed', String(paused));
    c.$('#hero-pause').setAttribute(
      'aria-label',
      paused ? 'Reanudar cambio de paisaje' : 'Pausar cambio de paisaje',
    );
    c.$('#hero-pause').innerHTML = c.icon(paused ? 'play' : 'pause');
  }
  c.listen(c.$('#hero-pause'), 'click', () => {
    if (c.reduced) {
      c.toast(
        'Los cambios automáticos están desactivados por tu preferencia de movimiento. Podés elegir cada paisaje.',
      );
      return;
    }
    heroPaused = !heroPaused;
    scheduleHero();
  });
  c.$$('[data-hero]').forEach((btn) => {
    c.listen(btn, 'click', () => {
      showHero(Number(btn.dataset.hero));
      heroPaused = true;
      scheduleHero();
    });
    c.listen(btn, 'keydown', (event) => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        showHero(
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? 3
              : slide + (event.key === 'ArrowRight' ? 1 : -1),
          true,
        );
        heroPaused = true;
        scheduleHero();
      }
    });
  });
  c.listen(document, 'visibilitychange', scheduleHero);

  Object.defineProperties(c, {
    slide: {
      configurable: true,
      get: () => slide,
      set: (value) => {
        slide = value;
      },
    },
    heroPaused: {
      configurable: true,
      get: () => heroPaused,
      set: (value) => {
        heroPaused = value;
      },
    },
    heroVisible: {
      configurable: true,
      get: () => heroVisible,
      set: (value) => {
        heroVisible = value;
      },
    },
    heroTimer: {
      configurable: true,
      get: () => heroTimer,
      set: (value) => {
        heroTimer = value;
      },
    },
    showHero: { configurable: true, get: () => showHero },
    scheduleHero: { configurable: true, get: () => scheduleHero },
  });
}
