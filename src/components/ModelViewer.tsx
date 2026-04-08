import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { CameraScriptController } from './CameraScriptController';
import { ThreeViewer } from './ThreeViewer';
import { useResolvedModel } from '../hooks/useResolvedModel';
import { initialContextValue, type ThreeViewerHandle } from '../types/instance';
import type { ModelLoadResult } from '../plugins/ModelLoaderPlugin';
import type {
  ModelViewerCameraScript,
  ModelViewerErrorContext,
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
    default:
      return { mode: 'none' as const };
  }
}

function createFallbackHandle(): ThreeViewerHandle {
  return {
    getInstances: () => initialContextValue,
    getViewerCore: () => null,
    isReady: () => false,
    isDisposed: () => false,
  };
}

export const ModelViewer = forwardRef<ThreeViewerHandle, ModelViewerProps>(function ModelViewer(
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
  const fallbackHandleRef = useRef<ThreeViewerHandle>(createFallbackHandle());
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
    }),
    []
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

  const handleLoad = (result: ModelLoadResult) => {
    setLoadResult(result);
    onLoad?.(result);
  };

  const handleViewerError = (error: Error) => {
    const context: ModelViewerErrorContext = { stage: 'model-load' };
    onError?.(error, context);
  };

  const handleCameraScriptError = (error: Error) => {
    const context: ModelViewerErrorContext = { stage: 'camera-script' };
    onError?.(error, context);
  };

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
  ModelViewerModel,
  ModelViewerProps,
} from '../types/modelViewer';
