import * as THREE from 'three';
import { Plugin, PluginContext } from '../core/PluginSystem';

export interface ModelAnimationConfig {
  autoPlay?: boolean;
  loop?: boolean;
  clipIndex?: number;
  timeScale?: number;
}

export class ModelAnimationPlugin implements Plugin {
  readonly name = 'ModelAnimationPlugin';

  private _context: PluginContext | null = null;
  private _isDisposed = false;

  private _mixer: THREE.AnimationMixer | null = null;
  private _root: THREE.Object3D | null = null;
  private _clips: THREE.AnimationClip[] = [];
  private _action: THREE.AnimationAction | null = null;

  private _autoPlay = false;
  private _loop = true;
  private _clipIndex = 0;
  private _timeScale = 1;
  private _isPlaying = false;

  initialize(context: PluginContext): void {
    if (this._isDisposed) {
      throw new Error('ModelAnimationPlugin has been disposed');
    }
    this._context = context;
  }

  configure(config: ModelAnimationConfig): void {
    if (this._isDisposed) return;

    if (config.autoPlay !== undefined) {
      this._autoPlay = config.autoPlay;
    }

    if (config.loop !== undefined) {
      this._loop = config.loop;
      this._applyLoopMode();
    }

    if (config.timeScale !== undefined && Number.isFinite(config.timeScale)) {
      this._timeScale = config.timeScale;
    }

    if (config.clipIndex !== undefined) {
      this.setClipIndex(config.clipIndex);
    }

    if (config.autoPlay) {
      this.play();
    }
  }

  setSource(root: THREE.Object3D | null, clips: THREE.AnimationClip[]): void {
    if (this._isDisposed) return;

    this._clearMixer();
    this._root = root;
    this._clips = clips.slice();

    if (!this._root || this._clips.length === 0) {
      return;
    }

    this._mixer = new THREE.AnimationMixer(this._root);
    this._createAction();

    if (this._autoPlay) {
      this.play();
    } else {
      this.stop({ resetTime: true });
    }
  }

  hasAnimations(): boolean {
    return this._clips.length > 0;
  }

  getClipNames(): string[] {
    return this._clips.map((c) => c.name);
  }

  setClipIndex(index: number): void {
    if (this._isDisposed) return;
    if (!Number.isFinite(index)) return;

    const nextIndex = this._clampClipIndex(index);
    if (nextIndex === this._clipIndex && this._action) return;

    this._clipIndex = nextIndex;
    if (!this._mixer) return;

    const wasPlaying = this._isPlaying;
    this.stop({ resetTime: true });
    this._createAction();
    if (wasPlaying) {
      this.play();
    }
  }

  play(): void {
    if (this._isDisposed || !this._context || !this._mixer || !this._action) return;
    this._isPlaying = true;
    this._action.enabled = true;
    this._action.paused = false;
    this._action.play();
  }

  pause(): void {
    if (this._isDisposed || !this._mixer || !this._action) return;
    this._isPlaying = false;
    this._action.paused = true;
  }

  stop(options?: { resetTime?: boolean }): void {
    if (this._isDisposed || !this._mixer || !this._action) return;
    this._isPlaying = false;

    if (options?.resetTime) {
      this._action.reset();
      this._action.enabled = true;
      this._action.paused = false;
      this._action.play();
      this._action.time = 0;
      this._mixer.setTime(0);
      this._action.stop();
      return;
    }

    this._mixer.stopAllAction();
  }

  update(deltaTime: number): void {
    if (this._isDisposed || !this._isPlaying || !this._mixer) return;
    const dt = deltaTime * this._timeScale;
    if (!Number.isFinite(dt) || dt <= 0) return;
    this._mixer.update(dt);
  }

  dispose(): void {
    if (this._isDisposed) return;
    this._clearMixer();
    this._clips = [];
    this._root = null;
    this._context = null;
    this._isDisposed = true;
  }

  private _createAction(): void {
    if (!this._mixer || this._clips.length === 0) {
      this._action = null;
      return;
    }

    const idx = this._clampClipIndex(this._clipIndex);
    this._clipIndex = idx;
    this._mixer.stopAllAction();
    this._action = this._mixer.clipAction(this._clips[idx]!);
    this._applyLoopMode();
  }

  private _applyLoopMode(): void {
    if (!this._action) return;

    if (this._loop) {
      this._action.setLoop(THREE.LoopRepeat, Infinity);
      this._action.clampWhenFinished = false;
    } else {
      this._action.setLoop(THREE.LoopOnce, 1);
      this._action.clampWhenFinished = true;
    }
  }

  private _clampClipIndex(index: number): number {
    if (this._clips.length === 0) return 0;
    const i = Math.trunc(index);
    if (i < 0) return 0;
    if (i >= this._clips.length) return this._clips.length - 1;
    return i;
  }

  private _clearMixer(): void {
    if (this._mixer) {
      this._mixer.stopAllAction();
      if (this._root) {
        this._mixer.uncacheRoot(this._root);
      }
    }
    this._mixer = null;
    this._action = null;
  }
}

