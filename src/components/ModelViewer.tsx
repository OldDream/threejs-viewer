import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { parseCameraAxisOrbitScript } from '../camera/CameraAxisOrbit';
import { computeOrbitFitDistanceEnvelope } from '../camera/CameraFitDistance';
import { CameraScriptController } from './CameraScriptController';
import { ThreeViewer } from './ThreeViewer';
import { useResolvedModel } from '../hooks/useResolvedModel';
import { initialContextValue, type ThreeViewerHandle } from '../types/instance';
import type { ModelLoadResult } from '../plugins/ModelLoaderPlugin';
import type {
  ModelViewerCameraScript,
  ModelViewerErrorContext,
  ModelViewerHandle,
  ModelViewerProps,
} from '../types/modelViewer';

function toCameraScriptProps(cameraScript?: ModelViewerCameraScript) {
  switch (cameraScript?.mode) {
    case 'shot':
      return {
        mode: 'shot' as const,
        ...(cameraScript.loop !== undefined ? { loop: cameraScript.loop } : {}),
        ...(cameraScript.autoPlay !== undefined ? { autoPlay: cameraScript.autoPlay } : {}),
        ...(typeof cameraScript.data === 'string'
          ? { cameraShotJson: cameraScript.data }
          : { cameraShot: cameraScript.data }),
      };
    case 'preset':
      return {
        mode: 'preset' as const,
        ...(cameraScript.applyWhen ? { applyViewWhen: cameraScript.applyWhen } : {}),
        ...(typeof cameraScript.data === 'string'
          ? { cameraViewPresetJson: cameraScript.data }
          : { cameraViewPreset: cameraScript.data }),
      };
    case 'orbit':
      return typeof cameraScript.data === 'string'
        ? {
            mode: 'orbit' as const,
            cameraAxisOrbitJson: cameraScript.data,
          }
        : {
            mode: 'orbit' as const,
            cameraAxisOrbit: cameraScript.data,
          };
    default:
      return { mode: 'none' as const };
  }
}

function createFallbackHandle(): ModelViewerHandle {
  return {
    getInstances: () => initialContextValue,
    getViewerCore: () => null,
    isReady: () => false,
    isDisposed: () => false,
    getCameraDistanceToModelCenter: () => null,
    getRecommendedOrbitDistance: () => null,
  };
}

