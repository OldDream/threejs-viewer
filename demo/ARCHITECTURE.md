# Demo Application Architecture

## Overview

This document describes the refactored architecture of the ThreeViewer demo application. The refactoring transforms a monolithic 600+ line component into a modular, maintainable structure.

## Architecture Principles

1. **Separation of Concerns**: Business logic, UI components, and styling are separated
2. **Single Responsibility**: Each component/hook has one clear purpose
3. **Unidirectional Data Flow**: Props down, callbacks up
4. **Reusability**: Components and hooks can be reused independently
5. **Type Safety**: Full TypeScript support throughout

## Directory Structure

```
demo/
├── App.refactored.tsx          # Main application (orchestrator)
├── App.tsx                      # Original monolithic version (for comparison)
├── ARCHITECTURE.md              # This file
│
├── components/                  # UI Components
│   ├── index.ts                # Component exports
│   ├── DemoLayout.tsx          # Layout wrapper
│   ├── DemoHeader.tsx          # Header component
│   ├── DemoSidebar.tsx         # Sidebar container
│   ├── DemoViewer.tsx          # Viewer container with overlay
│   └── controls/               # Control components
│       ├── ControlSection.tsx          # Reusable section wrapper
│       ├── ModelUrlControl.tsx         # Model loading controls
│       ├── PivotPointControl.tsx       # Pivot point settings
│       ├── ZoomLimitsControl.tsx       # Zoom limits settings
│       ├── GridControl.tsx             # Grid & axes settings
│       ├── CameraMovementControl.tsx   # WASD movement settings
│       ├── CameraAnimationControl.tsx  # Path animation settings
│       ├── StatusDisplay.tsx           # Loading/error/success status
│       └── ControlsInstructions.tsx    # Keyboard/mouse instructions
│
├── hooks/                       # Custom Hooks (Business Logic)
│   ├── index.ts                # Hook exports
│   ├── useModelLoader.ts       # Model loading logic
│   ├── usePivotControl.ts      # Pivot point state management
│   ├── useZoomControl.ts       # Zoom limits state management
│   ├── useGridControl.ts       # Grid configuration management
│   ├── useCameraMovement.ts    # Camera movement plugin management
│   └── useCameraAnimation.ts   # Camera animation plugin management
│
└── styles/                      # Styling
    └── theme.ts                # Centralized theme constants
```

## Data Flow

### High-Level Flow

```
User Input → Control Component → Callback → App State (Hook) → Props → Viewer/UI
                                              ↓
                                        Side Effects (useEffect)
                                              ↓
                                        Plugin API Calls
```

### Example: Camera Movement

```typescript
// 1. User toggles checkbox in CameraMovementControl
<input onChange={(e) => onToggleEnabled(e.target.checked)} />

// 2. Callback updates state in useCameraMovement hook
const [enabled, setEnabled] = useState(true);

// 3. useEffect syncs state to plugin
useEffect(() => {
  pluginRef.current?.setEnabled(enabled);
}, [enabled]);

// 4. Plugin updates Three.js camera
```

## Component Responsibilities

### App.refactored.tsx (Orchestrator)
- Creates viewer ref
- Instantiates all hooks
- Passes props to components
- Coordinates reset functionality
- **Does NOT contain business logic**

### Custom Hooks
Each hook encapsulates related state and logic:

- **useModelLoader**: File/URL loading, loading states, error handling
- **usePivotControl**: Pivot point coordinates and application
- **useZoomControl**: Zoom limit values and application
- **useGridControl**: Grid visibility and configuration
- **useCameraMovement**: Plugin registration, state sync, cleanup
- **useCameraAnimation**: Animation control, path generation, view modes

### UI Components
Pure presentational components that:
- Receive data via props
- Emit events via callbacks
- Have no internal business logic
- Are easily testable

## Key Design Patterns

### 1. Custom Hooks Pattern
Encapsulates stateful logic and side effects:

