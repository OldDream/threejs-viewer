var ue = Object.defineProperty;
var he = (o, e, r) => e in o ? ue(o, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : o[e] = r;
var n = (o, e, r) => he(o, typeof e != "symbol" ? e + "" : e, r);
import * as _ from "three";
import { GLTFLoader as _e, OrbitControls as pe } from "three-stdlib";
import fe, { createContext as me, useState as J, useRef as y, useCallback as se, useEffect as v, useMemo as ge, forwardRef as we, useImperativeHandle as be, useContext as Me } from "react";
class Ee {
  constructor() {
    n(this, "_scene");
    n(this, "_isDisposed", !1);
    this._scene = new _.Scene();
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
    this._isDisposed || (this.clear(), this._scene.background && (this._scene.background instanceof _.Texture && this._scene.background.dispose(), this._scene.background = null), this._scene.environment && (this._scene.environment.dispose(), this._scene.environment = null), this._isDisposed = !0);
  }
  /**
   * Recursively disposes of an object and all its children.
   * Handles geometry, materials, and textures disposal.
   * @param object - The THREE.Object3D to dispose
   */
  _disposeObject(e) {
    for (; e.children.length > 0; ) {
      const r = e.children[0];
      r && (this._disposeObject(r), e.remove(r));
    }
    e instanceof _.Mesh && (e.geometry && e.geometry.dispose(), e.material && this._disposeMaterial(e.material)), (e instanceof _.Line || e instanceof _.Points) && (e.geometry && e.geometry.dispose(), e.material && this._disposeMaterial(e.material));
  }
  /**
   * Disposes of a material or array of materials.
   * Also disposes of any textures associated with the material.
   * @param material - The material or array of materials to dispose
   */
  _disposeMaterial(e) {
    Array.isArray(e) ? e.forEach((r) => this._disposeSingleMaterial(r)) : this._disposeSingleMaterial(e);
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
      const i = e[s];
      i instanceof _.Texture && i.dispose();
    }), e.dispose();
  }
}
const B = {
  fov: 75,
  near: 0.1,
  far: 1e3,
  position: new _.Vector3(0, 0, 5)
};
class ve {
  constructor(e) {
    n(this, "_camera");
    n(this, "_isDisposed", !1);
    const r = (e == null ? void 0 : e.fov) ?? B.fov, s = (e == null ? void 0 : e.near) ?? B.near, i = (e == null ? void 0 : e.far) ?? B.far, l = (e == null ? void 0 : e.position) ?? B.position.clone();
    this._camera = new _.PerspectiveCamera(r, 1, s, i), this._camera.position.copy(l);
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
class xe {
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
  initialize(e, r) {
    if (this._isDisposed)
      throw new Error("RenderManager has been disposed");
    if (this._isInitialized)
      throw new Error("RenderManager has already been initialized");
    const s = (r == null ? void 0 : r.antialias) ?? ne.antialias, i = (r == null ? void 0 : r.alpha) ?? ne.alpha;
    this._renderer = new _.WebGLRenderer({
      antialias: s,
      alpha: i
    }), this._renderer.setPixelRatio(window.devicePixelRatio);
    const l = e.clientWidth || 1, d = e.clientHeight || 1;
    this._renderer.setSize(l, d), e.appendChild(this._renderer.domElement), this._container = e, this._isInitialized = !0;
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
  setSize(e, r) {
    if (this._isDisposed)
      throw new Error("RenderManager has been disposed");
    if (!this._renderer)
      throw new Error("RenderManager has not been initialized. Call initialize() first.");
    const s = Math.max(1, Math.floor(e)), i = Math.max(1, Math.floor(r));
    this._renderer.setSize(s, i);
  }
  /**
   * Renders the scene using the provided camera.
   * @param scene - The THREE.Scene to render
   * @param camera - The THREE.Camera to use for rendering
   * @throws Error if the RenderManager has been disposed
   * @throws Error if the RenderManager has not been initialized
   */
  render(e, r) {
    if (this._isDisposed)
      throw new Error("RenderManager has been disposed");
    if (!this._renderer)
      throw new Error("RenderManager has not been initialized. Call initialize() first.");
    this._renderer.render(e, r);
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
class Re {
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
    const r = this._plugins.get(e);
    r && (r.dispose(), this._plugins.delete(e));
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
    for (const r of this._plugins.values())
      if (r.update)
        try {
          r.update(e);
        } catch (s) {
          console.error(`Error updating plugin "${r.name}":`, s);
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
        } catch (r) {
          console.error(`Error disposing plugin "${e.name}":`, r);
        }
      this._plugins.clear(), this._context = null, this._isDisposed = !0;
    }
  }
}
class De {
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
      const e = performance.now(), r = (e - this._lastTime) / 1e3;
      this._lastTime = e, this._pluginSystem.updateAll(r), this._renderManager.render(
        this._sceneManager.scene,
        this._cameraManager.camera
      ), this._animationFrameId = requestAnimationFrame(this._renderLoop);
    });
    this._sceneManager = new Ee(), this._cameraManager = new ve(), this._renderManager = new xe(), this._pluginSystem = new Re();
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
    const { container: r, antialias: s, alpha: i, cameraConfig: l } = e;
    this._container = r, l && this._cameraManager.configure(l);
    const d = {};
    s !== void 0 && (d.antialias = s), i !== void 0 && (d.alpha = i), this._renderManager.initialize(r, d);
    const g = r.clientWidth || 1, R = r.clientHeight || 1;
    this._cameraManager.setAspect(g / R);
    const m = {
      scene: this._sceneManager.scene,
      camera: this._cameraManager.camera,
      renderer: this._renderManager.renderer,
      container: r
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
  resize(e, r) {
    if (this._isDisposed)
      throw new Error("ViewerCore has been disposed");
    if (!this._isInitialized)
      throw new Error("ViewerCore has not been initialized. Call initialize() first.");
    const s = Math.max(1, e), i = Math.max(1, r);
    this._cameraManager.setAspect(s / i), this._renderManager.setSize(s, i);
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
      const i = new _.Box3().setFromObject(s), l = new _.Vector3();
      return i.getCenter(l), this._boundingBox = i, this._center = l, this._loadingState = {
        isLoading: !1,
        progress: 100,
        error: null
      }, {
        model: s,
        boundingBox: i,
        center: l
      };
    } catch (r) {
      const s = r instanceof Error ? r : new Error(`Failed to load model from URL: ${e}`);
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
    return new Promise((r, s) => {
      this._loader.load(
        e,
        // onLoad callback
        (i) => {
          r(i);
        },
        // onProgress callback
        (i) => {
          if (i.lengthComputable) {
            const l = i.loaded / i.total * 100;
            this._loadingState = {
              ...this._loadingState,
              progress: Math.round(l)
            };
          }
        },
        // onError callback
        (i) => {
          const l = i instanceof Error ? i.message : `Failed to load model from URL: ${e}`;
          s(new Error(l));
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
      const r = e.children[0];
      r && (this._disposeObject(r), e.remove(r));
    }
    e instanceof _.Mesh && (e.geometry && e.geometry.dispose(), e.material && this._disposeMaterial(e.material)), (e instanceof _.Line || e instanceof _.Points) && (e.geometry && e.geometry.dispose(), e.material && this._disposeMaterial(e.material)), e instanceof _.SkinnedMesh && e.skeleton && e.skeleton.dispose();
  }
  /**
   * Disposes of a material or array of materials.
   * Also disposes of any textures associated with the material.
   * 
   * @param material - The material or array of materials to dispose
   */
  _disposeMaterial(e) {
    Array.isArray(e) ? e.forEach((r) => this._disposeSingleMaterial(r)) : this._disposeSingleMaterial(e);
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
      const i = e[s];
      i instanceof _.Texture && i.dispose();
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
    n(this, "_initialTarget", new _.Vector3(0, 0, 0));
    n(this, "_initialCameraPosition", new _.Vector3(0, 0, 5));
    n(this, "_initialMinDistance", 0.1);
    n(this, "_initialMaxDistance", 1e3);
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
  setZoomLimits(e, r) {
    if (this._isDisposed)
      throw new Error("OrbitControlsPlugin has been disposed");
    if (!this._controls)
      throw new Error("OrbitControlsPlugin has not been initialized. Call initialize() first.");
    if (e > r)
      throw new Error("Minimum zoom distance cannot be greater than maximum zoom distance");
    if (e < 0)
      throw new Error("Minimum zoom distance cannot be negative");
    this._controls.minDistance = e, this._controls.maxDistance = r, this._initialMinDistance = e, this._initialMaxDistance = r, this._controls.update();
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
var U = { exports: {} }, L = {};
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
  if (ae) return L;
  ae = 1;
  var o = Symbol.for("react.transitional.element"), e = Symbol.for("react.fragment");
  function r(s, i, l) {
    var d = null;
    if (l !== void 0 && (d = "" + l), i.key !== void 0 && (d = "" + i.key), "key" in i) {
      l = {};
      for (var g in i)
        g !== "key" && (l[g] = i[g]);
    } else l = i;
    return i = l.ref, {
      $$typeof: o,
      type: s,
      key: d,
      ref: i !== void 0 ? i : null,
      props: l
    };
  }
  return L.Fragment = e, L.jsx = r, L.jsxs = r, L;
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
    function o(t) {
      if (t == null) return null;
      if (typeof t == "function")
        return t.$$typeof === C ? null : t.displayName || t.name || null;
      if (typeof t == "string") return t;
      switch (t) {
        case k:
          return "Fragment";
        case j:
          return "Profiler";
        case G:
          return "StrictMode";
        case q:
          return "Suspense";
        case c:
          return "SuspenseList";
        case b:
          return "Activity";
      }
      if (typeof t == "object")
        switch (typeof t.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), t.$$typeof) {
          case z:
            return "Portal";
          case I:
            return t.displayName || "Context";
          case A:
            return (t._context.displayName || "Context") + ".Consumer";
          case M:
            var a = t.render;
            return t = t.displayName, t || (t = a.displayName || a.name || "", t = t !== "" ? "ForwardRef(" + t + ")" : "ForwardRef"), t;
          case h:
            return a = t.displayName || null, a !== null ? a : o(t.type) || "Memo";
          case w:
            a = t._payload, t = t._init;
            try {
              return o(t(a));
            } catch {
            }
        }
      return null;
    }
    function e(t) {
      return "" + t;
    }
    function r(t) {
      try {
        e(t);
        var a = !1;
      } catch {
        a = !0;
      }
      if (a) {
        a = console;
        var u = a.error, p = typeof Symbol == "function" && Symbol.toStringTag && t[Symbol.toStringTag] || t.constructor.name || "Object";
        return u.call(
          a,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          p
        ), e(t);
      }
    }
    function s(t) {
      if (t === k) return "<>";
      if (typeof t == "object" && t !== null && t.$$typeof === w)
        return "<...>";
      try {
        var a = o(t);
        return a ? "<" + a + ">" : "<...>";
      } catch {
        return "<...>";
      }
    }
    function i() {
      var t = E.A;
      return t === null ? null : t.getOwner();
    }
    function l() {
      return Error("react-stack-top-frame");
    }
    function d(t) {
      if (x.call(t, "key")) {
        var a = Object.getOwnPropertyDescriptor(t, "key").get;
        if (a && a.isReactWarning) return !1;
      }
      return t.key !== void 0;
    }
    function g(t, a) {
      function u() {
        K || (K = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          a
        ));
      }
      u.isReactWarning = !0, Object.defineProperty(t, "key", {
        get: u,
        configurable: !0
      });
    }
    function R() {
      var t = o(this.type);
      return ee[t] || (ee[t] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), t = this.props.ref, t !== void 0 ? t : null;
    }
    function m(t, a, u, p, W, Z) {
      var f = u.ref;
      return t = {
        $$typeof: S,
        type: t,
        key: a,
        props: u,
        _owner: p
      }, (f !== void 0 ? f : null) !== null ? Object.defineProperty(t, "ref", {
        enumerable: !1,
        get: R
      }) : Object.defineProperty(t, "ref", { enumerable: !1, value: null }), t._store = {}, Object.defineProperty(t._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty(t, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.defineProperty(t, "_debugStack", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: W
      }), Object.defineProperty(t, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: Z
      }), Object.freeze && (Object.freeze(t.props), Object.freeze(t)), t;
    }
    function D(t, a, u, p, W, Z) {
      var f = a.children;
      if (f !== void 0)
        if (p)
          if (N(f)) {
            for (p = 0; p < f.length; p++)
              O(f[p]);
            Object.freeze && Object.freeze(f);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else O(f);
      if (x.call(a, "key")) {
        f = o(t);
        var V = Object.keys(a).filter(function(de) {
          return de !== "key";
        });
        p = 0 < V.length ? "{key: someKey, " + V.join(": ..., ") + ": ...}" : "{key: someKey}", ie[f + p] || (V = 0 < V.length ? "{" + V.join(": ..., ") + ": ...}" : "{}", console.error(
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
        ), ie[f + p] = !0);
      }
      if (f = null, u !== void 0 && (r(u), f = "" + u), d(a) && (r(a.key), f = "" + a.key), "key" in a) {
        u = {};
        for (var H in a)
          H !== "key" && (u[H] = a[H]);
      } else u = a;
      return f && g(
        u,
        typeof t == "function" ? t.displayName || t.name || "Unknown" : t
      ), m(
        t,
        f,
        u,
        i(),
        W,
        Z
      );
    }
    function O(t) {
      T(t) ? t._store && (t._store.validated = 1) : typeof t == "object" && t !== null && t.$$typeof === w && (t._payload.status === "fulfilled" ? T(t._payload.value) && t._payload.value._store && (t._payload.value._store.validated = 1) : t._store && (t._store.validated = 1));
    }
    function T(t) {
      return typeof t == "object" && t !== null && t.$$typeof === S;
    }
    var P = fe, S = Symbol.for("react.transitional.element"), z = Symbol.for("react.portal"), k = Symbol.for("react.fragment"), G = Symbol.for("react.strict_mode"), j = Symbol.for("react.profiler"), A = Symbol.for("react.consumer"), I = Symbol.for("react.context"), M = Symbol.for("react.forward_ref"), q = Symbol.for("react.suspense"), c = Symbol.for("react.suspense_list"), h = Symbol.for("react.memo"), w = Symbol.for("react.lazy"), b = Symbol.for("react.activity"), C = Symbol.for("react.client.reference"), E = P.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, x = Object.prototype.hasOwnProperty, N = Array.isArray, F = console.createTask ? console.createTask : function() {
      return null;
    };
    P = {
      react_stack_bottom_frame: function(t) {
        return t();
      }
    };
    var K, ee = {}, te = P.react_stack_bottom_frame.bind(
      P,
      l
    )(), re = F(s(l)), ie = {};
    $.Fragment = k, $.jsx = function(t, a, u) {
      var p = 1e4 > E.recentlyCreatedOwnerStacks++;
      return D(
        t,
        a,
        u,
        !1,
        p ? Error("react-stack-top-frame") : te,
        p ? F(s(t)) : re
      );
    }, $.jsxs = function(t, a, u) {
      var p = 1e4 > E.recentlyCreatedOwnerStacks++;
      return D(
        t,
        a,
        u,
        !0,
        p ? Error("react-stack-top-frame") : te,
        p ? F(s(t)) : re
      );
    };
  })()), $;
}
var le;
function Ce() {
  return le || (le = 1, process.env.NODE_ENV === "production" ? U.exports = Pe() : U.exports = Se()), U.exports;
}
var X = Ce();
const Q = me(
  void 0
);
Q.displayName = "ThreeInstanceContext";
const Y = {
  scene: null,
  camera: null,
  renderer: null,
  container: null,
  isReady: !1,
  isDisposed: !1
}, ze = {
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
  return ze[o].includes(e);
}
function Ae(o, e) {
  const r = Oe[e];
  return e === "disposed" ? {
    ...Y,
    isDisposed: !0
  } : !r || !o || !o.isInitialized ? Y : {
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
  const [r, s] = J("unmounted"), i = y(!1), l = y(null), d = se((m) => {
    s((D) => ke(D, m) ? m : D);
  }, []);
  v(() => (i.current = !0, d("mounted"), () => {
    i.current = !1, s((m) => m !== "disposed" ? "disposed" : m);
  }), [d]), v(() => {
    const m = l.current;
    if (l.current = e, m && !e) {
      d("disposed");
      return;
    }
    e && e.isInitialized && d("initialized");
  }, [e, d]);
  const g = se(() => {
    e && e.isInitialized && r === "mounted" && d("initialized");
  }, [e, r, d]);
  v(() => {
    if (!e || r !== "mounted")
      return;
    g();
    const m = setInterval(g, 50), D = setTimeout(() => {
      clearInterval(m);
    }, 5e3);
    return () => {
      clearInterval(m), clearTimeout(D);
    };
  }, [e, r, g]);
  const R = ge(() => Ae(e, r), [e, r]);
  return /* @__PURE__ */ X.jsx(Q.Provider, { value: R, children: o });
}
ce.displayName = "ThreeInstanceProvider";
const Ie = we(
  function({
    modelUrl: e,
    pivotPoint: r,
    zoomLimits: s,
    className: i,
    style: l,
    onLoad: d,
    onError: g,
    onLoadingChange: R,
    children: m
  }, D) {
    const O = y(null), T = y(null), P = y(null), S = y(null), [z, k] = J(!1), [G, j] = J(null), A = y(d), I = y(g), M = y(R);
    v(() => {
      A.current = d;
    }, [d]), v(() => {
      I.current = g;
    }, [g]), v(() => {
      M.current = R;
    }, [R]), be(
      D,
      () => ({
        getInstances() {
          if (z)
            return {
              ...Y,
              isDisposed: !0
            };
          const c = T.current;
          return !c || !c.isInitialized ? Y : {
            scene: c.scene.scene,
            camera: c.camera.camera,
            renderer: c.renderer.renderer,
            container: c.container,
            isReady: !0,
            isDisposed: !1
          };
        },
        getViewerCore() {
          return z ? null : T.current;
        },
        isReady() {
          if (z)
            return !1;
          const c = T.current;
          return c !== null && c.isInitialized;
        },
        isDisposed() {
          return z;
        }
      }),
      [z]
    ), v(() => {
      const c = O.current;
      if (!c)
        return;
      const h = new De();
      h.initialize({
        container: c,
        antialias: !0,
        alpha: !0
      });
      const w = new Te(), b = new ye();
      return h.plugins.register(w), h.plugins.register(b), T.current = h, P.current = w, S.current = b, j(h), k(!1), h.start(), () => {
        h.dispose(), T.current = null, P.current = null, S.current = null, j(null), k(!0);
      };
    }, []), v(() => {
      const c = O.current, h = T.current;
      if (!c || !h)
        return;
      const w = new ResizeObserver((b) => {
        for (const C of b) {
          const { width: E, height: x } = C.contentRect;
          E > 0 && x > 0 && h.resize(E, x);
        }
      });
      return w.observe(c), () => {
        w.disconnect();
      };
    }, []), v(() => {
      var w;
      const c = P.current, h = S.current;
      if (c) {
        if (!e) {
          c.unload();
          return;
        }
        (w = M.current) == null || w.call(M, !0), c.load(e).then((b) => {
          var C, E;
          if ((C = M.current) == null || C.call(M, !1), h && !r && h.setTarget(b.center), h && !s) {
            const x = b.boundingBox, N = new _.Vector3();
            x.getSize(N);
            const F = Math.max(N.x, N.y, N.z);
            h.setZoomLimits(F * 0.1, F * 10);
          }
          (E = A.current) == null || E.call(A, b);
        }).catch((b) => {
          var E, x;
          (E = M.current) == null || E.call(M, !1);
          const C = b instanceof Error ? b : new Error(String(b));
          (x = I.current) == null || x.call(I, C);
        });
      }
    }, [e]), v(() => {
      const c = S.current;
      if (c && r) {
        const h = new _.Vector3(r.x, r.y, r.z);
        c.setTarget(h);
      }
    }, [r]), v(() => {
      const c = S.current;
      if (c && s) {
        const h = s.min ?? 0.1, w = s.max ?? 1e3;
        c.setZoomLimits(h, w);
      }
    }, [s]);
    const q = {
      width: "100%",
      height: "100%",
      ...l
    };
    return /* @__PURE__ */ X.jsxs(ce, { viewerCore: G, children: [
      /* @__PURE__ */ X.jsx(
        "div",
        {
          ref: O,
          className: i,
          style: q
        }
      ),
      m
    ] });
  }
);
Ie.displayName = "ThreeViewer";
function Le() {
  const o = Me(Q);
  if (o === void 0)
    throw new Error(
      "useThreeInstance must be used within a ThreeViewer component. Make sure your component is a child of <ThreeViewer>."
    );
  return o;
}
export {
  ve as CameraManager,
  Te as ModelLoaderPlugin,
  ye as OrbitControlsPlugin,
  Re as PluginSystem,
  xe as RenderManager,
  Ee as SceneManager,
  Ie as ThreeViewer,
  De as ViewerCore,
  Le as useThreeInstance
};
//# sourceMappingURL=threejs-viewer.mjs.map