export const ModelViewer = forwardRef<ModelViewerHandle, ModelViewerProps>(function ModelViewer(
  {
    model,
    cameraScript,
    grid,
    pivotPoint,
    zoomLimits,
    backgroundColor,
    className,
    style,
    onLoad,
    onLoadingChange,
    onError,
    onViewerReady,
  },
  ref
) {
  const viewerRef = useRef<ThreeViewerHandle>(null);
  const fallbackHandleRef = useRef<ModelViewerHandle>(createFallbackHandle());
  const { modelUrl, isPreparing, error: resolvedModelError } = useResolvedModel(model);
  const [loadResult, setLoadResult] = useState<ModelLoadResult | null>(null);
  const [viewerLoading, setViewerLoading] = useState(Boolean(model));

  useImperativeHandle(
    ref,
    () => ({
      getInstances: () =>
        viewerRef.current?.getInstances() ?? fallbackHandleRef.current.getInstances(),
      getViewerCore: () =>
        viewerRef.current?.getViewerCore() ?? fallbackHandleRef.current.getViewerCore(),
      isReady: () => viewerRef.current?.isReady() ?? fallbackHandleRef.current.isReady(),
      isDisposed: () => viewerRef.current?.isDisposed() ?? fallbackHandleRef.current.isDisposed(),
      getCameraDistanceToModelCenter: () => {
        const instances = viewerRef.current?.getInstances();
        if (!instances?.camera || !loadResult?.center) {
          return null;
        }

        // 这个方法刻意只返回“当前画面里的事实值”，
        // 不去猜测 cameraScript 里的配置，方便业务方在任意时刻读取真实镜头距离。
        return instances.camera.position.distanceTo(loadResult.center);
      },
      getRecommendedOrbitDistance: (options) => {
        const instances = viewerRef.current?.getInstances();
        if (!instances?.camera || !loadResult) {
          return null;
        }

        const resolvedOptions = (() => {
          if (cameraScript?.mode === 'orbit') {
            try {
              const orbitConfig =
                typeof cameraScript.data === 'string'
                  ? parseCameraAxisOrbitScript(cameraScript.data)
                  : parseCameraAxisOrbitScript(cameraScript.data);

              return {
                axis: options?.axis ?? orbitConfig.axis,
                axisAngleDeg: options?.axisAngleDeg ?? orbitConfig.axisAngleDeg,
                phaseDeg: options?.phaseDeg ?? orbitConfig.phaseDeg,
                padding:
                  options?.padding
                  ?? (orbitConfig.distance.mode === 'fit' ? orbitConfig.distance.padding : 1.15),
              };
            } catch {
              return null;
            }
          }

          return {
            axis: options?.axis ?? 'y',
            axisAngleDeg: options?.axisAngleDeg ?? 60,
            phaseDeg: options?.phaseDeg ?? 45,
            padding: options?.padding ?? 1.15,
          };
        })();

        if (!resolvedOptions) {
          return null;
        }

        // 对外暴露这个方法的目的，是让首次载入时可以先算安全距离，
        // 再决定是否把它写回业务配置，避免相机初始化在模型内部。
        const padding = resolvedOptions.padding;

        return computeOrbitFitDistanceEnvelope({
          boundingBox: loadResult.boundingBox,
          target: loadResult.center,
          axis: resolvedOptions.axis,
          axisAngleDeg: resolvedOptions.axisAngleDeg,
          fovDeg: instances.camera.fov,
          aspect: instances.camera.aspect,
          ...(instances.camera.near !== undefined ? { near: instances.camera.near } : {}),
          ...(padding !== undefined ? { padding } : {}),
        });
      },
    }),
    [cameraScript, loadResult]
  );

  useEffect(() => {
    setLoadResult(null);
    setViewerLoading(Boolean(model));
  }, [model]);

  useEffect(() => {
    if (!resolvedModelError) {
      return;
    }

    onError?.(resolvedModelError, { stage: 'model-source' });
  }, [onError, resolvedModelError]);

  useEffect(() => {
    if (isPreparing || modelUrl) {
      return;
    }

    setViewerLoading(false);
  }, [isPreparing, modelUrl]);

  const modelRadius = useMemo(() => {
    if (!loadResult) {
      return undefined;
    }

    const sphere = new THREE.Sphere();
    loadResult.boundingBox.getBoundingSphere(sphere);
    return sphere.radius > 0 ? sphere.radius : undefined;
  }, [loadResult]);

  const controllerProps = toCameraScriptProps(cameraScript);
  const isLoading = isPreparing || viewerLoading;

  const handleLoad = useCallback((result: ModelLoadResult) => {
    setLoadResult(result);
    onLoad?.(result);
  }, [onLoad]);

  const handleViewerError = useCallback((error: Error) => {
    const context: ModelViewerErrorContext = { stage: 'model-load' };
    onError?.(error, context);
  }, [onError]);

  const handleCameraScriptError = useCallback((error: Error) => {
    const context: ModelViewerErrorContext = { stage: 'camera-script' };
    onError?.(error, context);
  }, [onError]);

  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  return (
    <>
      <ThreeViewer
        ref={viewerRef}
        {...(modelUrl ? { modelUrl } : {})}
        {...(pivotPoint ? { pivotPoint } : {})}
        {...(zoomLimits ? { zoomLimits } : {})}
        {...(grid ? { grid } : {})}
        {...(backgroundColor !== undefined ? { backgroundColor } : {})}
        {...(className ? { className } : {})}
        {...(style ? { style } : {})}
        onLoad={handleLoad}
        onError={handleViewerError}
        onLoadingChange={setViewerLoading}
        {...(onViewerReady ? { onViewerReady } : {})}
      />
      <CameraScriptController
        viewerRef={viewerRef}
        {...(loadResult?.center ? { modelCenter: loadResult.center } : {})}
        {...(modelRadius !== undefined ? { modelRadius } : {})}
        {...controllerProps}
        onError={handleCameraScriptError}
      />
    </>
  );
});

ModelViewer.displayName = 'ModelViewer';

export type {
  ModelViewerCameraScript,
  ModelViewerErrorContext,
  ModelViewerHandle,
  ModelViewerModel,
  ModelViewerProps,
} from '../types/modelViewer';
