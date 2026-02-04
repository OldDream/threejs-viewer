import * as THREE from 'three';
import { Plugin, PluginContext } from '../core/PluginSystem';

/**
 * 移动方向枚举
 * 定义相机可以移动的六个方向
 * 
 * Requirements:
 * - 5.1: 导出 ICameraMovementPlugin 接口供第三方使用
 */
export enum MovementDirection {
  FORWARD = 'forward',   // W 键 - 前进
  BACKWARD = 'backward', // S 键 - 后退
  LEFT = 'left',         // A 键 - 左移
  RIGHT = 'right',       // D 键 - 右移
  UP = 'up',             // Shift 键 - 上升
  DOWN = 'down'          // Ctrl 键 - 下降
}

/**
 * 键盘到移动方向的映射
 * 使用 KeyboardEvent.code 作为键名
 * 
 * Requirements:
 * - 5.1: 导出供第三方使用
 */
export const KEY_MAPPING: Record<string, MovementDirection> = {
  'KeyW': MovementDirection.FORWARD,
  'KeyS': MovementDirection.BACKWARD,
  'KeyA': MovementDirection.LEFT,
  'KeyD': MovementDirection.RIGHT,
  'ShiftLeft': MovementDirection.UP,
  'ShiftRight': MovementDirection.UP,
  'ControlLeft': MovementDirection.DOWN,
  'ControlRight': MovementDirection.DOWN
};

/**
 * 移动状态接口
 * 记录当前按下的移动键状态
 * 
 * Requirements:
 * - 5.1: 导出供第三方使用
 */
export interface MovementState {
  /** W 键状态 - 前进 */
  forward: boolean;
  /** S 键状态 - 后退 */
  backward: boolean;
  /** A 键状态 - 左移 */
  left: boolean;
  /** D 键状态 - 右移 */
  right: boolean;
  /** Shift 键状态 - 上升 */
  up: boolean;
  /** Ctrl 键状态 - 下降 */
  down: boolean;
}

/**
 * 相机移动插件配置选项
 * 
 * Requirements:
 * - 5.1: 导出 ICameraMovementPlugin 接口供第三方使用
 * - 5.3: 提供 setMoveSpeed(speed: number) 方法用于动态调整移动速度
 */
export interface CameraMovementConfig {
  /** 基础移动速度，默认 5.0 */
  moveSpeed?: number;
  /** 是否启用移动控制，默认 true */
  enabled?: boolean;
  /** OrbitControls 的 target 引用，用于 FPS 风格移动时同步移动观察目标 */
  orbitControlsTarget?: THREE.Vector3;
}

/**
 * 相机移动插件公共接口
 * 扩展基础 Plugin 接口，提供相机移动控制能力
 * 
 * Requirements:
 * - 5.1: 导出 ICameraMovementPlugin 接口供第三方使用
 * - 5.2: 提供 setEnabled(enabled: boolean) 方法用于启用或禁用移动功能
 * - 5.3: 提供 setMoveSpeed(speed: number) 方法用于动态调整移动速度
 * - 5.4: 提供 isMoving() 方法返回当前是否正在移动
 */
export interface ICameraMovementPlugin extends Plugin {
  /** 插件名称 */
  readonly name: string;
  
  /**
   * 配置插件
   * @param config 配置选项
   */
  configure(config: CameraMovementConfig): void;
  
  /**
   * 设置是否启用移动控制
   * @param enabled 是否启用
   * 
   * Requirements:
   * - 5.2: 提供 setEnabled(enabled: boolean) 方法用于启用或禁用移动功能
   */
  setEnabled(enabled: boolean): void;
  
  /**
   * 获取当前启用状态
   * @returns 是否启用
   */
  isEnabled(): boolean;
  
  /**
   * 设置移动速度
   * @param speed 移动速度
   * 
   * Requirements:
   * - 5.3: 提供 setMoveSpeed(speed: number) 方法用于动态调整移动速度
   */
  setMoveSpeed(speed: number): void;
  
  /**
   * 获取当前移动速度
   * @returns 移动速度
   */
  getMoveSpeed(): number;
  
  /**
   * 检查当前是否正在移动
   * @returns 是否正在移动
   * 
   * Requirements:
   * - 5.4: 提供 isMoving() 方法返回当前是否正在移动
   */
  isMoving(): boolean;

