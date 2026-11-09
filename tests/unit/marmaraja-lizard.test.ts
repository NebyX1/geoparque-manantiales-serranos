import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { addMarmarajaLizard } from '../../src/features/experience/miniatures/wildlife/marmaraja-lizard';
import { disposeBranch } from '../../src/features/experience/resources';

function landscape(slope = 0) {
  const root = new THREE.Group();
  const geometry = new THREE.PlaneGeometry(12, 9.428571, 8, 8);
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.getAttribute('position');
  for (let i = 0; i < position.count; i++) position.setY(i, 0.16 + position.getZ(i) * slope);
  const material = new THREE.MeshStandardMaterial();
  material.name = 'Relieve numerico Terrarium';
  root.add(new THREE.Mesh(geometry, material));
  return root;
}

describe('lagarto animado de Marmarajá', () => {
  it('recorre una vuelta continua apoyado en la pendiente y permanece dentro de la miniatura', () => {
    const content = landscape(0.03);
    const lizard = addMarmarajaLizard(content);
    lizard.update(100);
    const initial = lizard.group.position.clone();
    let previous = initial.clone(),
      travelled = 0;
    for (let i = 1; i <= 3600; i++) {
      lizard.update(100 + i / 60);
      const position = lizard.group.position;
      const step = position.distanceTo(previous);
      expect(step).toBeLessThan(0.016);
      expect(Math.abs(position.x)).toBeLessThan(4.3);
      expect(Math.abs(position.z)).toBeLessThan(3.6);
      expect(position.y).toBeCloseTo(0.16 + position.z * 0.03 + 0.018, 5);
      if (i % 120 === 0) {
        content.updateMatrixWorld(true);
        const envelope = new THREE.Box3().setFromObject(lizard.group);
        expect(envelope.min.x).toBeGreaterThan(-6);
        expect(envelope.max.x).toBeLessThan(6);
        expect(envelope.min.z).toBeGreaterThan(-4.7143);
        expect(envelope.max.z).toBeLessThan(4.7143);
      }
      travelled += step;
      previous = position.clone();
    }
    expect(travelled).toBeGreaterThan(32);
    expect(lizard.group.position.distanceTo(initial)).toBeGreaterThan(0.4);
    disposeBranch(content);
  });

  it('mantiene la pose con reloj pausado o reducido y retoma sin saltos de posición', () => {
    const content = landscape();
    const lizard = addMarmarajaLizard(content);
    for (let i = 0; i <= 40; i++) lizard.update(30 + i / 60);
    const position = lizard.group.position.clone();
    const rotation = lizard.group.rotation.clone();
    for (let i = 0; i < 100; i++) lizard.update(30 + 40 / 60);
    expect(lizard.group.position.equals(position)).toBe(true);
    expect(lizard.group.rotation.equals(rotation)).toBe(true);
    for (let i = 0; i < 100; i++) lizard.update(0);
    expect(lizard.group.position.equals(position)).toBe(true);
    lizard.update(80);
    expect(lizard.group.position.equals(position)).toBe(true);
    lizard.update(80 + 1 / 60);
    expect(lizard.group.position.distanceTo(position)).toBeGreaterThan(0);
    expect(lizard.group.position.distanceTo(position)).toBeLessThan(0.016);
    disposeBranch(content);
  });

  it('articula patas y cola con un coste acotado y permite liberar todos sus recursos', () => {
    const content = landscape();
    const lizard = addMarmarajaLizard(content);
    const animated: THREE.Object3D[] = [];
    lizard.group.traverse((object) => animated.push(object));
    lizard.update(0);
    const before = animated.map((object) => [
      ...object.position.toArray(),
      ...object.quaternion.toArray(),
    ]);
    for (let i = 1; i <= 24; i++) lizard.update(i / 60);
    expect(
      animated.filter((object, i) =>
        [...object.position.toArray(), ...object.quaternion.toArray()].some(
          (value, j) => Math.abs(value - before[i]![j]!) > 0.001,
        ),
      ).length,
    ).toBeGreaterThan(15);
    let triangles = 0,
      draws = 0,
      released = 0;
    lizard.group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      draws++;
      triangles +=
        (object.geometry.index?.count ?? object.geometry.getAttribute('position').count) / 3;
      object.geometry.addEventListener('dispose', () => released++);
    });
    expect(triangles).toBeLessThan(8_000);
    expect(draws).toBeLessThan(50);
    disposeBranch(content);
    expect(released).toBe(draws);
  });
});
