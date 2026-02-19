import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { applyCameraViewPreset, exportCameraViewPreset, parseCameraViewPreset } from './CameraViewPreset';

describe('CameraViewPreset', () => {
  it('exports and applies a preset using orbit controls', () => {
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.set(10, 0, 0);

    const element = document.createElement('div');
    const controls = new OrbitControls(camera, element);
    controls.target.set(1, 2, 3);
    controls.update();

    const preset = exportCameraViewPreset({ camera, orbitControls: controls }, { radiusMode: 'absolute', targetMode: 'world' });
    const json = JSON.stringify(preset);
    const parsed = parseCameraViewPreset(json);

    camera.position.set(-5, -5, -5);
    controls.target.set(0, 0, 0);
    controls.update();

    const updateSpy = vi.spyOn(controls, 'update');
    applyCameraViewPreset({ camera, orbitControls: controls }, parsed, { modelCenter: new THREE.Vector3(0, 0, 0) });

    expect(updateSpy).toHaveBeenCalled();
    expect(controls.target.x).toBeCloseTo(1, 6);
    expect(controls.target.y).toBeCloseTo(2, 6);
    expect(controls.target.z).toBeCloseTo(3, 6);

    const dist = camera.position.distanceTo(controls.target);
    expect(dist).toBeCloseTo(preset.spherical.radius, 5);
  });
});

