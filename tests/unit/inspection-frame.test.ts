import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  computeInspectionViewport,
  fitInspectionBounds,
} from '../../src/features/experience/inspection-frame';

describe('encuadre de inspección dentro del área libre del HUD', () => {
  it('reserva las columnas de HUD y el espacio bajo las herramientas en teléfonos', () => {
    expect(computeInspectionViewport(1440, 900)).toMatchObject({
      x: 320,
      y: 96,
      width: 996,
      height: 772,
    });
    expect(computeInspectionViewport(640, 450)).toMatchObject({
      x: 240,
      y: 80,
      width: 316,
      height: 346,
    });
    expect(computeInspectionViewport(320, 640)).toMatchObject({
      x: 16,
      y: 380,
      width: 288,
      height: 150,
    });
    expect(computeInspectionViewport(320, 900)).toMatchObject({
      x: 16,
      y: 380,
      width: 288,
      height: 410,
    });
    expect(computeInspectionViewport(640, 900)).toMatchObject({
      x: 16,
      y: 380,
      width: 608,
      height: 410,
    });
    expect(computeInspectionViewport(900, 1200).fullWidth).toBe(900);
    expect(computeInspectionViewport(320, 280).width).toBeGreaterThan(0);
  });

  it('proyecta las ocho esquinas de cuerpos altos, planos y profundos sin cubrir el HUD', () => {
    const bounds = [
      new THREE.Box3(new THREE.Vector3(-2, 0, -2), new THREE.Vector3(2, 24, 2)),
      new THREE.Box3(new THREE.Vector3(-7, -0.5, -8), new THREE.Vector3(7, 0.2, 8)),
      new THREE.Box3(new THREE.Vector3(10, -2, 20), new THREE.Vector3(13, 5, 40)),
    ];
    for (const [width, height] of [
      [1440, 900],
      [1920, 1080],
      [640, 450],
      [844, 390],
      [320, 900],
      [320, 640],
      [640, 900],
      [900, 1200],
    ])
      for (const box of bounds)
        for (const yaw of [-2.8, 0, 0.7, 2.2])
          for (const pitch of [0.16, 0.5, 1.2]) {
            const viewport = computeInspectionViewport(width!, height!);
            const fit = fitInspectionBounds(box, { yaw, pitch, fovDegrees: 51, viewport });
            const camera = new THREE.PerspectiveCamera(51, width! / height!, 0.15, 100000);
            camera.position.set(
              fit.center.x + fit.eye.x * fit.distance,
              fit.center.y + fit.eye.y * fit.distance,
              fit.center.z + fit.eye.z * fit.distance,
            );
            camera.lookAt(fit.center.x, fit.center.y, fit.center.z);
            camera.setViewOffset(
              width!,
              height!,
              viewport.viewOffsetX,
              viewport.viewOffsetY,
              width!,
              height!,
            );
            camera.updateMatrixWorld();
            for (const x of [box.min.x, box.max.x])
              for (const y of [box.min.y, box.max.y])
                for (const z of [box.min.z, box.max.z]) {
                  const projected = new THREE.Vector3(x, y, z).project(camera);
                  const px = ((projected.x + 1) / 2) * width!;
                  const py = ((1 - projected.y) / 2) * height!;
                  expect(px).toBeGreaterThanOrEqual(viewport.x + viewport.width * 0.05 - 1e-6);
                  expect(px).toBeLessThanOrEqual(viewport.x + viewport.width * 0.95 + 1e-6);
                  expect(py).toBeGreaterThanOrEqual(viewport.y + viewport.height * 0.05 - 1e-6);
                  expect(py).toBeLessThanOrEqual(viewport.y + viewport.height * 0.95 + 1e-6);
                  expect(projected.z).toBeGreaterThanOrEqual(-1);
                  expect(projected.z).toBeLessThan(1);
                }
          }
  });

  it('mantiene profundidad mayor al plano cercano incluso en un punto degenerado', () => {
    const viewport = computeInspectionViewport(640, 450);
    const point = { x: 7, y: -3, z: 18 };
    const fit = fitInspectionBounds(
      { min: point, max: point },
      { yaw: 0.7, pitch: 0.5, fovDegrees: 51, viewport, near: 2 },
    );
    expect(fit.center).toEqual(point);
    expect(fit.distance).toBeGreaterThan(2);
  });

  it('rechaza datos no finitos y bounds invertidos antes de alterar la cámara', () => {
    expect(() => computeInspectionViewport(0, 640)).toThrow(RangeError);
    expect(() => computeInspectionViewport(NaN, 640)).toThrow(RangeError);
    expect(() =>
      fitInspectionBounds(
        { min: { x: 1, y: 0, z: 0 }, max: { x: -1, y: 1, z: 1 } },
        { yaw: 0, pitch: 0.5, fovDegrees: 51, viewport: computeInspectionViewport(320, 640) },
      ),
    ).toThrow(RangeError);
  });
});
