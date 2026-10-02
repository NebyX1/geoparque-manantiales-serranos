export function initActions(c) {
  c.listen(document, 'click', (event) => {
    const trigger = event.target instanceof Element ? event.target.closest('button,a') : null;
    if (!trigger) return;
    if (
      !c.currentDialog &&
      (trigger.hasAttribute('data-action') ||
        trigger.hasAttribute('data-gallery') ||
        trigger.hasAttribute('data-add-route'))
    )
      c.lastTrigger = trigger;
    if (trigger.matches('[data-close]')) {
      c.closeDialog();
      return;
    }
    if (trigger.dataset.save) {
      c.toggleSaved(trigger.dataset.save);
      return;
    }
    if (trigger.dataset.remove) {
      c.trip.items = c.trip.items.filter((i) => i.id !== Number(trigger.dataset.remove));
      c.persistTrip();
      c.renderTrip();
      return;
    }
    if (trigger.dataset.move) {
      const i = c.trip.items.findIndex((item) => item.id === Number(trigger.dataset.move));
      const j = i + Number(trigger.dataset.direction);
      if (j >= 0 && j < c.trip.items.length) {
        [c.trip.items[i], c.trip.items[j]] = [c.trip.items[j], c.trip.items[i]];
        c.persistTrip();
        c.renderTrip();
      }
      return;
    }
    if (trigger.dataset.addRoute) {
      const route = c.DATA.routes.find((r) => r.id === trigger.dataset.addRoute);
      const n = c.addItems(route.blocks.flatMap((b) => b.ids.map((id) => ({ id, day: b.day }))));
      c.renderTrip();
      c.openDialog('trip-dialog');
      c.toast(`${n} lugares nuevos guardados. Tus selecciones anteriores se conservan.`);
      return;
    }
    if (trigger.hasAttribute('data-gallery')) {
      c.showGallery(Number(trigger.dataset.gallery));
      return;
    }
    if (trigger.hasAttribute('data-answer')) {
      c.answerQuiz(Number(trigger.dataset.answer));
      return;
    }
    const action = trigger.dataset.action;
    if (action === 'search') {
      c.renderSearch();
      c.openDialog('search-dialog', '#global-search');
    } else if (action === 'trip') {
      c.renderTrip();
      c.openDialog('trip-dialog');
    } else if (action === 'privacy') c.privacy();
    else if (action === 'guide') c.downloadGuide();
    else if (action === 'gallery') c.showGallery(0);
    else if (action === 'original-map') c.showGallery(0, true);
    else if (action === 'calendar') c.exportCalendar();
    else if (action === 'trip-download') {
      c.downloadBlob(
        c.tripMarkdown(),
        'mi-viaje-manantiales-serranos.md',
        'text/markdown;charset=utf-8',
      );
      c.toast('Tu viaje se descargó.');
    } else if (action === 'trip-print') c.printTrip();
    else if (action === 'trip-copy') void c.copyTrip();
    else if (action === 'trip-clear') {
      if (confirm('¿Quitar todos los lugares de tu viaje?')) {
        c.trip = c.emptyTrip();
        c.persistTrip();
        c.renderTrip();
        c.toast('Tu viaje quedó vacío.');
      }
    } else if (action === 'quiz' || action === 'quiz-restart') {
      c.quizIndex = 0;
      c.quizScore = 0;
      c.renderQuiz();
      c.openDialog('quiz-dialog');
    } else if (action === 'quiz-next') {
      c.quizIndex++;
      c.renderQuiz();
    }
    if (trigger.tagName === 'A' && trigger.getAttribute('href')?.startsWith('#')) {
      const href = trigger.getAttribute('href');
      if (!c.$('#mobile-menu').hidden) toggleMenu(false);
      if (href === location.hash) {
        event.preventDefault();
        c.handleHash();
      }
    }
  });
  c.listen(document, 'change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.matches('[data-day]')) {
      const item = c.trip.items.find((i) => i.id === Number(target.dataset.day));
      if (item) {
        item.day = Number(target.value);
        c.persistTrip();
      }
    }
    if (target.id === 'trip-start-date') {
      c.trip.startDate = target.value;
      c.persistTrip();
    }
  });
  c.listen(
    document,
    'keydown',
    (event) => {
      if (event.key === 'Escape' && c.currentDialog) {
        event.preventDefault();
        event.stopPropagation();
        c.closeDialog();
      }
    },
    true,
  );
  c.listen(document, 'keydown', (event) => {
    if (
      event.key === '/' &&
      !/INPUT|TEXTAREA|SELECT/.test(event.target.tagName) &&
      !c.currentDialog
    ) {
      event.preventDefault();
      c.renderSearch();
      c.openDialog('search-dialog', '#global-search');
    }
    if (event.key === 'Escape' && !c.$('#mobile-menu').hidden) {
      toggleMenu(false);
      c.$('#mobile-toggle').focus();
    }
    if (event.key === 'Tab' && !c.$('#mobile-menu').hidden) {
      const nodes = [c.$('#mobile-toggle'), ...c.$$('#mobile-menu a')];
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  function toggleMenu(open) {
    c.$('#mobile-menu').hidden = !open;
    document.querySelector('main').inert = open;
    document.querySelector('footer').inert = open;
    c.$('#mobile-toggle').setAttribute('aria-expanded', String(open));
    c.$('#mobile-toggle').setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    c.$('#mobile-toggle').innerHTML = c.icon(open ? 'close' : 'menu');
    c.syncScrollLock();
    if (open) c.$('#mobile-menu a').focus();
  }
  c.listen(c.$('#mobile-toggle'), 'click', () => toggleMenu(c.$('#mobile-menu').hidden));

  Object.defineProperties(c, { toggleMenu: { configurable: true, get: () => toggleMenu } });
}
