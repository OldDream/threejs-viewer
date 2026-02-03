import * as THREE from 'three';

/**
 * RenderManager configuration options
 */
export interface RenderManagerOptions {
  antialias?: boolean;
  alpha?: boolean;
}

/**
 * RenderManager Interface
 * 渲染管理器，负责 WebGL 渲染器和渲染循环。
 */
export interface IRenderManager {
  readonly renderer: THREE.WebGLRenderer;
  
  initialize(container: HTMLElement, options?: RenderManagerOptions): void;
  setSize(width: number, height: number): void;
  render(scene: THREE.Scene, camera: THREE.Camera): void;
  dispose(): void;
}

/**
 * Default render manager options
 */
const DEFAULT_OPTIONS: Required<RenderManagerOptions> = {
  antialias: true,
  alpha: false,
};

/**
 * RenderManager Implementation
 * 
 * Manages the Three.js WebGLRenderer lifecycle including:
 * - Renderer creation and initialization with configurable options
 * - Canvas management (appending to container, removal on dispose)
 * - Size updates for responsive rendering
 * - Render loop execution
 * - Proper disposal of resources to prevent memory leaks
 * 
 * @implements {IRenderManager}
 * 
 * Requirements:
 * - 4.2: Initialize the Three.js Renderer when component mounts
 * - 4.3: Properly dispose of all Three.js resources to prevent memory leaks
 */
export class RenderManager implements IRenderManager {
  private _renderer: THREE.WebGLRenderer | null = null;
  private _container: HTMLElement | null = null;
  private _isDisposed: boolean = false;
  private _isInitialized: boolean = false;

  /**
   * Gets the underlying Three.js WebGLRenderer instance.
   * @returns The THREE.WebGLRenderer instance
   * @throws Error if the RenderManager has not been initialized
   */
  get renderer(): THREE.WebGLRenderer {
    if (!this._renderer) {
      throw new Error('RenderManager has not been initialized. Call initialize() first.');
    }
    return this._renderer;
  }

  /**
   * Initializes the WebGLRenderer and appends its canvas to the container.
   * @param container - The HTML element to append the renderer's canvas to
   * @param options - Optional configuration for the renderer
   * @throws Error if the RenderManager has been disposed
   * @throws Error if the RenderManager has already been initialized
   * 
   * Requirements:
   * - 4.2: Initialize the Three.js Renderer when component mounts
   */
  initialize(container: HTMLElement, options?: RenderManagerOptions): void {
    if (this._isDisposed) {
      throw new Error('RenderManager has been disposed');
    }

    if (this._isInitialized) {
      throw new Error('RenderManager has already been initialized');
    }

    const antialias = options?.antialias ?? DEFAULT_OPTIONS.antialias;
    const alpha = options?.alpha ?? DEFAULT_OPTIONS.alpha;

    // Create the WebGLRenderer with the specified options
    this._renderer = new THREE.WebGLRenderer({
      antialias,
      alpha,
    });

    // Configure renderer defaults
    this._renderer.setPixelRatio(window.devicePixelRatio);
    
    // Set initial size based on container dimensions
    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;
    this._renderer.setSize(width, height);

    // Append the canvas to the container
    container.appendChild(this._renderer.domElement);
    
    this._container = container;
    this._isInitialized = true;
  }

  /**
   * Sets the size of the renderer.
   * This should be called when the container element resizes.
   * @param width - The new width in pixels
   * @param height - The new height in pixels
   * @throws Error if the RenderManager has been disposed
   * @throws Error if the RenderManager has not been initialized
   * 
   * Requirements:
   * - 4.4: Update the Renderer size when container resizes
   */
  setSize(width: number, height: number): void {
    if (this._isDisposed) {
      throw new Error('RenderManager has been disposed');
    }

    if (!this._renderer) {
      throw new Error('RenderManager has not been initialized. Call initialize() first.');
    }

    // Ensure valid dimensions
    const validWidth = Math.max(1, Math.floor(width));
    const validHeight = Math.max(1, Math.floor(height));

    this._renderer.setSize(validWidth, validHeight);
  }

  /**
   * Renders the scene using the provided camera.
   * @param scene - The THREE.Scene to render
   * @param camera - The THREE.Camera to use for rendering
   * @throws Error if the RenderManager has been disposed
   * @throws Error if the RenderManager has not been initialized
   */
  render(scene: THREE.Scene, camera: THREE.Camera): void {
    if (this._isDisposed) {
      throw new Error('RenderManager has been disposed');
    }

    if (!this._renderer) {
      throw new Error('RenderManager has not been initialized. Call initialize() first.');
    }

    this._renderer.render(scene, camera);
  }

  /**
   * Disposes of the RenderManager and all its resources.
   * This method removes the canvas from the DOM and disposes of the WebGLRenderer.
   * After disposal, the RenderManager cannot be used.
   * 
   * Requirements:
   * - 4.3: Properly dispose of all Three.js resources to prevent memory leaks
   */
  dispose(): void {
    if (this._isDisposed) {
      return;
    }

    if (this._renderer) {
      // Remove the canvas from the container
      if (this._container && this._renderer.domElement.parentElement === this._container) {
        this._container.removeChild(this._renderer.domElement);
      }

      // Dispose of the WebGLRenderer
      this._renderer.dispose();
      this._renderer = null;
    }

    this._container = null;
    this._isInitialized = false;
    this._isDisposed = true;
  }
}
