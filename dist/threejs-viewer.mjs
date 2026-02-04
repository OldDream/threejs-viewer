var he = Object.defineProperty;
var ue = (o, e, t) => e in o ? he(o, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[e] = t;
var n = (o, e, t) => ue(o, typeof e != "symbol" ? e + "" : e, t);
import * as h from "three";
import { GLTFLoader as _e, OrbitControls as pe } from "three-stdlib";
import fe, { createContext as me, useState as ie, useRef as T, useCallback as se, useEffect as E, useMemo as ge, forwardRef as we, useImperativeHandle as xe, useContext as be } from "react";
class Me {
  constructor() {
    n(this, "_scene");
    n(this, "_isDisposed", !1);
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
    ].forEach((s) => {
      const r = e[s];
      r instanceof h.Texture && r.dispose();
    }), e.dispose();
  }
}
const q = {
  fov: 75,
  near: 0.01,
  // Smaller near plane to prevent clipping when rotating close to model
  far: 1e4,
  // Larger far plane for viewing large models from distance
  position: new h.Vector3(0, 0, 5)
};
class ve {
  constructor(e) {
    n(this, "_camera");
    n(this, "_isDisposed", !1);
    const t = (e == null ? void 0 : e.fov) ?? q.fov, s = (e == null ? void 0 : e.near) ?? q.near, r = (e == null ? void 0 : e.far) ?? q.far, c = (e == null ? void 0 : e.position) ?? q.position.clone();
    this._camera = new h.PerspectiveCamera(t, 1, s, r), this._camera.position.copy(c);
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
const ne = {
  antialias: !0,
  alpha: !1
};
class Ee {
  constructor() {
    n(this, "_renderer", null);
    n(this, "_container", null);
    n(this, "_isDisposed", !1);
    n(this, "_isInitialized", !1);
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
    const s = (t == null ? void 0 : t.antialias) ?? ne.antialias, r = (t == null ? void 0 : t.alpha) ?? ne.alpha;
    this._renderer = new h.WebGLRenderer({
      antialias: s,
      alpha: r
    }), this._renderer.setPixelRatio(window.devicePixelRatio);
    const c = e.clientWidth || 1, _ = e.clientHeight || 1;
    this._renderer.setSize(c, _), e.appendChild(this._renderer.domElement), this._container = e, this._isInitialized = !0;
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
    const s = Math.max(1, Math.floor(e)), r = Math.max(1, Math.floor(t));
    this._renderer.setSize(s, r);
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
class De {
  constructor() {
    n(this, "_plugins", /* @__PURE__ */ new Map());
    n(this, "_context", null);
    n(this, "_isDisposed", !1);
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
        } catch (s) {
          console.error(`Error updating plugin "${t.name}":`, s);
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
class Re {
  constructor() {
    n(this, "_sceneManager");
    n(this, "_cameraManager");
    n(this, "_renderManager");
    n(this, "_pluginSystem");
    n(this, "_container", null);
    n(this, "_isInitialized", !1);
    n(this, "_isRunning", !1);
    n(this, "_isDisposed", !1);
    n(this, "_animationFrameId", null);
    n(this, "_lastTime", 0);
    /**
     * The main render loop.
     * Calculates deltaTime, updates all plugins, and renders the scene.
     */
    n(this, "_renderLoop", () => {
      if (!this._isRunning || this._isDisposed)
        return;
      const e = performance.now(), t = (e - this._lastTime) / 1e3;
      this._lastTime = e, this._pluginSystem.updateAll(t), this._renderManager.render(
        this._sceneManager.scene,
        this._cameraManager.camera
      ), this._animationFrameId = requestAnimationFrame(this._renderLoop);
    });
    this._sceneManager = new Me(), this._cameraManager = new ve(), this._renderManager = new Ee(), this._pluginSystem = new De();
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
    const { container: t, antialias: s, alpha: r, cameraConfig: c } = e;
    this._container = t, c && this._cameraManager.configure(c);
    const _ = {};
    s !== void 0 && (_.antialias = s), r !== void 0 && (_.alpha = r), this._renderManager.initialize(t, _);
    const g = t.clientWidth || 1, y = t.clientHeight || 1;
    this._cameraManager.setAspect(g / y), this._setupDefaultLighting();
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
    const s = Math.max(1, e), r = Math.max(1, t);
    this._cameraManager.setAspect(s / r), this._renderManager.setSize(s, r);
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
    const e = this._sceneManager.scene, t = new h.AmbientLight(16777215, 0.5);
    e.add(t);
    const s = new h.DirectionalLight(16777215, 1);
    s.position.set(5, 10, 7.5), e.add(s);
    const r = new h.DirectionalLight(16777215, 0.5);
    r.position.set(-5, 5, -5), e.add(r);
    const c = new h.HemisphereLight(16777215, 4473924, 0.5);
    c.position.set(0, 20, 0), e.add(c);
  }
}
class Te {
  constructor() {
    n(this, "name", "ModelLoaderPlugin");
    n(this, "_context", null);
    n(this, "_loader");
    n(this, "_currentModel", null);
    n(this, "_boundingBox", null);
    n(this, "_center", null);
    n(this, "_loadingState", {
      isLoading: !1,
      progress: 0,
      error: null
    });
    n(this, "_isDisposed", !1);
    this._loader = new _e();
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
      const s = (await this._loadGLTF(e)).scene;
      this._context.scene.add(s), this._currentModel = s;
      const r = new h.Box3().setFromObject(s), c = new h.Vector3();
      return r.getCenter(c), this._boundingBox = r, this._center = c, this._loadingState = {
        isLoading: !1,
        progress: 100,
        error: null
      }, {
        model: s,
        boundingBox: r,
        center: c
      };
    } catch (t) {
      const s = t instanceof Error ? t : new Error(`Failed to load model from URL: ${e}`);
      throw this._loadingState = {
        isLoading: !1,
        progress: 0,
        error: s
      }, s;
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
    return new Promise((t, s) => {
      this._loader.load(
        e,
        // onLoad callback
        (r) => {
          t(r);
        },
        // onProgress callback
        (r) => {
          if (r.lengthComputable) {
            const c = r.loaded / r.total * 100;
            this._loadingState = {
              ...this._loadingState,
              progress: Math.round(c)
            };
          }
        },
        // onError callback
        (r) => {
          const c = r instanceof Error ? r.message : `Failed to load model from URL: ${e}`;
          s(new Error(c));
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
    ].forEach((s) => {
      const r = e[s];
      r instanceof h.Texture && r.dispose();
    }), e.dispose();
  }
}
class ye {
  constructor() {
    n(this, "name", "OrbitControlsPlugin");
    n(this, "_context", null);
    n(this, "_controls", null);
    n(this, "_isDisposed", !1);
    // Store initial state for reset functionality
    n(this, "_initialTarget", new h.Vector3(0, 0, 0));
    n(this, "_initialCameraPosition", new h.Vector3(0, 0, 5));
    n(this, "_initialMinDistance", 0.1);
    // Allow closer zoom with smaller near plane
    n(this, "_initialMaxDistance", 1e4);
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
    this._context = e, this._controls = new pe(e.camera, e.container), this._initialCameraPosition.copy(e.camera.position), this._controls.minDistance = this._initialMinDistance, this._controls.maxDistance = this._initialMaxDistance, this._controls.enableDamping = !0, this._controls.dampingFactor = 0.05, this._controls.enablePan = !0, this._controls.enableRotate = !0, this._controls.enableZoom = !0;
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
    n(this, "name", "GridHelperPlugin");
    n(this, "_context", null);
    n(this, "_gridHelper", null);
    n(this, "_axesHelper", null);
    n(this, "_isDisposed", !1);
    n(this, "_config", {
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
    this._context && (this._gridHelper && (this._context.scene.remove(this._gridHelper), this._gridHelper.dispose()), this._gridHelper = new h.GridHelper(
      this._config.size,
      this._config.divisions,
      this._config.colorCenterLine,
      this._config.colorGrid
    ), this._applyPlaneRotation(), this._context.scene.add(this._gridHelper));
  }
  _createAxes() {
    this._context && (this._axesHelper && (this._context.scene.remove(this._axesHelper), this._axesHelper.dispose()), this._config.showAxes && (this._axesHelper = new h.AxesHelper(this._config.axesSize), this._context.scene.add(this._axesHelper)));
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
    this._gridHelper && (this._gridHelper.visible = e), this._axesHelper && (this._axesHelper.visible = e);
  }
  setPlane(e) {
    this._config.plane = e, this._applyPlaneRotation();
  }
  setAxesVisible(e) {
    this._config.showAxes = e, this._createAxes();
  }
  update(e) {
  }
  dispose() {
    this._isDisposed || (this._gridHelper && this._context && (this._context.scene.remove(this._gridHelper), this._gridHelper.dispose(), this._gridHelper = null), this._axesHelper && this._context && (this._context.scene.remove(this._axesHelper), this._axesHelper.dispose(), this._axesHelper = null), this._context = null, this._isDisposed = !0);
  }
}
var J = { exports: {} }, Y = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ae;
function Pe() {
  if (ae) return Y;
  ae = 1;
  var o = Symbol.for("react.transitional.element"), e = Symbol.for("react.fragment");
  function t(s, r, c) {
    var _ = null;
    if (c !== void 0 && (_ = "" + c), r.key !== void 0 && (_ = "" + r.key), "key" in r) {
      c = {};
      for (var g in r)
        g !== "key" && (c[g] = r[g]);
    } else c = r;
    return r = c.ref, {
      $$typeof: o,
      type: s,
      key: _,
      ref: r !== void 0 ? r : null,
      props: c
    };
  }
  return Y.Fragment = e, Y.jsx = t, Y.jsxs = t, Y;
}
var $ = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var oe;
function Se() {
  return oe || (oe = 1, process.env.NODE_ENV !== "production" && (function() {
    function o(i) {
      if (i == null) return null;
      if (typeof i == "function")
        return i.$$typeof === v ? null : i.displayName || i.name || null;
      if (typeof i == "string") return i;
      switch (i) {
        case P:
          return "Fragment";
        case B:
          return "Profiler";
        case A:
          return "StrictMode";
        case H:
          return "Suspense";
        case M:
          return "SuspenseList";
        case d:
          return "Activity";
      }
      if (typeof i == "object")
        switch (typeof i.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), i.$$typeof) {
          case C:
            return "Portal";
          case U:
            return i.displayName || "Context";
          case X:
            return (i._context.displayName || "Context") + ".Consumer";
          case I:
            var a = i.render;
            return i = i.displayName, i || (i = a.displayName || a.name || "", i = i !== "" ? "ForwardRef(" + i + ")" : "ForwardRef"), i;
          case Q:
            return a = i.displayName || null, a !== null ? a : o(i.type) || "Memo";
          case l:
            a = i._payload, i = i._init;
            try {
              return o(i(a));
            } catch {
            }
        }
      return null;
    }
    function e(i) {
      return "" + i;
    }
    function t(i) {
      try {
        e(i);
        var a = !1;
      } catch {
        a = !0;
      }
      if (a) {
        a = console;
        var u = a.error, p = typeof Symbol == "function" && Symbol.toStringTag && i[Symbol.toStringTag] || i.constructor.name || "Object";
        return u.call(
          a,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          p
        ), e(i);
      }
    }
    function s(i) {
      if (i === P) return "<>";
      if (typeof i == "object" && i !== null && i.$$typeof === l)
        return "<...>";
      try {
        var a = o(i);
        return a ? "<" + a + ">" : "<...>";
      } catch {
        return "<...>";
      }
    }
    function r() {
      var i = D.A;
      return i === null ? null : i.getOwner();
    }
    function c() {
      return Error("react-stack-top-frame");
    }
    function _(i) {
      if (w.call(i, "key")) {
        var a = Object.getOwnPropertyDescriptor(i, "key").get;
        if (a && a.isReactWarning) return !1;
      }
      return i.key !== void 0;
    }
    function g(i, a) {
      function u() {
        R || (R = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          a
        ));
      }
      u.isReactWarning = !0, Object.defineProperty(i, "key", {
        get: u,
        configurable: !0
      });
    }
    function y() {
      var i = o(this.type);
      return F[i] || (F[i] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), i = this.props.ref, i !== void 0 ? i : null;
    }
    function m(i, a, u, p, Z, K) {
      var f = u.ref;
      return i = {
        $$typeof: k,
        type: i,
        key: a,
        props: u,
        _owner: p
      }, (f !== void 0 ? f : null) !== null ? Object.defineProperty(i, "ref", {
        enumerable: !1,
        get: y
      }) : Object.defineProperty(i, "ref", { enumerable: !1, value: null }), i._store = {}, Object.defineProperty(i._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty(i, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.defineProperty(i, "_debugStack", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: Z
      }), Object.defineProperty(i, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: K
      }), Object.freeze && (Object.freeze(i.props), Object.freeze(i)), i;
    }
    function z(i, a, u, p, Z, K) {
      var f = a.children;
      if (f !== void 0)
        if (p)
          if (S(f)) {
            for (p = 0; p < f.length; p++)
              W(f[p]);
            Object.freeze && Object.freeze(f);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else W(f);
      if (w.call(a, "key")) {
        f = o(i);
        var V = Object.keys(a).filter(function(de) {
          return de !== "key";
        });
        p = 0 < V.length ? "{key: someKey, " + V.join(": ..., ") + ": ...}" : "{key: someKey}", L[f + p] || (V = 0 < V.length ? "{" + V.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          p,
          f,
          V,
          f
        ), L[f + p] = !0);
      }
      if (f = null, u !== void 0 && (t(u), f = "" + u), _(a) && (t(a.key), f = "" + a.key), "key" in a) {
        u = {};
        for (var ee in a)
          ee !== "key" && (u[ee] = a[ee]);
      } else u = a;
      return f && g(
        u,
        typeof i == "function" ? i.displayName || i.name || "Unknown" : i
      ), m(
        i,
        f,
        u,
        r(),
        Z,
        K
      );
    }
    function W(i) {
      O(i) ? i._store && (i._store.validated = 1) : typeof i == "object" && i !== null && i.$$typeof === l && (i._payload.status === "fulfilled" ? O(i._payload.value) && i._payload.value._store && (i._payload.value._store.validated = 1) : i._store && (i._store.validated = 1));
    }
    function O(i) {
      return typeof i == "object" && i !== null && i.$$typeof === k;
    }
    var b = fe, k = Symbol.for("react.transitional.element"), C = Symbol.for("react.portal"), P = Symbol.for("react.fragment"), A = Symbol.for("react.strict_mode"), B = Symbol.for("react.profiler"), X = Symbol.for("react.consumer"), U = Symbol.for("react.context"), I = Symbol.for("react.forward_ref"), H = Symbol.for("react.suspense"), M = Symbol.for("react.suspense_list"), Q = Symbol.for("react.memo"), l = Symbol.for("react.lazy"), d = Symbol.for("react.activity"), v = Symbol.for("react.client.reference"), D = b.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, w = Object.prototype.hasOwnProperty, S = Array.isArray, x = console.createTask ? console.createTask : function() {
      return null;
    };
    b = {
      react_stack_bottom_frame: function(i) {
        return i();
      }
    };
    var R, F = {}, N = b.react_stack_bottom_frame.bind(
      b,
      c
    )(), G = x(s(c)), L = {};
    $.Fragment = P, $.jsx = function(i, a, u) {
      var p = 1e4 > D.recentlyCreatedOwnerStacks++;
      return z(
        i,
        a,
        u,
        !1,
        p ? Error("react-stack-top-frame") : N,
        p ? x(s(i)) : G
      );
    }, $.jsxs = function(i, a, u) {
      var p = 1e4 > D.recentlyCreatedOwnerStacks++;
      return z(
        i,
        a,
        u,
        !0,
        p ? Error("react-stack-top-frame") : N,
        p ? x(s(i)) : G
      );
    };
  })()), $;
}
var le;
function Ce() {
  return le || (le = 1, process.env.NODE_ENV === "production" ? J.exports = Pe() : J.exports = Se()), J.exports;
}
var te = Ce();
const re = me(
  void 0
);
re.displayName = "ThreeInstanceContext";
const j = {
  scene: null,
  camera: null,
  renderer: null,
  container: null,
  isReady: !1,
  isDisposed: !1
}, Ae = {
  unmounted: ["mounted"],
  mounted: ["initialized", "disposed"],
  initialized: ["disposed"],
  disposed: []
  // Terminal state
}, Oe = {
  unmounted: !1,
  mounted: !1,
  initialized: !0,
  disposed: !1
};
function ke(o, e) {
  return Ae[o].includes(e);
}
function Ie(o, e) {
  const t = Oe[e];
  return e === "disposed" ? {
    ...j,
    isDisposed: !0
  } : !t || !o || !o.isInitialized ? j : {
    scene: o.scene.scene,
    camera: o.camera.camera,
    renderer: o.renderer.renderer,
    container: o.container,
    isReady: !0,
    isDisposed: !1
  };
}
function ce({
  children: o,
  viewerCore: e
}) {
  const [t, s] = ie("unmounted"), r = T(!1), c = T(null), _ = se((m) => {
    s((z) => ke(z, m) ? m : z);
  }, []);
  E(() => (r.current = !0, _("mounted"), () => {
    r.current = !1, s((m) => m !== "disposed" ? "disposed" : m);
  }), [_]), E(() => {
    const m = c.current;
    if (c.current = e, m && !e) {
      _("disposed");
      return;
    }
    e && e.isInitialized && _("initialized");
  }, [e, _]);
  const g = se(() => {
    e && e.isInitialized && t === "mounted" && _("initialized");
  }, [e, t, _]);
  E(() => {
    if (!e || t !== "mounted")
      return;
    g();
    const m = setInterval(g, 50), z = setTimeout(() => {
      clearInterval(m);
    }, 5e3);
    return () => {
      clearInterval(m), clearTimeout(z);
    };
  }, [e, t, g]);
  const y = ge(() => Ie(e, t), [e, t]);
  return /* @__PURE__ */ te.jsx(re.Provider, { value: y, children: o });
}
ce.displayName = "ThreeInstanceProvider";
const He = we(
  function({
    modelUrl: e,
    pivotPoint: t,
    zoomLimits: s,
    grid: r,
    className: c,
    style: _,
    onLoad: g,
    onError: y,
    onLoadingChange: m,
    children: z
  }, W) {
    const O = T(null), b = T(null), k = T(null), C = T(null), P = T(null), [A, B] = ie(!1), [X, U] = ie(null), I = T(g), H = T(y), M = T(m);
    E(() => {
      I.current = g;
    }, [g]), E(() => {
      H.current = y;
    }, [y]), E(() => {
      M.current = m;
    }, [m]), xe(
      W,
      () => ({
        getInstances() {
          if (A)
            return {
              ...j,
              isDisposed: !0
            };
          const l = b.current;
          return !l || !l.isInitialized ? j : {
            scene: l.scene.scene,
            camera: l.camera.camera,
            renderer: l.renderer.renderer,
            container: l.container,
            isReady: !0,
            isDisposed: !1
          };
        },
        getViewerCore() {
          return A ? null : b.current;
        },
        isReady() {
          if (A)
            return !1;
          const l = b.current;
          return l !== null && l.isInitialized;
        },
        isDisposed() {
          return A;
        }
      }),
      [A]
    ), E(() => {
      const l = O.current;
      if (!l)
        return;
      const d = new Re();
      d.initialize({
        container: l,
        antialias: !0,
        alpha: !0
      });
      const v = new Te(), D = new ye(), w = new ze();
      return d.plugins.register(v), d.plugins.register(D), d.plugins.register(w), b.current = d, k.current = v, C.current = D, P.current = w, U(d), B(!1), d.start(), () => {
        d.dispose(), b.current = null, k.current = null, C.current = null, P.current = null, U(null), B(!0);
      };
    }, []), E(() => {
      const l = O.current, d = b.current;
      if (!l || !d)
        return;
      const v = new ResizeObserver((D) => {
        for (const w of D) {
          const { width: S, height: x } = w.contentRect;
          S > 0 && x > 0 && d.resize(S, x);
        }
      });
      return v.observe(l), () => {
        v.disconnect();
      };
    }, []), E(() => {
      var D;
      const l = k.current, d = C.current, v = P.current;
      if (l) {
        if (!e) {
          l.unload();
          return;
        }
        (D = M.current) == null || D.call(M, !0), l.load(e).then((w) => {
          var F, N, G;
          (F = M.current) == null || F.call(M, !1), d && !t && d.setTarget(w.center);
          const S = w.boundingBox, x = new h.Vector3();
          S.getSize(x);
          const R = Math.max(x.x, x.y, x.z);
          if (d && !s) {
            const L = ((N = b.current) == null ? void 0 : N.camera.camera.far) ?? 1e3, i = Math.min(R * 10, L * 0.9);
            d.setZoomLimits(R * 0.1, i);
          }
          if (v && (!r || r.size === void 0)) {
            const L = R * 3;
            v.configure({
              size: L,
              divisions: 10,
              axesSize: R * 1.5
              // Axes 1.5x model size
            });
          }
          (G = I.current) == null || G.call(I, w);
        }).catch((w) => {
          var x, R;
          (x = M.current) == null || x.call(M, !1);
          const S = w instanceof Error ? w : new Error(String(w));
          (R = H.current) == null || R.call(H, S);
        });
      }
    }, [e]), E(() => {
      const l = C.current;
      if (l && t) {
        const d = new h.Vector3(t.x, t.y, t.z);
        l.setTarget(d);
      }
    }, [t]), E(() => {
      const l = C.current;
      if (l && s) {
        const d = s.min ?? 0.1, v = s.max ?? 1e4;
        l.setZoomLimits(d, v);
      }
    }, [s]), E(() => {
      const l = P.current;
      if (l)
        if (r) {
          const d = {};
          r.size !== void 0 && (d.size = r.size), r.divisions !== void 0 && (d.divisions = r.divisions), r.plane !== void 0 && (d.plane = r.plane), r.showAxes !== void 0 && (d.showAxes = r.showAxes), l.configure(d), l.setVisible(r.visible !== !1);
        } else
          l.setVisible(!1);
    }, [r]);
    const Q = {
      width: "100%",
      height: "100%",
      ..._
    };
    return /* @__PURE__ */ te.jsxs(ce, { viewerCore: X, children: [
      /* @__PURE__ */ te.jsx(
        "div",
        {
          ref: O,
          className: c,
          style: Q
        }
      ),
      z
    ] });
  }
);
He.displayName = "ThreeViewer";
function Ne() {
  const o = be(re);
  if (o === void 0)
    throw new Error(
      "useThreeInstance must be used within a ThreeViewer component. Make sure your component is a child of <ThreeViewer>."
    );
  return o;
}
export {
  ve as CameraManager,
  ze as GridHelperPlugin,
  Te as ModelLoaderPlugin,
  ye as OrbitControlsPlugin,
  De as PluginSystem,
  Ee as RenderManager,
  Me as SceneManager,
  He as ThreeViewer,
  Re as ViewerCore,
  Ne as useThreeInstance
};
//# sourceMappingURL=threejs-viewer.mjs.map
