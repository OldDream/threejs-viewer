var pe = Object.defineProperty;
var me = (h, e, t) => e in h ? pe(h, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : h[e] = t;
var i = (h, e, t) => me(h, typeof e != "symbol" ? e + "" : e, t);
import * as o from "three";
import { GLTFLoader as fe, OrbitControls as ge } from "three-stdlib";
import be, { createContext as we, useState as ie, useRef as D, useCallback as ne, useEffect as P, useMemo as Me, forwardRef as ve, useImperativeHandle as Pe, useContext as xe } from "react";
class ye {
  constructor() {
    i(this, "_scene");
    i(this, "_isDisposed", !1);
    this._scene = new o.Scene();
  }
  /**
   * Gets the underlying Three.js Scene instance.
   * @returns The THREE.Scene instance
   */
  get scene() {
    return this._scene;
  }
  /**
   * Adds a 3D object to the scene.
   * @param object - The THREE.Object3D to add to the scene
   * @throws Error if the SceneManager has been disposed
   */
  add(e) {
    if (this._isDisposed)
      throw new Error("SceneManager has been disposed");
    this._scene.add(e);
  }
  /**
   * Removes a 3D object from the scene.
   * @param object - The THREE.Object3D to remove from the scene
   * @throws Error if the SceneManager has been disposed
   */
  remove(e) {
    if (this._isDisposed)
      throw new Error("SceneManager has been disposed");
    this._scene.remove(e);
  }
  /**
   * Clears all objects from the scene.
   * This method removes all children from the scene and disposes of their resources.
   * @throws Error if the SceneManager has been disposed
   */
  clear() {
    if (this._isDisposed)
      throw new Error("SceneManager has been disposed");
    for (; this._scene.children.length > 0; ) {
      const e = this._scene.children[0];
      e && (this._disposeObject(e), this._scene.remove(e));
    }
  }
  /**
   * Disposes of the SceneManager and all its resources.
   * This method should be called when the viewer is unmounted to prevent memory leaks.
   * After disposal, the SceneManager cannot be used.
   */
  dispose() {
    this._isDisposed || (this.clear(), this._scene.background && (this._scene.background instanceof o.Texture && this._scene.background.dispose(), this._scene.background = null), this._scene.environment && (this._scene.environment.dispose(), this._scene.environment = null), this._isDisposed = !0);
  }
  /**
   * Recursively disposes of an object and all its children.
   * Handles geometry, materials, and textures disposal.
   * @param object - The THREE.Object3D to dispose
   */
  _disposeObject(e) {
    for (; e.children.length > 0; ) {
      const t = e.children[0];
      t && (this._disposeObject(t), e.remove(t));
    }
    e instanceof o.Mesh && (e.geometry && e.geometry.dispose(), e.material && this._disposeMaterial(e.material)), (e instanceof o.Line || e instanceof o.Points) && (e.geometry && e.geometry.dispose(), e.material && this._disposeMaterial(e.material));
  }
  /**
   * Disposes of a material or array of materials.
   * Also disposes of any textures associated with the material.
   * @param material - The material or array of materials to dispose
   */
  _disposeMaterial(e) {
    Array.isArray(e) ? e.forEach((t) => this._disposeSingleMaterial(t)) : this._disposeSingleMaterial(e);
  }
  /**
   * Disposes of a single material and its textures.
   * @param material - The material to dispose
   */
  _disposeSingleMaterial(e) {
    [
      "map",
      "lightMap",
      "bumpMap",
      "normalMap",
      "specularMap",
      "envMap",
      "alphaMap",
      "aoMap",
      "displacementMap",
      "emissiveMap",
      "gradientMap",
      "metalnessMap",
      "roughnessMap"
    ].forEach((n) => {
      const r = e[n];
      r instanceof o.Texture && r.dispose();
    }), e.dispose();
  }
}
const Z = {
  fov: 75,
  near: 0.01,
  // Smaller near plane to prevent clipping when rotating close to model
  far: 1e4,
  // Larger far plane for viewing large models from distance
  position: new o.Vector3(0, 0, 5)
};
class Ee {
  constructor(e) {
    i(this, "_camera");
    i(this, "_isDisposed", !1);
    const t = (e == null ? void 0 : e.fov) ?? Z.fov, n = (e == null ? void 0 : e.near) ?? Z.near, r = (e == null ? void 0 : e.far) ?? Z.far, a = (e == null ? void 0 : e.position) ?? Z.position.clone();
    this._camera = new o.PerspectiveCamera(t, 1, n, r), this._camera.position.copy(a);
  }
  /**
   * Gets the underlying Three.js PerspectiveCamera instance.
   * @returns The THREE.PerspectiveCamera instance
   */
  get camera() {
    return this._camera;
  }
  /**
   * Configures the camera with the provided options.
   * Only updates the properties that are specified in the config.
   * @param config - The camera configuration options
   * @throws Error if the CameraManager has been disposed
   */
  configure(e) {
    if (this._isDisposed)
      throw new Error("CameraManager has been disposed");
    e.fov !== void 0 && (this._camera.fov = e.fov), e.near !== void 0 && (this._camera.near = e.near), e.far !== void 0 && (this._camera.far = e.far), e.position !== void 0 && this._camera.position.copy(e.position), this._camera.updateProjectionMatrix();
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
  setAspect(e) {
    if (this._isDisposed)
      throw new Error("CameraManager has been disposed");
    (e <= 0 || !Number.isFinite(e)) && (console.warn("CameraManager: Invalid aspect ratio provided, using 1"), e = 1), this._camera.aspect = e, this._camera.updateProjectionMatrix();
  }
  /**
   * Sets the camera to look at a specific target point.
   * @param target - The THREE.Vector3 point to look at
   * @throws Error if the CameraManager has been disposed
   */
  lookAt(e) {
    if (this._isDisposed)
      throw new Error("CameraManager has been disposed");
    this._camera.lookAt(e);
  }
  /**
   * Disposes of the CameraManager and its resources.
   * This method should be called when the viewer is unmounted to prevent memory leaks.
   * After disposal, the CameraManager cannot be used.
   * 
   * Note: THREE.PerspectiveCamera doesn't have a dispose method,
   * but we mark the manager as disposed to prevent further use.
   */
  dispose() {
    this._isDisposed || (this._isDisposed = !0);
  }
}
const oe = {
  antialias: !0,
  alpha: !1
};
class De {
  constructor() {
    i(this, "_renderer", null);
    i(this, "_container", null);
    i(this, "_isDisposed", !1);
    i(this, "_isInitialized", !1);
  }
  /**
   * Gets the underlying Three.js WebGLRenderer instance.
   * @returns The THREE.WebGLRenderer instance
   * @throws Error if the RenderManager has not been initialized
   */
  get renderer() {
    if (!this._renderer)
      throw new Error("RenderManager has not been initialized. Call initialize() first.");
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
  initialize(e, t) {
    if (this._isDisposed)
      throw new Error("RenderManager has been disposed");
    if (this._isInitialized)
      throw new Error("RenderManager has already been initialized");
    const n = (t == null ? void 0 : t.antialias) ?? oe.antialias, r = (t == null ? void 0 : t.alpha) ?? oe.alpha;
    this._renderer = new o.WebGLRenderer({
      antialias: n,
      alpha: r
    }), this._renderer.setPixelRatio(window.devicePixelRatio);
    const a = e.clientWidth || 1, c = e.clientHeight || 1;
    this._renderer.setSize(a, c), e.appendChild(this._renderer.domElement), this._container = e, this._isInitialized = !0;
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
  setSize(e, t) {
    if (this._isDisposed)
      throw new Error("RenderManager has been disposed");
    if (!this._renderer)
      throw new Error("RenderManager has not been initialized. Call initialize() first.");
    const n = Math.max(1, Math.floor(e)), r = Math.max(1, Math.floor(t));
    this._renderer.setSize(n, r);
  }
  /**
   * Renders the scene using the provided camera.
   * @param scene - The THREE.Scene to render
   * @param camera - The THREE.Camera to use for rendering
   * @throws Error if the RenderManager has been disposed
   * @throws Error if the RenderManager has not been initialized
   */
  render(e, t) {
    if (this._isDisposed)
      throw new Error("RenderManager has been disposed");
    if (!this._renderer)
      throw new Error("RenderManager has not been initialized. Call initialize() first.");
    this._renderer.render(e, t);
  }
  /**
   * Disposes of the RenderManager and all its resources.
   * This method removes the canvas from the DOM and disposes of the WebGLRenderer.
   * After disposal, the RenderManager cannot be used.
   * 
   * Requirements:
   * - 4.3: Properly dispose of all Three.js resources to prevent memory leaks
   */
  dispose() {
    this._isDisposed || (this._renderer && (this._container && this._renderer.domElement.parentElement === this._container && this._container.removeChild(this._renderer.domElement), this._renderer.dispose(), this._renderer = null), this._container = null, this._isInitialized = !1, this._isDisposed = !0);
  }
}
class Ce {
  constructor() {
    i(this, "_plugins", /* @__PURE__ */ new Map());
    i(this, "_context", null);
    i(this, "_isDisposed", !1);
  }
  /**
   * Sets the plugin context that will be provided to all registered plugins.
   * This must be called before registering any plugins.
   * @param context - The plugin context containing core Three.js objects
   */
  setContext(e) {
    if (this._isDisposed)
      throw new Error("PluginSystem has been disposed");
    this._context = e;
  }
  /**
   * Gets the current plugin context.
   * @returns The current plugin context or null if not set
   */
  getContext() {
    return this._context;
  }
  /**
   * Registers a plugin with the system.
   * The plugin will be initialized with the current context.
   * 
   * @param plugin - The plugin to register
   * @throws Error if the PluginSystem has been disposed
   * @throws Error if no context has been set
   * @throws Error if a plugin with the same name is already registered
   * 
   * Requirements:
   * - 5.1: Allow registering feature modules
   * - 5.2: Provide the plugin with access to Scene, Camera, and Renderer
   */
  register(e) {
    if (this._isDisposed)
      throw new Error("PluginSystem has been disposed");
    if (!this._context)
      throw new Error("Plugin context has not been set. Call setContext() before registering plugins.");
    if (this._plugins.has(e.name))
      throw new Error(`Plugin "${e.name}" is already registered`);
    e.initialize(this._context), this._plugins.set(e.name, e);
  }
  /**
   * Unregisters a plugin from the system.
   * The plugin's dispose method will be called.
   * 
   * @param pluginName - The name of the plugin to unregister
   * @throws Error if the PluginSystem has been disposed
   * 
   * Requirements:
   * - 5.1: Allow unregistering feature modules
   * - 5.3: Call the plugin's cleanup method when unregistered
   */
  unregister(e) {
    if (this._isDisposed)
      throw new Error("PluginSystem has been disposed");
    const t = this._plugins.get(e);
    t && (t.dispose(), this._plugins.delete(e));
  }
  /**
   * Gets a registered plugin by name.
   * 
   * @param pluginName - The name of the plugin to retrieve
   * @returns The plugin instance or undefined if not found
   */
  get(e) {
    return this._plugins.get(e);
  }
  /**
   * Checks if a plugin is registered.
   * 
   * @param pluginName - The name of the plugin to check
   * @returns True if the plugin is registered, false otherwise
   */
  has(e) {
    return this._plugins.has(e);
  }
  /**
   * Gets the names of all registered plugins.
   * 
   * @returns An array of registered plugin names
   */
  getPluginNames() {
    return Array.from(this._plugins.keys());
  }
  /**
   * Gets the count of registered plugins.
   * 
   * @returns The number of registered plugins
   */
  get pluginCount() {
    return this._plugins.size;
  }
  /**
   * Updates all registered plugins.
   * Calls the update method on each plugin that has one.
   * 
   * @param deltaTime - Time elapsed since the last frame in seconds
   * @throws Error if the PluginSystem has been disposed
   * 
   * Requirements:
   * - 5.5: Notify all registered plugins when the render loop executes
   */
  updateAll(e) {
    if (this._isDisposed)
      throw new Error("PluginSystem has been disposed");
    for (const t of this._plugins.values())
      if (t.update)
        try {
          t.update(e);
        } catch (n) {
          console.error(`Error updating plugin "${t.name}":`, n);
        }
  }
  /**
   * Disposes of all registered plugins.
   * Calls the dispose method on each plugin and clears the registry.
   * 
   * Requirements:
   * - 5.3: Call the plugin's cleanup method
   */
  disposeAll() {
    if (!this._isDisposed) {
      for (const e of this._plugins.values())
        try {
          e.dispose();
        } catch (t) {
          console.error(`Error disposing plugin "${e.name}":`, t);
        }
      this._plugins.clear(), this._context = null, this._isDisposed = !0;
    }
  }
}
class Se {
  constructor() {
    i(this, "_sceneManager");
    i(this, "_cameraManager");
    i(this, "_renderManager");
    i(this, "_pluginSystem");
    i(this, "_container", null);
    i(this, "_isInitialized", !1);
    i(this, "_isRunning", !1);
    i(this, "_isDisposed", !1);
    i(this, "_animationFrameId", null);
    i(this, "_lastTime", 0);
    /**
     * The main render loop.
     * Calculates deltaTime, updates all plugins, and renders the scene.
     */
    i(this, "_renderLoop", () => {
      if (!this._isRunning || this._isDisposed)
        return;
      const e = performance.now(), t = (e - this._lastTime) / 1e3;
      this._lastTime = e, this._pluginSystem.updateAll(t), this._renderManager.render(
        this._sceneManager.scene,
        this._cameraManager.camera
      ), this._animationFrameId = requestAnimationFrame(this._renderLoop);
    });
    this._sceneManager = new ye(), this._cameraManager = new Ee(), this._renderManager = new De(), this._pluginSystem = new Ce();
  }
  /**
   * Gets the SceneManager instance.
   * @returns The SceneManager instance
   */
  get scene() {
    return this._sceneManager;
  }
  /**
   * Gets the CameraManager instance.
   * @returns The CameraManager instance
   */
  get camera() {
    return this._cameraManager;
  }
  /**
   * Gets the RenderManager instance.
   * @returns The RenderManager instance
   */
  get renderer() {
    return this._renderManager;
  }
  /**
   * Gets the PluginSystem instance.
   * @returns The PluginSystem instance
   */
  get plugins() {
    return this._pluginSystem;
  }
  /**
   * Gets whether the viewer is currently running.
   * @returns True if the render loop is active
   */
  get isRunning() {
    return this._isRunning;
  }
  /**
   * Gets whether the viewer has been initialized.
   * @returns True if initialize() has been called
   */
  get isInitialized() {
    return this._isInitialized;
  }
  /**
   * Gets the container element.
   * @returns The container element or null if not initialized
   */
  get container() {
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
  initialize(e) {
    if (this._isDisposed)
      throw new Error("ViewerCore has been disposed");
    if (this._isInitialized)
      throw new Error("ViewerCore has already been initialized");
    const { container: t, antialias: n, alpha: r, cameraConfig: a } = e;
    this._container = t, a && this._cameraManager.configure(a);
    const c = {};
    n !== void 0 && (c.antialias = n), r !== void 0 && (c.alpha = r), this._renderManager.initialize(t, c);
    const f = t.clientWidth || 1, b = t.clientHeight || 1;
    this._cameraManager.setAspect(f / b), this._setupDefaultLighting();
    const m = {
      scene: this._sceneManager.scene,
      camera: this._cameraManager.camera,
      renderer: this._renderManager.renderer,
      container: t
    };
    this._pluginSystem.setContext(m), this._isInitialized = !0;
  }
  /**
   * Starts the render loop.
   * The render loop will continue until stop() is called or the viewer is disposed.
   * 
   * @throws Error if the ViewerCore has been disposed
   * @throws Error if the ViewerCore has not been initialized
   */
  start() {
    if (this._isDisposed)
      throw new Error("ViewerCore has been disposed");
    if (!this._isInitialized)
      throw new Error("ViewerCore has not been initialized. Call initialize() first.");
    this._isRunning || (this._isRunning = !0, this._lastTime = performance.now(), this._renderLoop());
  }
  /**
   * Stops the render loop.
   * The viewer can be restarted by calling start() again.
   * 
   * @throws Error if the ViewerCore has been disposed
   */
  stop() {
    if (this._isDisposed)
      throw new Error("ViewerCore has been disposed");
    this._isRunning = !1, this._animationFrameId !== null && (cancelAnimationFrame(this._animationFrameId), this._animationFrameId = null);
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
  resize(e, t) {
    if (this._isDisposed)
      throw new Error("ViewerCore has been disposed");
    if (!this._isInitialized)
      throw new Error("ViewerCore has not been initialized. Call initialize() first.");
    const n = Math.max(1, e), r = Math.max(1, t);
    this._cameraManager.setAspect(n / r), this._renderManager.setSize(n, r);
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
  dispose() {
    this._isDisposed || (this.stop(), this._pluginSystem.disposeAll(), this._renderManager.dispose(), this._sceneManager.dispose(), this._cameraManager.dispose(), this._container = null, this._isInitialized = !1, this._isDisposed = !0);
  }
  /**
   * Sets up default lighting for the scene.
   * Adds ambient light and directional lights to properly illuminate PBR materials.
   */
  _setupDefaultLighting() {
    const e = this._sceneManager.scene, t = new o.AmbientLight(16777215, 0.5);
    e.add(t);
    const n = new o.DirectionalLight(16777215, 1);
    n.position.set(5, 10, 7.5), e.add(n);
    const r = new o.DirectionalLight(16777215, 0.5);
    r.position.set(-5, 5, -5), e.add(r);
    const a = new o.HemisphereLight(16777215, 4473924, 0.5);
    a.position.set(0, 20, 0), e.add(a);
  }
}
class Te {
  constructor() {
    i(this, "name", "ModelLoaderPlugin");
    i(this, "_context", null);
    i(this, "_loader");
    i(this, "_currentModel", null);
    i(this, "_boundingBox", null);
    i(this, "_center", null);
    i(this, "_loadingState", {
      isLoading: !1,
      progress: 0,
      error: null
    });
    i(this, "_isDisposed", !1);
    i(this, "_loadRequestId", 0);
    this._loader = new fe();
  }
  /**
   * Gets the current loading state.
   * 
   * Requirements:
   * - 1.4: Provide a loading state that can be queried
   */
  get loadingState() {
    return { ...this._loadingState };
  }
  /**
   * Initialize the plugin with the provided context.
   * @param context - The plugin context containing core Three.js objects
   */
  initialize(e) {
    if (this._isDisposed)
      throw new Error("ModelLoaderPlugin has been disposed");
    this._context = e;
  }
  /**
   * Loads a GLTF/GLB model from the specified URL.
   * 
   * @param url - The URL of the GLTF/GLB model to load
   * @returns A promise that resolves with the ModelLoadResult
   * @throws Error if the plugin is not initialized or has been disposed
   * @throws Error if the model loading fails
   * 
   * Requirements:
   * - 1.1: Load the model and add it to the Scene
   * - 1.2: Calculate the model's bounding box center
   * - 1.3: Emit an error event with descriptive error information on failure
   * - 1.4: Provide a loading state that can be queried
   * - 1.5: Dispose of the previous model before loading the new one
   */
  async load(e) {
    if (this._isDisposed)
      throw new Error("ModelLoaderPlugin has been disposed");
    if (!this._context)
      throw new Error("ModelLoaderPlugin has not been initialized. Call initialize() first.");
    this._currentModel && this.unload();
    const t = ++this._loadRequestId;
    this._loadingState = {
      isLoading: !0,
      progress: 0,
      error: null
    };
    try {
      const n = await this._loadGLTF(e);
      if (t !== this._loadRequestId)
        throw this._disposeObject(n.scene), new Error("Model loading cancelled due to new request");
      const r = n.scene;
      this._context.scene.add(r), this._currentModel = r;
      const a = new o.Box3().setFromObject(r), c = new o.Vector3();
      return a.getCenter(c), this._boundingBox = a, this._center = c, this._loadingState = {
        isLoading: !1,
        progress: 100,
        error: null
      }, {
        model: r,
        boundingBox: a,
        center: c
      };
    } catch (n) {
      if (t !== this._loadRequestId)
        throw n;
      const r = n instanceof Error ? n : new Error(`Failed to load model from URL: ${e}`);
      throw this._loadingState = {
        isLoading: !1,
        progress: 0,
        error: r
      }, r;
    }
  }
  /**
   * Unloads the current model and disposes of its resources.
   * 
   * Requirements:
   * - 1.5: Dispose of the previous model
   */
  unload() {
    this._currentModel && this._context && (this._context.scene.remove(this._currentModel), this._disposeObject(this._currentModel), this._currentModel = null, this._boundingBox = null, this._center = null);
  }
  /**
   * Gets the center point of the currently loaded model.
   * 
   * @returns The center point as a Vector3, or null if no model is loaded
   * 
   * Requirements:
   * - 1.2: Calculate the model's bounding box center
   */
  getCenter() {
    return this._center ? this._center.clone() : null;
  }
  /**
   * Gets the bounding box of the currently loaded model.
   * 
   * @returns The bounding box as a Box3, or null if no model is loaded
   * 
   * Requirements:
   * - 1.2: Calculate the model's bounding box
   */
  getBoundingBox() {
    return this._boundingBox ? this._boundingBox.clone() : null;
  }
  /**
   * Disposes of the plugin and all its resources.
   * This method should be called when the plugin is unregistered.
   */
  dispose() {
    this._isDisposed || (this.unload(), this._context = null, this._isDisposed = !0);
  }
  /**
   * Loads a GLTF model using the GLTFLoader with progress tracking.
   * 
   * @param url - The URL of the GLTF/GLB model to load
   * @returns A promise that resolves with the loaded GLTF object
   */
  _loadGLTF(e) {
    return new Promise((t, n) => {
      this._loader.load(
        e,
        // onLoad callback
        (r) => {
          t(r);
        },
        // onProgress callback
        (r) => {
          if (r.lengthComputable) {
            const a = r.loaded / r.total * 100;
            this._loadingState = {
              ...this._loadingState,
              progress: Math.round(a)
            };
          }
        },
        // onError callback
        (r) => {
          const a = r instanceof Error ? r.message : `Failed to load model from URL: ${e}`;
          n(new Error(a));
        }
      );
    });
  }
  /**
   * Recursively disposes of an object and all its children.
   * Handles geometry, materials, and textures disposal.
   * 
   * @param object - The THREE.Object3D to dispose
   */
  _disposeObject(e) {
    for (; e.children.length > 0; ) {
      const t = e.children[0];
      t && (this._disposeObject(t), e.remove(t));
    }
    e instanceof o.Mesh && (e.geometry && e.geometry.dispose(), e.material && this._disposeMaterial(e.material)), (e instanceof o.Line || e instanceof o.Points) && (e.geometry && e.geometry.dispose(), e.material && this._disposeMaterial(e.material)), e instanceof o.SkinnedMesh && e.skeleton && e.skeleton.dispose();
  }
  /**
   * Disposes of a material or array of materials.
   * Also disposes of any textures associated with the material.
   * 
   * @param material - The material or array of materials to dispose
   */
  _disposeMaterial(e) {
    Array.isArray(e) ? e.forEach((t) => this._disposeSingleMaterial(t)) : this._disposeSingleMaterial(e);
  }
  /**
   * Disposes of a single material and its textures.
   * 
   * @param material - The material to dispose
   */
  _disposeSingleMaterial(e) {
    [
      "map",
      "lightMap",
      "bumpMap",
      "normalMap",
      "specularMap",
      "envMap",
      "alphaMap",
      "aoMap",
      "displacementMap",
      "emissiveMap",
      "gradientMap",
      "metalnessMap",
      "roughnessMap",
      "clearcoatMap",
      "clearcoatNormalMap",
      "clearcoatRoughnessMap",
      "transmissionMap",
      "thicknessMap",
      "sheenColorMap",
      "sheenRoughnessMap"
    ].forEach((n) => {
      const r = e[n];
      r instanceof o.Texture && r.dispose();
    }), e.dispose();
  }
}
class Ae {
  constructor() {
    i(this, "name", "OrbitControlsPlugin");
    i(this, "_context", null);
    i(this, "_controls", null);
    i(this, "_isDisposed", !1);
    // Store initial state for reset functionality
    i(this, "_initialTarget", new o.Vector3(0, 0, 0));
    i(this, "_initialCameraPosition", new o.Vector3(0, 0, 5));
    i(this, "_initialMinDistance", 0.1);
    // Allow closer zoom with smaller near plane
    i(this, "_initialMaxDistance", 1e4);
  }
  /**
   * Gets the OrbitControls instance.
   * @throws Error if the plugin has not been initialized
   */
  get controls() {
    if (!this._controls)
      throw new Error("OrbitControlsPlugin has not been initialized. Call initialize() first.");
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
  initialize(e) {
    if (this._isDisposed)
      throw new Error("OrbitControlsPlugin has been disposed");
    this._context = e, this._controls = new ge(e.camera, e.container), this._initialCameraPosition.copy(e.camera.position), this._controls.minDistance = this._initialMinDistance, this._controls.maxDistance = this._initialMaxDistance, this._controls.enableDamping = !0, this._controls.dampingFactor = 0.05, this._controls.enablePan = !0, this._controls.enableRotate = !0, this._controls.enableZoom = !0;
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
  configure(e) {
    if (this._isDisposed)
      throw new Error("OrbitControlsPlugin has been disposed");
    if (!this._controls)
      throw new Error("OrbitControlsPlugin has not been initialized. Call initialize() first.");
    e.target !== void 0 && (this._controls.target.copy(e.target), this._initialTarget.copy(e.target)), e.minDistance !== void 0 && (this._controls.minDistance = e.minDistance, this._initialMinDistance = e.minDistance), e.maxDistance !== void 0 && (this._controls.maxDistance = e.maxDistance, this._initialMaxDistance = e.maxDistance), e.enableDamping !== void 0 && (this._controls.enableDamping = e.enableDamping), e.dampingFactor !== void 0 && (this._controls.dampingFactor = e.dampingFactor), e.enablePan !== void 0 && (this._controls.enablePan = e.enablePan), e.enableRotate !== void 0 && (this._controls.enableRotate = e.enableRotate), e.enableZoom !== void 0 && (this._controls.enableZoom = e.enableZoom), this._controls.update();
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
  setTarget(e) {
    if (this._isDisposed)
      throw new Error("OrbitControlsPlugin has been disposed");
    if (!this._controls)
      throw new Error("OrbitControlsPlugin has not been initialized. Call initialize() first.");
    this._controls.target.copy(e), this._initialTarget.copy(e), this._controls.update();
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
  setZoomLimits(e, t) {
    if (this._isDisposed)
      throw new Error("OrbitControlsPlugin has been disposed");
    if (!this._controls)
      throw new Error("OrbitControlsPlugin has not been initialized. Call initialize() first.");
    if (e > t)
      throw new Error("Minimum zoom distance cannot be greater than maximum zoom distance");
    if (e < 0)
      throw new Error("Minimum zoom distance cannot be negative");
    this._controls.minDistance = e, this._controls.maxDistance = t, this._initialMinDistance = e, this._initialMaxDistance = t, this._controls.update();
  }
  /**
   * Resets the controls to their initial state.
   * Restores the target, camera position, and zoom limits to their initial values.
   * 
   * @throws Error if the plugin has not been initialized or has been disposed
   */
  reset() {
    if (this._isDisposed)
      throw new Error("OrbitControlsPlugin has been disposed");
    if (!this._controls || !this._context)
      throw new Error("OrbitControlsPlugin has not been initialized. Call initialize() first.");
    this._controls.target.copy(this._initialTarget), this._context.camera.position.copy(this._initialCameraPosition), this._controls.minDistance = this._initialMinDistance, this._controls.maxDistance = this._initialMaxDistance, this._controls.update();
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
  update(e) {
    this._isDisposed || !this._controls || this._controls.update();
  }
  /**
   * Disposes of the plugin and all its resources.
   * This method should be called when the plugin is unregistered.
   */
  dispose() {
    this._isDisposed || (this._controls && (this._controls.dispose(), this._controls = null), this._context = null, this._isDisposed = !0);
  }
}
class ze {
  constructor() {
    i(this, "name", "GridHelperPlugin");
    i(this, "_context", null);
    i(this, "_gridHelper", null);
    i(this, "_axesHelper", null);
    i(this, "_isDisposed", !1);
    i(this, "_config", {
      size: 10,
      divisions: 10,
      colorCenterLine: 4473924,
      colorGrid: 8947848,
      plane: "XZ",
      showAxes: !0,
      axesSize: 5
    });
  }
  initialize(e) {
    if (this._isDisposed)
      throw new Error("GridHelperPlugin has been disposed");
    this._context = e, this._createGrid(), this._createAxes();
  }
  _createGrid() {
    this._context && (this._gridHelper && (this._context.scene.remove(this._gridHelper), this._disposeHelper(this._gridHelper)), this._gridHelper = new o.GridHelper(
      this._config.size,
      this._config.divisions,
      this._config.colorCenterLine,
      this._config.colorGrid
    ), this._applyPlaneRotation(), this._context.scene.add(this._gridHelper));
  }
  _createAxes() {
    this._context && (this._axesHelper && (this._context.scene.remove(this._axesHelper), this._disposeHelper(this._axesHelper)), this._config.showAxes && (this._axesHelper = new o.AxesHelper(this._config.axesSize), this._context.scene.add(this._axesHelper)));
  }
  _disposeHelper(e) {
    if (!e) return;
    const t = e;
    if (t.geometry && t.geometry.dispose(), t.material) {
      const n = t.material;
      Array.isArray(n) ? n.forEach((r) => r.dispose()) : n.dispose();
    }
  }
  _applyPlaneRotation() {
    if (this._gridHelper)
      switch (this._gridHelper.rotation.set(0, 0, 0), this._config.plane) {
        case "XY":
          this._gridHelper.rotation.x = Math.PI / 2;
          break;
        case "YZ":
          this._gridHelper.rotation.z = Math.PI / 2;
          break;
      }
  }
  configure(e) {
    if (this._isDisposed)
      throw new Error("GridHelperPlugin has been disposed");
    e.size !== void 0 && (this._config.size = e.size), e.divisions !== void 0 && (this._config.divisions = e.divisions), e.colorCenterLine !== void 0 && (this._config.colorCenterLine = e.colorCenterLine), e.colorGrid !== void 0 && (this._config.colorGrid = e.colorGrid), e.plane !== void 0 && (this._config.plane = e.plane), e.showAxes !== void 0 && (this._config.showAxes = e.showAxes), e.axesSize !== void 0 && (this._config.axesSize = e.axesSize), this._createGrid(), this._createAxes();
  }
  setVisible(e) {
    this._gridHelper && (this._gridHelper.visible = e);
  }
  setPlane(e) {
    this._config.plane = e, this._applyPlaneRotation();
  }
  setAxesVisible(e) {
    this._config.showAxes = e, this._createAxes();
  }
  dispose() {
    this._isDisposed || (this._gridHelper && this._context && (this._context.scene.remove(this._gridHelper), this._disposeHelper(this._gridHelper), this._gridHelper = null), this._axesHelper && this._context && (this._context.scene.remove(this._axesHelper), this._disposeHelper(this._axesHelper), this._axesHelper = null), this._context = null, this._isDisposed = !0);
  }
}
const ae = {
  KeyW: "forward",
  KeyS: "backward",
  KeyA: "left",
  KeyD: "right",
  ShiftLeft: "up",
  ShiftRight: "up",
  ControlLeft: "down",
  ControlRight: "down"
  /* DOWN */
};
function X() {
  return {
    forward: !1,
    backward: !1,
    left: !1,
    right: !1,
    up: !1,
    down: !1
  };
}
const Re = 5, Ie = !0;
class Ye {
  constructor() {
    /**
     * 插件名称
     * 
     * Requirements:
     * - 4.1: THE Camera_Movement_Plugin SHALL 实现 Plugin 接口
     */
    i(this, "name", "CameraMovementPlugin");
    /**
     * 插件上下文，包含 Three.js 核心对象
     */
    i(this, "_context", null);
    /**
     * 是否启用移动控制
     * 
     * Requirements:
     * - 2.1: THE Camera_Movement_Plugin SHALL 提供 enabled 属性用于控制移动功能的启用状态
     * - 2.4: THE Camera_Movement_Plugin SHALL 默认启用移动功能
     */
    i(this, "_enabled", Ie);
    /**
     * 基础移动速度
     * 
     * Requirements:
     * - 3.1: THE Camera_Movement_Plugin SHALL 提供 moveSpeed 配置项用于设置基础移动速度
     * - 3.2: WHEN moveSpeed 未配置 THEN Camera_Movement_Plugin SHALL 使用默认速度值 5.0
     */
    i(this, "_moveSpeed", Re);
    /**
     * 是否启用飞行模式（CS模式）
     */
    i(this, "_flyMode", !1);
    /**
     * 移动状态，记录当前按下的移动键
     */
    i(this, "_movementState", X());
    /**
     * 插件是否已被销毁
     */
    i(this, "_isDisposed", !1);
    /**
     * 绑定的 keydown 事件处理器
     * 保存引用以便在 dispose 时移除
     */
    i(this, "_boundHandleKeyDown", null);
    /**
     * 绑定的 keyup 事件处理器
     * 保存引用以便在 dispose 时移除
     */
    i(this, "_boundHandleKeyUp", null);
    /**
     * OrbitControls 的 target 引用
     * 用于 FPS 风格移动时同步移动观察目标
     */
    i(this, "_orbitControlsTarget", null);
    /**
     * 临时向量，用于计算移动方向，避免在 update 循环中创建新对象
     */
    i(this, "_tempMovement", new o.Vector3());
    i(this, "_tempForward", new o.Vector3());
    i(this, "_tempRight", new o.Vector3());
    i(this, "_tempWorldUp", new o.Vector3(0, 1, 0));
    i(this, "_tempCameraUp", new o.Vector3(0, 1, 0));
  }
  /**
   * 初始化插件
   * 在插件被注册到 PluginSystem 时调用
   * 
   * @param context - 插件上下文，包含 Three.js 核心对象
   * @throws Error 如果插件已被销毁
   * 
   * Requirements:
   * - 4.1: THE Camera_Movement_Plugin SHALL 实现 Plugin 接口
   * - 4.2: WHEN Camera_Movement_Plugin 被注册到 PluginSystem THEN Camera_Movement_Plugin SHALL 在 initialize 方法中设置键盘事件监听
   */
  initialize(e) {
    if (this._isDisposed)
      throw new Error("CameraMovementPlugin has been disposed");
    this._context = e, this._movementState = X(), this._boundHandleKeyDown = this.handleKeyDown.bind(this), this._boundHandleKeyUp = this.handleKeyUp.bind(this), window.addEventListener("keydown", this._boundHandleKeyDown), window.addEventListener("keyup", this._boundHandleKeyUp);
  }
  /**
   * 更新插件状态
   * 在每帧渲染循环中调用，用于更新相机位置
   * 
   * @param deltaTime - 自上一帧以来经过的时间（秒）
   * 
   * Requirements:
   * - 4.4: WHEN 渲染循环执行 THEN Camera_Movement_Plugin SHALL 在 update 方法中更新相机位置
   * - 3.3: THE Camera_Movement_Plugin SHALL 基于 deltaTime 计算实际移动距离以确保帧率无关的平滑移动
   * - 1.8: WHEN 用户释放所有移动键 THEN Camera_Movement_Plugin SHALL 停止相机移动
   */
  update(e) {
    if (this._isDisposed || !this._context || !this._enabled || !this.isMoving())
      return;
    const t = this._context.camera;
    if (!t)
      return;
    const n = this.calculateMovementVector(t);
    if (n.lengthSq() === 0)
      return;
    const r = this._moveSpeed * e, a = n.multiplyScalar(r);
    t.position.add(a), this._orbitControlsTarget && this._orbitControlsTarget.add(a);
  }
  /**
   * 销毁插件并释放所有资源
   * 在插件被注销或查看器被销毁时调用
   * 
   * Requirements:
   * - 4.3: WHEN Camera_Movement_Plugin 被注销 THEN Camera_Movement_Plugin SHALL 在 dispose 方法中移除所有事件监听器
   */
  dispose() {
    this._isDisposed || (this._boundHandleKeyDown && (window.removeEventListener("keydown", this._boundHandleKeyDown), this._boundHandleKeyDown = null), this._boundHandleKeyUp && (window.removeEventListener("keyup", this._boundHandleKeyUp), this._boundHandleKeyUp = null), this._movementState = X(), this._context = null, this._isDisposed = !0);
  }
  /**
   * 配置插件
   * 
   * @param config - 配置选项
   * @throws Error 如果插件已被销毁
   */
  configure(e) {
    if (this._isDisposed)
      throw new Error("CameraMovementPlugin has been disposed");
    e.enabled !== void 0 && (this._enabled = e.enabled), e.moveSpeed !== void 0 && this.setMoveSpeed(e.moveSpeed), e.flyMode !== void 0 && this.setFlyMode(e.flyMode), e.orbitControlsTarget !== void 0 && (this._orbitControlsTarget = e.orbitControlsTarget);
  }
  /**
   * 设置 OrbitControls 的 target 引用
   * 用于 FPS 风格移动时同步移动观察目标
   * 
   * @param target - OrbitControls 的 target Vector3，传入 null 可清除引用
   */
  setOrbitControlsTarget(e) {
    this._orbitControlsTarget = e;
  }
  /**
   * 设置是否启用飞行模式（CS模式）
   * 
   * @param enabled - 是否启用
   */
  setFlyMode(e) {
    this._flyMode = e;
  }
  /**
   * 获取当前是否为飞行模式
   * 
   * @returns 是否为飞行模式
   */
  isFlyMode() {
    return this._flyMode;
  }
  /**
   * 设置是否启用移动控制
   * 
   * @param enabled - 是否启用
   * @throws Error 如果插件已被销毁
   * 
   * Requirements:
   * - 5.2: THE Camera_Movement_Plugin SHALL 提供 setEnabled(enabled: boolean) 方法用于启用或禁用移动功能
   * - 2.2: WHEN enabled 设置为 false THEN Camera_Movement_Plugin SHALL 忽略所有键盘移动输入
   * - 2.3: WHEN enabled 设置为 true THEN Camera_Movement_Plugin SHALL 响应键盘移动输入
   */
  setEnabled(e) {
    if (this._isDisposed)
      throw new Error("CameraMovementPlugin has been disposed");
    this._enabled = e, e || (this._movementState = X());
  }
  /**
   * 获取当前启用状态
   * 
   * @returns 是否启用
   */
  isEnabled() {
    return this._enabled;
  }
  /**
   * 设置移动速度
   * 
   * @param speed - 移动速度
   * @throws Error 如果插件已被销毁
   * 
   * Requirements:
   * - 5.3: THE Camera_Movement_Plugin SHALL 提供 setMoveSpeed(speed: number) 方法用于动态调整移动速度
   */
  setMoveSpeed(e) {
    if (this._isDisposed)
      throw new Error("CameraMovementPlugin has been disposed");
    this._moveSpeed = Math.abs(e);
  }
  /**
   * 获取当前移动速度
   * 
   * @returns 移动速度
   */
  getMoveSpeed() {
    return this._moveSpeed;
  }
  /**
   * 检查当前是否正在移动
   * 
   * @returns 是否正在移动（至少有一个方向键被按下）
   * 
   * Requirements:
   * - 5.4: THE Camera_Movement_Plugin SHALL 提供 isMoving() 方法返回当前是否正在移动
   */
  isMoving() {
    return this._movementState.forward || this._movementState.backward || this._movementState.left || this._movementState.right || this._movementState.up || this._movementState.down;
  }
  /**
   * 获取当前移动状态（用于测试）
   * 
   * @returns 当前移动状态
   */
  getMovementState() {
    return { ...this._movementState };
  }
  /**
   * 设置移动状态（用于测试）
   * 
   * @param state - 移动状态
   */
  setMovementState(e) {
    this._movementState = {
      ...this._movementState,
      ...e
    };
  }
  /**
   * 获取插件上下文（用于测试）
   * 
   * @returns 插件上下文
   */
  getContext() {
    return this._context;
  }
  /**
   * 检查插件是否已被销毁（用于测试）
   * 
   * @returns 是否已被销毁
   */
  isDisposed() {
    return this._isDisposed;
  }
  /**
   * 计算移动向量
   * 基于相机朝向计算水平面内的前向量和右向量，
   * 根据 movementState 组合最终移动向量
   * 
   * @param camera - Three.js 相机对象
   * @returns 归一化的移动向量（如果没有移动则返回零向量）
   * 
   * Requirements:
   * - 1.1: WHEN 用户按下 W 键 THEN Camera_Movement_Plugin SHALL 使相机沿当前朝向的前方在水平面内移动
   * - 1.2: WHEN 用户按下 S 键 THEN Camera_Movement_Plugin SHALL 使相机沿当前朝向的后方在水平面内移动
   * - 1.3: WHEN 用户按下 A 键 THEN Camera_Movement_Plugin SHALL 使相机向左侧在水平面内移动
   * - 1.4: WHEN 用户按下 D 键 THEN Camera_Movement_Plugin SHALL 使相机向右侧在水平面内移动
   * - 1.5: WHEN 用户按下 Shift 键 THEN Camera_Movement_Plugin SHALL 使相机沿世界坐标系Y轴正方向（向上）移动
   * - 1.6: WHEN 用户按下 Ctrl 键 THEN Camera_Movement_Plugin SHALL 使相机沿世界坐标系Y轴负方向（向下）移动
   * - 1.7: WHEN 用户同时按下多个移动键 THEN Camera_Movement_Plugin SHALL 将各方向的移动向量叠加计算最终移动方向
   */
  calculateMovementVector(e) {
    if (this._tempMovement.set(0, 0, 0), !this.isMoving())
      return this._tempMovement;
    const t = this._tempForward;
    if (e.getWorldDirection(t), !this._flyMode && (t.y = 0, t.lengthSq() < 1e-4)) {
      const r = this._tempCameraUp.set(0, 1, 0);
      r.applyQuaternion(e.quaternion), t.set(r.x, 0, r.z);
    }
    t.lengthSq() > 0 && t.normalize();
    const n = this._tempRight;
    if (this._flyMode)
      n.set(1, 0, 0).applyQuaternion(e.quaternion);
    else {
      const r = this._tempWorldUp;
      n.crossVectors(t, r);
    }
    return n.lengthSq() > 0 && n.normalize(), this._movementState.forward && this._tempMovement.add(t), this._movementState.backward && this._tempMovement.sub(t), this._movementState.right && this._tempMovement.add(n), this._movementState.left && this._tempMovement.sub(n), this._movementState.up && (this._tempMovement.y += 1), this._movementState.down && (this._tempMovement.y -= 1), this._tempMovement.lengthSq() > 0 && this._tempMovement.normalize(), this._tempMovement;
  }
  /**
   * 处理键盘按下事件
   * 根据按下的键更新移动状态
   * 
   * @param event - 键盘事件
   * 
   * Requirements:
   * - 4.2: WHEN Camera_Movement_Plugin 被注册到 PluginSystem THEN Camera_Movement_Plugin SHALL 在 initialize 方法中设置键盘事件监听
   * - 1.1-1.6: 各方向键控制相机移动
   */
  handleKeyDown(e) {
    if (!this._enabled || this._isDisposed)
      return;
    const t = ae[e.code];
    t !== void 0 && this.updateMovementStateByDirection(t, !0);
  }
  /**
   * 处理键盘释放事件
   * 根据释放的键更新移动状态
   * 
   * @param event - 键盘事件
   * 
   * Requirements:
   * - 4.2: WHEN Camera_Movement_Plugin 被注册到 PluginSystem THEN Camera_Movement_Plugin SHALL 在 initialize 方法中设置键盘事件监听
   * - 1.8: WHEN 用户释放所有移动键 THEN Camera_Movement_Plugin SHALL 停止相机移动
   */
  handleKeyUp(e) {
    if (this._isDisposed)
      return;
    const t = ae[e.code];
    t !== void 0 && this.updateMovementStateByDirection(t, !1);
  }
  /**
   * 根据移动方向更新移动状态
   * 
   * @param direction - 移动方向
   * @param isPressed - 是否按下
   */
  updateMovementStateByDirection(e, t) {
    switch (e) {
      case "forward":
        this._movementState.forward = t;
        break;
      case "backward":
        this._movementState.backward = t;
        break;
      case "left":
        this._movementState.left = t;
        break;
      case "right":
        this._movementState.right = t;
        break;
      case "up":
        this._movementState.up = t;
        break;
      case "down":
        this._movementState.down = t;
        break;
    }
  }
}
class qe {
  constructor() {
    i(this, "name", "CameraPathAnimationPlugin");
    i(this, "_context", null);
    i(this, "_curve", null);
    i(this, "_progress", 0);
    i(this, "_isPlaying", !1);
    i(this, "_isDisposed", !1);
    // Configuration
    i(this, "_duration", 10);
    i(this, "_loop", !1);
    i(this, "_easeInOut", 0);
    i(this, "_target", null);
    i(this, "_fixedDirection", null);
    i(this, "_lookAlongPath", !1);
    // Internal state
    i(this, "_orbitControlsPlugin", null);
    i(this, "_wasOrbitControlsEnabled", !0);
    i(this, "_tempPos", new o.Vector3());
    i(this, "_tempLookAt", new o.Vector3());
  }
  initialize(e) {
    if (this._isDisposed)
      throw new Error("CameraPathAnimationPlugin has been disposed");
    this._context = e;
  }
  /**
   * Configure the animation settings
   */
  configure(e) {
    this._isDisposed || (e.pathPoints && e.pathPoints.length >= 2 && (this._curve = new o.CatmullRomCurve3(e.pathPoints)), e.duration !== void 0 && e.duration > 0 && (this._duration = e.duration), e.loop !== void 0 && (this._loop = e.loop), e.easeInOut !== void 0 && Number.isFinite(e.easeInOut) && (this._easeInOut = Math.max(0, Math.min(1, e.easeInOut))), e.target !== void 0 ? (this._target = e.target, this._fixedDirection = null, this._lookAlongPath = !1) : e.fixedDirection !== void 0 ? (this._fixedDirection = e.fixedDirection.clone().normalize(), this._target = null, this._lookAlongPath = !1) : e.lookAlongPath !== void 0 && (this._lookAlongPath = e.lookAlongPath, this._lookAlongPath && (this._target = null, this._fixedDirection = null)), e.autoPlay && this.play());
  }
  /**
   * Start or resume the animation
   */
  play() {
    this._isDisposed || !this._curve || !this._context || this._isPlaying || (this._isPlaying = !0, this._orbitControlsPlugin && (this._wasOrbitControlsEnabled = this._orbitControlsPlugin.controls.enabled, this._orbitControlsPlugin.controls.enabled = !1));
  }
  /**
   * Pause the animation
   */
  pause() {
    this._isPlaying && (this._isPlaying = !1, this._orbitControlsPlugin && (this._orbitControlsPlugin.controls.enabled = this._wasOrbitControlsEnabled));
  }
  /**
   * Stop and reset the animation
   */
  stop() {
    this.pause(), this._progress = 0;
  }
  /**
   * Update loop called by PluginSystem
   */
  update(e) {
    if (!this._isPlaying || !this._curve || !this._context) return;
    this._progress += e / this._duration, this._progress >= 1 && (this._loop ? this._progress %= 1 : (this._progress = 1, this.pause()));
    const t = this._context.camera, n = this._applyEaseInOut(this._progress);
    if (this._curve.getPointAt(n, this._tempPos), t.position.copy(this._tempPos), this._target)
      this._target instanceof o.Object3D ? (this._target.getWorldPosition(this._tempLookAt), t.lookAt(this._tempLookAt)) : t.lookAt(this._target);
    else if (this._fixedDirection)
      this._tempLookAt.copy(t.position).add(this._fixedDirection), t.lookAt(this._tempLookAt);
    else if (this._lookAlongPath) {
      const r = Math.min(n + 0.01, 1);
      this._curve.getPointAt(r, this._tempLookAt), t.lookAt(this._tempLookAt);
    }
  }
  dispose() {
    this._isDisposed || (this.stop(), this._curve = null, this._context = null, this._target = null, this._easeInOut = 0, this._orbitControlsPlugin = null, this._isDisposed = !0);
  }
  /**
   * Manually link OrbitControlsPlugin if you want auto-disable functionality
   */
  setOrbitControlsPlugin(e) {
    this._orbitControlsPlugin = e;
  }
  _applyEaseInOut(e) {
    if (this._easeInOut <= 0) return e;
    const t = e * e * (3 - 2 * e);
    return e + (t - e) * this._easeInOut;
  }
}
class We {
  constructor() {
    i(this, "name", "CameraPathDesignerPlugin");
    i(this, "_context", null);
    i(this, "_isDisposed", !1);
    i(this, "_enabled", !1);
    i(this, "_orbitControlsPlugin", null);
    i(this, "_wasOrbitControlsEnabled", !0);
    i(this, "_duration", 10);
    i(this, "_loop", !1);
    i(this, "_easeInOut", 0);
    i(this, "_pathPoints", []);
    i(this, "_target", null);
    i(this, "_selectedIndex", null);
    i(this, "_draggingIndex", null);
    i(this, "_pickTargetArmed", !1);
    i(this, "_raycaster", new o.Raycaster());
    i(this, "_pointerNdc", new o.Vector2());
    i(this, "_dragPlane", new o.Plane());
    i(this, "_tempNormal", new o.Vector3());
    i(this, "_tempPoint", new o.Vector3());
    i(this, "_helpersGroup", null);
    i(this, "_pointMeshes", []);
    i(this, "_pointGeometry", null);
    i(this, "_pointMaterial", null);
    i(this, "_selectedPointMaterial", null);
    i(this, "_targetMesh", null);
    i(this, "_targetGeometry", null);
    i(this, "_targetMaterial", null);
    i(this, "_line", null);
    i(this, "_lineGeometry", null);
    i(this, "_lineMaterial", null);
    i(this, "_samples", 200);
    i(this, "_pointSize", 0.12);
    i(this, "_lineColor", 4500223);
    i(this, "_pointColor", 16777215);
    i(this, "_selectedPointColor", 16763972);
    i(this, "_targetColor", 16729190);
    i(this, "_onPointerDown", (e) => {
      var M;
      if (!this._context || !this._enabled || this._isDisposed) return;
      const t = this._context.renderer.domElement, n = t.getBoundingClientRect(), r = (e.clientX - n.left) / n.width * 2 - 1, a = -((e.clientY - n.top) / n.height * 2 - 1);
      if (this._pointerNdc.set(r, a), this._raycaster.setFromCamera(this._pointerNdc, this._context.camera), this._pickTargetArmed) {
        const I = this._raycaster.intersectObjects(this._context.scene.children, !0).find((z) => !this._isHelperObject(z.object));
        I && this.setTargetPoint(I.point), this._pickTargetArmed = !1;
        return;
      }
      const f = this._raycaster.intersectObjects(this._pointMeshes, !1)[0];
      if (!f) {
        this.setSelectedIndex(null);
        return;
      }
      const b = (M = f.object.userData) == null ? void 0 : M.pathPointIndex;
      if (typeof b != "number") return;
      const m = this._pathPoints[b];
      m && (this.setSelectedIndex(b), this._draggingIndex = b, this._context.camera.getWorldDirection(this._tempNormal).normalize(), this._dragPlane.setFromNormalAndCoplanarPoint(this._tempNormal, m), this._orbitControlsPlugin && (this._wasOrbitControlsEnabled = this._orbitControlsPlugin.controls.enabled, this._orbitControlsPlugin.controls.enabled = !1), t.setPointerCapture(e.pointerId));
    });
    i(this, "_onPointerMove", (e) => {
      if (!this._context || !this._enabled || this._isDisposed || this._draggingIndex === null) return;
      const n = this._context.renderer.domElement.getBoundingClientRect(), r = (e.clientX - n.left) / n.width * 2 - 1, a = -((e.clientY - n.top) / n.height * 2 - 1);
      if (this._pointerNdc.set(r, a), this._raycaster.setFromCamera(this._pointerNdc, this._context.camera), !this._raycaster.ray.intersectPlane(this._dragPlane, this._tempPoint)) return;
      const b = this._pathPoints[this._draggingIndex];
      b && (b.copy(this._tempPoint), this._syncHelpers());
    });
    i(this, "_onPointerUp", (e) => {
      if (!(!this._context || this._isDisposed)) {
        this._draggingIndex !== null && this._orbitControlsPlugin && (this._orbitControlsPlugin.controls.enabled = this._wasOrbitControlsEnabled), this._draggingIndex = null;
        try {
          this._context.renderer.domElement.releasePointerCapture(e.pointerId);
        } catch {
        }
      }
    });
  }
  initialize(e) {
    if (this._isDisposed)
      throw new Error("CameraPathDesignerPlugin has been disposed");
    this._context = e, this._ensureHelpers();
  }
  configure(e) {
    this._isDisposed || (e.pointSize !== void 0 && e.pointSize > 0 && (this._pointSize = e.pointSize), e.lineColor !== void 0 && (this._lineColor = e.lineColor), e.pointColor !== void 0 && (this._pointColor = e.pointColor), e.selectedPointColor !== void 0 && (this._selectedPointColor = e.selectedPointColor), e.targetColor !== void 0 && (this._targetColor = e.targetColor), e.samples !== void 0 && e.samples >= 10 && (this._samples = e.samples), this._rebuildMaterials(), this._syncHelpers(), e.enabled !== void 0 && (e.enabled ? this.enable() : this.disable()));
  }
  enable() {
    if (!this._context || this._isDisposed || this._enabled) return;
    this._enabled = !0, this._ensureHelpers(), this._helpersGroup && (this._helpersGroup.visible = !0);
    const e = this._context.renderer.domElement;
    e.addEventListener("pointerdown", this._onPointerDown), e.addEventListener("pointermove", this._onPointerMove), e.addEventListener("pointerup", this._onPointerUp);
  }
  disable() {
    if (!this._context || this._isDisposed || !this._enabled) return;
    this._enabled = !1, this._pickTargetArmed = !1, this._draggingIndex = null;
    const e = this._context.renderer.domElement;
    e.removeEventListener("pointerdown", this._onPointerDown), e.removeEventListener("pointermove", this._onPointerMove), e.removeEventListener("pointerup", this._onPointerUp), this._helpersGroup && (this._helpersGroup.visible = !1), this._orbitControlsPlugin && (this._orbitControlsPlugin.controls.enabled = this._wasOrbitControlsEnabled);
  }
  isEnabled() {
    return this._enabled;
  }
  setOrbitControlsPlugin(e) {
    this._orbitControlsPlugin = e;
  }
  setDuration(e) {
    Number.isFinite(e) && e > 0 && (this._duration = e);
  }
  getDuration() {
    return this._duration;
  }
  setLoop(e) {
    this._loop = e;
  }
  getLoop() {
    return this._loop;
  }
  setEaseInOut(e) {
    Number.isFinite(e) && (this._easeInOut = Math.max(0, Math.min(1, e)));
  }
  getEaseInOut() {
    return this._easeInOut;
  }
  getPathPoints() {
    return this._pathPoints.map((e) => e.clone());
  }
  setPathPoints(e) {
    this._pathPoints = e.map((t) => t.clone()), this.setSelectedIndex(null), this._ensureHelpers(), this._syncHelpers();
  }
  addPoint(e) {
    this._pathPoints.push(e.clone()), this._ensureHelpers(), this._syncHelpers(), this.setSelectedIndex(this._pathPoints.length - 1);
  }
  addPointFromCamera() {
    this._context && this.addPoint(this._context.camera.position);
  }
  insertPointAfter(e) {
    if (!this._context || e < 0 || e >= this._pathPoints.length) return;
    const t = this._pathPoints[e];
    if (!t) return;
    const n = new o.Vector3(1, 0, 0).applyQuaternion(this._context.camera.quaternion).normalize(), r = t.clone().addScaledVector(n, this._pointSize * 6);
    this._pathPoints.splice(e + 1, 0, r), this._ensureHelpers(), this._syncHelpers(), this.setSelectedIndex(e + 1);
  }
  removePoint(e) {
    e < 0 || e >= this._pathPoints.length || (this._pathPoints.splice(e, 1), this._selectedIndex !== null && (this._pathPoints.length === 0 ? this._selectedIndex = null : this._selectedIndex = Math.min(this._selectedIndex, this._pathPoints.length - 1)), this._ensureHelpers(), this._syncHelpers());
  }
  removeSelectedPoint() {
    this._selectedIndex !== null && this.removePoint(this._selectedIndex);
  }
  clear() {
    this._pathPoints = [], this._selectedIndex = null, this._ensureHelpers(), this._syncHelpers();
  }
  setSelectedIndex(e) {
    if (e === null) {
      this._selectedIndex = null, this._syncPointMaterials();
      return;
    }
    e < 0 || e >= this._pathPoints.length || (this._selectedIndex = e, this._syncPointMaterials());
  }
  getSelectedIndex() {
    return this._selectedIndex;
  }
  armPickTargetOnce() {
    this._enabled || this.enable(), this._pickTargetArmed = !0;
  }
  isPickTargetArmed() {
    return this._pickTargetArmed;
  }
  setTargetPoint(e) {
    this._target = { type: "point", point: e.clone() }, this._syncHelpers();
  }
  setTargetObject(e) {
    this._target = { type: "object", object: e }, this._syncHelpers();
  }
  clearTarget() {
    this._target = null, this._syncHelpers();
  }
  getTargetPoint() {
    return this._target ? this._target.type === "point" ? this._target.point.clone() : (this._target.object.getWorldPosition(this._tempPoint), this._tempPoint.clone()) : null;
  }
  exportShot() {
    return {
      duration: this._duration,
      loop: this._loop,
      easeInOut: this._easeInOut,
      pathPoints: this._pathPoints.map((e) => ({ x: e.x, y: e.y, z: e.z })),
      target: this.getTargetPoint() ? (() => {
        const e = this.getTargetPoint();
        return { x: e.x, y: e.y, z: e.z };
      })() : null
    };
  }
  importShot(e) {
    this.setDuration(e.duration), this.setLoop(e.loop), this.setEaseInOut(e.easeInOut), this.setPathPoints(e.pathPoints.map((t) => new o.Vector3(t.x, t.y, t.z))), e.target ? this.setTargetPoint(new o.Vector3(e.target.x, e.target.y, e.target.z)) : this.clearTarget();
  }
  dispose() {
    var e, t, n, r, a, c, f;
    this._isDisposed || (this.disable(), this._isDisposed = !0, this._helpersGroup && this._context && this._context.scene.remove(this._helpersGroup), this._pointMeshes = [], (e = this._pointGeometry) == null || e.dispose(), (t = this._pointMaterial) == null || t.dispose(), (n = this._selectedPointMaterial) == null || n.dispose(), (r = this._targetGeometry) == null || r.dispose(), (a = this._targetMaterial) == null || a.dispose(), (c = this._lineGeometry) == null || c.dispose(), (f = this._lineMaterial) == null || f.dispose(), this._helpersGroup = null, this._pointGeometry = null, this._pointMaterial = null, this._selectedPointMaterial = null, this._targetMesh = null, this._targetGeometry = null, this._targetMaterial = null, this._line = null, this._lineGeometry = null, this._lineMaterial = null, this._context = null, this._orbitControlsPlugin = null, this._target = null);
  }
  _ensureHelpers() {
    if (this._context) {
      for (this._helpersGroup || (this._helpersGroup = new o.Group(), this._helpersGroup.name = "CameraPathDesignerHelpers", this._helpersGroup.visible = this._enabled, this._context.scene.add(this._helpersGroup)), this._pointGeometry || (this._pointGeometry = new o.SphereGeometry(this._pointSize, 16, 12)), this._lineMaterial || (this._lineMaterial = new o.LineBasicMaterial({ color: this._lineColor })), this._targetGeometry || (this._targetGeometry = new o.SphereGeometry(this._pointSize * 1.2, 16, 12)), this._targetMaterial || (this._targetMaterial = new o.MeshBasicMaterial({ color: this._targetColor })), (!this._pointMaterial || !this._selectedPointMaterial) && this._rebuildMaterials(), this._lineGeometry || (this._lineGeometry = new o.BufferGeometry()), this._line || (this._line = new o.Line(this._lineGeometry, this._lineMaterial), this._line.renderOrder = 9999, this._helpersGroup.add(this._line)), this._targetMesh || (this._targetMesh = new o.Mesh(this._targetGeometry, this._targetMaterial), this._targetMesh.visible = !1, this._targetMesh.renderOrder = 1e4, this._helpersGroup.add(this._targetMesh)); this._pointMeshes.length < this._pathPoints.length; ) {
        const e = new o.Mesh(this._pointGeometry, this._pointMaterial);
        e.userData = { pathPointIndex: this._pointMeshes.length }, e.renderOrder = 1e4, this._pointMeshes.push(e), this._helpersGroup.add(e);
      }
      for (; this._pointMeshes.length > this._pathPoints.length; ) {
        const e = this._pointMeshes.pop();
        this._helpersGroup.remove(e);
      }
      for (let e = 0; e < this._pointMeshes.length; e++) {
        const t = this._pointMeshes[e];
        t && (t.userData.pathPointIndex = e);
      }
    }
  }
  _rebuildMaterials() {
    var e, t, n, r;
    (e = this._pointMaterial) == null || e.dispose(), (t = this._selectedPointMaterial) == null || t.dispose(), (n = this._lineMaterial) == null || n.dispose(), (r = this._targetMaterial) == null || r.dispose(), this._pointMaterial = new o.MeshBasicMaterial({ color: this._pointColor }), this._selectedPointMaterial = new o.MeshBasicMaterial({ color: this._selectedPointColor }), this._lineMaterial = new o.LineBasicMaterial({ color: this._lineColor }), this._targetMaterial = new o.MeshBasicMaterial({ color: this._targetColor }), this._line && (this._line.material = this._lineMaterial), this._targetMesh && (this._targetMesh.material = this._targetMaterial), this._syncPointMaterials();
  }
  _syncPointMaterials() {
    if (!(!this._pointMaterial || !this._selectedPointMaterial))
      for (let e = 0; e < this._pointMeshes.length; e++) {
        const t = this._pointMeshes[e];
        t && (t.material = e === this._selectedIndex ? this._selectedPointMaterial : this._pointMaterial);
      }
  }
  _syncHelpers() {
    if (!(!this._context || !this._helpersGroup)) {
      for (let e = 0; e < this._pathPoints.length; e++) {
        const t = this._pointMeshes[e], n = this._pathPoints[e];
        !t || !n || (t.position.copy(n), t.visible = this._enabled);
      }
      if (this._targetMesh) {
        const e = this.getTargetPoint();
        e ? (this._targetMesh.visible = this._enabled, this._targetMesh.position.copy(e)) : this._targetMesh.visible = !1;
      }
      this._syncLine(), this._syncPointMaterials();
    }
  }
  _syncLine() {
    if (!this._lineGeometry) return;
    if (this._pathPoints.length < 2) {
      this._lineGeometry.setAttribute("position", new o.Float32BufferAttribute([], 3)), this._lineGeometry.computeBoundingSphere();
      return;
    }
    const t = new o.CatmullRomCurve3(this._pathPoints).getPoints(this._samples), n = new Float32Array(t.length * 3);
    for (let r = 0; r < t.length; r++) {
      const a = t[r];
      a && (n[r * 3 + 0] = a.x, n[r * 3 + 1] = a.y, n[r * 3 + 2] = a.z);
    }
    this._lineGeometry.setAttribute("position", new o.BufferAttribute(n, 3)), this._lineGeometry.computeBoundingSphere();
  }
  _isHelperObject(e) {
    return this._helpersGroup ? e === this._helpersGroup ? !0 : this._helpersGroup.children.includes(e) || this._helpersGroup.getObjectById(e.id) !== void 0 : !1;
  }
}
var J = { exports: {} }, j = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var le;
function Oe() {
  if (le) return j;
  le = 1;
  var h = Symbol.for("react.transitional.element"), e = Symbol.for("react.fragment");
  function t(n, r, a) {
    var c = null;
    if (a !== void 0 && (c = "" + a), r.key !== void 0 && (c = "" + r.key), "key" in r) {
      a = {};
      for (var f in r)
        f !== "key" && (a[f] = r[f]);
    } else a = r;
    return r = a.ref, {
      $$typeof: h,
      type: n,
      key: c,
      ref: r !== void 0 ? r : null,
      props: a
    };
  }
  return j.Fragment = e, j.jsx = t, j.jsxs = t, j;
}
var Y = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var he;
function ke() {
  return he || (he = 1, process.env.NODE_ENV !== "production" && (function() {
    function h(s) {
      if (s == null) return null;
      if (typeof s == "function")
        return s.$$typeof === Q ? null : s.displayName || s.name || null;
      if (typeof s == "string") return s;
      switch (s) {
        case O:
          return "Fragment";
        case L:
          return "Profiler";
        case k:
          return "StrictMode";
        case K:
          return "Suspense";
        case V:
          return "SuspenseList";
        case N:
          return "Activity";
      }
      if (typeof s == "object")
        switch (typeof s.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), s.$$typeof) {
          case C:
            return "Portal";
          case W:
            return s.displayName || "Context";
          case H:
            return (s._context.displayName || "Context") + ".Consumer";
          case $:
            var l = s.render;
            return s = s.displayName, s || (s = l.displayName || l.name || "", s = s !== "" ? "ForwardRef(" + s + ")" : "ForwardRef"), s;
          case F:
            return l = s.displayName || null, l !== null ? l : h(s.type) || "Memo";
          case v:
            l = s._payload, s = s._init;
            try {
              return h(s(l));
            } catch {
            }
        }
      return null;
    }
    function e(s) {
      return "" + s;
    }
    function t(s) {
      try {
        e(s);
        var l = !1;
      } catch {
        l = !0;
      }
      if (l) {
        l = console;
        var u = l.error, p = typeof Symbol == "function" && Symbol.toStringTag && s[Symbol.toStringTag] || s.constructor.name || "Object";
        return u.call(
          l,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          p
        ), e(s);
      }
    }
    function n(s) {
      if (s === O) return "<>";
      if (typeof s == "object" && s !== null && s.$$typeof === v)
        return "<...>";
      try {
        var l = h(s);
        return l ? "<" + l + ">" : "<...>";
      } catch {
        return "<...>";
      }
    }
    function r() {
      var s = d.A;
      return s === null ? null : s.getOwner();
    }
    function a() {
      return Error("react-stack-top-frame");
    }
    function c(s) {
      if (_.call(s, "key")) {
        var l = Object.getOwnPropertyDescriptor(s, "key").get;
        if (l && l.isReactWarning) return !1;
      }
      return s.key !== void 0;
    }
    function f(s, l) {
      function u() {
        S || (S = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          l
        ));
      }
      u.isReactWarning = !0, Object.defineProperty(s, "key", {
        get: u,
        configurable: !0
      });
    }
    function b() {
      var s = h(this.type);
      return w[s] || (w[s] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), s = this.props.ref, s !== void 0 ? s : null;
    }
    function m(s, l, u, p, B, ee) {
      var g = u.ref;
      return s = {
        $$typeof: G,
        type: s,
        key: l,
        props: u,
        _owner: p
      }, (g !== void 0 ? g : null) !== null ? Object.defineProperty(s, "ref", {
        enumerable: !1,
        get: b
      }) : Object.defineProperty(s, "ref", { enumerable: !1, value: null }), s._store = {}, Object.defineProperty(s._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty(s, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.defineProperty(s, "_debugStack", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: B
      }), Object.defineProperty(s, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: ee
      }), Object.freeze && (Object.freeze(s.props), Object.freeze(s)), s;
    }
    function M(s, l, u, p, B, ee) {
      var g = l.children;
      if (g !== void 0)
        if (p)
          if (x(g)) {
            for (p = 0; p < g.length; p++)
              R(g[p]);
            Object.freeze && Object.freeze(g);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else R(g);
      if (_.call(l, "key")) {
        g = h(s);
        var U = Object.keys(l).filter(function(ue) {
          return ue !== "key";
        });
        p = 0 < U.length ? "{key: someKey, " + U.join(": ..., ") + ": ...}" : "{key: someKey}", A[g + p] || (U = 0 < U.length ? "{" + U.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          p,
          g,
          U,
          g
        ), A[g + p] = !0);
      }
      if (g = null, u !== void 0 && (t(u), g = "" + u), c(l) && (t(l.key), g = "" + l.key), "key" in l) {
        u = {};
        for (var te in l)
          te !== "key" && (u[te] = l[te]);
      } else u = l;
      return g && f(
        u,
        typeof s == "function" ? s.displayName || s.name || "Unknown" : s
      ), m(
        s,
        g,
        u,
        r(),
        B,
        ee
      );
    }
    function R(s) {
      I(s) ? s._store && (s._store.validated = 1) : typeof s == "object" && s !== null && s.$$typeof === v && (s._payload.status === "fulfilled" ? I(s._payload.value) && s._payload.value._store && (s._payload.value._store.validated = 1) : s._store && (s._store.validated = 1));
    }
    function I(s) {
      return typeof s == "object" && s !== null && s.$$typeof === G;
    }
    var z = be, G = Symbol.for("react.transitional.element"), C = Symbol.for("react.portal"), O = Symbol.for("react.fragment"), k = Symbol.for("react.strict_mode"), L = Symbol.for("react.profiler"), H = Symbol.for("react.consumer"), W = Symbol.for("react.context"), $ = Symbol.for("react.forward_ref"), K = Symbol.for("react.suspense"), V = Symbol.for("react.suspense_list"), F = Symbol.for("react.memo"), v = Symbol.for("react.lazy"), N = Symbol.for("react.activity"), Q = Symbol.for("react.client.reference"), d = z.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, _ = Object.prototype.hasOwnProperty, x = Array.isArray, y = console.createTask ? console.createTask : function() {
      return null;
    };
    z = {
      react_stack_bottom_frame: function(s) {
        return s();
      }
    };
    var S, w = {}, E = z.react_stack_bottom_frame.bind(
      z,
      a
    )(), T = y(n(a)), A = {};
    Y.Fragment = O, Y.jsx = function(s, l, u) {
      var p = 1e4 > d.recentlyCreatedOwnerStacks++;
      return M(
        s,
        l,
        u,
        !1,
        p ? Error("react-stack-top-frame") : E,
        p ? y(n(s)) : T
      );
    }, Y.jsxs = function(s, l, u) {
      var p = 1e4 > d.recentlyCreatedOwnerStacks++;
      return M(
        s,
        l,
        u,
        !0,
        p ? Error("react-stack-top-frame") : E,
        p ? y(n(s)) : T
      );
    };
  })()), Y;
}
var de;
function He() {
  return de || (de = 1, process.env.NODE_ENV === "production" ? J.exports = Oe() : J.exports = ke()), J.exports;
}
var se = He();
const re = we(
  void 0
);
re.displayName = "ThreeInstanceContext";
const q = {
  scene: null,
  camera: null,
  renderer: null,
  container: null,
  isReady: !1,
  isDisposed: !1
}, Ge = {
  unmounted: ["mounted"],
  mounted: ["initialized", "disposed"],
  initialized: ["disposed"],
  disposed: []
  // Terminal state
}, Le = {
  unmounted: !1,
  mounted: !1,
  initialized: !0,
  disposed: !1
};
function Ve(h, e) {
  return Ge[h].includes(e);
}
function Fe(h, e) {
  const t = Le[e];
  return e === "disposed" ? {
    ...q,
    isDisposed: !0
  } : !t || !h || !h.isInitialized ? q : {
    scene: h.scene.scene,
    camera: h.camera.camera,
    renderer: h.renderer.renderer,
    container: h.container,
    isReady: !0,
    isDisposed: !1
  };
}
function ce({
  children: h,
  viewerCore: e
}) {
  const [t, n] = ie("unmounted"), r = D(!1), a = D(null), c = ne((m) => {
    n((M) => Ve(M, m) ? m : M);
  }, []);
  P(() => (r.current = !0, c("mounted"), () => {
    r.current = !1, n((m) => m !== "disposed" ? "disposed" : m);
  }), [c]), P(() => {
    const m = a.current;
    if (a.current = e, m && !e) {
      c("disposed");
      return;
    }
    e && e.isInitialized && c("initialized");
  }, [e, c]);
  const f = ne(() => {
    e && e.isInitialized && t === "mounted" && c("initialized");
  }, [e, t, c]);
  P(() => {
    if (!e || t !== "mounted")
      return;
    f();
    const m = setInterval(f, 50), M = setTimeout(() => {
      clearInterval(m);
    }, 5e3);
    return () => {
      clearInterval(m), clearTimeout(M);
    };
  }, [e, t, f]);
  const b = Me(() => Fe(e, t), [e, t]);
  return /* @__PURE__ */ se.jsx(re.Provider, { value: b, children: h });
}
ce.displayName = "ThreeInstanceProvider";
const _e = 5526612, Ne = ve(
  function({
    modelUrl: e,
    pivotPoint: t,
    zoomLimits: n,
    grid: r,
    backgroundColor: a = _e,
    className: c,
    style: f,
    onLoad: b,
    onError: m,
    onLoadingChange: M,
    onViewerReady: R,
    children: I
  }, z) {
    const G = D(null), C = D(null), O = D(null), k = D(null), L = D(null), [H, W] = ie(!1), [$, K] = ie(null), V = D(b), F = D(m), v = D(M), N = D(R);
    P(() => {
      V.current = b;
    }, [b]), P(() => {
      F.current = m;
    }, [m]), P(() => {
      v.current = M;
    }, [M]), P(() => {
      N.current = R;
    }, [R]), Pe(
      z,
      () => ({
        getInstances() {
          if (H)
            return {
              ...q,
              isDisposed: !0
            };
          const d = C.current;
          return !d || !d.isInitialized ? q : {
            scene: d.scene.scene,
            camera: d.camera.camera,
            renderer: d.renderer.renderer,
            container: d.container,
            isReady: !0,
            isDisposed: !1
          };
        },
        getViewerCore() {
          return H ? null : C.current;
        },
        isReady() {
          if (H)
            return !1;
          const d = C.current;
          return d !== null && d.isInitialized;
        },
        isDisposed() {
          return H;
        }
      }),
      [H]
    ), P(() => {
      var w;
      const d = G.current;
      if (!d)
        return;
      const _ = new Se();
      _.initialize({
        container: d,
        antialias: !0,
        alpha: !0
      });
      const x = new Te(), y = new Ae(), S = new ze();
      _.plugins.register(x), _.plugins.register(y), _.plugins.register(S), C.current = _, O.current = x, k.current = y, L.current = S, K(_), W(!1);
      try {
        (w = N.current) == null || w.call(N, _);
      } catch (E) {
        console.error("onViewerReady callback failed:", E);
      }
      return _.start(), () => {
        _.dispose(), C.current = null, O.current = null, k.current = null, L.current = null, K(null), W(!0);
      };
    }, []), P(() => {
      const d = G.current, _ = C.current;
      if (!d || !_)
        return;
      const x = new ResizeObserver((y) => {
        for (const S of y) {
          const { width: w, height: E } = S.contentRect;
          w > 0 && E > 0 && _.resize(w, E);
        }
      });
      return x.observe(d), () => {
        x.disconnect();
      };
    }, []), P(() => {
      var S;
      const d = O.current, _ = k.current, x = L.current;
      if (!d)
        return;
      if (!e) {
        d.unload();
        return;
      }
      let y = !1;
      return (S = v.current) == null || S.call(v, !0), d.load(e).then((w) => {
        var s, l, u;
        if (y) return;
        (s = v.current) == null || s.call(v, !1), _ && !t && _.setTarget(w.center);
        const E = w.boundingBox, T = new o.Vector3();
        E.getSize(T);
        const A = Math.max(T.x, T.y, T.z);
        if (_ && !n) {
          const p = ((l = C.current) == null ? void 0 : l.camera.camera.far) ?? 1e3, B = Math.min(A * 10, p * 0.9);
          _.setZoomLimits(A * 0.1, B);
        }
        if (x && (!r || r.size === void 0)) {
          const p = A * 3;
          x.configure({
            size: p,
            divisions: 10,
            axesSize: A * 1.5
            // Axes 1.5x model size
          });
        }
        (u = V.current) == null || u.call(V, w);
      }).catch((w) => {
        var T, A;
        if (y) return;
        (T = v.current) == null || T.call(v, !1);
        const E = w instanceof Error ? w : new Error(String(w));
        (A = F.current) == null || A.call(F, E);
      }), () => {
        y = !0;
      };
    }, [e]), P(() => {
      const d = k.current;
      if (d && t) {
        const _ = new o.Vector3(t.x, t.y, t.z);
        d.setTarget(_);
      }
    }, [t]), P(() => {
      const d = k.current;
      if (d && n) {
        const _ = n.min ?? 0.1, x = n.max ?? 1e4;
        d.setZoomLimits(_, x);
      }
    }, [n]), P(() => {
      const d = L.current;
      if (d)
        if (r) {
          const _ = {};
          r.size !== void 0 && (_.size = r.size), r.divisions !== void 0 && (_.divisions = r.divisions), r.plane !== void 0 && (_.plane = r.plane), r.showAxes !== void 0 && (_.showAxes = r.showAxes), d.configure(_), d.setVisible(r.visible !== !1);
        } else
          d.setVisible(!1);
    }, [r]), P(() => {
      const d = C.current;
      if (!d || !d.isInitialized)
        return;
      const _ = d.scene.scene;
      a !== void 0 ? _.background = new o.Color(a) : _.background = new o.Color(_e);
    }, [a, $]);
    const Q = {
      width: "100%",
      height: "100%",
      ...f
    };
    return /* @__PURE__ */ se.jsxs(ce, { viewerCore: $, children: [
      /* @__PURE__ */ se.jsx(
        "div",
        {
          ref: G,
          className: c,
          style: Q
        }
      ),
      I
    ] });
  }
);
Ne.displayName = "ThreeViewer";
function $e() {
  const h = xe(re);
  if (h === void 0)
    throw new Error(
      "useThreeInstance must be used within a ThreeViewer component. Make sure your component is a child of <ThreeViewer>."
    );
  return h;
}
export {
  Ee as CameraManager,
  Ye as CameraMovementPlugin,
  qe as CameraPathAnimationPlugin,
  We as CameraPathDesignerPlugin,
  ze as GridHelperPlugin,
  Te as ModelLoaderPlugin,
  Ae as OrbitControlsPlugin,
  Ce as PluginSystem,
  De as RenderManager,
  ye as SceneManager,
  Ne as ThreeViewer,
  Se as ViewerCore,
  $e as useThreeInstance
};
//# sourceMappingURL=threejs-viewer.mjs.map
