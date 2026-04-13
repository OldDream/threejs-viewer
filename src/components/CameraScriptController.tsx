import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { ThreeViewerHandle } from '../types/instance';
import type { ViewerCore } from '../core/ViewerCore';
import {
  applyAxisOrbitPose,
  getAxisOrbitPose,
  parseCameraAxisOrbitScript,
  resolveOrbitDistanceValue,
  type CameraAxisOrbitScript,
  type ResolvedCameraAxisOrbitScript,
} from '../camera/CameraAxisOrbit';
import {
  computeOrbitFitDistancePoseEnvelope,
} from '../camera/CameraFitDistance';
import { CameraPathAnimationPlugin } from '../plugins/CameraPathAnimationPlugin';
import type { IModelLoaderPlugin } from '../plugins/ModelLoaderPlugin';
import type { IOrbitControlsPlugin } from '../plugins/OrbitControlsPlugin';
import { parseCameraShot, toCameraPathAnimationConfig, type CameraShot } from '../camera/CameraShotIO';
import {
  applyCameraViewPreset,
  parseCameraViewPreset,
  type CameraViewPreset,
} from '../camera/CameraViewPreset';

export type CameraScriptMode = 'shot' | 'preset' | 'orbit' | 'none';

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

  cameraAxisOrbitJson?: string;
  cameraAxisOrbit?: CameraAxisOrbitScript;

  modelCenter?: THREE.Vector3;
  modelRadius?: number;

  onError?: (error: Error) => void;
}

function getViewerCoreFromRef(viewerRef: React.RefObject<ThreeViewerHandle | null>): ViewerCore | null {
  const handle = viewerRef.current;
  if (!handle) return null;
  return handle.getViewerCore();
}

