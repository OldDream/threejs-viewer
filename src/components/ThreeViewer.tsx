import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import * as THREE from 'three';
import { ViewerCore } from '../core/ViewerCore';
import { ModelLoaderPlugin, ModelLoadResult } from '../plugins/ModelLoaderPlugin';
import { OrbitControlsPlugin } from '../plugins/OrbitControlsPlugin';
import { GridHelperPlugin, GridPlane } from '../plugins/GridHelperPlugin';
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
 * Grid configuration for the viewer.
 */
export interface GridConfig {
  /** Show grid helper */
  visible?: boolean;
  /** Grid size */
  size?: number;
  /** Number of divisions */
  divisions?: number;
  /** Which plane to display the grid on: 'XY', 'XZ', or 'YZ' */
  plane?: GridPlane;
  /** Show axes helper (RGB = XYZ) */
  showAxes?: boolean;
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
  /** Grid and axes helper configuration */
  grid?: GridConfig;
  /** Background color of the scene (hex number, CSS color string, or THREE.Color) */
  backgroundColor?: number | string;
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
  onViewerReady?: (viewerCore: ViewerCore) => void;
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
/** Default background color - 3ds Max style gray */
const DEFAULT_BACKGROUND_COLOR = 0x545454;

export const ThreeViewer = forwardRef<ThreeViewerHandle, ThreeViewerProps>(
  function ThreeViewer(
    {
      modelUrl,
      pivotPoint,
      zoomLimits,
      grid,
      backgroundColor = DEFAULT_BACKGROUND_COLOR,
      className,
      style,
      onLoad,
      onError,
      onLoadingChange,
      onViewerReady,
      children,
    },
    ref
  ) {
    // Refs for container element and ViewerCore instance
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerCoreRef = useRef<ViewerCore | null>(null);
    const modelLoaderRef = useRef<ModelLoaderPlugin | null>(null);
    const orbitControlsRef = useRef<OrbitControlsPlugin | null>(null);
    const gridHelperRef = useRef<GridHelperPlugin | null>(null);

    // Track disposed state for the ref API
    // Requirement 4.5: THE Instance_Accessor SHALL provide an isDisposed property to check disposal state
    const [isDisposed, setIsDisposed] = useState(false);

    // Track ViewerCore state for re-renders when it changes
    const [viewerCore, setViewerCore] = useState<ViewerCore | null>(null);

    // Refs for callbacks to avoid stale closures
    const onLoadRef = useRef(onLoad);
    const onErrorRef = useRef(onError);
    const onLoadingChangeRef = useRef(onLoadingChange);
    const onViewerReadyRef = useRef(onViewerReady);

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

    useEffect(() => {
      onViewerReadyRef.current = onViewerReady;
    }, [onViewerReady]);

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
      const gridHelper = new GridHelperPlugin();

      viewerCoreInstance.plugins.register(modelLoader);
      viewerCoreInstance.plugins.register(orbitControls);
      viewerCoreInstance.plugins.register(gridHelper);

      // Store references
      viewerCoreRef.current = viewerCoreInstance;
      modelLoaderRef.current = modelLoader;
      orbitControlsRef.current = orbitControls;
      gridHelperRef.current = gridHelper;

      // Update state to trigger re-render for children with context
      setViewerCore(viewerCoreInstance);
      setIsDisposed(false);

      try {
        onViewerReadyRef.current?.(viewerCoreInstance);
      } catch (e) {
        console.error('onViewerReady callback failed:', e);
      }

      // Start the render loop
      viewerCoreInstance.start();

      // Cleanup on unmount
      // Requirement 4.3: Properly dispose of all Three.js resources
      return () => {
        viewerCoreInstance.dispose();
        viewerCoreRef.current = null;
        modelLoaderRef.current = null;
        orbitControlsRef.current = null;
        gridHelperRef.current = null;
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
      const gridHelper = gridHelperRef.current;

      if (!modelLoader) {
        return;
      }

      // If no URL provided, unload any existing model
      if (!modelUrl) {
        modelLoader.unload();
        return;
      }

      let isCancelled = false;

      // Notify loading started
      onLoadingChangeRef.current?.(true);

      // Load the model
      modelLoader
        .load(modelUrl)
        .then((result) => {
          if (isCancelled) return;

          // Notify loading completed
          onLoadingChangeRef.current?.(false);

          // Set orbit controls target to model center if no custom pivot point
          // Requirement 2.5: Use the loaded model's center as the rotation center
          if (orbitControls && !pivotPoint) {
            orbitControls.setTarget(result.center);
          }

          // Calculate model size for various defaults
          const boundingBox = result.boundingBox;
          const size = new THREE.Vector3();
          boundingBox.getSize(size);
          const maxDimension = Math.max(size.x, size.y, size.z);

          // Calculate default zoom limits based on model size if not provided
          // Requirement 3.4: Use reasonable default limits based on the model size
          if (orbitControls && !zoomLimits) {
            // Set reasonable defaults: min = 10% of model size, max = 10x model size
            // Cap maxDistance to camera's far plane to prevent model from disappearing
            const cameraFar = viewerCoreRef.current?.camera.camera.far ?? 1000;
            const maxDistance = Math.min(maxDimension * 10, cameraFar * 0.9);
            orbitControls.setZoomLimits(maxDimension * 0.1, maxDistance);
          }

          // Auto-size grid based on model size (if no custom size provided)
          if (gridHelper && (!grid || grid.size === undefined)) {
            const gridSize = maxDimension * 3; // Grid 3x larger than model
            gridHelper.configure({
              size: gridSize,
              divisions: 10,
              axesSize: maxDimension * 1.5, // Axes 1.5x model size
            });
          }

          // Invoke onLoad callback
          onLoadRef.current?.(result);
        })
        .catch((error) => {
          if (isCancelled) return;

          // Notify loading completed (with error)
          onLoadingChangeRef.current?.(false);

          // Invoke onError callback
          const loadError = error instanceof Error ? error : new Error(String(error));
          onErrorRef.current?.(loadError);
        });

      return () => {
        isCancelled = true;
      };
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
        const max = zoomLimits.max ?? 10000;
        orbitControls.setZoomLimits(min, max);
      }
    }, [zoomLimits]);

    /**
     * Handle grid prop changes.
     * Update GridHelper configuration when it changes.
     */
    useEffect(() => {
      const gridHelper = gridHelperRef.current;

      if (!gridHelper) {
        return;
      }

      if (grid) {
        // Only pass defined values to configure
        const config: Parameters<typeof gridHelper.configure>[0] = {};
        if (grid.size !== undefined) config.size = grid.size;
        if (grid.divisions !== undefined) config.divisions = grid.divisions;
        if (grid.plane !== undefined) config.plane = grid.plane;
        if (grid.showAxes !== undefined) config.showAxes = grid.showAxes;
        
        gridHelper.configure(config);
        gridHelper.setVisible(grid.visible !== false);
      } else {
        // Hide grid if no config provided
        gridHelper.setVisible(false);
      }
    }, [grid]);

    /**
     * Handle backgroundColor prop changes.
     * Update scene background color when it changes.
     */
    useEffect(() => {
      const vc = viewerCoreRef.current;
      if (!vc || !vc.isInitialized) {
        return;
      }

      const scene = vc.scene.scene;
      if (backgroundColor !== undefined) {
        scene.background = new THREE.Color(backgroundColor);
      } else {
        scene.background = new THREE.Color(DEFAULT_BACKGROUND_COLOR);
      }
    }, [backgroundColor, viewerCore]); // viewerCore dependency ensures this runs after initialization

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
