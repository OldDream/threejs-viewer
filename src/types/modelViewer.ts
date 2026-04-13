import type React from 'react';
import type { CameraAxisOrbitScript, OrbitAxis } from '../camera/CameraAxisOrbit';
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
   * 基于当前模型包围盒，计算一个“首次载入安全距离”。
   *
   * 该距离会对整组 orbit 姿态取保守上界，
   * 目标是让 phase / axisAngle 调整时都不再出现忽远忽近。
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

/**
 * 面向第三方业务的高层轨道组件参数。
 *
 * 它只暴露当前确认允许外部调节的那一组参数：
 * - 轨道轴
 * - 与旋转轴夹角
 * - 初始相位
 * - 是否自动旋转
 * - 旋转速度
 * - fit 留白系数
 *
 * 距离策略被固定为 fit，避免第三方接入时引入额外的策略分支。
 */
export interface OrbitModelViewerProps extends Omit<ModelViewerProps, 'cameraScript'> {
  orbitAxis?: OrbitAxis;
  axisAngleDeg?: number;
  initialPhaseDeg?: number;
  autoRotate?: boolean;
  rotationSpeedDegPerSec?: number;
  fitPadding?: number;
}
