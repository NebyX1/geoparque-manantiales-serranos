import { describe, expect, it } from 'vitest';
import { places } from '../../src/data/geosites';
import {
  getPlaceLocation,
  geographyCoverage,
  projectLocation,
  boundaryPath,
  geographicPlaces,
} from '../../src/data/geography';
import official from '../../src/data/geography/official-geosites.json' with { type: 'json' };
import {
  experiencePoints,
  locatedExperiencePoints,
  toExperiencePoint,
} from '../../src/features/experience/scene-data';
import { clampPanel } from '../../src/features/experience/panel-geometry';

describe('contenido del recorrido interpretativo', () => {
  it('conserva los 61 IDs, nombres y categorías de la colección canónica sin duplicados', () => {
    expect(experiencePoints).toHaveLength(places.length);
    expect(new Set(experiencePoints.map((point) => point.id)).size).toBe(places.length);
    for (const place of places) {
      expect(experiencePoints.find((point) => point.id === place.id)).toMatchObject({
        id: place.id,
        name: place.name,
        category: place.category,
      });
    }
  });

  it('proyecta las coordenadas documentadas con norte arriba sin separar artificialmente lugares', () => {
    for (const point of locatedExperiencePoints) {
      expect(point).toMatchObject(
        projectLocation(point.location.latitude, point.location.longitude),
      );
      expect(Math.abs(point.x)).toBeLessThanOrEqual(105);
      expect(Math.abs(point.z)).toBeLessThanOrEqual(88);
      expect(point.location.sourceUrl).toMatch(/^https:\/\//);
    }
    const center = projectLocation(-34.359205175, -55.13268945);
    expect(center).toEqual({ x: 0, z: -0 });
    expect(projectLocation(-34.25, -55.0).x).toBeGreaterThan(center.x);
    expect(projectLocation(-34.25, -55.0).z).toBeLessThan(center.z);
    // Plaza and Catedral must remain neighbors at their published coordinates.
    const plaza = locatedExperiencePoints.find((point) => point.id === 39)!;
    const cathedral = locatedExperiencePoints.find((point) => point.id === 41)!;
    expect(Math.hypot(plaza.x - cathedral.x, plaza.z - cathedral.z)).toBeLessThan(1);
    expect(() => projectLocation(NaN, -55)).toThrow(RangeError);
  });

  it('conserva los 49 puntos oficiales exactamente y explicita la precisión reducida de Campanero', () => {
    expect(official.features).toHaveLength(49);
    for (const feature of official.features) {
      const location = getPlaceLocation(feature.properties.id)!;
      const [longitude, latitude] = feature.geometry.coordinates[0]!;
      expect(location.longitude).toBe(longitude);
      expect(location.latitude).toBe(latitude);
    }
    expect(getPlaceLocation(15)?.accuracy).toBe('approximate');
    expect(boundaryPath.startsWith('M')).toBe(true);
  });

  it('distingue 51 ubicaciones documentadas y 10 referencias aproximadas, sin declarar 61 exactas', () => {
    expect(geographyCoverage).toEqual({
      located: 61,
      verified: 51,
      approximate: 10,
      unresolved: 0,
    });
    expect(locatedExperiencePoints).toHaveLength(61);
    expect(getPlaceLocation(58)).toMatchObject({
      latitude: -34.442158,
      longitude: -55.236637,
      accuracy: 'approximate',
      sourceUrl:
        'https://www.portalesdeluruguay.com.uy/en/alojamientos/country-inn/valle-del-hilo-de-la-vida-eco-lodge',
      notes: expect.stringContaining('no localiza las estructuras arqueológicas'),
    });
    expect(getPlaceLocation(60)).toMatchObject({
      latitude: -34.377108276779744,
      longitude: -55.22923863682804,
      accuracy: 'approximate',
      sourceUrl:
        'https://direcciones.ide.uy/api/v1/geocode/find?type=CALLEyPORTAL&idcalle=18885&portal=322',
      notes: expect.stringContaining('referencia aproximada del domicilio'),
    });
  });

  it('conserva cualquier ficha sin referencia y nunca fabrica un pin de sustitución', () => {
    const place = geographicPlaces.find((candidate) => candidate.id === 58)!;
    const withoutLocation = toExperiencePoint({ ...place, location: null, position: null });
    expect(withoutLocation).toEqual({
      id: place.id,
      name: place.name,
      region: place.region,
      category: place.category,
      located: false,
      x: null,
      z: null,
      location: null,
    });
    expect(getPlaceLocation(999)).toBeNull();
  });
});

describe('recuperación de ventanas fuera de pantalla', () => {
  it('mantiene el encabezado alcanzable al arrastrar fuera de los bordes', () => {
    const position = clampPanel(10_000, 10_000, 420, 600, 1280, 720);
    expect(position.x).toBeGreaterThanOrEqual(8);
    expect(position.x + 420).toBeLessThanOrEqual(1280 - 8);
    expect(position.y).toBeGreaterThanOrEqual(8);
    expect(position.y + 600).toBeLessThanOrEqual(720 - 8);
    expect(clampPanel(-500, -500, 304, 480, 320, 540)).toEqual({ x: 8, y: 8 });
  });

  it('recupera una posición inválida sin propagar NaN a los estilos', () => {
    expect(clampPanel(Number.NaN, Number.NEGATIVE_INFINITY, 420, 600, 1280, 720)).toEqual({
      x: 8,
      y: 8,
    });
  });
});