```typescript
export function useCameraMovement(viewerRef, isAnimating) {
  const pluginRef = useRef(null);
  const [enabled, setEnabled] = useState(true);
  
  // Plugin registration
  useEffect(() => { /* ... */ }, [viewerRef]);
  
  // State synchronization
  useEffect(() => { /* ... */ }, [enabled]);
  
  return { enabled, setEnabled, /* ... */ };
}
```

### 2. Props Drilling Pattern
Simple and explicit data flow:

```typescript
// App passes props down
<CameraMovementControl
  enabled={cameraMovement.enabled}
  onToggleEnabled={cameraMovement.setEnabled}
/>

// Component uses props
function CameraMovementControl({ enabled, onToggleEnabled }) {
  return <input checked={enabled} onChange={e => onToggleEnabled(e.target.checked)} />;
}
```

### 3. Compound Components Pattern
Related components work together:

```typescript
<ControlSection title="Camera Movement">
  <Checkbox />
  <Slider />
  <Button />
</ControlSection>
```

## State Management

### Local State (useState)
Used for UI-specific state within hooks:
- Input values (pivotX, pivotY, pivotZ)
- Toggle states (usePivotPoint, showGrid)
- Derived state (gridConfig)

### Refs (useRef)
Used for:
- Viewer instance reference
- Plugin instance references
- Avoiding re-renders for mutable values

### Side Effects (useEffect)
Used for:
- Plugin registration/cleanup
- State synchronization to plugins
- Derived state updates

## Benefits of This Architecture

### Maintainability
- Easy to locate and modify specific features
- Clear separation of concerns
- Self-documenting code structure

### Testability
- Hooks can be tested independently
- Components can be tested in isolation
- Mock dependencies easily

### Reusability
- Components can be used in other projects
- Hooks can be shared across components
- Theme can be customized centrally

### Scalability
- Easy to add new controls
- Simple to extend functionality
- Clear patterns to follow

### Developer Experience
- Smaller files are easier to navigate
- Clear naming conventions
- TypeScript provides excellent autocomplete

## Migration Guide

To use the refactored version:

1. **Replace the import in `demo/main.tsx`**:
   ```typescript
   // Old
   import App from './App';
   
   // New
   import App from './App.refactored';
   ```

2. **Or rename files**:
   ```bash
   mv demo/App.tsx demo/App.old.tsx
   mv demo/App.refactored.tsx demo/App.tsx
   ```

## Future Improvements

### Potential Enhancements
1. **Context API**: If deep prop drilling becomes an issue
2. **State Management Library**: For complex cross-component state
3. **CSS Modules**: For better style encapsulation
4. **Storybook**: For component documentation and testing
5. **Unit Tests**: Add tests for hooks and components
6. **Performance Optimization**: Memoization with useMemo/useCallback

### Adding New Features

To add a new control:

1. Create a hook in `hooks/` for business logic
2. Create a component in `components/controls/` for UI
3. Add to `App.refactored.tsx` with props
4. Export from index files

Example:
```typescript
// 1. hooks/useNewFeature.ts
export function useNewFeature() {
  const [value, setValue] = useState(0);
  return { value, setValue };
}

// 2. components/controls/NewFeatureControl.tsx
export function NewFeatureControl({ value, onChange }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}

// 3. App.refactored.tsx
const newFeature = useNewFeature();
<NewFeatureControl value={newFeature.value} onChange={newFeature.setValue} />
```

## Comparison: Before vs After

### Before (Monolithic)
- 1 file, 600+ lines
- All logic in one component
- Hard to test
- Difficult to navigate
- Inline styles mixed with logic

### After (Modular)
- 20+ focused files
- Clear separation of concerns
- Easy to test each part
- Simple navigation
- Centralized styling

## Conclusion

This refactored architecture provides a solid foundation for maintaining and extending the demo application. The modular structure makes it easy to understand, test, and modify individual features without affecting the entire application.
