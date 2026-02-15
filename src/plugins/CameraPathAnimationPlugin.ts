import * as THREE from 'three';
import { Plugin, PluginContext } from '../core/PluginSystem';
import { IOrbitControlsPlugin } from './OrbitControlsPlugin';
import {
  CameraPathDefaults,
  CameraPathSegmentConfig,
  EasingSpec,
  InterpolationType,
  SegmentOverride,
} from './CameraPathTypes';
export type {
  CameraPathDefaults,
  CameraPathSegmentConfig,
  EasingSpec,
  InterpolationType,
  SegmentOverride,
} from './CameraPathTypes';

const MIN_SEGMENT_DURATION = 0.05;
const DEFAULT_SEGMENT_DURATION = 2.0;
const DEFAULT_DEFAULTS: CameraPathDefaults = {
  interpolation: 'curve',
  easing: { type: 'smoothstep', strength: 0.6 },
};

/**
 * Camera Path Animation Configuration
 */
export interface CameraPathAnimationConfig {
  /** Points defining the camera path */
  pathPoints?: THREE.Vector3[];
  /** Segment configuration (point[i] -> point[i+1]) */
  segments?: CameraPathSegmentConfig[];
  /** Global defaults for segment inherit mode */
  defaults?: Partial<CameraPathDefaults>;
  /** Duration of the animation in seconds */
  duration?: number;
  /** Whether to loop the animation */
  loop?: boolean;
  /** Whether to start playing immediately after configuration */
  autoPlay?: boolean;
  /** Ease-in/out strength (0..1). 0 = linear, 1 = smoothstep */
  easeInOut?: number;
  
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
  private _pathPoints: THREE.Vector3[] = [];
  private _curve: THREE.CatmullRomCurve3 | null = null;
  private _progress: number = 0;
  private _elapsedSeconds: number = 0;
  private _totalDuration: number = 0;
  private _isPlaying: boolean = false;
  private _isDisposed: boolean = false;
  
  // Configuration
  private _segments: CameraPathSegmentConfig[] | null = null;
  private _defaults: CameraPathDefaults = { ...DEFAULT_DEFAULTS };
  private _duration: number = 10;
  private _loop: boolean = false;
  private _easeInOut: number = 0;
  private _target: THREE.Vector3 | THREE.Object3D | null = null;
  private _fixedDirection: THREE.Vector3 | null = null;
  private _lookAlongPath: boolean = false;
  
