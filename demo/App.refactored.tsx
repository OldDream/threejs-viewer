import React, { useRef, useCallback, useEffect, useState } from 'react';
import { type IOrbitControlsPlugin, ThreeViewerHandle, ViewerCore } from '../src';

// Layout components
import { DemoLayout, DemoMain } from './components/DemoLayout';
import { DemoHeader } from './components/DemoHeader';
import { DemoSidebar } from './components/DemoSidebar';
import { DemoViewer } from './components/DemoViewer';

// Control components
import { ModelUrlControl } from './components/controls/ModelUrlControl';
import { PivotPointControl } from './components/controls/PivotPointControl';
import { ZoomLimitsControl } from './components/controls/ZoomLimitsControl';
import { GridControl } from './components/controls/GridControl';
import { CameraModeControl, CameraFeatureMode } from './components/controls/CameraModeControl';
import { CameraMovementControl } from './components/controls/CameraMovementControl';
import { CameraAnimationControl } from './components/controls/CameraAnimationControl';
import { CameraPathDesignerControl } from './components/controls/CameraPathDesignerControl';
import { StatusDisplay } from './components/controls/StatusDisplay';
import { ControlsInstructions } from './components/controls/ControlsInstructions';

// Hooks
import { useModelLoader } from './hooks/useModelLoader';
import { usePivotControl } from './hooks/usePivotControl';
import { useZoomControl } from './hooks/useZoomControl';
import { useGridControl } from './hooks/useGridControl';
import { useCameraMovement } from './hooks/useCameraMovement';
import { useCameraAnimation } from './hooks/useCameraAnimation';
import { useCameraPathDesigner } from './hooks/useCameraPathDesigner';

// Styles
import { styles as themeStyles, colors } from './styles/theme';

// CSS keyframes for spinner animation
const spinnerKeyframes = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

/**
 * Demo Application for ThreeViewer Component
 * 
 * Refactored version with modular component architecture:
 * - Separated concerns into custom hooks
 * - Split UI into reusable components
 * - Centralized theme and styles
 * - Clear data flow with props drilling
 * 
 * Requirement 6.3: THE project SHALL include a demo application that showcases the Viewer component
 */
