import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { knowledgeInfo, validateKnowledgeSnapshot } from '../../src/knowledge';

const file = readFileSync(new URL('../../data/knowledge.json', import.meta.url), 'utf8');

describe('Catálogo de despliegue', () => {
  it('calcula la misma huella con saltos de línea de Linux y Windows', () => {
    const windows = file.replace(/\r?\n/g, '\r\n');
    expect(validateKnowledgeSnapshot(windows).info).toEqual(knowledgeInfo);
    expect(knowledgeInfo.sha256).toMatch(/^[a-f0-9]{64}$/u);
  });

  it('rechaza un archivo truncado', () => {
    expect(() => validateKnowledgeSnapshot(file.slice(0, -10))).toThrow('JSON válido');
  });

  it('rechaza documentos duplicados aunque el total del manifiesto coincida', () => {
    const snapshot = JSON.parse(file);
    snapshot.documents[1] = snapshot.documents[0];
    expect(() => validateKnowledgeSnapshot(JSON.stringify(snapshot))).toThrow('duplicado');
  });

  it('rechaza una ficha con una ruta distinta de la publicada por el atlas', () => {
    const snapshot = JSON.parse(file);
    snapshot.places[0].slug = 'ruta-incompatible';
    expect(() => validateKnowledgeSnapshot(JSON.stringify(snapshot))).toThrow('no coincide');
  });
});
