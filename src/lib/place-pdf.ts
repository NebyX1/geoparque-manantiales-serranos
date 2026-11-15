import { readFile } from 'node:fs/promises';
import { root } from 'astro:config/server';
import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import { photoAuditUrl, photoForDisplay } from '../data/place-photos';
import type { GeoparkPlace } from '../types/geopark';
import { learningLens } from './learning';
import { visitNote } from './markdown';
import { publishedPhotoFile } from './photo-profiles.mjs';
import { absoluteUrl } from './urls';

const forest = '#183c30';
const ink = '#28382d';
const muted = '#586657';
const margin = 48;

export async function placePdf(place: GeoparkPlace) {
  const photo = photoForDisplay(place.id);
  const photograph = await sharp(await readFile(new URL(publishedPhotoFile(photo.key), root)))
    .resize({
      width: 1320,
      height: 584,
      fit: 'cover',
      withoutEnlargement: true,
    })
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 88 })
    .toBuffer();
  const id = `GMS-${String(place.id).padStart(2, '0')}`;
  const lesson = learningLens(place);
  const doc = new PDFDocument({
    size: 'A4',
    lang: 'es-UY',
    margins: { top: 58, bottom: 57, left: margin, right: margin },
    bufferPages: true,
    info: {
      Title: place.name,
      Author: 'Geoparque Manantiales Serranos',
      Subject: `Ficha ambiental y patrimonial · ${id}`,
    },
  });
  const ready = new Promise<Uint8Array<ArrayBuffer>>((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.once('end', () => resolve(new Uint8Array(Buffer.concat(chunks))));
    doc.once('error', reject);
  });
  const width = doc.page.width - margin * 2;
  const options = { width, lineGap: 2.5 };
  const ensureSpace = (height: number) => {
    if (doc.y + height > doc.page.maxY()) doc.addPage();
  };
  const paragraph = (text: string, color = ink) => {
    doc.font('Helvetica').fontSize(11);
    const height = doc.heightOfString(text, options);
    if (height < 70) ensureSpace(height);
    doc.fillColor(color).text(text, margin, doc.y, options);
    doc.moveDown(0.55);
  };
  const heading = (text: string, size = 20, spaceForContent = 43) => {
    doc.font('Helvetica-Bold').fontSize(size);
    ensureSpace(doc.heightOfString(text, options) + spaceForContent);
    doc.fillColor(forest).text(text, margin, doc.y, options);
    doc.moveDown(0.3);
  };
  const link = (label: string, url: string, x = margin, y?: number) => {
    doc.font('Helvetica').fontSize(10);
    if (y === undefined) ensureSpace(doc.currentLineHeight() + 4);
    doc
      .fillColor(forest)
      .text(label, x, y ?? doc.y, { lineBreak: false, link: url, underline: true });
    if (y === undefined) doc.moveDown(1.4);
    return doc.widthOfString(label);
  };

  doc.font('Helvetica').fontSize(9).fillColor(muted);
  doc.text(
    [id, place.categoryRaw, place.international ? 'Valor científico internacional' : '']
      .filter(Boolean)
      .join(' · '),
    margin,
    doc.y,
    options,
  );
  doc.moveDown(0.55);
  heading(place.name, 35);
  paragraph(place.tagline, forest);

  const photoHeight = 220;
  const photoTop = doc.y;
  doc.rect(margin, photoTop, width, photoHeight).fill('#edf0e7');
  doc.image(photograph, margin, photoTop, {
    fit: [width, photoHeight],
    align: 'center',
    valign: 'center',
  });
  doc.y = photoTop + photoHeight + 8;
  doc.font('Helvetica').fontSize(9).fillColor(muted);
  doc.text(
    [photo.caption, photo.credit, photo.licenseUrl ? photo.license : '']
      .filter(Boolean)
      .join(' · '),
    margin,
    doc.y,
    options,
  );
  link('Procedencia y créditos de la imagen', absoluteUrl(photoAuditUrl(photo)));
  doc.moveDown(0.8);

  paragraph(place.intro);
  heading(lesson.topic);
  paragraph(lesson.question, forest);
  paragraph(lesson.observe);
  heading('Registrar y cuidar', 16);
  paragraph(lesson.care);

  heading('Información del lugar', 20, place.blocks[0]?.heading ? 90 : 43);
  for (const block of place.blocks) {
    if (block.heading) heading(block.text, 16);
    else paragraph(block.text);
  }
  if (place.relationsRaw) {
    heading('Conexiones del territorio');
    paragraph(place.relationsRaw);
  }
  heading('Acceso y trabajo de campo');
  paragraph([`Zona · ${place.zone}`, place.status, place.statusRaw].filter(Boolean).join('\n'));
  paragraph(visitNote, muted);
  if (photo.licenseUrl) link(photo.license, photo.licenseUrl);
  doc.font('Helvetica').fontSize(10);
  ensureSpace(doc.currentLineHeight() + 4);
  const linksTop = doc.y;
  let linksX = margin;
  const links = [
    place.channel && { label: `Contacto · ${place.channel.label}`, url: place.channel.url },
    { label: 'Ficha en línea', url: absoluteUrl(`/lugares/${place.slug}/`) },
    { label: 'Documentos fuente', url: absoluteUrl('/inicio/#documentacion') },
  ];
  for (const { label, url } of links.filter((entry) => entry !== undefined)) {
    linksX += link(label, url, linksX, linksTop) + 24;
  }

  const { count } = doc.bufferedPageRange();
  for (let index = 0; index < count; index++) {
    doc.switchToPage(index);
    doc.rect(margin, 36, 19, 3).fill('#c4a849');
    doc.font('Helvetica-Bold').fontSize(8).fillColor(forest);
    doc.text('GEOPARQUE MANANTIALES SERRANOS', margin + 27, 30, { lineBreak: false });
    const footer = doc.page.height - 39;
    doc
      .moveTo(margin, footer)
      .lineTo(margin + width, footer)
      .stroke('#c8d0bf');
    doc
      .fillColor(muted)
      .text('Fichas ambientales y patrimoniales · Lavalleja', margin, footer + 9, {
        lineBreak: false,
      });
    const page = `${id}  /  ${index + 1} de ${count}`;
    doc.text(page, margin + width - doc.widthOfString(page), footer + 9, { lineBreak: false });
  }
  doc.end();
  return ready;
}
