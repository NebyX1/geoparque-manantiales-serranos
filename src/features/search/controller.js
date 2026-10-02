import { matchesQuery, placeSearchText } from '../../lib/search';
export function initSearch(c) {
  const featured = [1, 23, 31, 17, 14, 54];
  const searchIndex = new Map(c.places.map((p) => [p.id, placeSearchText(p)]));
  function renderSearch() {
    const query = c.$('#global-search').value;
    const results = c.places.filter((p) => matchesQuery(searchIndex.get(p.id), query));
    const articles = Object.entries(c.DATA.articles).filter(
      ([, a]) =>
        query.length > 1 && matchesQuery(c.normalized(`${a.title} ${a.eyebrow} ${a.lead}`), query),
    );
    c.$('#search-counter').textContent = query
      ? `${results.length} lugares y ${articles.length} historias. Mostrando hasta 15 resultados.`
      : 'Algunas ideas para empezar. Buscá por lugar, zona o tema.';
    const subset = query ? results.slice(0, 12) : featured.map((id) => c.byId.get(id));
    c.$('#search-results').innerHTML =
      subset
        .map(
          (p) =>
            `<li><a href="${c.placeURL(p.id)}"><img src="${c.photo(p.image)}" alt=""><span><strong>${c.esc(p.name)}</strong><small>${c.esc(p.region)} · ${c.esc(p.status)}</small></span>${c.icon('arrow')}</a></li>`,
        )
        .join('') +
      articles
        .slice(0, 3)
        .map(
          ([key, a]) =>
            `<li><a href="/historias/${key}/"><img src="${c.photo(a.image)}" alt=""><span><strong>${c.esc(a.title)}</strong><small>Historia · ${c.esc(a.eyebrow)}</small></span>${c.icon('arrow')}</a></li>`,
        )
        .join('');
    if (!subset.length && !articles.length)
      c.$('#search-results').innerHTML =
        '<li class="search-empty">No encontramos esa búsqueda. Probá «agua», «Minas», «museo» o «Arequita».</li>';
  }
  c.listen(c.$('#global-search'), 'input', renderSearch);

  Object.defineProperties(c, {
    featured: { configurable: true, get: () => featured },
    searchIndex: { configurable: true, get: () => searchIndex },
    matchesQuery: { configurable: true, get: () => matchesQuery },
    renderSearch: { configurable: true, get: () => renderSearch },
  });
}
