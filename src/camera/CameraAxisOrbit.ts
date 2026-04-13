import * as THREE from 'three';
import type { OrbitControls } from 'three-stdlib';

/**
 * 轨道相机绕行时允许选择的世界坐标轴。
 *
 * 这里明确使用世界坐标轴而不是模型局部轴，
 * 是为了让行为在不同模型姿态下保持可预期。
 */
export type OrbitAxis = 'x' | 'y' | 'z';

export type OrbitDistanceConfig =
  | { mode?: 'absolute'; value: number }
  | { mode: 'relativeToModelRadius'; value: number }
  | { mode: 'fit'; padding?: number };

export interface CameraAxisOrbitScript {
  version?: number;
  kind?: 'axisOrbit';
  axis?: OrbitAxis;
  axisAngleDeg?: number;
  phaseDeg?: number;
  autoRotate?: boolean;
  speedDegPerSec?: number;
  distance?: OrbitDistanceConfig;
  applyWhen?: 'immediate' | 'afterModelLoaded';
}

/**
 * 控制器内部总是使用带默认值的规范化配置，
 * 这样 UI 和调用方就可以只传自己关心的字段。
 */
export interface ResolvedCameraAxisOrbitScript {
  version: 1;
  kind: 'axisOrbit';
  axis: OrbitAxis;
  axisAngleDeg: number;
  phaseDeg: number;
  autoRotate: boolean;
  speedDegPerSec: number;
  distance: OrbitDistanceConfig;
  applyWhen: 'immediate' | 'afterModelLoaded';
}

export interface AxisOrbitPose {
  target: THREE.Vector3;
  position: THREE.Vector3;
  up: THREE.Vector3;
  right: THREE.Vector3;
  forward: THREE.Vector3;
  radius: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readFiniteNumber(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Invalid ${label}: expected finite number`);
  }
  return value;
}

function normalizeAngleDeg(value: number): number {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function clampAxisAngleDeg(value: number): number {
  if (!Number.isFinite(value)) return 60;
  if (value < 0) return 0;
  if (value > 180) return 180;
  return value;
}

function parseDistanceConfig(value: unknown): OrbitDistanceConfig {
  if (value === undefined) {
    return { mode: 'fit', padding: 1.15 };
  }

  if (!isRecord(value)) {
    throw new Error('Invalid cameraAxisOrbit.distance: expected object');
  }

  const mode = value['mode'];

  if (mode === undefined || mode === 'absolute') {
    return {
      mode: 'absolute',
      value: readFiniteNumber(value['value'], 'cameraAxisOrbit.distance.value'),
    };
  }

  if (mode === 'relativeToModelRadius') {
    return {
      mode: 'relativeToModelRadius',
      value: readFiniteNumber(value['value'], 'cameraAxisOrbit.distance.value'),
    };
  }

  if (mode === 'fit') {
    const rawPadding = value['padding'];
    if (rawPadding === undefined) {
      return { mode: 'fit', padding: 1.15 };
    }

    const padding = readFiniteNumber(rawPadding, 'cameraAxisOrbit.distance.padding');
    if (padding <= 0) {
      throw new Error('Invalid cameraAxisOrbit.distance.padding: expected positive number');
    }

    return { mode: 'fit', padding };
  }

  throw new Error(
    "Invalid cameraAxisOrbit.distance.mode: expected 'absolute', 'relativeToModelRadius', or 'fit'"
  );
}

export function parseCameraAxisOrbitScript(input: string | unknown): ResolvedCameraAxisOrbitScript {
  let value: unknown = input;

  if (typeof input === 'string') {
    try {
      value = JSON.parse(input);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid cameraAxisOrbit JSON: ${message}`);
    }
  }

  if (!isRecord(value)) {
    throw new Error('Invalid cameraAxisOrbit: expected object');
  }

  const rawAxis = value['axis'];
  const rawAxisAngleDeg = value['axisAngleDeg'];
  const rawPhaseDeg = value['phaseDeg'];
  const rawAutoRotate = value['autoRotate'];
  const rawSpeedDegPerSec = value['speedDegPerSec'];
  const rawApplyWhen = value['applyWhen'];

  if (value['kind'] !== undefined && value['kind'] !== 'axisOrbit') {
    throw new Error("Invalid cameraAxisOrbit.kind: expected 'axisOrbit'");
  }

  if (rawAxis !== undefined && rawAxis !== 'x' && rawAxis !== 'y' && rawAxis !== 'z') {
    throw new Error("Invalid cameraAxisOrbit.axis: expected 'x', 'y', or 'z'");
  }

  if (rawApplyWhen !== undefined && rawApplyWhen !== 'immediate' && rawApplyWhen !== 'afterModelLoaded') {
    throw new Error("Invalid cameraAxisOrbit.applyWhen: expected 'immediate' or 'afterModelLoaded'");
  }

  return {
    version: 1,
    kind: 'axisOrbit',
    axis: rawAxis ?? 'y',
    axisAngleDeg:
      rawAxisAngleDeg === undefined
        ? 60
        : clampAxisAngleDeg(readFiniteNumber(rawAxisAngleDeg, 'cameraAxisOrbit.axisAngleDeg')),
    phaseDeg:
      rawPhaseDeg === undefined
        ? 45
        : normalizeAngleDeg(readFiniteNumber(rawPhaseDeg, 'cameraAxisOrbit.phaseDeg')),
    autoRotate: rawAutoRotate === undefined ? true : Boolean(rawAutoRotate),
    speedDegPerSec:
      rawSpeedDegPerSec === undefined
        ? 15
        : readFiniteNumber(rawSpeedDegPerSec, 'cameraAxisOrbit.speedDegPerSec'),
    distance: parseDistanceConfig(value['distance']),
    applyWhen: rawApplyWhen ?? 'afterModelLoaded',
  };
}

