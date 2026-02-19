import React from 'react';
import * as THREE from 'three';
import { render, act } from '@testing-library/react';
import { CameraScriptController } from './CameraScriptController';

function createViewerCoreStub() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
  camera.position.set(0, 0, 10);
  const renderer = { domElement: document.createElement('canvas') } as unknown as THREE.WebGLRenderer;
  const container = document.createElement('div');

  const plugins = new Map<string, any>();
  const pluginSystem = {
    has: (name: string) => plugins.has(name),
    get: <T,>(name: string) => plugins.get(name) as T | undefined,
    register: (plugin: any) => {
      if (plugins.has(plugin.name)) throw new Error('already registered');
      plugin.initialize({ scene, camera, renderer, container });
      plugins.set(plugin.name, plugin);
    },
    unregister: (name: string) => {
      const p = plugins.get(name);
      if (p) p.dispose?.();
      plugins.delete(name);
    },
  };

  const orbitControls = {
    enabled: true,
    target: new THREE.Vector3(0, 0, 0),
    update: vi.fn(),
  };

  const orbitPlugin = {
    name: 'OrbitControlsPlugin',
    controls: orbitControls,
    initialize: vi.fn(),
    dispose: vi.fn(),
    configure: vi.fn(),
    setTarget: vi.fn(),
    setZoomLimits: vi.fn(),
    reset: vi.fn(),
  };

  plugins.set(orbitPlugin.name, orbitPlugin);

  const modelLoader = {
    name: 'ModelLoaderPlugin',
    getCenter: () => new THREE.Vector3(0, 0, 0),
    getBoundingBox: () => new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1)),
  };
  plugins.set(modelLoader.name, modelLoader);

  const viewerCore = {
    camera: { camera },
    plugins: pluginSystem,
  };

  return { viewerCore, orbitControls, plugins };
}

describe('CameraScriptController', () => {
  it('switches from shot to preset and restores orbit controls', async () => {
    const { viewerCore, orbitControls } = createViewerCoreStub();

    const viewerRef = {
      current: {
        getViewerCore: () => viewerCore as any,
      },
    } as any;

    const shot = {
      version: 2,
      loop: true,
      defaults: { interpolation: 'curve', easing: { type: 'smoothstep', strength: 0.6 } },
      segments: [{ duration: 1, interpolation: { mode: 'inherit' }, easing: { mode: 'inherit' } }],
      pathPoints: [
        { x: 0, y: 0, z: 10 },
        { x: 0, y: 0, z: 9 },
      ],
      target: { x: 0, y: 0, z: 0 },
    };

    const preset = {
      version: 1,
      kind: 'orbit',
      target: { x: 0, y: 0, z: 0 },
      spherical: { radius: 5, phi: Math.PI / 2, theta: 0 },
      targetMode: 'world',
      radiusMode: 'absolute',
    };

    const { rerender } = render(
      <CameraScriptController
        viewerRef={viewerRef}
        mode="shot"
        cameraShotJson={JSON.stringify(shot)}
        autoPlay
      />
    );

    await act(async () => {});
    expect(orbitControls.enabled).toBe(false);

    rerender(
      <CameraScriptController
        viewerRef={viewerRef}
        mode="preset"
        cameraViewPresetJson={JSON.stringify(preset)}
        applyViewWhen="immediate"
      />
    );

    await act(async () => {});
    expect(orbitControls.enabled).toBe(true);
    expect(orbitControls.update).toHaveBeenCalled();
  });
});

