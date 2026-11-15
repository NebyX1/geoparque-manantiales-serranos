import { applyPhotoMetadata } from './photo-resolution.js';
import { photoProfiles } from '../../lib/photo-profiles.mjs';

export function initCore(c) {
  const DATA = JSON.parse(document.getElementById('page-data').textContent);
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
  const documented =
    'El estudio de una ficha no habilita el acceso al sitio. Confirmá autorización y condiciones con sus responsables antes de una salida de campo.';
  const refText = (text) => esc(text);
  const imageCaption = (p) => p.photoCaption || p.name;
  const photoInfo = (key) => DATA.photos[key];
  const photo = (key, profile) => {
    const info = photoInfo(key);
    const variant = DATA.photoVariants[profile]?.[info?.key];
    if (!variant) throw new Error(`Fotografía sin perfil ${profile}: ${key}`);
    const [src, srcset] = variant;
    const { width, height, sizes } = photoProfiles[profile];
    return { src, srcset, sizes, width, height, profile, kind: info.kind, key: info.key };
  };
  const photoAttributes = (key, profile) => {
    const p = photo(key, profile);
    return `data-photo-fit="cover" data-photo-kind="${esc(p.kind)}" data-photo-key="${esc(p.key)}" data-photo-profile="${esc(profile)}" data-photo-width="${p.width}" data-photo-height="${p.height}" width="${p.width}" height="${p.height}" decoding="async" sizes="${esc(p.sizes)}" srcset="${esc(p.srcset)}" src="${esc(p.src)}"`;
  };
  const setPhoto = (image, key, profile) => {
    applyPhotoMetadata(image, photo(key, profile));
  };
  const photoCredit = (key) => {
    const info = photoInfo(key);
    return info
      ? `<p class="photo-credit">${info.label ? `<strong>${esc(info.label)}.</strong> ` : ''}${esc(info.credit)}. <a href="${esc(info.auditUrl)}">Ver fuente${info.hasOriginal ? ' e imagen de referencia' : ''} ↗</a></p>`
      : '';
  };
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
    places: { configurable: true, get: () => places },
    byId: { configurable: true, get: () => byId },
    $: { configurable: true, get: () => $ },
    $$: { configurable: true, get: () => $$ },
    esc: { configurable: true, get: () => esc },
    normalized: { configurable: true, get: () => normalized },
    icon: { configurable: true, get: () => icon },
    placeURL: { configurable: true, get: () => placeURL },
    setPhoto: { configurable: true, get: () => setPhoto },
    documented: { configurable: true, get: () => documented },
    refText: { configurable: true, get: () => refText },
    imageCaption: { configurable: true, get: () => imageCaption },
    photoInfo: { configurable: true, get: () => photoInfo },
    photoAttributes: { configurable: true, get: () => photoAttributes },
    photoCredit: { configurable: true, get: () => photoCredit },
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
