/**
 * Three.js Instance Access Type Definitions
 *
 * This module defines the types for accessing Three.js instances
 * through React Hook and Ref APIs.
 *
 * Requirements:
 * - 5.1: THE Viewer_Context interface SHALL define types for all accessible instances
 * - 5.2: THE Hook_API return type SHALL be fully typed with nullable instance types
 * - 5.3: THE Ref_API exposed methods SHALL have complete TypeScript signatures
 * - 5.4: THE Instance_Accessor SHALL export all relevant type definitions for external use
 */

import * as THREE from 'three';
import type { ViewerCore } from '../core/ViewerCore';

/**
 * Context value containing all accessible Three.js instances.
 *
 * This interface defines the shape of the context provided by ThreeInstanceProvider
 * and consumed by the useThreeInstance hook.
 *
 * All instance properties are nullable to handle:
 * - Pre-initialization state (instances not yet created)
 * - Post-disposal state (instances have been cleaned up)
 *
 * @example
 * ```tsx
 * const { scene, camera, isReady } = useThreeInstance();
 *
 * if (isReady && scene) {
 *   // Safe to use scene
 *   scene.add(new THREE.Mesh(...));
 * }
 * ```
 */
export interface ThreeInstanceContextValue {
  /** Three.js Scene 实例，未初始化时为 null */
  scene: THREE.Scene | null;

  /** Three.js PerspectiveCamera 实例，未初始化时为 null */
  camera: THREE.PerspectiveCamera | null;

  /** Three.js WebGLRenderer 实例，未初始化时为 null */
  renderer: THREE.WebGLRenderer | null;

  /** 容器 DOM 元素，未初始化时为 null */
  container: HTMLElement | null;

  /** Viewer 是否已初始化并准备就绪 */
  isReady: boolean;

  /** Viewer 是否已被销毁 */
  isDisposed: boolean;
}

/**
 * Imperative handle exposed via React ref on ThreeViewer component.
 *
 * This interface defines the methods available when using a ref
 * to access the ThreeViewer imperatively. Unlike the hook API,
 * calling these methods does not trigger re-renders.
 *
 * @example
 * ```tsx
 * const viewerRef = useRef<ThreeViewerHandle>(null);
 *
 * const handleClick = () => {
 *   if (viewerRef.current?.isReady()) {
 *     const { scene } = viewerRef.current.getInstances();
 *     // Perform operations on scene
 *   }
 * };
 *
 * return <ThreeViewer ref={viewerRef} modelUrl="model.glb" />;
 * ```
 */
export interface ThreeViewerHandle {
  /**
   * 获取所有 Three.js 实例
   *
   * Returns the current state of all Three.js instances.
   * Instance values will be null if the viewer is not initialized or has been disposed.
   *
   * @returns ThreeInstanceContextValue containing all instance references
   */
  getInstances(): ThreeInstanceContextValue;

  /**
   * 获取 ViewerCore 实例，用于高级操作
   *
   * Returns the underlying ViewerCore instance for advanced operations.
   * This provides access to the full ViewerCore API including plugin system.
   *
   * @returns ViewerCore instance or null if not initialized/disposed
   */
  getViewerCore(): ViewerCore | null;

  /**
   * 检查 Viewer 是否已准备就绪
   *
   * Returns true only when the viewer has been fully initialized
   * and is ready for use. Returns false before initialization
   * or after disposal.
   *
   * @returns boolean indicating if the viewer is ready
   */
  isReady(): boolean;

  /**
   * 检查 Viewer 是否已被销毁
   *
   * Returns true if the viewer has been disposed.
   * Once disposed, the viewer cannot be used again.
   *
   * @returns boolean indicating if the viewer has been disposed
   */
  isDisposed(): boolean;
}

/**
 * Initial context value with all instances set to null.
 *
 * This constant provides the default state for the ThreeInstanceContext
 * before the viewer is initialized.
 */
export const initialContextValue: ThreeInstanceContextValue = {
  scene: null,
  camera: null,
  renderer: null,
  container: null,
  isReady: false,
  isDisposed: false,
};
