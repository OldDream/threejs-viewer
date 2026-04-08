# Three.js Viewer

一个模块化的 Three.js 3D 模型查看器 React 组件库。支持 GLTF/GLB 模型加载、轨道控制、相机脚本动画、相机路径设计器等功能。

## 特性

- 🎨 **React 组件** - 易用的 `<ThreeViewer />` 与 `<ModelViewer />` 组件，覆盖底层控制和开箱即用场景
- � **相机脚本控制器** - `<CameraScriptController />` 组件，支持 Shot 动画和 View Preset 应用
- �📦 **GLTF/GLB 支持** - 加载 GLTF 和 GLB 格式的 3D 模型，含动画播放
- 🎮 **轨道控制** - 旋转、缩放和平移模型
- 🎬 **相机路径动画** - 支持多段相机路径动画，可配置插值和缓动
- ✏️ **相机路径设计器** - 可视化设计相机运动路径
- � **网格辅助** - 可配置的 XY/XZ/YZ 平面网格和坐标轴
- �🔌 **插件架构** - 可扩展的设计，支持自定义功能
- 📱 **响应式** - 自动处理容器尺寸变化
- 🧹 **内存安全** - 正确清理 Three.js 资源
- 🔗 **实例访问 API** - 通过 Hook 或 Ref 访问底层 Three.js 实例

## 安装

```bash
npm install threejs-viewer three react react-dom
```

## 快速开始

### 基础用法

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

### 推荐用法：ModelViewer

`ModelViewer` 是面向业务接入的高层组件，直接接收 `model + cameraScript` 两组参数，内部会自动处理本地文件解析、模型加载和相机脚本接入。

```tsx
import { ModelViewer } from 'threejs-viewer';

function App() {
  return (
    <ModelViewer
      model={{ type: 'url', url: 'https://example.com/model.glb' }}
      cameraScript={{ mode: 'none' }}
      grid={{ visible: true, size: 20, divisions: 20, plane: 'XZ', showAxes: true }}
      style={{ width: '100%', height: '500px' }}
    />
  );
}
```

### 使用 CameraScriptController（高封装方式）

`CameraScriptController` 是一个无渲染组件，将**相机 Shot 动画**和**相机视角预设**的完整逻辑封装在内部。只需传入 JSON 配置即可驱动相机行为，无需手动管理插件或订阅事件——适合需要快速集成相机控制的场景。

```tsx
import { useRef, useState } from 'react';
import {
  ThreeViewer,
  CameraScriptController,
  type CameraScriptMode,
  type ThreeViewerHandle,
  type ModelLoadResult,
} from 'threejs-viewer';

function App() {
  const viewerRef = useRef<ThreeViewerHandle>(null);
  const [modelCenter, setModelCenter] = useState<THREE.Vector3 | undefined>();

  const handleLoad = (result: ModelLoadResult) => {
    setModelCenter(result.center);
  };

  // Shot JSON: 定义相机路径动画的关键帧
  const cameraShotJson = JSON.stringify({
    version: 1,
    defaults: { interpolation: 'catmullRom', easing: { type: 'easeInOut' } },
    keyframes: [
      { position: [5, 3, 5], target: [0, 0, 0], duration: 2 },
      { position: [-5, 3, 5], target: [0, 0, 0], duration: 2 },
    ],
  });

  // Preset JSON: 定义固定视角
  const cameraViewPresetJson = JSON.stringify({
    version: 1,
    position: { r: 2.5, theta: 45, phi: 45, mode: 'spherical' },
    target: { x: 0, y: 0, z: 0, relativeTo: 'world' },
  });

  return (
    <>
      <ThreeViewer
        ref={viewerRef}
        modelUrl="/model.glb"
        grid={{ visible: true, size: 20, divisions: 20, plane: 'XZ', showAxes: true }}
        onLoad={handleLoad}
        style={{ width: '100%', height: '500px' }}
      />
      <CameraScriptController
        viewerRef={viewerRef}
        mode="shot"                       // 'shot' | 'preset' | 'none'
        cameraShotJson={cameraShotJson}    // Shot 模式配置
        cameraViewPresetJson={cameraViewPresetJson}  // Preset 模式配置
        loop={true}
        autoPlay={true}
        modelCenter={modelCenter}
        onError={(error) => console.error(error)}
      />
    </>
  );
}
```

