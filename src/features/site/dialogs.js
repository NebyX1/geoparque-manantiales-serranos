export function initDialogs(c) {
  const routePattern = /^#(lugar|historia|circuito)\//;
  let baseHash = routePattern.test(location.hash) ? '#explorar' : location.hash || '#inicio';
  let currentDialog = null;
  let dialogTrigger = null;
  function syncScrollLock() {
    document.body.style.overflow = currentDialog || !c.$('#mobile-menu').hidden ? 'hidden' : '';
  }
  function openDialog(id, focusSelector) {
    const dialog = document.getElementById(id);
    if (currentDialog !== dialog) {
      const focused = c.lastTrigger || document.activeElement;
      c.lastTrigger = null;
      if (currentDialog) currentDialog.close();
      else dialogTrigger = focused;
      currentDialog = dialog;
      dialog.showModal();
    }
    dialog.scrollTop = 0;
    syncScrollLock();
    c.raf(() =>
      (focusSelector ? c.$(focusSelector, dialog) : c.$('[data-close]', dialog))?.focus({
        preventScroll: true,
      }),
    );
  }
  function closeDialog(resetHash = true) {
    if (!currentDialog) return;
    const dialog = currentDialog;
    currentDialog = null;
    dialog.close();
    if (resetHash && routePattern.test(location.hash)) history.replaceState(null, '', baseHash);
    syncScrollLock();
    if (dialogTrigger?.isConnected && !dialogTrigger.closest('dialog'))
      c.raf(() => dialogTrigger?.isConnected && dialogTrigger.focus({ preventScroll: true }));
  }
  c.$$('dialog').forEach((dialog) => {
    c.listen(dialog, 'cancel', (event) => {
      event.preventDefault();
      closeDialog();
    });
    c.listen(dialog, 'click', (event) => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (
        event.clientX < box.left ||
        event.clientX > box.right ||
        event.clientY < box.top ||
        event.clientY > box.bottom
      )
        closeDialog();
    });
  });
  function openPlace(p) {
    if (!p) return;
    c.$('#place-dialog-title').textContent = p.name;
    c.$('#place-dialog-kicker').textContent = `${p.category} · ${p.region}`;
    let practical = false;
    const main = [],
      extra = [];
    for (const block of p.blocks) {
      if (block.heading && /Llegada|Contacto|Modalidad/i.test(block.text)) practical = true;
      if (!practical && !block.heading && block.text.length > 85 && main.length < 3)
        main.push(block);
      else extra.push(block);
    }
    const surrounding = c.places.filter((q) => q.region === p.region && q.id !== p.id).slice(0, 4);
    const bodyHTML =
      main.map((b) => `<p>${c.esc(b.text)}</p>`).join('') || `<p>${c.esc(p.intro)}</p>`;
    const moreHTML = extra
      .map((b) => (b.heading ? `<h4>${c.esc(b.text)}</h4>` : `<p>${c.esc(b.text)}</p>`))
      .join('');
    const contact = p.channel
      ? `<a class="btn outline" href="${c.esc(p.channel.url)}" target="_blank" rel="noopener noreferrer">${c.esc(p.channel.label)} ${c.icon('arrow')}</a>`
      : '';
    c.$('#place-dialog-content').innerHTML =
      `<div class="detail-hero"><img src="${c.photo(p.image)}" alt="${c.esc(c.imageCaption(p))}"><span class="detail-photo-caption">${c.esc(c.imageCaption(p))}</span></div>
      <div class="detail-main"><div class="eyebrow">${c.esc(p.categoryRaw)}${p.international ? ' · Valor científico internacional' : ''}</div><h3 class="detail-title">${c.esc(p.name)}</h3><p class="detail-tagline">${c.esc(p.tagline)}</p>
      <div class="detail-grid"><div class="detail-body"><p class="detail-description">${c.esc(p.summary)}</p><h3>Una historia para descubrir</h3>${bodyHTML}
      ${moreHTML ? `<details class="detail-more"><summary>Seguí conociendo este lugar ↓</summary>${moreHTML}</details>` : ''}
      ${surrounding.length ? `<h3>Más cerca de acá</h3><div class="related-items">${surrounding.map((q) => `<a href="${c.placeURL(q.id)}">${c.esc(q.name)} ↗</a>`).join('')}</div>` : ''}</div>
      <aside class="detail-side"><h3>Planeá tu visita.</h3><span class="status">${c.esc(p.status)}</span><p>${c.esc(p.zone)}</p><p>${c.esc(p.statusRaw)}</p><button class="btn" data-save="${p.id}" aria-pressed="false">${c.icon('save')} Guardar en mi viaje</button>${contact}</aside></div></div>`;
    c.updateSaveControls();
    openDialog('place-dialog');
  }
  function openArticle(key) {
    const a = c.DATA.articles[key];
    if (!a) return;
    c.$('#article-dialog-title').textContent = a.eyebrow;
    c.$('#article-content').innerHTML =
      `<img class="reading-image" src="${c.photo(a.image)}" alt="Paisaje y vida de Manantiales Serranos"><h3 class="article-title">${c.esc(a.title)}</h3><p class="lead">${c.esc(a.lead)}</p>${a.sections.map(([heading, text]) => `<h3>${c.esc(heading)}</h3><p>${c.esc(text)}</p>`).join('')}<a class="text-link" href="#explorar">Seguí descubriendo el Geoparque ${c.icon('arrow')}</a>`;
    openDialog('article-dialog');
  }
  function openRoute(id) {
    const r = c.DATA.routes.find((route) => route.id === id);
    if (!r) return;
    c.$('#route-dialog-title').textContent = r.name;
    c.$('#route-content').innerHTML =
      `<img class="reading-image" src="${c.photo(r.image)}" alt="${c.esc(r.imageContext ? 'Paisaje serrano de Lavalleja' : r.name)}"><p class="eyebrow">${r.days} ${r.days === 1 ? 'día' : 'días'} · ${c.esc(r.kicker)}</p><p class="dialog-subtitle" style="margin-top:18px">${c.esc(r.text)}</p><div class="article-reading">${r.blocks.map((b) => `<h3>Día ${b.day} · ${c.esc(b.title)}</h3><p>${c.esc(b.text)}</p><div class="related-items" style="margin:15px 0 25px">${b.ids.map((id) => `<a href="${c.placeURL(id)}">${c.esc(c.byId.get(id).name)} ↗</a>`).join('')}</div>`).join('')}</div><button class="btn" data-add-route="${r.id}">Guardar esta escapada ${c.icon('save')}</button><p class="visit-note" style="margin-top:20px">Coordiná reservas y accesos con los lugares que elijas visitar.</p>`;
    openDialog('route-dialog');
  }
  function handleHash() {
    let hash;
    try {
      hash = decodeURIComponent(location.hash);
    } catch {
      c.toast('Ese enlace está incompleto. Buscá el lugar en el atlas.');
      return;
    }
    if (hash.startsWith('#lugar/')) {
      const place = c.places.find((p) => p.slug === hash.slice(7));
      if (place) openPlace(place);
      else c.toast('No encontramos esa ficha. Usá el buscador del atlas.');
    } else if (hash.startsWith('#historia/')) openArticle(hash.slice(10));
    else if (hash.startsWith('#circuito/')) openRoute(hash.slice(10));
    else {
      baseHash = hash || '#inicio';
      closeDialog(false);
      if (hash && document.getElementById(hash.slice(1)))
        document
          .getElementById(hash.slice(1))
          .scrollIntoView({ behavior: c.reduced ? 'auto' : 'smooth' });
    }
  }
  c.listen(window, 'hashchange', handleHash);

  Object.defineProperties(c, {
    routePattern: { configurable: true, get: () => routePattern },
    baseHash: {
      configurable: true,
      get: () => baseHash,
      set: (value) => {
        baseHash = value;
      },
    },
    currentDialog: {
      configurable: true,
      get: () => currentDialog,
      set: (value) => {
        currentDialog = value;
      },
    },
    dialogTrigger: {
      configurable: true,
      get: () => dialogTrigger,
      set: (value) => {
        dialogTrigger = value;
      },
    },
    syncScrollLock: { configurable: true, get: () => syncScrollLock },
    openDialog: { configurable: true, get: () => openDialog },
    closeDialog: { configurable: true, get: () => closeDialog },
    openPlace: { configurable: true, get: () => openPlace },
    openArticle: { configurable: true, get: () => openArticle },
    openRoute: { configurable: true, get: () => openRoute },
    handleHash: { configurable: true, get: () => handleHash },
  });
}
