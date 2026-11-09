import { applyPhotoMetadata } from './photo-resolution.js';

export function initCore(c) {
  const DATA = JSON.parse(document.getElementById('page-data').textContent);
  const ASSETS = JSON.parse(document.getElementById('client-assets').textContent);
  const places = DATA.places;
  const byId = new Map(places.map((p) => [p.id, p]));
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value) =>
    String(value ?? '').replace(
      /[&<>"']/g,
      (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
    );
  const normalized = (value) =>
    String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const placeURL = (id) => `/lugares/${byId.get(Number(id)).slug}/`;
  const photo = (key) => {
    if (!ASSETS[key]) throw new Error(`Fotografía desconocida: ${key}`);
    return ASSETS[key];
  };
  const documented = 'Consultá accesos, horarios y reservas con cada lugar antes de viajar.';
  const refText = (text) => esc(text);
  const imageCaption = (p) => p.photoCaption || p.name;
  const photoInfo = (key) => DATA.photos[key];
  const photoAttributes = (key) => {
    const info = photoInfo(key);
    return info
      ? `data-photo-fit="${esc(info.fit)}" data-photo-kind="${esc(info.kind)}" data-photo-key="${esc(info.key)}" data-photo-width="${info.width}" data-photo-height="${info.height}" style="--photo-width:${info.width}px;--photo-height:${info.height}px" ${info.srcset ? `srcset="${esc(info.srcset)}" sizes="320px"` : ''}`
      : '';
  };
  const photoCredit = (key) => {
    const info = photoInfo(key);
    return info
      ? `<p class="photo-credit">${info.label ? `<strong>${esc(info.label)}.</strong> ` : ''}${esc(info.credit)}. <a href="${esc(info.auditUrl)}">Ver fuente${info.kind === 'restored' ? ' y foto original' : ''} ↗</a></p>`
      : '';
  };
  function hydratePhotos(root = document) {
    $$('img[data-photo]', root).forEach((img) => {
      img.src = photo(img.dataset.photo);
      const info = photoInfo(img.dataset.photo);
      applyPhotoMetadata(img, info);
      img.removeAttribute('data-photo');
      img.decoding = 'async';
    });
  }
  hydratePhotos();
  $$('svg.icon').forEach((node) => node.setAttribute('aria-hidden', 'true'));
  let toastTimer;
  function toast(message) {
    const node = $('#toast');
    node.textContent = message;
    node.classList.add('show');
    try {
      if (node.showPopover && !node.matches(':popover-open')) node.showPopover();
    } catch {
      /* The native enhancement is optional. */
    }
    clearTimeout(toastTimer);
    toastTimer = c.timeout(() => {
      node.classList.remove('show');
      try {
        node.hidePopover?.();
      } catch {
        /* The native enhancement is optional. */
      }
    }, 4300);
  }

  Object.defineProperties(c, {
    DATA: { configurable: true, get: () => DATA },
    ASSETS: { configurable: true, get: () => ASSETS },
    places: { configurable: true, get: () => places },
    byId: { configurable: true, get: () => byId },
    $: { configurable: true, get: () => $ },
    $$: { configurable: true, get: () => $$ },
    esc: { configurable: true, get: () => esc },
    normalized: { configurable: true, get: () => normalized },
    icon: { configurable: true, get: () => icon },
    placeURL: { configurable: true, get: () => placeURL },
    photo: { configurable: true, get: () => photo },
    documented: { configurable: true, get: () => documented },
    refText: { configurable: true, get: () => refText },
    imageCaption: { configurable: true, get: () => imageCaption },
    photoInfo: { configurable: true, get: () => photoInfo },
    photoAttributes: { configurable: true, get: () => photoAttributes },
    photoCredit: { configurable: true, get: () => photoCredit },
    hydratePhotos: { configurable: true, get: () => hydratePhotos },
    toastTimer: {
      configurable: true,
      get: () => toastTimer,
      set: (value) => {
        toastTimer = value;
      },
    },
    toast: { configurable: true, get: () => toast },
  });
}
