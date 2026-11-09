// Integrate reviewed originals and one native image_gen restoration; never run at build time.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { createHash } from 'node:crypto';

const report = 'reports/experience-review/photo-resolution';
const inventory = JSON.parse(await fs.readFile('src/data/place-photos.json', 'utf8'));
const selection = JSON.parse(
  await fs.readFile('reports/experience-review/photo-audit/selection.json', 'utf8'),
);
const sources = JSON.parse(await fs.readFile(`${report}/sources/results.json`, 'utf8'));
const restoration = JSON.parse(await fs.readFile(`${report}/restoration.json`, 'utf8'));
const review = JSON.parse(await fs.readFile('docs/photo-quality-review.json', 'utf8'));
const prompts = JSON.parse(await fs.readFile('docs/photo-restoration-prompts.json', 'utf8'));
const manifest = JSON.parse(await fs.readFile('docs/asset-manifest.json', 'utf8'));
await fs.mkdir(`${report}/before-assets`, { recursive: true });
await fs.mkdir(`${report}/generated`, { recursive: true });
const sha = (buffer) => createHash('sha256').update(buffer).digest('hex');
const changes = [];
const originals = new Map(
  [2, 10, 14, 18, 31, 38, 45].map((id) => [id, { file: selection.find((x) => x.id === id).file }]),
);
originals.set(1, {
  file: `${report}/sources/arequita-3840.jpg`,
  url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Cerro_arequita.jpg/3840px-Cerro_arequita.jpg',
});
for (const id of [36, 47])
  originals.set(
    id,
    sources.find((x) => x.id === id && x.width),
  );

