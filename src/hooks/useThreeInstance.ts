/**
 * useThreeInstance Hook
 *
 * A React Hook for accessing Three.js instances within a ThreeViewer component.
 *
 * Requirements:
 * - 2.1: THE Hook_API SHALL be exported as a custom React Hook named useThreeInstance
 * - 2.2: WHEN called within a ThreeViewer context, THE useThreeInstance Hook SHALL return the Viewer_Context object
 * - 2.3: WHEN called outside a ThreeViewer context, THE useThreeInstance Hook SHALL throw a descriptive error
 * - 2.4: WHEN the Viewer_Context changes, THE useThreeInstance Hook SHALL trigger a re-render with the new context
 * - 2.5: THE useThreeInstance Hook SHALL provide TypeScript type definitions for all returned instances
 */

import { useContext } from 'react';
import { ThreeInstanceContext } from '../context/ThreeInstanceContext';
import type { ThreeInstanceContextValue } from '../types/instance';

/**
 * 获取 Three.js 实例的 React Hook
 *
 * This hook provides access to the underlying Three.js instances (Scene, Camera,
 * Renderer, etc.) within a ThreeViewer component tree. It must be called within
 * a component that is a descendant of ThreeViewer.
 *
 * The hook automatically triggers re-renders when the context value changes,
 * such as when the viewer initializes or is disposed.
 *
 * @returns ThreeInstanceContextValue 包含所有 Three.js 实例的上下文值
 * @throws Error 如果在 ThreeViewer 组件外部调用
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { scene, camera, isReady } = useThreeInstance();
 *
 *   useEffect(() => {
 *     if (isReady && scene) {
 *       // 添加自定义对象到场景
 *       const light = new THREE.PointLight(0xffffff);
 *       scene.add(light);
 *     }
 *   }, [scene, isReady]);
 *
 *   return null;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Using with camera access
 * function CameraController() {
 *   const { camera, isReady } = useThreeInstance();
 *
 *   const resetCamera = useCallback(() => {
 *     if (isReady && camera) {
 *       camera.position.set(0, 0, 5);
 *       camera.lookAt(0, 0, 0);
 *     }
 *   }, [camera, isReady]);
 *
 *   return <button onClick={resetCamera}>Reset Camera</button>;
 * }
 * ```
 */
export function useThreeInstance(): ThreeInstanceContextValue {
  const context = useContext(ThreeInstanceContext);

  if (context === undefined) {
    throw new Error(
      'useThreeInstance must be used within a ThreeViewer component. ' +
        'Make sure your component is a child of <ThreeViewer>.'
    );
  }

  return context;
}
