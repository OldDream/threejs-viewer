import * as THREE from 'three';
import type { OrbitControls } from 'three-stdlib';

export type CameraViewPresetV1 = {
  version: 1;
  kind: 'orbit';
  target: { x: number; y: number; z: number };
  spherical: { radius: number; phi: number; theta: number };
  up?: { x: number; y: number; z: number };
  targetMode?: 'world' | 'modelCenter';
  radiusMode?: 'absolute' | 'relativeToModelRadius';
};

export type CameraViewPreset = CameraViewPresetV1;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readFiniteNumber(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Invalid ${label}: expected finite number`);
  }
  return value;
}

function readVector3Like(value: unknown, label: string): { x: number; y: number; z: number } {
  if (!isRecord(value)) {
    throw new Error(`Invalid ${label}: expected object`);
  }
  return {
    x: readFiniteNumber(value.x, `${label}.x`),
    y: readFiniteNumber(value.y, `${label}.y`),
    z: readFiniteNumber(value.z, `${label}.z`),
  };
}

export function parseCameraViewPreset(input: string | unknown): CameraViewPreset {
  let value: unknown = input;

  if (typeof input === 'string') {
    try {
      value = JSON.parse(input);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid cameraViewPreset JSON: ${message}`);
    }
  }

  if (!isRecord(value)) {
    throw new Error('Invalid cameraViewPreset: expected object');
  }

  if (value.version !== 1) {
    throw new Error('Invalid cameraViewPreset.version: expected 1');
  }

  if (value.kind !== 'orbit') {
    throw new Error("Invalid cameraViewPreset.kind: expected 'orbit'");
  }

  const target = readVector3Like(value.target, 'cameraViewPreset.target');

  if (!isRecord(value.spherical)) {
    throw new Error('Invalid cameraViewPreset.spherical: expected object');
  }

  const radius = readFiniteNumber(value.spherical.radius, 'cameraViewPreset.spherical.radius');
  const phi = readFiniteNumber(value.spherical.phi, 'cameraViewPreset.spherical.phi');
  const theta = readFiniteNumber(value.spherical.theta, 'cameraViewPreset.spherical.theta');

  const up = value.up === undefined ? undefined : readVector3Like(value.up, 'cameraViewPreset.up');

  const targetMode =
    value.targetMode === 'modelCenter' || value.targetMode === 'world' ? value.targetMode : undefined;
  const radiusMode =
    value.radiusMode === 'relativeToModelRadius' || value.radiusMode === 'absolute' ? value.radiusMode : undefined;

  return {
    version: 1,
    kind: 'orbit',
    target,
    spherical: { radius, phi, theta },
    up,
    targetMode,
    radiusMode,
  };
}

export function exportCameraViewPreset(
  viewer: { camera: THREE.PerspectiveCamera; orbitControls?: OrbitControls },
  options?: { modelRadius?: number; radiusMode?: CameraViewPresetV1['radiusMode']; targetMode?: CameraViewPresetV1['targetMode'] }
): CameraViewPreset {
  const targetVec = viewer.orbitControls?.target?.clone() ?? new THREE.Vector3(0, 0, 0);
  const offset = viewer.camera.position.clone().sub(targetVec);
  const spherical = new THREE.Spherical().setFromVector3(offset);

  let radiusMode: CameraViewPresetV1['radiusMode'] = options?.radiusMode ?? 'absolute';
  let radius = spherical.radius;

  if (radiusMode === 'relativeToModelRadius') {
    const modelRadius = options?.modelRadius;
    if (typeof modelRadius === 'number' && Number.isFinite(modelRadius) && modelRadius > 0) {
      radius = spherical.radius / modelRadius;
    } else {
      radiusMode = 'absolute';
      radius = spherical.radius;
    }
  }

  return {
    version: 1,
    kind: 'orbit',
    target: { x: targetVec.x, y: targetVec.y, z: targetVec.z },
    spherical: { radius, phi: spherical.phi, theta: spherical.theta },
    up: { x: viewer.camera.up.x, y: viewer.camera.up.y, z: viewer.camera.up.z },
    targetMode: options?.targetMode ?? 'world',
    radiusMode,
  };
}

export function applyCameraViewPreset(
  viewer: { camera: THREE.PerspectiveCamera; orbitControls?: OrbitControls },
  preset: CameraViewPreset,
  options?: { modelCenter?: THREE.Vector3; modelRadius?: number }
): void {
  const target =
    preset.targetMode === 'modelCenter'
      ? (options?.modelCenter?.clone() ?? new THREE.Vector3(preset.target.x, preset.target.y, preset.target.z))
      : new THREE.Vector3(preset.target.x, preset.target.y, preset.target.z);

  const radius =
    preset.radiusMode === 'relativeToModelRadius'
      ? (() => {
          const modelRadius = options?.modelRadius;
          if (typeof modelRadius !== 'number' || !Number.isFinite(modelRadius) || modelRadius <= 0) {
            return preset.spherical.radius;
          }
          return preset.spherical.radius * modelRadius;
        })()
      : preset.spherical.radius;

  const spherical = new THREE.Spherical(radius, preset.spherical.phi, preset.spherical.theta);
  const offset = new THREE.Vector3().setFromSpherical(spherical);
  const nextPos = target.clone().add(offset);

  if (preset.up) {
    viewer.camera.up.set(preset.up.x, preset.up.y, preset.up.z);
  }

  viewer.camera.position.copy(nextPos);

  if (viewer.orbitControls) {
    viewer.orbitControls.target.copy(target);
    viewer.orbitControls.update();
  } else {
    viewer.camera.lookAt(target);
  }
}