  /**
   * 设置 OrbitControls 的 target 引用
   * 用于 FPS 风格移动时同步移动观察目标
   * @param target OrbitControls 的 target Vector3
   */
  setOrbitControlsTarget(target: THREE.Vector3 | null): void;
}

/**
 * 创建默认的移动状态
 * @returns 所有方向键状态均为 false 的移动状态
 */
export function createDefaultMovementState(): MovementState {
  return {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false
  };
}

/**
 * 默认移动速度
 * 
 * Requirements:
 * - 3.2: WHEN moveSpeed 未配置 THEN Camera_Movement_Plugin SHALL 使用默认速度值 5.0
 */
export const DEFAULT_MOVE_SPEED = 5.0;

/**
 * 默认启用状态
 * 
 * Requirements:
 * - 2.4: THE Camera_Movement_Plugin SHALL 默认启用移动功能
 */
export const DEFAULT_ENABLED = true;

/**
 * CameraMovementPlugin Implementation
 * 
 * 提供键盘控制的相机移动能力，允许用户通过 WASD、Shift、Ctrl 键
 * 在三维空间内自由移动相机位置。
 * 
 * @implements {ICameraMovementPlugin}
 * 
 * Requirements:
 * - 4.1: THE Camera_Movement_Plugin SHALL 实现 Plugin 接口
 * - 2.1: THE Camera_Movement_Plugin SHALL 提供 enabled 属性用于控制移动功能的启用状态
 * - 2.4: THE Camera_Movement_Plugin SHALL 默认启用移动功能
 * - 3.1: THE Camera_Movement_Plugin SHALL 提供 moveSpeed 配置项用于设置基础移动速度
 * - 3.2: WHEN moveSpeed 未配置 THEN Camera_Movement_Plugin SHALL 使用默认速度值 5.0
 */
export class CameraMovementPlugin implements ICameraMovementPlugin {
  /**
   * 插件名称
   * 
   * Requirements:
   * - 4.1: THE Camera_Movement_Plugin SHALL 实现 Plugin 接口
   */
  readonly name = 'CameraMovementPlugin';

  /**
   * 插件上下文，包含 Three.js 核心对象
   */
  private _context: PluginContext | null = null;

  /**
   * 是否启用移动控制
   * 
   * Requirements:
   * - 2.1: THE Camera_Movement_Plugin SHALL 提供 enabled 属性用于控制移动功能的启用状态
   * - 2.4: THE Camera_Movement_Plugin SHALL 默认启用移动功能
   */
  private _enabled: boolean = DEFAULT_ENABLED;

  /**
   * 基础移动速度
   * 
   * Requirements:
   * - 3.1: THE Camera_Movement_Plugin SHALL 提供 moveSpeed 配置项用于设置基础移动速度
   * - 3.2: WHEN moveSpeed 未配置 THEN Camera_Movement_Plugin SHALL 使用默认速度值 5.0
   */
  private _moveSpeed: number = DEFAULT_MOVE_SPEED;

  /**
   * 移动状态，记录当前按下的移动键
   */
  private _movementState: MovementState = createDefaultMovementState();

  /**
   * 插件是否已被销毁
   */
  private _isDisposed: boolean = false;

  /**
   * 绑定的 keydown 事件处理器
   * 保存引用以便在 dispose 时移除
   */
  private _boundHandleKeyDown: ((event: KeyboardEvent) => void) | null = null;

  /**
   * 绑定的 keyup 事件处理器
   * 保存引用以便在 dispose 时移除
   */
  private _boundHandleKeyUp: ((event: KeyboardEvent) => void) | null = null;

