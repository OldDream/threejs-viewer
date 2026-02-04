import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { Plugin, PluginContext } from '../core/PluginSystem';

/**
 * OrbitControls configuration options.
 * 
 * Requirements:
 * - 2.4: Support custom Pivot_Point configuration
 * - 3.3: Support custom zoom limits configuration
 */
export interface OrbitControlsConfig {
  target?: THREE.Vector3;
  minDistance?: number;
  maxDistance?: number;
  enableDamping?: boolean;
  dampingFactor?: number;
  enablePan?: boolean;
  enableRotate?: boolean;
  enableZoom?: boolean;
}

/**
 * OrbitControlsPlugin Interface
 * Extends the base Plugin interface with orbit controls capabilities.
 */
export interface IOrbitControlsPlugin extends Plugin {
  readonly controls: OrbitControls;
  
  configure(config: OrbitControlsConfig): void;
  setTarget(target: THREE.Vector3): void;
  setZoomLimits(min: number, max: number): void;
  reset(): void;
}

/**
 * OrbitControlsPlugin Implementation
 * 
 * Provides camera orbit controls with the following features:
 * - Camera rotation around a pivot point (target)
 * - Zoom in/out with configurable limits
 * - Smooth damping for camera movements
 * - Pan, rotate, and zoom enable/disable options
 * 
 * @implements {IOrbitControlsPlugin}
 * 
 * Requirements:
 * - 2.1: THE OrbitControls SHALL enable camera rotation around the Pivot_Point by mouse drag or touch gesture
 * - 2.2: WHEN the user drags horizontally, THE Camera SHALL rotate around the vertical axis of the Pivot_Point
 * - 2.3: WHEN the user drags vertically, THE Camera SHALL rotate around the horizontal axis of the Pivot_Point
 * - 2.4: WHERE a custom Pivot_Point is configured, THE OrbitControls SHALL use the custom point as the rotation center
 * - 2.5: WHEN no custom Pivot_Point is configured, THE OrbitControls SHALL use the loaded model's center as the rotation center
 * - 3.1: WHEN the user scrolls the mouse wheel or pinches on touch devices, THE Camera SHALL move closer to or farther from the Pivot_Point
 * - 3.2: THE OrbitControls SHALL enforce minimum and maximum zoom distance limits
 * - 3.3: WHERE custom zoom limits are configured, THE OrbitControls SHALL use the custom limits
 * - 3.4: WHEN zoom limits are not configured, THE OrbitControls SHALL use reasonable default limits based on the model size
 */
export class OrbitControlsPlugin implements IOrbitControlsPlugin {
  readonly name = 'OrbitControlsPlugin';
  
  private _context: PluginContext | null = null;
  private _controls: OrbitControls | null = null;
  private _isDisposed: boolean = false;
  
