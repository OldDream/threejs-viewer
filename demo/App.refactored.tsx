import React, { useRef, useCallback, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import {
  applyCameraViewPreset,
  exportCameraViewPreset,
  parseCameraViewPreset,
  type IOrbitControlsPlugin,
  ThreeViewerHandle,
  ViewerCore,
} from '../src';

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
import { ModelAnimationControl } from './components/controls/ModelAnimationControl';
import { CameraPathDesignerControl } from './components/controls/CameraPathDesignerControl';
import { CameraViewPresetControl } from './components/controls/CameraViewPresetControl';
import { StatusDisplay } from './components/controls/StatusDisplay';
import { ControlsInstructions } from './components/controls/ControlsInstructions';
import { CameraPathEditorPanel } from './components/panels/CameraPathEditorPanel';
import { CameraPathEditorFloatingWindow } from './components/panels/CameraPathEditorFloatingWindow';
import { CameraViewPresetModal } from './components/panels/CameraViewPresetModal';
import { Demo2 } from './pages/Demo2';

// Hooks
import { useModelLoader } from './hooks/useModelLoader';
import { usePivotControl } from './hooks/usePivotControl';
import { useZoomControl } from './hooks/useZoomControl';
import { useGridControl } from './hooks/useGridControl';
import { useCameraMovement } from './hooks/useCameraMovement';
import { useCameraAnimation } from './hooks/useCameraAnimation';
import { useCameraPathDesigner } from './hooks/useCameraPathDesigner';
import { useModelAnimation } from './hooks/useModelAnimation';

// Styles
import { styles as themeStyles, colors, typography } from './styles/theme';

// CSS keyframes for spinner animation
const spinnerKeyframes = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const styles = {
  viewerColumn: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  } as React.CSSProperties,

  viewerArea: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
  } as React.CSSProperties,

  dockWrapper: {
    position: 'relative',
    borderTop: `1px solid ${colors.border.primary}`,
    backgroundColor: colors.background.primary,
  } as React.CSSProperties,

  dockResizeHandle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    cursor: 'ns-resize',
    zIndex: 10,
    background: 'transparent',
  } as React.CSSProperties,
};

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
const Demo1: React.FC = () => {
  const viewerRef = useRef<ThreeViewerHandle>(null);
  const viewerCoreRef = useRef<ViewerCore | null>(null);
  const [cameraMode, setCameraMode] = useState<CameraFeatureMode>('animation');
  const [viewerCoreRevision, setViewerCoreRevision] = useState(0);
  const [isViewPresetOpen, setIsViewPresetOpen] = useState(false);
  const [viewPresetJson, setViewPresetJson] = useState('');
  const pivotSyncRafRef = useRef<number | null>(null);
  const pendingPivotRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const lastSyncedPivotRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const lockedPivotRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const dockResizeStateRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const dockResizeCleanupRef = useRef<(() => void) | null>(null);

  // Business logic hooks
  const modelLoader = useModelLoader();
  const pivotControl = usePivotControl();
  const zoomControl = useZoomControl();
  const gridControl = useGridControl();
  const modelAnimation = useModelAnimation(viewerRef, modelLoader.loadResult);
  const cameraAnimation = useCameraAnimation(viewerRef, modelLoader.loadResult);
  const cameraPathDesigner = useCameraPathDesigner(viewerRef, modelLoader.loadResult);
  const isCameraLocked = cameraAnimation.isAnimating || cameraPathDesigner.isPlaying;
	  const cameraMovement = useCameraMovement(viewerRef, isCameraLocked);

  const modelRadius = useMemo(() => {
    const loadResult = modelLoader.loadResult;
    if (!loadResult) return undefined;
    const sphere = new THREE.Sphere();
    loadResult.boundingBox.getBoundingSphere(sphere);
    return sphere.radius > 0 ? sphere.radius : undefined;
  }, [modelLoader.loadResult]);

	  const compactHeaderButton: React.CSSProperties = {
	    ...themeStyles.buttonSecondary,
	    width: 'auto',
	    padding: '6px 10px',
	    fontSize: typography.fontSize.xs,
	    borderRadius: '6px',
	    whiteSpace: 'nowrap',
	  };

  const handleDockResizeStart = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!cameraPathDesigner.panelState.isDocked) return;
    event.preventDefault();
    event.stopPropagation();

    dockResizeCleanupRef.current?.();
    dockResizeCleanupRef.current = null;

    dockResizeStateRef.current = {
      startY: event.clientY,
      startHeight: cameraPathDesigner.panelState.dockHeight,
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      const state = dockResizeStateRef.current;
      if (!state) return;
      const deltaY = moveEvent.clientY - state.startY;
      cameraPathDesigner.setDockHeight(state.startHeight - deltaY);
    };

    const onMouseUp = () => {
      dockResizeCleanupRef.current?.();
    };

    dockResizeCleanupRef.current = () => {
      dockResizeStateRef.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dockResizeCleanupRef.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [cameraPathDesigner]);

  useEffect(() => {
    const shouldAllowDockResize = cameraMode === 'designer'
      && cameraPathDesigner.panelState.isOpen
      && cameraPathDesigner.panelState.isDocked;
    if (!shouldAllowDockResize) {
      dockResizeCleanupRef.current?.();
    }
  }, [cameraMode, cameraPathDesigner.panelState.isDocked, cameraPathDesigner.panelState.isOpen]);

  useEffect(() => {
    return () => {
      dockResizeCleanupRef.current?.();
      dockResizeCleanupRef.current = null;
    };
  }, []);

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
    modelAnimation.onViewerReady(viewerCore);
    if (cameraMode === 'animation') {
      cameraAnimation.onViewerReady(viewerCore);
    } else {
      cameraPathDesigner.onViewerReady(viewerCore);
    }
  }, [
    cameraAnimation.onViewerReady,
    cameraMode,
    cameraMovement.onViewerReady,
    modelAnimation.onViewerReady,
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

  const handleExportViewPreset = useCallback(() => {
    const viewerCore = viewerCoreRef.current;
    if (!viewerCore) return;

    const orbitControls = viewerCore.plugins.get<IOrbitControlsPlugin>('OrbitControlsPlugin')?.controls;
    const viewer = orbitControls
      ? { camera: viewerCore.camera.camera, orbitControls }
      : { camera: viewerCore.camera.camera };
    const options = {
      ...(modelRadius ? { modelRadius } : {}),
      radiusMode: 'absolute' as const,
      targetMode: 'world' as const,
    };
    const preset = exportCameraViewPreset(viewer, options);
    setViewPresetJson(JSON.stringify(preset, null, 2));
  }, [modelRadius]);

  const handleApplyViewPreset = useCallback(() => {
    const viewerCore = viewerCoreRef.current;
    if (!viewerCore) return;

    try {
      const preset = parseCameraViewPreset(viewPresetJson);
      const orbitControls = viewerCore.plugins.get<IOrbitControlsPlugin>('OrbitControlsPlugin')?.controls;
      const viewer = orbitControls
        ? { camera: viewerCore.camera.camera, orbitControls }
        : { camera: viewerCore.camera.camera };
      const options = {
        ...(modelLoader.loadResult ? { modelCenter: modelLoader.loadResult.center } : {}),
        ...(modelRadius ? { modelRadius } : {}),
      };
      applyCameraViewPreset(viewer, preset, options);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      window.alert(message);
    }
  }, [modelLoader.loadResult, modelRadius, viewPresetJson]);

  return (
    <DemoLayout>
      <style>{spinnerKeyframes}</style>

      <CameraViewPresetModal
        isOpen={isViewPresetOpen}
        onClose={() => setIsViewPresetOpen(false)}
        json={viewPresetJson}
        onChangeJson={setViewPresetJson}
        onExportFromCamera={handleExportViewPreset}
        onApplyToCamera={handleApplyViewPreset}
      />
      
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

          <ModelAnimationControl
            autoPlay={modelAnimation.autoPlay}
            hasAnimations={modelAnimation.hasAnimations}
            clipCount={modelAnimation.clipCount}
            onToggleAutoPlay={modelAnimation.toggleAutoPlay}
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
              loop={cameraPathDesigner.loop}
              panelOpen={cameraPathDesigner.panelState.isOpen}
              pointCount={cameraPathDesigner.pointCount}
              isPickTargetArmed={cameraPathDesigner.isPickTargetArmed}
              onTogglePanel={cameraPathDesigner.toggleOpen}
              onToggleEditing={cameraPathDesigner.toggleEditing}
              onPlay={cameraPathDesigner.play}
              onStop={cameraPathDesigner.stop}
              onToggleLoop={cameraPathDesigner.setLoop}
              onAddPoint={cameraPathDesigner.addPoint}
              onSetTargetToCenter={cameraPathDesigner.setTargetToCenter}
              onPickTargetOnce={cameraPathDesigner.pickTargetOnce}
            />
          )}

          <CameraViewPresetControl onOpen={() => setIsViewPresetOpen(true)} />

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

        <div style={styles.viewerColumn}>
          <div style={styles.viewerArea}>
            <DemoViewer
              ref={viewerRef}
              {...(modelLoader.modelUrl ? { modelUrl: modelLoader.modelUrl } : {})}
              {...(pivotControl.pivotPoint ? { pivotPoint: pivotControl.pivotPoint } : {})}
              {...(zoomControl.zoomLimits ? { zoomLimits: zoomControl.zoomLimits } : {})}
              grid={gridControl.gridConfig}
              onLoad={modelLoader.handleLoadSuccess}
              onError={modelLoader.handleLoadError}
              onLoadingChange={modelLoader.handleLoadingChange}
              onViewerReady={handleViewerReady}
            />
          </div>

          {cameraMode === 'designer' && cameraPathDesigner.panelState.isOpen && cameraPathDesigner.panelState.isDocked ? (
            <div
              style={{
                ...styles.dockWrapper,
                height: `${cameraPathDesigner.panelState.dockHeight}px`,
              }}
            >
              <div style={styles.dockResizeHandle} onMouseDown={handleDockResizeStart} />
              <CameraPathEditorPanel
                isEditing={cameraPathDesigner.isEditing}
                isPlaying={cameraPathDesigner.isPlaying}
                loop={cameraPathDesigner.loop}
                points={cameraPathDesigner.points}
                pointCount={cameraPathDesigner.pointCount}
                selectedIndex={cameraPathDesigner.selectedIndex}
                isPickTargetArmed={cameraPathDesigner.isPickTargetArmed}
                segments={cameraPathDesigner.segments}
                defaults={cameraPathDesigner.defaults}
                selectedSegmentIndex={cameraPathDesigner.selectedSegmentIndex}
                shotJson={cameraPathDesigner.shotJson}
                timelineZoom={cameraPathDesigner.panelState.timelineZoom}
                timelineSnap={cameraPathDesigner.panelState.timelineSnap}
                onToggleEditing={cameraPathDesigner.toggleEditing}
                onPlay={cameraPathDesigner.play}
                onStop={cameraPathDesigner.stop}
                onToggleLoop={cameraPathDesigner.setLoop}
                onAddPoint={cameraPathDesigner.addPoint}
                onInsertPoint={cameraPathDesigner.insertPoint}
                onDeletePoint={cameraPathDesigner.deletePoint}
                onClearPath={cameraPathDesigner.clearPath}
                onSelectPoint={cameraPathDesigner.selectPoint}
                onSetTargetToCenter={cameraPathDesigner.setTargetToCenter}
                onPickTargetOnce={cameraPathDesigner.pickTargetOnce}
                onSelectSegment={(index) => cameraPathDesigner.setSelectedSegment(index)}
                onSetDefaultInterpolation={cameraPathDesigner.setDefaultInterpolation}
                onSetDefaultEasing={cameraPathDesigner.setDefaultEasing}
                onApplyDefaultsToAllSegments={cameraPathDesigner.applyDefaultsToAllSegments}
                onSetSegmentDuration={cameraPathDesigner.setSegmentDuration}
                onSetAdjacentSegmentDurations={cameraPathDesigner.setAdjacentSegmentDurations}
                onSetSegmentInterpolation={cameraPathDesigner.setSegmentInterpolation}
                onSetSegmentEasing={cameraPathDesigner.setSegmentEasing}
                onChangeShotJson={cameraPathDesigner.setShotJson}
                onExportShot={cameraPathDesigner.exportShot}
                onImportShot={cameraPathDesigner.importShot}
                onChangeTimelineZoom={cameraPathDesigner.setTimelineZoom}
                onChangeTimelineSnap={cameraPathDesigner.setTimelineSnap}
	                headerActions={(
	                  <>
	                    <button type="button" onClick={cameraPathDesigner.toggleDocked} style={compactHeaderButton}>
	                      Float
	                    </button>
	                    <button type="button" onClick={() => cameraPathDesigner.setOpen(false)} style={compactHeaderButton}>
	                      Close
	                    </button>
	                  </>
	                )}
	              />
            </div>
          ) : null}
        </div>
      </DemoMain>

      {cameraMode === 'designer' && cameraPathDesigner.panelState.isOpen && !cameraPathDesigner.panelState.isDocked ? (
        <CameraPathEditorFloatingWindow
          rect={cameraPathDesigner.panelState.floatingRect}
          onChangeRect={cameraPathDesigner.setFloatingRect}
          onDock={() => cameraPathDesigner.setDocked(true)}
          onClose={() => cameraPathDesigner.setOpen(false)}
          isEditing={cameraPathDesigner.isEditing}
          isPlaying={cameraPathDesigner.isPlaying}
          loop={cameraPathDesigner.loop}
          points={cameraPathDesigner.points}
          pointCount={cameraPathDesigner.pointCount}
          selectedIndex={cameraPathDesigner.selectedIndex}
          isPickTargetArmed={cameraPathDesigner.isPickTargetArmed}
          segments={cameraPathDesigner.segments}
          defaults={cameraPathDesigner.defaults}
          selectedSegmentIndex={cameraPathDesigner.selectedSegmentIndex}
          shotJson={cameraPathDesigner.shotJson}
          timelineZoom={cameraPathDesigner.panelState.timelineZoom}
          timelineSnap={cameraPathDesigner.panelState.timelineSnap}
          onToggleEditing={cameraPathDesigner.toggleEditing}
          onPlay={cameraPathDesigner.play}
          onStop={cameraPathDesigner.stop}
          onToggleLoop={cameraPathDesigner.setLoop}
          onAddPoint={cameraPathDesigner.addPoint}
          onInsertPoint={cameraPathDesigner.insertPoint}
          onDeletePoint={cameraPathDesigner.deletePoint}
          onClearPath={cameraPathDesigner.clearPath}
          onSelectPoint={cameraPathDesigner.selectPoint}
          onSetTargetToCenter={cameraPathDesigner.setTargetToCenter}
          onPickTargetOnce={cameraPathDesigner.pickTargetOnce}
          onSelectSegment={(index) => cameraPathDesigner.setSelectedSegment(index)}
          onSetDefaultInterpolation={cameraPathDesigner.setDefaultInterpolation}
          onSetDefaultEasing={cameraPathDesigner.setDefaultEasing}
          onApplyDefaultsToAllSegments={cameraPathDesigner.applyDefaultsToAllSegments}
          onSetSegmentDuration={cameraPathDesigner.setSegmentDuration}
          onSetAdjacentSegmentDurations={cameraPathDesigner.setAdjacentSegmentDurations}
          onSetSegmentInterpolation={cameraPathDesigner.setSegmentInterpolation}
          onSetSegmentEasing={cameraPathDesigner.setSegmentEasing}
          onChangeShotJson={cameraPathDesigner.setShotJson}
          onExportShot={cameraPathDesigner.exportShot}
          onImportShot={cameraPathDesigner.importShot}
          onChangeTimelineZoom={cameraPathDesigner.setTimelineZoom}
          onChangeTimelineSnap={cameraPathDesigner.setTimelineSnap}
        />
      ) : null}
    </DemoLayout>
  );
};

type DemoRoute = 'demo1' | 'demo2';

function resolveRouteFromHash(hash: string): DemoRoute {
  if (hash.startsWith('#/demo2')) return 'demo2';
  return 'demo1';
}

const App: React.FC = () => {
  const [route, setRoute] = useState<DemoRoute>(() => resolveRouteFromHash(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => setRoute(resolveRouteFromHash(window.location.hash));
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return route === 'demo2' ? <Demo2 /> : <Demo1 />;
};

export default App;
