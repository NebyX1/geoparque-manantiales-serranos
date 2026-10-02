import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const source = fs.readFileSync('scripts/reference-runtime.txt', 'utf8');
const slice = (from, to) => {
  const start = source.indexOf(from);
  return source.slice(start, source.indexOf(to, start + from.length));
};
const groups = [];
const add = (name, file, code, guard = '') => groups.push({ name, file, code, guard });
add(
  'Core',
  'site/context.js',
  slice('  const DATA', '  const STORE_KEY')
    .replaceAll("getElementById('site-data')", "getElementById('page-data')")
    .replaceAll("getElementById('site-assets')", "getElementById('client-assets')")
    .replace('`#lugar/${byId.get(Number(id)).slug}`', '`/lugares/${byId.get(Number(id)).slug}/`')
    .replace('  const refText = text => esc(text);\n', ''),
);
const saveControls = slice('  function updateSaveControls', "  window.addEventListener('storage'");
add(
  'TripState',
  'trip/controller.js',
  `
  const MOTION_KEY = 'manantiales-serranos:movimiento:v1';
  const emptyTrip = () => ({ version: 1, items: [], startDate: '' });
  let trip = structuredClone($trip.get());
  let storageAvailable = $storageStatus.get() === 'available';
  function persistTrip() { $trip.set(sanitizeTrip(trip)); updateSaveControls(); }
  ${saveControls}
  c.cleanups.push($trip.listen(value => {
    trip = structuredClone(value);
    updateSaveControls();
    if (c.currentDialog?.id === 'trip-dialog') c.renderTrip();
  }));
  c.cleanups.push($storageStatus.listen(value => { storageAvailable = value === 'available'; }));
`,
);
add('Dialogs', 'site/dialogs.js', slice('  const routePattern', '  const featured'));
const searchPrelude =
  slice('  const featured', '  let filter') +
  slice('  const searchIndex', '  function filterPlaces');
add(
  'Search',
  'search/controller.js',
  searchPrelude +
    slice('  function renderSearch', '  function renderTrip').replace(
      '#historia/${key}',
      '/historias/${key}/',
    ),
);
add(
  'Atlas',
  'search/atlas.js',
  slice('  let filter =', '  const searchIndex') +
    slice('  function filterPlaces', '  function renderSearch'),
  "if (!c.$('#explorar')) return;",
);
add(
  'TripExports',
  'trip/exports.js',
  slice('  function renderTrip', '  const planOptions')
    .replaceAll('href="#explorar"', 'href="/explorar/"')
    .replaceAll('href="#planificador"', 'href="/planifica/"'),
);
const exportsGroup = groups.find((group) => group.name === 'TripExports');
exportsGroup.code = exportsGroup.code
  .replace(
    slice('  function tripMarkdown', '  function downloadBlob'),
    'function tripMarkdown() { return serializeTripMarkdown(c.trip, c.places); }\n',
  )
  .replace(
    slice('  function shiftDate', '  function printTrip'),
    `function exportCalendar() {
    try { downloadBlob(tripCalendar(c.trip, c.places), 'mi-viaje-manantiales-serranos.ics', 'text/calendar;charset=utf-8'); c.toast('Calendario descargado: propuestas de visita de día completo.'); }
    catch { c.toast('Elegí la fecha del primer día antes de exportar.'); c.$('#trip-start-date')?.focus(); }
  }\n`,
  )
  .replace(
    slice('  function downloadGuide', '  const planOptions'),
    `function downloadGuide() { downloadBlob(guideMarkdown(c.places), 'guia-de-bolsillo-manantiales-serranos.md', 'text/markdown;charset=utf-8'); c.toast('Tu guía de bolsillo está descargada.'); }\n`,
  );
