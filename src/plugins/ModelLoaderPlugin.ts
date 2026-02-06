import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three-stdlib';
import { Plugin, PluginContext } from '../core/PluginSystem';

/**
 * Model load result containing the loaded model and its computed properties.
 * 
 * Requirements:
 * - 1.1: Load the model and add it to the Scene
 * - 1.2: Calculate the model's bounding box center
 */
export interface ModelLoadResult {
  model: THREE.Group;
  boundingBox: THREE.Box3;
  center: THREE.Vector3;
}

/**
 * Loading state for tracking model loading progress.
 * 
 * Requirements:
 * - 1.4: Provide a loading state that can be queried
 */
export interface LoadingState {
  isLoading: boolean;
  progress: number;
  error: Error | null;
}

export class ModelLoadCancelledError extends Error {
  constructor(message: string = 'Model loading cancelled') {
    super(message);
    this.name = 'ModelLoadCancelledError';
  }
}

/**
 * ModelLoaderPlugin Interface
 * Extends the base Plugin interface with model loading capabilities.
 */
export interface IModelLoaderPlugin extends Plugin {
  readonly loadingState: LoadingState;
  
  load(url: string): Promise<ModelLoadResult>;
  cancel(): void;
  unload(): void;
  getCenter(): THREE.Vector3 | null;
  getBoundingBox(): THREE.Box3 | null;
}

/**
 * ModelLoaderPlugin Implementation
 * 
 * Handles GLTF/GLB model loading with the following features:
 * - Asynchronous model loading with progress tracking
 * - Automatic bounding box and center point calculation
 * - Proper disposal of previous models when loading new ones
 * - Error handling with descriptive error messages
 * 
 * @implements {IModelLoaderPlugin}
 * 
 * Requirements:
 * - 1.1: WHEN a valid GLTF/GLB file URL is provided, THE GLTFLoader SHALL load the model and add it to the Scene
 * - 1.2: WHEN the model is loaded successfully, THE Viewer SHALL automatically calculate and set the Pivot_Point to the model's bounding box center
 * - 1.3: WHEN the model loading fails, THE Viewer SHALL emit an error event with descriptive error information
 * - 1.4: WHILE the model is loading, THE Viewer SHALL provide a loading state that can be queried
 * - 1.5: WHEN a new model URL is provided while a model exists, THE Viewer SHALL dispose of the previous model before loading the new one
 */
export class ModelLoaderPlugin implements IModelLoaderPlugin {
  readonly name = 'ModelLoaderPlugin';
  
  private _context: PluginContext | null = null;
  private _loader: GLTFLoader;
  private _currentModel: THREE.Group | null = null;
  private _boundingBox: THREE.Box3 | null = null;
  private _center: THREE.Vector3 | null = null;
  private _loadingState: LoadingState = {
    isLoading: false,
    progress: 0,
    error: null,
  };
  private _isDisposed: boolean = false;
  private _loadRequestId: number = 0;

  constructor() {
    this._loader = new GLTFLoader();
  }

  /**
   * Gets the current loading state.
   * 
   * Requirements:
   * - 1.4: Provide a loading state that can be queried
   */
  get loadingState(): LoadingState {
    return { ...this._loadingState };
  }

