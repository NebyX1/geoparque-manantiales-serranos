import { $filters } from '../trip/store';
export function initAtlas(c) {
  if (!c.$('#explorar')) return;
  const current = $filters.get();
  c.$('#atlas-search').value = current.query;
  c.$('#atlas-region').value = current.region;
  c.$('#atlas-status').value = current.status;
  let filter = current.category,
    visibleLimit = 12;
  function filterPlaces() {
    const query = c.$('#atlas-search').value;
    const region = c.$('#atlas-region').value;
    const status = c.$('#atlas-status').value;
    $filters.set({ category: filter, query, region, status });
    let matches = c.places.filter((p) => {
      if (filter === 'Destacados' && !c.featured.includes(p.id)) return false;
      if (
        !['Destacados', 'Todos'].includes(filter) &&
        !p.themes.includes(filter) &&
        p.category !== filter &&
        !(filter === 'Agua' && p.category === 'Naturaleza')
      )
        return false;
      return (
        c.matchesQuery(c.searchIndex.get(p.id), query) &&
        (!region || p.region === region) &&
        (!status || p.status === status)
      );
    });
    if (filter === 'Destacados')
      matches.sort((a, b) => c.featured.indexOf(a.id) - c.featured.indexOf(b.id));
    const shown = matches.slice(0, filter === 'Destacados' ? 6 : visibleLimit);
    const ids = new Set(shown.map((p) => p.id));
    c.$$('.place-card').forEach((card) => {
      card.hidden = !ids.has(Number(card.dataset.id));
      if (ids.has(Number(card.dataset.id))) {
        card.style.order = shown.findIndex((p) => p.id === Number(card.dataset.id));
        card.classList.add('visible');
        if (typeof c.reduced !== 'undefined' && !c.reduced && card.animate)
          card.animate(
            [
              { opacity: 0, transform: 'translateY(18px)' },
              { opacity: 1, transform: 'none' },
            ],
            {
              duration: 450,
              delay: Math.min(180, shown.findIndex((p) => p.id === Number(card.dataset.id)) * 35),
              easing: 'cubic-bezier(.19,1,.22,1)',
              fill: 'backwards',
            },
          );
      }
    });
    c.$('#atlas-toolbar').hidden = filter === 'Destacados';
    c.$('#atlas-empty').hidden = matches.length !== 0;
    c.$('#results-count').textContent =
      filter === 'Destacados'
        ? '6 lugares para empezar'
        : `${shown.length} de ${matches.length} fichas`;
    const more = c.$('#explore-more');
    more.hidden = filter !== 'Destacados' && shown.length >= matches.length;
    more.innerHTML =
      filter === 'Destacados'
        ? `Explorar los 61 lugares ${c.icon('right')}`
        : `Mostrar ${Math.min(12, matches.length - shown.length)} más ${c.icon('plus')}`;
    c.$$('[data-filter]').forEach((button) =>
      button.setAttribute('aria-pressed', String(button.dataset.filter === filter)),
    );
  }
  c.$$('[data-filter]').forEach((button) =>
    c.listen(button, 'click', () => {
      filter = button.dataset.filter;
      visibleLimit = 12;
      filterPlaces();
    }),
  );
  ['atlas-search', 'atlas-region', 'atlas-status'].forEach((id) =>
    c.listen(document.getElementById(id), id === 'atlas-search' ? 'input' : 'change', () => {
      visibleLimit = 12;
      filterPlaces();
    }),
  );
  c.listen(c.$('#explore-more'), 'click', () => {
    if (filter === 'Destacados') {
      filter = 'Todos';
      visibleLimit = 12;
    } else visibleLimit += 12;
    filterPlaces();
    if (visibleLimit === 12)
      c.$('#atlas-toolbar').scrollIntoView({
        behavior: c.reduced ? 'auto' : 'smooth',
        block: 'center',
      });
  });

  Object.defineProperties(c, {
    filter: {
      configurable: true,
      get: () => filter,
      set: (value) => {
        filter = value;
      },
    },
    visibleLimit: {
      configurable: true,
      get: () => visibleLimit,
      set: (value) => {
        visibleLimit = value;
      },
    },
    filterPlaces: { configurable: true, get: () => filterPlaces },
  });
}