## ModelViewer 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `model` | `ModelViewerModel \| null` | 模型来源，支持 URL、本地单文件和本地文件夹 |
| `cameraScript` | `ModelViewerCameraScript` | 相机脚本，支持 `none`、`shot`、`preset` |
| `grid` | `GridConfig` | 网格和坐标轴辅助线配置 |
| `pivotPoint` | `{ x, y, z }` | 自定义旋转中心点 |
| `zoomLimits` | `{ min?, max? }` | 相机缩放距离限制 |
| `backgroundColor` | `number \| string` | 场景背景色 |
| `className` | `string` | 容器的 CSS 类名 |
| `style` | `CSSProperties` | 容器的内联样式 |
| `onLoad` | `(result: ModelLoadResult) => void` | 模型加载成功时的回调 |
| `onLoadingChange` | `(loading: boolean) => void` | 模型源准备或加载状态变化时的回调 |
| `onError` | `(error: Error, context: { stage }) => void` | 错误回调，`stage` 为 `model-source`、`model-load` 或 `camera-script` |
| `ref` | `Ref<ThreeViewerHandle>` | 可选，转发到底层 `ThreeViewer` 的命令式句柄 |

## ThreeViewer 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `modelUrl` | `string` | 要加载的 GLTF/GLB 模型 URL |
| `pivotPoint` | `{ x, y, z }` | 自定义旋转中心点 |
| `zoomLimits` | `{ min?, max? }` | 相机缩放距离限制 |
| `grid` | `GridConfig` | 网格和坐标轴辅助线配置 |
| `backgroundColor` | `number \| string` | 场景背景色（十六进制数值或 CSS 颜色字符串） |
| `className` | `string` | 容器的 CSS 类名 |
| `style` | `CSSProperties` | 容器的内联样式 |
| `onLoad` | `(result: ModelLoadResult) => void` | 模型加载成功时的回调 |
| `onError` | `(error: Error) => void` | 发生错误时的回调 |
| `onLoadingChange` | `(isLoading: boolean) => void` | 加载状态变化时的回调 |
| `onViewerReady` | `(viewerCore: ViewerCore) => void` | ViewerCore 初始化完成后的回调 |
| `children` | `ReactNode` | 子组件，可使用 `useThreeInstance` Hook |
| `ref` | `Ref<ThreeViewerHandle>` | 用于命令式访问 Three.js 实例 |

### GridConfig

```ts
interface GridConfig {
  visible?: boolean;    // 是否显示网格
  size?: number;        // 网格大小
  divisions?: number;   // 网格分割数
  plane?: 'XY' | 'XZ' | 'YZ';  // 网格所在平面
  showAxes?: boolean;   // 是否显示坐标轴（RGB = XYZ）
}
```

## CameraScriptController 属性

`CameraScriptController` 是一个无渲染的 React 组件，用于声明式地驱动相机行为。它内部自动完成插件注册、JSON 解析和状态管理。

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `viewerRef` | `RefObject<ThreeViewerHandle>` | 必填 | ThreeViewer 的 ref 引用 |
| `mode` | `'shot' \| 'preset' \| 'none'` | `'none'` | 相机脚本模式 |
| `cameraShotJson` | `string` | - | Shot 模式：相机路径动画的 JSON 配置 |
| `cameraShot` | `CameraShot` | - | Shot 模式：相机路径动画的对象配置（与 JSON 二选一） |
| `loop` | `boolean` | - | Shot 模式：是否循环播放 |
| `autoPlay` | `boolean` | `true` | Shot 模式：是否自动播放 |
| `cameraViewPresetJson` | `string` | - | Preset 模式：视角预设的 JSON 配置 |
| `cameraViewPreset` | `CameraViewPreset` | - | Preset 模式：视角预设的对象配置（与 JSON 二选一） |
| `applyViewWhen` | `'immediate' \| 'afterModelLoaded'` | `'afterModelLoaded'` | Preset 模式：何时应用视角预设 |
| `modelCenter` | `THREE.Vector3` | - | 模型中心点（用于相对定位） |
| `modelRadius` | `number` | - | 模型包围球半径（用于距离计算） |
| `onError` | `(error: Error) => void` | - | 错误回调 |

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

