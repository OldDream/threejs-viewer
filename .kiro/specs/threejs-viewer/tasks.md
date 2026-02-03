# Implementation Plan: Three.js Viewer

## Overview

本实现计划将 Three.js Viewer 的设计分解为可执行的编码任务。采用自底向上的方式，先实现核心模块，再实现插件，最后封装 React 组件。使用 TypeScript 开发，Vite 构建，Vitest + fast-check 进行测试。

## Tasks

- [ ] 1. 项目初始化和开发环境配置
  - [x] 1.1 创建 Vite + React 19 + TypeScript 项目
    - 使用 `npm create vite@latest` 创建项目
    - 配置 TypeScript 严格模式
    - _Requirements: 6.1, 6.2_
  - [~] 1.2 安装依赖并配置构建
    - 安装 three、@types/three、three-stdlib
    - 配置 Vite 库模式输出
    - 配置 package.json 的 exports 字段
    - _Requirements: 6.1, 6.5_
  - [~] 1.3 配置测试环境
    - 安装 vitest、@testing-library/react、@fast-check/vitest
    - 配置 vitest.config.ts
    - _Requirements: 6.1_

- [ ] 2. 实现核心模块
  - [~] 2.1 实现 SceneManager
    - 创建 `src/core/SceneManager.ts`
    - 实现 scene 创建、add、remove、clear、dispose 方法
    - _Requirements: 4.2, 4.3_
  - [ ]* 2.2 编写 SceneManager 单元测试
    - 测试对象添加/移除
    - 测试 dispose 清理
    - _Requirements: 4.3_
  - [~] 2.3 实现 CameraManager
    - 创建 `src/core/CameraManager.ts`
    - 实现 PerspectiveCamera 创建和配置
    - 实现 setAspect、lookAt、dispose 方法
    - _Requirements: 4.2, 4.4_
  - [ ]* 2.4 编写 CameraManager 单元测试
    - 测试配置应用
    - 测试 aspect ratio 更新
    - _Requirements: 4.4_
  - [~] 2.5 实现 RenderManager
    - 创建 `src/core/RenderManager.ts`
    - 实现 WebGLRenderer 创建和配置
    - 实现 setSize、render、dispose 方法
    - _Requirements: 4.2, 4.3_
  - [ ]* 2.6 编写 RenderManager 单元测试
    - 测试初始化选项
    - 测试尺寸更新
    - _Requirements: 4.4_

- [ ] 3. 实现插件系统
  - [~] 3.1 实现 PluginSystem
    - 创建 `src/core/PluginSystem.ts`
    - 实现 register、unregister、get、updateAll、disposeAll 方法
    - 定义 Plugin 和 PluginContext 接口
    - _Requirements: 5.1, 5.2, 5.3, 5.5_
  - [ ]* 3.2 编写 PluginSystem 单元测试
    - 测试插件注册/注销
    - 测试 context 传递
    - 测试 dispose 调用
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ]* 3.3 编写 PluginSystem 属性测试
    - **Property 12: Plugin Registration and Context**
    - **Property 13: Plugin Disposal on Unregister**
    - **Property 14: Plugin Update Notification**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.5**

- [~] 4. Checkpoint - 核心模块验证
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. 实现 ViewerCore
  - [~] 5.1 实现 ViewerCore 类
    - 创建 `src/core/ViewerCore.ts`
    - 整合 SceneManager、CameraManager、RenderManager、PluginSystem
    - 实现 initialize、start、stop、dispose、resize 方法
    - 实现渲染循环
    - _Requirements: 4.2, 4.3, 4.4, 5.4_
  - [ ]* 5.2 编写 ViewerCore 单元测试
    - 测试初始化流程
    - 测试 dispose 清理顺序
    - _Requirements: 4.2, 4.3_

