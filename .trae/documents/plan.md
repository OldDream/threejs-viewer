## 目标

将 Demo 里“相机路径（Camera Path）/镜头运动”能力抽成可复用的组件（给其他项目直接用），并在 Demo 增加两类导入能力：

1. 导入 Demo 导出的 camera path JSON，驱动相机按路径运动，可选 loop。
2. 不导入路径时，导入“初始相机视角/位置”JSON，让相机以指定角度与距离观察模型（Demo 需新增导出该 JSON 的能力）。

## 现状梳理（基于代码库）

* 路径导入/导出与编辑：`CameraPathDesignerPlugin` 已实现 `exportShot()/importShot()`，并带 legacy 兼容（无 segments 时会推导每段时长）。

* 路径播放：`CameraPathAnimationPlugin` 支持 `pathPoints/segments/defaults/duration/loop`，并在播放时禁用 OrbitControls 以避免冲突。

* Demo 已有 Shot JSON 的 Copy/Import UI（`ShotJsonModal.tsx`）与编辑器联动（`useCameraPathDesigner.ts`）。

因此：路径 JSON 的格式可以直接沿用现有 “Shot” 结构；需要补的是“初始相机视角（View Preset）”的 JSON 规范、导入/导出、以及一个对外可复用的封装组件。

## 总体设计

新增一个对外组件（以及配套类型与纯函数工具），实现“二选一”的镜头控制：

* 若提供 `cameraShot`（路径 JSON），则注册并配置 `CameraPathAnimationPlugin` 来播放。

* 若未提供 `cameraShot` 但提供 `cameraViewPreset`（初始视角 JSON），则应用相机姿态（优先使用 OrbitControls 的 target + spherical 表达）。

同时在 Demo 中新增：

* “导出当前相机视角”按钮：生成 `cameraViewPreset` JSON（可复制/下载）。

* “导入相机视角”入口：粘贴/上传 JSON，并一键应用。

* “导入路径 JSON + loop 开关”入口：粘贴/上传 Shot JSON；允许覆盖 shot 内的 loop。

## 对外 API（库侧）设计

### 1) Camera Shot（沿用现有格式）

保持与 `CameraPathDesignerPlugin.exportShot()` 产物一致（不做 legacy 兼容）。对外暴露：

* `type CameraShot = CameraPathDesignerShot`
- `parseCameraShot(json: string | unknown): CameraShot`（带字段校验；缺字段直接报错）
* `parseCameraShot(json: string | unknown): CameraShot`（带字段校验 + legacy 兼容归一化）

* `toCameraPathAnimationConfig(shot: CameraShot, options?: { loop?: boolean }): CameraPathAnimationConfig`

说明：
- 不兼容旧 JSON：例如缺 `segments`、字段类型不匹配等，直接提示“请使用 Demo 导出的 JSON”。

### 2) Camera View Preset（新增格式）

目标是让“从某个角度和距离看模型”具有可编辑性与可移植性。建议 v1 采用 Orbit 语义：

```ts
type CameraViewPresetV1 = {
  version: 1;
  kind: 'orbit';
  target: { x: number; y: number; z: number };
  spherical: { radius: number; phi: number; theta: number };
  up?: { x: number; y: number; z: number };
  targetMode?: 'world' | 'modelCenter';
  radiusMode?: 'absolute' | 'relativeToModelRadius';
};
```

规则：

* `targetMode`：

  * `world`：直接使用 `target`

  * `modelCenter`：以模型中心为 target（忽略 preset.target），用于跨模型复用

* `radiusMode`：

  * `absolute`：直接使用 spherical.radius

  * `relativeToModelRadius`：radius 表示“模型半径的倍数”（需要能拿到 model bounding sphere / bbox），更适合跨模型复用

对外暴露：

* `type CameraViewPreset = CameraViewPresetV1`

* `exportCameraViewPreset(viewer: { camera: THREE.PerspectiveCamera; orbitControls?: OrbitControls }, options?: { modelRadius?: number }): CameraViewPreset`

* `applyCameraViewPreset(viewer: { camera: THREE.PerspectiveCamera; orbitControls?: OrbitControls }, preset: CameraViewPreset, options?: { modelCenter?: THREE.Vector3; modelRadius?: number }): void`

实现要点：

* 优先使用 OrbitControls：设置 `controls.target`，根据 spherical 反推相机 position，然后 `controls.update()`。

* 若没有 OrbitControls：退化为 `camera.position` + `camera.lookAt(target)`（不保证与 orbit 交互完全一致，但可用）。

## 新组件（库侧）设计

新增一个“封装组件”，尽量做到外部接入简单、无 Demo 依赖：

### `CameraScriptController`（React 组件）

职责：

* 通过 `viewerRef` 拿到 `ViewerCore`，确保依赖插件存在（需要 `OrbitControlsPlugin` 时做软依赖）。
- 支持在“相机路径”与“初始视角”之间动态切换：
  - 切到路径：配置 `CameraPathAnimationPlugin` 并按需播放
  - 切到初始视角：停止路径播放并恢复 OrbitControls，然后应用 preset
  - 切到 none：停止路径播放（不主动改相机）
  * 如果传入 `cameraShotJson/cameraShot`：解析 → 归一化 → 映射到 `CameraPathAnimationPlugin.configure()`，并按需 `play()`。

  * 否则如果传入 `cameraViewPresetJson/cameraViewPreset`：解析 → 应用 preset（必要时从 `ModelLoaderPlugin` 获取 modelCenter / bounding 信息）。

- `mode?: 'shot' | 'preset' | 'none'`（默认 'none'，由外部 UI 决定当前控制权）
- `cameraShotJson?: string` / `cameraShot?: CameraShot`（mode='shot' 时生效）