const App: React.FC = () => {
  const viewerRef = useRef<ThreeViewerHandle>(null);
  const viewerCoreRef = useRef<ViewerCore | null>(null);
  const [cameraMode, setCameraMode] = useState<CameraFeatureMode>('animation');
  const [viewerCoreRevision, setViewerCoreRevision] = useState(0);
  const pivotSyncRafRef = useRef<number | null>(null);
  const pendingPivotRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const lastSyncedPivotRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const lockedPivotRef = useRef<{ x: number; y: number; z: number } | null>(null);

  // Business logic hooks
  const modelLoader = useModelLoader();
  const pivotControl = usePivotControl();
  const zoomControl = useZoomControl();
  const gridControl = useGridControl();
  const cameraAnimation = useCameraAnimation(viewerRef, modelLoader.loadResult);
  const cameraPathDesigner = useCameraPathDesigner(viewerRef, modelLoader.loadResult);
  const isCameraLocked = cameraAnimation.isAnimating || cameraPathDesigner.isPlaying;
  const cameraMovement = useCameraMovement(viewerRef, isCameraLocked);

  const handleChangeCameraMode = useCallback((mode: CameraFeatureMode) => {
    if (mode === cameraMode) return;
    cameraAnimation.handleStop();
    cameraPathDesigner.stop();
    if (cameraPathDesigner.isEditing) {
      cameraPathDesigner.toggleEditing();
    }
    setCameraMode(mode);
  }, [
    cameraAnimation.handleStop,
    cameraMode,
    cameraPathDesigner.isEditing,
    cameraPathDesigner.stop,
    cameraPathDesigner.toggleEditing,
  ]);

  const handleViewerReady = useCallback((viewerCore: ViewerCore) => {
    viewerCoreRef.current = viewerCore;
    setViewerCoreRevision((v) => v + 1);
    cameraMovement.onViewerReady(viewerCore);
    if (cameraMode === 'animation') {
      cameraAnimation.onViewerReady(viewerCore);
    } else {
      cameraPathDesigner.onViewerReady(viewerCore);
    }
  }, [
    cameraAnimation.onViewerReady,
    cameraMode,
    cameraMovement.onViewerReady,
    cameraPathDesigner.onViewerReady,
  ]);

  useEffect(() => {
    const viewerCore = viewerCoreRef.current;
    if (!viewerCore) return;

    const orbitControlsPlugin = viewerCore.plugins.get<IOrbitControlsPlugin>('OrbitControlsPlugin');
    const controls = orbitControlsPlugin?.controls;
    if (!controls) return;

    const handleControlsChange = () => {
      const target = controls.target;
      const next = { x: target.x, y: target.y, z: target.z };

      if (pivotControl.usePivotPoint) {
        const lockedFromProps = pivotControl.pivotPoint
          ? { ...pivotControl.pivotPoint }
          : null;

        if (lockedFromProps) {
          lockedPivotRef.current = lockedFromProps;
        } else if (!lockedPivotRef.current) {
          lockedPivotRef.current = next;
        }

        const locked = lockedPivotRef.current;
        if (!locked) return;

        const eps = 1e-6;
        if (
          Math.abs(next.x - locked.x) > eps ||
          Math.abs(next.y - locked.y) > eps ||
          Math.abs(next.z - locked.z) > eps
        ) {
          controls.target.set(locked.x, locked.y, locked.z);
          controls.update();
        }
        return;
      }

      lockedPivotRef.current = null;
      pendingPivotRef.current = next;

      if (pivotSyncRafRef.current !== null) return;
      pivotSyncRafRef.current = window.requestAnimationFrame(() => {
        pivotSyncRafRef.current = null;
        const pending = pendingPivotRef.current;
        if (!pending) return;

        const prev = lastSyncedPivotRef.current;
        const eps = 1e-6;
        if (
          prev &&
          Math.abs(prev.x - pending.x) < eps &&
          Math.abs(prev.y - pending.y) < eps &&
          Math.abs(prev.z - pending.z) < eps
        ) {
          return;
        }

        lastSyncedPivotRef.current = pending;
        pivotControl.syncFromTarget(pending);
      });
    };

    controls.addEventListener('change', handleControlsChange);
    handleControlsChange();

    return () => {
      controls.removeEventListener('change', handleControlsChange);
      if (pivotSyncRafRef.current !== null) {
        window.cancelAnimationFrame(pivotSyncRafRef.current);
        pivotSyncRafRef.current = null;
      }
    };
  }, [
    pivotControl.pivotPoint,
    pivotControl.syncFromTarget,
    pivotControl.usePivotPoint,
    viewerCoreRevision,
  ]);

  useEffect(() => {
    const viewerCore = viewerCoreRef.current;
    if (!viewerCore) return;
    if (cameraMode === 'animation') {
      cameraAnimation.onViewerReady(viewerCore);
    } else {
      cameraPathDesigner.onViewerReady(viewerCore);
    }
  }, [cameraAnimation.onViewerReady, cameraMode, cameraPathDesigner.onViewerReady]);

  // Reset handler
  const handleReset = () => {
    cameraAnimation.handleStop();
    cameraPathDesigner.reset();
    modelLoader.handleReset();
    pivotControl.handleReset();
    zoomControl.handleReset();
    cameraMovement.handleReset();
  };

  return (
    <DemoLayout>
      <style>{spinnerKeyframes}</style>
      
      <DemoHeader />
      
      <DemoMain>
        <DemoSidebar>
          <ModelUrlControl
            inputUrl={modelLoader.inputUrl}
            isLoading={modelLoader.isLoading}
            fileState={modelLoader.fileState}
            onInputUrlChange={modelLoader.handleInputUrlChange}
            onFolderSelect={modelLoader.handleFolderSelect}
            onModelFileSelect={modelLoader.handleModelFileSelect}
            onTextureFilesSelect={modelLoader.handleTextureFilesSelect}
            onLoad={modelLoader.handleLoad}
          />

          <PivotPointControl
            pivotX={pivotControl.pivotX}
            pivotY={pivotControl.pivotY}
            pivotZ={pivotControl.pivotZ}
            usePivotPoint={pivotControl.usePivotPoint}
            onChangeX={pivotControl.setPivotX}
            onChangeY={pivotControl.setPivotY}
            onChangeZ={pivotControl.setPivotZ}
            onToggle={pivotControl.setUsePivotPoint}
            onApply={pivotControl.handleApply}
          />

          <ZoomLimitsControl
            zoomMin={zoomControl.zoomMin}
            zoomMax={zoomControl.zoomMax}
            useZoomLimits={zoomControl.useZoomLimits}
            onChangeMin={zoomControl.setZoomMin}
            onChangeMax={zoomControl.setZoomMax}
            onToggle={zoomControl.setUseZoomLimits}
            onApply={zoomControl.handleApply}
          />

          <GridControl
            showGrid={gridControl.showGrid}
            showAxes={gridControl.showAxes}
            gridPlane={gridControl.gridPlane}
            onToggleGrid={gridControl.setShowGrid}
            onToggleAxes={gridControl.setShowAxes}
            onChangePlane={gridControl.setGridPlane}
          />

          <CameraModeControl mode={cameraMode} onChangeMode={handleChangeCameraMode} />

          <CameraMovementControl
            enabled={cameraMovement.enabled}
            speed={cameraMovement.speed}
            isCSMode={cameraMovement.isCSMode}
            isAnimating={isCameraLocked}
            onToggleEnabled={cameraMovement.setEnabled}
            onChangeSpeed={cameraMovement.setSpeed}
            onToggleCSMode={cameraMovement.setIsCSMode}
          />

          {cameraMode === 'animation' ? (
            <CameraAnimationControl
              isAnimating={cameraAnimation.isAnimating}
              viewMode={cameraAnimation.viewMode}
              onToggle={cameraAnimation.handleToggle}
              onChangeViewMode={cameraAnimation.setViewMode}
            />
          ) : (
            <CameraPathDesignerControl
              isEditing={cameraPathDesigner.isEditing}
              isPlaying={cameraPathDesigner.isPlaying}
              duration={cameraPathDesigner.duration}
              loop={cameraPathDesigner.loop}
              easeInOut={cameraPathDesigner.easeInOut}
              pointCount={cameraPathDesigner.pointCount}
              selectedIndex={cameraPathDesigner.selectedIndex}
              isPickTargetArmed={cameraPathDesigner.isPickTargetArmed}
              shotJson={cameraPathDesigner.shotJson}
              onToggleEditing={cameraPathDesigner.toggleEditing}
              onAddPoint={cameraPathDesigner.addPoint}
              onInsertPoint={cameraPathDesigner.insertPoint}
              onDeletePoint={cameraPathDesigner.deletePoint}
              onClearPath={cameraPathDesigner.clearPath}
              onSetTargetToCenter={cameraPathDesigner.setTargetToCenter}
              onPickTargetOnce={cameraPathDesigner.pickTargetOnce}
              onPlay={cameraPathDesigner.play}
              onStop={cameraPathDesigner.stop}
              onExportShot={cameraPathDesigner.exportShot}
              onImportShot={cameraPathDesigner.importShot}
              onReset={cameraPathDesigner.reset}
              onChangeDuration={cameraPathDesigner.setDuration}
              onChangeLoop={cameraPathDesigner.setLoop}
              onChangeEaseInOut={cameraPathDesigner.setEaseInOut}
              onChangeShotJson={cameraPathDesigner.setShotJson}
            />
          )}

          <StatusDisplay
            isLoading={modelLoader.isLoading}
            error={modelLoader.error}
            loadResult={modelLoader.loadResult}
            modelUrl={modelLoader.modelUrl}
          />

          <button
            onClick={handleReset}
            style={{
              ...themeStyles.button,
              backgroundColor: colors.button.neutral,
            }}
          >
            Reset to Defaults
          </button>

          <ControlsInstructions isCSMode={cameraMovement.isCSMode} />
        </DemoSidebar>

        <DemoViewer
          ref={viewerRef}
          modelUrl={modelLoader.modelUrl}
          pivotPoint={pivotControl.pivotPoint}
          zoomLimits={zoomControl.zoomLimits}
          grid={gridControl.gridConfig}
          onLoad={modelLoader.handleLoadSuccess}
          onError={modelLoader.handleLoadError}
          onLoadingChange={modelLoader.handleLoadingChange}
          onViewerReady={handleViewerReady}
        />
      </DemoMain>
    </DemoLayout>
  );
};

export default App;
