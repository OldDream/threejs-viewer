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