* `viewerRef: RefObject<ThreeViewerHandle | null>`
- `cameraViewPresetJson?: string` / `cameraViewPreset?: CameraViewPreset`（mode='preset' 时生效）
* `cameraShotJson?: string` / `cameraShot?: CameraShot`

约束与优先级：

- 控制权以 `mode` 为准（显式优于隐式），避免“传了两个值不知道用哪个”的歧义。
- 播放时复用 `CameraPathAnimationPlugin` 的 OrbitControls 冲突处理逻辑。

导出路径：

* 在 `src/index.ts` 中导出：组件、类型、parse/apply/export 工具函数。

## Demo 侧改动（仅 UI/交互，不改变核心库行为）

### 1) 增加“导出/导入相机视角”面板

新增一个 Modal 或 Floating Panel（风格对齐 `ShotJsonModal.tsx`）：

* Export：读取当前 `camera + orbitControls`，生成 `CameraViewPreset` JSON，显示在文本框并支持 Copy。

* Import：粘贴 JSON → 校验 → 保存到 state → 调用 `CameraScriptController` 或直接调用 `applyCameraViewPreset` 应用。

### 2) 路径 JSON 导入体验增强

在现有 Shot JSON Modal 基础上补：

* 支持从文件上传 JSON（可选）

* loop 开关：默认沿用 shot.loop；用户可勾选覆盖（即传给 `CameraScriptController.loop`）

### 3) 接线方式

Demo 顶层负责：

* 维护 `loadResult`（已有）用于提供 modelCenter/modelRadius

- 维护 `mode`（shot/preset/none）并允许用户动态切换
- 将这些状态传给 `CameraScriptController`

## DEMO2（在现有 Demo 内新增路由页面）

目标：提供一个“最小可复用示例”，演示其他项目如何接入本库新增组件，不依赖路径编辑器 UI。

功能形态：

- 左侧控制区（变量面板）：
  - 模型导入：复用 demo 的 URL 输入与加载逻辑（或抽出共用组件）
  - `mode` 切换：shot / preset / none
  - `cameraShot` 输入：Textarea（粘贴 JSON）+ 文件上传（可选）
  - `cameraViewPreset` 输入：Textarea（粘贴 JSON）+ 文件上传（可选）
  - `loop` 与 `autoPlay` 开关（mode=shot 时可用）
- 右侧：`ThreeViewer` + `CameraScriptController`

路由实现建议（不新增依赖）：

- 采用 hash 路由（`window.location.hash`）实现 2 页切换，避免引入 `react-router-dom`：
  - `#/`：现有 demo（保留完整编辑器、时间轴等）
  - `#/demo2`：新页面（最小示例）
- 不新增任何导航按钮；通过手动输入 URL hash 访问：
  - `http://localhost:3000/#/`（现有 demo）
  - `http://localhost:3000/#/demo2`（demo2）

这样可以保证：

- demo 保持现有“编辑器/时间轴”展示；
- demo2 专注“外部项目如何使用 CameraScriptController + 两种 JSON 输入”的教程式体验。

## 代码组织（预期新增/调整的文件）

库侧（`src/`）：

* 新增 `src/camera/`（或 `src/plugins/` 下的工具文件）：

  * `CameraShotIO.ts`：parse/normalize/convert（复用现有 shot legacy 规则）

  * `CameraViewPreset.ts`：preset 类型 + export/apply 纯函数

* 新增 `src/components/CameraScriptController.tsx`

* 更新 `src/index.ts`：导出上述能力

Demo 侧（`demo/`）：

* 新增一个 modal/panel：`demo/components/panels/CameraViewPresetModal.tsx`（命名可调整）

* 可能新增一个 hook：`demo/hooks/useCameraViewPreset.ts`（管理导入/导出/状态）

* 轻量改造 `CameraAnimationControl.tsx` 或侧边栏控制区：把新入口挂进去

## 测试与验证

新增/补充单测（vitest）：

- `CameraShotIO`：覆盖正常 JSON 的校验与 shot→animationConfig 映射（不测 legacy）。

* `CameraViewPreset`：spherical ↔ position 的往返误差、radiusMode/targetMode 的分支。
  - mode 切换时能停止/恢复与正确应用
  - loop 覆盖生效
* `CameraScriptController`：最小集成测试（mock viewerRef + plugin 注册），验证：

手动验证（Demo）：

* 导出 shot JSON → 刷新页面 → 导入 → 播放一致

* 导出 view preset → 刷新页面 → 导入 → 相机复位一致

* 更换模型后（同一页面）在 `targetMode=modelCenter` 下 view preset 仍能稳定看向模型

## 风险与约束

* 当前 `useThreeInstance` 不暴露 `ViewerCore`，新封装组件需要依赖 `viewerRef` 或 `onViewerReady` 传入 `ViewerCore`。计划采用 `viewerRef`（与 Demo hooks 已一致）。

* “相机视角”的可移植性与精确还原存在权衡：v1 以 OrbitControls 的 `target + spherical` 为主，优先满足“角度+距离可编辑”。若未来需要 roll/相机 up 约束或更复杂镜头语言，可在 version 2 扩展字段。

## 执行顺序（实现时按此落地）

1. 抽离/新增 `CameraShotIO`：从现有 shot 导入导出逻辑中提炼归一化规则，提供 shot→animationConfig 映射。
2. 新增 `CameraViewPreset`：定义 JSON schema + export/apply 纯函数。
3. 新增 `CameraScriptController`：对外组件，打通 shot 播放与 preset 应用两条路径。
4. Demo 增加 view preset 的导入/导出 UI，并接入 `CameraScriptController`。
5. 增加单测与 Demo 手测脚本，确保兼容与功能闭环。
