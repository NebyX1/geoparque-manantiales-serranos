import { describe, expect, it, beforeEach } from 'vitest';
import {
  sanitizeTrip,
  decodeTrip,
  migrateTrip,
  LEGACY_KEY,
  MIGRATION_KEY,
  TRIP_KEY,
} from '../../src/features/trip/migrations';
import { createStorageProxy } from '../../src/features/trip/storage';
import { $trip, toggleFavorite, clearTrip, addTripItems } from '../../src/features/trip/store';
import { planTrip } from '../../src/features/trip/planner';
import { tripCalendar, foldIcs, shiftDate } from '../../src/features/trip/calendar';
import { tripMarkdown } from '../../src/lib/markdown';
import { places } from '../../src/data/geosites';
beforeEach(clearTrip);
describe('persistencia y favoritos', () => {
  it('rechaza JSON corrupto y versiones desconocidas', () => {
    expect(decodeTrip('{')).toEqual({ version: 1, items: [], startDate: '' });
    expect(sanitizeTrip({ version: 99, items: [{ id: 1 }] }).items).toEqual([]);
  });
  it('deduplica, quita IDs inválidos y limita días', () => {
    expect(
      sanitizeTrip({
        version: 1,
        items: [{ id: 1, day: 9 }, { id: 1 }, { id: 800 }, null, { id: 23, day: -2 }],
        startDate: '2026-02-30',
      }),
    ).toEqual({
      version: 1,
      items: [
        { id: 1, day: 3 },
        { id: 23, day: 1 },
      ],
      startDate: '',
    });
  });
  it('migra una sola vez y no recupera un viaje vaciado', () => {
    const storage = {
      [LEGACY_KEY]: JSON.stringify({
        version: 1,
        items: [{ id: 1, day: 2 }],
        startDate: '2026-10-02',
      }),
    };
    expect(migrateTrip(storage).items).toEqual([{ id: 1, day: 2 }]);
    expect(storage).toHaveProperty(MIGRATION_KEY, 'done');
    expect(migrateTrip(storage).items).toEqual([]);
    expect(migrateTrip({ [TRIP_KEY]: '{}' }).items).toEqual([]);
  });
  it('funciona en memoria si storage bloquea lecturas o escrituras', () => {
    const broken = {
      setItem() {
        throw new Error('blocked');
      },
      removeItem() {},
      getItem() {
        throw new Error('blocked');
      },
    } as unknown as Storage;
    const storage = createStorageProxy(broken);
    storage[TRIP_KEY] = 'test';
    expect(storage[TRIP_KEY]).toBe('test');
    delete storage[TRIP_KEY];
    expect(storage[TRIP_KEY]).toBeUndefined();
  });
  it('sincroniza el store compartido y agrega propuestas sin duplicados', () => {
    toggleFavorite(1);
    toggleFavorite(23);
    toggleFavorite(1);
    expect($trip.get().items).toEqual([{ id: 23, day: 1 }]);
    expect(
      addTripItems([
        { id: 23, day: 2 },
        { id: 31, day: 2 },
      ]),
    ).toBe(1);
    expect($trip.get().items).toEqual([
      { id: 23, day: 1 },
      { id: 31, day: 2 },
    ]);
  });
});
describe('planner y exportaciones reales', () => {
  it('conserva las cinco propuestas y hasta tres días', () => {
    expect(planTrip('geology', 3)).toEqual([
      { id: 1, day: 1 },
      { id: 17, day: 2 },
      { id: 31, day: 2 },
      { id: 23, day: 3 },
    ]);
    expect(planTrip('unknown', 1)).toEqual(planTrip('nature', 1));
    expect(planTrip('adventure', 9)).toHaveLength(4);
  });
  it('genera visitas tentativas de día completo y maneja cambios de mes', () => {
    const trip = {
      version: 1 as const,
      items: [
        { id: 1, day: 1 },
        { id: 23, day: 2 },
      ],
      startDate: '2026-12-31',
    };
    const calendar = tripCalendar(trip, places, new Date('2026-10-02T12:00:00Z'));
    expect(calendar).toContain('DTSTART;VALUE=DATE:20270101');
    expect(calendar).toContain('STATUS:TENTATIVE');
    expect(calendar).toContain('DTSTAMP:20261002T120000Z');
    expect(shiftDate('2028-02-28', 1)).toBe('2028-02-29');
    expect(tripMarkdown(trip, places)).toContain('## Día 2');
    expect(() => tripCalendar({ ...trip, startDate: '' }, places)).toThrow();
  });
  it('pliega las líneas ICS sin dividir caracteres UTF-8', () => {
    const original = 'DESCRIPTION:' + 'geología, agua y sierras; '.repeat(12);
    const folded = foldIcs(original);
    expect(folded.replace(/\r\n /g, '')).toBe(original);
    for (const line of folded.split('\r\n'))
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  });
});
