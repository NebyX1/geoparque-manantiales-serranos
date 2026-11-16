import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { createServer } from 'vite';

const {
  values: { check, backend },
} = parseArgs({
  options: { check: { type: 'boolean' }, backend: { type: 'string' } },
});
const backendDir = backend ?? fileURLToPath(new URL('../backend/', import.meta.url));

if (!existsSync(join(backendDir, 'backend', 'app', 'model_policy.py'))) {
  if (!check || backend) throw new Error('Indicá la carpeta del backend de Serrana con --backend.');
  process.exit(0);
}

const vite = await createServer({
  configFile: false,
  envDir: false,
  appType: 'custom',
  root: fileURLToPath(new URL('../', import.meta.url)),
  server: { middlewareMode: true, ws: false },
  optimizeDeps: { noDiscovery: true },
});

try {
  const { serranaKnowledge, serranaKnowledgeManifest, serranaAtlasPlaces } =
    await vite.ssrLoadModule('/src/lib/serrana-knowledge.ts');
  const serialized =
    JSON.stringify(
      {
        manifest: serranaKnowledgeManifest,
        documents: serranaKnowledge,
        places: serranaAtlasPlaces,
      },
      null,
      2,
    ) + '\n';
  const data = join(backendDir, 'data');
  const target = join(data, 'knowledge.json');
  if (check) {
    const saved = existsSync(target) ? await readFile(target, 'utf8') : '';
    if (saved.replace(/\r\n/g, '\n') !== serialized) {
      throw new Error(
        'El catálogo de Serrana está desactualizado. Ejecutá npm run serrana:knowledge.',
      );
    }
  } else {
    await mkdir(data, { recursive: true });
    const temporary = join(data, `.knowledge-${randomUUID()}.tmp`);
    try {
      await writeFile(temporary, serialized, { flag: 'wx' });
      await rename(temporary, target);
    } finally {
      await rm(temporary, { force: true });
    }
    console.info(`Serrana: ${serranaKnowledge.length} documentos exportados a ${target}`);
  }
} finally {
  await vite.close();
}
