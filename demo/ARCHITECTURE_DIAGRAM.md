# Architecture Diagram

## Component Hierarchy

```
App.refactored.tsx
│
├─ <style> (spinner keyframes)
│
├─ <DemoLayout>
│   │
│   ├─ <DemoHeader>
│   │   └─ Title + Subtitle
│   │
│   └─ <DemoMain>
│       │
│       ├─ <DemoSidebar>
│       │   │
│       │   ├─ <ModelUrlControl>
│       │   │   ├─ URL Input
│       │   │   ├─ Folder Selector
│       │   │   ├─ File Selector
│       │   │   ├─ Texture Selector (conditional)
│       │   │   └─ Load Button
│       │   │
│       │   ├─ <PivotPointControl>
│       │   │   ├─ Enable Checkbox
│       │   │   ├─ X/Y/Z Inputs
│       │   │   └─ Apply Button
│       │   │
│       │   ├─ <ZoomLimitsControl>
│       │   │   ├─ Enable Checkbox
│       │   │   ├─ Min/Max Inputs
│       │   │   └─ Apply Button
│       │   │
│       │   ├─ <GridControl>
│       │   │   ├─ Show Grid Checkbox
│       │   │   ├─ Show Axes Checkbox
│       │   │   └─ Plane Selector
│       │   │
│       │   ├─ <CameraMovementControl>
│       │   │   ├─ Enable Checkbox
│       │   │   ├─ CS Mode Checkbox
│       │   │   └─ Speed Slider
│       │   │
│       │   ├─ <CameraAnimationControl>
│       │   │   ├─ View Mode Selector
│       │   │   ├─ Start/Stop Button
│       │   │   └─ Hint Text
│       │   │
│       │   ├─ <StatusDisplay>
│       │   │   └─ Loading/Error/Success/Idle
│       │   │
│       │   ├─ Reset Button
│       │   │
│       │   └─ <ControlsInstructions>
│       │       └─ Keyboard/Mouse Instructions
│       │
│       └─ <DemoViewer>
│           ├─ <ThreeViewer> (when modelUrl exists)
│           └─ Overlay (when no model)
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        App.refactored.tsx                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    State (via Hooks)                        │ │
│  │                                                             │ │
│  │  useModelLoader()                                          │ │
│  │  ├─ modelUrl, inputUrl, isLoading, error, loadResult      │ │
│  │  └─ handleLoad, handleFileSelect, handleReset             │ │
│  │                                                             │ │
│  │  usePivotControl()                                         │ │
│  │  ├─ pivotPoint, pivotX/Y/Z, usePivotPoint                 │ │
│  │  └─ setPivotX/Y/Z, setUsePivotPoint, handleApply          │ │
│  │                                                             │ │
│  │  useZoomControl()                                          │ │
│  │  ├─ zoomLimits, zoomMin/Max, useZoomLimits                │ │
│  │  └─ setZoomMin/Max, setUseZoomLimits, handleApply         │ │
│  │                                                             │ │
│  │  useGridControl()                                          │ │
│  │  ├─ gridConfig, showGrid, showAxes, gridPlane             │ │
│  │  └─ setShowGrid, setShowAxes, setGridPlane                │ │
│  │                                                             │ │
│  │  useCameraMovement(viewerRef, isAnimating)                │ │
│  │  ├─ enabled, speed, isCSMode                              │ │
│  │  └─ setEnabled, setSpeed, setIsCSMode                     │ │
│  │                                                             │ │
│  │  useCameraAnimation(viewerRef, loadResult)                │ │
│  │  ├─ isAnimating, viewMode                                 │ │
│  │  └─ setViewMode, handleToggle, handleStop                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│                              ↓ props                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    UI Components                            │ │
│  │                                                             │ │
│  │  ModelUrlControl                                           │ │
│  │  PivotPointControl                                         │ │
│  │  ZoomLimitsControl                                         │ │
│  │  GridControl                                               │ │
│  │  CameraMovementControl                                     │ │
│  │  CameraAnimationControl                                    │ │
│  │  StatusDisplay                                             │ │
│  │  ControlsInstructions                                      │ │
│  │  DemoViewer                                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│                          ↑ callbacks                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Hook Internal Flow

### useModelLoader Hook

```
┌─────────────────────────────────────────────────────────────┐
│                      useModelLoader                          │
│                                                              │
│  State:                                                      │
│  ├─ modelUrl                                                │
│  ├─ inputUrl                                                │
│  ├─ isLoading                                               │
│  ├─ error                                                   │
│  ├─ loadResult                                              │
│  ├─ localFileManager                                        │
│  └─ fileState { selectedModelFile, selectedTextureFiles,   │
│                  isLocalFile, selectedFolderFiles,          │
│                  isFolderMode }                             │
│                                                              │
│  Actions:                                                    │
│  ├─ handleLoad() ──────────┐                               │
│  │                          ↓                               │
│  │                    Check file mode                       │
│  │                          ↓                               │
│  │              ┌───────────┴───────────┐                  │
│  │              ↓                       ↓                   │
│  │         Folder Mode            File Mode                │
│  │              ↓                       ↓                   │
│  │    loadModelFromFolder    loadModelFromFiles            │
│  │              ↓                       ↓                   │
│  │              └───────────┬───────────┘                  │
│  │                          ↓                               │
│  │                    setModelUrl()                         │
│  │                                                          │
│  ├─ handleFolderSelect()                                   │
│  ├─ handleModelFileSelect()                                │
│  ├─ handleTextureFilesSelect()                             │
│  ├─ handleInputUrlChange()                                 │
│  ├─ handleLoadSuccess() ──→ cleanup after delay            │
│  ├─ handleLoadError() ────→ cleanup immediately            │
│  └─ handleReset() ────────→ reset all state                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### useCameraMovement Hook

