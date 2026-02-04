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
  OrbitControlsPlugin,
  type IOrbitControlsPlugin,
  type OrbitControlsConfig
} from './plugins/OrbitControlsPlugin';

// React Component exports
export {
  ThreeViewer,
  type ThreeViewerProps,
  type ZoomLimits
} from './components/ThreeViewer';

// Instance Access API exports
export { useThreeInstance } from './hooks/useThreeInstance';
export type { 
  ThreeInstanceContextValue, 
  ThreeViewerHandle 
} from './types/instance';
