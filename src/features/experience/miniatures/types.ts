import type { ColorRepresentation, Group, Vector3 } from 'three';

export interface LandmarkNightLighting {
  floodlights: readonly [
    {
      foot: Vector3;
      target: Vector3;
      angle: number;
      strength: number;
      scale?: number;
      color?: ColorRepresentation;
      penumbra?: number;
    },
    {
      foot: Vector3;
      target: Vector3;
      angle: number;
      strength: number;
      scale?: number;
      color?: ColorRepresentation;
      penumbra?: number;
    },
  ];
  setNight(night: boolean, active: boolean): void;
}

export interface LandmarkModel {
  group: Group;
  target: Vector3;
  bounds: { radius: number; height: number };
  groundY?: number;
  cameraDirection?: Vector3;
  nightLighting?: LandmarkNightLighting;
  update?: (time: number) => void;
}

export interface MiniatureMetadata {
  id: number;
  representation: 'reference-model' | 'reference-informed';
  source: string;
  width: number;
  height: number;
  drawCalls: number;
  triangles: number;
}