  // Internal state
  private _orbitControlsPlugin: IOrbitControlsPlugin | null = null;
  private _wasOrbitControlsEnabled: boolean = true;
  private _tempPos = new THREE.Vector3();
  private _tempLookAt = new THREE.Vector3();
  private _tempLookAhead = new THREE.Vector3();

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
      this._pathPoints = config.pathPoints.map((point) => point.clone());
      this._curve = new THREE.CatmullRomCurve3(this._pathPoints);
      this._progress = 0;
      this._elapsedSeconds = 0;
    }

    if (config.defaults) {
      this._defaults = this._mergeDefaults(config.defaults);
    }

    if (config.segments !== undefined) {
      this._segments = this._normalizeSegments(config.segments, this._pathPoints.length);
      this._totalDuration = this._sumSegmentsDuration(this._segments);
    } else if (config.pathPoints && config.pathPoints.length >= 2) {
      // Only updating points: keep the current timing mode.
      // - If previously configured with segments, re-normalize to match new point count.
      // - Otherwise, stay in legacy duration mode.
      if (this._segments) {
        this._segments = this._normalizeSegments(this._segments, this._pathPoints.length);
        this._totalDuration = this._sumSegmentsDuration(this._segments);
      } else {
        this._totalDuration = this._duration;
      }
    }
    
    if (config.duration !== undefined && config.duration > 0) {
      this._duration = config.duration;
      if (!this._segments) {
        this._totalDuration = this._duration;
      }
    }
    
    if (config.loop !== undefined) {
      this._loop = config.loop;
    }

    if (config.easeInOut !== undefined && Number.isFinite(config.easeInOut)) {
      this._easeInOut = Math.max(0, Math.min(1, config.easeInOut));
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
    if (this._isDisposed || !this._context || !this._hasValidPath()) return;
    
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
    this._elapsedSeconds = 0;
  }

  /**
   * Update loop called by PluginSystem
   */
  update(deltaTime: number): void {
    if (!this._isPlaying || !this._context || !this._hasValidPath()) return;

    if (this._segments && this._segments.length > 0) {
      this._updateWithSegments(deltaTime);
    } else {
      this._updateWithLegacyDuration(deltaTime);
    }
  }

  private _updateWithLegacyDuration(deltaTime: number): void {
    if (!this._curve || !this._context) return;

    // Update progress
    this._progress += deltaTime / this._duration;
    
    // Handle completion
    if (this._progress >= 1) {
      if (this._loop) {
        this._progress %= 1;
      } else {
        this._progress = 1;
        this.pause();
      }
    }

    const camera = this._context.camera;

    const eased = this._applyEaseInOut(this._progress);

    // Update Camera Position
    this._curve.getPointAt(eased, this._tempPos);
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
      const lookAheadProgress = Math.min(eased + 0.01, 1);
      this._curve.getPointAt(lookAheadProgress, this._tempLookAt);
      camera.lookAt(this._tempLookAt);
    }
    // Default: Do not change rotation if no mode selected
  }

  private _updateWithSegments(deltaTime: number): void {
    if (!this._context || !this._segments || this._segments.length === 0 || this._pathPoints.length < 2) {
      return;
    }

    this._elapsedSeconds += Math.max(0, deltaTime);

    const totalDuration = this._totalDuration;
    if (totalDuration <= 0) {
      return;
    }

    if (this._elapsedSeconds >= totalDuration) {
      if (this._loop) {
        this._elapsedSeconds %= totalDuration;
      } else {
        this._elapsedSeconds = totalDuration;
        this.pause();
      }
    }

    const segmentState = this._resolveSegmentState(this._elapsedSeconds);
    if (!segmentState) return;

    const easing = this._resolveSegmentEasing(segmentState.segmentIndex);
    const easedLocalT = this._applyEasingSpec(easing, segmentState.localT);

    const camera = this._context.camera;
    this._evaluateSegmentPosition(segmentState.segmentIndex, easedLocalT, this._tempPos);
    camera.position.copy(this._tempPos);

    if (this._target) {
      if (this._target instanceof THREE.Object3D) {
        this._target.getWorldPosition(this._tempLookAt);
        camera.lookAt(this._tempLookAt);
      } else {
        camera.lookAt(this._target);
      }
      return;
    }

    if (this._fixedDirection) {
      this._tempLookAt.copy(camera.position).add(this._fixedDirection);
      camera.lookAt(this._tempLookAt);
      return;
    }

    if (this._lookAlongPath) {
      const lookAheadDelta = Math.max(0.016, totalDuration * 0.005);
      this._evaluatePositionAtElapsed(this._elapsedSeconds + lookAheadDelta, this._tempLookAhead);
      camera.lookAt(this._tempLookAhead);
    }
  }

  dispose(): void {
    if (this._isDisposed) return;
    this.stop();
    this._pathPoints = [];
    this._segments = null;
    this._curve = null;
    this._context = null;
    this._target = null;
    this._easeInOut = 0;
    this._orbitControlsPlugin = null;
    this._isDisposed = true;
  }
  
  /**
   * Manually link OrbitControlsPlugin if you want auto-disable functionality
   */
  setOrbitControlsPlugin(plugin: IOrbitControlsPlugin): void {
    this._orbitControlsPlugin = plugin;
  }

  private _applyEaseInOut(t: number): number {
    if (this._easeInOut <= 0) return t;
    const s = t * t * (3 - 2 * t);
    return t + (s - t) * this._easeInOut;
  }

  private _hasValidPath(): boolean {
    if (this._pathPoints.length < 2) return false;
    if (this._segments) {
      return this._segments.length > 0;
    }
    return this._curve !== null;
  }

  private _mergeDefaults(partial: Partial<CameraPathDefaults>): CameraPathDefaults {
    const base = this._defaults ?? DEFAULT_DEFAULTS;
    const interpolation = partial.interpolation ?? base.interpolation;
    const easing = partial.easing ? this._normalizeEasingSpec(partial.easing) : base.easing;
    return {
      interpolation,
      easing,
    };
  }

  private _normalizeSegments(
    segments: CameraPathSegmentConfig[],
    pointCount: number
  ): CameraPathSegmentConfig[] {
    const segmentCount = Math.max(0, pointCount - 1);
    const normalized: CameraPathSegmentConfig[] = [];

    for (let index = 0; index < segmentCount; index++) {
      const source = segments[index];
      const duration = source?.duration;
      const normalizedDuration = typeof duration === 'number' && Number.isFinite(duration) && duration > 0
        ? Math.max(MIN_SEGMENT_DURATION, duration)
        : DEFAULT_SEGMENT_DURATION;

      const interpolation = source?.interpolation
        ? this._normalizeSegmentOverride<InterpolationType>(source.interpolation, (value): value is InterpolationType => {
            return value === 'linear' || value === 'curve';
          })
        : { mode: 'inherit' as const };

      const easing = source?.easing
        ? this._normalizeSegmentOverride<EasingSpec>(source.easing, (value): value is EasingSpec => {
            return this._isEasingSpec(value);
          })
        : { mode: 'inherit' as const };

      normalized.push({
        duration: normalizedDuration,
        interpolation,
        easing,
      });
    }

    return normalized;
  }

  private _normalizeSegmentOverride<T>(
    override: SegmentOverride<T>,
    validator: (value: unknown) => value is T
  ): SegmentOverride<T> {
    if (override.mode === 'override' && validator(override.value)) {
      return {
        mode: 'override',
        value: override.value,
      };
    }
    return { mode: 'inherit' };
  }

  private _isEasingSpec(value: unknown): value is EasingSpec {
    if (typeof value !== 'object' || value === null) return false;
    const easing = value as EasingSpec;
    if (easing.type === 'linear') return true;
    if (easing.type === 'smoothstep') {
      return Number.isFinite(easing.strength);
    }
    return false;
  }

  private _normalizeEasingSpec(easing: EasingSpec): EasingSpec {
    if (easing.type === 'linear') {
      return { type: 'linear' };
    }

    return {
      type: 'smoothstep',
      strength: Math.max(0, Math.min(1, easing.strength)),
    };
  }

  private _sumSegmentsDuration(segments: CameraPathSegmentConfig[]): number {
    let total = 0;
    for (const segment of segments) {
      total += Math.max(MIN_SEGMENT_DURATION, segment.duration);
    }
    return total;
  }

  private _resolveSegmentState(elapsed: number): { segmentIndex: number; localT: number } | null {
    if (!this._segments || this._segments.length === 0) {
      return null;
    }

    const clampedElapsed = Math.max(0, Math.min(elapsed, this._totalDuration));
    let accumulated = 0;

    for (let segmentIndex = 0; segmentIndex < this._segments.length; segmentIndex++) {
      const segment = this._segments[segmentIndex];
      if (!segment) continue;
      const duration = Math.max(MIN_SEGMENT_DURATION, segment.duration);
      const nextAccumulated = accumulated + duration;
      const isLastSegment = segmentIndex === this._segments.length - 1;
      const insideSegment = clampedElapsed < nextAccumulated || isLastSegment;

      if (insideSegment) {
        const local = (clampedElapsed - accumulated) / duration;
        return {
          segmentIndex,
          localT: Math.max(0, Math.min(1, local)),
        };
      }

      accumulated = nextAccumulated;
    }

    return null;
  }

  private _resolveSegmentInterpolation(segmentIndex: number): InterpolationType {
    const segment = this._segments?.[segmentIndex];
    if (segment?.interpolation?.mode === 'override') {
      return segment.interpolation.value;
    }
    return this._defaults.interpolation;
  }

  private _resolveSegmentEasing(segmentIndex: number): EasingSpec {
    const segment = this._segments?.[segmentIndex];
    if (segment?.easing?.mode === 'override') {
      return this._normalizeEasingSpec(segment.easing.value);
    }
    return this._normalizeEasingSpec(this._defaults.easing);
  }

  private _applyEasingSpec(easing: EasingSpec, t: number): number {
    const clamped = Math.max(0, Math.min(1, t));
    if (easing.type === 'linear') {
      return clamped;
    }

    const smooth = clamped * clamped * (3 - 2 * clamped);
    const strength = Math.max(0, Math.min(1, easing.strength));
    return clamped + (smooth - clamped) * strength;
  }

  private _evaluateSegmentPosition(segmentIndex: number, localT: number, out: THREE.Vector3): void {
    const interpolation = this._resolveSegmentInterpolation(segmentIndex);

    if (interpolation === 'linear') {
      const start = this._pathPoints[segmentIndex];
      const end = this._pathPoints[segmentIndex + 1];
      if (!start || !end) {
        out.set(0, 0, 0);
        return;
      }
      out.copy(start).lerp(end, localT);
      return;
    }

    if (!this._curve || this._pathPoints.length < 2) {
      out.set(0, 0, 0);
      return;
    }

    const segmentCount = this._pathPoints.length - 1;
    const curveT = (segmentIndex + localT) / segmentCount;
    this._curve.getPoint(Math.max(0, Math.min(1, curveT)), out);
  }

  private _evaluatePositionAtElapsed(elapsed: number, out: THREE.Vector3): void {
    if (!this._segments || this._segments.length === 0) {
      if (!this._curve) {
        out.set(0, 0, 0);
        return;
      }
      const progress = Math.max(0, Math.min(1, this._progress));
      const eased = this._applyEaseInOut(progress);
      this._curve.getPointAt(eased, out);
      return;
    }

    if (this._totalDuration <= 0) {
      out.set(0, 0, 0);
      return;
    }

    let normalizedElapsed = elapsed;
    if (this._loop) {
      normalizedElapsed = ((elapsed % this._totalDuration) + this._totalDuration) % this._totalDuration;
    } else {
      normalizedElapsed = Math.max(0, Math.min(this._totalDuration, elapsed));
    }

    const state = this._resolveSegmentState(normalizedElapsed);
    if (!state) {
      out.set(0, 0, 0);
      return;
    }
    const easing = this._resolveSegmentEasing(state.segmentIndex);
    const easedLocalT = this._applyEasingSpec(easing, state.localT);
    this._evaluateSegmentPosition(state.segmentIndex, easedLocalT, out);
  }
}
