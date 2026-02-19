import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { ModelAnimationPlugin } from './ModelAnimationPlugin';
import { PluginContext } from '../core/PluginSystem';

describe('ModelAnimationPlugin', () => {
  let plugin: ModelAnimationPlugin;
  let context: PluginContext;

  beforeEach(() => {
    plugin = new ModelAnimationPlugin();
    context = {
      scene: new THREE.Scene(),
      camera: new THREE.PerspectiveCamera(),
      renderer: {} as THREE.WebGLRenderer,
      container: document.createElement('div'),
    };
    plugin.initialize(context);
  });

  it('should play and advance animation', () => {
    const root = new THREE.Object3D();
    const clip = new THREE.AnimationClip('move', 1, [
      new THREE.VectorKeyframeTrack('.position', [0, 1], [0, 0, 0, 1, 0, 0]),
    ]);

    plugin.configure({ autoPlay: false });
    plugin.setSource(root, [clip]);

    plugin.play();
    plugin.update(0.5);

    expect(root.position.x).toBeGreaterThan(0);
  });

  it('should stop and reset to time 0 when resetTime is true', () => {
    const root = new THREE.Object3D();
    const clip = new THREE.AnimationClip('move', 1, [
      new THREE.VectorKeyframeTrack('.position', [0, 1], [0, 0, 0, 2, 0, 0]),
    ]);

    plugin.configure({ autoPlay: false });
    plugin.setSource(root, [clip]);

    plugin.play();
    plugin.update(0.75);
    expect(root.position.x).toBeGreaterThan(0);

    plugin.stop({ resetTime: true });
    expect(root.position.x).toBeCloseTo(0, 5);
  });
});

