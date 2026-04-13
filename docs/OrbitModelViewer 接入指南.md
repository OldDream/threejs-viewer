# OrbitModelViewer 接入指南

本文档旨在指导第三方开发者如何以 `Demo3` 的形式接入并使用 `OrbitModelViewer` 组件。该组件为高层封装，专门面向需要沿特定轴线观察、具有固定“适配（Fit）”距离测算策略，并支持自动旋转的 3D 模型预览场景。

## 1. 基础挂载

引入 `OrbitModelViewer` 及相关的类型声明，并最少提供 `model` 参数及容器的宽高样式即可渲染模型。该组件内部默认使用 "fit" 距离策略，保证多角度观察下模型不会超出视野。

```tsx
import React, { useRef } from 'react';
import { OrbitModelViewer, type ModelViewerHandle, type ModelViewerModel } from 'threejs-viewer';

export function My3DViewer() {
  const viewerRef = useRef<ModelViewerHandle>(null);
  
  const model: ModelViewerModel = {
    type: 'url',
    url: 'https://example.com/path/to/model.gltf'
  };

  return (
    <div style={{ width: '800px', height: '600px' }}>
      <OrbitModelViewer
        ref={viewerRef}
        model={model}
        backgroundColor={0x545454}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
```

## 2. 核心控制参数 (Props)

`OrbitModelViewer` 提供了一组业务友好的属性（基于世界坐标轴定义），使得同一组参数能在不同尺寸的模型上产生表现一致的观察姿态。

### 姿态与视角设置

*   **`orbitAxis`**: `'x' | 'y' | 'z'`
    *   定义相机绕其旋转的主轨道轴。默认为 `'y'`（绕 Y 轴即垂直方向旋转）。
*   **`axisAngleDeg`**: `number` (0-180 范围内)
    *   相机视线与旋转轴 `orbitAxis` 的夹角（度数）。
    *   越接近 0，则越处于主轴正方向俯视/平视。一般 60 - 90 之间为较佳的斜俯视角度。
*   **`initialPhaseDeg`**: `number` (0-360 范围内)
    *   相机的初始相位角（度数）。
    *   定义初始加载或切换时，相机所处的环面方位。

### 距离策略 (Fit 算法)

组件内部强制采用了稳定的 **Fit** 策略，即沿着轨道模拟运行一整圈，找出一个即使发生旋转也不会超出视野的最安全摄像机距离。由于采用了单一固定策略，开发者不需要处理复杂的距离换算。

*   **`fitPadding`**: `number` (默认推荐为 1.15 等)
    *   视图留白系数。值为 `1` 时模型将紧贴画布边界，设置为 `1.15` 表示预留 15% 的边缘空隙。

### 自动旋转

*   **`autoRotate`**: `boolean`
    *   是否开启自动绕轴旋转。
*   **`rotationSpeedDegPerSec`**: `number`
    *   旋转速度。正负值决定旋转方向，单位为度/秒。例如 `15` (表示每秒转过 15 度)。

## 3. 回调与事件处理

你可以通过相关的生命周期与交互事件来监听模型的加载情况或执行其他业务逻辑。

```tsx
<OrbitModelViewer
  // ... 其他属性
  onLoad={(result) => {
    // 模型加载成功，可从 result 中获取模型相关的底层信息
    console.log('加载成功!', result);
  }}
  onError={(error, context) => {
    // 模型加载或解析过程中发生错误
    console.error(`在 [${context.stage}] 阶段发生错误: ${error.message}`);
  }}
  onLoadingChange={(isLoading) => {
    // 监听加载中状态，用于同步 UI 的 Loading 蒙层使用
  }}
  onViewerReady={() => {
    // Viewer 的基础环境（如 Renderer / Camera）以及 canvas 容器初始化完毕的回调
  }}
/>
```

## 4. 获取即时状态与指标参数

通过对 `OrbitModelViewer` 传递 `ref` 引用，可以调用内部暴露的方法（`ModelViewerHandle` 接口），实时获取相机数据及轨道等状态：

```tsx
const handle = viewerRef.current;
if (handle) {
  // 当前相机焦点到模型包围盒中心的直线距离
  const currentDist = handle.getCameraDistanceToModelCenter();
  
  // 获取按照当前给定的轨道配置参数，所计算出的理论最佳 Fit 安全距离
  const recommendedDist = handle.getRecommendedOrbitDistance({
    axis: 'y',
    axisAngleDeg: 60,
    phaseDeg: 45,
    padding: 1.15,
  });
}
```

## 5. 完整整合示例 (与 Demo3 类似)

下面是一个可以直接在你的页面中使用的完整封装组件示例。它呈现了类似于 Demo3 的核心加载、旋转轨道预设及事件处理机制：

```tsx
import React, { useRef, useState } from 'react';
import { OrbitModelViewer, type ModelViewerHandle } from 'threejs-viewer';

export default function IntegrationExample() {
  const viewerRef = useRef<ModelViewerHandle>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', backgroundColor: '#e5e5e5' }}>
      
      {/* 业务方实现的自定义 Loading 占位 */}
      {isLoading && (
        <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, color: '#333' }}>
          模型资源请求中，请稍候...
        </div>
      )}
      
      <OrbitModelViewer
        ref={viewerRef}
        model={{ type: 'url', url: '/your-model-path.gltf' }}
        orbitAxis="y"
        axisAngleDeg={60}
        initialPhaseDeg={45}
        autoRotate={true}
        rotationSpeedDegPerSec={15}
        fitPadding={1.15}
        backgroundColor={0x545454}
        grid={{ visible: false, size: 20, divisions: 20, plane: 'XZ' }}
        style={{ width: '100%', height: '100%' }}
        onLoadingChange={setIsLoading}
        onLoad={(result) => console.log('初始化/预加载完毕:', result)}
        onError={(err, ctx) => console.error('加载异常:', ctx.stage, err)}
      />
      
    </div>
  );
}
```
