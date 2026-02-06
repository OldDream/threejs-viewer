# Three.js Viewer

一个模块化的 Three.js 3D 模型查看器 React 组件。支持 GLTF/GLB 模型加载和轨道控制。

## 特性

- 🎨 **React 组件** - 易用的 `<ThreeViewer />` 组件
- 📦 **GLTF/GLB 支持** - 加载 GLTF 和 GLB 格式的 3D 模型
- 🎮 **轨道控制** - 旋转、缩放和平移模型
- 🔌 **插件架构** - 可扩展的设计，支持自定义功能
- 📱 **响应式** - 自动处理容器尺寸变化
- 🧹 **内存安全** - 正确清理 Three.js 资源
- 🔗 **实例访问 API** - 通过 Hook 或 Ref 访问底层 Three.js 实例

## 安装

```bash
npm install threejs-viewer three react react-dom
```

## 快速开始

```tsx
import { ThreeViewer } from 'threejs-viewer';

function App() {
  return (
    <ThreeViewer
      modelUrl="https://example.com/model.glb"
      style={{ width: '100%', height: '500px' }}
      onLoad={(result) => console.log('模型加载完成:', result)}
      onError={(error) => console.error('错误:', error)}
    />
  );
}
```

## 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `modelUrl` | `string` | 要加载的 GLTF/GLB 模型 URL |
| `pivotPoint` | `{ x, y, z }` | 自定义旋转中心点 |
| `zoomLimits` | `{ min?, max? }` | 相机缩放距离限制 |
| `className` | `string` | 容器的 CSS 类名 |
| `style` | `CSSProperties` | 容器的内联样式 |
| `onLoad` | `(result) => void` | 模型加载成功时的回调 |
| `onError` | `(error) => void` | 发生错误时的回调 |
| `onLoadingChange` | `(isLoading) => void` | 加载状态变化时的回调 |
| `children` | `ReactNode` | 子组件，可使用 `useThreeInstance` Hook |
| `ref` | `Ref<ThreeViewerHandle>` | 用于命令式访问 Three.js 实例 |

## 控制方式

- **旋转**: 左键拖拽
- **缩放**: 滚轮或双指捏合
- **平移**: 右键拖拽

## 高级用法

### 自定义旋转中心

```tsx
<ThreeViewer
  modelUrl="/model.glb"
  pivotPoint={{ x: 0, y: 1, z: 0 }}
/>
```

### 自定义缩放限制

```tsx
<ThreeViewer
  modelUrl="/model.glb"
  zoomLimits={{ min: 1, max: 50 }}
/>
```


### 加载状态

```tsx
function App() {
  const [loading, setLoading] = useState(false);

  return (
    <>
      {loading && <div>加载中...</div>}
      <ThreeViewer
        modelUrl="/model.glb"
        onLoadingChange={setLoading}
      />
    </>
  );
}
```

## 实例访问 API

提供两种方式访问底层 Three.js 实例：Hook API 和 Ref API。

### useThreeInstance Hook

在 `ThreeViewer` 子组件中使用，获取响应式的 Three.js 实例访问。

```tsx
import { ThreeViewer, useThreeInstance } from 'threejs-viewer';

function SceneModifier() {
  const { scene, camera, isReady } = useThreeInstance();

  useEffect(() => {
    if (isReady && scene) {
      // 添加自定义光源
      const light = new THREE.PointLight(0xffffff, 1);
      light.position.set(5, 5, 5);
      scene.add(light);

      return () => {
        scene.remove(light);
        light.dispose();
      };
    }
  }, [scene, isReady]);

  return null;
}

function App() {
  return (
    <ThreeViewer modelUrl="/model.glb">
      <SceneModifier />
    </ThreeViewer>
  );
}
```

### Ref API

使用 ref 进行命令式访问，不触发重渲染。

```tsx
import { useRef } from 'react';
import { ThreeViewer, ThreeViewerHandle } from 'threejs-viewer';

function App() {
  const viewerRef = useRef<ThreeViewerHandle>(null);

  const handleScreenshot = () => {
    if (viewerRef.current?.isReady()) {
      const { renderer } = viewerRef.current.getInstances();
      if (renderer) {
        const dataUrl = renderer.domElement.toDataURL('image/png');
        console.log('截图:', dataUrl);
      }
    }
  };

  const handleGetViewerCore = () => {
    const viewerCore = viewerRef.current?.getViewerCore();
    if (viewerCore) {
      // 访问完整的 ViewerCore API
      console.log('插件系统:', viewerCore.plugins);
    }
  };

  return (
    <>
      <button onClick={handleScreenshot}>截图</button>
      <button onClick={handleGetViewerCore}>获取 ViewerCore</button>
      <ThreeViewer ref={viewerRef} modelUrl="/model.glb" />
    </>
  );
}
```

