# 实现计划：Camera Movement Control

## 概述

本计划将相机移动控制功能分解为可执行的编码任务。实现遵循现有插件架构，创建 CameraMovementPlugin 并集成到 Demo 应用中。

## 任务

- [x] 1. 创建 CameraMovementPlugin 核心实现
  - [x] 1.1 创建 `src/plugins/CameraMovementPlugin.ts` 文件，定义接口和类型
    - 定义 `CameraMovementConfig` 接口
    - 定义 `ICameraMovementPlugin` 接口
    - 定义 `MovementState` 类型
    - 定义键盘映射常量
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [x] 1.2 实现 CameraMovementPlugin 类的基础结构
    - 实现 Plugin 接口的 name、initialize、update、dispose 方法
    - 实现私有状态管理（enabled、moveSpeed、movementState）
    - _Requirements: 4.1, 2.1, 2.4, 3.1, 3.2_
  
  - [x] 1.3 实现键盘事件处理
    - 在 initialize 中添加 keydown/keyup 事件监听器
    - 实现 handleKeyDown 和 handleKeyUp 方法更新 movementState
    - 在 dispose 中移除事件监听器
    - _Requirements: 4.2, 4.3_
  
  - [x] 1.4 实现移动向量计算逻辑
    - 实现 calculateMovementVector 方法
    - 基于相机朝向计算水平面内的前向量和右向量
    - 根据 movementState 组合最终移动向量
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  
  - [x] 1.5 实现 update 方法中的相机位置更新
    - 调用 calculateMovementVector 获取移动方向
    - 基于 deltaTime 和 moveSpeed 计算移动距离
    - 更新相机位置
    - _Requirements: 4.4, 3.3, 1.8_
  
  - [x] 1.6 实现公共 API 方法
    - 实现 configure、setEnabled、isEnabled 方法
    - 实现 setMoveSpeed、getMoveSpeed 方法
    - 实现 isMoving 方法
    - _Requirements: 5.2, 5.3, 5.4, 2.2, 2.3_

- [x] 2. 添加导出和类型定义
  - [x] 2.1 在 `src/index.ts` 中导出 CameraMovementPlugin
    - 导出 CameraMovementPlugin 类
    - 导出 ICameraMovementPlugin 接口
    - 导出 CameraMovementConfig 类型
    - _Requirements: 5.5_

- [x] 3. Checkpoint - 确保插件核心功能完成
  - 确保所有测试通过，如有问题请询问用户。

- [x] 4. 编写单元测试和属性测试
  - [x] 4.1 创建 `src/plugins/CameraMovementPlugin.test.ts` 测试文件
    - 编写初始化测试（默认配置、自定义配置）
    - 编写 API 方法测试
    - 编写生命周期测试
    - _Requirements: 2.4, 3.2, 4.1, 4.2, 4.3_
  
  - [ ]* 4.2 编写属性测试 - Property 1: 方向键产生正确的移动方向
    - **Property 1: 方向键产生正确的移动方向**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**
  
  - [ ]* 4.3 编写属性测试 - Property 2: 多键向量叠加
    - **Property 2: 多键向量叠加**
    - **Validates: Requirements 1.7**
  
  - [ ]* 4.4 编写属性测试 - Property 3: 无按键时停止移动
    - **Property 3: 无按键时停止移动**
    - **Validates: Requirements 1.8**
  
  - [ ]* 4.5 编写属性测试 - Property 4: enabled状态控制输入响应
    - **Property 4: enabled状态控制输入响应**
    - **Validates: Requirements 2.2, 2.3**
  
  - [ ]* 4.6 编写属性测试 - Property 5: 移动距离与deltaTime成正比
    - **Property 5: 移动距离与deltaTime成正比**
    - **Validates: Requirements 3.3**
  
  - [ ]* 4.7 编写属性测试 - Property 7: isMoving状态一致性
    - **Property 7: isMoving状态一致性**
    - **Validates: Requirements 5.4**

- [x] 5. 集成到 Demo 应用
  - [x] 5.1 修改 `demo/App.tsx` 添加相机移动控制 UI
    - 添加"相机移动"开关（toggle）控件
    - 添加移动速度调节滑块
    - 添加状态管理（enableCameraMovement、cameraMovementSpeed）
    - _Requirements: 6.1, 6.4_
  
  - [x] 5.2 在 Demo 中集成 CameraMovementPlugin
    - 通过 ThreeViewer 的 ref 获取插件实例
    - 根据开关状态调用 setEnabled
    - 根据滑块值调用 setMoveSpeed
    - _Requirements: 6.2_
  
  - [x] 5.3 更新控制说明区域
    - 添加键盘移动操作指南（WASD、Shift、Ctrl）
    - _Requirements: 6.3_

- [x] 6. Final Checkpoint - 确保所有功能完成
  - 确保所有测试通过，如有问题请询问用户。

## 备注

- 标记 `*` 的任务为可选任务，可跳过以加快 MVP 开发
- 每个任务都引用了具体的需求以确保可追溯性
- 属性测试验证普遍正确性属性
- 单元测试验证具体示例和边界情况
