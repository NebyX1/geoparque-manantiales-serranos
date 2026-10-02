export function initMap(c) {
  if (!c.$('#territorio')) return;
  let selectedMap = 1,
    zoom = 1;
  function updateMapZoom() {
    const point = c.DATA.mapPoints.find((p) => p.id === selectedMap);
    const width = 465 / zoom,
      height = 385 / zoom;
    const cx = zoom === 1 ? 302.5 : Math.max(70 + width / 2, Math.min(535 - width / 2, point.x));
    const cy = zoom === 1 ? 242.5 : Math.max(50 + height / 2, Math.min(435 - height / 2, point.y));
    c.$('#territory-svg').setAttribute(
      'viewBox',
      `${cx - width / 2} ${cy - height / 2} ${width} ${height}`,
    );
    c.$('[data-map-zoom="out"]').disabled = zoom <= 1;
    c.$('[data-map-zoom="in"]').disabled = zoom >= 2.5;
  }
  function selectMap(id) {
    const changed = selectedMap !== Number(id);
    selectedMap = Number(id);
    const p = c.byId.get(selectedMap);
    c.$$('[data-map-place]').forEach((node) => {
      const active = Number(node.dataset.mapPlace) === selectedMap;
      node.classList.toggle('active', active);
      node.setAttribute('aria-pressed', String(active));
    });
    if (changed) {
      c.$('#map-preview-image').srcset = '';
      c.$('#map-preview-image').src = c.photo(p.image);
    }
    c.$('#map-preview-image').alt = c.imageCaption(p);
    c.$('#map-preview-name').textContent = p.name;
    c.$('#map-preview-category').textContent = p.category;
    c.$('#map-preview-link').href = c.placeURL(p.id);
    if (zoom > 1) updateMapZoom();
  }
  c.$$('[data-map-place]').forEach((node) => {
    c.listen(node, 'click', () => selectMap(node.dataset.mapPlace));
    if (node.tagName.toLowerCase() === 'g')
      c.listen(node, 'keydown', (e) => {
        if (['Enter', ' '].includes(e.key)) {
          e.preventDefault();
          selectMap(node.dataset.mapPlace);
        }
      });
  });
  c.$$('[data-map-zoom]').forEach((btn) =>
    c.listen(btn, 'click', () => {
      zoom =
        btn.dataset.mapZoom === 'reset'
          ? 1
          : Math.max(1, Math.min(2.5, zoom + (btn.dataset.mapZoom === 'in' ? 0.5 : -0.5)));
      updateMapZoom();
    }),
  );

  Object.defineProperties(c, {
    selectedMap: {
      configurable: true,
      get: () => selectedMap,
      set: (value) => {
        selectedMap = value;
      },
    },
    zoom: {
      configurable: true,
      get: () => zoom,
      set: (value) => {
        zoom = value;
      },
    },
    updateMapZoom: { configurable: true, get: () => updateMapZoom },
    selectMap: { configurable: true, get: () => selectMap },
  });
}