  /**
   * OrbitControls 的 target 引用
   * 用于 FPS 风格移动时同步移动观察目标
   */
  private _orbitControlsTarget: THREE.Vector3 | null = null;

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
  initialize(context: PluginContext): void {
    if (this._isDisposed) {
      throw new Error('CameraMovementPlugin has been disposed');
    }

    this._context = context;
    
    // 重置移动状态
    this._movementState = createDefaultMovementState();

    // 创建绑定的事件处理器
    this._boundHandleKeyDown = this.handleKeyDown.bind(this);
    this._boundHandleKeyUp = this.handleKeyUp.bind(this);

    // 添加键盘事件监听器到 window
    // 使用 window 而不是 container 以确保在任何时候都能捕获键盘事件
    window.addEventListener('keydown', this._boundHandleKeyDown);
    window.addEventListener('keyup', this._boundHandleKeyUp);
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
  update(deltaTime: number): void {
    // 如果插件已销毁或未初始化，直接返回
    if (this._isDisposed || !this._context) {
      return;
    }

    // 如果插件被禁用，不处理移动
    if (!this._enabled) {
      return;
    }

    // 如果没有任何移动键被按下，直接返回
    // Requirements 1.8: 释放所有移动键时停止相机移动
    if (!this.isMoving()) {
      return;
    }

    // 获取相机引用
    const camera = this._context.camera;
    if (!camera) {
      return;
    }

    // 调用 calculateMovementVector 获取移动方向
    // Requirements 1.1-1.7: 根据按键状态计算移动向量
    const movementDirection = this.calculateMovementVector(camera);

    // 如果移动向量为零，直接返回
    if (movementDirection.lengthSq() === 0) {
      return;
    }

    // 基于 deltaTime 和 moveSpeed 计算移动距离
    // Requirements 3.3: 基于 deltaTime 计算实际移动距离以确保帧率无关的平滑移动
    // 移动距离 = 移动速度 * 时间增量
    const moveDistance = this._moveSpeed * deltaTime;

    // 计算实际移动向量（方向 * 距离）
    const movement = movementDirection.multiplyScalar(moveDistance);

    // 更新相机位置
    // Requirements 4.4: 在 update 方法中更新相机位置
    camera.position.add(movement);

    // FPS 风格移动：同步移动 OrbitControls 的 target
    // 这样相机移动时会保持当前的观察方向，而不是继续看向原来的 target
    if (this._orbitControlsTarget) {
      this._orbitControlsTarget.add(movement);
    }
  }

  /**
   * 销毁插件并释放所有资源
   * 在插件被注销或查看器被销毁时调用
   * 
   * Requirements:
   * - 4.3: WHEN Camera_Movement_Plugin 被注销 THEN Camera_Movement_Plugin SHALL 在 dispose 方法中移除所有事件监听器
   */
  dispose(): void {
    if (this._isDisposed) {
      return;
    }

    // 移除键盘事件监听器
    if (this._boundHandleKeyDown) {
      window.removeEventListener('keydown', this._boundHandleKeyDown);
      this._boundHandleKeyDown = null;
    }
    if (this._boundHandleKeyUp) {
      window.removeEventListener('keyup', this._boundHandleKeyUp);
      this._boundHandleKeyUp = null;
    }

    // 重置移动状态
    this._movementState = createDefaultMovementState();

    // 清理上下文引用
    this._context = null;
    this._isDisposed = true;
  }

  /**
   * 配置插件
   * 
   * @param config - 配置选项
   * @throws Error 如果插件已被销毁
   */
  configure(config: CameraMovementConfig): void {
    if (this._isDisposed) {
      throw new Error('CameraMovementPlugin has been disposed');
    }

    if (config.enabled !== undefined) {
      this._enabled = config.enabled;
    }

    if (config.moveSpeed !== undefined) {
      this.setMoveSpeed(config.moveSpeed);
    }

    if (config.orbitControlsTarget !== undefined) {
      this._orbitControlsTarget = config.orbitControlsTarget;
    }
  }

  /**
   * 设置 OrbitControls 的 target 引用
   * 用于 FPS 风格移动时同步移动观察目标
   * 
   * @param target - OrbitControls 的 target Vector3，传入 null 可清除引用
   */
  setOrbitControlsTarget(target: THREE.Vector3 | null): void {
    this._orbitControlsTarget = target;
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
  setEnabled(enabled: boolean): void {
    if (this._isDisposed) {
      throw new Error('CameraMovementPlugin has been disposed');
    }

    this._enabled = enabled;

    // 当禁用时，重置移动状态
    if (!enabled) {
      this._movementState = createDefaultMovementState();
    }
  }

  /**
   * 获取当前启用状态
   * 
   * @returns 是否启用
   */
  isEnabled(): boolean {
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
  setMoveSpeed(speed: number): void {
    if (this._isDisposed) {
      throw new Error('CameraMovementPlugin has been disposed');
    }

    // 使用绝对值确保速度为正数
    this._moveSpeed = Math.abs(speed);
  }

  /**
   * 获取当前移动速度
   * 
   * @returns 移动速度
   */
  getMoveSpeed(): number {
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
  isMoving(): boolean {
    return (
      this._movementState.forward ||
      this._movementState.backward ||
      this._movementState.left ||
      this._movementState.right ||
      this._movementState.up ||
      this._movementState.down
    );
  }

  /**
   * 获取当前移动状态（用于测试）
   * 
   * @returns 当前移动状态
   */
  getMovementState(): MovementState {
    return { ...this._movementState };
  }

  /**
   * 设置移动状态（用于测试）
   * 
   * @param state - 移动状态
   */
  setMovementState(state: Partial<MovementState>): void {
    this._movementState = {
      ...this._movementState,
      ...state
    };
  }

  /**
   * 获取插件上下文（用于测试）
   * 
   * @returns 插件上下文
   */
  getContext(): PluginContext | null {
    return this._context;
  }

  /**
   * 检查插件是否已被销毁（用于测试）
   * 
   * @returns 是否已被销毁
   */
  isDisposed(): boolean {
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
  calculateMovementVector(camera: THREE.Camera): THREE.Vector3 {
    const movement = new THREE.Vector3(0, 0, 0);

    // 如果没有任何移动键被按下，返回零向量
    if (!this.isMoving()) {
      return movement;
    }

    // 获取相机前向量（相机看向的方向）
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);

    // 将前向量投影到水平面（Y=0）
    forward.y = 0;
    
    // 如果前向量在水平面上的投影为零（相机正对上或下），
    // 使用相机的上向量来确定前方向
    if (forward.lengthSq() < 0.0001) {
      // 当相机垂直向上或向下看时，使用相机的上向量的水平投影作为前向量
      const cameraUp = new THREE.Vector3(0, 1, 0);
      cameraUp.applyQuaternion(camera.quaternion);
      forward.set(cameraUp.x, 0, cameraUp.z);
    }
    
    // 归一化前向量
    if (forward.lengthSq() > 0) {
      forward.normalize();
    }

    // 计算右向量（前向量与世界上向量的叉积）
    const worldUp = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3();
    right.crossVectors(forward, worldUp);
    
    // 归一化右向量
    if (right.lengthSq() > 0) {
      right.normalize();
    }

    // 根据移动状态组合移动向量
    // 水平移动（WASD）
    if (this._movementState.forward) {
      movement.add(forward);
    }
    if (this._movementState.backward) {
      movement.sub(forward);
    }
    if (this._movementState.right) {
      movement.add(right);
    }
    if (this._movementState.left) {
      movement.sub(right);
    }

    // 垂直移动（Shift/Ctrl）
    if (this._movementState.up) {
      movement.y += 1;
    }
    if (this._movementState.down) {
      movement.y -= 1;
    }

    // 归一化最终移动向量（如果有移动）
    if (movement.lengthSq() > 0) {
      movement.normalize();
    }

    return movement;
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
  private handleKeyDown(event: KeyboardEvent): void {
    // 如果插件被禁用或已销毁，不处理事件
    if (!this._enabled || this._isDisposed) {
      return;
    }

    // 查找按键对应的移动方向
    const direction = KEY_MAPPING[event.code];
    if (direction === undefined) {
      return;
    }

    // 更新对应方向的移动状态
    this.updateMovementStateByDirection(direction, true);
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
  private handleKeyUp(event: KeyboardEvent): void {
    // 如果插件已销毁，不处理事件
    if (this._isDisposed) {
      return;
    }

    // 查找按键对应的移动方向
    const direction = KEY_MAPPING[event.code];
    if (direction === undefined) {
      return;
    }

    // 更新对应方向的移动状态
    this.updateMovementStateByDirection(direction, false);
  }

  /**
   * 根据移动方向更新移动状态
   * 
   * @param direction - 移动方向
   * @param isPressed - 是否按下
   */
  private updateMovementStateByDirection(direction: MovementDirection, isPressed: boolean): void {
    switch (direction) {
      case MovementDirection.FORWARD:
        this._movementState.forward = isPressed;
        break;
      case MovementDirection.BACKWARD:
        this._movementState.backward = isPressed;
        break;
      case MovementDirection.LEFT:
        this._movementState.left = isPressed;
        break;
      case MovementDirection.RIGHT:
        this._movementState.right = isPressed;
        break;
      case MovementDirection.UP:
        this._movementState.up = isPressed;
        break;
      case MovementDirection.DOWN:
        this._movementState.down = isPressed;
        break;
    }
  }
}
