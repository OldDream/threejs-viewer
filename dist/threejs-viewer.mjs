var ne = Object.defineProperty;
var ae = (l, e, t) => e in l ? ne(l, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : l[e] = t;
var s = (l, e, t) => ae(l, typeof e != "symbol" ? e + "" : e, t);
import * as h from "three";
import { GLTFLoader as oe, OrbitControls as le } from "three-stdlib";
import ce, { useRef as P, useEffect as D } from "react";
class de {
  constructor() {
    s(this, "_scene");
    s(this, "_isDisposed", !1);
    this._scene = new h.Scene();
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
    this._isDisposed || (this.clear(), this._scene.background && (this._scene.background instanceof h.Texture && this._scene.background.dispose(), this._scene.background = null), this._scene.environment && (this._scene.environment.dispose(), this._scene.environment = null), this._isDisposed = !0);
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
    e instanceof h.Mesh && (e.geometry && e.geometry.dispose(), e.material && this._disposeMaterial(e.material)), (e instanceof h.Line || e instanceof h.Points) && (e.geometry && e.geometry.dispose(), e.material && this._disposeMaterial(e.material));
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
    ].forEach((a) => {
      const i = e[a];
      i instanceof h.Texture && i.dispose();
    }), e.dispose();
  }
}
const N = {
  fov: 75,
  near: 0.1,
  far: 1e3,
  position: new h.Vector3(0, 0, 5)
};
class he {
  constructor(e) {
    s(this, "_camera");
    s(this, "_isDisposed", !1);
    const t = (e == null ? void 0 : e.fov) ?? N.fov, a = (e == null ? void 0 : e.near) ?? N.near, i = (e == null ? void 0 : e.far) ?? N.far, o = (e == null ? void 0 : e.position) ?? N.position.clone();
    this._camera = new h.PerspectiveCamera(t, 1, a, i), this._camera.position.copy(o);
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
const X = {
  antialias: !0,
  alpha: !1
};
class ue {
  constructor() {
    s(this, "_renderer", null);
    s(this, "_container", null);
    s(this, "_isDisposed", !1);
    s(this, "_isInitialized", !1);
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
    const a = (t == null ? void 0 : t.antialias) ?? X.antialias, i = (t == null ? void 0 : t.alpha) ?? X.alpha;
    this._renderer = new h.WebGLRenderer({
      antialias: a,
      alpha: i
    }), this._renderer.setPixelRatio(window.devicePixelRatio);
    const o = e.clientWidth || 1, f = e.clientHeight || 1;
    this._renderer.setSize(o, f), e.appendChild(this._renderer.domElement), this._container = e, this._isInitialized = !0;
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
    const a = Math.max(1, Math.floor(e)), i = Math.max(1, Math.floor(t));
    this._renderer.setSize(a, i);
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
class _e {
  constructor() {
    s(this, "_plugins", /* @__PURE__ */ new Map());
    s(this, "_context", null);
    s(this, "_isDisposed", !1);
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
        } catch (a) {
          console.error(`Error updating plugin "${t.name}":`, a);
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
class pe {
  constructor() {
    s(this, "_sceneManager");
    s(this, "_cameraManager");
    s(this, "_renderManager");
    s(this, "_pluginSystem");
    s(this, "_container", null);
    s(this, "_isInitialized", !1);
    s(this, "_isRunning", !1);
    s(this, "_isDisposed", !1);
    s(this, "_animationFrameId", null);
    s(this, "_lastTime", 0);
    /**
     * The main render loop.
     * Calculates deltaTime, updates all plugins, and renders the scene.
     */
    s(this, "_renderLoop", () => {
      if (!this._isRunning || this._isDisposed)
        return;
      const e = performance.now(), t = (e - this._lastTime) / 1e3;
      this._lastTime = e, this._pluginSystem.updateAll(t), this._renderManager.render(
        this._sceneManager.scene,
        this._cameraManager.camera
      ), this._animationFrameId = requestAnimationFrame(this._renderLoop);
    });
    this._sceneManager = new de(), this._cameraManager = new he(), this._renderManager = new ue(), this._pluginSystem = new _e();
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
    const { container: t, antialias: a, alpha: i, cameraConfig: o } = e;
    this._container = t, o && this._cameraManager.configure(o);
    const f = {};
    a !== void 0 && (f.antialias = a), i !== void 0 && (f.alpha = i), this._renderManager.initialize(t, f);
    const b = t.clientWidth || 1, T = t.clientHeight || 1;
    this._cameraManager.setAspect(b / T);
    const y = {
      scene: this._sceneManager.scene,
      camera: this._cameraManager.camera,
      renderer: this._renderManager.renderer,
      container: t
    };
    this._pluginSystem.setContext(y), this._isInitialized = !0;
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
    const a = Math.max(1, e), i = Math.max(1, t);
    this._cameraManager.setAspect(a / i), this._renderManager.setSize(a, i);
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
}
class fe {
  constructor() {
    s(this, "name", "ModelLoaderPlugin");
    s(this, "_context", null);
    s(this, "_loader");
    s(this, "_currentModel", null);
    s(this, "_boundingBox", null);
    s(this, "_center", null);
    s(this, "_loadingState", {
      isLoading: !1,
      progress: 0,
      error: null
    });
    s(this, "_isDisposed", !1);
    this._loader = new oe();
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
    this._currentModel && this.unload(), this._loadingState = {
      isLoading: !0,
      progress: 0,
      error: null
    };
    try {
      const a = (await this._loadGLTF(e)).scene;
      this._context.scene.add(a), this._currentModel = a;
      const i = new h.Box3().setFromObject(a), o = new h.Vector3();
      return i.getCenter(o), this._boundingBox = i, this._center = o, this._loadingState = {
        isLoading: !1,
        progress: 100,
        error: null
      }, {
        model: a,
        boundingBox: i,
        center: o
      };
    } catch (t) {
      const a = t instanceof Error ? t : new Error(`Failed to load model from URL: ${e}`);
      throw this._loadingState = {
        isLoading: !1,
        progress: 0,
        error: a
      }, a;
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
    return new Promise((t, a) => {
      this._loader.load(
        e,
        // onLoad callback
        (i) => {
          t(i);
        },
        // onProgress callback
        (i) => {
          if (i.lengthComputable) {
            const o = i.loaded / i.total * 100;
            this._loadingState = {
              ...this._loadingState,
              progress: Math.round(o)
            };
          }
        },
        // onError callback
        (i) => {
          const o = i instanceof Error ? i.message : `Failed to load model from URL: ${e}`;
          a(new Error(o));
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
    e instanceof h.Mesh && (e.geometry && e.geometry.dispose(), e.material && this._disposeMaterial(e.material)), (e instanceof h.Line || e instanceof h.Points) && (e.geometry && e.geometry.dispose(), e.material && this._disposeMaterial(e.material)), e instanceof h.SkinnedMesh && e.skeleton && e.skeleton.dispose();
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
    ].forEach((a) => {
      const i = e[a];
      i instanceof h.Texture && i.dispose();
    }), e.dispose();
  }
}
class me {
  constructor() {
    s(this, "name", "OrbitControlsPlugin");
    s(this, "_context", null);
    s(this, "_controls", null);
    s(this, "_isDisposed", !1);
    // Store initial state for reset functionality
    s(this, "_initialTarget", new h.Vector3(0, 0, 0));
    s(this, "_initialCameraPosition", new h.Vector3(0, 0, 5));
    s(this, "_initialMinDistance", 0.1);
    s(this, "_initialMaxDistance", 1e3);
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
    this._context = e, this._controls = new le(e.camera, e.container), this._initialCameraPosition.copy(e.camera.position), this._controls.minDistance = this._initialMinDistance, this._controls.maxDistance = this._initialMaxDistance, this._controls.enableDamping = !0, this._controls.dampingFactor = 0.05, this._controls.enablePan = !0, this._controls.enableRotate = !0, this._controls.enableZoom = !0;
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
var L = { exports: {} }, A = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Q;
function ge() {
  if (Q) return A;
  Q = 1;
  var l = Symbol.for("react.transitional.element"), e = Symbol.for("react.fragment");
  function t(a, i, o) {
    var f = null;
    if (o !== void 0 && (f = "" + o), i.key !== void 0 && (f = "" + i.key), "key" in i) {
      o = {};
      for (var b in i)
        b !== "key" && (o[b] = i[b]);
    } else o = i;
    return i = o.ref, {
      $$typeof: l,
      type: a,
      key: f,
      ref: i !== void 0 ? i : null,
      props: o
    };
  }
  return A.Fragment = e, A.jsx = t, A.jsxs = t, A;
}
var k = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var K;
function we() {
  return K || (K = 1, process.env.NODE_ENV !== "production" && (function() {
    function l(r) {
      if (r == null) return null;
      if (typeof r == "function")
        return r.$$typeof === te ? null : r.displayName || r.name || null;
      if (typeof r == "string") return r;
      switch (r) {
        case u:
          return "Fragment";
        case w:
          return "Profiler";
        case d:
          return "StrictMode";
        case v:
          return "Suspense";
        case O:
          return "SuspenseList";
        case re:
          return "Activity";
      }
      if (typeof r == "object")
        switch (typeof r.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), r.$$typeof) {
          case V:
            return "Portal";
          case R:
            return r.displayName || "Context";
          case m:
            return (r._context.displayName || "Context") + ".Consumer";
          case E:
            var n = r.render;
            return r = r.displayName, r || (r = n.displayName || n.name || "", r = r !== "" ? "ForwardRef(" + r + ")" : "ForwardRef"), r;
          case F:
            return n = r.displayName || null, n !== null ? n : l(r.type) || "Memo";
          case $:
            n = r._payload, r = r._init;
            try {
              return l(r(n));
            } catch {
            }
        }
      return null;
    }
    function e(r) {
      return "" + r;
    }
    function t(r) {
      try {
        e(r);
        var n = !1;
      } catch {
        n = !0;
      }
      if (n) {
        n = console;
        var c = n.error, _ = typeof Symbol == "function" && Symbol.toStringTag && r[Symbol.toStringTag] || r.constructor.name || "Object";
        return c.call(
          n,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          _
        ), e(r);
      }
    }
    function a(r) {
      if (r === u) return "<>";
      if (typeof r == "object" && r !== null && r.$$typeof === $)
        return "<...>";
      try {
        var n = l(r);
        return n ? "<" + n + ">" : "<...>";
      } catch {
        return "<...>";
      }
    }
    function i() {
      var r = Y.A;
      return r === null ? null : r.getOwner();
    }
    function o() {
      return Error("react-stack-top-frame");
    }
    function f(r) {
      if (U.call(r, "key")) {
        var n = Object.getOwnPropertyDescriptor(r, "key").get;
        if (n && n.isReactWarning) return !1;
      }
      return r.key !== void 0;
    }
    function b(r, n) {
      function c() {
        G || (G = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          n
        ));
      }
      c.isReactWarning = !0, Object.defineProperty(r, "key", {
        get: c,
        configurable: !0
      });
    }
    function T() {
      var r = l(this.type);
      return q[r] || (q[r] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), r = this.props.ref, r !== void 0 ? r : null;
    }
    function y(r, n, c, _, I, W) {
      var p = c.ref;
      return r = {
        $$typeof: g,
        type: r,
        key: n,
        props: c,
        _owner: _
      }, (p !== void 0 ? p : null) !== null ? Object.defineProperty(r, "ref", {
        enumerable: !1,
        get: T
      }) : Object.defineProperty(r, "ref", { enumerable: !1, value: null }), r._store = {}, Object.defineProperty(r._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty(r, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.defineProperty(r, "_debugStack", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: I
      }), Object.defineProperty(r, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: W
      }), Object.freeze && (Object.freeze(r.props), Object.freeze(r)), r;
    }
    function S(r, n, c, _, I, W) {
      var p = n.children;
      if (p !== void 0)
        if (_)
          if (ie(p)) {
            for (_ = 0; _ < p.length; _++)
              x(p[_]);
            Object.freeze && Object.freeze(p);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else x(p);
      if (U.call(n, "key")) {
        p = l(r);
        var z = Object.keys(n).filter(function(se) {
          return se !== "key";
        });
        _ = 0 < z.length ? "{key: someKey, " + z.join(": ..., ") + ": ...}" : "{key: someKey}", H[p + _] || (z = 0 < z.length ? "{" + z.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          _,
          p,
          z,
          p
        ), H[p + _] = !0);
      }
      if (p = null, c !== void 0 && (t(c), p = "" + c), f(n) && (t(n.key), p = "" + n.key), "key" in n) {
        c = {};
        for (var B in n)
          B !== "key" && (c[B] = n[B]);
      } else c = n;
      return p && b(
        c,
        typeof r == "function" ? r.displayName || r.name || "Unknown" : r
      ), y(
        r,
        p,
        c,
        i(),
        I,
        W
      );
    }
    function x(r) {
      C(r) ? r._store && (r._store.validated = 1) : typeof r == "object" && r !== null && r.$$typeof === $ && (r._payload.status === "fulfilled" ? C(r._payload.value) && r._payload.value._store && (r._payload.value._store.validated = 1) : r._store && (r._store.validated = 1));
    }
    function C(r) {
      return typeof r == "object" && r !== null && r.$$typeof === g;
    }
    var M = ce, g = Symbol.for("react.transitional.element"), V = Symbol.for("react.portal"), u = Symbol.for("react.fragment"), d = Symbol.for("react.strict_mode"), w = Symbol.for("react.profiler"), m = Symbol.for("react.consumer"), R = Symbol.for("react.context"), E = Symbol.for("react.forward_ref"), v = Symbol.for("react.suspense"), O = Symbol.for("react.suspense_list"), F = Symbol.for("react.memo"), $ = Symbol.for("react.lazy"), re = Symbol.for("react.activity"), te = Symbol.for("react.client.reference"), Y = M.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, U = Object.prototype.hasOwnProperty, ie = Array.isArray, j = console.createTask ? console.createTask : function() {
      return null;
    };
    M = {
      react_stack_bottom_frame: function(r) {
        return r();
      }
    };
    var G, q = {}, Z = M.react_stack_bottom_frame.bind(
      M,
      o
    )(), J = j(a(o)), H = {};
    k.Fragment = u, k.jsx = function(r, n, c) {
      var _ = 1e4 > Y.recentlyCreatedOwnerStacks++;
      return S(
        r,
        n,
        c,
        !1,
        _ ? Error("react-stack-top-frame") : Z,
        _ ? j(a(r)) : J
      );
    }, k.jsxs = function(r, n, c) {
      var _ = 1e4 > Y.recentlyCreatedOwnerStacks++;
      return S(
        r,
        n,
        c,
        !0,
        _ ? Error("react-stack-top-frame") : Z,
        _ ? j(a(r)) : J
      );
    };
  })()), k;
}
var ee;
function be() {
  return ee || (ee = 1, process.env.NODE_ENV === "production" ? L.exports = ge() : L.exports = we()), L.exports;
}
var Ee = be();
const Re = ({
  modelUrl: l,
  pivotPoint: e,
  zoomLimits: t,
  className: a,
  style: i,
  onLoad: o,
  onError: f,
  onLoadingChange: b
}) => {
  const T = P(null), y = P(null), S = P(null), x = P(null), C = P(o), M = P(f), g = P(b);
  D(() => {
    C.current = o;
  }, [o]), D(() => {
    M.current = f;
  }, [f]), D(() => {
    g.current = b;
  }, [b]), D(() => {
    const u = T.current;
    if (!u)
      return;
    const d = new pe();
    d.initialize({
      container: u,
      antialias: !0,
      alpha: !0
    });
    const w = new fe(), m = new me();
    return d.plugins.register(w), d.plugins.register(m), y.current = d, S.current = w, x.current = m, d.start(), () => {
      d.dispose(), y.current = null, S.current = null, x.current = null;
    };
  }, []), D(() => {
    const u = T.current, d = y.current;
    if (!u || !d)
      return;
    const w = new ResizeObserver((m) => {
      for (const R of m) {
        const { width: E, height: v } = R.contentRect;
        E > 0 && v > 0 && d.resize(E, v);
      }
    });
    return w.observe(u), () => {
      w.disconnect();
    };
  }, []), D(() => {
    var w;
    const u = S.current, d = x.current;
    if (u) {
      if (!l) {
        u.unload();
        return;
      }
      (w = g.current) == null || w.call(g, !0), u.load(l).then((m) => {
        var R, E;
        if ((R = g.current) == null || R.call(g, !1), d && !e && d.setTarget(m.center), d && !t) {
          const v = m.boundingBox, O = new h.Vector3();
          v.getSize(O);
          const F = Math.max(O.x, O.y, O.z);
          d.setZoomLimits(F * 0.1, F * 10);
        }
        (E = C.current) == null || E.call(C, m);
      }).catch((m) => {
        var E, v;
        (E = g.current) == null || E.call(g, !1);
        const R = m instanceof Error ? m : new Error(String(m));
        (v = M.current) == null || v.call(M, R);
      });
    }
  }, [l]), D(() => {
    const u = x.current;
    if (u && e) {
      const d = new h.Vector3(e.x, e.y, e.z);
      u.setTarget(d);
    }
  }, [e]), D(() => {
    const u = x.current;
    if (u && t) {
      const d = t.min ?? 0.1, w = t.max ?? 1e3;
      u.setZoomLimits(d, w);
    }
  }, [t]);
  const V = {
    width: "100%",
    height: "100%",
    ...i
  };
  return /* @__PURE__ */ Ee.jsx(
    "div",
    {
      ref: T,
      className: a,
      style: V
    }
  );
};
export {
  he as CameraManager,
  fe as ModelLoaderPlugin,
  me as OrbitControlsPlugin,
  _e as PluginSystem,
  ue as RenderManager,
  de as SceneManager,
  Re as ThreeViewer,
  pe as ViewerCore
};
//# sourceMappingURL=threejs-viewer.mjs.map
