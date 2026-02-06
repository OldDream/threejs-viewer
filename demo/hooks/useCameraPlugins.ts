import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import {
  CameraMovementPlugin,
  CameraPathAnimationPlugin,
  type CameraPathAnimationConfig,
  type ICameraMovementPlugin,
  type IOrbitControlsPlugin,
  type ModelLoadResult,
  type ThreeViewerHandle,
} from '../../src';

export function useCameraPlugins(params: {
  viewerRef: RefObject<ThreeViewerHandle | null>;
  modelUrl: string;
  enableCameraMovement: boolean;
  cameraMovementSpeed: number;
  flyMode: boolean;
  loadResult: ModelLoadResult | null;
  animationViewMode: 'target' | 'fixed' | 'path';
}) {
  const {
    viewerRef,
    modelUrl,
    enableCameraMovement,
    cameraMovementSpeed,
    flyMode,
    loadResult,
    animationViewMode,
  } = params;

  const cameraMovementPluginRef = useRef<ICameraMovementPlugin | null>(null);
  const cameraPathAnimationPluginRef = useRef<CameraPathAnimationPlugin | null>(
    null
  );

  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    const viewerCore = viewerRef.current?.getViewerCore();
    if (!viewerCore || !viewerCore.isInitialized) return;

    setIsAnimating(false);

    const movementPlugin = new CameraMovementPlugin();
    viewerCore.plugins.register(movementPlugin);
    cameraMovementPluginRef.current = movementPlugin;

    const pathPlugin = new CameraPathAnimationPlugin();
    viewerCore.plugins.register(pathPlugin);
    cameraPathAnimationPluginRef.current = pathPlugin;

    const orbitPlugin =
      viewerCore.plugins.get<IOrbitControlsPlugin>('OrbitControlsPlugin');
    if (orbitPlugin) {
      movementPlugin.setOrbitControlsTarget(orbitPlugin.controls.target);
      pathPlugin.setOrbitControlsPlugin(orbitPlugin);
    }

    return () => {
      setIsAnimating(false);

      if (cameraMovementPluginRef.current) {
        viewerCore.plugins.unregister(cameraMovementPluginRef.current.name);
        cameraMovementPluginRef.current = null;
      }
      if (cameraPathAnimationPluginRef.current) {
        viewerCore.plugins.unregister(cameraPathAnimationPluginRef.current.name);
        cameraPathAnimationPluginRef.current = null;
      }
    };
  }, [modelUrl, viewerRef]);

  useEffect(() => {
    cameraMovementPluginRef.current?.setEnabled(enableCameraMovement);
  }, [enableCameraMovement]);

  useEffect(() => {
    cameraMovementPluginRef.current?.setMoveSpeed(cameraMovementSpeed);
  }, [cameraMovementSpeed]);

  useEffect(() => {
    cameraMovementPluginRef.current?.setFlyMode(flyMode);
  }, [flyMode]);

  const stopAnimation = useCallback(() => {
    const plugin = cameraPathAnimationPluginRef.current;
    if (!plugin) return;
    plugin.stop();
    setIsAnimating(false);
  }, []);

  const toggleAnimation = useCallback(() => {
    const plugin = cameraPathAnimationPluginRef.current;
    if (!plugin) return;

    if (isAnimating) {
      plugin.stop();
      setIsAnimating(false);
      return;
    }

    const center = loadResult
      ? loadResult.center
      : new THREE.Vector3(0, 0, 0);
    const size = loadResult
      ? loadResult.boundingBox.getSize(new THREE.Vector3())
      : new THREE.Vector3(10, 10, 10);
    const maxDim = Math.max(size.x, size.y, size.z);
    const radius = maxDim * 2.0;

    const points: THREE.Vector3[] = [];
    const segmentCount = 120;

    for (let i = 0; i <= segmentCount; i++) {
      const angle = (i / segmentCount) * Math.PI * 2;
      const heightOffset = Math.sin(angle * 2) * (maxDim * 0.8);

      points.push(
        new THREE.Vector3(
          center.x + Math.cos(angle) * radius,
          center.y + heightOffset,
          center.z + Math.sin(angle) * radius
        )
      );
    }

    const config: CameraPathAnimationConfig = {
      pathPoints: points,
      duration: 15,
      loop: true,
      autoPlay: true,
    };

    if (animationViewMode === 'target') {
      config.target = center;
    } else if (animationViewMode === 'fixed') {
      config.fixedDirection = new THREE.Vector3(0, -0.5, -1).normalize();
    } else if (animationViewMode === 'path') {
      config.lookAlongPath = true;
    }

    plugin.configure(config);
    setIsAnimating(true);
  }, [animationViewMode, isAnimating, loadResult]);

  return { isAnimating, toggleAnimation, stopAnimation };
}
