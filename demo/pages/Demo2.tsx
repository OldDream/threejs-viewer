import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  type CameraScriptMode,
  type ModelLoadResult,
  type ModelViewerHandle,
  ModelViewer,
  type ModelViewerCameraScript,
  type ModelViewerErrorContext,
  type ModelViewerModel,
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
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/refs/heads/main/2.0/2CylinderEngine/glTF/2CylinderEngine.gltf';

const INITIAL_FILE_STATE: FileState = {
  selectedModelFile: null,
  selectedTextureFiles: [],
  isLocalFile: false,
  selectedFolderFiles: [],
  isFolderMode: false,
};

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

  textarea: {
    ...themeStyles.input,
    width: '100%',
    minHeight: 140,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: typography.fontSize.xs,
    resize: 'vertical',
  } as React.CSSProperties,

  hint: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    lineHeight: 1.4,
  } as React.CSSProperties,
};

function toAppliedModel(inputUrl: string, fileState: FileState): ModelViewerModel | null {
  if (fileState.isFolderMode && fileState.selectedFolderFiles.length > 0) {
    return {
      type: 'folder',
      files: fileState.selectedFolderFiles,
    };
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

  return {
    type: 'url',
    url: trimmedUrl,
  };
}

function describeModel(model: ModelViewerModel | null): string {
  if (!model) {
    return '';
  }

  if (model.type === 'url') {
    return model.url;
  }

  if (model.type === 'file') {
    return model.file.name;
  }

  return `${model.files.length} files`;
}

export function Demo2() {
  const viewerRef = useRef<ModelViewerHandle>(null);
  const [inputUrl, setInputUrl] = useState(DEFAULT_MODEL_URL);
  const [fileState, setFileState] = useState<FileState>(INITIAL_FILE_STATE);
  const [appliedModel, setAppliedModel] = useState<ModelViewerModel | null>({
    type: 'url',
    url: DEFAULT_MODEL_URL,
  });
  const [mode, setMode] = useState<CameraScriptMode>('none');
  const [loop, setLoop] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [cameraShotJson, setCameraShotJson] = useState('');
  const [cameraViewPresetJson, setCameraViewPresetJson] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loadResult, setLoadResult] = useState<ModelLoadResult | null>(null);
  const modelAnimation = useModelAnimation(viewerRef, loadResult);

  const appliedCameraScript = useMemo<ModelViewerCameraScript>(() => {
    if (mode === 'shot') {
      return {
        mode: 'shot',
        data: cameraShotJson,
        loop,
        autoPlay,
      };
    }

    if (mode === 'preset') {
      return {
        mode: 'preset',
        data: cameraViewPresetJson,
      };
    }

    return { mode: 'none' };
  }, [autoPlay, cameraShotJson, cameraViewPresetJson, loop, mode]);

  const handleInputUrlChange = useCallback((url: string) => {
    setInputUrl(url);
    setError(null);

    if (!url.startsWith('[Local File]') && !url.startsWith('[Local Folder]')) {
      setFileState(INITIAL_FILE_STATE);
    }
  }, []);

  const handleFolderSelect = useCallback((files: File[]) => {
    if (files.length === 0) {
      return;
    }

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
    setFileState((prev) => ({
      ...prev,
      selectedTextureFiles: files,
    }));
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
  }, []);

  const handleViewerError = useCallback((viewerError: Error, context: ModelViewerErrorContext) => {
    setError(new Error(`[${context.stage}] ${viewerError.message}`));

    if (context.stage === 'camera-script') {
      window.alert(viewerError.message);
    }
  }, []);

  return (
    <DemoLayout>
      <DemoHeader />
      <DemoMain>
        <DemoSidebar>
          <ControlSection title="Demo2 路由">
            <div style={styles.hint}>
              当前页面路径：#/demo2。这个页面保留 JSON 驱动示例，方便和新的参数化 orbit 模式做对照。
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

          <ControlSection title="相机脚本 (Camera Script)">
            <div style={styles.inputGroup}>
              <label style={themeStyles.label}>模式 (Mode)</label>
              <div style={{ display: 'flex', gap: spacing.sm }}>
                {([
                  { value: 'none', label: 'none' },
                  { value: 'shot', label: '相机路径 (shot)' },
                  { value: 'preset', label: '固定视角 (preset)' },
                ] as const).map(({ value: nextMode, label }) => (
                  <button
                    key={nextMode}
                    type="button"
                    onClick={() => setMode(nextMode)}
                    style={{
                      ...themeStyles.buttonSecondary,
                      flex: 1,
                      backgroundColor:
                        mode === nextMode ? colors.button.primary : colors.button.secondary,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={themeStyles.label}>循环 (Loop) (shot)</label>
              <label
                style={{
                  display: 'flex',
                  gap: spacing.sm,
                  alignItems: 'center',
                  color: colors.text.primary,
                }}
              >
                <input
                  type="checkbox"
                  checked={loop}
                  onChange={(e) => setLoop(e.target.checked)}
                />
                启用
              </label>
            </div>

            <div style={styles.inputGroup}>
              <label style={themeStyles.label}>自动播放 (AutoPlay) (shot)</label>
              <label
                style={{
                  display: 'flex',
                  gap: spacing.sm,
                  alignItems: 'center',
                  color: colors.text.primary,
                }}
              >
                <input
                  type="checkbox"
                  checked={autoPlay}
                  onChange={(e) => setAutoPlay(e.target.checked)}
                />
                启用
              </label>
            </div>

            <div style={styles.inputGroup}>
              <label style={themeStyles.label}>预设视角 cameraShot JSON (shot)</label>
              <textarea
                value={cameraShotJson}
                onChange={(e) => setCameraShotJson(e.target.value)}
                style={styles.textarea}
                spellCheck={false}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={themeStyles.label}>相机路径 cameraViewPreset JSON (preset)</label>
              <textarea
                value={cameraViewPresetJson}
                onChange={(e) => setCameraViewPresetJson(e.target.value)}
                style={styles.textarea}
                spellCheck={false}
              />
            </div>
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
              backgroundColor={0x545454}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
      </DemoMain>
    </DemoLayout>
  );
}
