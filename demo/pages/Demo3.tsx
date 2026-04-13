import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type ModelLoadResult,
  type ModelViewerCameraScript,
  type ModelViewerErrorContext,
  type ModelViewerHandle,
  type ModelViewerModel,
  ModelViewer,
} from '../../src';
import { DemoLayout, DemoMain } from '../components/DemoLayout';
import { DemoHeader } from '../components/DemoHeader';
import { DemoSidebar } from '../components/DemoSidebar';
import { ControlSection } from '../components/controls/ControlSection';
import { ModelUrlControl } from '../components/controls/ModelUrlControl';
import { ModelAnimationControl } from '../components/controls/ModelAnimationControl';
import { StatusDisplay } from '../components/controls/StatusDisplay';
import { ControlsInstructions } from '../components/controls/ControlsInstructions';
import { colors, spacing, styles as themeStyles, typography } from '../styles/theme';
import { useModelAnimation } from '../hooks/useModelAnimation';
import type { FileState } from '../hooks/useModelLoader';

const DEFAULT_MODEL_URL =
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/refs/heads/main/2.0/DamagedHelmet/glTF/DamagedHelmet.gltf';

const INITIAL_FILE_STATE: FileState = {
  selectedModelFile: null,
  selectedTextureFiles: [],
  isLocalFile: false,
  selectedFolderFiles: [],
  isFolderMode: false,
};

type OrbitDistanceMode = 'absolute' | 'relativeToModelRadius' | 'fit';
type OrbitAxis = 'x' | 'y' | 'z';

const styles = {
  viewerColumn: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  } as React.CSSProperties,

  viewerArea: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
  } as React.CSSProperties,

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
    marginBottom: spacing.md,
  } as React.CSSProperties,

  inlineGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: spacing.sm,
  } as React.CSSProperties,

  axisButtons: {
    display: 'flex',
    gap: spacing.sm,
  } as React.CSSProperties,

  valueRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: spacing.sm,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  } as React.CSSProperties,

  metricCard: {
    padding: spacing.md,
    borderRadius: '6px',
    backgroundColor: colors.background.input,
    border: `1px solid ${colors.border.primary}`,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  } as React.CSSProperties,

  metricValue: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  } as React.CSSProperties,

  helpText: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    lineHeight: 1.5,
  } as React.CSSProperties,

  textarea: {
    ...themeStyles.input,
    width: '100%',
    minHeight: 180,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: typography.fontSize.xs,
    resize: 'vertical',
  } as React.CSSProperties,
};

function toAppliedModel(inputUrl: string, fileState: FileState): ModelViewerModel | null {
  if (fileState.isFolderMode && fileState.selectedFolderFiles.length > 0) {
    return { type: 'folder', files: fileState.selectedFolderFiles };
  }

  if (fileState.isLocalFile && fileState.selectedModelFile) {
    return {
      type: 'file',
      file: fileState.selectedModelFile,
      ...(fileState.selectedTextureFiles.length > 0
        ? { resources: fileState.selectedTextureFiles }
        : {}),
    };
  }

  const trimmedUrl = inputUrl.trim();
  if (!trimmedUrl) {
    return null;
  }

  return { type: 'url', url: trimmedUrl };
}

function describeModel(model: ModelViewerModel | null): string {
  if (!model) return '';
  if (model.type === 'url') return model.url;
  if (model.type === 'file') return model.file.name;
  return `${model.files.length} files`;
}