```
┌─────────────────────────────────────────────────────────────┐
│                    useCameraMovement                         │
│                                                              │
│  Dependencies:                                               │
│  ├─ viewerRef (from App)                                    │
│  └─ isAnimating (from useCameraAnimation)                   │
│                                                              │
│  State:                                                      │
│  ├─ pluginRef (useRef)                                      │
│  ├─ enabled                                                 │
│  ├─ speed                                                   │
│  └─ isCSMode                                                │
│                                                              │
│  Effects:                                                    │
│  │                                                           │
│  ├─ useEffect(() => {                                       │
│  │    // Register plugin when viewer is ready              │
│  │    const plugin = new CameraMovementPlugin();           │
│  │    viewerCore.plugins.register(plugin);                 │
│  │    pluginRef.current = plugin;                          │
│  │    return () => viewerCore.plugins.unregister();        │
│  │  }, [viewerRef]);                                       │
│  │                                                           │
│  ├─ useEffect(() => {                                       │
│  │    // Sync enabled state to plugin                      │
│  │    pluginRef.current?.setEnabled(enabled && !isAnimating);│
│  │  }, [enabled, isAnimating]);                            │
│  │                                                           │
│  ├─ useEffect(() => {                                       │
│  │    // Sync speed to plugin                              │
│  │    pluginRef.current?.setMoveSpeed(speed);              │
│  │  }, [speed]);                                           │
│  │                                                           │
│  └─ useEffect(() => {                                       │
│       // Sync fly mode to plugin                           │
│       pluginRef.current?.setFlyMode(isCSMode);             │
│     }, [isCSMode]);                                        │
│                                                              │
│  Actions:                                                    │
│  ├─ setEnabled()                                            │
│  ├─ setSpeed()                                              │
│  ├─ setIsCSMode()                                           │
│  └─ handleReset()                                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### useCameraAnimation Hook

```
┌─────────────────────────────────────────────────────────────┐
│                   useCameraAnimation                         │
│                                                              │
│  Dependencies:                                               │
│  ├─ viewerRef (from App)                                    │
│  └─ loadResult (from useModelLoader)                        │
│                                                              │
│  State:                                                      │
│  ├─ pluginRef (useRef)                                      │
│  ├─ isAnimating                                             │
│  └─ viewMode ('target' | 'fixed' | 'path')                 │
│                                                              │
│  Effects:                                                    │
│  │                                                           │
│  └─ useEffect(() => {                                       │
│       // Register plugin when viewer is ready              │
│       const plugin = new CameraPathAnimationPlugin();      │
│       viewerCore.plugins.register(plugin);                 │
│       pluginRef.current = plugin;                          │
│       return () => viewerCore.plugins.unregister();        │
│     }, [viewerRef]);                                       │
│                                                              │
│  Actions:                                                    │
│  │                                                           │
│  ├─ handleToggle() ────────┐                               │
│  │                          ↓                               │
│  │                   isAnimating?                           │
│  │                          ↓                               │
│  │              ┌───────────┴───────────┐                  │
│  │              ↓                       ↓                   │
│  │            Yes                      No                   │
│  │              ↓                       ↓                   │
│  │        plugin.stop()      Generate path points          │
│  │              ↓                       ↓                   │
│  │    setIsAnimating(false)   Configure view mode          │
│  │                                      ↓                   │
│  │                            plugin.configure(config)      │
│  │                                      ↓                   │
│  │                          setIsAnimating(true)            │
│  │                                                          │
│  ├─ handleStop()                                            │
│  └─ setViewMode()                                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Event Flow Example: Loading a Model

