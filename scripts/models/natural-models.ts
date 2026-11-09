/** Reproducible offline export; no remote code, browser, credentials or services. */
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import {
  createNatural,
  naturalIds,
} from '../../src/features/experience/miniatures/rebuilt/naturalLandmarks';

// GLTFExporter needs FileReader even though these owned meshes have no images.
class OfflineFileReader {
  result: ArrayBuffer | string | null = null;
  onloadend: (() => void) | null = null;
  readAsArrayBuffer(blob: Blob): void {
    void blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.();
    });
  }
  readAsDataURL(blob: Blob): void {
    void blob.arrayBuffer().then((result) => {
      this.result = `data:${blob.type};base64,${Buffer.from(result).toString('base64')}`;
      this.onloadend?.();
    });
  }
}
Object.assign(globalThis, { FileReader: OfflineFileReader });

await mkdir('public/models/geosites/rebuilt', { recursive: true });
await mkdir('reports/experience-review/rebuild-natural', { recursive: true });
interface BudgetRow {
  id: number;
  filename: string;
  bytes: number;
  triangles: number;
  drawCalls: number;
  bounds: { min: number[]; max: number[] };
  qa: string;
}
let manifest: BudgetRow[] = [];
try {
  manifest = JSON.parse(
    await readFile('reports/experience-review/rebuild-natural/manifest.json', 'utf8'),
  ) as BudgetRow[];
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
}
manifest = manifest.filter((row) => (naturalIds as readonly number[]).includes(row.id));
const requested = process.argv.slice(2).map(Number);
const selected = requested.length ? requested : naturalIds;
if (selected.some((id) => !(naturalIds as readonly number[]).includes(id)))
  throw new Error('Requested ID is not owned by the natural exporter');
for (const id of selected) {
  const group = createNatural(id);
  if (!group) throw new Error(`Missing natural GMS-${id}`);
  let triangles = 0,
    drawCalls = 0;
  group.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const position = mesh.geometry.getAttribute('position');
    for (let i = 0; i < position.count; i++)
      if (![position.getX(i), position.getY(i), position.getZ(i)].every(Number.isFinite))
        throw new Error(`GMS-${id} contains a non-finite vertex`);
    triangles += (mesh.geometry.index?.count ?? mesh.geometry.getAttribute('position').count) / 3;
    drawCalls++;
  });
  const bounds = new THREE.Box3().setFromObject(group);
  if (triangles > 150_000 || drawCalls >= 100) throw new Error(`GMS-${id} exceeds GPU budget`);
  const glb = await new GLTFExporter().parseAsync(group, { binary: true, onlyVisible: true });
  if (!(glb instanceof ArrayBuffer)) throw new Error('GLB exporter returned JSON');
  const filename = `gms-${String(id).padStart(2, '0')}.glb`;
  await writeFile(`public/models/geosites/rebuilt/${filename}.tmp`, new Uint8Array(glb));
  for (let attempt = 0; ; attempt++) {
    try {
      await rename(
        `public/models/geosites/rebuilt/${filename}.tmp`,
        `public/models/geosites/rebuilt/${filename}`,
      );
      break;
    } catch (error) {
      if (
        !['EPERM', 'EACCES', 'EBUSY'].includes((error as NodeJS.ErrnoException).code ?? '') ||
        attempt >= 8
      )
        throw error;
      await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
    }
  }
  manifest = manifest.filter((row) => row.id !== id);
  manifest.push({
    id,
    filename,
    bytes: glb.byteLength,
    triangles,
    drawCalls,
    bounds: { min: bounds.min.toArray(), max: bounds.max.toArray() },
    qa: 'pending-independent-review',
  });
  console.log(id, glb.byteLength, triangles, drawCalls);
}
await writeFile(
  'reports/experience-review/rebuild-natural/manifest.json',
  `${JSON.stringify(
    manifest.sort((a, b) => a.id - b.id),
    null,
    2,
  )}\n`,
);
