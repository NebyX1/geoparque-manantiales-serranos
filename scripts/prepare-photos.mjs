import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import places from '../src/data/place-photos.json' with { type: 'json' };
import editorial from '../src/data/editorial-photos.json' with { type: 'json' };
import recipes from '../src/data/photo-edits.json' with { type: 'json' };
import { applyPhotoGrade } from './lib/web-photo-grade.mjs';
import { heroCrop, heroFiles } from '../src/lib/hero-crop.mjs';
import {
  heroDesktopProfile,
  photoProfiles,
  publishedPhotoFile,
} from '../src/lib/photo-profiles.mjs';

const output = path.dirname(publishedPhotoFile(''));
const manifestFile = 'src/data/photo-publication.json';
const reviewFile = 'src/data/visual-review.json';
const imageDirectory = 'src/assets/images';
const reviewDecisions = new Set(['conservada', 'editada', 'sustituida', 'detalle de archivo']);
const { width, height } = photoProfiles['place-cover'];
const check = process.argv.includes('--check');
const selection = new Map([...places, ...editorial].map((photo) => [photo.key, photo]));
const photographs = [...selection.values()].filter(
  (photo) => !selection.has(`${photo.key}-portada`),
);
const existing = JSON.parse(await fs.readFile(manifestFile, 'utf8'));
const next = {};
const encoderOptions = { quality: 91, effort: 4, smartSubsample: true };
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const gradeVersion = hash(await fs.readFile(new URL('./lib/web-photo-grade.mjs', import.meta.url)));

const between = (value, min, max) => Number.isFinite(value) && value >= min && value <= max;
const finiteTuple = (value, length, min, max) =>
  Array.isArray(value) && value.length === length && value.every((n) => between(n, min, max));

function validateRecipe(
  key,
  { tone, balance, selective, cardFocus, cardPositionY, coverPosition },
) {
  if (
    (tone && !finiteTuple(tone, 3, -50, 50)) ||
    (balance && !finiteTuple(balance, 3, 0.8, 1.2)) ||
    (cardFocus !== undefined && !between(cardFocus, 0, 1)) ||
    (cardPositionY !== undefined && !between(cardPositionY, 0, 100)) ||
    (coverPosition && !finiteTuple(coverPosition, 2, 0, 100))
  ) {
    throw new Error(`Ajuste de luz, color o encuadre inválido para ${key}`);
  }
  if (!selective) return;
  const { fadeFromTop, ...strengths } = selective;
  const supported = new Set(['shadowWarmth', 'shadowLift', 'foliageCorrection']);
  if (
    Object.entries(strengths).some(
      ([name, value]) => !supported.has(name) || !between(value, 0, 1),
    ) ||
    (fadeFromTop && (!finiteTuple(fadeFromTop, 2, 0, 1) || fadeFromTop[0] >= fadeFromTop[1]))
  ) {
    throw new Error(`Gradación selectiva inválida para ${key}`);
  }
}

async function validate(file, dimensions) {
  const image = await sharp(file).metadata();
  if (
    image.width !== dimensions.width ||
    image.height !== dimensions.height ||
    image.format !== 'webp' ||
    image.hasAlpha
  ) {
    throw new Error(
      `${file} debe ser un WebP opaco de ${dimensions.width} × ${dimensions.height} px`,
    );
  }
}

if (!check) await fs.mkdir(output, { recursive: true });
const failures = [];
async function prepare(photo) {
  const file = publishedPhotoFile(photo.key);
  const recipe = recipes[photo.key] ?? {};
  validateRecipe(photo.key, recipe);
  const {
    crop,
    position = 'centre',
    exposure = 1,
    lift = photo.kind === 'aerial' ? 1.17 : 1,
    saturation = 1,
    sharpness = 0,
    tone,
    balance,
    selective,
  } = recipe;
  const source = photo.file;
  const bytes = await fs.readFile(source);
  const input = await sharp(bytes).metadata();
  const sourceHash = hash(bytes);
  if (
    input.format !== 'webp' ||
    input.width !== photo.width ||
    input.height !== photo.height ||
    sourceHash !== photo.sha256
  ) {
    throw new Error(`Revisá el formato, dimensiones y SHA-256 de ${source} en el catálogo`);
  }
  const fingerprint = hash(
    JSON.stringify([
      width,
      height,
      crop ?? null,
      position,
      exposure,
      lift,
      saturation,
      sharpness,
      sourceHash,
      ...(tone || balance || selective
        ? [tone ?? null, balance ?? null, selective ?? null, gradeVersion]
        : []),
    ]),
  );
  const old = existing[photo.key];
  const current = await fs.readFile(file).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
  });
  if (old?.fingerprint === fingerprint && current && old.sha256 === hash(current)) {
    await validate(file, { width, height });
    next[photo.key] = { ...old, source, sourceWidth: input.width, sourceHeight: input.height };
    return;
  }
  if (check) throw new Error(`${file} falta o quedó desactualizado. Ejecutá npm run assets:photos`);
  const original = sharp(bytes).autoOrient().toColourspace('srgb');
  if (crop) original.extract(crop);
  const cropped = await original
    .resize(width, height, { fit: 'cover', position, kernel: sharp.kernel.lanczos3 })
    .modulate({ brightness: exposure, saturation })
    .gamma(1, lift)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let encoder = sharp(applyPhotoGrade(cropped.data, { tone, balance, selective }, width), {
    raw: cropped.info,
  });
  if (sharpness) encoder = encoder.sharpen({ sigma: sharpness, m1: 0.45, m2: 1.25 });
  const master = await encoder.webp(encoderOptions).toBuffer();
  await validate(master, { width, height });
  await fs.writeFile(file, master);
  next[photo.key] = {
    source,
    sourceWidth: input.width,
    sourceHeight: input.height,
    fingerprint,
    sha256: hash(master),
  };
}