  // Store initial state for reset functionality
  private _initialTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private _initialCameraPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 5);
  private _initialMinDistance: number = 0.1;  // Allow closer zoom with smaller near plane
  private _initialMaxDistance: number = 10000;

  /**
   * Gets the OrbitControls instance.
   * @throws Error if the plugin has not been initialized
   */
  get controls(): OrbitControls {
    if (!this._controls) {
      throw new Error('OrbitControlsPlugin has not been initialized. Call initialize() first.');
    }
    return this._controls;
  }

  /**
   * Initialize the plugin with the provided context.
   * Creates the OrbitControls instance and sets up default configuration.
   * 
   * @param context - The plugin context containing core Three.js objects
   * @throws Error if the plugin has been disposed
   * 
   * Requirements:
   * - 2.1: Enable camera rotation around the Pivot_Point
   * - 3.1: Enable zoom via mouse wheel or touch pinch
   * - 3.4: Use reasonable default limits
   */
  initialize(context: PluginContext): void {
    if (this._isDisposed) {
      throw new Error('OrbitControlsPlugin has been disposed');
    }

    this._context = context;

    // Create OrbitControls instance
    // Requirements 2.1, 2.2, 2.3: OrbitControls handles rotation around pivot point
    // Requirement 3.1: OrbitControls handles zoom via mouse wheel/touch pinch
    this._controls = new OrbitControls(context.camera, context.container);

    // Store initial camera position for reset
    this._initialCameraPosition.copy(context.camera.position);

    // Set default configuration
    // Requirement 3.4: Use reasonable default limits
    this._controls.minDistance = this._initialMinDistance;
    this._controls.maxDistance = this._initialMaxDistance;
    
    // Enable damping for smooth camera movement
    this._controls.enableDamping = true;
    this._controls.dampingFactor = 0.05;
    
    // Enable all controls by default
    this._controls.enablePan = true;
    this._controls.enableRotate = true;
    this._controls.enableZoom = true;
  }

  /**
   * Configures the OrbitControls with the provided options.
   * 
   * @param config - The configuration options to apply
   * @throws Error if the plugin has not been initialized or has been disposed
   * 
   * Requirements:
   * - 2.4: Support custom Pivot_Point configuration
   * - 3.3: Support custom zoom limits configuration
   */
  configure(config: OrbitControlsConfig): void {
    if (this._isDisposed) {
      throw new Error('OrbitControlsPlugin has been disposed');
    }

    if (!this._controls) {
      throw new Error('OrbitControlsPlugin has not been initialized. Call initialize() first.');
    }

    // Requirement 2.4: Set custom pivot point (target)
    if (config.target !== undefined) {
      this._controls.target.copy(config.target);
      this._initialTarget.copy(config.target);
    }

    // Requirement 3.3: Set custom zoom limits
    if (config.minDistance !== undefined) {
      this._controls.minDistance = config.minDistance;
      this._initialMinDistance = config.minDistance;
    }

    if (config.maxDistance !== undefined) {
      this._controls.maxDistance = config.maxDistance;
      this._initialMaxDistance = config.maxDistance;
    }

    // Configure damping
    if (config.enableDamping !== undefined) {
      this._controls.enableDamping = config.enableDamping;
    }

    if (config.dampingFactor !== undefined) {
      this._controls.dampingFactor = config.dampingFactor;
    }

    // Configure control modes
    if (config.enablePan !== undefined) {
      this._controls.enablePan = config.enablePan;
    }

    if (config.enableRotate !== undefined) {
      this._controls.enableRotate = config.enableRotate;
    }

    if (config.enableZoom !== undefined) {
      this._controls.enableZoom = config.enableZoom;
    }

    // Update controls to apply changes
    this._controls.update();
  }

  /**
   * Sets the target (pivot point) for the orbit controls.
   * 
   * @param target - The new target position as a Vector3
   * @throws Error if the plugin has not been initialized or has been disposed
   * 
   * Requirements:
   * - 2.4: WHERE a custom Pivot_Point is configured, THE OrbitControls SHALL use the custom point as the rotation center
   * - 2.5: WHEN no custom Pivot_Point is configured, THE OrbitControls SHALL use the loaded model's center as the rotation center
   */
  setTarget(target: THREE.Vector3): void {
    if (this._isDisposed) {
      throw new Error('OrbitControlsPlugin has been disposed');
    }

    if (!this._controls) {
      throw new Error('OrbitControlsPlugin has not been initialized. Call initialize() first.');
    }

    this._controls.target.copy(target);
    this._initialTarget.copy(target);
    this._controls.update();
  }

  /**
   * Sets the minimum and maximum zoom distance limits.
   * 
   * @param min - The minimum distance from the target
   * @param max - The maximum distance from the target
   * @throws Error if the plugin has not been initialized or has been disposed
   * @throws Error if min is greater than max
   * 
   * Requirements:
   * - 3.2: THE OrbitControls SHALL enforce minimum and maximum zoom distance limits
   * - 3.3: WHERE custom zoom limits are configured, THE OrbitControls SHALL use the custom limits
   */
  setZoomLimits(min: number, max: number): void {
    if (this._isDisposed) {
      throw new Error('OrbitControlsPlugin has been disposed');
    }

    if (!this._controls) {
      throw new Error('OrbitControlsPlugin has not been initialized. Call initialize() first.');
    }

    if (min > max) {
      throw new Error('Minimum zoom distance cannot be greater than maximum zoom distance');
    }

    if (min < 0) {
      throw new Error('Minimum zoom distance cannot be negative');
    }

    this._controls.minDistance = min;
    this._controls.maxDistance = max;
    this._initialMinDistance = min;
    this._initialMaxDistance = max;
    this._controls.update();
  }

  /**
   * Resets the controls to their initial state.
   * Restores the target, camera position, and zoom limits to their initial values.
   * 
   * @throws Error if the plugin has not been initialized or has been disposed
   */
  reset(): void {
    if (this._isDisposed) {
      throw new Error('OrbitControlsPlugin has been disposed');
    }

    if (!this._controls || !this._context) {
      throw new Error('OrbitControlsPlugin has not been initialized. Call initialize() first.');
    }

    // Reset target to initial position
    this._controls.target.copy(this._initialTarget);

    // Reset camera position
    this._context.camera.position.copy(this._initialCameraPosition);

    // Reset zoom limits
    this._controls.minDistance = this._initialMinDistance;
    this._controls.maxDistance = this._initialMaxDistance;

    // Update controls to apply changes
    this._controls.update();
  }

  /**
   * Updates the controls. Should be called on each render loop iteration.
   * This is required for damping to work properly.
   * 
   * @param _deltaTime - Time elapsed since the last frame in seconds (unused but required by Plugin interface)
   * 
   * Requirements:
   * - 5.5: Notify all registered plugins when the render loop executes
   */
  update(_deltaTime: number): void {
    if (this._isDisposed || !this._controls) {
      return;
    }

    // Update controls for damping effect
    // This must be called on each frame for smooth camera movement
    this._controls.update();
  }

  /**
   * Disposes of the plugin and all its resources.
   * This method should be called when the plugin is unregistered.
   */
  dispose(): void {
    if (this._isDisposed) {
      return;
    }

    if (this._controls) {
      this._controls.dispose();
      this._controls = null;
    }

    this._context = null;
    this._isDisposed = true;
  }
}