export function Demo3() {
  const viewerRef = useRef<ModelViewerHandle>(null);
  const [inputUrl, setInputUrl] = useState(DEFAULT_MODEL_URL);
  const [fileState, setFileState] = useState<FileState>(INITIAL_FILE_STATE);
  const [appliedModel, setAppliedModel] = useState<ModelViewerModel | null>({
    type: 'url',
    url: DEFAULT_MODEL_URL,
  });
  const [axis, setAxis] = useState<OrbitAxis>('y');
  const [axisAngleDeg, setAxisAngleDeg] = useState(60);
  const [phaseDeg, setPhaseDeg] = useState(45);
  const [autoRotate, setAutoRotate] = useState(true);
  const [speedDegPerSec, setSpeedDegPerSec] = useState(15);
  const [distanceMode, setDistanceMode] = useState<OrbitDistanceMode>('fit');
  const [absoluteDistance, setAbsoluteDistance] = useState(6);
  const [relativeDistance, setRelativeDistance] = useState(2.2);
  const [fitPadding, setFitPadding] = useState(1.15);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loadResult, setLoadResult] = useState<ModelLoadResult | null>(null);
  const [currentDistance, setCurrentDistance] = useState<number | null>(null);
  const [recommendedDistance, setRecommendedDistance] = useState<number | null>(null);
  const modelAnimation = useModelAnimation(viewerRef, loadResult);

  /**
   * appliedCameraScript 就是 demo3 最核心的教学点：
   * UI 上的每一个控制项，最终都被翻译成一个可复用的 `cameraScript` 对象。
   * 用户以后把这个对象搬到业务代码里，就能获得同样的相机行为。
   */
  const appliedCameraScript = useMemo<ModelViewerCameraScript>(() => {
    const distance =
      distanceMode === 'absolute'
        ? { mode: 'absolute' as const, value: absoluteDistance }
        : distanceMode === 'relativeToModelRadius'
          ? { mode: 'relativeToModelRadius' as const, value: relativeDistance }
          : { mode: 'fit' as const, padding: fitPadding };

    return {
      mode: 'orbit',
      data: {
        kind: 'axisOrbit',
        axis,
        axisAngleDeg,
        phaseDeg,
        autoRotate,
        speedDegPerSec,
        distance,
      },
    };
  }, [absoluteDistance, autoRotate, axis, axisAngleDeg, distanceMode, fitPadding, phaseDeg, relativeDistance, speedDegPerSec]);

  const previewJson = useMemo(() => JSON.stringify(appliedCameraScript, null, 2), [appliedCameraScript]);

  const refreshMetrics = useCallback(() => {
    const handle = viewerRef.current;
    if (!handle) {
      setCurrentDistance(null);
      setRecommendedDistance(null);
      return;
    }

    setCurrentDistance(handle.getCameraDistanceToModelCenter());
    setRecommendedDistance(
      handle.getRecommendedOrbitDistance({
        axis,
        axisAngleDeg,
        phaseDeg,
        padding: fitPadding,
      })
    );
  }, [axis, axisAngleDeg, fitPadding, phaseDeg]);

  useEffect(() => {
    refreshMetrics();
    const timer = window.setInterval(refreshMetrics, 250);
    return () => window.clearInterval(timer);
  }, [refreshMetrics]);

  const handleInputUrlChange = useCallback((url: string) => {
    setInputUrl(url);
    setError(null);

    if (!url.startsWith('[Local File]') && !url.startsWith('[Local Folder]')) {
      setFileState(INITIAL_FILE_STATE);
    }
  }, []);

  const handleFolderSelect = useCallback((files: File[]) => {
    if (files.length === 0) return;

    setFileState({
      selectedModelFile: null,
      selectedTextureFiles: [],
      isLocalFile: false,
      selectedFolderFiles: files,
      isFolderMode: true,
    });
    setInputUrl(`[Local Folder] ${files.length} files selected`);
    setError(null);
  }, []);

  const handleModelFileSelect = useCallback((file: File) => {
    setFileState({
      selectedModelFile: file,
      selectedTextureFiles: [],
      isLocalFile: true,
      selectedFolderFiles: [],
      isFolderMode: false,
    });
    setInputUrl(`[Local File] ${file.name}`);
    setError(null);
  }, []);

  const handleTextureFilesSelect = useCallback((files: File[]) => {
    setFileState((prev) => ({ ...prev, selectedTextureFiles: files }));
    setError(null);
  }, []);

  const handleLoad = useCallback(() => {
    modelAnimation.stopAndReset();
    setError(null);
    setLoadResult(null);
    setAppliedModel(toAppliedModel(inputUrl, fileState));
  }, [fileState, inputUrl, modelAnimation]);

  const handleLoadSuccess = useCallback((result: ModelLoadResult) => {
    setLoadResult(result);
    setError(null);
    window.requestAnimationFrame(() => {
      refreshMetrics();
    });
  }, [refreshMetrics]);

  const handleViewerError = useCallback((viewerError: Error, context: ModelViewerErrorContext) => {
    setError(new Error(`[${context.stage}] ${viewerError.message}`));
  }, []);

  const handleApplyRecommendedDistance = useCallback(() => {
    if (recommendedDistance === null) {
      return;
    }

    setDistanceMode('absolute');
    setAbsoluteDistance(Number(recommendedDistance.toFixed(3)));
  }, [recommendedDistance]);

  return (
    <DemoLayout>
      <DemoHeader />
      <DemoMain>
        <DemoSidebar>
          <ControlSection title="Demo3 路由">
            <div style={styles.helpText}>
              当前页面路径：#/demo3。这个页面专门演示高层 `ModelViewer` 如何用参数化 `orbit` 模式控制相机。
            </div>
          </ControlSection>

          <ModelUrlControl
            inputUrl={inputUrl}
            isLoading={isLoading}
            fileState={fileState}
            onInputUrlChange={handleInputUrlChange}
            onFolderSelect={handleFolderSelect}
            onModelFileSelect={handleModelFileSelect}
            onTextureFilesSelect={handleTextureFilesSelect}
            onLoad={handleLoad}
          />

          <ModelAnimationControl
            autoPlay={modelAnimation.autoPlay}
            hasAnimations={modelAnimation.hasAnimations}
            clipCount={modelAnimation.clipCount}
            onToggleAutoPlay={modelAnimation.toggleAutoPlay}
          />

          <ControlSection title="轨道轴 (Axis)">
            <div style={styles.axisButtons}>
              {(['x', 'y', 'z'] as const).map((nextAxis) => (
                <button
                  key={nextAxis}
                  type="button"
                  onClick={() => setAxis(nextAxis)}
                  style={{
                    ...themeStyles.buttonSecondary,
                    flex: 1,
                    backgroundColor: axis === nextAxis ? colors.button.primary : colors.button.secondary,
                  }}
                >
                  {nextAxis.toUpperCase()}
                </button>
              ))}
            </div>
            <div style={styles.helpText}>
              这里固定使用世界坐标轴，让不同模型在同一组参数下表现一致。
            </div>
          </ControlSection>

          <ControlSection title="姿态参数">
            <div style={styles.inputGroup}>
              <label style={themeStyles.label}>与旋转轴夹角 axisAngleDeg (0-180)</label>
              <input
                type="range"
                min={0}
                max={180}
                step={1}
                value={axisAngleDeg}
                onChange={(e) => setAxisAngleDeg(Number(e.target.value))}
              />
              <div style={styles.valueRow}>
                <span>越接近 0 越靠近轴正方向</span>
                <span>{axisAngleDeg.toFixed(0)}°</span>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={themeStyles.label}>初始相位 phaseDeg (0-360)</label>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={phaseDeg}
                onChange={(e) => setPhaseDeg(Number(e.target.value))}
              />
              <div style={styles.valueRow}>
                <span>定义首次进入画面时相机所在方位</span>
                <span>{phaseDeg.toFixed(0)}°</span>
              </div>
            </div>

            <div style={styles.inlineGroup}>
              <div style={styles.inputGroup}>
                <label style={themeStyles.label}>自动旋转</label>
                <label style={{ color: colors.text.primary, display: 'flex', gap: spacing.sm, alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={autoRotate}
                    onChange={(e) => setAutoRotate(e.target.checked)}
                  />
                  启用
                </label>
              </div>

              <div style={styles.inputGroup}>
                <label style={themeStyles.label}>速度 speedDegPerSec</label>
                <input
                  type="number"
                  value={speedDegPerSec}
                  onChange={(e) => setSpeedDegPerSec(Number(e.target.value))}
                  style={themeStyles.input}
                />
              </div>
            </div>
          </ControlSection>

          <ControlSection title="距离策略">
            <div style={styles.axisButtons}>
              {([
                { value: 'fit', label: 'fit' },
                { value: 'absolute', label: 'absolute' },
                { value: 'relativeToModelRadius', label: 'relative' },
              ] as const).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDistanceMode(value)}
                  style={{
                    ...themeStyles.buttonSecondary,
                    flex: 1,
                    backgroundColor:
                      distanceMode === value ? colors.button.primary : colors.button.secondary,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {distanceMode === 'absolute' && (
              <div style={styles.inputGroup}>
                <label style={themeStyles.label}>绝对距离</label>
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={absoluteDistance}
                  onChange={(e) => setAbsoluteDistance(Number(e.target.value))}
                  style={themeStyles.input}
                />
              </div>
            )}

            {distanceMode === 'relativeToModelRadius' && (
              <div style={styles.inputGroup}>
                <label style={themeStyles.label}>相对模型半径倍数</label>
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={relativeDistance}
                  onChange={(e) => setRelativeDistance(Number(e.target.value))}
                  style={themeStyles.input}
                />
              </div>
            )}

            {distanceMode === 'fit' && (
              <div style={styles.inputGroup}>
                <label style={themeStyles.label}>留白系数 padding</label>
                <input
                  type="number"
                  min={1}
                  step={0.01}
                  value={fitPadding}
                  onChange={(e) => setFitPadding(Number(e.target.value))}
                  style={themeStyles.input}
                />
                <div style={styles.helpText}>
                  fit 会根据当前初始姿态计算一个安全距离，避免首次加载时相机落到模型内部。
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleApplyRecommendedDistance}
              disabled={recommendedDistance === null}
              style={{
                ...themeStyles.buttonSecondary,
                ...(recommendedDistance === null
                  ? { backgroundColor: colors.button.disabled, cursor: 'not-allowed' }
                  : {}),
              }}
            >
              将推荐距离写入 absolute
            </button>
          </ControlSection>

          <ControlSection title="观察指标">
            <div style={styles.metricCard}>
              <div>
                <div style={themeStyles.label}>当前相机距离</div>
                <div style={styles.metricValue}>
                  {currentDistance === null ? '--' : currentDistance.toFixed(3)}
                </div>
              </div>
              <div>
                <div style={themeStyles.label}>推荐初始距离</div>
                <div style={styles.metricValue}>
                  {recommendedDistance === null ? '--' : recommendedDistance.toFixed(3)}
                </div>
              </div>
              <div style={styles.helpText}>
                推荐距离来自 `ModelViewerHandle.getRecommendedOrbitDistance()`，可直接在业务接入中复用。
              </div>
            </div>
          </ControlSection>

          <ControlSection title="配置预览">
            <textarea value={previewJson} readOnly style={styles.textarea} spellCheck={false} />
          </ControlSection>

          <StatusDisplay
            isLoading={isLoading}
            error={error}
            loadResult={loadResult}
            modelUrl={describeModel(appliedModel)}
          />

          <ControlsInstructions isCSMode={false} />
        </DemoSidebar>

        <div style={styles.viewerColumn}>
          <div style={styles.viewerArea}>
            <ModelViewer
              ref={viewerRef}
              {...(appliedModel ? { model: appliedModel } : {})}
              cameraScript={appliedCameraScript}
              grid={{ visible: true, size: 20, divisions: 20, plane: 'XZ', showAxes: true }}
              onLoad={handleLoadSuccess}
              onError={handleViewerError}
              onLoadingChange={setIsLoading}
              onViewerReady={modelAnimation.onViewerReady}
              backgroundColor={0x545454}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
      </DemoMain>
    </DemoLayout>
  );
}
