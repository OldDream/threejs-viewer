import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as THREE from 'three';
import { CameraPathAnimationPlugin } from './CameraPathAnimationPlugin';
import { PluginContext } from '../core/PluginSystem';
import { OrbitControlsPlugin } from './OrbitControlsPlugin';

describe('CameraPathAnimationPlugin', () => {
  let plugin: CameraPathAnimationPlugin;
  let context: PluginContext;
  let camera: THREE.PerspectiveCamera;
  
  beforeEach(() => {
    plugin = new CameraPathAnimationPlugin();
    camera = new THREE.PerspectiveCamera();
    
    context = {
      scene: new THREE.Scene(),
      camera: camera,
      renderer: {} as THREE.WebGLRenderer,
      container: document.createElement('div')
    };
    
    plugin.initialize(context);
  });

  it('should initialize correctly', () => {
    expect(plugin.name).toBe('CameraPathAnimationPlugin');
  });

  it('should configure path correctly', () => {
    const points = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(10, 0, 0),
      new THREE.Vector3(10, 0, 10)
    ];
    
    plugin.configure({
      pathPoints: points,
      duration: 5
    });
    
    // We can't access private props directly but we can verify behavior
    // If we call play(), it should start
    plugin.play();
    plugin.update(0.1);
    
    // Camera should have moved from 0,0,0
    // At t=0, it should be at first point
    expect(camera.position.x).not.toBeNaN();
  });

  it('should respect target mode', () => {
    const points = [new THREE.Vector3(0, 0, 10), new THREE.Vector3(0, 0, 0)];
    const target = new THREE.Vector3(100, 0, 0);
    
    plugin.configure({
      pathPoints: points,
      target: target
    });
    
    plugin.play();
    
    // Mock lookAt
    const lookAtSpy = vi.spyOn(camera, 'lookAt');
    plugin.update(0.1);
    
    expect(lookAtSpy).toHaveBeenCalledWith(target);
  });

  it('should respect fixed direction mode', () => {
    const points = [new THREE.Vector3(0, 0, 10), new THREE.Vector3(0, 0, 0)];
    const direction = new THREE.Vector3(0, 0, -1);
    
    plugin.configure({
      pathPoints: points,
      fixedDirection: direction
    });
    
    plugin.play();
    
    // Mock lookAt
    const lookAtSpy = vi.spyOn(camera, 'lookAt');
    plugin.update(0.1);
    
    // It should look at position + direction
    // Since position updates, we can't predict exact value easily without calc,
    // but we can ensure it was called
    expect(lookAtSpy).toHaveBeenCalled();
  });

  it('should handle OrbitControls integration', () => {
    const orbitPlugin = new OrbitControlsPlugin();
    // Mock OrbitControls
    const mockControls = {
      enabled: true,
      update: vi.fn(),
      dispose: vi.fn(),
      target: new THREE.Vector3(),
      minDistance: 0,
      maxDistance: 100
    };
    
    // We need to cast or mock private property if we want to test internal logic perfectly,
    // but here we just test if we can set it.
    
    // Mock the property on the plugin instance manually for testing
    Object.defineProperty(orbitPlugin, '_controls', {
      value: mockControls,
      writable: true
    });
    
    plugin.setOrbitControlsPlugin(orbitPlugin);
    
    plugin.configure({
      pathPoints: [new THREE.Vector3(0,0,0), new THREE.Vector3(1,1,1)]
    });
    
    // Play should disable controls
    plugin.play();
    expect(mockControls.enabled).toBe(false);
    
    // Pause should re-enable
    plugin.pause();
    expect(mockControls.enabled).toBe(true);
  });
});
