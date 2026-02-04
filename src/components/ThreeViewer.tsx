import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import * as THREE from 'three';
import { ViewerCore } from '../core/ViewerCore';
import { ModelLoaderPlugin, ModelLoadResult } from '../plugins/ModelLoaderPlugin';
import { OrbitControlsPlugin } from '../plugins/OrbitControlsPlugin';
import { ThreeInstanceProvider } from '../context/ThreeInstanceProvider';
import { ThreeViewerHandle, ThreeInstanceContextValue, initialContextValue } from '../types/instance';

/**
 * Zoom limits configuration for the viewer.
 */
export interface ZoomLimits {
  min?: number;
  max?: number;
}

/**
 * Props for the ThreeViewer component.
 * 
 * Requirements:
 * - 4.5: THE Viewer component SHALL accept props for model URL, Pivot_Point configuration, and zoom limits
 * - 6.1: THE existing ThreeViewer props interface SHALL remain unchanged
 */
export interface ThreeViewerProps {
  /** URL of the GLTF/GLB model to load */
  modelUrl?: string;
  /** Custom pivot point for camera orbit controls */
  pivotPoint?: { x: number; y: number; z: number };
  /** Zoom distance limits for the camera */
  zoomLimits?: ZoomLimits;
  /** CSS class name for the container element */
  className?: string;
  /** CSS styles for the container element */
  style?: React.CSSProperties;
  /** Callback when model is loaded successfully */
  onLoad?: (result: ModelLoadResult) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Callback when loading state changes */
  onLoadingChange?: (isLoading: boolean) => void;
  /** 子组件，可以使用 useThreeInstance Hook */
  children?: React.ReactNode;
}

/**
 * ThreeViewer Component
 * 
 * A React functional component that wraps the Three.js viewer core.
 * Provides a declarative interface for 3D model viewing with orbit controls.
 * 
 * Features:
 * - Automatic initialization and cleanup of Three.js resources
 * - Responsive container with ResizeObserver
 * - Props-driven configuration updates without re-initialization
 * - Loading state and error callbacks
 * - Ref API for imperative access to Three.js instances
 * - Children support with useThreeInstance hook access
 * 
 * @param props - The component props
 * @param ref - Optional ref for imperative access to ThreeViewerHandle
 * @returns A React element containing the 3D viewer
 * 
 * Requirements:
 * - 3.1: THE ThreeViewer component SHALL accept an optional ref prop for imperative access
 * - 3.2: WHEN a ref is provided, THE ThreeViewer SHALL expose a getInstances method that returns the Viewer_Context
 * - 3.3: WHEN a ref is provided, THE ThreeViewer SHALL expose a getViewerCore method that returns the ViewerCore instance
 * - 3.4: THE Ref_API SHALL provide TypeScript type definitions for all exposed methods
 * - 3.5: WHEN the Viewer is disposed, THE ref methods SHALL return null
 * - 4.1: THE Viewer SHALL be exported as a React functional component
 * - 4.2: WHEN the component mounts, THE Viewer SHALL initialize the Three.js Scene, Camera, and Renderer
 * - 4.3: WHEN the component unmounts, THE Viewer SHALL properly dispose of all Three.js resources to prevent memory leaks
 * - 4.4: WHEN the container element resizes, THE Viewer SHALL update the Camera aspect ratio and Renderer size
 * - 4.5: THE Viewer component SHALL accept props for model URL, Pivot_Point configuration, and zoom limits
 * - 4.6: WHEN props change, THE Viewer SHALL update the corresponding settings without full re-initialization
 * - 6.1: THE existing ThreeViewer props interface SHALL remain unchanged
 * - 6.2: THE existing callback props (onLoad, onError, onLoadingChange) SHALL continue to function
 * - 6.3: THE new ref prop SHALL be optional and not affect existing usage
 */
