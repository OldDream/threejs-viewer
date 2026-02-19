import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { ThreeViewerHandle } from '../types/instance';
import type { ViewerCore } from '../core/ViewerCore';
import { CameraPathAnimationPlugin } from '../plugins/CameraPathAnimationPlugin';
import type { IModelLoaderPlugin } from '../plugins/ModelLoaderPlugin';
import type { IOrbitControlsPlugin } from '../plugins/OrbitControlsPlugin';
import { parseCameraShot, toCameraPathAnimationConfig, type CameraShot } from '../camera/CameraShotIO';
import {
  applyCameraViewPreset,
  parseCameraViewPreset,
  type CameraViewPreset,
} from '../camera/CameraViewPreset';

export type CameraScriptMode = 'shot' | 'preset' | 'none';

export interface CameraScriptControllerProps {
  viewerRef: React.RefObject<ThreeViewerHandle | null>;
  mode?: CameraScriptMode;

  cameraShotJson?: string;
  cameraShot?: CameraShot;
  loop?: boolean;
  autoPlay?: boolean;

  cameraViewPresetJson?: string;
  cameraViewPreset?: CameraViewPreset;
  applyViewWhen?: 'immediate' | 'afterModelLoaded';

  modelCenter?: THREE.Vector3;
  modelRadius?: number;

  onError?: (error: Error) => void;
}

function getViewerCoreFromRef(viewerRef: React.RefObject<ThreeViewerHandle | null>): ViewerCore | null {
  const handle = viewerRef.current;
  if (!handle) return null;
  return handle.getViewerCore();
}

export function CameraScriptController({
  viewerRef,
  mode = 'none',
  cameraShotJson,
  cameraShot,
  loop,
  autoPlay = true,
  cameraViewPresetJson,
  cameraViewPreset,
  applyViewWhen = 'afterModelLoaded',
  modelCenter,
  modelRadius,
  onError,
}: CameraScriptControllerProps) {
  const [viewerCore, setViewerCore] = useState<ViewerCore | null>(null);
  const animationRef = useRef<CameraPathAnimationPlugin | null>(null);
  const applyPresetRafRef = useRef<number | null>(null);

  const resolvedShot = useMemo(() => {
    if (cameraShot) return cameraShot;
    if (!cameraShotJson) return null;
    return parseCameraShot(cameraShotJson);
  }, [cameraShot, cameraShotJson]);

  const resolvedPreset = useMemo(() => {
    if (cameraViewPreset) return cameraViewPreset;
    if (!cameraViewPresetJson) return null;
    return parseCameraViewPreset(cameraViewPresetJson);
  }, [cameraViewPreset, cameraViewPresetJson]);

  useEffect(() => {
    let disposed = false;
    let raf = 0;

    const tick = () => {
      if (disposed) return;
      const vc = getViewerCoreFromRef(viewerRef);
      if (vc) {
        setViewerCore(vc);
        return;
      }
      raf = window.requestAnimationFrame(tick);
    };

    tick();
    return () => {
      disposed = true;
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [viewerRef]);

  useEffect(() => {
    if (!viewerCore) return;

    const existing = viewerCore.plugins.get<CameraPathAnimationPlugin>('CameraPathAnimationPlugin');
    if (existing) {
      animationRef.current = existing;
      return;
    }

    const plugin = new CameraPathAnimationPlugin();
    try {
      viewerCore.plugins.register(plugin);
      animationRef.current = plugin;
    } catch {
      const fallback = viewerCore.plugins.get<CameraPathAnimationPlugin>('CameraPathAnimationPlugin');
      animationRef.current = fallback ?? null;
    }
  }, [viewerCore]);

  useEffect(() => {
    if (!viewerCore) return;
    const animation = animationRef.current;
    if (!animation) return;

    const orbit = viewerCore.plugins.get<IOrbitControlsPlugin>('OrbitControlsPlugin');
    if (orbit) {
      animation.setOrbitControlsPlugin(orbit);
    }
  }, [viewerCore]);

  useEffect(() => {
    if (!viewerCore) return;
    const animation = animationRef.current;
    if (!animation) return;

    if (mode !== 'shot') {
      animation.stop();
    }
  }, [mode, viewerCore]);

  useEffect(() => {
    if (!viewerCore) return;
    const animation = animationRef.current;
    if (!animation) return;
    if (mode !== 'shot') return;
    if (!resolvedShot) return;

    try {
      const config = toCameraPathAnimationConfig(resolvedShot, { loop });
      animation.configure({
        ...config,
        autoPlay,
      });
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }, [autoPlay, loop, mode, onError, resolvedShot, viewerCore]);

  useEffect(() => {
    if (!viewerCore) return;
    if (mode !== 'preset') return;
    if (!resolvedPreset) return;

    const orbitControls = viewerCore.plugins.get<IOrbitControlsPlugin>('OrbitControlsPlugin')?.controls;
    const modelLoader = viewerCore.plugins.get<IModelLoaderPlugin>('ModelLoaderPlugin');

    const computeModelCenter = () => {
      if (modelCenter) return modelCenter.clone();
      return modelLoader?.getCenter() ?? null;
    };

    const computeModelRadius = () => {
      if (typeof modelRadius === 'number' && Number.isFinite(modelRadius) && modelRadius > 0) return modelRadius;
      const bbox = modelLoader?.getBoundingBox();
      if (!bbox) return undefined;
      const sphere = new THREE.Sphere();
      bbox.getBoundingSphere(sphere);
      return sphere.radius > 0 ? sphere.radius : undefined;
    };

    const applyOnce = () => {
      try {
        const center = computeModelCenter();
        const radius = computeModelRadius();
        const viewer = orbitControls
          ? { camera: viewerCore.camera.camera, orbitControls }
          : { camera: viewerCore.camera.camera };
        const options = {
          ...(center ? { modelCenter: center } : {}),
          ...(radius ? { modelRadius: radius } : {}),
        };
        applyCameraViewPreset(viewer, resolvedPreset, options);
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error(String(error)));
      }
    };

    if (applyViewWhen === 'immediate') {
      applyOnce();
      return;
    }

    if (applyPresetRafRef.current !== null) {
      window.cancelAnimationFrame(applyPresetRafRef.current);
      applyPresetRafRef.current = null;
    }

    let disposed = false;
    const tick = () => {
      if (disposed) return;
      const center = computeModelCenter();
      if (center) {
        applyOnce();
        return;
      }
      applyPresetRafRef.current = window.requestAnimationFrame(tick);
    };

    tick();

    return () => {
      disposed = true;
      if (applyPresetRafRef.current !== null) {
        window.cancelAnimationFrame(applyPresetRafRef.current);
        applyPresetRafRef.current = null;
      }
    };
  }, [applyViewWhen, mode, modelCenter, modelRadius, onError, resolvedPreset, viewerCore]);

  return null;
}
