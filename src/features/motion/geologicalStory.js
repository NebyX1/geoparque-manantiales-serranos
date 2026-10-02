import { $activeStory } from '../trip/store';
export function initGeologicalStory(c) {
  if (!c.$('#historia')) return;
  const geoStory = c.$('#historia');
  const geoStage = c.$('.geo-stage');
  const geoScenes = c.$$('.geo-scene');
  const geoTabs = c.$$('[data-chapter]');
  const geoColors = [
    [36, 74, 56],
    [195, 147, 83],
    [36, 83, 91],
    [92, 107, 64],
  ];
  const geoRotations = [-2, 1.5, -1.5, 1.6];
  const clampGeo = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const smoothGeo = (value) => {
    const x = clampGeo(value);
    return x * x * (3 - 2 * x);
  };
  let geoMode = 'static',
    geoActive = -1,
    geoMetrics = { start: 0, range: 1, heroHeight: 820 };
  let geoResizeTimer;
  function fitDisplayType() {
    const title = c.$('.hero h1');
    if (!title) return;
    title.style.removeProperty('font-size');
    let max = 0;
    c.$$('.hero-word>span', title).forEach((line) => (max = Math.max(max, line.scrollWidth)));
    if (max > title.clientWidth && title.clientWidth > 0) {
      title.style.fontSize = `${parseFloat(getComputedStyle(title).fontSize) * (title.clientWidth / max) * 0.985}px`;
    }
    geoScenes.forEach((scene) => {
      const heading = c.$('.geo-title', scene);
      heading.style.removeProperty('font-size');
      if (!heading.clientWidth) return;
      const width = Math.max(...c.$$('span', heading).map((line) => line.scrollWidth));
      if (width > heading.clientWidth)
        heading.style.fontSize = `${parseFloat(getComputedStyle(heading).fontSize) * (heading.clientWidth / width) * 0.985}px`;
    });
  }
  function measureGeo() {
    fitDisplayType();
    if (!geoStory || !geoStage) return;
    const nav = c.$('#site-header').offsetHeight;
    geoMetrics = {
      start: geoStory.getBoundingClientRect().top + scrollY - nav,
      range: Math.max(1, geoStory.offsetHeight - geoStage.offsetHeight),
      heroHeight: c.$('#inicio').offsetHeight,
    };
  }
  function activeGeo(index) {
    index = clampGeo(index, 0, geoScenes.length - 1);
    if (index === geoActive) return;
    geoActive = index;
    $activeStory.set(index);
    geoScenes.forEach((scene, i) => {
      const active = i === index;
      scene.classList.toggle('is-active', active);
      scene.inert = geoMode !== 'static' && !active;
      if (geoMode !== 'static' && !active) scene.setAttribute('aria-hidden', 'true');
      else scene.removeAttribute('aria-hidden');
    });
    geoTabs.forEach((tab, i) => tab.setAttribute('aria-pressed', String(i === index)));
    c.$('#geo-current').textContent = String(index + 1).padStart(2, '0');
    c.$('[data-chapter-step="-1"]').disabled = index === 0;
    c.$('[data-chapter-step="1"]').disabled = index === geoScenes.length - 1;
    fitDisplayType();
    if (geoMode !== 'pinned') {
      const color = geoColors[index];
      geoStage.style.backgroundColor = `rgb(${color.join(',')})`;
      c.$('#geo-progress').style.transform = `scaleX(${(index + 1) / geoScenes.length})`;
    }
  }
  function configureGeoMotion() {
    const remembered = Math.max(0, geoActive);
    geoMode = c.reduced
      ? 'static'
      : innerWidth >= 1000 && innerHeight >= 720
        ? 'pinned'
        : 'carousel';
    geoStory.classList.toggle('is-pinned', geoMode === 'pinned');
    geoStory.classList.toggle('is-carousel', geoMode === 'carousel');
    geoStory.classList.toggle('is-static', geoMode === 'static');
    geoScenes.forEach((scene, i) => {
      [
        scene,
        ...c.$$(
          '.geo-polaroid,.geo-digit,.geo-title>span,.geo-description,.geo-halo,.geo-strata',
          scene,
        ),
      ].forEach((node) => {
        node.style.removeProperty('transform');
        node.style.removeProperty('opacity');
        node.style.removeProperty('visibility');
      });
      if (geoMode !== 'pinned')
        c.$('.geo-polaroid', scene).style.transform =
          `rotate(${c.reduced ? 0 : geoRotations[i]}deg)`;
    });
    geoActive = -1;
    activeGeo(remembered);
    measureGeo();
    updateGeoMotion();
    if (c.reduced) {
      c.$('.hero-copy').style.transform = '';
      c.$$('.hero-hill').forEach((node) => (node.style.transform = ''));
      c.$('.hero-seal').style.transform = '';
    }
  }
  function updateGeoMotion() {
    const y = scrollY;
    if (!c.reduced && y < geoMetrics.heroHeight + 100) {
      c.$('.hero-copy').style.transform = `translate3d(0,${(y * 0.075).toFixed(1)}px,0)`;
      c.$('.hero-seal').style.transform = `translate3d(0,${(y * 0.14).toFixed(1)}px,0)`;
      c.$$('.hero-hill').forEach(
        (node, i) =>
          (node.style.transform = `translate3d(0,${(y * [0.1, 0.05, 0.012][i]).toFixed(1)}px,0)`),
      );
    }
    if (geoMode === 'pinned') {
      const progress = clampGeo((y - geoMetrics.start) / geoMetrics.range);
      const logical = progress * 3.85;
      activeGeo(clampGeo(Math.floor(logical + 0.15), 0, 3));
      c.$('#geo-progress').style.transform = `scaleX(${progress.toFixed(4)})`;
      const from = clampGeo(Math.floor(logical), 0, 3),
        to = Math.min(from + 1, 3);
      const mix = smoothGeo((logical - from - 0.7) / 0.3);
      geoStage.style.backgroundColor = `rgb(${geoColors[from].map((value, i) => Math.round(value + (geoColors[to][i] - value) * mix)).join(',')})`;
      geoScenes.forEach((scene, i) => {
        const enter = i === 0 ? 1 : smoothGeo((logical - (i - 0.3)) / 0.3);
        const exit = i === 3 ? 0 : smoothGeo((logical - (i + 0.7)) / 0.3);
        const opacity = enter * (1 - exit);
        scene.style.visibility = opacity < 0.001 ? 'hidden' : 'visible';
        scene.style.opacity = opacity.toFixed(4);
        if (opacity < 0.001) return;
        scene.style.transform = `translate3d(0,${((1 - enter) * 18 - exit * 10).toFixed(2)}%,0)`;
        c.$('.geo-polaroid', scene).style.transform =
          `translate3d(${((1 - enter) * 90 - exit * 32).toFixed(1)}px,${((1 - enter) * 60 - exit * 30).toFixed(1)}px,0) rotate(${(geoRotations[i] + (1 - enter) * 9 - exit * 4).toFixed(2)}deg)`;
        c.$('.geo-digit', scene).style.transform =
          `translate3d(0,${((1 - enter) * 125 - exit * 100).toFixed(1)}px,0)`;
        c.$$('.geo-title>span', scene).forEach((line, j) => {
          const rise = i === 0 ? 1 : smoothGeo((logical - (i - 0.3 + j * 0.025)) / 0.24);
          line.style.transform = `translate3d(${((1 - rise) * 25).toFixed(1)}px,${((1 - rise) * 30).toFixed(1)}px,0)`;
          line.style.opacity = rise.toFixed(4);
        });
        const drift = clampGeo(logical - i, -0.3, 1);
        c.$('.geo-halo', scene).style.transform =
          `translate3d(${drift * 60}px,calc(-50% + ${drift * 30}px),0)`;
        c.$('.geo-strata', scene).style.transform =
          `translate3d(${-drift * 30}px,${drift * 15}px,0)`;
      });
    } else if (geoMode === 'static') {
      let current = 0;
      geoScenes.forEach((scene, i) => {
        if (scene.getBoundingClientRect().top < innerHeight * 0.55) current = i;
      });
      activeGeo(current);
    }
  }
  function goChapter(index, focus = false) {
    index = clampGeo(index, 0, 3);
    measureGeo();
    if (geoMode === 'pinned')
      window.scrollTo({
        top: geoMetrics.start + ((index + 0.15) / 3.85) * geoMetrics.range,
        behavior: c.reduced ? 'auto' : 'smooth',
      });
    else if (geoMode === 'static')
      geoScenes[index].scrollIntoView({ behavior: 'auto', block: 'start' });
    else {
      activeGeo(index);
      if (!c.reduced && geoScenes[index].animate)
        geoScenes[index].animate(
          [
            { opacity: 0.1, transform: 'translateY(20px)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: 650, easing: 'cubic-bezier(.19,1,.22,1)' },
        );
    }
    if (focus) geoTabs[index].focus({ preventScroll: true });
  }
  geoTabs.forEach((tab) => {
    c.listen(tab, 'click', () => goChapter(Number(tab.dataset.chapter)));
    c.listen(tab, 'keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const index =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? 3
            : Number(tab.dataset.chapter) + (event.key === 'ArrowRight' ? 1 : -1);
      goChapter(index, true);
    });
  });
  c.$$('[data-chapter-step]').forEach((button) =>
    c.listen(button, 'click', () => goChapter(geoActive + Number(button.dataset.chapterStep))),
  );
  let touchX = 0,
    touchY = 0,
    swipedAt = 0;
  c.listen(
    c.$('.geo-scenes'),
    'touchstart',
    (event) => {
      if (event.touches.length !== 1) return;
      touchX = event.touches[0].clientX;
      touchY = event.touches[0].clientY;
    },
    { passive: true },
  );
  c.listen(
    c.$('.geo-scenes'),
    'touchend',
    (event) => {
      if (geoMode !== 'carousel' || !event.changedTouches[0]) return;
      const dx = event.changedTouches[0].clientX - touchX,
        dy = event.changedTouches[0].clientY - touchY;
      if (Math.abs(dx) > 65 && Math.abs(dy) < 60) {
        swipedAt = Date.now();
        goChapter(geoActive + (dx < 0 ? 1 : -1));
      }
    },
    { passive: true },
  );
  c.listen(
    c.$('.geo-scenes'),
    'click',
    (event) => {
      if (Date.now() - swipedAt < 350) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true,
  );
  c.listen(
    window,
    'resize',
    () => {
      clearTimeout(geoResizeTimer);
      geoResizeTimer = c.timeout(configureGeoMotion, 120);
    },
    { passive: true },
  );

  Object.defineProperties(c, {
    geoStory: { configurable: true, get: () => geoStory },
    geoStage: { configurable: true, get: () => geoStage },
    geoScenes: { configurable: true, get: () => geoScenes },
    geoTabs: { configurable: true, get: () => geoTabs },
    geoColors: { configurable: true, get: () => geoColors },
    geoRotations: { configurable: true, get: () => geoRotations },
    clampGeo: { configurable: true, get: () => clampGeo },
    smoothGeo: { configurable: true, get: () => smoothGeo },
    geoMode: {
      configurable: true,
      get: () => geoMode,
      set: (value) => {
        geoMode = value;
      },
    },
    geoActive: {
      configurable: true,
      get: () => geoActive,
      set: (value) => {
        geoActive = value;
      },
    },
    geoMetrics: {
      configurable: true,
      get: () => geoMetrics,
      set: (value) => {
        geoMetrics = value;
      },
    },
    geoResizeTimer: {
      configurable: true,
      get: () => geoResizeTimer,
      set: (value) => {
        geoResizeTimer = value;
      },
    },
    fitDisplayType: { configurable: true, get: () => fitDisplayType },
    measureGeo: { configurable: true, get: () => measureGeo },
    activeGeo: { configurable: true, get: () => activeGeo },
    configureGeoMotion: { configurable: true, get: () => configureGeoMotion },
    updateGeoMotion: { configurable: true, get: () => updateGeoMotion },
    goChapter: { configurable: true, get: () => goChapter },
    touchX: {
      configurable: true,
      get: () => touchX,
      set: (value) => {
        touchX = value;
      },
    },
    touchY: {
      configurable: true,
      get: () => touchY,
      set: (value) => {
        touchY = value;
      },
    },
    swipedAt: {
      configurable: true,
      get: () => swipedAt,
      set: (value) => {
        swipedAt = value;
      },
    },
  });
}
