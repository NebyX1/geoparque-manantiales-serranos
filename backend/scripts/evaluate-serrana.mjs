import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

const help = `Evaluación de Serrana contra una instancia local ya iniciada.

  node scripts/evaluate-serrana.mjs [opciones]
  --endpoint http://127.0.0.1:4319/api/serrana/chat
  --input tests/evaluation/serrana-cases.mjs     Corpus JS (serranaCases) o JSON
  --out reports/experience-review/serrana-qa/responses
  --jobs 3                                    Concurrencia entre 1 y 3
  --rpm 24                                    Solicitudes por minuto, con reintentos incluidos
  --timeout-ms 75000                          Plazo individual de una solicitud
  --limit N                                   Primeros N casos del filtro
  --case TEXTO                                Filtra identificador o categoría
  --only-ids ID1,ID2                           Filtra identificadores exactos
  --list                                      Valida el corpus y lista la selección
  --resume                                    Retoma casos pendientes y errores técnicos
  --help

Las preguntas se toman del corpus. El evaluador nunca lee una clave del proveedor.
Escribe results.jsonl, summary.json y summary.md. Códigos de salida: 0 sin fallos,
1 con discrepancias, 2 con errores técnicos o de configuración.
`;

const defaults = {
  endpoint: 'http://127.0.0.1:4319/api/serrana/chat',
  input: 'tests/evaluation/serrana-cases.mjs',
  out: 'reports/experience-review/serrana-qa/responses',
  jobs: '3',
  rpm: '24',
  'timeout-ms': '75000',
};
const kinds = new Set(['answer', 'abstain', 'refuse', 'mixed', 'social']);
const sourceRequirements = new Set(['required', 'none', 'optional']);
const matcherKeys = ['allOf', 'anyOf', 'forbidden', 'sourcePaths'];
const outcomes = ['pass', 'fail', 'technical_error'];

function parseOptions(args) {
  const options = { ...defaults, resume: false, list: false };
  const valueOptions = new Set([...Object.keys(defaults), 'limit', 'case', 'only-ids']);
  for (let i = 0; i < args.length; i++) {
    const name = args[i].slice(2);
    if (args[i] === '--resume' || args[i] === '--list') {
      options[name] = true;
    } else if (args[i].startsWith('--') && valueOptions.has(name)) {
      const value = args[++i];
      if (!value || value.startsWith('--')) throw new Error(`Falta el valor de --${name}.`);
      options[name] = value;
    } else {
      throw new Error('Opción desconocida. Consultá --help.');
    }
  }
  for (const [name, min, max] of [
    ['jobs', 1, 3],
    ['rpm', 1, 300],
    ['timeout-ms', 50, 120_000],
    ['limit', 1, 10_000],
  ]) {
    if (options[name] === undefined) continue;
    const value = Number(options[name]);
    if (!Number.isInteger(value) || value < min || value > max) {
      throw new Error(`--${name} debe ser un entero entre ${min} y ${max}.`);
    }
    options[name] = value;
  }
  const endpoint = new URL(options.endpoint);
  if (
    endpoint.protocol !== 'http:' ||
    !['127.0.0.1', 'localhost', '[::1]'].includes(endpoint.hostname) ||
    endpoint.username ||
    endpoint.password ||
    endpoint.search ||
    endpoint.hash
  ) {
    throw new Error('Usá un endpoint HTTP local sin credenciales ni parámetros.');
  }
  return { ...options, endpoint };
}

