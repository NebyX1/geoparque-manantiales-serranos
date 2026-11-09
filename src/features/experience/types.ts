import type { PlaceLocation } from '../../data/geography';

interface PointContent {
  id: number;
  name: string;
  category: string;
  region: string;
}

export interface ExperienceCluster {
  id: string;
  name: string;
  region: string;
  description: string;
  memberIds: number[];
  x: number;
  z: number;
  style: number;
}

export interface WorldGateway {
  kind: 'enter' | 'exit';
  clusterId: string;
  name: string;
  count: number;
}

export type ExperiencePoint = PointContent &
  (
    | { located: true; location: PlaceLocation; x: number; z: number }
    | { located: false; location: null; x: null; z: null }
  );
export type LocatedExperiencePoint = Extract<ExperiencePoint, { located: true }>;

export interface WorldInput {
  inspect: boolean;
  overview: boolean;
  forward: number;
  right: number;
  run: boolean;
  jump: boolean;
  /** Orbit angles in radians. Zero yaw looks toward the negative Z axis. */
  yaw: number;
  pitch: number;
  /** Camera distance in scenic units. */
  zoom: number;
}

export interface WorldFrame {
  x: number;
  z: number;
  /** Clockwise radians in the overhead X/Z map, with zero pointing north (-Z). */
  heading: number;
  nearestId: number | null;
  distance: number;
  mapX: number;
  mapZ: number;
  clusterId: string | null;
  gateway: WorldGateway | null;
}

export interface ExperienceWorld {
  resize(width: number, height: number, pixelRatio?: number): void;
  update(input: WorldInput, delta: number, elapsed: number): WorldFrame;
  render(): void;
  pick(ndcX: number, ndcY: number): number | null;
  teleport(id: number): void;
  /** A miniature can be studied even when the site's location is unconfirmed. */
  showMiniature(id: number): void;
  focusMiniature(ndcX: number, ndcY: number): boolean;
  resetMiniatureFocus(): void;
  activateGateway(): boolean;
  leaveCluster(): void;
  dispose(): void;
}