add(
  'GeologicalStory',
  'motion/geologicalStory.js',
  slice('  const geoStory', '  let selectedMap'),
  "if (!c.$('#historia')) return;",
);
add(
  'Map',
  'map/controller.js',
  slice('  let selectedMap', '  let galleryIndex')
    .replace(
      "$('#map-preview-link').dataset.place=String(p.id);",
      "$('#map-preview-link').href=placeURL(p.id);",
    )
    .replace(
      "  $('#map-preview-link').addEventListener('click',()=>{location.hash=placeURL(selectedMap);});",
      '',
    ),
  "if (!c.$('#territorio')) return;",
);
add(
  'Gallery',
  'gallery/controller.js',
  slice('  let galleryIndex', '  const questions').replace(
    "'Manantiales Serranos · Lavalleja, Uruguay';",
    'item.caption;',
  ),
);
add(
  'Education',
  'education/controller.js',
  slice('  const questions', "  document.addEventListener('click'"),
);
add(
  'Actions',
  'site/actions.js',
  slice("  document.addEventListener('click'", '  const media')
    .replace(
      "    const trigger=event.target.closest('button,a');",
      "    const trigger=event.target instanceof Element ? event.target.closest('button,a') : null;",
    )
    .replace(
      'const target=event.target;',
      'const target=event.target; if (!(target instanceof HTMLElement)) return;',
    )
    .replace(
      "const href=trigger.getAttribute('href');",
      "const href=trigger.getAttribute('href');",
    ),
);
add(
  'Preferences',
  'motion/preferences.js',
  slice('  const media', '  let slide') +
    slice('  function applyMotion', "  $('#hero-pause').addEventListener") +
    slice("  media.addEventListener('change'", "  document.addEventListener('visibilitychange'"),
);
add(
  'Hero',
  'motion/hero.js',
  slice('  let slide', '  function applyMotion') +
    slice("  $('#hero-pause').addEventListener", "  media.addEventListener('change'") +
    "  document.addEventListener('visibilitychange',scheduleHero);\n",
  "if (!c.$('#inicio')) return;",
);
add(
  'Motion',
  'motion/controller.js',
  slice('  let scrollPending', '  filterPlaces();').replace(
    ".observe($('#inicio'));",
    ".observe($('#inicio'));",
  ),
);

