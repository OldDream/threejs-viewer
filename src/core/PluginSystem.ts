import * as THREE from 'three';

/**
 * PluginContext Interface
 * 插件上下文，提供插件访问核心 Three.js 对象的能力。
 * 
 * Requirements:
 * - 5.2: Provide plugin with access to Scene, Camera, and Renderer
 */
export interface PluginContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  container: HTMLElement;
}

/**
 * Plugin Interface
 * 插件接口，定义插件的生命周期方法。
 * 
 * Requirements:
 * - 5.1: Allow registering and unregistering feature modules
 * - 5.3: Call plugin's cleanup method when unregistered
 * - 5.5: Notify all registered plugins during render loop
 */
export interface Plugin {
  readonly name: string;
  
  /**
   * Initialize the plugin with the provided context.
   * Called when the plugin is registered.
   * @param context - The plugin context containing core Three.js objects
   */
  initialize(context: PluginContext): void;
  
  /**
   * Update the plugin state. Called on each render loop iteration.
   * This method is optional - plugins that don't need per-frame updates can omit it.
   * @param deltaTime - Time elapsed since the last frame in seconds
   */
  update?(deltaTime: number): void;
  
  /**
   * Dispose of the plugin and release all resources.
   * Called when the plugin is unregistered or when the viewer is disposed.
   */
  dispose(): void;
}

/**
 * PluginSystem Interface
 * 插件系统接口，管理插件的注册、注销和生命周期。
 */
export interface IPluginSystem {
  register(plugin: Plugin): void;
  unregister(pluginName: string): void;
  get<T extends Plugin>(pluginName: string): T | undefined;
  has(pluginName: string): boolean;
  updateAll(deltaTime: number): void;
  disposeAll(): void;
}

/**
 * PluginSystem Implementation
 * 
 * Manages the plugin lifecycle including:
 * - Plugin registration with context initialization
 * - Plugin unregistration with proper disposal
 * - Plugin retrieval by name
 * - Batch update notification for all plugins
 * - Batch disposal of all plugins
 * 
 * @implements {IPluginSystem}
 * 
 * Requirements:
 * - 5.1: Implement a Plugin_System that allows registering and unregistering feature modules
 * - 5.2: Provide the plugin with access to Scene, Camera, and Renderer when registered
 * - 5.3: Call the plugin's cleanup method when unregistered
 * - 5.5: Notify all registered plugins when the render loop executes
 */
export class PluginSystem implements IPluginSystem {
  private _plugins: Map<string, Plugin> = new Map();
  private _context: PluginContext | null = null;
  private _isDisposed: boolean = false;

  /**
   * Sets the plugin context that will be provided to all registered plugins.
   * This must be called before registering any plugins.
   * @param context - The plugin context containing core Three.js objects
   */
  setContext(context: PluginContext): void {
    if (this._isDisposed) {
      throw new Error('PluginSystem has been disposed');
    }
    this._context = context;
  }

  /**
   * Gets the current plugin context.
   * @returns The current plugin context or null if not set
   */
  getContext(): PluginContext | null {
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
  register(plugin: Plugin): void {
    if (this._isDisposed) {
      throw new Error('PluginSystem has been disposed');
    }

    if (!this._context) {
      throw new Error('Plugin context has not been set. Call setContext() before registering plugins.');
    }

    if (this._plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }

    // Initialize the plugin with the context
    plugin.initialize(this._context);
    
    // Store the plugin
    this._plugins.set(plugin.name, plugin);
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
  unregister(pluginName: string): void {
    if (this._isDisposed) {
      throw new Error('PluginSystem has been disposed');
    }

    const plugin = this._plugins.get(pluginName);
    if (plugin) {
      // Call the plugin's dispose method
      plugin.dispose();
      // Remove from the registry
      this._plugins.delete(pluginName);
    }
  }

  /**
   * Gets a registered plugin by name.
   * 
   * @param pluginName - The name of the plugin to retrieve
   * @returns The plugin instance or undefined if not found
   */
  get<T extends Plugin>(pluginName: string): T | undefined {
    return this._plugins.get(pluginName) as T | undefined;
  }

  /**
   * Checks if a plugin is registered.
   * 
   * @param pluginName - The name of the plugin to check
   * @returns True if the plugin is registered, false otherwise
   */
  has(pluginName: string): boolean {
    return this._plugins.has(pluginName);
  }

  /**
   * Gets the names of all registered plugins.
   * 
   * @returns An array of registered plugin names
   */
  getPluginNames(): string[] {
    return Array.from(this._plugins.keys());
  }

  /**
   * Gets the count of registered plugins.
   * 
   * @returns The number of registered plugins
   */
  get pluginCount(): number {
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
  updateAll(deltaTime: number): void {
    if (this._isDisposed) {
      throw new Error('PluginSystem has been disposed');
    }

    for (const plugin of this._plugins.values()) {
      // Only call update if the plugin has an update method
      if (plugin.update) {
        try {
          plugin.update(deltaTime);
        } catch (error) {
          // Log error but continue updating other plugins
          // This prevents one failing plugin from breaking the entire render loop
          console.error(`Error updating plugin "${plugin.name}":`, error);
        }
      }
    }
  }

  /**
   * Disposes of all registered plugins.
   * Calls the dispose method on each plugin and clears the registry.
   * 
   * Requirements:
   * - 5.3: Call the plugin's cleanup method
   */
  disposeAll(): void {
    if (this._isDisposed) {
      return;
    }

    // Dispose all plugins
    for (const plugin of this._plugins.values()) {
      try {
        plugin.dispose();
      } catch (error) {
        // Log error but continue disposing other plugins
        console.error(`Error disposing plugin "${plugin.name}":`, error);
      }
    }

    // Clear the registry
    this._plugins.clear();
    this._context = null;
    this._isDisposed = true;
  }
}
