import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { heroCrop } from '../src/lib/hero-crop.mjs';

const directory = 'src/assets/images/hero';
const manifest = [];
await fs.mkdir(`${directory}/mobile`, { recursive: true });
for (const key of ['arequita-rio', 'aguas', 'salus', 'parque']) {
  const original = path.join(directory, `${key}.webp`);
  const target = path.join(directory, 'mobile', `${key}.webp`);
  const metadata = await sharp(original).metadata();
  const crop = heroCrop(metadata.width, metadata.height);
  const buffer = await sharp(original).extract(crop).webp({ lossless: true }).toBuffer();
  const originalPixels = await sharp(original).extract(crop).raw().toBuffer();
  const croppedPixels = await sharp(buffer).raw().toBuffer();
  if (!originalPixels.equals(croppedPixels)) throw new Error(`Pixel mismatch: ${key}`);
  await fs.writeFile(target, buffer);
  manifest.push({
    original: original.replaceAll('\\', '/'),
    path: target.replaceAll('\\', '/'),
    crop,
    bytes: buffer.length,
    sha256: createHash('sha256').update(buffer).digest('hex'),
    pixelsPreserved: true,
  });
}
await fs.writeFile('docs/hero-crop-manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Hero: ${manifest.length} recortes sin reescalado ni pérdida de píxeles`);
