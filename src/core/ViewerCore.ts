import * as THREE from 'three';
import { SceneManager, ISceneManager } from './SceneManager';
import { CameraManager, ICameraManager, CameraConfig } from './CameraManager';
import { RenderManager, IRenderManager, RenderManagerOptions } from './RenderManager';
import { PluginSystem, IPluginSystem, PluginContext } from './PluginSystem';

/**
 * ViewerCore configuration options
 */
export interface ViewerCoreOptions {
  container: HTMLElement;
  antialias?: boolean;
  alpha?: boolean;
  cameraConfig?: CameraConfig;
}

/**
 * ViewerCore Interface
 * 核心引擎类，协调所有子系统。
 */
export interface IViewerCore {
  readonly scene: ISceneManager;
  readonly camera: ICameraManager;
  readonly renderer: IRenderManager;
  readonly plugins: IPluginSystem;
  
  initialize(options: ViewerCoreOptions): void;
  start(): void;
  stop(): void;
  dispose(): void;
  resize(width: number, height: number): void;
}

/**
 * ViewerCore Implementation
 * 
 * Core engine class that coordinates all subsystems:
 * - SceneManager: Manages the Three.js Scene
 * - CameraManager: Manages the PerspectiveCamera
 * - RenderManager: Manages the WebGLRenderer
 * - PluginSystem: Manages feature plugins
 * 
 * Implements the render loop using requestAnimationFrame and tracks deltaTime
 * for plugin updates.
 * 
 * @implements {IViewerCore}
 * 
 * Requirements:
 * - 4.2: Initialize the Three.js Scene, Camera, and Renderer when component mounts
 * - 4.3: Properly dispose of all Three.js resources to prevent memory leaks
 * - 4.4: Update the Camera aspect ratio and Renderer size when container resizes
 * - 5.4: Separate concerns into distinct modules: Scene management, Camera control, Model loading, and Rendering
 */
export class ViewerCore implements IViewerCore {
  private _sceneManager: SceneManager;
  private _cameraManager: CameraManager;
  private _renderManager: RenderManager;
  private _pluginSystem: PluginSystem;
  
  private _container: HTMLElement | null = null;
  private _isInitialized: boolean = false;
  private _isRunning: boolean = false;
  private _isDisposed: boolean = false;
  
  private _animationFrameId: number | null = null;
  private _lastTime: number = 0;

  constructor() {
    this._sceneManager = new SceneManager();
    this._cameraManager = new CameraManager();
    this._renderManager = new RenderManager();
    this._pluginSystem = new PluginSystem();
  }

  /**
   * Gets the SceneManager instance.
   * @returns The SceneManager instance
   */
  get scene(): ISceneManager {
    return this._sceneManager;
  }

  /**
   * Gets the CameraManager instance.
   * @returns The CameraManager instance
   */
  get camera(): ICameraManager {
    return this._cameraManager;
  }

  /**
   * Gets the RenderManager instance.
   * @returns The RenderManager instance
   */
  get renderer(): IRenderManager {
    return this._renderManager;
  }

  /**
   * Gets the PluginSystem instance.
   * @returns The PluginSystem instance
   */
  get plugins(): IPluginSystem {
    return this._pluginSystem;
  }

  /**
   * Gets whether the viewer is currently running.
   * @returns True if the render loop is active
   */
  get isRunning(): boolean {
    return this._isRunning;
  }

  /**
   * Gets whether the viewer has been initialized.
   * @returns True if initialize() has been called
   */
  get isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Gets the container element.
   * @returns The container element or null if not initialized
   */
  get container(): HTMLElement | null {
    return this._container;
  }

  /**
   * Initializes the ViewerCore with the provided options.
   * Sets up the renderer, camera aspect ratio, and plugin context.
   * 
   * @param options - The initialization options
   * @throws Error if the ViewerCore has been disposed
   * @throws Error if the ViewerCore has already been initialized
   * 
   * Requirements:
   * - 4.2: Initialize the Three.js Scene, Camera, and Renderer when component mounts
   */
  initialize(options: ViewerCoreOptions): void {
    if (this._isDisposed) {
      throw new Error('ViewerCore has been disposed');
    }

    if (this._isInitialized) {
      throw new Error('ViewerCore has already been initialized');
    }

    const { container, antialias, alpha, cameraConfig } = options;
    
    this._container = container;

    // Configure camera if options provided
    if (cameraConfig) {
      this._cameraManager.configure(cameraConfig);
    }

    // Initialize the renderer with the container
    const renderOptions: RenderManagerOptions = {};
    if (antialias !== undefined) {
      renderOptions.antialias = antialias;
    }
    if (alpha !== undefined) {
      renderOptions.alpha = alpha;
    }
    this._renderManager.initialize(container, renderOptions);

    // Set initial camera aspect ratio based on container dimensions
    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;
    this._cameraManager.setAspect(width / height);

    // Add default lighting for PBR materials
    this._setupDefaultLighting();

    // Set up the plugin context
    const pluginContext: PluginContext = {
      scene: this._sceneManager.scene,
      camera: this._cameraManager.camera,
      renderer: this._renderManager.renderer,
      container,
    };
    this._pluginSystem.setContext(pluginContext);

    this._isInitialized = true;
  }

