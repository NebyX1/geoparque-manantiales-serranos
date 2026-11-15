// Curated, source-backed photography. This never searches or generates at build time.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const input = JSON.parse(
  await fs.readFile('reports/experience-review/photo-audit/selection.json', 'utf8'),
);
const output = 'src/assets/images/places';
await fs.mkdir(output, { recursive: true });
const photos = [];
const restorations = JSON.parse(await fs.readFile('docs/photo-restoration-prompts.json', 'utf8'));
await fs.mkdir('public/photo-originals', { recursive: true });
for (const item of input) {
  if (item.status !== 'verified') throw new Error(`Photograph ${item.id} has not been verified`);
  if (!item.sourcePage || !item.evidence || !item.file)
    throw new Error(`Incomplete provenance: ${item.id}`);
  const key = `gms-${String(item.id).padStart(2, '0')}${item.kind === 'restored' ? '-restored' : ''}`;
  const target = path.join(output, `${key}.webp`);
  const original = await fs.readFile(item.file);
  const metadata = await sharp(original).metadata();
  await sharp(original)
    .rotate()
    .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 92, effort: 6 })
    .toFile(target);
  const result = await sharp(target).metadata();
  const { file: _file, status: _status, name: _name, ...record } = item;
  if (item.kind === 'restored') {
    const job = restorations[item.restorationPromptId];
    if (!job || job.status !== 'accepted')
      throw new Error(`No accepted restoration for ${item.id}`);
    const reference = await fs.readFile(job.source);
    const originalPhotoUrl = `/photo-originals/gms-${String(item.id).padStart(2, '0')}.jpg`;
    await fs.writeFile(`public${originalPhotoUrl}`, reference);
    record.originalPhotoUrl = originalPhotoUrl;
    record.referenceSha256 = createHash('sha256').update(reference).digest('hex');
    const referenceMetadata = await sharp(reference).metadata();
    record.referenceWidth = referenceMetadata.width;
    record.referenceHeight = referenceMetadata.height;
  }
  photos.push({
    ...record,
    key,
    file: target.replaceAll('\\', '/'),
    width: result.width,
    height: result.height,
    inputWidth: metadata.width,
    inputHeight: metadata.height,
    inputSha256: createHash('sha256').update(original).digest('hex'),
    sha256: createHash('sha256')
      .update(await fs.readFile(target))
      .digest('hex'),
    reviewedAt: '2026-11-08',
    verified: true,
  });
}
if (photos.length !== 61 || new Set(photos.map((photo) => photo.id)).size !== 61)
  throw new Error('The photo inventory must cover each canonical place exactly once');
await fs.writeFile('src/data/place-photos.json', `${JSON.stringify(photos, null, 2)}\n`);
console.log(`Prepared ${photos.length} verified photographs`);