export const ThreeViewer = forwardRef<ThreeViewerHandle, ThreeViewerProps>(
  function ThreeViewer(
    {
      modelUrl,
      pivotPoint,
      zoomLimits,
      className,
      style,
      onLoad,
      onError,
      onLoadingChange,
      children,
    },
    ref
  ) {
    // Refs for container element and ViewerCore instance
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerCoreRef = useRef<ViewerCore | null>(null);
    const modelLoaderRef = useRef<ModelLoaderPlugin | null>(null);
    const orbitControlsRef = useRef<OrbitControlsPlugin | null>(null);

    // Track disposed state for the ref API
    // Requirement 4.5: THE Instance_Accessor SHALL provide an isDisposed property to check disposal state
    const [isDisposed, setIsDisposed] = useState(false);

    // Track ViewerCore state for re-renders when it changes
    const [viewerCore, setViewerCore] = useState<ViewerCore | null>(null);

    // Refs for callbacks to avoid stale closures
    const onLoadRef = useRef(onLoad);
    const onErrorRef = useRef(onError);
    const onLoadingChangeRef = useRef(onLoadingChange);

    // Update callback refs when props change
    useEffect(() => {
      onLoadRef.current = onLoad;
    }, [onLoad]);

    useEffect(() => {
      onErrorRef.current = onError;
    }, [onError]);

    useEffect(() => {
      onLoadingChangeRef.current = onLoadingChange;
    }, [onLoadingChange]);

    /**
     * Expose imperative handle via ref.
     * 
     * Requirements:
     * - 3.2: WHEN a ref is provided, THE ThreeViewer SHALL expose a getInstances method that returns the Viewer_Context
     * - 3.3: WHEN a ref is provided, THE ThreeViewer SHALL expose a getViewerCore method that returns the ViewerCore instance
     * - 3.5: WHEN the Viewer is disposed, THE ref methods SHALL return null
     */
    useImperativeHandle(
      ref,
      () => ({
        getInstances(): ThreeInstanceContextValue {
          // If disposed, return disposed state
          if (isDisposed) {
            return {
              ...initialContextValue,
              isDisposed: true,
            };
          }

          const vc = viewerCoreRef.current;
          
          // If not initialized, return initial context value
          if (!vc || !vc.isInitialized) {
            return initialContextValue;
          }

          // Return current instances
          return {
            scene: vc.scene.scene,
            camera: vc.camera.camera,
            renderer: vc.renderer.renderer,
            container: vc.container,
            isReady: true,
            isDisposed: false,
          };
        },

        getViewerCore(): ViewerCore | null {
          // If disposed, return null
          if (isDisposed) {
            return null;
          }
          return viewerCoreRef.current;
        },

        isReady(): boolean {
          // If disposed, return false
          if (isDisposed) {
            return false;
          }
          const vc = viewerCoreRef.current;
          return vc !== null && vc.isInitialized;
        },

        isDisposed(): boolean {
          return isDisposed;
        },
      }),
      [isDisposed]
    );

    /**
     * Initialize ViewerCore and plugins on mount.
     * Clean up all resources on unmount.
     * 
     * Requirements:
     * - 4.2: Initialize the Three.js Scene, Camera, and Renderer when component mounts
     * - 4.3: Properly dispose of all Three.js resources when component unmounts
     */
    useEffect(() => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      // Create and initialize ViewerCore
      const viewerCoreInstance = new ViewerCore();
      viewerCoreInstance.initialize({
        container,
        antialias: true,
        alpha: true,
      });

      // Create and register plugins
      const modelLoader = new ModelLoaderPlugin();
      const orbitControls = new OrbitControlsPlugin();

      viewerCoreInstance.plugins.register(modelLoader);
      viewerCoreInstance.plugins.register(orbitControls);

      // Store references
      viewerCoreRef.current = viewerCoreInstance;
      modelLoaderRef.current = modelLoader;
      orbitControlsRef.current = orbitControls;

      // Update state to trigger re-render for children with context
      setViewerCore(viewerCoreInstance);
      setIsDisposed(false);

      // Start the render loop
      viewerCoreInstance.start();

      // Cleanup on unmount
      // Requirement 4.3: Properly dispose of all Three.js resources
      return () => {
        viewerCoreInstance.dispose();
        viewerCoreRef.current = null;
        modelLoaderRef.current = null;
        orbitControlsRef.current = null;
        setViewerCore(null);
        setIsDisposed(true);
      };
    }, []);

    /**
     * Handle container resize using ResizeObserver.
     * 
     * Requirement 4.4: Update the Camera aspect ratio and Renderer size when container resizes
     */
    useEffect(() => {
      const container = containerRef.current;
      const vc = viewerCoreRef.current;

      if (!container || !vc) {
        return;
      }

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            vc.resize(width, height);
          }
        }
      });

      resizeObserver.observe(container);

      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    /**
     * Handle modelUrl prop changes.
     * Load new model when URL changes.
     * 
     * Requirements:
     * - 4.6: Update the corresponding settings without full re-initialization
     * - 1.1: Load the model and add it to the Scene
     * - 1.5: Dispose of the previous model before loading the new one
     */
    useEffect(() => {
      const modelLoader = modelLoaderRef.current;
      const orbitControls = orbitControlsRef.current;

      if (!modelLoader) {
        return;
      }

      // If no URL provided, unload any existing model
      if (!modelUrl) {
        modelLoader.unload();
        return;
      }

      // Notify loading started
      onLoadingChangeRef.current?.(true);

      // Load the model
      modelLoader
        .load(modelUrl)
        .then((result) => {
          // Notify loading completed
          onLoadingChangeRef.current?.(false);

          // Set orbit controls target to model center if no custom pivot point
          // Requirement 2.5: Use the loaded model's center as the rotation center
          if (orbitControls && !pivotPoint) {
            orbitControls.setTarget(result.center);
          }

          // Calculate default zoom limits based on model size if not provided
          // Requirement 3.4: Use reasonable default limits based on the model size
          if (orbitControls && !zoomLimits) {
            const boundingBox = result.boundingBox;
            const size = new THREE.Vector3();
            boundingBox.getSize(size);
            const maxDimension = Math.max(size.x, size.y, size.z);
            
            // Set reasonable defaults: min = 10% of model size, max = 10x model size
            orbitControls.setZoomLimits(maxDimension * 0.1, maxDimension * 10);
          }

          // Invoke onLoad callback
          onLoadRef.current?.(result);
        })
        .catch((error) => {
          // Notify loading completed (with error)
          onLoadingChangeRef.current?.(false);

          // Invoke onError callback
          const loadError = error instanceof Error ? error : new Error(String(error));
          onErrorRef.current?.(loadError);
        });
    }, [modelUrl]); // eslint-disable-line react-hooks/exhaustive-deps

    /**
     * Handle pivotPoint prop changes.
     * Update OrbitControls target when pivot point changes.
     * 
     * Requirements:
     * - 4.6: Update the corresponding settings without full re-initialization
     * - 2.4: Use the custom point as the rotation center
     */
    useEffect(() => {
      const orbitControls = orbitControlsRef.current;

      if (!orbitControls) {
        return;
      }

      if (pivotPoint) {
        const target = new THREE.Vector3(pivotPoint.x, pivotPoint.y, pivotPoint.z);
        orbitControls.setTarget(target);
      }
    }, [pivotPoint]);

    /**
     * Handle zoomLimits prop changes.
     * Update OrbitControls zoom limits when they change.
     * 
     * Requirements:
     * - 4.6: Update the corresponding settings without full re-initialization
     * - 3.3: Use the custom limits
     */
    useEffect(() => {
      const orbitControls = orbitControlsRef.current;

      if (!orbitControls) {
        return;
      }

      if (zoomLimits) {
        const min = zoomLimits.min ?? 0.1;
        const max = zoomLimits.max ?? 1000;
        orbitControls.setZoomLimits(min, max);
      }
    }, [zoomLimits]);

    // Default styles for the container
    const containerStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      ...style,
    };

    return (
      <ThreeInstanceProvider viewerCore={viewerCore}>
        <div
          ref={containerRef}
          className={className}
          style={containerStyle}
        />
        {children}
      </ThreeInstanceProvider>
    );
  }
);

// Display name for React DevTools debugging
ThreeViewer.displayName = 'ThreeViewer';

export default ThreeViewer;
