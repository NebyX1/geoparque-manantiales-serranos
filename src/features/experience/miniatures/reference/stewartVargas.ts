import * as THREE from 'three';
import { createStewartVargasFish } from './stewartVargasFish';
import type { LandmarkModel } from '../types';
import asset from './stewartVargasAsset.json';

interface PackedPart {
  name: string;
  kind: string;
  vertices: number;
  triangles: number;
  indexBytes: number;
  positions: string;
  normals: string;
  uv: string;
  colors: string;
  indices: string;
}
function bytes(base64: string) {
  const raw = atob(base64),
    data = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) data[i] = raw.charCodeAt(i);
  return data;
}
export function decodeStewartVargasGeometry(part: PackedPart) {
  const positions = new Float32Array(bytes(part.positions).buffer),
    packed = new Int8Array(bytes(part.normals).buffer);
  const normals = new Float32Array(positions.length);
  for (let i = 0; i < normals.length; i += 3) {
    const length = Math.hypot(packed[i]!, packed[i + 1]!, packed[i + 2]!) || 1;
    normals[i] = packed[i]! / length;
    normals[i + 1] = packed[i + 1]! / length;
    normals[i + 2] = packed[i + 2]! / length;
  }
  const index = bytes(part.indices).buffer;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute(
    'uv',
    new THREE.BufferAttribute(new Float32Array(bytes(part.uv).buffer), 2),
  );
  geometry.setAttribute('color', new THREE.BufferAttribute(bytes(part.colors), 3, true));
  geometry.setIndex(
    new THREE.BufferAttribute(
      part.indexBytes === 4 ? new Uint32Array(index) : new Uint16Array(index),
      1,
    ),
  );
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

const NOISE = `
  float swHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float swNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
    return mix(mix(swHash(i),swHash(i+vec2(1,0)),f.x),mix(swHash(i+vec2(0,1)),swHash(i+vec2(1,1)),f.x),f.y);}
`;
function weatheredMaterial(kind: string) {
  const material = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    vertexColors: true,
    roughness: 0.94,
  });
  material.name = `Stewart Vargas — ${kind}`;
  material.customProgramCacheKey = () => `stewart-weather-${kind}-1`;
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vStewartLocal;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvStewartLocal=position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vStewartLocal;${NOISE}`)
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        float grain=swNoise(vStewartLocal.xz*4.2+vStewartLocal.y*.7);
        float stain=swNoise(vec2(vStewartLocal.x*2.1,vStewartLocal.y*.16));
        diffuseColor.rgb*=.88+grain*.18+stain*.08;`,
      );
  };
  return material;
}
function fenceMaterial() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 16;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 16, 16);
  ctx.fillStyle = '#d8d8c9';
  ctx.fillRect(0, 0, 1, 16);
  ctx.fillRect(0, 0, 16, 1);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return new THREE.MeshStandardMaterial({
    color: '#b4b7a9',
    map: texture,
    transparent: true,
    alphaTest: 0.18,
    depthWrite: false,
    side: THREE.DoubleSide,
    roughness: 0.73,
    metalness: 0.28,
  });
}
function waterMaterial(kind: string, clock: { value: number }) {
  const material = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: kind === 'flow' ? 0.38 : 0.22,
    metalness: 0.12,
    side: THREE.DoubleSide,
  });
  material.name = `Stewart Vargas — ${kind === 'lake' ? 'embalse calmo' : kind === 'flow' ? 'cintas del vertedero' : 'arroyo aguas abajo'}`;
  material.userData.flowClock = clock;
  material.customProgramCacheKey = () => `stewart-water-${kind}-miniature-2`;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uStewartTime = clock;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform float uStewartTime;varying vec2 vStewartUv;varying vec3 vStewartWater;varying float vStewartWorldScale;',
      )
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvStewartUv=uv;vStewartWater=position;vStewartWorldScale=length(modelMatrix[1].xyz);',
      );
    const color =
      kind === 'flow'
        ? `
        float thread=swNoise(vec2(vStewartUv.x*17.,vStewartUv.y*43.-uStewartTime*5.8));
        float streak=pow(.5+.5*sin(vStewartUv.x*70.+thread*3.),2.);
        float foam=smoothstep(.08,.85,vStewartUv.y)*(.35+.65*thread);
        diffuseColor.rgb=mix(vec3(.065,.16,.12),vec3(.80,.88,.81),clamp(foam+streak*.38,0.,1.));
      `
        : `
        float current=swNoise(vStewartWater.xz*.19+vec2(uStewartTime*.08,-uStewartTime*.13));
        float glint=pow(max(0.,sin(vStewartWater.x*.76+vStewartWater.z*.48-uStewartTime*.83)),32.);
        diffuseColor.rgb=mix(vec3(.028,.095,.077),vec3(.075,.16,.135),current);
        diffuseColor.rgb+=glint*.025;
      `;
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>\nuniform float uStewartTime;varying vec2 vStewartUv;varying vec3 vStewartWater;varying float vStewartWorldScale;${NOISE}`,
      )
      .replace('#include <color_fragment>', `#include <color_fragment>\n${color}`)
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
        float bump=(sin(vStewartWater.x*.55+vStewartWater.z*.43-uStewartTime*.8)*.025+sin(vStewartWater.x*1.2-uStewartTime*.6)*.012)*vStewartWorldScale;
        vec3 dx=dFdx(-vViewPosition),dy=dFdy(-vViewPosition),r1=cross(dy,normal),r2=cross(normal,dx);
        float det=dot(dx,r1);normal=normalize(abs(det)*normal-sign(det)*(dFdx(bump)*r1+dFdy(bump)*r2));
        float fresnel=pow(1.-abs(dot(normal,normalize(vViewPosition))),3.);
        diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.16,.27,.28),fresnel*.35);`,
      );
  };
  return material;
}

export function createStewartVargas(): LandmarkModel {
  const group = new THREE.Group();
  group.name = 'Represa Stewart Vargas — dique, pasarela, embalse y valle';
  group.userData.assetSha256 = asset.sourceSha256;
  group.userData.stewartVargas = asset.landscape;
  const clock = { value: 0 };
  const materials: Record<string, THREE.MeshStandardMaterial> = {
    concrete: weatheredMaterial('hormigón'),
    terrain: weatheredMaterial('pradera'),
    rock: new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.3, 0.32, 0.265),
      roughness: 1,
    }),
    wood: new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.19, 0.067, 0.043),
      roughness: 0.87,
    }),
    metal: new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.34, 0.37, 0.34),
      roughness: 0.7,
      metalness: 0.35,
    }),
    fence: fenceMaterial(),
    lake: waterMaterial('lake', clock),
    flow: waterMaterial('flow', clock),
    brook: waterMaterial('brook', clock),
    reed: new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.32, 0.35, 0.12),
      roughness: 1,
      side: THREE.DoubleSide,
    }),
    plants: new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.18, 0.32, 0.07),
      roughness: 0.8,
      side: THREE.DoubleSide,
    }),
    house: new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.49, 0.43, 0.29),
      roughness: 0.95,
    }),
    roof: new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.14, 0.12, 0.085),
      roughness: 0.94,
    }),
  };
  for (const part of asset.parts) {
    const material = materials[part.kind];
    if (!material) throw new Error(`Unknown Stewart Vargas material: ${part.kind}`);
    const mesh = new THREE.Mesh(decodeStewartVargasGeometry(part), material);
    mesh.name = `Stewart Vargas — ${part.kind}`;
    mesh.userData.kind = part.kind;
    mesh.castShadow = ['concrete', 'wood', 'rock', 'house', 'roof'].includes(part.kind);
    mesh.receiveShadow = true;
    if (['lake', 'flow', 'brook'].includes(part.kind)) mesh.renderOrder = 1;
    group.add(mesh);
  }
  const foliage = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 1),
    new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1 }),
    asset.landscape.shrubs.length,
  );
  foliage.name = 'Stewart Vargas — monte en la margen rocosa';
  const dummy = new THREE.Object3D(),
    color = new THREE.Color();
  (asset.landscape.shrubs as [number, number, number, number, number, number][]).forEach(
    ([x, y, z, size, _angle, tone], i) => {
      dummy.position.set(x, y + size * 0.85, z);
      dummy.scale.set(size, size * 1.15, size * 0.85);
      dummy.updateMatrix();
      foliage.setMatrixAt(i, dummy.matrix);
      color.setRGB(0.075 + tone * 0.04, 0.145 + tone * 0.06, 0.035 + tone * 0.035);
      foliage.setColorAt(i, color);
    },
  );
  foliage.castShadow = foliage.receiveShadow = true;
  foliage.computeBoundingSphere();
  group.add(foliage);
  const drops = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.075, 5, 4),
    new THREE.MeshStandardMaterial({ color: '#dfeae1', roughness: 0.27, metalness: 0.12 }),
    asset.landscape.activeChannels.length * 8,
  );
  drops.name = 'Stewart Vargas — salpicaduras pequeñas al pie';
  drops.frustumCulled = false;
  group.add(drops);
  group.updateMatrixWorld(true);
  const terrain = group.children.find((object) => object.userData.kind === 'terrain') as THREE.Mesh;
  const ray = new THREE.Raycaster();
  const groundAt = (x: number, z: number) => {
    ray.set(new THREE.Vector3(x, 100, z), new THREE.Vector3(0, -1, 0));
    return ray.intersectObject(terrain, false)[0]?.point.y ?? 0;
  };
  const lake = group.children.find((object) => object.userData.kind === 'lake') as THREE.Mesh;
  const fish = createStewartVargasFish(lake, asset.landscape.lakeLevel);
  group.add(fish.group);
  return {
    group,
    target: new THREE.Vector3(-9, 8.7, -1),
    bounds: { radius: 305, height: 56 },
    groundY: 0,
    cameraDirection: new THREE.Vector3(-0.58, 0.18, 1).normalize(),
    nightLighting: {
      floodlights: [
        {
          foot: new THREE.Vector3(-69, groundAt(-69, 30) + 0.04, 30),
          target: new THREE.Vector3(-25, 7.5, 1),
          angle: 0.75,
          strength: 4.7,
          scale: 1.05,
          color: '#ffe3b2',
        },
        {
          foot: new THREE.Vector3(65, groundAt(65, 29) + 0.04, 29),
          target: new THREE.Vector3(23, 10, -1),
          angle: 0.77,
          strength: 3.1,
          scale: 1.05,
          color: '#c0d6ed',
        },
      ],
      setNight(night) {
        materials.lake!.roughness = night ? 0.17 : 0.22;
      },
    },
    update(time) {
      clock.value = Number.isFinite(time) ? time : 0;
      fish.update(clock.value);
      asset.landscape.activeChannels.forEach((channel, index) => {
        for (let i = 0; i < 8; i++) {
          const phase = THREE.MathUtils.euclideanModulo(
            clock.value * 1.1 + i * 0.127 + index * 0.19,
            1,
          );
          const angle = i * 2.4;
          dummy.position.set(
            channel.x + Math.cos(angle) * phase * 0.6,
            channel.toeY + 0.075 + Math.sin(phase * Math.PI) * 0.44,
            channel.endZ + phase * 0.8,
          );
          dummy.scale.setScalar(1 - phase * 0.5);
          dummy.updateMatrix();
          drops.setMatrixAt(index * 8 + i, dummy.matrix);
        }
      });
      drops.instanceMatrix.needsUpdate = true;
    },
  };
}
