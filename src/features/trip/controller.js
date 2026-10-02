import { $trip } from './store';
import { $storageStatus } from './storage';
import { sanitizeTrip } from './migrations';
export function initTripState(c) {
  const MOTION_KEY = 'manantiales-serranos:movimiento:v1';
  const emptyTrip = () => ({ version: 1, items: [], startDate: '' });
  let trip = structuredClone($trip.get());
  let writingTrip = false;
  let storageAvailable = $storageStatus.get() === 'available';
  function persistTrip() {
    writingTrip = true;
    $trip.set(sanitizeTrip(trip));
    writingTrip = false;
    updateSaveControls();
  }
  function updateSaveControls() {
    c.$$('[data-count]')
      .filter((node) => !node.closest('astro-island'))
      .forEach((node) => (node.textContent = trip.items.length));
    c.$$('[data-save]').forEach((button) => {
      const saved = trip.items.some((item) => item.id === Number(button.dataset.save));
      const p = c.byId.get(Number(button.dataset.save));
      button.setAttribute('aria-pressed', String(saved));
      button.setAttribute(
        'aria-label',
        `${saved ? 'Quitar' : 'Guardar'} ${p.name} ${saved ? 'de' : 'en'} mi viaje`,
      );
      button.classList.toggle('saved', saved);
      button.innerHTML =
        c.icon(saved ? 'check' : 'save') +
        (button.classList.contains('save-btn')
          ? ''
          : `<span>${saved ? 'Guardado en mi viaje' : 'Guardar en mi viaje'}</span>`);
    });
  }
  function toggleSaved(id) {
    id = Number(id);
    const index = trip.items.findIndex((item) => item.id === id);
    if (index >= 0) trip.items.splice(index, 1);
    else trip.items.push({ id, day: 1 });
    persistTrip();
    c.toast(index >= 0 ? 'Lugar quitado de tu viaje.' : `Guardaste ${c.byId.get(id).name}.`);
    if (c.$('#trip-dialog').open) c.renderTrip();
  }
  function addItems(items) {
    let count = 0;
    items.forEach((item) => {
      if (c.byId.has(item.id) && !trip.items.some((i) => i.id === item.id)) {
        trip.items.push({ id: item.id, day: item.day || 1 });
        count++;
      }
    });
    persistTrip();
    return count;
  }
  c.cleanups.push(
    $trip.listen((value) => {
      trip = structuredClone(value);
      updateSaveControls();
      if (!writingTrip && c.currentDialog?.id === 'trip-dialog') c.renderTrip();
    }),
  );
  c.cleanups.push(
    $storageStatus.listen((value) => {
      storageAvailable = value === 'available';
    }),
  );

  Object.defineProperties(c, {
    MOTION_KEY: { configurable: true, get: () => MOTION_KEY },
    emptyTrip: { configurable: true, get: () => emptyTrip },
    trip: {
      configurable: true,
      get: () => trip,
      set: (value) => {
        trip = value;
      },
    },
    storageAvailable: {
      configurable: true,
      get: () => storageAvailable,
      set: (value) => {
        storageAvailable = value;
      },
    },
    persistTrip: { configurable: true, get: () => persistTrip },
    updateSaveControls: { configurable: true, get: () => updateSaveControls },
    toggleSaved: { configurable: true, get: () => toggleSaved },
    addItems: { configurable: true, get: () => addItems },
  });
}
