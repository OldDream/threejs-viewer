import type { ChangeEvent } from 'react';
import type { ModelLoadResult } from '../../src';
import { styles } from '../styles';
import { ModelSourceSection } from './sections/ModelSourceSection';
import { PivotSection } from './sections/PivotSection';
import { ZoomLimitsSection } from './sections/ZoomLimitsSection';
import { GridAxesSection } from './sections/GridAxesSection';
import { CameraMovementSection } from './sections/CameraMovementSection';
import { CameraPathAnimationSection } from './sections/CameraPathAnimationSection';
import { StatusSection } from './sections/StatusSection';
import { ResetButton } from './sections/ResetButton';
import { ControlsHelpSection } from './sections/ControlsHelpSection';

export function ControlSidebar(props: {
  inputUrl: string;
  setInputUrlFromUser: (value: string) => void;
  isLocalFile: boolean;
  selectedModelFile: File | null;
  selectedTextureFiles: File[];
  onFolderSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onModelFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onTextureFilesSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onLoad: () => void;
  isLoading: boolean;

  usePivotPoint: boolean;
  setUsePivotPoint: (value: boolean) => void;
  pivotX: string;
  pivotY: string;
  pivotZ: string;
  setPivotX: (value: string) => void;
  setPivotY: (value: string) => void;
  setPivotZ: (value: string) => void;
  onApplyPivotPoint: () => void;

  useZoomLimits: boolean;
  setUseZoomLimits: (value: boolean) => void;
  zoomMin: string;
  zoomMax: string;
  setZoomMin: (value: string) => void;
  setZoomMax: (value: string) => void;
  onApplyZoomLimits: () => void;

  showGrid: boolean;
  setShowGrid: (value: boolean) => void;
  showAxes: boolean;
  setShowAxes: (value: boolean) => void;
  gridPlane: 'XY' | 'XZ' | 'YZ';
  setGridPlane: (value: 'XY' | 'XZ' | 'YZ') => void;

  enableCameraMovement: boolean;
  setEnableCameraMovement: (value: boolean) => void;
  flyMode: boolean;
  setFlyMode: (value: boolean) => void;
  cameraMovementSpeed: number;
  setCameraMovementSpeed: (value: number) => void;

  isAnimating: boolean;
  animationViewMode: 'target' | 'fixed' | 'path';
  setAnimationViewMode: (value: 'target' | 'fixed' | 'path') => void;
  onToggleAnimation: () => void;

  error: Error | null;
  loadResult: ModelLoadResult | null;
  modelUrl: string;

  onReset: () => void;
}) {
  return (
    <aside style={styles.sidebar}>
      <ModelSourceSection
        inputUrl={props.inputUrl}
        setInputUrlFromUser={props.setInputUrlFromUser}
        isLoading={props.isLoading}
        onLoad={props.onLoad}
        isLocalFile={props.isLocalFile}
        selectedModelFile={props.selectedModelFile}
        selectedTextureFiles={props.selectedTextureFiles}
        onFolderSelect={props.onFolderSelect}
        onModelFileSelect={props.onModelFileSelect}
        onTextureFilesSelect={props.onTextureFilesSelect}
      />

      <PivotSection
        usePivotPoint={props.usePivotPoint}
        setUsePivotPoint={props.setUsePivotPoint}
        pivotX={props.pivotX}
        pivotY={props.pivotY}
        pivotZ={props.pivotZ}
        setPivotX={props.setPivotX}
        setPivotY={props.setPivotY}
        setPivotZ={props.setPivotZ}
        onApply={props.onApplyPivotPoint}
      />

      <ZoomLimitsSection
        useZoomLimits={props.useZoomLimits}
        setUseZoomLimits={props.setUseZoomLimits}
        zoomMin={props.zoomMin}
        zoomMax={props.zoomMax}
        setZoomMin={props.setZoomMin}
        setZoomMax={props.setZoomMax}
        onApply={props.onApplyZoomLimits}
      />

      <GridAxesSection
        showGrid={props.showGrid}
        setShowGrid={props.setShowGrid}
        showAxes={props.showAxes}
        setShowAxes={props.setShowAxes}
        gridPlane={props.gridPlane}
        setGridPlane={props.setGridPlane}
      />

      <CameraMovementSection
        enableCameraMovement={props.enableCameraMovement}
        setEnableCameraMovement={props.setEnableCameraMovement}
        flyMode={props.flyMode}
        setFlyMode={props.setFlyMode}
        cameraMovementSpeed={props.cameraMovementSpeed}
        setCameraMovementSpeed={props.setCameraMovementSpeed}
        isAnimating={props.isAnimating}
      />

      <CameraPathAnimationSection
        isAnimating={props.isAnimating}
        animationViewMode={props.animationViewMode}
        setAnimationViewMode={props.setAnimationViewMode}
        onToggleAnimation={props.onToggleAnimation}
      />

      <StatusSection
        isLoading={props.isLoading}
        error={props.error}
        loadResult={props.loadResult}
        modelUrl={props.modelUrl}
      />

      <ResetButton onReset={props.onReset} />

      <ControlsHelpSection flyMode={props.flyMode} />
    </aside>
  );
}