  /**
   * Initialize the plugin with the provided context.
   * @param context - The plugin context containing core Three.js objects
   */
  initialize(context: PluginContext): void {
    if (this._isDisposed) {
      throw new Error('ModelLoaderPlugin has been disposed');
    }
    this._context = context;
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
  async load(url: string): Promise<ModelLoadResult> {
    if (this._isDisposed) {
      throw new Error('ModelLoaderPlugin has been disposed');
    }

    if (!this._context) {
      throw new Error('ModelLoaderPlugin has not been initialized. Call initialize() first.');
    }

    // Requirement 1.5: Dispose of the previous model before loading the new one
    if (this._currentModel) {
      this.unload();
    }

    // Generate a new request ID
    const requestId = ++this._loadRequestId;

    // Requirement 1.4: Update loading state
    this._loadingState = {
      isLoading: true,
      progress: 0,
      error: null,
    };

    try {
      // Load the model
      const gltf = await this._loadGLTF(url);
      
      // Check if this request is still the latest one
      if (requestId !== this._loadRequestId) {
        // If not, dispose of the loaded model and throw a cancellation error
        this._disposeObject(gltf.scene);
        throw new ModelLoadCancelledError('Model loading cancelled due to new request');
      }

      // Requirement 1.1: Add the model to the scene
      const model = gltf.scene;
      this._context.scene.add(model);
      this._currentModel = model;

      // Requirement 1.2: Calculate bounding box and center
      const boundingBox = new THREE.Box3().setFromObject(model);
      const center = new THREE.Vector3();
      boundingBox.getCenter(center);

      this._boundingBox = boundingBox;
      this._center = center;

      // Update loading state to complete
      this._loadingState = {
        isLoading: false,
        progress: 100,
        error: null,
      };

      return {
        model,
        boundingBox,
        center,
      };
    } catch (error) {
      // Check if this request is still the latest one
      if (requestId !== this._loadRequestId) {
        // If not, just rethrow (or ignore, but rethrowing keeps the promise chain consistent)
        throw error;
      }

      // Requirement 1.3: Emit an error event with descriptive error information
      const loadError = error instanceof Error 
        ? error 
        : new Error(`Failed to load model from URL: ${url}`);

      this._loadingState = {
        isLoading: false,
        progress: 0,
        error: loadError,
      };

      throw loadError;
    }
  }

  cancel(): void {
    if (this._isDisposed) {
      return;
    }

    this._loadRequestId += 1;
    this._loadingState = {
      isLoading: false,
      progress: 0,
      error: null,
    };
  }

  /**
   * Unloads the current model and disposes of its resources.
   * 
   * Requirements:
   * - 1.5: Dispose of the previous model
   */
  unload(): void {
    if (this._currentModel && this._context) {
      // Remove from scene
      this._context.scene.remove(this._currentModel);
      
      // Dispose of all resources
      this._disposeObject(this._currentModel);
      
      // Clear references
      this._currentModel = null;
      this._boundingBox = null;
      this._center = null;
    }
  }

  /**
   * Gets the center point of the currently loaded model.
   * 
   * @returns The center point as a Vector3, or null if no model is loaded
   * 
   * Requirements:
   * - 1.2: Calculate the model's bounding box center
   */
  getCenter(): THREE.Vector3 | null {
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
  getBoundingBox(): THREE.Box3 | null {
    return this._boundingBox ? this._boundingBox.clone() : null;
  }

  /**
   * Disposes of the plugin and all its resources.
   * This method should be called when the plugin is unregistered.
   */
  dispose(): void {
    if (this._isDisposed) {
      return;
    }

    // Unload any current model
    this.unload();

    // Clear references
    this._context = null;
    this._isDisposed = true;
  }

  /**
   * Loads a GLTF model using the GLTFLoader with progress tracking.
   * 
   * @param url - The URL of the GLTF/GLB model to load
   * @returns A promise that resolves with the loaded GLTF object
   */
  private _loadGLTF(url: string): Promise<GLTF> {
    return new Promise((resolve, reject) => {
      this._loader.load(
        url,
        // onLoad callback
        (gltf: GLTF) => {
          resolve(gltf);
        },
        // onProgress callback
        (progressEvent: ProgressEvent) => {
          if (progressEvent.lengthComputable) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            this._loadingState = {
              ...this._loadingState,
              progress: Math.round(progress),
            };
          }
        },
        // onError callback
        (error: unknown) => {
          const errorMessage = error instanceof Error 
            ? error.message 
            : `Failed to load model from URL: ${url}`;
          reject(new Error(errorMessage));
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
  private _disposeObject(object: THREE.Object3D): void {
    // Recursively dispose children first
    while (object.children.length > 0) {
      const child = object.children[0];
      if (child) {
        this._disposeObject(child);
        object.remove(child);
      }
    }

    // Dispose geometry if it exists
    if (object instanceof THREE.Mesh) {
      if (object.geometry) {
        object.geometry.dispose();
      }

      // Dispose materials
      if (object.material) {
        this._disposeMaterial(object.material);
      }
    }

    // Handle Line and Points objects
    if (object instanceof THREE.Line || object instanceof THREE.Points) {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        this._disposeMaterial(object.material);
      }
    }

    // Handle SkinnedMesh
    if (object instanceof THREE.SkinnedMesh) {
      if (object.skeleton) {
        object.skeleton.dispose();
      }
    }
  }

  /**
   * Disposes of a material or array of materials.
   * Also disposes of any textures associated with the material.
   * 
   * @param material - The material or array of materials to dispose
   */
  private _disposeMaterial(material: THREE.Material | THREE.Material[]): void {
    if (Array.isArray(material)) {
      material.forEach((mat) => this._disposeSingleMaterial(mat));
    } else {
      this._disposeSingleMaterial(material);
    }
  }

  /**
   * Disposes of a single material and its textures.
   * 
   * @param material - The material to dispose
   */
  private _disposeSingleMaterial(material: THREE.Material): void {
    // Dispose textures from the material
    const textureProperties = [
      'map',
      'lightMap',
      'bumpMap',
      'normalMap',
      'specularMap',
      'envMap',
      'alphaMap',
      'aoMap',
      'displacementMap',
      'emissiveMap',
      'gradientMap',
      'metalnessMap',
      'roughnessMap',
      'clearcoatMap',
      'clearcoatNormalMap',
      'clearcoatRoughnessMap',
      'transmissionMap',
      'thicknessMap',
      'sheenColorMap',
      'sheenRoughnessMap',
    ];

    textureProperties.forEach((prop) => {
      const texture = (material as unknown as Record<string, unknown>)[prop];
      if (texture instanceof THREE.Texture) {
        texture.dispose();
      }
    });

    material.dispose();
  }
}