function redactSecrets(value) {
  return value
    .replace(/\bBearer\s+[\w.+/=-]{16,}/gi, 'Bearer [redactado]')
    .replace(/\b[a-f0-9]{32}\.[\w-]{16,}\b/gi, '[credencial redactada]')
    .replace(/\b(?:sk|ghp|gho|ghu|github_pat)[-_][\w-]{20,}\b/g, '[credencial redactada]')
    .replace(/([?&](?:access_token|api_key|apikey|token|signature)=)[^&#\s]+/gi, '$1[redactado]');
}

function redact(value) {
  return redactSecrets(value).replace(/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/gi, '[correo redactado]');
}

function normalize(value) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function validateCases(cases) {
  if (!Array.isArray(cases) || cases.length === 0) throw new Error('El corpus está vacío.');
  const ids = new Set();
  for (const test of cases) {
    if (
      !test ||
      typeof test.id !== 'string' ||
      !/^[a-z0-9][a-z0-9_-]*$/i.test(test.id) ||
      ids.has(test.id)
    ) {
      throw new Error('El corpus contiene un identificador inválido o repetido.');
    }
    ids.add(test.id);
    const expected = test.expected;
    if (
      typeof test.category !== 'string' ||
      !test.category.trim() ||
      typeof test.message !== 'string' ||
      !test.message.trim() ||
      !expected ||
      !kinds.has(expected.kind) ||
      typeof expected.criterion !== 'string' ||
      !expected.criterion.trim() ||
      (expected.sources !== undefined && !sourceRequirements.has(expected.sources))
    ) {
      throw new Error(`El caso ${test.id} no cumple el contrato del evaluador.`);
    }
    for (const key of matcherKeys) {
      if (expected[key] === undefined) continue;
      if (!Array.isArray(expected[key]) || expected[key].some((term) => typeof term !== 'string')) {
        throw new Error(`El caso ${test.id} tiene un matcher inválido en ${key}.`);
      }
      for (const pattern of expected[key]) {
        try {
          new RegExp(pattern, 'iu');
        } catch {
          throw new Error(`El caso ${test.id} tiene una expresión inválida en ${key}.`);
        }
      }
    }
  }
}

function signature(test) {
  return createHash('sha256').update(JSON.stringify(test)).digest('hex').slice(0, 20);
}

function compare(test, answer, sources) {
  const expected = test.expected;
  const normalized = normalize(answer);
  const requirements =
    expected.sources ?? (['answer', 'mixed'].includes(expected.kind) ? 'required' : 'none');
  const issues = [];
  if (redactSecrets(answer) !== answer || sources.some(({ url }) => redactSecrets(url) !== url)) {
    issues.push('La respuesta contiene una cadena con formato de credencial.');
  }
  const matches = (pattern, value) => new RegExp(pattern, 'iu').test(value);
  for (const pattern of expected.allOf ?? []) {
    if (!matches(pattern, normalized)) issues.push(`Falta: ${pattern}`);
  }
  if (expected.anyOf?.length && !expected.anyOf.some((pattern) => matches(pattern, normalized))) {
    issues.push(`Falta alguna alternativa: ${expected.anyOf.join(' / ')}`);
  }
  for (const pattern of expected.forbidden ?? []) {
    if (matches(pattern, normalized)) issues.push(`Coincide con contenido prohibido: ${pattern}`);
  }
  if (requirements === 'required' && sources.length === 0) issues.push('Faltan fuentes.');
  if (requirements === 'none' && sources.length > 0)
    issues.push('Aparecieron fuentes imprevistas.');
  if (
    expected.sourcePaths?.length &&
    !expected.sourcePaths.some((pattern) => sources.some(({ url }) => matches(pattern, url)))
  ) {
    issues.push(`Falta alguna fuente esperada: ${expected.sourcePaths.join(' / ')}`);
  }
  return issues.map(redact);
}

function checkSource(source) {
  if (
    typeof source?.title !== 'string' ||
    !source.title.trim() ||
    typeof source.url !== 'string' ||
    !/^(?:https:\/\/[^/]|\/(?![\\/]))/iu.test(source.url)
  ) {
    throw new Error('El flujo contiene una fuente inválida.');
  }
  const url = new URL(source.url, 'http://127.0.0.1');
  if (url.username || url.password) throw new Error('La fuente contiene credenciales.');
  return { title: source.title, url: source.url };
}

async function* getLines(stream) {
  const decoder = new TextDecoder();
  let pending = '';
  let bytes = 0;
  for await (const chunk of stream) {
    bytes += chunk.byteLength;
    if (bytes > 256 * 1024) throw new Error('El flujo excede el límite de tamaño.');
    pending += decoder.decode(chunk, { stream: true });
    const lines = pending.split('\n');
    pending = lines.pop();
    for (const line of lines) {
      if (line.trim()) yield line;
    }
  }
  pending += decoder.decode();
  if (pending.trim()) yield pending;
}

async function request(test, options) {
  const started = performance.now();
  let status;
  let answer = '';
  let firstTextMs = null;
  let error;
  let retryMs = 0;
  let terminal = false;
  const { message, history, context } = test;
  const signal = AbortSignal.timeout(options['timeout-ms']);
  try {
    const response = await fetch(options.endpoint, {
      method: 'POST',
      redirect: 'manual',
      headers: { 'Content-Type': 'application/json', Origin: options.endpoint.origin },
      body: JSON.stringify({ message, history, context }),
      signal,
    });
    status = response.status;
    if (!response.ok) {
      const { error: detail } = await response.json().catch(() => ({}));
      error = typeof detail === 'string' ? redact(detail).slice(0, 400) : `HTTP ${status}`;
      const detailNormalized = normalize(error);
      terminal =
        [401, 403, 404, 405].includes(status) ||
        /todavia no puede conectarse|no esta configurada|proveedor.*rechazo|modelo.*no esta disponible/.test(
          detailNormalized,
        );
      if (status === 429) {
        const retryAfter = Number(response.headers.get('retry-after'));
        retryMs = Math.min(60_000, Math.max(1000, (retryAfter || 5) * 1000));
      } else if (status === 502 || status === 504) {
        retryMs = 1200;
      } else if (status === 503 && /limite de consultas/.test(detailNormalized)) {
        retryMs = 15_000;
      }
    } else {
      if (
        !response.body ||
        !response.headers.get('content-type')?.includes('application/x-ndjson')
      ) {
        throw new Error('Se esperaba una respuesta NDJSON.');
      }
      let sources;
      for await (const line of getLines(response.body)) {
        const frame = JSON.parse(line);
        if (frame.type === 'error' && typeof frame.message === 'string') {
          throw new Error(redact(frame.message).slice(0, 400));
        }
        if (sources) throw new Error('Se recibió información después del cierre del flujo.');
        if (frame.type === 'delta' && typeof frame.text === 'string') {
          if (firstTextMs === null && frame.text.trim()) {
            firstTextMs = Math.round(performance.now() - started);
          }
          answer += frame.text;
        } else if (frame.type === 'done' && Array.isArray(frame.sources)) {
          sources = frame.sources.map(checkSource);
        } else {
          throw new Error('El flujo contiene un evento inválido.');
        }
      }
      if (!sources || !answer.trim()) throw new Error('La respuesta NDJSON quedó incompleta.');
      return {
        status,
        answer,
        sources,
        firstTextMs,
        durationMs: Math.round(performance.now() - started),
      };
    }
  } catch (cause) {
    if (signal.aborted) {
      error = 'Plazo de respuesta agotado.';
      if (!answer) retryMs = 1000;
    } else if (cause instanceof SyntaxError) {
      error = 'El servidor devolvió JSON inválido.';
    } else {
      error = redact(String(cause?.message ?? cause)).slice(0, 400);
      terminal = status === undefined && /fetch failed|ECONNREFUSED/i.test(error);
    }
  }
  return {
    status,
    error,
    terminal,
    retryMs,
    ...(answer.trim() ? { partialAnswer: redact(answer), firstTextMs } : {}),
    durationMs: Math.round(performance.now() - started),
  };
}

function createPacer(rpm) {
  let nextStart = 0;
  return async function waitTurn() {
    const now = performance.now();
    const turn = Math.max(now, nextStart);
    nextStart = turn + 60_000 / rpm;
    if (turn > now) await sleep(turn - now);
  };
}

function counts(records) {
  return Object.fromEntries(
    outcomes.map((outcome) => [outcome, records.filter((row) => row.outcome === outcome).length]),
  );
}

function groupCounts(records, field) {
  const groups = new Map();
  for (const record of records) {
    const key = record[field];
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  }
  return Object.fromEntries([...groups].map(([key, values]) => [key, counts(values)]));
}

function percentiles(records, field) {
  const values = records
    .map((row) => row[field])
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  if (!values.length) return null;
  const rank = (p) => values[Math.ceil(values.length * p) - 1];
  return { count: values.length, p50: rank(0.5), p95: rank(0.95), max: values.at(-1) };
}

function writeSummary(out, tests, records) {
  const completed = tests
    .map((test) => records.get(test.id))
    .filter((record) => record !== undefined);
  const valid = completed.filter((row) => row.outcome !== 'technical_error');
  const summary = {
    selected: tests.length,
    completed: completed.length,
    pending: tests.length - completed.length,
    ...counts(completed),
    byCategory: groupCounts(completed, 'category'),
    byExpectedKind: groupCounts(completed, 'expectedKind'),
    durationMs: percentiles(valid, 'durationMs'),
    firstTextMs: percentiles(valid, 'firstTextMs'),
  };
  writeFileSync(join(out, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
  const mdCell = (value) => redact(value).replaceAll('|', '\\|').replace(/\s+/g, ' ');
  const summaryLines = [
    '# Evaluación de respuestas de Serrana',
    '',
    `Se procesaron ${summary.completed} de ${summary.selected} consultas.`,
    `Pasaron ${summary.pass} comprobaciones, hubo ${summary.fail} discrepancias y ${summary.technical_error} errores técnicos.`,
    '',
    '| Categoría | Pasó | Discrepancia | Error técnico |',
    '| --- | ---: | ---: | ---: |',
    ...Object.entries(summary.byCategory).map(
      ([category, row]) =>
        `| ${mdCell(category)} | ${row.pass} | ${row.fail} | ${row.technical_error} |`,
    ),
    '',
    '| Resultado esperado | Pasó | Discrepancia | Error técnico |',
    '| --- | ---: | ---: | ---: |',
    ...Object.entries(summary.byExpectedKind).map(
      ([kind, row]) => `| ${kind} | ${row.pass} | ${row.fail} | ${row.technical_error} |`,
    ),
    '',
    ...(summary.durationMs
      ? [
          `Latencia de respuestas completas en ms. P50 ${summary.durationMs.p50}, P95 ${summary.durationMs.p95}, máxima ${summary.durationMs.max}.`,
          '',
        ]
      : []),
    ...(summary.firstTextMs
      ? [`Primer texto en ms. P50 ${summary.firstTextMs.p50}, P95 ${summary.firstTextMs.p95}.`, '']
      : []),
    'Los resultados automáticos cubren coincidencias de texto y fuentes. La lectura del criterio y la respuesta en `results.jsonl` permite verificar la exactitud y el contexto.',
    '',
    '## Discrepancias y errores',
    '',
    ...completed
      .filter((row) => row.outcome !== 'pass')
      .map((row) => `- \`${row.id}\` · ${mdCell((row.issues ?? [row.error]).join(' '))}`),
    '',
  ];
  writeFileSync(join(out, 'summary.md'), summaryLines.join('\n'));
  return summary;
}

async function main(args) {
  if (args.includes('--help')) {
    console.log(help);
    return;
  }
  const options = parseOptions(args);
  const input = resolve(options.input);
  const allCases = input.endsWith('.json')
    ? JSON.parse(readFileSync(input, 'utf8'))
    : (await import(pathToFileURL(input).href)).serranaCases;
  validateCases(allCases);
  const ids = options['only-ids']?.split(',').map((id) => id.trim()) ?? [];
  const absent = ids.filter((id) => !allCases.some((test) => test.id === id));
  if (absent.length) throw new Error('La selección contiene identificadores ajenos al corpus.');
  const filter = normalize(options.case ?? '');
  const tests = allCases
    .filter((test) => !ids.length || ids.includes(test.id))
    .filter((test) => normalize(`${test.id} ${test.category}`).includes(filter))
    .slice(0, options.limit);
  if (!tests.length) throw new Error('La selección quedó sin casos.');
  if (options.list) {
    for (const test of tests)
      console.log(`${test.id}\t${redact(test.category)}\t${test.expected.kind}`);
    console.log(`${tests.length} casos válidos.`);
    return;
  }
  const out = resolve(options.out);
  mkdirSync(out, { recursive: true });
  const file = join(out, 'results.jsonl');
  const records = new Map();
  const prior = existsSync(file) ? readFileSync(file, 'utf8').trim() : '';
  if (prior && !options.resume) {
    throw new Error('El directorio contiene resultados. Usá --resume o elegí otra salida.');
  }
  const selectedIds = new Map(tests.map((test) => [test.id, signature(test)]));
  for (const line of prior.split(/\r?\n/).filter(Boolean)) {
    const recorded = JSON.parse(line);
    if (selectedIds.get(recorded.id) === recorded.signature) records.set(recorded.id, recorded);
  }
  const queue = tests.filter(
    (test) => !records.has(test.id) || records.get(test.id).outcome === 'technical_error',
  );
  const waitTurn = createPacer(options.rpm);
  let next = 0;
  let terminal = false;
  console.log(
    `Serrana: ${queue.length} pendientes de ${tests.length}, ${options.jobs} trabajadores, ${options.rpm}/min.`,
  );
  async function worker() {
    while (!terminal && next < queue.length) {
      const test = queue[next++];
      const attempts = [];
      let result;
      for (let attempt = 0; attempt < 2; attempt++) {
        await waitTurn();
        if (terminal) return;
        result = await request(test, options);
        attempts.push({
          status: result.status,
          durationMs: result.durationMs,
          error: result.error,
        });
        if (result.terminal) terminal = true;
        if (!result.retryMs || terminal || attempt > 0) break;
        await sleep(result.retryMs);
      }
      const issues = result.error ? undefined : compare(test, result.answer, result.sources);
      const record = {
        id: test.id,
        signature: selectedIds.get(test.id),
        category: redact(test.category),
        expectedKind: test.expected.kind,
        criterion: redact(test.expected.criterion),
        outcome: result.error ? 'technical_error' : issues.length ? 'fail' : 'pass',
        attempts,
        durationMs: result.durationMs,
        firstTextMs: result.firstTextMs,
        answer: result.answer === undefined ? undefined : redact(result.answer),
        sources: result.sources?.map(({ title, url }) => ({
          title: redact(title),
          url: redact(url),
        })),
        partialAnswer: result.partialAnswer,
        error: result.error,
        issues,
      };
      appendFileSync(file, JSON.stringify(record) + '\n');
      records.set(test.id, record);
      console.log(`${records.size}/${tests.length} ${test.id} ${record.outcome}`);
    }
  }
  await Promise.all(Array.from({ length: options.jobs }, worker));
  const summary = writeSummary(out, tests, records);
  console.log(
    `Pasaron ${summary.pass}. Discrepancias ${summary.fail}. Errores técnicos ${summary.technical_error}. Pendientes ${summary.pending}.`,
  );
  process.exitCode = summary.technical_error || summary.pending ? 2 : summary.fail ? 1 : 0;
}

main(process.argv.slice(2)).catch((error) => {
  console.error(redact(String(error?.message ?? error)));
  process.exitCode = 2;
});