### 网格和坐标轴

```tsx
<ThreeViewer
  modelUrl="/model.glb"
  grid={{
    visible: true,
    size: 20,
    divisions: 20,
    plane: 'XZ',
    showAxes: true,
  }}
/>
```

### 自定义背景色

```tsx
<ThreeViewer
  modelUrl="/model.glb"
  backgroundColor={0x1a1a2e}
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
  scene: THREE.Scene | null;              // Three.js 场景
  camera: THREE.PerspectiveCamera | null;  // 透视相机
  renderer: THREE.WebGLRenderer | null;    // WebGL 渲染器
  container: HTMLElement | null;           // 容器 DOM 元素
  isReady: boolean;                        // 是否已初始化
  isDisposed: boolean;                     // 是否已销毁
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

## 插件系统

库提供以下内置插件，均可独立注册和使用：

| 插件 | 描述 |
|------|------|
| `ModelLoaderPlugin` | GLTF/GLB 模型加载与管理 |
| `ModelAnimationPlugin` | 模型骨骼动画播放控制 |
| `OrbitControlsPlugin` | 相机轨道控制（旋转、缩放、平移） |
| `GridHelperPlugin` | 网格辅助线和坐标轴显示 |
| `CameraMovementPlugin` | 键盘驱动的自由相机移动（FPS 风格） |
| `CameraPathAnimationPlugin` | 多段相机路径动画（支持插值、缓动配置） |
| `CameraPathDesignerPlugin` | 可视化相机路径设计器（编辑模式、实时预览） |

### 自定义插件示例

```ts
import { type Plugin, type PluginContext } from 'threejs-viewer';

class MyCustomPlugin implements Plugin {
  name = 'MyCustomPlugin';

  initialize(context: PluginContext): void {
    // 可访问 scene, camera, renderer
    console.log('插件已初始化', context.scene);
  }

  dispose(): void {
    // 清理资源
  }
}
```

## 相机工具函数

### CameraShotIO

相机 Shot 的序列化/反序列化工具：

```ts
import { parseCameraShot, toCameraPathAnimationConfig } from 'threejs-viewer';

// 解析 JSON 字符串为 CameraShot 对象
const shot = parseCameraShot(jsonString);

// 转换为 CameraPathAnimationPlugin 配置
const config = toCameraPathAnimationConfig(shot, { loop: true });
```

### CameraViewPreset

相机视角预设的导入/导出/应用：

```ts
import {
  parseCameraViewPreset,
  exportCameraViewPreset,
  applyCameraViewPreset,
} from 'threejs-viewer';

// 从当前相机导出视角预设
const preset = exportCameraViewPreset(
  { camera, orbitControls },
  { modelRadius, radiusMode: 'absolute', targetMode: 'world' }
);

// 解析 JSON 字符串为 CameraViewPreset 对象
const parsed = parseCameraViewPreset(jsonString);

// 将预设应用到相机
applyCameraViewPreset(
  { camera, orbitControls },
  parsed,
  { modelCenter, modelRadius }
);
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

在 http://localhost:3000 打开演示应用。

演示包含两个页面（通过 URL hash 切换）：