for (const id of [...originals.keys(), 56]) {
  const index = inventory.findIndex((x) => x.id === id);
  const current = inventory[index];
  const oldBuffer = await fs.readFile(current.file);
  try {
    await fs.writeFile(`${report}/before-assets/${path.basename(current.file)}`, oldBuffer, {
      flag: 'wx',
    });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
  const restored = id === 56;
  const key = restored ? 'gms-56-restored' : id === 1 ? 'gms-01' : current.key;
  const target = `src/assets/images/places/${key}.webp`;
  const archive = `${report}/generated/mangas-education.png`;
  if (restored) await fs.copyFile(restoration.generated, archive);
  const input = restored ? archive : originals.get(id).file;
  const native = await sharp(input).metadata();
  const temporary = `${report}/prepared-${id}.webp`;
  await sharp(input)
    .rotate()
    .resize({ width: 3840, height: 3840, fit: 'inside', withoutEnlargement: true })
    .webp(restored ? { lossless: true, effort: 6 } : { quality: 95, effort: 6 })
    .toFile(temporary);
  const data = await fs.readFile(temporary);
  if (sha(data) === current.sha256) continue;
  const metadata = await sharp(data).metadata();
  await fs.writeFile(target, data);
  const record = {
    ...current,
    key,
    file: target,
    width: metadata.width,
    height: metadata.height,
    sha256: sha(data),
    inputWidth: native.width,
    inputHeight: native.height,
    inputSha256: sha(await fs.readFile(input)),
    reviewedAt: '2026-11-09',
  };
  if (originals.get(id)?.url) record.sourceImage = originals.get(id).url;
  record.evidence +=
    ' Se recuperó el archivo de mayor resolución disponible de la misma fotografía; entrega sin ampliación del bitmap.';
  if (id === 1) {
    Object.assign(record, {
      kind: 'photograph',
      sourcePage: 'https://commons.wikimedia.org/wiki/File:Cerro_arequita.jpg',
      credit: 'Bienflorencia / Wikimedia Commons · CC BY-SA 4.0',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      historical: true,
      caption: 'Cerro Arequita y río Santa Lucía · fotografía de archivo (2012)',
      alt: 'Cerro Arequita sobre el río Santa Lucía, fotografía de Bienflorencia de 2012',
      evidence:
        'Fotografía Cerro_arequita.jpg de Bienflorencia: descripción, fecha 15/11/2012, original 4320 × 2432 y licencia publicados en Wikimedia Commons. Se usa su derivado nativo de 3840 × 2162, sin ampliación.',
      limitations: 'Fotografía de archivo de 2012; no documenta el estado actual del lugar.',
      previousPhotograph: current.previousPhotograph ?? current,
    });
    for (const field of [
      'restorationPromptId',
      'originalPhotoUrl',
      'referenceSha256',
      'referenceWidth',
      'referenceHeight',
    ])
      delete record[field];
  }
  if (restored) {
    const reference = await fs.readFile(restoration.reference);
    await fs.writeFile('public/photo-originals/gms-56.png', reference);
    await fs.copyFile(
      'reports/experience-review/photo-resolution/sources/56-292799461.jpg',
      'public/photo-originals/mangas-source.jpg',
    );
    const refMetadata = await sharp(reference).metadata();
    Object.assign(record, {
      kind: 'restored',
      caption: 'Mangas de Piedra · restauración con IA',
      alt: 'Visitantes entre los muros de Mangas de Piedra, restauración de la fotografía del operador',
      credit: 'Experiencias Villa Serrana · Mangas de Piedra · restauración con IA',
      evidence:
        'Restauración del recorte 4:3 de la fotografía del operador. Se conservan seis visitantes, muros, senda y horizonte; se interpreta textura fina y no constituye una nueva toma.',
      limitations:
        'La restauración interpreta textura fina y rostros distantes. No documenta el estado actual del lugar.',
      restorationPromptId: 'resolution-mangas-education',
      originalPhotoUrl: '/photo-originals/gms-56.png',
      referenceSha256: sha(reference),
      referenceWidth: refMetadata.width,
      referenceHeight: refMetadata.height,
      referenceCrop: {
        left: 100,
        top: 0,
        width: 740,
        height: 555,
        fullOriginal: '/photo-originals/mangas-source.jpg',
      },
      previousPhotograph: current.previousPhotograph ?? current,
    });
    prompts['resolution-mangas-education'] = {
      prompt: restoration.prompt,
      source: 'public/photo-originals/gms-56.png',
      output: target,
      generatedArchive: archive,
      tool: 'native image_gen',
      status: 'accepted',
      reviewedAt: '2026-11-09',
      sourceSha256: sha(reference),
      outputSha256: sha(data),
      acceptance:
        'Six people, wall layout and skyline retained on comparison; fine textures and faces are interpreted and labelled as AI restoration.',
    };
  }
  inventory[index] = record;
  const acceptance = review.photos.find((x) => x.id === id && x.key === current.key);
  if (acceptance) {
    const previous = { ...acceptance };
    Object.assign(acceptance, {
      key,
      file: target,
      sha256: record.sha256,
      kind: record.kind,
      sourcePage: record.sourcePage,
      review: 'docs/photo-resolution.md',
      previousAcceptance: previous,
      basis: record.evidence,
    });
  }
  changes.push({
    id,
    key,
    before: [current.width, current.height],
    after: [metadata.width, metadata.height],
    input,
    sourceImage: record.sourceImage,
  });
  if (current.file !== target) await fs.unlink(current.file);
}
await fs.copyFile('src/assets/images/places/gms-31.webp', 'src/assets/images/hero/salus.webp');
await fs.copyFile(
  'src/assets/images/places/gms-01.webp',
  'src/assets/images/hero/arequita-rio.webp',
);
await sharp('src/assets/images/hero/arequita-rio.webp')
  .resize(1200, 630, { fit: 'cover' })
  .webp({ quality: 95 })
  .toFile('public/brand/social.webp');
for (const [key, file] of [
  ['salus', 'src/assets/images/hero/salus.webp'],
  ['arequita-rio', 'src/assets/images/hero/arequita-rio.webp'],
  ['aprendiendo', 'src/assets/images/places/gms-56-restored.webp'],
  ['escuela', 'src/assets/images/places/gms-56-restored.webp'],
]) {
  const buffer = await fs.readFile(file),
    meta = await sharp(buffer).metadata();
  manifest[key] = {
    path: file,
    width: meta.width,
    height: meta.height,
    bytes: buffer.length,
    sha256: sha(buffer),
  };
}
review.counts = inventory.reduce(
  (counts, photo) => ({ ...counts, [photo.kind]: (counts[photo.kind] || 0) + 1 }),
  {},
);
review.latestRevision = {
  date: '2026-11-09',
  scope:
    'Full-site resolution audit, recovered native originals, Mangas restoration and density-aware rendering',
  review: 'docs/photo-resolution.md',
};
const priorChanges = JSON.parse(
  await fs.readFile(`${report}/asset-changes.json`, 'utf8').catch(() => '[]'),
);
const allChanges = [
  ...priorChanges.filter((previous) => !changes.some((next) => next.id === previous.id)),
  ...changes,
];
for (const [file, value] of [
  ['src/data/place-photos.json', inventory],
  ['docs/photo-quality-review.json', review],
  ['docs/photo-restoration-prompts.json', prompts],
  ['docs/asset-manifest.json', manifest],
  ...(changes.length ? [[`${report}/asset-changes.json`, allChanges]] : []),
]) {
  await fs.writeFile(file, JSON.stringify(value, null, 2) + '\n');
}
console.log(
  changes.map((x) => `${x.id}: ${x.before.join('x')} -> ${x.after.join('x')}`).join('\n') ||
    'All sources already integrated',
);
