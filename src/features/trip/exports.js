import { tripMarkdown as serializeTripMarkdown, guideMarkdown } from '../../lib/markdown';
import { tripCalendar } from './calendar';
export function initTripExports(c) {
  const blobUrls = new Set();
  c.cleanups.push(() => blobUrls.forEach((url) => URL.revokeObjectURL(url)));
  function renderTrip() {
    if (!c.trip.items.length) {
      c.$('#trip-content').innerHTML =
        `<div class="trip-empty">${c.icon('route')}<h3>Un lugar puede ser el comienzo.</h3><p>Guardá los lugares que te despierten curiosidad. Después podés ordenarlos por día y llevar tu selección con vos.</p><a class="btn" href="/explorar/">Descubrir lugares ${c.icon('arrow')}</a><div style="margin-top:20px"><a class="text-link" href="/planifica/">Dejame una idea para empezar ${c.icon('right')}</a></div></div>`;
      return;
    }
    c.$('#trip-content').innerHTML =
      `${c.storageAvailable ? '' : '<p class="storage-alert">El navegador no permite guardar datos. Tu selección funciona en esta sesión; exportala antes de cerrar la página.</p>'}<p class="dialog-subtitle">${c.trip.items.length} ${c.trip.items.length === 1 ? 'lugar guardado' : 'lugares guardados'}. Organizá los días a tu manera.</p><ol class="saved-list">${c.trip.items
        .map((item, index) => {
          const p = c.byId.get(item.id);
          return `<li class="saved-item"><img src="${c.photo(p.image)}" alt=""><div><h3><a href="${c.placeURL(p.id)}">${c.esc(p.name)}</a></h3><small>${c.esc(p.status)} · ${c.esc(p.region)}</small><div class="saved-controls"><label>Día<select data-day="${p.id}" aria-label="Día de visita para ${c.esc(p.name)}">${[1, 2, 3].map((day) => `<option value="${day}" ${day === item.day ? 'selected' : ''}>${day}</option>`).join('')}</select></label><button class="round" data-move="${p.id}" data-direction="-1" aria-label="Mover ${c.esc(p.name)} antes" ${index === 0 ? 'disabled' : ''}>${c.icon('up')}</button><button class="round" data-move="${p.id}" data-direction="1" aria-label="Mover ${c.esc(p.name)} después" ${index === c.trip.items.length - 1 ? 'disabled' : ''}>${c.icon('down')}</button></div></div><button class="round" data-remove="${p.id}" aria-label="Quitar ${c.esc(p.name)} del viaje">${c.icon('trash')}</button></li>`;
        })
        .join(
          '',
        )}</ol><div class="trip-export"><h3>De la pantalla a tu escapada.</h3><p>Elegí una fecha y llevá tu viaje al calendario. Los lugares se guardan como visitas de día completo.</p><div class="trip-date-row"><label for="trip-start-date">Primer día</label><input id="trip-start-date" type="date" value="${c.esc(c.trip.startDate)}"><button class="btn outline" data-action="calendar">Exportar calendario ${c.icon('download')}</button></div></div><div class="dialog-actions"><button class="btn" data-action="trip-download">Descargar mi viaje ${c.icon('download')}</button><button class="btn outline" data-action="trip-print">Imprimir ${c.icon('print')}</button><button class="btn outline" data-action="trip-copy">Copiar ${c.icon('share')}</button><button class="text-link" data-action="trip-clear">Vaciar mi viaje ${c.icon('trash')}</button></div><p class="visit-note" style="margin-top:22px">Tu selección queda guardada en este navegador.</p>`;
  }
  function tripMarkdown() {
    return serializeTripMarkdown(c.trip, c.places);
  }
  function downloadBlob(content, filename, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    blobUrls.add(url);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    c.timeout(() => {
      URL.revokeObjectURL(url);
      blobUrls.delete(url);
    }, 5000);
  }
  function exportCalendar() {
    try {
      downloadBlob(
        tripCalendar(c.trip, c.places),
        'mi-viaje-manantiales-serranos.ics',
        'text/calendar;charset=utf-8',
      );
      c.toast('Calendario descargado: propuestas de visita de día completo.');
    } catch {
      c.toast('Elegí la fecha del primer día antes de exportar.');
      c.$('#trip-start-date')?.focus();
    }
  }
  function printTrip() {
    c.$('#print-content').innerHTML =
      `<h1>Mi viaje por Manantiales Serranos</h1><p>${c.trip.startDate ? `Primer día: ${c.esc(c.trip.startDate)}. ` : ''}Tu recorrido por el Geoparque.</p>${[
        1, 2, 3,
      ]
        .map((day) => {
          const list = c.trip.items.filter((i) => i.day === day);
          return list.length
            ? `<h2>Día ${day}</h2><ol>${list
                .map((item) => {
                  const p = c.byId.get(item.id);
                  return `<li><strong>${c.esc(p.name)}</strong><p>${c.esc(p.summary)}</p><p>${c.esc(p.status)}. ${c.esc(p.zone)}. ${p.channel ? c.esc(p.channel.url) : ''}</p></li>`;
                })
                .join('')}</ol>`
            : '';
        })
        .join('')}<h2>Antes de viajar</h2><p>${c.documented}</p>`;
    window.print();
  }
  async function copyTrip() {
    const text = tripMarkdown();
    try {
      await navigator.clipboard.writeText(text);
      c.toast('Tu viaje está copiado. Pegalo donde quieras compartirlo.');
    } catch {
      const field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('aria-label', 'Tu viaje para copiar');
      field.style.cssText = 'width:100%;height:180px;margin-top:20px';
      c.$('#trip-content').appendChild(field);
      field.focus();
      field.select();
      c.toast('Seleccionamos tu viaje. Copialo con el comando del navegador.');
    }
  }
  function downloadGuide() {
    downloadBlob(
      guideMarkdown(c.places),
      'guia-de-bolsillo-manantiales-serranos.md',
      'text/markdown;charset=utf-8',
    );
    c.toast('Tu guía de bolsillo está descargada.');
  }

  Object.defineProperties(c, {
    renderTrip: { configurable: true, get: () => renderTrip },
    tripMarkdown: { configurable: true, get: () => tripMarkdown },
    downloadBlob: { configurable: true, get: () => downloadBlob },
    exportCalendar: { configurable: true, get: () => exportCalendar },
    printTrip: { configurable: true, get: () => printTrip },
    copyTrip: { configurable: true, get: () => copyTrip },
    downloadGuide: { configurable: true, get: () => downloadGuide },
  });
}