- **Demo1**（默认，`#/`）— 完整功能展示，包含所有控制面板（模型加载、旋转中心、缩放限制、网格控制、模型动画、相机动画/路径设计器、视角预设弹窗等）
- **Demo2**（`#/demo2`）— 高层 `ModelViewer` 示例页，展示如何用 `model + cameraScript` 组合 URL、本地文件、本地文件夹和相机脚本

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
src/                              # 库源码
├── components/
│   ├── ThreeViewer.tsx            # 主 React 组件
│   └── CameraScriptController.tsx # 相机脚本控制器组件
├── context/
│   ├── ThreeInstanceContext.ts    # 实例访问 Context
│   └── ThreeInstanceProvider.tsx  # Context Provider
├── core/
│   ├── ViewerCore.ts             # 核心引擎
│   ├── SceneManager.ts           # 场景管理
│   ├── CameraManager.ts          # 相机管理
│   ├── RenderManager.ts          # 渲染器管理
│   └── PluginSystem.ts           # 插件系统
├── hooks/
│   └── useThreeInstance.ts       # 实例访问 Hook
├── plugins/
│   ├── ModelLoaderPlugin.ts      # GLTF 模型加载
│   ├── ModelAnimationPlugin.ts   # 模型动画播放
│   ├── OrbitControlsPlugin.ts    # 轨道控制
│   ├── GridHelperPlugin.ts       # 网格辅助线
│   ├── CameraMovementPlugin.ts   # 键盘自由相机移动
│   ├── CameraPathAnimationPlugin.ts  # 相机路径动画
│   └── CameraPathDesignerPlugin.ts   # 相机路径设计器
├── camera/
│   ├── CameraShotIO.ts           # Shot 序列化/反序列化
│   └── CameraViewPreset.ts      # 视角预设工具
├── types/
│   └── instance.ts               # 实例访问类型定义
├── utils/                        # 通用工具函数
└── index.ts                      # 库导出入口

demo/                             # 演示应用
├── main.tsx                      # 演示入口
├── App.refactored.tsx            # 主应用（含 Demo1 和路由）
├── pages/
│   └── Demo2.tsx                 # 高封装演示页面
├── components/
│   ├── DemoLayout.tsx            # 布局框架
│   ├── DemoHeader.tsx            # 顶部栏
│   ├── DemoSidebar.tsx           # 侧边栏容器
│   ├── DemoViewer.tsx            # Viewer 包装组件
│   ├── index.ts                  # 组件导出
│   ├── controls/                 # 控制面板组件
│   │   ├── ModelUrlControl.tsx
│   │   ├── PivotPointControl.tsx
│   │   ├── ZoomLimitsControl.tsx
│   │   ├── GridControl.tsx
│   │   ├── ModelAnimationControl.tsx
│   │   ├── CameraModeControl.tsx
│   │   ├── CameraMovementControl.tsx
│   │   ├── CameraAnimationControl.tsx
│   │   ├── CameraPathDesignerControl.tsx
│   │   ├── CameraViewPresetControl.tsx
│   │   ├── ControlSection.tsx
│   │   ├── StatusDisplay.tsx
│   │   └── ControlsInstructions.tsx
│   └── panels/                   # 面板组件
│       ├── CameraPathEditorPanel.tsx
│       ├── CameraPathEditorFloatingWindow.tsx
│       ├── CameraViewPresetModal.tsx
│       ├── TimelineEditor.tsx
│       ├── SegmentInspector.tsx
│       ├── TransportBar.tsx
│       ├── ShotJsonModal.tsx
│       └── Tabs.tsx
├── hooks/                        # 演示自定义 Hooks
│   ├── useModelLoader.ts
│   ├── useModelAnimation.ts
│   ├── usePivotControl.ts
│   ├── useZoomControl.ts
│   ├── useGridControl.ts
│   ├── useCameraMovement.ts
│   ├── useCameraAnimation.ts
│   ├── useCameraPathDesigner.ts
│   ├── useDockablePanelState.ts
│   └── index.ts
└── styles/
    └── theme.ts                  # 主题样式
```

## API 参考

### ThreeViewer 组件

用于显示 3D 模型的主 React 组件。详见[属性表](#threeviewer-属性)。

### CameraScriptController 组件

无渲染相机脚本控制器。详见[属性表](#camerascriptcontroller-属性)。

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
  cancel(): void;
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

### CameraPathAnimationPlugin

多段相机路径动画控制。

```ts
interface CameraPathAnimationPlugin {
  configure(config: CameraPathAnimationConfig): void;
  play(): void;
  stop(): void;
  setOrbitControlsPlugin(plugin: IOrbitControlsPlugin): void;
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