// Keep full-resolution decodes bounded on both development and Docker hosts.
for (let start = 0; start < photographs.length; start += 4) {
  await Promise.all(
    photographs.slice(start, start + 4).map(async (photo) => {
      try {
        await prepare(photo);
      } catch (error) {
        failures.push(error.message);
      }
    }),
  );
}
const expected = new Set(photographs.map((photo) => `${photo.key}.webp`));
for (const key of Object.keys(recipes)) {
  if (!expected.has(`${key}.webp`)) {
    failures.push(`Ajuste fotográfico sin imagen de publicación: ${key}`);
  }
}
for (const filename of await fs.readdir(output).catch(() => [])) {
  if (!expected.has(filename)) failures.push(`Archivo de publicación sin ficha: ${filename}`);
}

if (check) {
  const mobile = heroCrop(heroDesktopProfile.width, heroDesktopProfile.height);
  const review = JSON.parse(await fs.readFile(reviewFile, 'utf8'));
  const reviewed = (item, sha256) =>
    item &&
    item.sha256 === sha256 &&
    reviewDecisions.has(item.decision) &&
    item.observation?.trim() &&
    item.treatment?.trim();
  for (const photo of photographs) {
    const entry = review.photos[photo.key];
    const { cardFocus, cardPositionY, coverPosition } = recipes[photo.key] ?? {};
    const { inputWidth, inputHeight, referenceWidth, referenceHeight } = photo;
    const originalWidth = photo.kind === 'restored' ? (referenceWidth ?? inputWidth) : inputWidth;
    const originalHeight =
      photo.kind === 'restored' ? (referenceHeight ?? inputHeight) : inputHeight;
    if (
      !next[photo.key] ||
      !reviewed(entry, next[photo.key].sha256) ||
      entry.sourceWidth !== originalWidth ||
      entry.sourceHeight !== originalHeight ||
      (entry.decision === 'detalle de archivo' && !entry.limitacion?.trim()) ||
      entry.cardFocus !== cardFocus ||
      entry.cardPositionY !== cardPositionY ||
      JSON.stringify(entry.coverPosition) !== JSON.stringify(coverPosition)
    ) {
      failures.push(`Falta actualizar la revisión visual de ${photo.key} en ${reviewFile}`);
    }
  }
  if (Object.keys(review.photos).length !== expected.size) {
    failures.push('El registro de revisión visual contiene fichas desactualizadas');
  }
  for (const [name, desktop] of Object.entries(heroFiles)) {
    const desktopFile = `hero/${desktop}.webp`;
    const mobileFile = `hero/mobile/${name}.webp`;
    const wide = `${imageDirectory}/${desktopFile}`;
    const narrow = `${imageDirectory}/${mobileFile}`;
    if (!review.components[desktopFile] || !review.components[mobileFile]) {
      failures.push(`Falta la revisión visual del carrusel para ${name}`);
    }
    await validate(wide, heroDesktopProfile);
    await validate(narrow, mobile);
    const [expectedPixels, actualPixels] = await Promise.all([
      sharp(wide).extract(mobile).raw().toBuffer(),
      sharp(narrow).raw().toBuffer(),
    ]);
    if (!expectedPixels.equals(actualPixels)) {
      failures.push(`${narrow} quedó desactualizado. Ejecutá npm run assets:hero`);
    }
  }
  for (const { referenceFile } of selection.values()) {
    if (referenceFile && !review.components[referenceFile.slice(imageDirectory.length + 1)]) {
      failures.push(`Falta la revisión de la referencia ${referenceFile}`);
    }
  }
  for (const file of [
    'entry/territorio-3d.webp',
    'footer/unesco.webp',
    'seo-head/favicon.webp',
    'seo-head/social.webp',
    'site-brand/manantiales-serranos.webp',
    'territory-map/mapa-original.webp',
  ]) {
    if (!review.components[file]) failures.push(`Falta la revisión visual de ${file}`);
  }
  for (const [file, entry] of Object.entries(review.components)) {
    const bytes = await fs.readFile(`${imageDirectory}/${file}`);
    const meta = await sharp(bytes).metadata();
    if (
      !reviewed(entry, hash(bytes)) ||
      meta.format !== 'webp' ||
      meta.width !== entry.width ||
      meta.height !== entry.height
    ) {
      failures.push(`Falta actualizar la revisión visual de ${file} en ${reviewFile}`);
    }
  }
  for (const file of await fs.readdir(imageDirectory, { recursive: true, withFileTypes: true })) {
    if (!file.isFile()) continue;
    const relative = path.relative(imageDirectory, path.join(file.parentPath, file.name));
    if (path.extname(file.name).toLowerCase() !== '.webp') {
      failures.push(`Imagen fuera del formato WebP: ${relative}`);
    }
    if (relative.startsWith(`experience-miniature${path.sep}`)) {
      const texture = relative.split(path.sep).join('/');
      if (!review.components[texture]) failures.push(`Falta la revisión visual de ${texture}`);
    }
  }
}

if (failures.length) throw new Error(failures.join('\n'));
if (check) {
  if (Object.keys(existing).length !== expected.size)
    throw new Error('Inventario de fotos desactualizado');
} else {
  const ordered = Object.fromEntries(photographs.map((photo) => [photo.key, next[photo.key]]));
  await fs.writeFile(manifestFile, `${JSON.stringify(ordered, null, 2)}\n`);
}
console.log(`${photographs.length} fotografías de publicación WebP · ${width} × ${height} px`);