export function getOrbitAxisVector(axis: OrbitAxis): THREE.Vector3 {
  switch (axis) {
    case 'x':
      return new THREE.Vector3(1, 0, 0);
    case 'y':
      return new THREE.Vector3(0, 1, 0);
    case 'z':
      return new THREE.Vector3(0, 0, 1);
  }
}

function getReferenceUp(axis: OrbitAxis): THREE.Vector3 {
  switch (axis) {
    case 'x':
      return new THREE.Vector3(0, 1, 0);
    case 'y':
      return new THREE.Vector3(0, 0, 1);
    case 'z':
      return new THREE.Vector3(0, 1, 0);
  }
}

function getOrbitBasis(axis: OrbitAxis): { axisVector: THREE.Vector3; tangentU: THREE.Vector3; tangentV: THREE.Vector3 } {
  const axisVector = getOrbitAxisVector(axis);
  const referenceUp = getReferenceUp(axis);

  // tangentU / tangentV 构成围绕旋转轴的局部圆盘基底，
  // phaseDeg 只需要在这个圆盘内转动即可。
  const tangentU = new THREE.Vector3().crossVectors(referenceUp, axisVector).normalize();
  const tangentV = new THREE.Vector3().crossVectors(axisVector, tangentU).normalize();

  return { axisVector, tangentU, tangentV };
}

function getOrbitPlanarDirection(axis: OrbitAxis, phaseDeg: number): THREE.Vector3 {
  const phaseRad = THREE.MathUtils.degToRad(normalizeAngleDeg(phaseDeg));
  const { tangentU, tangentV } = getOrbitBasis(axis);

  return tangentU.multiplyScalar(Math.cos(phaseRad)).add(
    tangentV.multiplyScalar(Math.sin(phaseRad))
  ).normalize();
}

export function getAxisOrbitOffset(options: {
  axis: OrbitAxis;
  axisAngleDeg: number;
  phaseDeg: number;
  radius: number;
}): THREE.Vector3 {
  const { axis, axisAngleDeg, phaseDeg, radius } = options;
  const axisAngleRad = THREE.MathUtils.degToRad(clampAxisAngleDeg(axisAngleDeg));
  const { axisVector } = getOrbitBasis(axis);
  const planarDirection = getOrbitPlanarDirection(axis, phaseDeg);

  return axisVector
    .clone()
    .multiplyScalar(Math.cos(axisAngleRad))
    .add(planarDirection.multiplyScalar(Math.sin(axisAngleRad)))
    .normalize()
    .multiplyScalar(radius);
}

export function getAxisOrbitPose(options: {
  target: THREE.Vector3;
  axis: OrbitAxis;
  axisAngleDeg: number;
  phaseDeg: number;
  radius: number;
}): AxisOrbitPose {
  const { target, radius, axis, axisAngleDeg, phaseDeg } = options;
  const clampedAxisAngleDeg = clampAxisAngleDeg(axisAngleDeg);
  const axisAngleRad = THREE.MathUtils.degToRad(clampedAxisAngleDeg);
  const { axisVector } = getOrbitBasis(axis);
  const planarDirection = getOrbitPlanarDirection(axis, phaseDeg);
  const offsetDirection = axisVector
    .clone()
    .multiplyScalar(Math.cos(axisAngleRad))
    .add(planarDirection.clone().multiplyScalar(Math.sin(axisAngleRad)))
    .normalize();
  const position = target.clone().add(offsetDirection.clone().multiplyScalar(radius));

  // forward 指向“相机看向哪里”，也就是从相机位置指向 target。
  const forward = offsetDirection.clone().negate();
  // 使用“增大 axisAngle 时的轨道切线”作为 up，
  // 这样在 0 / 180 极点附近也能保持连续，不会突然换一个世界 up。
  const upCandidate = axisVector
    .clone()
    .multiplyScalar(Math.sin(axisAngleRad))
    .add(planarDirection.clone().multiplyScalar(-Math.cos(axisAngleRad)))
    .normalize();
  const right = new THREE.Vector3().crossVectors(forward, upCandidate).normalize();
  const up = new THREE.Vector3().crossVectors(right, forward).normalize();

  return {
    target: target.clone(),
    position,
    up,
    right,
    forward,
    radius,
  };
}

export function resolveOrbitDistanceValue(
  distance: OrbitDistanceConfig,
  options: { modelRadius?: number; fitDistance?: number }
): number | null {
  if (distance.mode === 'relativeToModelRadius') {
    const modelRadius = options.modelRadius;
    if (typeof modelRadius !== 'number' || !Number.isFinite(modelRadius) || modelRadius <= 0) {
      return null;
    }
    return distance.value * modelRadius;
  }

  if (distance.mode === 'fit') {
    const fitDistance = options.fitDistance;
    if (typeof fitDistance !== 'number' || !Number.isFinite(fitDistance) || fitDistance <= 0) {
      return null;
    }
    return fitDistance;
  }

  return distance.value > 0 ? distance.value : null;
}

export function applyAxisOrbitPose(
  viewer: { camera: THREE.PerspectiveCamera; orbitControls?: OrbitControls },
  pose: AxisOrbitPose
): void {
  viewer.camera.up.copy(pose.up);
  viewer.camera.position.copy(pose.position);
  viewer.camera.lookAt(pose.target);

  if (viewer.orbitControls) {
    // orbit 脚本模式下，相机位姿由我们自己计算，
    // 这里只同步 OrbitControls 的 target，避免 controls.update()
    // 再次用内部球坐标覆盖我们刚刚写入的镜头位置。
    viewer.orbitControls.target.copy(pose.target);
  }
}
