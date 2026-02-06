import { useCallback, useRef, useState, type FC } from 'react';
import type { ModelLoadResult, ThreeViewerHandle } from '../src';
import { DEFAULT_MODEL_URL } from './constants';
import { ControlSidebar } from './components/ControlSidebar';
import { DemoHeader } from './components/DemoHeader';
import { ViewerPane } from './components/ViewerPane';
import { useCameraPlugins } from './hooks/useCameraPlugins';
import { useGridConfig } from './hooks/useGridConfig';
import { useModelSource } from './hooks/useModelSource';
import { spinnerKeyframes, styles } from './styles';

const App: FC = () => {
  const viewerRef = useRef<ThreeViewerHandle | null>(null);

  const modelSource = useModelSource(DEFAULT_MODEL_URL);

  const [pivotPoint, setPivotPoint] = useState<
    { x: number; y: number; z: number } | undefined
  >(undefined);
  const [pivotX, setPivotX] = useState<string>('0');
  const [pivotY, setPivotY] = useState<string>('0');
  const [pivotZ, setPivotZ] = useState<string>('0');
  const [usePivotPoint, setUsePivotPoint] = useState<boolean>(false);

  const [zoomLimits, setZoomLimits] = useState<
    { min?: number; max?: number } | undefined
  >(undefined);
  const [zoomMin, setZoomMin] = useState<string>('0.1');
  const [zoomMax, setZoomMax] = useState<string>('100');
  const [useZoomLimits, setUseZoomLimits] = useState<boolean>(false);

  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showAxes, setShowAxes] = useState<boolean>(true);
  const [gridPlane, setGridPlane] = useState<'XY' | 'XZ' | 'YZ'>('XZ');
  const gridConfig = useGridConfig(showGrid, showAxes, gridPlane);

  const [enableCameraMovement, setEnableCameraMovement] =
    useState<boolean>(true);
  const [cameraMovementSpeed, setCameraMovementSpeed] =
    useState<number>(5.0);
  const [flyMode, setFlyMode] = useState<boolean>(false);

  const [animationViewMode, setAnimationViewMode] = useState<
    'target' | 'fixed' | 'path'
  >('target');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [loadResult, setLoadResult] = useState<ModelLoadResult | null>(null);

  const { isAnimating, toggleAnimation, stopAnimation } = useCameraPlugins({
    viewerRef,
    modelUrl: modelSource.modelUrl,
    enableCameraMovement,
    cameraMovementSpeed,
    flyMode,
    loadResult,
    animationViewMode,
  });

  const handleLoad = useCallback(async () => {
    setError(null);
    setLoadResult(null);

    try {
      await modelSource.handleLoad();
    } catch (err) {
      setError(err as Error);
    }
  }, [modelSource]);

  const handleLoadSuccess = useCallback(
    (result: ModelLoadResult) => {
      setLoadResult(result);
      setError(null);

      if (modelSource.isUsingLocalAssets) {
        modelSource.cleanupObjectUrlsLater(1000);
      }
    },
    [modelSource]
  );

  const handleLoadError = useCallback(
    (err: Error) => {
      setError(err);
      setLoadResult(null);

      if (modelSource.isUsingLocalAssets) {
        modelSource.cleanupObjectUrls();
      }
    },
    [modelSource]
  );

  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const handleApplyPivotPoint = useCallback(() => {
    if (usePivotPoint) {
      const x = parseFloat(pivotX) || 0;
      const y = parseFloat(pivotY) || 0;
      const z = parseFloat(pivotZ) || 0;
      setPivotPoint({ x, y, z });
      return;
    }
    setPivotPoint(undefined);
  }, [pivotX, pivotY, pivotZ, usePivotPoint]);

  const handleApplyZoomLimits = useCallback(() => {
    if (useZoomLimits) {
      const min = parseFloat(zoomMin) || 0.1;
      const max = parseFloat(zoomMax) || 100;
      setZoomLimits({ min, max });
      return;
    }
    setZoomLimits(undefined);
  }, [useZoomLimits, zoomMax, zoomMin]);

  const handleReset = useCallback(() => {
    stopAnimation();

    modelSource.reset();

    setPivotX('0');
    setPivotY('0');
    setPivotZ('0');
    setUsePivotPoint(false);
    setPivotPoint(undefined);

    setZoomMin('0.1');
    setZoomMax('100');
    setUseZoomLimits(false);
    setZoomLimits(undefined);

    setError(null);
    setLoadResult(null);
  }, [modelSource, stopAnimation]);

  return (
    <div style={styles.container}>
      <style>{spinnerKeyframes}</style>

      <DemoHeader />

      <main style={styles.main}>
        <ControlSidebar
          inputUrl={modelSource.inputUrl}
          setInputUrlFromUser={modelSource.setInputUrlFromUser}
          isLocalFile={modelSource.isLocalFile}
          selectedModelFile={modelSource.selectedModelFile}
          selectedTextureFiles={modelSource.selectedTextureFiles}
          onFolderSelect={modelSource.handleFolderSelect}
          onModelFileSelect={modelSource.handleModelFileSelect}
          onTextureFilesSelect={modelSource.handleTextureFilesSelect}
          onLoad={handleLoad}
          isLoading={isLoading}
          usePivotPoint={usePivotPoint}
          setUsePivotPoint={setUsePivotPoint}
          pivotX={pivotX}
          pivotY={pivotY}
          pivotZ={pivotZ}
          setPivotX={setPivotX}
          setPivotY={setPivotY}
          setPivotZ={setPivotZ}
          onApplyPivotPoint={handleApplyPivotPoint}
          useZoomLimits={useZoomLimits}
          setUseZoomLimits={setUseZoomLimits}
          zoomMin={zoomMin}
          zoomMax={zoomMax}
          setZoomMin={setZoomMin}
          setZoomMax={setZoomMax}
          onApplyZoomLimits={handleApplyZoomLimits}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          showAxes={showAxes}
          setShowAxes={setShowAxes}
          gridPlane={gridPlane}
          setGridPlane={setGridPlane}
          enableCameraMovement={enableCameraMovement}
          setEnableCameraMovement={setEnableCameraMovement}
          flyMode={flyMode}
          setFlyMode={setFlyMode}
          cameraMovementSpeed={cameraMovementSpeed}
          setCameraMovementSpeed={setCameraMovementSpeed}
          isAnimating={isAnimating}
          animationViewMode={animationViewMode}
          setAnimationViewMode={setAnimationViewMode}
          onToggleAnimation={toggleAnimation}
          error={error}
          loadResult={loadResult}
          modelUrl={modelSource.modelUrl}
          onReset={handleReset}
        />

        <ViewerPane
          viewerRef={viewerRef}
          modelUrl={modelSource.modelUrl}
          pivotPoint={pivotPoint}
          zoomLimits={zoomLimits}
          grid={gridConfig}
          onLoad={handleLoadSuccess}
          onError={handleLoadError}
          onLoadingChange={handleLoadingChange}
        />
      </main>
    </div>
  );
};

export default App;
