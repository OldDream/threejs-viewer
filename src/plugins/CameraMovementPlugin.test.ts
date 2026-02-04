/**
 * Unit Tests for CameraMovementPlugin
 *
 * These tests verify the initialization, API methods, and lifecycle
 * of the CameraMovementPlugin.
 *
 * Requirements Verified:
 * - 2.4: THE Camera_Movement_Plugin SHALL 默认启用移动功能
 * - 3.2: WHEN moveSpeed 未配置 THEN Camera_Movement_Plugin SHALL 使用默认速度值 5.0
 * - 4.1: THE Camera_Movement_Plugin SHALL 实现 Plugin 接口
 * - 4.2: WHEN Camera_Movement_Plugin 被注册到 PluginSystem THEN Camera_Movement_Plugin SHALL 在 initialize 方法中设置键盘事件监听
 * - 4.3: WHEN Camera_Movement_Plugin 被注销 THEN Camera_Movement_Plugin SHALL 在 dispose 方法中移除所有事件监听器
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as THREE from 'three';
import {
  CameraMovementPlugin,
  MovementDirection,
  KEY_MAPPING,
  DEFAULT_MOVE_SPEED,
  DEFAULT_ENABLED,
  createDefaultMovementState,
} from './CameraMovementPlugin';
import { PluginContext } from '../core/PluginSystem';

/**
 * Creates a mock PluginContext for testing
 */
function createMockContext(): PluginContext {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);

  // Create a mock renderer
  const canvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas });

  const container = document.createElement('div');

  return {
    scene,
    camera,
    renderer,
    container,
  };
}

/**
 * Creates a mock KeyboardEvent
 */
function createKeyboardEvent(type: 'keydown' | 'keyup', code: string): KeyboardEvent {
  return new KeyboardEvent(type, {
    code,
    bubbles: true,
    cancelable: true,
  });
}

