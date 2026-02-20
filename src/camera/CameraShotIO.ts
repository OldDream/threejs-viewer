import * as THREE from 'three';
import type { CameraPathAnimationConfig } from '../plugins/CameraPathAnimationPlugin';
import type { CameraPathDesignerShot } from '../plugins/CameraPathDesignerPlugin';

export type CameraShot = CameraPathDesignerShot;

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
    x: readFiniteNumber(value['x'], `${label}.x`),
    y: readFiniteNumber(value['y'], `${label}.y`),
    z: readFiniteNumber(value['z'], `${label}.z`),
  };
}

export function parseCameraShot(input: string | unknown): CameraShot {
  let value: unknown = input;

  if (typeof input === 'string') {
    try {
      value = JSON.parse(input);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid cameraShot JSON: ${message}`);
    }
  }

  if (!isRecord(value)) {
    throw new Error('Invalid cameraShot: expected object');
  }

  const loop = value['loop'];
  if (typeof loop !== 'boolean') {
    throw new Error('Invalid cameraShot.loop: expected boolean');
  }

  const rawPathPoints = value['pathPoints'];
  if (!Array.isArray(rawPathPoints)) {
    throw new Error('Invalid cameraShot.pathPoints: expected array');
  }

  const pathPoints = rawPathPoints.map((point, index) => readVector3Like(point, `cameraShot.pathPoints[${index}]`));

  const rawSegments = value['segments'];
  if (!Array.isArray(rawSegments)) {
    throw new Error('Invalid cameraShot.segments: expected array (export from demo)');
  }

  const rawTarget = value['target'];
  if (rawTarget !== undefined && rawTarget !== null) {
    readVector3Like(rawTarget, 'cameraShot.target');
  }

  const shot: CameraShot = {
    loop,
    segments: rawSegments as NonNullable<CameraShot['segments']>,
    pathPoints,
  };

  if (value['version'] === 2) {
    shot.version = 2;
  }

  const duration = value['duration'];
  if (typeof duration === 'number' && Number.isFinite(duration)) {
    shot.duration = duration;
  }

  const easeInOut = value['easeInOut'];
  if (typeof easeInOut === 'number' && Number.isFinite(easeInOut)) {
    shot.easeInOut = easeInOut;
  }

  const defaults = value['defaults'];
  if (isRecord(defaults)) {
    shot.defaults = defaults as unknown as NonNullable<CameraShot['defaults']>;
  }

  if (rawTarget !== undefined) {
    shot.target = rawTarget as NonNullable<CameraShot['target']>;
  }

  return shot;
}

export function toCameraPathAnimationConfig(
  shot: CameraShot,
  options?: { loop?: boolean }
): CameraPathAnimationConfig {
  if (!Array.isArray(shot.pathPoints)) {
    throw new Error('Invalid cameraShot.pathPoints: expected array');
  }
  if (!Array.isArray(shot.segments)) {
    throw new Error('Invalid cameraShot.segments: expected array (export from demo)');
  }

  const pathPoints = shot.pathPoints.map((point, index) => {
    const x = readFiniteNumber(point?.x, `cameraShot.pathPoints[${index}].x`);
    const y = readFiniteNumber(point?.y, `cameraShot.pathPoints[${index}].y`);
    const z = readFiniteNumber(point?.z, `cameraShot.pathPoints[${index}].z`);
    return new THREE.Vector3(x, y, z);
  });

  const loop = options?.loop ?? shot.loop ?? false;

  const config: CameraPathAnimationConfig = {
    pathPoints,
    segments: shot.segments,
    loop,
  };

  if (shot.defaults !== undefined) {
    config.defaults = shot.defaults;
  }

  if (shot.duration !== undefined) {
    config.duration = shot.duration;
  }

  if (shot.easeInOut !== undefined) {
    config.easeInOut = shot.easeInOut;
  }

  if (shot.target) {
    config.target = new THREE.Vector3(shot.target.x, shot.target.y, shot.target.z);
  }

  return config;
}