const declarations = (code) => {
  const sf = ts.createSourceFile('input.js', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const out = new Map();
  for (const statement of sf.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) out.set(statement.name.text, false);
    if (ts.isVariableStatement(statement))
      for (const decl of statement.declarationList.declarations)
        if (ts.isIdentifier(decl.name))
          out.set(decl.name.text, !(statement.declarationList.flags & ts.NodeFlags.Const));
  }
  return out;
};
const names = new Set(groups.flatMap((group) => [...declarations(group.code).keys()]));
const imported = new Set(['$trip', '$storageStatus', 'sanitizeTrip']);
const noops = [
  'configureGeoMotion',
  'updateGeoMotion',
  'measureGeo',
  'scheduleHero',
  'filterPlaces',
  'selectMap',
  'updateMapZoom',
];
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
for (const group of groups) {
  const local = declarations(group.code);
  const sf = ts.createSourceFile(
    'input.js',
    group.code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  const transformed = ts.transform(sf, [
    (context) => {
      const f = context.factory;
      const access = (name) => f.createPropertyAccessExpression(f.createIdentifier('c'), name);
      const visit = (node) => {
        if (
          ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression) &&
          node.expression.name.text === 'addEventListener'
        ) {
          return f.createCallExpression(access('listen'), undefined, [
            ts.visitNode(node.expression.expression, visit),
            ...node.arguments.map((arg) => ts.visitNode(arg, visit)),
          ]);
        }
        if (
          ts.isCallExpression(node) &&
          ts.isIdentifier(node.expression) &&
          ['requestAnimationFrame', 'setTimeout', 'setInterval'].includes(node.expression.text)
        ) {
          const method = {
            requestAnimationFrame: 'raf',
            setTimeout: 'timeout',
            setInterval: 'interval',
          }[node.expression.text];
          return f.createCallExpression(
            access(method),
            undefined,
            node.arguments.map((arg) => ts.visitNode(arg, visit)),
          );
        }
        if (
          ts.isNewExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.expression.text === 'IntersectionObserver'
        )
          return f.createCallExpression(
            access('observer'),
            undefined,
            (node.arguments || []).map((arg) => ts.visitNode(arg, visit)),
          );
        if (
          ts.isShorthandPropertyAssignment(node) &&
          names.has(node.name.text) &&
          !local.has(node.name.text)
        )
          return f.createPropertyAssignment(node.name.text, access(node.name.text));
        if (
          ts.isIdentifier(node) &&
          names.has(node.text) &&
          !local.has(node.text) &&
          !imported.has(node.text)
        ) {
          const parent = node.parent;
          const isName =
            (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
            (ts.isPropertyAssignment(parent) && parent.name === node) ||
            ((ts.isVariableDeclaration(parent) ||
              ts.isParameter(parent) ||
              ts.isFunctionDeclaration(parent)) &&
              parent.name === node);
          if (!isName) return access(node.text);
        }
        return ts.visitEachChild(node, visit, context);
      };
      return (root) => ts.visitNode(root, visit);
    },
  ]);
  let code = printer
    .printFile(transformed.transformed[0])
    .replace(/catch\s*\{\s*\}/g, 'catch { /* The native enhancement is optional. */ }');
  if (group.name === 'GeologicalStory')
    code = code.replace(
      "const title = c.$('.hero h1');",
      "const title = c.$('.hero h1');\nif (!title) return;",
    );
  if (group.name === 'Motion') {
    code = code.replace(
      "c.observer(entries => { c.heroVisible = entries[0].isIntersecting; c.scheduleHero(); }, { threshold: .05 }).observe(c.$('#inicio'));",
      "if (c.$('#inicio')) c.observer(entries => { c.heroVisible = entries[0].isIntersecting; c.scheduleHero(); }, { threshold: .05 }).observe(c.$('#inicio'));",
    );
    code = code.replace(
      'navObserver.observe(document.getElementById(id))',
      'document.getElementById(id) && navObserver.observe(document.getElementById(id))',
    );
  }
  const descriptors = [...local]
    .map(
      ([name, mutable]) =>
        `${name}: { configurable: true, get: () => ${name}${mutable ? `, set: value => { ${name} = value; }` : ''} }`,
    )
    .join(',\n');
  const imports =
    group.name === 'TripState'
      ? "import { $trip } from './store';\nimport { $storageStatus } from './storage';\nimport { sanitizeTrip } from './migrations';\n"
      : group.name === 'TripExports'
        ? "import { tripMarkdown as serializeTripMarkdown, guideMarkdown } from '../../lib/markdown';\nimport { tripCalendar } from './calendar';\n"
        : '';
  const file = path.join('src/features', group.file);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(
    file,
    `${imports}export function init${group.name}(c) {\n${group.guard}\n${code}\nObject.defineProperties(c, { ${descriptors} });\n}\n`,
  );
  transformed.dispose();
}
const imports = groups
  .map((group) => `import { init${group.name} } from '../${group.file}';`)
  .join('\n');
fs.writeFileSync(
  'src/features/site/lifecycle.js',
  `${imports}
let cleanupPage;
function reset() { cleanupPage?.(); cleanupPage = undefined; document.body.style.overflow = ''; }
function init() {
  reset();
  const controller = new AbortController();
  const observers = [], frames = new Set(), timers = new Set(), intervals = new Set();
  const c = { cleanups: [], ${noops.map((name) => `${name}: () => {}`).join(', ')},
    listen(target, type, listener, options = {}) { target?.addEventListener(type, listener, { ...(typeof options === 'boolean' ? { capture: options } : options), signal: controller.signal }); },
    observer(callback, options) { const observer = new IntersectionObserver(callback, options); observers.push(observer); return { observe: target => target && observer.observe(target), unobserve: target => observer.unobserve(target), disconnect: () => observer.disconnect() }; },
    raf(callback) { const id = requestAnimationFrame(time => { frames.delete(id); if (!controller.signal.aborted) callback(time); }); frames.add(id); return id; },
    timeout(callback, delay) { const id = setTimeout(() => { timers.delete(id); if (!controller.signal.aborted) callback(); }, delay); timers.add(id); return id; },
    interval(callback, delay) { const id = setInterval(() => { if (!controller.signal.aborted) callback(); }, delay); intervals.add(id); return id; },
  };
  ${groups.map((group) => `init${group.name}(c);`).join('\n  ')}
  c.listen(window, 'geopark:toast', event => c.toast(event.detail));
  c.listen(window, 'geopark:open-trip', () => { c.renderTrip(); c.openDialog('trip-dialog'); });
  c.filterPlaces(); c.updateSaveControls(); c.selectMap(1); c.updateMapZoom(); c.applyMotion(); c.updateScroll();
  document.fonts?.ready.then(() => { if (!controller.signal.aborted) { c.measureGeo(); c.updateScroll(); } });
  if (c.routePattern.test(location.hash)) c.handleHash();
  cleanupPage = () => { controller.abort(); observers.forEach(observer => observer.disconnect()); frames.forEach(cancelAnimationFrame); timers.forEach(clearTimeout); intervals.forEach(clearInterval); c.cleanups.forEach(fn => fn()); document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close()); };
}
document.addEventListener('astro:before-swap', reset);
document.addEventListener('astro:page-load', init);
`,
);
console.log(
  `Created ${groups.length} feature controllers with abortable events, observers, timers and frames.`,
);