### 初始化回调（插件注册推荐）

在 ViewerCore 初始化完成、内置插件注册完成、render loop 启动前触发，可用于可靠地注册自定义插件：

```tsx
import { ThreeViewer, CameraMovementPlugin } from 'threejs-viewer';

function App() {
  return (
    <ThreeViewer
      modelUrl="/model.glb"
      onViewerReady={(viewerCore) => {
        if (!viewerCore.plugins.has('CameraMovementPlugin')) {
          viewerCore.plugins.register(new CameraMovementPlugin());
        }
      }}
    />
  );
}
```

### ThreeInstanceContextValue

Hook 返回的上下文值类型：

```ts
interface ThreeInstanceContextValue {
  scene: THREE.Scene | null;        // Three.js 场景
  camera: THREE.PerspectiveCamera | null;  // 透视相机
  renderer: THREE.WebGLRenderer | null;    // WebGL 渲染器
  container: HTMLElement | null;    // 容器 DOM 元素
  isReady: boolean;                 // 是否已初始化
  isDisposed: boolean;              // 是否已销毁
}
```

### ThreeViewerHandle

Ref 暴露的方法：

```ts
interface ThreeViewerHandle {
  getInstances(): ThreeInstanceContextValue;  // 获取所有实例
  getViewerCore(): ViewerCore | null;         // 获取 ViewerCore
  isReady(): boolean;                         // 检查是否就绪
  isDisposed(): boolean;                      // 检查是否已销毁
}
```

## 使用核心类（高级）

如需更多控制，可以直接使用核心类：

```tsx
import { ViewerCore, ModelLoaderPlugin, OrbitControlsPlugin } from 'threejs-viewer';

const viewer = new ViewerCore();
viewer.initialize({ container: document.getElementById('viewer')! });

const modelLoader = new ModelLoaderPlugin();
const orbitControls = new OrbitControlsPlugin();

viewer.plugins.register(modelLoader);
viewer.plugins.register(orbitControls);

viewer.start();

// 加载模型
const result = await modelLoader.load('/model.glb');
orbitControls.setTarget(result.center);

// 完成后清理
viewer.dispose();
```

## 开发

### 安装依赖

```bash
npm install
```

### 运行演示

```bash
npm run dev:demo
```

在 http://localhost:3000 打开演示应用

### 运行测试

```bash
npm run test:run
```

### 构建库

```bash
npm run build:lib
```

输出到 `dist/` 目录：
- `threejs-viewer.mjs` (ESM)
- `threejs-viewer.cjs` (CommonJS)
- 类型声明文件 (`.d.ts`)

## 项目结构

```
src/
├── components/
│   └── ThreeViewer.tsx    # 主 React 组件
├── context/
│   ├── ThreeInstanceContext.ts   # 实例访问 Context
│   └── ThreeInstanceProvider.tsx # Context Provider
├── core/
│   ├── ViewerCore.ts      # 核心引擎
│   ├── SceneManager.ts    # 场景管理
│   ├── CameraManager.ts   # 相机管理
│   ├── RenderManager.ts   # 渲染器管理
│   └── PluginSystem.ts    # 插件系统
├── hooks/
│   └── useThreeInstance.ts # 实例访问 Hook
├── plugins/
│   ├── ModelLoaderPlugin.ts   # GLTF 模型加载
│   └── OrbitControlsPlugin.ts # 轨道控制
├── types/
│   └── instance.ts        # 实例访问类型定义
└── index.ts               # 库导出

demo/
├── App.tsx                # 演示应用
├── main.tsx               # 演示入口
└── index.html             # 演示 HTML
```

## API 参考

### ThreeViewer 组件

用于显示 3D 模型的主 React 组件。

### ViewerCore

协调所有子系统的核心引擎。

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

处理 GLTF/GLB 模型加载。

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

提供相机轨道控制。

```ts
interface OrbitControlsPlugin {
  controls: OrbitControls;
  
  configure(config: OrbitControlsConfig): void;
  setTarget(target: Vector3): void;
  setZoomLimits(min: number, max: number): void;
  reset(): void;
}
```

### useThreeInstance

获取 Three.js 实例的 React Hook。

```ts
function useThreeInstance(): ThreeInstanceContextValue;
// 必须在 ThreeViewer 子组件中使用，否则抛出错误
```

### ThreeViewerHandle

通过 ref 暴露的命令式 API。

```ts
interface ThreeViewerHandle {
  getInstances(): ThreeInstanceContextValue;
  getViewerCore(): ViewerCore | null;
  isReady(): boolean;
  isDisposed(): boolean;
}
```

## 对等依赖

- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `three` >= 0.150.0

## 许可证

MIT
