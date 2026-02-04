/**
 * Three.js Instance Context
 *
 * This module creates the React Context for providing Three.js instance access
 * throughout the component tree within a ThreeViewer.
 *
 * Requirements:
 * - 1.5: WHEN the Viewer is not initialized, THE Instance_Accessor SHALL return null for all instances
 * - 4.1: THE Instance_Accessor SHALL track the Lifecycle_State of the Viewer
 *
 * Design Notes:
 * - The context default value is undefined to detect usage outside of a provider
 * - The useThreeInstance hook will throw an error if context is undefined
 * - This allows proper error messages when the hook is used outside ThreeViewer
 */

import { createContext } from 'react';
import type { ThreeInstanceContextValue } from '../types/instance';

/**
 * React Context for Three.js instance access.
 *
 * The default value is undefined (not the initialContextValue) to enable
 * detection of usage outside of a ThreeInstanceProvider. The useThreeInstance
 * hook checks for undefined and throws a descriptive error.
 *
 * @internal This context is used internally by ThreeInstanceProvider and useThreeInstance.
 * Users should not interact with this context directly.
 */
export const ThreeInstanceContext = createContext<ThreeInstanceContextValue | undefined>(
  undefined
);

/**
 * Display name for React DevTools debugging.
 */
ThreeInstanceContext.displayName = 'ThreeInstanceContext';
