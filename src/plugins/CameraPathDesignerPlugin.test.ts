import { beforeEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { CameraPathDesignerPlugin } from './CameraPathDesignerPlugin';
import { PluginContext } from '../core/PluginSystem';

function createContext(): PluginContext {
  return {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(75, 1, 0.1, 1000),
    renderer: {
      domElement: document.createElement('canvas'),
    } as THREE.WebGLRenderer,
    container: document.createElement('div'),
  };
}

describe('CameraPathDesignerPlugin', () => {
  let plugin: CameraPathDesignerPlugin;

  beforeEach(() => {
    plugin = new CameraPathDesignerPlugin();
    plugin.initialize(createContext());
  });

  it('should create one segment when adding second point', () => {
    plugin.addPoint(new THREE.Vector3(0, 0, 0));
    plugin.addPoint(new THREE.Vector3(10, 0, 0));

    const segments = plugin.getSegments();
    expect(segments).toHaveLength(1);
    expect(segments[0]?.duration).toBeCloseTo(2.0, 6);
  });

  it('should split duration and keep overrides when inserting point', () => {
    plugin.setPathPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(10, 0, 0),
    ]);
    plugin.setSegments([
      {
        duration: 4,
        interpolation: { mode: 'override', value: 'linear' },
        easing: { mode: 'override', value: { type: 'smoothstep', strength: 0.8 } },
      },
    ]);

    plugin.insertPointAfter(0);

    const segments = plugin.getSegments();
    expect(segments).toHaveLength(2);
    expect(segments[0]?.duration).toBeCloseTo(2, 6);
    expect(segments[1]?.duration).toBeCloseTo(2, 6);
    expect(segments[0]?.interpolation).toEqual({ mode: 'override', value: 'linear' });
    expect(segments[1]?.interpolation).toEqual({ mode: 'override', value: 'linear' });
  });

  it('should merge adjacent durations when removing middle point', () => {
    plugin.setPathPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(5, 0, 0),
      new THREE.Vector3(10, 0, 0),
    ]);
    plugin.setSegments([
      {
        duration: 1.5,
        interpolation: { mode: 'override', value: 'linear' },
        easing: { mode: 'inherit' },
      },
      {
        duration: 2.5,
        interpolation: { mode: 'override', value: 'curve' },
        easing: { mode: 'override', value: { type: 'linear' } },
      },
    ]);

    plugin.removePoint(1);

    const segments = plugin.getSegments();
    expect(segments).toHaveLength(1);
    expect(segments[0]?.duration).toBeCloseTo(4.0, 6);
    expect(segments[0]?.interpolation).toEqual({ mode: 'override', value: 'linear' });
  });

  it('should import legacy shot and backfill segments/defaults', () => {
    plugin.importShot({
      duration: 6,
      loop: true,
      easeInOut: 0.4,
      pathPoints: [
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 0, z: 0 },
        { x: 20, y: 5, z: 0 },
      ],
    });

    const defaults = plugin.getDefaults();
    const segments = plugin.getSegments();

    expect(defaults.interpolation).toBe('curve');
    expect(defaults.easing.type).toBe('smoothstep');
    if (defaults.easing.type === 'smoothstep') {
      expect(defaults.easing.strength).toBeCloseTo(0.4, 6);
    }

    expect(segments).toHaveLength(2);
    expect(segments[0]?.duration).toBeCloseTo(3, 6);
    expect(segments[1]?.duration).toBeCloseTo(3, 6);
    expect(segments[0]?.interpolation).toEqual({ mode: 'inherit' });
    expect(segments[0]?.easing).toEqual({ mode: 'inherit' });
  });
});

