# Requirements Document

## Introduction

本文档定义了 Three.js 实例访问 API 的需求。该功能允许高级用户直接访问底层的 Three.js 实例（如 Scene、Camera、Renderer 等），以便进行自定义扩展和高级操作。API 设计需要在提供灵活性的同时，确保类型安全和资源管理的正确性。

## Glossary

- **ThreeJS_Instance**: Three.js 核心对象的统称，包括 Scene、Camera、Renderer 等
- **Instance_Accessor**: 提供访问 Three.js 实例的 API 接口
- **Viewer_Context**: 包含所有 Three.js 实例引用的上下文对象
- **Lifecycle_State**: Viewer 的生命周期状态（未初始化、运行中、已销毁）
- **Hook_API**: React Hook 形式的实例访问接口
- **Ref_API**: React Ref 形式的实例访问接口

## Requirements

### Requirement 1: 实例访问接口

**User Story:** As a developer, I want to access the underlying Three.js instances, so that I can perform custom operations and extend the viewer functionality.

#### Acceptance Criteria

1. THE Instance_Accessor SHALL provide read-only access to the THREE.Scene instance
2. THE Instance_Accessor SHALL provide read-only access to the THREE.PerspectiveCamera instance
3. THE Instance_Accessor SHALL provide read-only access to the THREE.WebGLRenderer instance
4. THE Instance_Accessor SHALL provide read-only access to the container HTMLElement
5. WHEN the Viewer is not initialized, THE Instance_Accessor SHALL return null for all instances
6. WHEN the Viewer is disposed, THE Instance_Accessor SHALL return null for all instances

### Requirement 2: React Hook 访问方式

**User Story:** As a React developer, I want to use a Hook to access Three.js instances, so that I can integrate with React's lifecycle and state management.

#### Acceptance Criteria

1. THE Hook_API SHALL be exported as a custom React Hook named useThreeInstance
2. WHEN called within a ThreeViewer context, THE useThreeInstance Hook SHALL return the Viewer_Context object
3. WHEN called outside a ThreeViewer context, THE useThreeInstance Hook SHALL throw a descriptive error
4. WHEN the Viewer_Context changes, THE useThreeInstance Hook SHALL trigger a re-render with the new context
5. THE useThreeInstance Hook SHALL provide TypeScript type definitions for all returned instances

### Requirement 3: React Ref 访问方式

**User Story:** As a React developer, I want to use a Ref to access Three.js instances imperatively, so that I can perform operations without triggering re-renders.

#### Acceptance Criteria

1. THE ThreeViewer component SHALL accept an optional ref prop for imperative access
2. WHEN a ref is provided, THE ThreeViewer SHALL expose a getInstances method that returns the Viewer_Context
3. WHEN a ref is provided, THE ThreeViewer SHALL expose a getViewerCore method that returns the ViewerCore instance
4. THE Ref_API SHALL provide TypeScript type definitions for all exposed methods
5. WHEN the Viewer is disposed, THE ref methods SHALL return null

### Requirement 4: 生命周期安全

**User Story:** As a developer, I want the instance access API to be lifecycle-aware, so that I can safely use the instances without causing errors.

#### Acceptance Criteria

1. THE Instance_Accessor SHALL track the Lifecycle_State of the Viewer
2. WHEN accessing instances in an invalid Lifecycle_State, THE Instance_Accessor SHALL return null instead of throwing errors
3. THE Instance_Accessor SHALL provide a method to check if the Viewer is ready for use
4. WHEN the Viewer transitions to disposed state, THE Instance_Accessor SHALL clear all instance references
5. THE Instance_Accessor SHALL provide an isDisposed property to check disposal state

### Requirement 5: 类型安全

**User Story:** As a TypeScript developer, I want complete type definitions, so that I can use the API with full IDE support and compile-time checking.

#### Acceptance Criteria

1. THE Viewer_Context interface SHALL define types for all accessible instances
2. THE Hook_API return type SHALL be fully typed with nullable instance types
3. THE Ref_API exposed methods SHALL have complete TypeScript signatures
4. THE Instance_Accessor SHALL export all relevant type definitions for external use
5. WHEN instances are null, THE type system SHALL require null checks before use

### Requirement 6: 向后兼容

**User Story:** As an existing user of the ThreeViewer, I want the new API to be backward compatible, so that my existing code continues to work.

#### Acceptance Criteria

1. THE existing ThreeViewer props interface SHALL remain unchanged
2. THE existing callback props (onLoad, onError, onLoadingChange) SHALL continue to function
3. THE new ref prop SHALL be optional and not affect existing usage
4. THE Hook_API SHALL be an additional export that does not modify existing exports
5. WHEN the new API is not used, THE ThreeViewer behavior SHALL be identical to the previous version

