# Implementation Plan: Three.js Instance Access API

## Overview

实现 Three.js 实例访问 API，提供 React Hook 和 Ref 两种方式让开发者访问底层 Three.js 实例。实现采用 TypeScript，遵循 React 最佳实践。

## Tasks

- [x] 1. 创建类型定义和 Context
  - [x] 1.1 创建 ThreeInstanceContextValue 和 ThreeViewerHandle 类型定义
    - 在 `src/types/instance.ts` 中定义所有类型接口
    - 包含 ThreeInstanceContextValue、ThreeViewerHandle 类型
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [x] 1.2 创建 ThreeInstanceContext
    - 在 `src/context/ThreeInstanceContext.ts` 中创建 React Context
    - 定义初始值（所有实例为 null，isReady=false，isDisposed=false）
    - _Requirements: 1.5, 4.1_

- [x] 2. 实现 useThreeInstance Hook
  - [x] 2.1 实现 useThreeInstance Hook
    - 在 `src/hooks/useThreeInstance.ts` 中实现 Hook
    - 使用 useContext 获取 ThreeInstanceContext
    - 在 Context 不存在时抛出描述性错误
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 2.2 编写 useThreeInstance Hook 单元测试
    - 测试在 ThreeViewer 内部调用返回正确上下文
    - 测试在 ThreeViewer 外部调用抛出错误
    - _Requirements: 2.2, 2.3_

- [x] 3. 更新 ThreeViewer 组件支持实例访问
  - [x] 3.1 创建 ThreeInstanceProvider 组件
    - 在 `src/context/ThreeInstanceProvider.tsx` 中实现 Provider
    - 从 ViewerCore 提取实例并提供给 Context
    - 监听生命周期状态变化更新 Context
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 3.2 使用 forwardRef 重构 ThreeViewer 组件
    - 修改 `src/components/ThreeViewer.tsx` 使用 forwardRef
    - 实现 useImperativeHandle 暴露 ThreeViewerHandle 方法
    - 包装 children 在 ThreeInstanceProvider 中
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ]* 3.3 编写 ThreeViewer Ref API 单元测试
    - 测试 getInstances 返回正确实例
    - 测试 getViewerCore 返回 ViewerCore
    - 测试 isReady 和 isDisposed 方法
    - _Requirements: 3.2, 3.3, 3.5_

- [x] 4. Checkpoint - 确保核心功能测试通过
  - 确保所有测试通过，如有问题请询问用户

- [x] 5. 实现生命周期安全和 null 处理
  - [x] 5.1 实现生命周期状态跟踪
    - 在 ThreeInstanceProvider 中跟踪 mounted/initialized/disposed 状态
    - 确保状态转换正确更新 Context
    - _Requirements: 4.1, 4.3, 4.5_
  
  - [x] 5.2 实现安全的 null 返回逻辑
    - 在未初始化和已销毁状态下返回 null
    - 确保不抛出错误
    - _Requirements: 1.5, 1.6, 4.2, 4.4_
  
  - [ ]* 5.3 编写生命周期属性测试
    - **Property 4: Lifecycle State Tracking**
    - **Validates: Requirements 4.1, 4.3, 4.5**
  
  - [ ]* 5.4 编写安全 null 处理属性测试
    - **Property 5: Safe Null Handling**
    - **Validates: Requirements 1.5, 1.6, 4.2, 4.4**

- [x] 6. 更新导出和确保向后兼容
  - [x] 6.1 更新 index.ts 导出
    - 导出 useThreeInstance Hook
    - 导出所有新类型定义
    - 保持现有导出不变
    - _Requirements: 2.1, 5.4, 6.4_
  
  - [x] 6.2 验证向后兼容性
    - 确保现有 props 接口不变
    - 确保现有回调函数正常工作
    - 确保不使用新 API 时行为不变
    - _Requirements: 6.1, 6.2, 6.3, 6.5_
  
  - [ ]* 6.3 编写向后兼容性属性测试
    - **Property 6: Backward Compatibility**
    - **Validates: Requirements 6.2, 6.5**

- [x] 7. 编写集成测试
  - [ ]* 7.1 编写 Hook 使用流程集成测试
    - 测试完整的 Hook 使用场景
    - 测试实例访问和状态更新
    - _Requirements: 2.2, 2.4_
  
  - [ ]* 7.2 编写 Ref 使用流程集成测试
    - 测试完整的 Ref 使用场景
    - 测试所有 ref 方法
    - _Requirements: 3.2, 3.3_
  
  - [ ]* 7.3 编写实例身份一致性属性测试
    - **Property 1: Instance Identity Consistency**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [x] 8. Final Checkpoint - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户

## Notes

- 任务标记 `*` 为可选测试任务，可跳过以加快 MVP 开发
- 每个任务都引用了具体的需求条款以确保可追溯性
- 属性测试验证通用正确性属性
- 单元测试验证具体示例和边界情况
