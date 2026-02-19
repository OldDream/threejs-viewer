/**
 * Three.js Viewer Library
 * 
 * A modular Three.js 3D model viewer as a React component.
 * Supports GLTF model loading and orbit controls.
 */

// Core exports
export { SceneManager, type ISceneManager } from './core/SceneManager';
export { CameraManager, type ICameraManager, type CameraConfig } from './core/CameraManager';
export { RenderManager, type IRenderManager, type RenderManagerOptions } from './core/RenderManager';
export { 
  PluginSystem, 
  type IPluginSystem, 
  type Plugin, 
  type PluginContext 
} from './core/PluginSystem';
export { 
  ViewerCore, 
  type IViewerCore, 
  type ViewerCoreOptions 
} from './core/ViewerCore';

// Plugin exports
export { 
  ModelLoaderPlugin, 
  type IModelLoaderPlugin, 
  type ModelLoadResult, 
  type LoadingState 
} from './plugins/ModelLoaderPlugin';

export {
  ModelAnimationPlugin,
  type ModelAnimationConfig,
} from './plugins/ModelAnimationPlugin';

export {
  OrbitControlsPlugin,
  type IOrbitControlsPlugin,
  type OrbitControlsConfig
} from './plugins/OrbitControlsPlugin';

export {
  GridHelperPlugin,
  type IGridHelperPlugin,
  type GridHelperConfig,
  type GridPlane
} from './plugins/GridHelperPlugin';

export {
  CameraMovementPlugin,
  type ICameraMovementPlugin,
  type CameraMovementConfig
} from './plugins/CameraMovementPlugin';

export {
  CameraPathAnimationPlugin,
  type CameraPathAnimationConfig,
  type CameraPathDefaults,
  type CameraPathSegmentConfig,
  type EasingSpec,
  type InterpolationType,
  type SegmentOverride,
} from './plugins/CameraPathAnimationPlugin';

export {
  CameraPathDesignerPlugin,
  type CameraPathDesignerConfig,
  type CameraPathDesignerShot
} from './plugins/CameraPathDesignerPlugin';

// React Component exports
export {
  ThreeViewer,
  type ThreeViewerProps,
  type ZoomLimits,
  type GridConfig
} from './components/ThreeViewer';

export {
  CameraScriptController,
  type CameraScriptControllerProps,
  type CameraScriptMode,
} from './components/CameraScriptController';

export {
  parseCameraShot,
  toCameraPathAnimationConfig,
  type CameraShot,
} from './camera/CameraShotIO';

export {
  parseCameraViewPreset,
  exportCameraViewPreset,
  applyCameraViewPreset,
  type CameraViewPreset,
  type CameraViewPresetV1,
} from './camera/CameraViewPreset';

// Instance Access API exports
export { useThreeInstance } from './hooks/useThreeInstance';
export type { 
  ThreeInstanceContextValue, 
  ThreeViewerHandle 
} from './types/instance';
