import * as THREE from 'three';

/**
 * SceneManager Interface
 * 场景管理器，负责 Three.js Scene 的创建和管理。
 */
export interface ISceneManager {
  readonly scene: THREE.Scene;
  
  add(object: THREE.Object3D): void;
  remove(object: THREE.Object3D): void;
  clear(): void;
  dispose(): void;
}

/**
 * SceneManager Implementation
 * 
 * Manages the Three.js Scene lifecycle including:
 * - Scene creation and initialization
 * - Adding and removing 3D objects
 * - Clearing all objects from the scene
 * - Proper disposal of resources to prevent memory leaks
 * 
 * @implements {ISceneManager}
 * 
 * Requirements:
 * - 4.2: Initialize the Three.js Scene when component mounts
 * - 4.3: Properly dispose of all Three.js resources to prevent memory leaks
 */
export class SceneManager implements ISceneManager {
  private _scene: THREE.Scene;
  private _isDisposed: boolean = false;

  constructor() {
    this._scene = new THREE.Scene();
  }

  /**
   * Gets the underlying Three.js Scene instance.
   * @returns The THREE.Scene instance
   */
  get scene(): THREE.Scene {
    return this._scene;
  }

  /**
   * Adds a 3D object to the scene.
   * @param object - The THREE.Object3D to add to the scene
   * @throws Error if the SceneManager has been disposed
   */
  add(object: THREE.Object3D): void {
    if (this._isDisposed) {
      throw new Error('SceneManager has been disposed');
    }
    this._scene.add(object);
  }

  /**
   * Removes a 3D object from the scene.
   * @param object - The THREE.Object3D to remove from the scene
   * @throws Error if the SceneManager has been disposed
   */
  remove(object: THREE.Object3D): void {
    if (this._isDisposed) {
      throw new Error('SceneManager has been disposed');
    }
    this._scene.remove(object);
  }

  /**
   * Clears all objects from the scene.
   * This method removes all children from the scene and disposes of their resources.
   * @throws Error if the SceneManager has been disposed
   */
  clear(): void {
    if (this._isDisposed) {
      throw new Error('SceneManager has been disposed');
    }
    
    // Traverse and dispose all objects in the scene
    while (this._scene.children.length > 0) {
      const object = this._scene.children[0];
      if (object) {
        this._disposeObject(object);
        this._scene.remove(object);
      }
    }
  }

  /**
   * Disposes of the SceneManager and all its resources.
   * This method should be called when the viewer is unmounted to prevent memory leaks.
   * After disposal, the SceneManager cannot be used.
   */
  dispose(): void {
    if (this._isDisposed) {
      return;
    }

    // Clear all objects first
    this.clear();

    // Dispose of the scene's background and environment if they exist
    if (this._scene.background) {
      if (this._scene.background instanceof THREE.Texture) {
        this._scene.background.dispose();
      }
      this._scene.background = null;
    }

    if (this._scene.environment) {
      this._scene.environment.dispose();
      this._scene.environment = null;
    }

    this._isDisposed = true;
  }

  /**
   * Recursively disposes of an object and all its children.
   * Handles geometry, materials, and textures disposal.
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
  }

  /**
   * Disposes of a material or array of materials.
   * Also disposes of any textures associated with the material.
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