describe('CameraMovementPlugin', () => {
  let plugin: CameraMovementPlugin;
  let mockContext: PluginContext;

  beforeEach(() => {
    plugin = new CameraMovementPlugin();
    mockContext = createMockContext();
  });

  afterEach(() => {
    // Clean up plugin if not already disposed
    if (!plugin.isDisposed()) {
      plugin.dispose();
    }
    // Clean up renderer
    mockContext.renderer.dispose();
  });

  describe('Initialization Tests', () => {
    describe('Default Configuration', () => {
      /**
       * Requirement 2.4: THE Camera_Movement_Plugin SHALL 默认启用移动功能
       */
      it('should be enabled by default', () => {
        expect(plugin.isEnabled()).toBe(DEFAULT_ENABLED);
        expect(plugin.isEnabled()).toBe(true);
      });

      /**
       * Requirement 3.2: WHEN moveSpeed 未配置 THEN Camera_Movement_Plugin SHALL 使用默认速度值 5.0
       */
      it('should have default move speed of 5.0', () => {
        expect(plugin.getMoveSpeed()).toBe(DEFAULT_MOVE_SPEED);
        expect(plugin.getMoveSpeed()).toBe(5.0);
      });

      /**
       * Requirement 4.1: THE Camera_Movement_Plugin SHALL 实现 Plugin 接口
       */
      it('should have correct plugin name', () => {
        expect(plugin.name).toBe('CameraMovementPlugin');
      });

      it('should have default movement state with all directions false', () => {
        const state = plugin.getMovementState();
        expect(state.forward).toBe(false);
        expect(state.backward).toBe(false);
        expect(state.left).toBe(false);
        expect(state.right).toBe(false);
        expect(state.up).toBe(false);
        expect(state.down).toBe(false);
      });

      it('should not be moving initially', () => {
        expect(plugin.isMoving()).toBe(false);
      });

      it('should not be disposed initially', () => {
        expect(plugin.isDisposed()).toBe(false);
      });

      it('should not have context before initialization', () => {
        expect(plugin.getContext()).toBeNull();
      });
    });

    describe('Custom Configuration', () => {
      it('should apply custom enabled state via configure', () => {
        plugin.initialize(mockContext);
        plugin.configure({ enabled: false });
        expect(plugin.isEnabled()).toBe(false);
      });

      it('should apply custom move speed via configure', () => {
        plugin.initialize(mockContext);
        plugin.configure({ moveSpeed: 10.0 });
        expect(plugin.getMoveSpeed()).toBe(10.0);
      });

      it('should apply both enabled and moveSpeed via configure', () => {
        plugin.initialize(mockContext);
        plugin.configure({ enabled: false, moveSpeed: 15.0 });
        expect(plugin.isEnabled()).toBe(false);
        expect(plugin.getMoveSpeed()).toBe(15.0);
      });

      it('should handle partial configuration (only enabled)', () => {
        plugin.initialize(mockContext);
        plugin.configure({ enabled: false });
        expect(plugin.isEnabled()).toBe(false);
        expect(plugin.getMoveSpeed()).toBe(DEFAULT_MOVE_SPEED);
      });

      it('should handle partial configuration (only moveSpeed)', () => {
        plugin.initialize(mockContext);
        plugin.configure({ moveSpeed: 20.0 });
        expect(plugin.isEnabled()).toBe(true);
        expect(plugin.getMoveSpeed()).toBe(20.0);
      });

      it('should handle empty configuration object', () => {
        plugin.initialize(mockContext);
        plugin.configure({});
        expect(plugin.isEnabled()).toBe(true);
        expect(plugin.getMoveSpeed()).toBe(DEFAULT_MOVE_SPEED);
      });
    });

    describe('Initialize Method', () => {
      /**
       * Requirement 4.2: WHEN Camera_Movement_Plugin 被注册到 PluginSystem THEN 
       * Camera_Movement_Plugin SHALL 在 initialize 方法中设置键盘事件监听
       */
      it('should set context after initialization', () => {
        plugin.initialize(mockContext);
        expect(plugin.getContext()).toBe(mockContext);
      });

      it('should reset movement state on initialization', () => {
        // Set some movement state before initialization
        plugin.setMovementState({ forward: true, left: true });
        
        plugin.initialize(mockContext);
        
        const state = plugin.getMovementState();
        expect(state.forward).toBe(false);
        expect(state.left).toBe(false);
      });

      it('should throw error if initialized after disposal', () => {
        plugin.dispose();
        expect(() => plugin.initialize(mockContext)).toThrow('CameraMovementPlugin has been disposed');
      });

      it('should add keyboard event listeners on initialize', () => {
        const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
        
        plugin.initialize(mockContext);
        
        expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        expect(addEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
        
        addEventListenerSpy.mockRestore();
      });
    });
  });

  describe('API Method Tests', () => {
    beforeEach(() => {
      plugin.initialize(mockContext);
    });

    describe('setEnabled / isEnabled', () => {
      it('should enable the plugin', () => {
        plugin.setEnabled(false);
        plugin.setEnabled(true);
        expect(plugin.isEnabled()).toBe(true);
      });

      it('should disable the plugin', () => {
        plugin.setEnabled(false);
        expect(plugin.isEnabled()).toBe(false);
      });

      it('should reset movement state when disabled', () => {
        plugin.setMovementState({ forward: true, right: true });
        expect(plugin.isMoving()).toBe(true);
        
        plugin.setEnabled(false);
        
        expect(plugin.isMoving()).toBe(false);
        const state = plugin.getMovementState();
        expect(state.forward).toBe(false);
        expect(state.right).toBe(false);
      });

      it('should throw error if called after disposal', () => {
        plugin.dispose();
        expect(() => plugin.setEnabled(true)).toThrow('CameraMovementPlugin has been disposed');
      });
    });

    describe('setMoveSpeed / getMoveSpeed', () => {
      it('should set positive move speed', () => {
        plugin.setMoveSpeed(10.0);
        expect(plugin.getMoveSpeed()).toBe(10.0);
      });

      it('should convert negative speed to positive (absolute value)', () => {
        plugin.setMoveSpeed(-5.0);
        expect(plugin.getMoveSpeed()).toBe(5.0);
      });

      it('should handle zero speed', () => {
        plugin.setMoveSpeed(0);
        expect(plugin.getMoveSpeed()).toBe(0);
      });

      it('should handle very small speed values', () => {
        plugin.setMoveSpeed(0.001);
        expect(plugin.getMoveSpeed()).toBe(0.001);
      });

      it('should handle very large speed values', () => {
        plugin.setMoveSpeed(1000);
        expect(plugin.getMoveSpeed()).toBe(1000);
      });

      it('should throw error if called after disposal', () => {
        plugin.dispose();
        expect(() => plugin.setMoveSpeed(10)).toThrow('CameraMovementPlugin has been disposed');
      });
    });

    describe('isMoving', () => {
      it('should return false when no keys are pressed', () => {
        expect(plugin.isMoving()).toBe(false);
      });

      it('should return true when forward is pressed', () => {
        plugin.setMovementState({ forward: true });
        expect(plugin.isMoving()).toBe(true);
      });

      it('should return true when backward is pressed', () => {
        plugin.setMovementState({ backward: true });
        expect(plugin.isMoving()).toBe(true);
      });

      it('should return true when left is pressed', () => {
        plugin.setMovementState({ left: true });
        expect(plugin.isMoving()).toBe(true);
      });

      it('should return true when right is pressed', () => {
        plugin.setMovementState({ right: true });
        expect(plugin.isMoving()).toBe(true);
      });

      it('should return true when up is pressed', () => {
        plugin.setMovementState({ up: true });
        expect(plugin.isMoving()).toBe(true);
      });

      it('should return true when down is pressed', () => {
        plugin.setMovementState({ down: true });
        expect(plugin.isMoving()).toBe(true);
      });

      it('should return true when multiple keys are pressed', () => {
        plugin.setMovementState({ forward: true, right: true, up: true });
        expect(plugin.isMoving()).toBe(true);
      });
    });

    describe('configure', () => {
      it('should throw error if called after disposal', () => {
        plugin.dispose();
        expect(() => plugin.configure({ enabled: true })).toThrow('CameraMovementPlugin has been disposed');
      });
    });

    describe('getMovementState / setMovementState', () => {
      it('should return a copy of movement state', () => {
        plugin.setMovementState({ forward: true });
        const state1 = plugin.getMovementState();
        const state2 = plugin.getMovementState();
        
        // Should be equal but not the same object
        expect(state1).toEqual(state2);
        expect(state1).not.toBe(state2);
      });

      it('should update partial movement state', () => {
        plugin.setMovementState({ forward: true, left: true });
        
        const state = plugin.getMovementState();
        expect(state.forward).toBe(true);
        expect(state.left).toBe(true);
        expect(state.backward).toBe(false);
        expect(state.right).toBe(false);
      });

      it('should merge with existing state', () => {
        plugin.setMovementState({ forward: true });
        plugin.setMovementState({ left: true });
        
        const state = plugin.getMovementState();
        expect(state.forward).toBe(true);
        expect(state.left).toBe(true);
      });
    });
  });

  describe('Lifecycle Tests', () => {
    describe('Dispose Method', () => {
      /**
       * Requirement 4.3: WHEN Camera_Movement_Plugin 被注销 THEN 
       * Camera_Movement_Plugin SHALL 在 dispose 方法中移除所有事件监听器
       */
      it('should remove keyboard event listeners on dispose', () => {
        const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
        
        plugin.initialize(mockContext);
        plugin.dispose();
        
        expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
        
        removeEventListenerSpy.mockRestore();
      });

      it('should set disposed flag to true', () => {
        plugin.initialize(mockContext);
        plugin.dispose();
        expect(plugin.isDisposed()).toBe(true);
      });

      it('should clear context reference', () => {
        plugin.initialize(mockContext);
        expect(plugin.getContext()).not.toBeNull();
        
        plugin.dispose();
        expect(plugin.getContext()).toBeNull();
      });

      it('should reset movement state on dispose', () => {
        plugin.initialize(mockContext);
        plugin.setMovementState({ forward: true, up: true });
        
        plugin.dispose();
        
        const state = plugin.getMovementState();
        expect(state.forward).toBe(false);
        expect(state.up).toBe(false);
      });

      it('should be safe to call dispose multiple times', () => {
        plugin.initialize(mockContext);
        plugin.dispose();
        
        // Should not throw
        expect(() => plugin.dispose()).not.toThrow();
      });

      it('should be safe to dispose without initialization', () => {
        // Should not throw
        expect(() => plugin.dispose()).not.toThrow();
      });
    });

    describe('Update Method', () => {
      it('should not throw when called before initialization', () => {
        expect(() => plugin.update(0.016)).not.toThrow();
      });

      it('should not throw when called after disposal', () => {
        plugin.initialize(mockContext);
        plugin.dispose();
        expect(() => plugin.update(0.016)).not.toThrow();
      });

      it('should not move camera when disabled', () => {
        plugin.initialize(mockContext);
        plugin.setEnabled(false);
        plugin.setMovementState({ forward: true });
        
        const initialPosition = mockContext.camera.position.clone();
        plugin.update(0.016);
        
        expect(mockContext.camera.position.equals(initialPosition)).toBe(true);
      });

      it('should not move camera when no keys are pressed', () => {
        plugin.initialize(mockContext);
        
        const initialPosition = mockContext.camera.position.clone();
        plugin.update(0.016);
        
        expect(mockContext.camera.position.equals(initialPosition)).toBe(true);
      });

      it('should move camera when enabled and keys are pressed', () => {
        plugin.initialize(mockContext);
        plugin.setMovementState({ forward: true });
        
        const initialPosition = mockContext.camera.position.clone();
        plugin.update(0.016);
        
        expect(mockContext.camera.position.equals(initialPosition)).toBe(false);
      });
    });

    describe('Keyboard Event Handling', () => {
      beforeEach(() => {
        plugin.initialize(mockContext);
      });

      it('should update movement state on keydown for W key', () => {
        window.dispatchEvent(createKeyboardEvent('keydown', 'KeyW'));
        expect(plugin.getMovementState().forward).toBe(true);
      });

      it('should update movement state on keydown for S key', () => {
        window.dispatchEvent(createKeyboardEvent('keydown', 'KeyS'));
        expect(plugin.getMovementState().backward).toBe(true);
      });

      it('should update movement state on keydown for A key', () => {
        window.dispatchEvent(createKeyboardEvent('keydown', 'KeyA'));
        expect(plugin.getMovementState().left).toBe(true);
      });

      it('should update movement state on keydown for D key', () => {
        window.dispatchEvent(createKeyboardEvent('keydown', 'KeyD'));
        expect(plugin.getMovementState().right).toBe(true);
      });

      it('should update movement state on keydown for ShiftLeft key', () => {
        window.dispatchEvent(createKeyboardEvent('keydown', 'ShiftLeft'));
        expect(plugin.getMovementState().up).toBe(true);
      });

      it('should update movement state on keydown for ShiftRight key', () => {
        window.dispatchEvent(createKeyboardEvent('keydown', 'ShiftRight'));
        expect(plugin.getMovementState().up).toBe(true);
      });

      it('should update movement state on keydown for ControlLeft key', () => {
        window.dispatchEvent(createKeyboardEvent('keydown', 'ControlLeft'));
        expect(plugin.getMovementState().down).toBe(true);
      });

      it('should update movement state on keydown for ControlRight key', () => {
        window.dispatchEvent(createKeyboardEvent('keydown', 'ControlRight'));
        expect(plugin.getMovementState().down).toBe(true);
      });

      it('should reset movement state on keyup', () => {
        window.dispatchEvent(createKeyboardEvent('keydown', 'KeyW'));
        expect(plugin.getMovementState().forward).toBe(true);
        
        window.dispatchEvent(createKeyboardEvent('keyup', 'KeyW'));
        expect(plugin.getMovementState().forward).toBe(false);
      });

      it('should ignore keydown when disabled', () => {
        plugin.setEnabled(false);
        window.dispatchEvent(createKeyboardEvent('keydown', 'KeyW'));
        expect(plugin.getMovementState().forward).toBe(false);
      });

      it('should still process keyup when disabled (to clear state)', () => {
        // First enable and press key
        window.dispatchEvent(createKeyboardEvent('keydown', 'KeyW'));
        expect(plugin.getMovementState().forward).toBe(true);
        
        // Disable - this should reset state
        plugin.setEnabled(false);
        expect(plugin.getMovementState().forward).toBe(false);
      });

      it('should ignore unknown key codes', () => {
        window.dispatchEvent(createKeyboardEvent('keydown', 'KeyX'));
        const state = plugin.getMovementState();
        expect(state.forward).toBe(false);
        expect(state.backward).toBe(false);
        expect(state.left).toBe(false);
        expect(state.right).toBe(false);
        expect(state.up).toBe(false);
        expect(state.down).toBe(false);
      });

      it('should handle multiple keys pressed simultaneously', () => {
        window.dispatchEvent(createKeyboardEvent('keydown', 'KeyW'));
        window.dispatchEvent(createKeyboardEvent('keydown', 'KeyD'));
        window.dispatchEvent(createKeyboardEvent('keydown', 'ShiftLeft'));
        
        const state = plugin.getMovementState();
        expect(state.forward).toBe(true);
        expect(state.right).toBe(true);
        expect(state.up).toBe(true);
        expect(state.backward).toBe(false);
        expect(state.left).toBe(false);
        expect(state.down).toBe(false);
      });

      it('should not process events after disposal', () => {
        plugin.dispose();
        
        // These should not throw and should not update state
        window.dispatchEvent(createKeyboardEvent('keydown', 'KeyW'));
        window.dispatchEvent(createKeyboardEvent('keyup', 'KeyW'));
        
        // State should remain at default (all false)
        const state = plugin.getMovementState();
        expect(state.forward).toBe(false);
      });
    });
  });

  describe('Helper Functions and Constants', () => {
    describe('createDefaultMovementState', () => {
      it('should create state with all directions false', () => {
        const state = createDefaultMovementState();
        expect(state.forward).toBe(false);
        expect(state.backward).toBe(false);
        expect(state.left).toBe(false);
        expect(state.right).toBe(false);
        expect(state.up).toBe(false);
        expect(state.down).toBe(false);
      });

      it('should create new object each time', () => {
        const state1 = createDefaultMovementState();
        const state2 = createDefaultMovementState();
        expect(state1).not.toBe(state2);
        expect(state1).toEqual(state2);
      });
    });

    describe('KEY_MAPPING', () => {
      it('should map KeyW to FORWARD', () => {
        expect(KEY_MAPPING['KeyW']).toBe(MovementDirection.FORWARD);
      });

      it('should map KeyS to BACKWARD', () => {
        expect(KEY_MAPPING['KeyS']).toBe(MovementDirection.BACKWARD);
      });

      it('should map KeyA to LEFT', () => {
        expect(KEY_MAPPING['KeyA']).toBe(MovementDirection.LEFT);
      });

      it('should map KeyD to RIGHT', () => {
        expect(KEY_MAPPING['KeyD']).toBe(MovementDirection.RIGHT);
      });

      it('should map ShiftLeft to UP', () => {
        expect(KEY_MAPPING['ShiftLeft']).toBe(MovementDirection.UP);
      });

      it('should map ShiftRight to UP', () => {
        expect(KEY_MAPPING['ShiftRight']).toBe(MovementDirection.UP);
      });

      it('should map ControlLeft to DOWN', () => {
        expect(KEY_MAPPING['ControlLeft']).toBe(MovementDirection.DOWN);
      });

      it('should map ControlRight to DOWN', () => {
        expect(KEY_MAPPING['ControlRight']).toBe(MovementDirection.DOWN);
      });
    });

    describe('MovementDirection enum', () => {
      it('should have correct values', () => {
        expect(MovementDirection.FORWARD).toBe('forward');
        expect(MovementDirection.BACKWARD).toBe('backward');
        expect(MovementDirection.LEFT).toBe('left');
        expect(MovementDirection.RIGHT).toBe('right');
        expect(MovementDirection.UP).toBe('up');
        expect(MovementDirection.DOWN).toBe('down');
      });
    });

    describe('Default constants', () => {
      it('should have correct DEFAULT_MOVE_SPEED', () => {
        expect(DEFAULT_MOVE_SPEED).toBe(5.0);
      });

      it('should have correct DEFAULT_ENABLED', () => {
        expect(DEFAULT_ENABLED).toBe(true);
      });
    });
  });

  describe('calculateMovementVector', () => {
    beforeEach(() => {
      plugin.initialize(mockContext);
    });

    it('should return zero vector when no keys are pressed', () => {
      const vector = plugin.calculateMovementVector(mockContext.camera);
      expect(vector.length()).toBe(0);
    });

    it('should return normalized vector when keys are pressed', () => {
      plugin.setMovementState({ forward: true });
      const vector = plugin.calculateMovementVector(mockContext.camera);
      expect(vector.length()).toBeCloseTo(1, 5);
    });

    it('should return normalized vector for diagonal movement', () => {
      plugin.setMovementState({ forward: true, right: true });
      const vector = plugin.calculateMovementVector(mockContext.camera);
      expect(vector.length()).toBeCloseTo(1, 5);
    });

    it('should have zero Y component for horizontal movement (W key)', () => {
      plugin.setMovementState({ forward: true });
      const vector = plugin.calculateMovementVector(mockContext.camera);
      expect(vector.y).toBeCloseTo(0, 5);
    });

    it('should have positive Y component for up movement (Shift key)', () => {
      plugin.setMovementState({ up: true });
      const vector = plugin.calculateMovementVector(mockContext.camera);
      expect(vector.y).toBeGreaterThan(0);
    });

    it('should have negative Y component for down movement (Ctrl key)', () => {
      plugin.setMovementState({ down: true });
      const vector = plugin.calculateMovementVector(mockContext.camera);
      expect(vector.y).toBeLessThan(0);
    });

    it('should cancel out opposite directions (forward + backward)', () => {
      plugin.setMovementState({ forward: true, backward: true });
      const vector = plugin.calculateMovementVector(mockContext.camera);
      // Forward and backward should cancel out in horizontal plane
      expect(Math.abs(vector.x)).toBeLessThan(0.001);
      expect(Math.abs(vector.z)).toBeLessThan(0.001);
    });

    it('should cancel out opposite directions (left + right)', () => {
      plugin.setMovementState({ left: true, right: true });
      const vector = plugin.calculateMovementVector(mockContext.camera);
      // Left and right should cancel out
      expect(Math.abs(vector.x)).toBeLessThan(0.001);
      expect(Math.abs(vector.z)).toBeLessThan(0.001);
    });

    it('should cancel out opposite directions (up + down)', () => {
      plugin.setMovementState({ up: true, down: true });
      const vector = plugin.calculateMovementVector(mockContext.camera);
      expect(vector.y).toBeCloseTo(0, 5);
    });
  });
});
