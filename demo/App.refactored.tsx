import React, { useRef, useCallback } from 'react';
import { ThreeViewerHandle, ViewerCore } from '../src';

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
import { CameraMovementControl } from './components/controls/CameraMovementControl';
import { CameraPathDesignerControl } from './components/controls/CameraPathDesignerControl';
import { StatusDisplay } from './components/controls/StatusDisplay';
import { ControlsInstructions } from './components/controls/ControlsInstructions';

// Hooks
import { useModelLoader } from './hooks/useModelLoader';
import { usePivotControl } from './hooks/usePivotControl';
import { useZoomControl } from './hooks/useZoomControl';
import { useGridControl } from './hooks/useGridControl';
import { useCameraMovement } from './hooks/useCameraMovement';
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

  // Business logic hooks
  const modelLoader = useModelLoader();
  const pivotControl = usePivotControl();
  const zoomControl = useZoomControl();
  const gridControl = useGridControl();
  const cameraPathDesigner = useCameraPathDesigner(viewerRef, modelLoader.loadResult);
  const cameraMovement = useCameraMovement(viewerRef, cameraPathDesigner.isPlaying);

  const handleViewerReady = useCallback((viewerCore: ViewerCore) => {
    cameraPathDesigner.onViewerReady(viewerCore);
    cameraMovement.onViewerReady(viewerCore);
  }, [cameraMovement.onViewerReady, cameraPathDesigner.onViewerReady]);

  // Reset handler
  const handleReset = () => {
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

          <CameraMovementControl
            enabled={cameraMovement.enabled}
            speed={cameraMovement.speed}
            isCSMode={cameraMovement.isCSMode}
            isAnimating={cameraPathDesigner.isPlaying}
            onToggleEnabled={cameraMovement.setEnabled}
            onChangeSpeed={cameraMovement.setSpeed}
            onToggleCSMode={cameraMovement.setIsCSMode}
          />

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
