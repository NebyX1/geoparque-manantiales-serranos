import { initCore } from '../site/context.js';
import { initTripState } from '../trip/controller.js';
import { initDialogs } from '../site/dialogs.js';
import { initSearch } from '../search/controller.js';
import { initAtlas } from '../search/atlas.js';
import { initTripExports } from '../trip/exports.js';
import { initGeologicalStory } from '../motion/geologicalStory.js';
import { initMap } from '../map/controller.js';
import { initGallery } from '../gallery/controller.js';
import { initEducation } from '../education/controller.js';
import { initActions } from '../site/actions.js';
import { initPreferences } from '../motion/preferences.js';
import { initHero } from '../motion/hero.js';
import { initMotion } from '../motion/controller.js';
let cleanupPage;
function reset() {
  cleanupPage?.();
  cleanupPage = undefined;
  document.body.style.overflow = '';
}
function init() {
  reset();
  const controller = new AbortController();
  const observers = [],
    frames = new Set(),
    timers = new Set(),
    intervals = new Set();
  const c = {
    cleanups: [],
    configureGeoMotion: () => {},
    updateGeoMotion: () => {},
    measureGeo: () => {},
    scheduleHero: () => {},
    filterPlaces: () => {},
    selectMap: () => {},
    updateMapZoom: () => {},
    listen(target, type, listener, options = {}) {
      target?.addEventListener(type, listener, {
        ...(typeof options === 'boolean' ? { capture: options } : options),
        signal: controller.signal,
      });
    },
    observer(callback, options) {
      const observer = new IntersectionObserver(callback, options);
      observers.push(observer);
      return {
        observe: (target) => target && observer.observe(target),
        unobserve: (target) => observer.unobserve(target),
        disconnect: () => observer.disconnect(),
      };
    },
    raf(callback) {
      const id = requestAnimationFrame((time) => {
        frames.delete(id);
        if (!controller.signal.aborted) callback(time);
      });
      frames.add(id);
      return id;
    },
    timeout(callback, delay) {
      const id = setTimeout(() => {
        timers.delete(id);
        if (!controller.signal.aborted) callback();
      }, delay);
      timers.add(id);
      return id;
    },
    interval(callback, delay) {
      const id = setInterval(() => {
        if (!controller.signal.aborted) callback();
      }, delay);
      intervals.add(id);
      return id;
    },
  };
  initCore(c);
  initTripState(c);
  initDialogs(c);
  initSearch(c);
  initAtlas(c);
  initTripExports(c);
  initGeologicalStory(c);
  initMap(c);
  initGallery(c);
  initEducation(c);
  initActions(c);
  initPreferences(c);
  initHero(c);
  initMotion(c);
  c.listen(window, 'geopark:toast', (event) => c.toast(event.detail));
  c.listen(window, 'geopark:open-trip', () => {
    c.renderTrip();
    c.openDialog('trip-dialog');
  });
  c.filterPlaces();
  c.updateSaveControls();
  c.selectMap(1);
  c.updateMapZoom();
  c.applyMotion();
  c.updateScroll();
  document.fonts?.ready.then(() => {
    if (!controller.signal.aborted) {
      c.measureGeo();
      c.updateScroll();
    }
  });
  if (c.routePattern.test(location.hash)) c.handleHash();
  cleanupPage = () => {
    controller.abort();
    observers.forEach((observer) => observer.disconnect());
    frames.forEach(cancelAnimationFrame);
    timers.forEach(clearTimeout);
    intervals.forEach(clearInterval);
    c.cleanups.forEach((fn) => fn());
    document.querySelectorAll('dialog[open]').forEach((dialog) => dialog.close());
  };
}
document.addEventListener('astro:before-swap', reset);
document.addEventListener('astro:page-load', init);
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    reset();
    document.removeEventListener('astro:before-swap', reset);
    document.removeEventListener('astro:page-load', init);
  });
}