type ParseResult<T> = { value: T | null; error: Error | null };

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
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
  cameraAxisOrbitJson,
  cameraAxisOrbit,
  modelCenter,
  modelRadius,
  onError,
}: CameraScriptControllerProps) {
  const [viewerCore, setViewerCore] = useState<ViewerCore | null>(null);
  const animationRef = useRef<CameraPathAnimationPlugin | null>(null);
  const applyPresetRafRef = useRef<number | null>(null);
  const applyOrbitRafRef = useRef<number | null>(null);
  const orbitControlsEnabledRef = useRef<boolean | null>(null);

  const shotParseResult = useMemo<ParseResult<CameraShot>>(() => {
    if (cameraShot) return { value: cameraShot, error: null };
    if (!cameraShotJson) return { value: null, error: null };
    try {
      return { value: parseCameraShot(cameraShotJson), error: null };
    } catch (error) {
      return { value: null, error: toError(error) };
    }
  }, [cameraShot, cameraShotJson]);

  const presetParseResult = useMemo<ParseResult<CameraViewPreset>>(() => {
    if (cameraViewPreset) return { value: cameraViewPreset, error: null };
    if (!cameraViewPresetJson) return { value: null, error: null };
    try {
      return { value: parseCameraViewPreset(cameraViewPresetJson), error: null };
    } catch (error) {
      return { value: null, error: toError(error) };
    }
  }, [cameraViewPreset, cameraViewPresetJson]);

  const orbitParseResult = useMemo<ParseResult<ResolvedCameraAxisOrbitScript>>(() => {
    if (cameraAxisOrbit) {
      try {
        return { value: parseCameraAxisOrbitScript(cameraAxisOrbit), error: null };
      } catch (error) {
        return { value: null, error: toError(error) };
      }
    }
    if (!cameraAxisOrbitJson) return { value: null, error: null };
    try {
      return { value: parseCameraAxisOrbitScript(cameraAxisOrbitJson), error: null };
    } catch (error) {
      return { value: null, error: toError(error) };
    }
  }, [cameraAxisOrbit, cameraAxisOrbitJson]);

  const resolvedShot = shotParseResult.value;
  const resolvedPreset = presetParseResult.value;
  const resolvedOrbit = orbitParseResult.value;

  useEffect(() => {
    if (shotParseResult.error) {
      onError?.(shotParseResult.error);
    }
  }, [onError, shotParseResult.error]);

  useEffect(() => {
    if (presetParseResult.error) {
      onError?.(presetParseResult.error);
    }
  }, [onError, presetParseResult.error]);

  useEffect(() => {
    if (orbitParseResult.error) {
      onError?.(orbitParseResult.error);
    }
  }, [onError, orbitParseResult.error]);

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
      const loopOptions = loop === undefined ? undefined : { loop };
      const config = toCameraPathAnimationConfig(resolvedShot, loopOptions);
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
    if (mode !== 'orbit') return;
    if (!resolvedOrbit) return;

    const orbitControls = viewerCore.plugins.get<IOrbitControlsPlugin>('OrbitControlsPlugin')?.controls;
    const modelLoader = viewerCore.plugins.get<IModelLoaderPlugin>('ModelLoaderPlugin');
    const camera = viewerCore.camera.camera;

    const cancelOrbitAnimation = () => {
      if (applyOrbitRafRef.current !== null) {
        window.cancelAnimationFrame(applyOrbitRafRef.current);
        applyOrbitRafRef.current = null;
      }
    };

    const restoreOrbitControls = () => {
      if (orbitControls && orbitControlsEnabledRef.current !== null) {
        orbitControls.enabled = orbitControlsEnabledRef.current;
        orbitControlsEnabledRef.current = null;
      }
    };

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

    let cachedOrbitRadiusKey: string | null = null;
    let cachedOrbitRadius: number | null = null;

    const toKeyPart = (value: number | undefined) =>
      typeof value === 'number' && Number.isFinite(value) ? value.toFixed(6) : 'na';

    const getResolvedOrbitRadius = (target: THREE.Vector3) => {
      const bbox = modelLoader?.getBoundingBox();
      const computedModelRadius = computeModelRadius();
      const padding =
        resolvedOrbit.distance.mode === 'fit' ? resolvedOrbit.distance.padding : undefined;
      const distanceKey =
        resolvedOrbit.distance.mode === 'fit'
          ? `fit:${toKeyPart(padding)}`
          : `${resolvedOrbit.distance.mode}:${toKeyPart(resolvedOrbit.distance.value)}`;
      const bboxKey = bbox
        ? [
            toKeyPart(bbox.min.x),
            toKeyPart(bbox.min.y),
            toKeyPart(bbox.min.z),
            toKeyPart(bbox.max.x),
            toKeyPart(bbox.max.y),
            toKeyPart(bbox.max.z),
          ].join(',')
        : 'bbox:na';
      const radiusKey = [
        resolvedOrbit.axis,
        distanceKey,
        toKeyPart(camera.fov),
        toKeyPart(camera.aspect),
        toKeyPart(camera.near),
        toKeyPart(target.x),
        toKeyPart(target.y),
        toKeyPart(target.z),
        toKeyPart(computedModelRadius),
        bboxKey,
      ].join('|');

      if (cachedOrbitRadiusKey === radiusKey) {
        return cachedOrbitRadius;
      }

      const computedFitDistance =
        resolvedOrbit.distance.mode === 'fit' && bbox
          ? computeOrbitFitDistancePoseEnvelope({
              boundingBox: bbox,
              target,
              axis: resolvedOrbit.axis,
              fovDeg: camera.fov,
              aspect: camera.aspect,
              ...(camera.near !== undefined ? { near: camera.near } : {}),
              ...(padding !== undefined ? { padding } : {}),
            })
          : undefined;

      cachedOrbitRadius = resolveOrbitDistanceValue(resolvedOrbit.distance, {
        ...(computedModelRadius !== undefined ? { modelRadius: computedModelRadius } : {}),
        ...(computedFitDistance !== undefined ? { fitDistance: computedFitDistance } : {}),
      });
      cachedOrbitRadiusKey = radiusKey;

      return cachedOrbitRadius;
    };

    const applyOrbitState = (phaseDeg: number) => {
      const target = computeModelCenter();
      if (!target) return false;

      // 这一步把三种距离模式统一收敛成最终半径：
      // absolute -> 直接使用
      // relativeToModelRadius -> 乘模型包围球半径
      // fit -> 对 phase 和 axisAngle 一起取包络后的最远安全距离
      const radius = getResolvedOrbitRadius(target);

      if (!(typeof radius === 'number' && Number.isFinite(radius) && radius > 0)) {
        return false;
      }

      const nextPose = getAxisOrbitPose({
        target,
        axis: resolvedOrbit.axis,
        axisAngleDeg: resolvedOrbit.axisAngleDeg,
        phaseDeg,
        radius,
      });

      applyAxisOrbitPose(
        orbitControls
          ? { camera, orbitControls }
          : { camera },
        nextPose
      );

      return true;
    };

    if (orbitControls && orbitControlsEnabledRef.current === null) {
      // orbit 模式被设计为“脚本完全接管镜头”，
      // 所以这里先记住旧状态，退出 orbit 模式时再恢复。
      orbitControlsEnabledRef.current = orbitControls.enabled;
      orbitControls.enabled = false;
    }

    if (!resolvedOrbit.autoRotate) {
      if (!applyOrbitState(resolvedOrbit.phaseDeg)) {
        const waitForModel = () => {
          if (applyOrbitState(resolvedOrbit.phaseDeg)) return;
          applyOrbitRafRef.current = window.requestAnimationFrame(waitForModel);
        };
        waitForModel();
      }

      return () => {
        cancelOrbitAnimation();
        restoreOrbitControls();
      };
    }

    let isDisposed = false;
    let lastTimestamp: number | null = null;
    let currentPhaseDeg = resolvedOrbit.phaseDeg;

    const frame = (timestamp: number) => {
      if (isDisposed) return;

      // 用时间积分而不是固定步长，
      // 这样浏览器帧率波动时相机速度依然稳定。
      if (lastTimestamp !== null) {
        const elapsedSeconds = Math.max(0, timestamp - lastTimestamp) / 1000;
        currentPhaseDeg += resolvedOrbit.speedDegPerSec * elapsedSeconds;
      }
      lastTimestamp = timestamp;

      const hasApplied = applyOrbitState(currentPhaseDeg);
      if (!hasApplied && resolvedOrbit.applyWhen === 'afterModelLoaded') {
        // 还没有模型时不报错，继续等待即可。
      }

      applyOrbitRafRef.current = window.requestAnimationFrame(frame);
    };

    if (resolvedOrbit.applyWhen === 'immediate') {
      applyOrbitState(currentPhaseDeg);
    }

    applyOrbitRafRef.current = window.requestAnimationFrame(frame);

    return () => {
      isDisposed = true;
      cancelOrbitAnimation();
      restoreOrbitControls();
    };
  }, [mode, modelCenter, modelRadius, onError, resolvedOrbit, viewerCore]);

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

  useEffect(() => {
    if (mode === 'orbit' || mode === 'preset') {
      return;
    }

    if (applyPresetRafRef.current !== null) {
      window.cancelAnimationFrame(applyPresetRafRef.current);
      applyPresetRafRef.current = null;
    }

    if (applyOrbitRafRef.current !== null) {
      window.cancelAnimationFrame(applyOrbitRafRef.current);
      applyOrbitRafRef.current = null;
    }
  }, [mode]);

  return null;
}
