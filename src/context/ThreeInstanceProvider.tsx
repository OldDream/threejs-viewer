/**
 * ThreeInstanceProvider Component
 *
 * Internal Provider component that extracts Three.js instances from ViewerCore
 * and provides them to the React context tree.
 *
 * Requirements:
 * - 4.1: THE Instance_Accessor SHALL track the Lifecycle_State of the Viewer
 * - 4.2: WHEN accessing instances in an invalid Lifecycle_State, THE Instance_Accessor SHALL return null instead of throwing errors
 * - 4.3: THE Instance_Accessor SHALL provide a method to check if the Viewer is ready for use
 * - 4.4: WHEN the Viewer transitions to disposed state, THE Instance_Accessor SHALL clear all instance references
 * - 4.5: THE Instance_Accessor SHALL provide an isDisposed property to check disposal state
 */

import React, { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { ThreeInstanceContext } from './ThreeInstanceContext';
import { initialContextValue, ThreeInstanceContextValue } from '../types/instance';
import type { ViewerCore } from '../core/ViewerCore';

/**
 * Lifecycle state for the viewer.
 * Follows the state machine defined in the design document.
 *
 * Valid transitions:
 * - unmounted → mounted
 * - mounted → initialized
 * - mounted → disposed
 * - initialized → disposed
 * - disposed → (terminal state, no transitions)
 */
export type LifecycleState = 'unmounted' | 'mounted' | 'initialized' | 'disposed';

/**
 * Valid state transitions for the lifecycle state machine.
 */
const validTransitions: Record<LifecycleState, LifecycleState[]> = {
  unmounted: ['mounted'],
  mounted: ['initialized', 'disposed'],
  initialized: ['disposed'],
  disposed: [], // Terminal state
};

/**
 * Instance availability by lifecycle state.
 * Instances are only available when in the 'initialized' state.
 */
const instanceAvailability: Record<LifecycleState, boolean> = {
  unmounted: false,
  mounted: false,
  initialized: true,
  disposed: false,
};

/**
 * Props for the ThreeInstanceProvider component.
 */
export interface ThreeInstanceProviderProps {
  /** Child components that will have access to the Three.js instances */
  children: React.ReactNode;
  /** The ViewerCore instance to extract instances from, or null if not yet created */
  viewerCore: ViewerCore | null;
}

/**
 * Validates if a state transition is allowed.
 *
 * @param from - The current lifecycle state
 * @param to - The target lifecycle state
 * @returns True if the transition is valid, false otherwise
 */
function isValidTransition(from: LifecycleState, to: LifecycleState): boolean {
  return validTransitions[from].includes(to);
}

/**
 * Extracts Three.js instances from a ViewerCore instance.
 *
 * @param viewerCore - The ViewerCore instance to extract from
 * @param lifecycleState - The current lifecycle state
 * @returns ThreeInstanceContextValue with all instances or null values if not available
 */
function extractInstances(
  viewerCore: ViewerCore | null,
  lifecycleState: LifecycleState
): ThreeInstanceContextValue {
  // Check if instances should be available based on lifecycle state
  const shouldBeAvailable = instanceAvailability[lifecycleState];

  // If disposed, return disposed state with null instances
  if (lifecycleState === 'disposed') {
    return {
      ...initialContextValue,
      isDisposed: true,
    };
  }

  // If instances shouldn't be available, return initial context value
  if (!shouldBeAvailable || !viewerCore) {
    return initialContextValue;
  }

  // Check if viewerCore is initialized
  if (!viewerCore.isInitialized) {
    return initialContextValue;
  }

  // Extract instances from ViewerCore
  // ViewerCore exposes instances through its managers:
  // - viewerCore.scene.scene -> THREE.Scene
  // - viewerCore.camera.camera -> THREE.PerspectiveCamera
  // - viewerCore.renderer.renderer -> THREE.WebGLRenderer
  // - viewerCore.container -> HTMLElement
  return {
    scene: viewerCore.scene.scene,
    camera: viewerCore.camera.camera,
    renderer: viewerCore.renderer.renderer,
    container: viewerCore.container,
    isReady: true,
    isDisposed: false,
  };
}

/**
 * Internal Provider component that provides Three.js instance access to children.
 *
 * This component is used internally by ThreeViewer to wrap children components
 * and provide them access to the underlying Three.js instances through the
 * useThreeInstance hook.
 *
 * The provider:
 * - Tracks lifecycle state using a state machine (unmounted → mounted → initialized → disposed)
 * - Extracts instances from ViewerCore when available
 * - Returns null for all instances when ViewerCore is not initialized
 * - Updates context when ViewerCore changes or initializes
 * - Handles disposal state by clearing all instance references
 *
 * @param props - The provider props
 * @returns JSX.Element wrapping children with the context provider
 *
 * @internal This component is used internally by ThreeViewer.
 * Users should not use this component directly.
 */
export function ThreeInstanceProvider({
  children,
  viewerCore,
}: ThreeInstanceProviderProps): React.ReactElement {
  // Track lifecycle state using the state machine
  // Requirement 4.1: THE Instance_Accessor SHALL track the Lifecycle_State of the Viewer
  const [lifecycleState, setLifecycleState] = useState<LifecycleState>('unmounted');

  // Track if the component is mounted
  const isMountedRef = useRef(false);

  // Previous viewerCore reference to detect changes
  const prevViewerCoreRef = useRef<ViewerCore | null>(null);

  /**
   * Safely transition to a new lifecycle state.
   * Only transitions if the transition is valid according to the state machine.
   *
   * @param newState - The target lifecycle state
   */
  const transitionTo = useCallback((newState: LifecycleState) => {
    setLifecycleState((currentState) => {
      if (isValidTransition(currentState, newState)) {
        return newState;
      }
      // Invalid transition, stay in current state
      // This prevents invalid state transitions and ensures state machine integrity
      return currentState;
    });
  }, []);

  // Handle component mount/unmount
  // Transition: unmounted → mounted (on mount)
  // Transition: * → disposed (on unmount, if not already disposed)
  useEffect(() => {
    isMountedRef.current = true;
    transitionTo('mounted');

    return () => {
      isMountedRef.current = false;
      // On unmount, transition to disposed if not already
      setLifecycleState((currentState) => {
        if (currentState !== 'disposed') {
          return 'disposed';
        }
        return currentState;
      });
    };
  }, [transitionTo]);

  // Handle viewerCore changes and initialization
  // Transition: mounted → initialized (when viewerCore becomes initialized)
  // Transition: * → disposed (when viewerCore becomes null after being set)
  useEffect(() => {
    const prevViewerCore = prevViewerCoreRef.current;
    prevViewerCoreRef.current = viewerCore;

    // If viewerCore was set and is now null, it means disposal
    if (prevViewerCore && !viewerCore) {
      transitionTo('disposed');
      return;
    }

    // If viewerCore is set and initialized, transition to initialized
    if (viewerCore && viewerCore.isInitialized) {
      transitionTo('initialized');
    }
  }, [viewerCore, transitionTo]);

  // Create a function to check and update initialization state
  // This is used to poll for initialization if needed
  const checkInitialization = useCallback(() => {
    if (viewerCore && viewerCore.isInitialized && lifecycleState === 'mounted') {
      transitionTo('initialized');
    }
  }, [viewerCore, lifecycleState, transitionTo]);

  // Effect to check initialization state periodically
  // This handles the case where viewerCore initializes after being passed to the provider
  useEffect(() => {
    if (!viewerCore || lifecycleState !== 'mounted') {
      return;
    }

    // Check immediately
    checkInitialization();

    // Set up a short interval to check for initialization
    // This is a fallback in case the initialization happens asynchronously
    const intervalId = setInterval(checkInitialization, 50);

    // Clean up after a reasonable time or when initialized
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
    }, 5000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [viewerCore, lifecycleState, checkInitialization]);

  // Compute the context value based on lifecycle state
  // Requirement 4.2: Return null instead of throwing errors in invalid states
  // Requirement 4.3: isReady indicates if the Viewer is ready for use
  // Requirement 4.4: Clear all instance references when disposed
  // Requirement 4.5: isDisposed property to check disposal state
  const contextValue = useMemo<ThreeInstanceContextValue>(() => {
    return extractInstances(viewerCore, lifecycleState);
  }, [viewerCore, lifecycleState]);

  return (
    <ThreeInstanceContext.Provider value={contextValue}>
      {children}
    </ThreeInstanceContext.Provider>
  );
}

/**
 * Display name for React DevTools debugging.
 */
ThreeInstanceProvider.displayName = 'ThreeInstanceProvider';
