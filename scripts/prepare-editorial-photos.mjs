import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

// Deliberate editorial replacements. Historical extraction metadata is kept separately.
const archive = 'reports/experience-review/photo-audit/original-hero';
await fs.mkdir(archive, { recursive: true });
for (const key of ['salus', 'parque', 'aguas']) {
  try {
    await fs.copyFile(
      `src/assets/images/hero/${key}.webp`,
      `${archive}/${key}.webp`,
      fs.constants.COPYFILE_EXCL,
    );
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
}
await fs.copyFile('src/assets/images/places/gms-31.webp', 'src/assets/images/hero/salus.webp');
await fs.copyFile('src/assets/images/places/gms-17.webp', 'src/assets/images/hero/parque.webp');
const input = 'reports/experience-review/photo-audit/hero-aguas-restored.png';
const target = 'src/assets/images/hero/aguas.webp';
await sharp(input).webp({ quality: 92, effort: 6 }).toFile(target);
const prompts = JSON.parse(await fs.readFile('docs/photo-restoration-prompts.json', 'utf8'));
const reference = await fs.readFile(prompts['hero-aguas'].source);
const referenceMetadata = await sharp(reference).metadata();
await fs.writeFile('public/photo-originals/hero-aguas.jpg', reference);
const meta = await sharp(target).metadata();
const editorial = [
  {
    id: 23,
    key: 'aguas',
    kind: 'restored',
    file: target,
    caption: 'Embalse de Aguas Blancas · restauración con IA',
    alt: 'Embalse de Aguas Blancas entre sierras, restaurado a partir de una fotografía de archivo',
    credit: 'Archivo Geoparque Manantiales Serranos · restauración con IA',
    sourcePage: 'https://manantialesserranos.uy/aguas-blancas/',
    sourceImage: '',
    license: 'Fotografía de archivo del Geoparque; no se presume dominio público',
    licenseUrl: '',
    evidence:
      'El archivo original del Geoparque identifica el embalse de Aguas Blancas. Se conserva el encuadre y la línea del horizonte; no es una fotografía nueva del lugar.',
    limitations:
      'La restauración interpreta textura fina. No documenta el estado actual del embalse.',
    historical: true,
    restorationPromptId: 'hero-aguas',
    originalPhotoUrl: '/photo-originals/hero-aguas.jpg',
    referenceSha256: createHash('sha256').update(reference).digest('hex'),
    referenceWidth: referenceMetadata.width,
    referenceHeight: referenceMetadata.height,
    sha256: createHash('sha256')
      .update(await fs.readFile(target))
      .digest('hex'),
    width: meta.width,
    height: meta.height,
    reviewedAt: '2026-11-08',
    verified: true,
  },
];
await fs.writeFile('src/data/editorial-photos.json', `${JSON.stringify(editorial, null, 2)}\n`);
try {
  await fs.copyFile(
    'docs/asset-manifest.json',
    'docs/asset-manifest.original.json',
    fs.constants.COPYFILE_EXCL,
  );
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
}
const manifest = JSON.parse(await fs.readFile('docs/asset-manifest.json', 'utf8'));
for (const key of ['arequita-rio', 'aguas', 'salus', 'parque']) {
  const file = `src/assets/images/hero/${key}.webp`;
  const buffer = await fs.readFile(file);
  const metadata = await sharp(buffer).metadata();
  manifest[key] = {
    path: file,
    width: metadata.width,
    height: metadata.height,
    bytes: buffer.length,
    sha256: createHash('sha256').update(buffer).digest('hex'),
  };
}
await fs.writeFile('docs/asset-manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
await sharp('src/assets/images/hero/arequita-rio.webp')
  .resize(1200, 630, { fit: 'cover' })
  .webp({ quality: 90 })
  .toFile('public/brand/social.webp');
console.log('Editorial photos, source reference and hero manifest prepared');
