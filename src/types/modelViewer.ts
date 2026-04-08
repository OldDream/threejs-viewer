import type React from 'react';
import type { CameraShot } from '../camera/CameraShotIO';
import type { CameraViewPreset } from '../camera/CameraViewPreset';
import type { ViewerCore } from '../core/ViewerCore';
import type { ModelLoadResult } from '../plugins/ModelLoaderPlugin';
import type { GridConfig, ZoomLimits } from '../components/ThreeViewer';

export type ModelViewerModel =
  | { type: 'url'; url: string }
  | { type: 'file'; file: File; resources?: File[] }
  | { type: 'folder'; files: File[] };

export type ModelViewerCameraScript =
  | { mode?: 'none' }
  | {
      mode: 'shot';
      data: string | CameraShot;
      loop?: boolean;
      autoPlay?: boolean;
    }
  | {
      mode: 'preset';
      data: string | CameraViewPreset;
      applyWhen?: 'immediate' | 'afterModelLoaded';
    };

export interface ModelViewerErrorContext {
  stage: 'model-source' | 'model-load' | 'camera-script';
}

export interface ModelViewerProps {
  model?: ModelViewerModel | null;
  cameraScript?: ModelViewerCameraScript;
  grid?: GridConfig;
  pivotPoint?: { x: number; y: number; z: number };
  zoomLimits?: ZoomLimits;
  backgroundColor?: number | string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: (result: ModelLoadResult) => void;
  onLoadingChange?: (loading: boolean) => void;
  onError?: (error: Error, context: ModelViewerErrorContext) => void;
  onViewerReady?: (viewerCore: ViewerCore) => void;
}
