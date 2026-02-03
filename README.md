# Three.js Viewer

A modular Three.js 3D model viewer as a React component. Supports GLTF/GLB model loading with orbit controls.

## Features

- 🎨 **React Component** - Easy-to-use `<ThreeViewer />` component
- 📦 **GLTF/GLB Support** - Load 3D models in GLTF and GLB formats
- 🎮 **Orbit Controls** - Rotate, zoom, and pan around models
- 🔌 **Plugin Architecture** - Extensible design for custom features
- 📱 **Responsive** - Automatically handles container resize
- 🧹 **Memory Safe** - Proper cleanup of Three.js resources

## Installation

```bash
npm install threejs-viewer three react react-dom
```

## Quick Start

```tsx
import { ThreeViewer } from 'threejs-viewer';

function App() {
  return (
    <ThreeViewer
      modelUrl="https://example.com/model.glb"
      style={{ width: '100%', height: '500px' }}
      onLoad={(result) => console.log('Model loaded:', result)}
      onError={(error) => console.error('Error:', error)}
    />
  );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `modelUrl` | `string` | URL of the GLTF/GLB model to load |
| `pivotPoint` | `{ x, y, z }` | Custom rotation center point |
| `zoomLimits` | `{ min?, max? }` | Camera zoom distance limits |
| `className` | `string` | CSS class for the container |
| `style` | `CSSProperties` | Inline styles for the container |
| `onLoad` | `(result) => void` | Callback when model loads successfully |
| `onError` | `(error) => void` | Callback when an error occurs |
| `onLoadingChange` | `(isLoading) => void` | Callback when loading state changes |

## Controls

- **Rotate**: Left-click and drag
- **Zoom**: Scroll wheel or pinch gesture
- **Pan**: Right-click and drag

## Advanced Usage

### Custom Pivot Point

```tsx
<ThreeViewer
  modelUrl="/model.glb"
  pivotPoint={{ x: 0, y: 1, z: 0 }}
/>
```

### Custom Zoom Limits

```tsx
<ThreeViewer
  modelUrl="/model.glb"
  zoomLimits={{ min: 1, max: 50 }}
/>
```

### Loading State

```tsx
function App() {
  const [loading, setLoading] = useState(false);

  return (
    <>
      {loading && <div>Loading...</div>}
      <ThreeViewer
        modelUrl="/model.glb"
        onLoadingChange={setLoading}
      />
    </>
  );
}
```

## Using Core Classes (Advanced)

For more control, you can use the core classes directly:

```tsx
import { ViewerCore, ModelLoaderPlugin, OrbitControlsPlugin } from 'threejs-viewer';

const viewer = new ViewerCore();
viewer.initialize({ container: document.getElementById('viewer')! });

const modelLoader = new ModelLoaderPlugin();
const orbitControls = new OrbitControlsPlugin();

viewer.plugins.register(modelLoader);
viewer.plugins.register(orbitControls);

viewer.start();

// Load a model
const result = await modelLoader.load('/model.glb');
orbitControls.setTarget(result.center);

// Cleanup when done
viewer.dispose();
```

## Development

### Setup

```bash
npm install
```

### Run Demo

```bash
npm run dev:demo
```

Opens the demo app at http://localhost:3000

### Run Tests

```bash
npm run test:run
```

### Build Library

```bash
npm run build:lib
```

Outputs to `dist/`:
- `threejs-viewer.mjs` (ESM)
- `threejs-viewer.cjs` (CommonJS)
- Type declarations (`.d.ts`)

## Project Structure

```
src/
├── components/
│   └── ThreeViewer.tsx    # Main React component
├── core/
│   ├── ViewerCore.ts      # Core engine
│   ├── SceneManager.ts    # Scene management
│   ├── CameraManager.ts   # Camera management
│   ├── RenderManager.ts   # Renderer management
│   └── PluginSystem.ts    # Plugin system
├── plugins/
│   ├── ModelLoaderPlugin.ts   # GLTF model loading
│   └── OrbitControlsPlugin.ts # Orbit controls
└── index.ts               # Library exports

demo/
├── App.tsx                # Demo application
├── main.tsx               # Demo entry point
└── index.html             # Demo HTML
```

## API Reference

### ThreeViewer Component

The main React component for displaying 3D models.

### ViewerCore

Core engine that coordinates all subsystems.

```ts
interface ViewerCore {
  scene: SceneManager;
  camera: CameraManager;
  renderer: RenderManager;
  plugins: PluginSystem;
  
  initialize(options: ViewerCoreOptions): void;
  start(): void;
  stop(): void;
  dispose(): void;
  resize(width: number, height: number): void;
}
```

### ModelLoaderPlugin

Handles GLTF/GLB model loading.

```ts
interface ModelLoaderPlugin {
  loadingState: LoadingState;
  
  load(url: string): Promise<ModelLoadResult>;
  unload(): void;
  getCenter(): Vector3 | null;
  getBoundingBox(): Box3 | null;
}
```

### OrbitControlsPlugin

Provides camera orbit controls.

```ts
interface OrbitControlsPlugin {
  controls: OrbitControls;
  
  configure(config: OrbitControlsConfig): void;
  setTarget(target: Vector3): void;
  setZoomLimits(min: number, max: number): void;
  reset(): void;
}
```

## Peer Dependencies

- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `three` >= 0.150.0

## License

MIT
