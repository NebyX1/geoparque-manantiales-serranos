// Integrate reviewed native image_gen outputs. Never generate images at build time.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const report = 'reports/experience-review/photo-definition';
const specs = JSON.parse(await fs.readFile(`${report}/restoration-specs.json`, 'utf8'));
await fs.mkdir(`${report}/original`, { recursive: true });
await fs.mkdir(`${report}/generated`, { recursive: true });
const inventory = JSON.parse(await fs.readFile('src/data/place-photos.json', 'utf8'));
const editorial = JSON.parse(await fs.readFile('src/data/editorial-photos.json', 'utf8'));
const prompts = JSON.parse(await fs.readFile('docs/photo-restoration-prompts.json', 'utf8'));
const review = JSON.parse(await fs.readFile('docs/photo-quality-review.json', 'utf8'));
const manifest = JSON.parse(await fs.readFile('docs/asset-manifest.json', 'utf8'));
const digest = (buffer) => createHash('sha256').update(buffer).digest('hex');

for (const spec of specs) {
  const generated = `${report}/generated/${spec.key}.png`;
  try {
    await fs.access(generated);
  } catch {
    await fs.copyFile(spec.generated, generated);
  }
  const id = spec.key === 'arequita' ? 1 : 17;
  const current = inventory.find((photo) => photo.id === id);
  const previous = current.previousPhotograph ?? current;
  const isStory = spec.key === 'parque-story';
  const reference =
    spec.key === 'arequita'
      ? 'public/photo-originals/gms-01.webp'
      : spec.key === 'parque'
        ? 'public/photo-originals/gms-17.jpg'
        : 'public/photo-originals/parque-story.png';
  const referenceInput =
    spec.key === 'arequita' ? 'src/assets/images/hero/arequita-rio.webp' : spec.path;
  // Preserve the unedited source once, before updating a hero with the same filename.
  try {
    await fs.copyFile(referenceInput, reference, fs.constants.COPYFILE_EXCL);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
  const referenceBuffer = await fs.readFile(reference);
  const sourceMeta = await sharp(referenceBuffer).metadata();
  const key = isStory ? 'parque-story' : `gms-${String(id).padStart(2, '0')}-restored`;
  const file = isStory
    ? 'src/assets/images/hero/parque-story.webp'
    : `src/assets/images/places/${key}.webp`;
  // Lossless masters prevent another lossy pass before Astro's responsive encoding.
  await sharp(generated).webp({ lossless: true, effort: 6 }).toFile(file);
  const buffer = await fs.readFile(file),
    meta = await sharp(buffer).metadata();
  const promptId = `definition-${spec.key}`;
  prompts[promptId] = {
    prompt: spec.prompt,
    source: reference,
    output: file,
    generatedArchive: generated,
    sourceSha256: digest(referenceBuffer),
    outputSha256: digest(buffer),
    tool: 'native image_gen',
    status: 'accepted',
    reviewedAt: '2026-11-09',
    acceptance:
      'Identifiable cliff/river or resort building, pool and path layout retained on visual comparison; fine texture is interpreted and explicitly labelled as restoration.',
  };
  const name = id === 1 ? 'Cerro Arequita y río Santa Lucía' : 'Parque de Minas';
  const record = {
    ...previous,
    id,
    key,
    kind: 'restored',
    file,
    sourceImage:
      id === 17
        ? 'https://parquedeminas.uy/wp-content/uploads/2024/05/Home1Nosotros.jpg'
        : previous.sourceImage,
    caption: `${name} · restauración con IA`,
    alt: `${name}, restauración de una fotografía de referencia`,
    credit: `${previous.credit.replace(/ · restauración con IA$/, '')} · restauración con IA`,
    evidence: `${previous.evidence} Restauración revisada a partir de la misma referencia identificada; se conserva la identidad y composición general.`,
    limitations:
      'La restauración interpreta texturas finas y no acredita nuevos detalles ni el estado actual del lugar.',
    restorationPromptId: promptId,
    originalPhotoUrl: reference.replace(/^public/, ''),
    referenceSha256: digest(referenceBuffer),
    inputSha256: digest(referenceBuffer),
    referenceWidth: sourceMeta.width,
    referenceHeight: sourceMeta.height,
    inputWidth: sourceMeta.width,
    inputHeight: sourceMeta.height,
    width: meta.width,
    height: meta.height,
    sha256: digest(buffer),
    reviewedAt: '2026-11-09',
  };
  if (isStory) {
    const index = editorial.findIndex((photo) => photo.key === key);
    if (index < 0) editorial.push(record);
    else editorial[index] = record;
  } else {
    record.previousPhotograph = previous;
    if (previous.file !== file) {
      try {
        await fs.copyFile(
          previous.file,
          `${report}/original/${path.basename(previous.file)}`,
          fs.constants.COPYFILE_EXCL,
        );
      } catch (error) {
        if (!['EEXIST', 'ENOENT'].includes(error.code)) throw error;
      }
    }
    inventory[inventory.findIndex((photo) => photo.id === id)] = record;
    await fs.copyFile(file, `src/assets/images/hero/${id === 1 ? 'arequita-rio' : 'parque'}.webp`);
    if (previous.file !== file) {
      try {
        await fs.unlink(previous.file);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
  }
  const prior =
    review.photos.find((photo) => photo.key === key)?.previousAcceptance ??
    review.photos.find((photo) => photo.key === previous.key);
  const acceptance = {
    id,
    key,
    file,
    sha256: record.sha256,
    kind: record.kind,
    sourcePage: record.sourcePage,
    decision: 'accepted',
    basis: record.evidence,
    review: 'docs/photo-definition.md',
    previousAcceptance: prior,
  };
  const reviewIndex = review.photos.findIndex(
    (photo) => photo.key === key || photo.key === previous.key,
  );
  if (isStory) {
    const storyIndex = review.photos.findIndex((photo) => photo.key === key);
    if (storyIndex < 0) review.photos.push(acceptance);
    else review.photos[storyIndex] = acceptance;
  } else if (reviewIndex >= 0) review.photos[reviewIndex] = acceptance;
  else review.photos.push(acceptance);
}
review.counts = inventory.reduce(
  (counts, photo) => ({ ...counts, [photo.kind]: (counts[photo.kind] || 0) + 1 }),
  {},
);
review.editorialRestorations = editorial.filter((photo) => photo.kind === 'restored').length;
review.latestRevision = {
  date: '2026-11-09',
  scope:
    'Arequita, Parque de Minas and editorial crop; responsive image delivery and root navbar link',
  review: 'docs/photo-definition.md',
};
for (const key of ['arequita-rio', 'parque']) {
  const file = `src/assets/images/hero/${key}.webp`,
    buffer = await fs.readFile(file),
    meta = await sharp(buffer).metadata();
  manifest[key] = {
    path: file,
    width: meta.width,
    height: meta.height,
    bytes: buffer.length,
    sha256: digest(buffer),
  };
}
await sharp('src/assets/images/hero/arequita-rio.webp')
  .resize(1200, 630, { fit: 'cover' })
  .webp({ quality: 92 })
  .toFile('public/brand/social.webp');
for (const [file, data] of [
  ['src/data/place-photos.json', inventory],
  ['src/data/editorial-photos.json', editorial],
  ['docs/photo-restoration-prompts.json', prompts],
  ['docs/photo-quality-review.json', review],
  ['docs/asset-manifest.json', manifest],
])
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
console.log('Three reviewed restorations integrated, originals retained, provenance updated.');