- [ ] 6. 实现 ModelLoaderPlugin
  - [~] 6.1 实现 ModelLoaderPlugin
    - 创建 `src/plugins/ModelLoaderPlugin.ts`
    - 使用 GLTFLoader 加载模型
    - 实现 load、unload、getCenter、getBoundingBox 方法
    - 实现加载状态管理
    - 计算模型包围盒和中心点
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [ ]* 6.2 编写 ModelLoaderPlugin 单元测试
    - 测试加载成功回调
    - 测试加载失败错误处理
    - 测试模型替换时的 dispose
    - _Requirements: 1.1, 1.3, 1.5_
  - [ ]* 6.3 编写 ModelLoaderPlugin 属性测试
    - **Property 2: Pivot Point Calculation**
    - **Property 3: Error Event on Load Failure**
    - **Property 4: Model Disposal on Replacement**
    - **Validates: Requirements 1.2, 1.3, 1.5**

- [ ] 7. 实现 OrbitControlsPlugin
  - [~] 7.1 实现 OrbitControlsPlugin
    - 创建 `src/plugins/OrbitControlsPlugin.ts`
    - 使用 three-stdlib 的 OrbitControls
    - 实现 configure、setTarget、setZoomLimits、reset 方法
    - 实现 update 方法用于 damping
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4_
  - [ ]* 7.2 编写 OrbitControlsPlugin 单元测试
    - 测试配置应用
    - 测试 target 更新
    - 测试 zoom 限制
    - _Requirements: 2.4, 2.5, 3.2, 3.3_
  - [ ]* 7.3 编写 OrbitControlsPlugin 属性测试
    - **Property 5: Camera Rotation Around Pivot**
    - **Property 6: Pivot Point Configuration**
    - **Property 7: Zoom Distance Changes**
    - **Property 8: Zoom Limits Enforcement**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4**

- [~] 8. Checkpoint - 插件验证
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. 实现 React 组件
  - [~] 9.1 实现 ThreeViewer 组件
    - 创建 `src/components/ThreeViewer.tsx`
    - 使用 useRef 管理 container 和 ViewerCore 实例
    - 使用 useEffect 处理初始化和清理
    - 使用 useEffect 处理 props 变化
    - 使用 ResizeObserver 处理容器尺寸变化
    - 实现 onLoad、onError、onLoadingChange 回调
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  - [ ]* 9.2 编写 ThreeViewer 组件测试
    - 测试 mount/unmount 生命周期
    - 测试 props 更新
    - 测试回调触发
    - _Requirements: 4.2, 4.3, 4.6_
  - [ ]* 9.3 编写 React 组件属性测试
    - **Property 9: Resource Disposal on Unmount**
    - **Property 10: Resize Handling**
    - **Property 11: Props Update Without Re-initialization**
    - **Validates: Requirements 4.3, 4.4, 4.6**

- [ ] 10. 配置库导出
  - [~] 10.1 创建库入口文件
    - 创建 `src/index.ts`
    - 导出 ThreeViewer 组件
    - 导出类型定义
    - 导出核心类和插件（供高级用户使用）
    - _Requirements: 4.1, 6.5_
  - [~] 10.2 配置 Vite 库模式
    - 配置 vite.config.ts 的 build.lib 选项
    - 配置 external 依赖（react、three）
    - 生成类型声明文件
    - _Requirements: 6.5_

- [ ] 11. 创建 Demo 应用
  - [~] 11.1 创建 Demo 页面
    - 创建 `demo/App.tsx`
    - 展示 ThreeViewer 组件的基本用法
    - 添加模型 URL 输入
    - 添加 pivot point 和 zoom limits 控制
    - 显示加载状态和错误信息
    - _Requirements: 6.3_
  - [~] 11.2 配置 Demo 入口
    - 创建 `demo/main.tsx` 和 `demo/index.html`
    - 配置 Vite 开发服务器
    - _Requirements: 6.3, 6.4_

- [~] 12. Final Checkpoint - 完整验证
  - Ensure all tests pass, ask the user if questions arise.
  - 验证 Demo 应用正常运行
  - 验证库构建输出正确

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 使用 TypeScript 开发，确保类型安全
- 属性测试使用 fast-check，每个测试至少运行 100 次迭代
- 核心模块和插件分离，便于后续扩展
- Demo 应用用于开发调试和功能展示
