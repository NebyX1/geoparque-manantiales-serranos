export function initGallery(c) {
  let galleryIndex = 0,
    originalMap = false;
  function showGallery(index = 0, map = false) {
    originalMap = map;
    galleryIndex = (index + c.DATA.gallery.length) % c.DATA.gallery.length;
    const item = map
      ? {
          key: 'map-original',
          title: 'Mapa del Geoparque',
          caption: 'Manantiales Serranos · Lugares de interés',
        }
      : c.DATA.gallery[galleryIndex];
    c.$('#lightbox-image').src = c.photo(item.key);
    c.$('#lightbox-image').alt = item.title;
    c.$('#lightbox-title').textContent = item.title;
    c.$('#lightbox-credit').textContent = map
      ? 'Mapa del Geoparque · Lugares de interés'
      : item.caption;
    c.$('#gallery-prev').hidden = map;
    c.$('#gallery-next').hidden = map;
    c.openDialog('gallery-dialog');
  }
  c.listen(c.$('#gallery-prev'), 'click', () => showGallery(galleryIndex - 1));
  c.listen(c.$('#gallery-next'), 'click', () => showGallery(galleryIndex + 1));
  c.listen(c.$('#gallery-dialog'), 'keydown', (e) => {
    if (!originalMap && ['ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      showGallery(galleryIndex + (e.key === 'ArrowRight' ? 1 : -1));
    }
  });

  Object.defineProperties(c, {
    galleryIndex: {
      configurable: true,
      get: () => galleryIndex,
      set: (value) => {
        galleryIndex = value;
      },
    },
    originalMap: {
      configurable: true,
      get: () => originalMap,
      set: (value) => {
        originalMap = value;
      },
    },
    showGallery: { configurable: true, get: () => showGallery },
  });
}
