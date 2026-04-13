import type React from 'react';
import type { CameraAxisOrbitScript } from '../camera/CameraAxisOrbit';
import type { CameraShot } from '../camera/CameraShotIO';
import type { CameraViewPreset } from '../camera/CameraViewPreset';
import type { ViewerCore } from '../core/ViewerCore';
import type { ModelLoadResult } from '../plugins/ModelLoaderPlugin';
import type { GridConfig, ZoomLimits } from '../components/ThreeViewer';
import type { ThreeViewerHandle } from './instance';

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
    }
  | {
      mode: 'orbit';
      data: string | CameraAxisOrbitScript;
    };

export interface ModelViewerHandle extends ThreeViewerHandle {
  /**
   * 获取相机到模型几何中心的当前距离。
   *
   * 这个值适合用于在外层面板中回显“当前镜头距离”，
   * 也方便用户把手动调出来的结果保存成自己的业务参数。
   */
  getCameraDistanceToModelCenter(): number | null;

  /**
   * 基于当前模型包围盒和给定轨道姿态，计算一个“首次载入安全距离”。
   *
   * 该距离的目标是：在初始姿态下让整个模型尽可能完整地落在视窗中。
   */
  getRecommendedOrbitDistance(options?: {
    axis?: 'x' | 'y' | 'z';
    axisAngleDeg?: number;
    phaseDeg?: number;
    padding?: number;
  }): number | null;
}

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