```
1. User clicks "Load Model" button
   │
   ↓
2. ModelUrlControl calls onLoad callback
   │
   ↓
3. App calls modelLoader.handleLoad()
   │
   ↓
4. useModelLoader.handleLoad() executes
   │
   ├─ Sets isLoading = true
   │
   ├─ Checks file mode (URL/File/Folder)
   │
   ├─ Calls appropriate loader method
   │
   └─ Sets modelUrl with result
   │
   ↓
5. App passes new modelUrl to DemoViewer
   │
   ↓
6. DemoViewer passes modelUrl to ThreeViewer
   │
   ↓
7. ThreeViewer loads the model
   │
   ├─ Calls onLoadingChange(true)
   │   └─ Updates isLoading state
   │
   ├─ Loads model from URL
   │
   └─ On success: calls onLoad(result)
       └─ Updates loadResult state
       └─ Triggers cleanup after delay
   │
   ↓
8. StatusDisplay shows success message
```

## Plugin Registration Flow

```
App mounts
   │
   ↓
viewerRef created
   │
   ↓
DemoViewer renders ThreeViewer
   │
   ↓
ThreeViewer initializes ViewerCore
   │
   ↓
useCameraMovement useEffect triggers
   │
   ├─ Creates CameraMovementPlugin
   ├─ Registers with ViewerCore
   └─ Stores ref in pluginRef
   │
   ↓
useCameraAnimation useEffect triggers
   │
   ├─ Creates CameraPathAnimationPlugin
   ├─ Registers with ViewerCore
   └─ Stores ref in pluginRef
   │
   ↓
Plugins are now active and listening
   │
   ↓
State changes trigger plugin updates
   │
   ├─ enabled changes → plugin.setEnabled()
   ├─ speed changes → plugin.setMoveSpeed()
   └─ isCSMode changes → plugin.setFlyMode()
```

## Theme System

```
styles/theme.ts
   │
   ├─ colors
   │   ├─ background (primary, secondary, tertiary, input)
   │   ├─ border (primary)
   │   ├─ text (primary, secondary, accent, success, error, info)
   │   └─ button (primary, primaryHover, secondary, disabled, success, neutral)
   │
   ├─ spacing (xs, sm, md, lg, xl, xxl)
   │
   ├─ typography
   │   ├─ fontFamily
   │   ├─ fontSize (xs, sm, md, lg, xl)
   │   └─ fontWeight (normal, medium, semibold)
   │
   └─ styles (common style objects)
       ├─ input
       ├─ button
       ├─ buttonSecondary
       ├─ label
       ├─ section
       └─ sectionTitle
```

## Summary

This architecture provides:

1. **Clear Separation**: UI, logic, and styling are separated
2. **Unidirectional Flow**: Data flows down via props, events flow up via callbacks
3. **Encapsulation**: Each hook manages its own state and side effects
4. **Reusability**: Components and hooks can be used independently
5. **Maintainability**: Easy to locate and modify specific features