  /**
   * Starts the render loop.
   * The render loop will continue until stop() is called or the viewer is disposed.
   * 
   * @throws Error if the ViewerCore has been disposed
   * @throws Error if the ViewerCore has not been initialized
   */
  start(): void {
    if (this._isDisposed) {
      throw new Error('ViewerCore has been disposed');
    }

    if (!this._isInitialized) {
      throw new Error('ViewerCore has not been initialized. Call initialize() first.');
    }

    if (this._isRunning) {
      return; // Already running
    }

    this._isRunning = true;
    this._lastTime = performance.now();
    this._renderLoop();
  }

  /**
   * Stops the render loop.
   * The viewer can be restarted by calling start() again.
   * 
   * @throws Error if the ViewerCore has been disposed
   */
  stop(): void {
    if (this._isDisposed) {
      throw new Error('ViewerCore has been disposed');
    }

    this._isRunning = false;

    if (this._animationFrameId !== null) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
  }

  /**
   * Resizes the renderer and updates the camera aspect ratio.
   * This should be called when the container element resizes.
   * 
   * @param width - The new width in pixels
   * @param height - The new height in pixels
   * @throws Error if the ViewerCore has been disposed
   * @throws Error if the ViewerCore has not been initialized
   * 
   * Requirements:
   * - 4.4: Update the Camera aspect ratio and Renderer size when container resizes
   */
  resize(width: number, height: number): void {
    if (this._isDisposed) {
      throw new Error('ViewerCore has been disposed');
    }

    if (!this._isInitialized) {
      throw new Error('ViewerCore has not been initialized. Call initialize() first.');
    }

    // Ensure valid dimensions
    const validWidth = Math.max(1, width);
    const validHeight = Math.max(1, height);

    // Update camera aspect ratio
    this._cameraManager.setAspect(validWidth / validHeight);

    // Update renderer size
    this._renderManager.setSize(validWidth, validHeight);
  }

  /**
   * Disposes of the ViewerCore and all its resources.
   * This method should be called when the viewer is unmounted to prevent memory leaks.
   * 
   * Disposal order:
   * 1. Stop the render loop
   * 2. Dispose plugins (may reference core objects)
   * 3. Dispose renderer (WebGL resources)
   * 4. Dispose scene (3D objects, materials, textures)
   * 5. Dispose camera (usually no-op)
   * 
   * After disposal, the ViewerCore cannot be used.
   * 
   * Requirements:
   * - 4.3: Properly dispose of all Three.js resources to prevent memory leaks
   */
  dispose(): void {
    if (this._isDisposed) {
      return;
    }

    // Stop the render loop first
    this.stop();

    // Dispose in the correct order to prevent issues with references
    // 1. Dispose plugins first (they may reference core objects)
    this._pluginSystem.disposeAll();

    // 2. Dispose renderer (WebGL resources)
    this._renderManager.dispose();

    // 3. Dispose scene (3D objects, materials, textures)
    this._sceneManager.dispose();

    // 4. Dispose camera (usually no-op, but marks as disposed)
    this._cameraManager.dispose();

    // Clear references
    this._container = null;
    this._isInitialized = false;
    this._isDisposed = true;
  }

  /**
   * The main render loop.
   * Calculates deltaTime, updates all plugins, and renders the scene.
   */
  private _renderLoop = (): void => {
    if (!this._isRunning || this._isDisposed) {
      return;
    }

    // Calculate delta time in seconds
    const currentTime = performance.now();
    const deltaTime = (currentTime - this._lastTime) / 1000;
    this._lastTime = currentTime;

    // Update all plugins with the delta time
    this._pluginSystem.updateAll(deltaTime);

    // Render the scene
    this._renderManager.render(
      this._sceneManager.scene,
      this._cameraManager.camera
    );

    // Schedule the next frame
    this._animationFrameId = requestAnimationFrame(this._renderLoop);
  };

  /**
   * Sets up default lighting for the scene.
   * Adds ambient light and directional lights to properly illuminate PBR materials.
   */
  private _setupDefaultLighting(): void {
    const scene = this._sceneManager.scene;

    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Main directional light (key light)
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 10, 7.5);
    scene.add(mainLight);

    // Fill light from opposite side
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // Hemisphere light for natural sky/ground lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);
  }
}
