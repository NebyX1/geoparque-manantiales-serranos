import inventory from './place-photos.json' with { type: 'json' };
import editorialInventory from './editorial-photos.json' with { type: 'json' };

export type PlacePhoto = (typeof inventory)[number];
export type EditorialPhoto = (typeof editorialInventory)[number];
export type VerifiedPhoto = PlacePhoto | EditorialPhoto;
export const placePhotoInventory: readonly PlacePhoto[] = inventory;
export const editorialPhotoInventory = editorialInventory;
const byPlace = new Map(inventory.map((photo) => [photo.id, photo]));
const byAsset = new Map<string, VerifiedPhoto>(
  [...inventory, ...editorialInventory].map((photo) => [photo.key, photo]),
);

/** Legacy editorial keys point to identified photos, rather than generic scenery. */
export const editorialPhotoPlaces: Record<string, number> = {
  'arequita-rio': 1,
  arequita: 1,
  salus: 31,
  parque: 17,
  'parque-puente': 17,
  penitente: 14,
  'penitente-poza': 14,
  rio: 52,
  arroyo: 52,
  artigas: 46,
  bosque: 51,
  ombues: 51,
  panorama: 54,
  paisaje: 15,
  campo: 15,
  cielo: 15,
  cantera: 13,
  aprendiendo: 56,
  escuela: 56,
  gastronomia: 40,
  gauchos: 39,
  artesania: 60,
  gruta: 50,
};

export function photoForPlace(id: number): PlacePhoto {
  const photo = byPlace.get(id);
  if (!photo) throw new Error(`No verified photograph for GMS-${id}`);
  return photo;
}

export function photoForAsset(key: string): VerifiedPhoto | undefined {
  const id = editorialPhotoPlaces[key];
  return id === undefined ? byAsset.get(key) : photoForPlace(id);
}

export function photoLabel(photo: Pick<PlacePhoto, 'kind'>) {
  return photo.kind === 'restored'
    ? 'Restauración con IA'
    : photo.kind === 'aerial'
      ? 'Foto aérea · IDE 2017–2018'
      : photo.kind === 'video-frame'
        ? 'Fotograma del museo'
        : '';
}

export function photoFit(photo: VerifiedPhoto) {
  return 'fit' in photo && photo.fit === 'contain'
    ? 'contain'
    : photo.height > photo.width * 1.1
      ? 'contain'
      : 'cover';
}

export function photoAuditUrl(photo: Pick<VerifiedPhoto, 'key'>) {
  return `/creditos-fotograficos/#${photo.key}`;
}

export const browserPhotoMetadata = Object.fromEntries(
  [
    ...inventory.map((photo) => photo.key),
    ...Object.keys(editorialPhotoPlaces),
    ...editorialInventory.map((photo) => photo.key),
  ].map((key) => {
    const photo = photoForAsset(key)!;
    return [
      key,
      {
        caption: photo.caption,
        alt: photo.alt,
        kind: photo.kind,
        credit: photo.credit,
        label: photoLabel(photo),
        fit: photoFit(photo),
        auditUrl: photoAuditUrl(photo),
        key: photo.key,
        width: photo.width,
        height: photo.height,
      },
    ];
  }),
);

export function placePhotoPresentation(id: number) {
  const photo = photoForPlace(id);
  return {
    image: photo.key,
    imageContext: false,
    photoCaption: photo.caption,
    photoKind: photo.kind,
    photoCredit: photo.credit,
    photoSource: photo.sourcePage,
    photoFit: photoFit(photo),
  };
}
