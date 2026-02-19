import * as THREE from 'three';
import { parseCameraShot, toCameraPathAnimationConfig } from './CameraShotIO';

describe('CameraShotIO', () => {
  it('parses a demo shot JSON and converts to animation config', () => {
    const shot = {
      version: 2,
      loop: true,
      easeInOut: 0.25,
      defaults: {
        interpolation: 'curve',
        easing: { type: 'smoothstep', strength: 0.6 },
      },
      segments: [
        { duration: 1, interpolation: { mode: 'inherit' }, easing: { mode: 'inherit' } },
      ],
      pathPoints: [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 2, z: 3 },
      ],
      target: null,
    };

    const parsed = parseCameraShot(JSON.stringify(shot));
    expect(parsed.loop).toBe(true);
    expect(parsed.pathPoints).toHaveLength(2);

    const config = toCameraPathAnimationConfig(parsed, { loop: false });
    expect(config.loop).toBe(false);
    expect(config.pathPoints).toHaveLength(2);
    expect(config.pathPoints?.[0]).toBeInstanceOf(THREE.Vector3);
    expect(config.segments).toHaveLength(1);
  });
});

