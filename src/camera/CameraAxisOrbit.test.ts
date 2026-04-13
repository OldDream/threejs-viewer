import * as THREE from 'three';
import {
  computeOrbitFitDistance,
  computeOrbitFitDistanceEnvelope,
  computeOrbitFitDistancePoseEnvelope,
} from './CameraFitDistance';
import {
  getAxisOrbitPose,
  parseCameraAxisOrbitScript,
  resolveOrbitDistanceValue,
} from './CameraAxisOrbit';

describe('CameraAxisOrbit', () => {
  it('fills defaults when parsing a minimal orbit config', () => {
    const parsed = parseCameraAxisOrbitScript({});

    expect(parsed.axis).toBe('y');
    expect(parsed.axisAngleDeg).toBe(60);
    expect(parsed.phaseDeg).toBe(45);
    expect(parsed.autoRotate).toBe(true);
    expect(parsed.speedDegPerSec).toBe(15);
    expect(parsed.distance.mode).toBe('fit');
  });

  it('builds a pose whose position keeps the requested radius', () => {
    const target = new THREE.Vector3(1, 2, 3);
    const pose = getAxisOrbitPose({
      target,
      axis: 'z',
      axisAngleDeg: 90,
      phaseDeg: 180,
      radius: 8,
    });

    expect(pose.position.distanceTo(target)).toBeCloseTo(8, 6);
    expect(pose.forward.length()).toBeCloseTo(1, 6);
    expect(pose.right.length()).toBeCloseTo(1, 6);
    expect(pose.up.length()).toBeCloseTo(1, 6);
  });

  it('keeps camera orientation continuous at the 0 and 180 degree poles', () => {
    const target = new THREE.Vector3(0, 0, 0);

    const nearNorthPole = getAxisOrbitPose({
      target,
      axis: 'y',
      axisAngleDeg: 0.001,
      phaseDeg: 35,
      radius: 8,
    });
    const northPole = getAxisOrbitPose({
      target,
      axis: 'y',
      axisAngleDeg: 0,
      phaseDeg: 35,
      radius: 8,
    });
    const nearSouthPole = getAxisOrbitPose({
      target,
      axis: 'y',
      axisAngleDeg: 179.999,
      phaseDeg: 35,
      radius: 8,
    });
    const southPole = getAxisOrbitPose({
      target,
      axis: 'y',
      axisAngleDeg: 180,
      phaseDeg: 35,
      radius: 8,
    });

    expect(northPole.up.dot(nearNorthPole.up)).toBeGreaterThan(0.999);
    expect(northPole.right.dot(nearNorthPole.right)).toBeGreaterThan(0.999);
    expect(southPole.up.dot(nearSouthPole.up)).toBeGreaterThan(0.999);
    expect(southPole.right.dot(nearSouthPole.right)).toBeGreaterThan(0.999);
  });

  it('computes a fit distance larger than the raw half-extent for a front view', () => {
    const boundingBox = new THREE.Box3(
      new THREE.Vector3(-2, -1, -1),
      new THREE.Vector3(2, 1, 1)
    );

    const fitDistance = computeOrbitFitDistance({
      boundingBox,
      target: new THREE.Vector3(0, 0, 0),
      axis: 'y',
      axisAngleDeg: 90,
      phaseDeg: 270,
      fovDeg: 50,
      aspect: 1,
      near: 0.1,
      padding: 1.1,
    });

    expect(fitDistance).toBeGreaterThan(4);
    expect(
      resolveOrbitDistanceValue({ mode: 'fit', padding: 1.1 }, { fitDistance })
    ).toBeCloseTo(fitDistance, 6);
  });

  it('computes an envelope distance that is stable and no smaller than any sampled phase', () => {
    const boundingBox = new THREE.Box3(
      new THREE.Vector3(-3, -1, -2),
      new THREE.Vector3(3, 1, 2)
    );

    const envelope = computeOrbitFitDistanceEnvelope({
      boundingBox,
      target: new THREE.Vector3(0, 0, 0),
      axis: 'y',
      axisAngleDeg: 65,
      fovDeg: 50,
      aspect: 1.6,
      padding: 1.1,
      sampleCount: 72,
    });

    const sampleA = computeOrbitFitDistance({
      boundingBox,
      target: new THREE.Vector3(0, 0, 0),
      axis: 'y',
      axisAngleDeg: 65,
      phaseDeg: 0,
      fovDeg: 50,
      aspect: 1.6,
      padding: 1.1,
    });

    const sampleB = computeOrbitFitDistance({
      boundingBox,
      target: new THREE.Vector3(0, 0, 0),
      axis: 'y',
      axisAngleDeg: 65,
      phaseDeg: 90,
      fovDeg: 50,
      aspect: 1.6,
      padding: 1.1,
    });

    expect(envelope).toBeGreaterThanOrEqual(sampleA);
    expect(envelope).toBeGreaterThanOrEqual(sampleB);
  });

  it('computes a pose envelope distance that is stable across both phase and axis angle', () => {
    const boundingBox = new THREE.Box3(
      new THREE.Vector3(-3, -1, -2),
      new THREE.Vector3(3, 1, 2)
    );

    const envelope = computeOrbitFitDistancePoseEnvelope({
      boundingBox,
      target: new THREE.Vector3(0, 0, 0),
      axis: 'y',
      fovDeg: 50,
      aspect: 1.6,
      padding: 1.1,
      axisAngleSampleCount: 37,
      phaseSampleCount: 72,
    });

    const sampleA = computeOrbitFitDistance({
      boundingBox,
      target: new THREE.Vector3(0, 0, 0),
      axis: 'y',
      axisAngleDeg: 20,
      phaseDeg: 0,
      fovDeg: 50,
      aspect: 1.6,
      padding: 1.1,
    });

    const sampleB = computeOrbitFitDistance({
      boundingBox,
      target: new THREE.Vector3(0, 0, 0),
      axis: 'y',
      axisAngleDeg: 90,
      phaseDeg: 120,
      fovDeg: 50,
      aspect: 1.6,
      padding: 1.1,
    });

    const sampleC = computeOrbitFitDistance({
      boundingBox,
      target: new THREE.Vector3(0, 0, 0),
      axis: 'y',
      axisAngleDeg: 150,
      phaseDeg: 270,
      fovDeg: 50,
      aspect: 1.6,
      padding: 1.1,
    });

    expect(envelope).toBeGreaterThanOrEqual(sampleA);
    expect(envelope).toBeGreaterThanOrEqual(sampleB);
    expect(envelope).toBeGreaterThanOrEqual(sampleC);
  });
});
