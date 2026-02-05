import * as THREE from 'three';
import { Plugin, PluginContext } from '../core/PluginSystem';
import { IOrbitControlsPlugin } from './OrbitControlsPlugin';

/**
 * Camera Path Animation Configuration
 */
export interface CameraPathAnimationConfig {
  /** Points defining the camera path */
  pathPoints?: THREE.Vector3[];
  /** Duration of the animation in seconds */
  duration?: number;
  /** Whether to loop the animation */
  loop?: boolean;
  /** Whether to start playing immediately after configuration */
  autoPlay?: boolean;
  
  /** 
   * View Control Mode: Target
   * The camera will constantly look at this point or object.
   */
  target?: THREE.Vector3 | THREE.Object3D;
  
  /**
   * View Control Mode: Fixed Direction
   * The camera will maintain this direction vector (in world space).
   * Ignored if 'target' is provided.
   */
  fixedDirection?: THREE.Vector3;
  
  /**
   * View Control Mode: Look Along Path
   * The camera will look forward along the path direction.
   * Ignored if 'target' or 'fixedDirection' is provided.
   */
  lookAlongPath?: boolean;
}

/**
 * Camera Path Animation Plugin
 * 
 * Enables the camera to move along a smooth path defined by a set of points.
 * Supports multiple viewing modes:
 * 1. Look at a specific target (point or object)
 * 2. Maintain a fixed viewing direction
 * 3. Look forward along the path
 */
export class CameraPathAnimationPlugin implements Plugin {
  readonly name = 'CameraPathAnimationPlugin';
  
  private _context: PluginContext | null = null;
  private _curve: THREE.CatmullRomCurve3 | null = null;
  private _progress: number = 0;
  private _isPlaying: boolean = false;
  private _isDisposed: boolean = false;
  
  // Configuration
  private _duration: number = 10;
  private _loop: boolean = false;
  private _target: THREE.Vector3 | THREE.Object3D | null = null;
  private _fixedDirection: THREE.Vector3 | null = null;
  private _lookAlongPath: boolean = false;
  
  // Internal state
  private _orbitControlsPlugin: IOrbitControlsPlugin | null = null;
  private _wasOrbitControlsEnabled: boolean = true;
  private _tempPos = new THREE.Vector3();
  private _tempLookAt = new THREE.Vector3();

  initialize(context: PluginContext): void {
    if (this._isDisposed) {
      throw new Error('CameraPathAnimationPlugin has been disposed');
    }
    this._context = context;
  }

  /**
   * Configure the animation settings
   */
  configure(config: CameraPathAnimationConfig): void {
    if (this._isDisposed) return;

    if (config.pathPoints && config.pathPoints.length >= 2) {
      this._curve = new THREE.CatmullRomCurve3(config.pathPoints);
    }
    
    if (config.duration !== undefined && config.duration > 0) {
      this._duration = config.duration;
    }
    
    if (config.loop !== undefined) {
      this._loop = config.loop;
    }
    
    // Reset view modes
    if (config.target !== undefined) {
      this._target = config.target;
      this._fixedDirection = null;
      this._lookAlongPath = false;
    } else if (config.fixedDirection !== undefined) {
      this._fixedDirection = config.fixedDirection.clone().normalize();
      this._target = null;
      this._lookAlongPath = false;
    } else if (config.lookAlongPath !== undefined) {
      this._lookAlongPath = config.lookAlongPath;
      if (this._lookAlongPath) {
        this._target = null;
        this._fixedDirection = null;
      }
    }
    
    if (config.autoPlay) {
      this.play();
    }
  }

  /**
   * Start or resume the animation
   */
  play(): void {
    if (this._isDisposed || !this._curve || !this._context) return;
    
    if (!this._isPlaying) {
      this._isPlaying = true;
      
      // Disable OrbitControls to prevent conflict
      if (this._orbitControlsPlugin) {
        this._wasOrbitControlsEnabled = this._orbitControlsPlugin.controls.enabled;
        this._orbitControlsPlugin.controls.enabled = false;
      }
    }
  }

  /**
   * Pause the animation
   */
  pause(): void {
    if (this._isPlaying) {
      this._isPlaying = false;
      
      // Restore OrbitControls
      if (this._orbitControlsPlugin) {
        this._orbitControlsPlugin.controls.enabled = this._wasOrbitControlsEnabled;
      }
    }
  }

  /**
   * Stop and reset the animation
   */
  stop(): void {
    this.pause();
    this._progress = 0;
  }

  /**
   * Update loop called by PluginSystem
   */
  update(deltaTime: number): void {
    if (!this._isPlaying || !this._curve || !this._context) return;

    // Update progress
    this._progress += deltaTime / this._duration;
    
    // Handle completion
    if (this._progress >= 1) {
      if (this._loop) {
        this._progress %= 1;
      } else {
        this._progress = 1;
        this.pause();
        // Optional: Trigger completion event?
      }
    }

    const camera = this._context.camera;
    
    // Update Camera Position
    this._curve.getPoint(this._progress, this._tempPos);
    camera.position.copy(this._tempPos);
    
    // Update Camera Rotation (View Mode)
    if (this._target) {
      // Mode 1: Look at Target
      if (this._target instanceof THREE.Object3D) {
        // Track dynamic object
        this._target.getWorldPosition(this._tempLookAt);
        camera.lookAt(this._tempLookAt);
      } else {
        // Look at fixed point
        camera.lookAt(this._target);
      }
    } else if (this._fixedDirection) {
      // Mode 2: Fixed Direction
      // Look point = current position + direction
      this._tempLookAt.copy(camera.position).add(this._fixedDirection);
      camera.lookAt(this._tempLookAt);
    } else if (this._lookAlongPath) {
      // Mode 3: Look Along Path
      // Get a point slightly ahead on the curve
      const lookAheadProgress = Math.min(this._progress + 0.01, 1);
      this._curve.getPoint(lookAheadProgress, this._tempLookAt);
      camera.lookAt(this._tempLookAt);
    }
    // Default: Do not change rotation if no mode selected
  }

  dispose(): void {
    if (this._isDisposed) return;
    this.stop();
    this._curve = null;
    this._context = null;
    this._target = null;
    this._orbitControlsPlugin = null;
    this._isDisposed = true;
  }
  
  /**
   * Manually link OrbitControlsPlugin if you want auto-disable functionality
   */
  setOrbitControlsPlugin(plugin: IOrbitControlsPlugin): void {
    this._orbitControlsPlugin = plugin;
  }
}
