import * as THREE from 'three';

/**
 * Camera configuration options
 */
export interface CameraConfig {
  fov?: number;
  near?: number;
  far?: number;
  position?: THREE.Vector3;
}

/**
 * CameraManager Interface
 * 相机管理器，负责相机的创建、配置和更新。
 */
export interface ICameraManager {
  readonly camera: THREE.PerspectiveCamera;
  
  configure(config: CameraConfig): void;
  setAspect(aspect: number): void;
  lookAt(target: THREE.Vector3): void;
  dispose(): void;
}

/**
 * Default camera configuration values
 */
const DEFAULT_CONFIG: Required<Omit<CameraConfig, 'position'>> & { position: THREE.Vector3 } = {
  fov: 75,
  near: 0.01,  // Smaller near plane to prevent clipping when rotating close to model
  far: 10000,  // Larger far plane for viewing large models from distance
  position: new THREE.Vector3(0, 0, 5),
};

/**
 * CameraManager Implementation
 * 
 * Manages the Three.js PerspectiveCamera lifecycle including:
 * - Camera creation and initialization with configurable options
 * - Aspect ratio updates for responsive rendering
 * - Camera orientation (lookAt) control
 * - Proper disposal of resources
 * 
 * @implements {ICameraManager}
 * 
 * Requirements:
 * - 4.2: Initialize the Three.js Camera when component mounts
 * - 4.4: Update the Camera aspect ratio when container resizes
 */
export class CameraManager implements ICameraManager {
  private _camera: THREE.PerspectiveCamera;
  private _isDisposed: boolean = false;

  constructor(config?: CameraConfig) {
    const fov = config?.fov ?? DEFAULT_CONFIG.fov;
    const near = config?.near ?? DEFAULT_CONFIG.near;
    const far = config?.far ?? DEFAULT_CONFIG.far;
    const position = config?.position ?? DEFAULT_CONFIG.position.clone();

    // Create PerspectiveCamera with default aspect ratio of 1
    // Aspect ratio should be set via setAspect() when container dimensions are known
    this._camera = new THREE.PerspectiveCamera(fov, 1, near, far);
    this._camera.position.copy(position);
  }

  /**
   * Gets the underlying Three.js PerspectiveCamera instance.
   * @returns The THREE.PerspectiveCamera instance
   */
  get camera(): THREE.PerspectiveCamera {
    return this._camera;
  }

  /**
   * Configures the camera with the provided options.
   * Only updates the properties that are specified in the config.
   * @param config - The camera configuration options
   * @throws Error if the CameraManager has been disposed
   */
  configure(config: CameraConfig): void {
    if (this._isDisposed) {
      throw new Error('CameraManager has been disposed');
    }

    if (config.fov !== undefined) {
      this._camera.fov = config.fov;
    }

    if (config.near !== undefined) {
      this._camera.near = config.near;
    }

    if (config.far !== undefined) {
      this._camera.far = config.far;
    }

    if (config.position !== undefined) {
      this._camera.position.copy(config.position);
    }

    // Update the projection matrix after configuration changes
    this._camera.updateProjectionMatrix();
  }

  /**
   * Sets the camera's aspect ratio.
   * This should be called when the container element resizes.
   * @param aspect - The new aspect ratio (width / height)
   * @throws Error if the CameraManager has been disposed
   * 
   * Requirements:
   * - 4.4: Update the Camera aspect ratio when container resizes
   */
  setAspect(aspect: number): void {
    if (this._isDisposed) {
      throw new Error('CameraManager has been disposed');
    }

    if (aspect <= 0 || !Number.isFinite(aspect)) {
      console.warn('CameraManager: Invalid aspect ratio provided, using 1');
      aspect = 1;
    }

    this._camera.aspect = aspect;
    this._camera.updateProjectionMatrix();
  }

  /**
   * Sets the camera to look at a specific target point.
   * @param target - The THREE.Vector3 point to look at
   * @throws Error if the CameraManager has been disposed
   */
  lookAt(target: THREE.Vector3): void {
    if (this._isDisposed) {
      throw new Error('CameraManager has been disposed');
    }

    this._camera.lookAt(target);
  }

  /**
   * Disposes of the CameraManager and its resources.
   * This method should be called when the viewer is unmounted to prevent memory leaks.
   * After disposal, the CameraManager cannot be used.
   * 
   * Note: THREE.PerspectiveCamera doesn't have a dispose method,
   * but we mark the manager as disposed to prevent further use.
   */
  dispose(): void {
    if (this._isDisposed) {
      return;
    }

    // Clear any references
    // Note: PerspectiveCamera doesn't have a dispose method in Three.js
    // but we ensure the manager is marked as disposed
    this._isDisposed = true;
  }
}
