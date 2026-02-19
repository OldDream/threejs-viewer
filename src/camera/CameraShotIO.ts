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
    x: readFiniteNumber(value.x, `${label}.x`),
    y: readFiniteNumber(value.y, `${label}.y`),
    z: readFiniteNumber(value.z, `${label}.z`),
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

  if (typeof value.loop !== 'boolean') {
    throw new Error('Invalid cameraShot.loop: expected boolean');
  }

  if (!Array.isArray(value.pathPoints)) {
    throw new Error('Invalid cameraShot.pathPoints: expected array');
  }

  const pathPoints = value.pathPoints.map((point, index) => readVector3Like(point, `cameraShot.pathPoints[${index}]`));

  if (!Array.isArray(value.segments)) {
    throw new Error('Invalid cameraShot.segments: expected array (export from demo)');
  }

  if (value.target !== undefined && value.target !== null) {
    readVector3Like(value.target, 'cameraShot.target');
  }

  return {
    version: value.version === 2 ? 2 : undefined,
    duration: typeof value.duration === 'number' && Number.isFinite(value.duration) ? value.duration : undefined,
    loop: value.loop,
    easeInOut: typeof value.easeInOut === 'number' && Number.isFinite(value.easeInOut) ? value.easeInOut : undefined,
    defaults: isRecord(value.defaults) ? (value.defaults as CameraShot['defaults']) : undefined,
    segments: value.segments as CameraShot['segments'],
    pathPoints,
    target: value.target === undefined ? undefined : (value.target as CameraShot['target']),
  };
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
    defaults: shot.defaults,
    loop,
    duration: shot.duration,
    easeInOut: shot.easeInOut,
  };

  if (shot.target) {
    config.target = new THREE.Vector3(shot.target.x, shot.target.y, shot.target.z);
  }

  return config;
}

