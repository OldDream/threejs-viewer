import * as THREE from 'three';
import { getAxisOrbitPose, type OrbitAxis } from './CameraAxisOrbit';

export interface OrbitFitDistanceOptions {
  boundingBox: THREE.Box3;
  target: THREE.Vector3;
  axis: OrbitAxis;
  axisAngleDeg: number;
  phaseDeg: number;
  fovDeg: number;
  aspect: number;
  near?: number;
  padding?: number;
}

export interface OrbitFitDistanceEnvelopeOptions
  extends Omit<OrbitFitDistanceOptions, 'phaseDeg'> {
  sampleCount?: number;
}

export interface OrbitFitDistancePoseEnvelopeOptions
  extends Omit<OrbitFitDistanceOptions, 'axisAngleDeg' | 'phaseDeg'> {
  minAxisAngleDeg?: number;
  maxAxisAngleDeg?: number;
  axisAngleSampleCount?: number;
  phaseSampleCount?: number;
}

function getBoundingBoxCorners(boundingBox: THREE.Box3): THREE.Vector3[] {
  const { min, max } = boundingBox;

  return [
    new THREE.Vector3(min.x, min.y, min.z),
    new THREE.Vector3(min.x, min.y, max.z),
    new THREE.Vector3(min.x, max.y, min.z),
    new THREE.Vector3(min.x, max.y, max.z),
    new THREE.Vector3(max.x, min.y, min.z),
    new THREE.Vector3(max.x, min.y, max.z),
    new THREE.Vector3(max.x, max.y, min.z),
    new THREE.Vector3(max.x, max.y, max.z),
  ];
}

/**
 * 这个函数解决“给定观察方向后，相机至少要退多远才能把整个包围盒装进视窗”。
 *
 * 算法思路：
 * 1. 先根据 axis/axisAngle/phase 得到相机的朝向基底（forward/right/up）。
 * 2. 把包围盒 8 个顶点投影到这个相机基底上。
 * 3. 对每个顶点分别求出满足水平视野和垂直视野所需的最小距离。
 * 4. 取所有顶点中的最大值，再乘 padding，得到安全距离。
 */
export function computeOrbitFitDistance(options: OrbitFitDistanceOptions): number {
  const {
    boundingBox,
    target,
    axis,
    axisAngleDeg,
    phaseDeg,
    fovDeg,
    aspect,
    near = 0.1,
    padding = 1.15,
  } = options;

  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
  const safePadding = Number.isFinite(padding) && padding > 0 ? padding : 1;
  const verticalFovRad = THREE.MathUtils.degToRad(fovDeg);
  const tanVertical = Math.tan(verticalFovRad / 2);
  const tanHorizontal = tanVertical * safeAspect;

  if (!(tanVertical > 0) || !(tanHorizontal > 0)) {
    return 1;
  }

  const pose = getAxisOrbitPose({
    target,
    axis,
    axisAngleDeg,
    phaseDeg,
    radius: 1,
  });

  const corners = getBoundingBoxCorners(boundingBox);
  let minDistance = 0;

  for (const corner of corners) {
    const delta = corner.clone().sub(target);
    const projectedX = delta.dot(pose.right);
    const projectedY = delta.dot(pose.up);
    const projectedZ = delta.dot(pose.forward);

    const distanceForWidth = Math.abs(projectedX) / tanHorizontal - projectedZ;
    const distanceForHeight = Math.abs(projectedY) / tanVertical - projectedZ;
    const distanceForNearPlane = near - projectedZ;

    minDistance = Math.max(minDistance, distanceForWidth, distanceForHeight, distanceForNearPlane);
  }

  return Math.max(minDistance * safePadding, near * 2);
}

/**
 * 计算“整圈轨道中最保守的安全距离”。
 *
 * 对业务来说，这个值更符合“首次载入稳定显示”的预期：
 * 无论用户把初始相位调到哪里，相机半径都不再跟着忽远忽近，
 * 而是始终采用这条轨道上最远、最安全的那个距离。
 */
export function computeOrbitFitDistanceEnvelope(
  options: OrbitFitDistanceEnvelopeOptions
): number {
  const {
    sampleCount = 180,
    boundingBox,
    target,
    axis,
    axisAngleDeg,
    fovDeg,
    aspect,
    near,
    padding,
  } = options;

  const safeSampleCount = Math.max(12, Math.floor(sampleCount));
  let maxDistance = 0;

  for (let index = 0; index < safeSampleCount; index += 1) {
    const phaseDeg = (360 / safeSampleCount) * index;
    const distance = computeOrbitFitDistance({
      boundingBox,
      target,
      axis,
      axisAngleDeg,
      phaseDeg,
      fovDeg,
      aspect,
      ...(near !== undefined ? { near } : {}),
      ...(padding !== undefined ? { padding } : {}),
    });

    maxDistance = Math.max(maxDistance, distance);
  }

  return maxDistance;
}

/**
 * 计算“整组轨道姿态”的最保守安全距离。
 *
 * 与仅对 phase 取包络不同，这里会同时扫描：
 * 1. 不同的相位 phaseDeg
 * 2. 不同的与旋转轴夹角 axisAngleDeg
 *
 * 这样业务在拖动 axisAngleDeg 滑杆时，相机半径也不会忽远忽近，
 * 而是始终沿用这一组姿态中的最大安全值。
 */
export function computeOrbitFitDistancePoseEnvelope(
  options: OrbitFitDistancePoseEnvelopeOptions
): number {
  const {
    boundingBox,
    target,
    axis,
    fovDeg,
    aspect,
    near,
    padding,
    minAxisAngleDeg = 0,
    maxAxisAngleDeg = 180,
    axisAngleSampleCount = 91,
    phaseSampleCount = 180,
  } = options;

  const startAngle = THREE.MathUtils.clamp(Math.min(minAxisAngleDeg, maxAxisAngleDeg), 0, 180);
  const endAngle = THREE.MathUtils.clamp(Math.max(minAxisAngleDeg, maxAxisAngleDeg), 0, 180);
  const safeAxisAngleSampleCount =
    startAngle === endAngle ? 1 : Math.max(2, Math.floor(axisAngleSampleCount));

  let maxDistance = 0;

  for (let index = 0; index < safeAxisAngleSampleCount; index += 1) {
    const axisAngleDeg =
      safeAxisAngleSampleCount === 1
        ? startAngle
        : startAngle + ((endAngle - startAngle) * index) / (safeAxisAngleSampleCount - 1);

    const distance = computeOrbitFitDistanceEnvelope({
      boundingBox,
      target,
      axis,
      axisAngleDeg,
      fovDeg,
      aspect,
      ...(near !== undefined ? { near } : {}),
      ...(padding !== undefined ? { padding } : {}),
      sampleCount: phaseSampleCount,
    });

    maxDistance = Math.max(maxDistance, distance);
  }

  return maxDistance;
}
