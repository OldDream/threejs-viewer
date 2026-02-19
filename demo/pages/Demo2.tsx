import React, { useCallback, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { CameraScriptController, type CameraScriptMode, ThreeViewerHandle } from '../../src';
import { DemoLayout, DemoMain } from '../components/DemoLayout';
import { DemoHeader } from '../components/DemoHeader';
import { DemoSidebar } from '../components/DemoSidebar';
import { DemoViewer } from '../components/DemoViewer';
import { ControlSection } from '../components/controls/ControlSection';
import { ModelUrlControl } from '../components/controls/ModelUrlControl';
import { ModelAnimationControl } from '../components/controls/ModelAnimationControl';
import { StatusDisplay } from '../components/controls/StatusDisplay';
import { ControlsInstructions } from '../components/controls/ControlsInstructions';
import { colors, spacing, styles as themeStyles, typography } from '../styles/theme';
import { useModelLoader } from '../hooks/useModelLoader';
import { useModelAnimation } from '../hooks/useModelAnimation';

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

export function Demo2() {
  const viewerRef = useRef<ThreeViewerHandle>(null);
  const modelLoader = useModelLoader();
  const modelAnimation = useModelAnimation(viewerRef, modelLoader.loadResult);
  const [mode, setMode] = useState<CameraScriptMode>('none');
  const [loop, setLoop] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [cameraShotJson, setCameraShotJson] = useState('');
  const [cameraViewPresetJson, setCameraViewPresetJson] = useState('');

  const modelRadius = useMemo(() => {
    const loadResult = modelLoader.loadResult;
    if (!loadResult) return undefined;
    const sphere = new THREE.Sphere();
    loadResult.boundingBox.getBoundingSphere(sphere);
    return sphere.radius > 0 ? sphere.radius : undefined;
  }, [modelLoader.loadResult]);

  const handleControllerError = useCallback((error: Error) => {
    window.alert(error.message);
  }, []);

  return (
    <DemoLayout>
      <DemoHeader />
      <DemoMain>
        <DemoSidebar>
          <ControlSection title="Demo2 Route">
            <div style={styles.hint}>当前页面路径：#/demo2（手动输入 URL hash 进入）。</div>
          </ControlSection>

          <ModelUrlControl
            inputUrl={modelLoader.inputUrl}
            isLoading={modelLoader.isLoading}
            fileState={modelLoader.fileState}
            onInputUrlChange={modelLoader.handleInputUrlChange}
            onFolderSelect={modelLoader.handleFolderSelect}
            onModelFileSelect={modelLoader.handleModelFileSelect}
            onTextureFilesSelect={modelLoader.handleTextureFilesSelect}
            onLoad={modelLoader.handleLoad}
          />

          <ModelAnimationControl
            autoPlay={modelAnimation.autoPlay}
            hasAnimations={modelAnimation.hasAnimations}
            clipCount={modelAnimation.clipCount}
            onToggleAutoPlay={modelAnimation.toggleAutoPlay}
          />

          <ControlSection title="Camera Script">
            <div style={styles.inputGroup}>
              <label style={themeStyles.label}>Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as CameraScriptMode)}
                style={{ ...themeStyles.input, cursor: 'pointer' }}
              >
                <option value="none">none</option>
                <option value="shot">shot</option>
                <option value="preset">preset</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={themeStyles.label}>Loop (shot)</label>
              <label style={{ display: 'flex', gap: spacing.sm, alignItems: 'center', color: colors.text.primary }}>
                <input
                  type="checkbox"
                  checked={loop}
                  onChange={(e) => setLoop(e.target.checked)}
                />
                enabled
              </label>
            </div>

            <div style={styles.inputGroup}>
              <label style={themeStyles.label}>AutoPlay (shot)</label>
              <label style={{ display: 'flex', gap: spacing.sm, alignItems: 'center', color: colors.text.primary }}>
                <input
                  type="checkbox"
                  checked={autoPlay}
                  onChange={(e) => setAutoPlay(e.target.checked)}
                />
                enabled
              </label>
            </div>

            <div style={styles.inputGroup}>
              <label style={themeStyles.label}>cameraShot JSON (shot)</label>
              <textarea
                value={cameraShotJson}
                onChange={(e) => setCameraShotJson(e.target.value)}
                style={styles.textarea}
                spellCheck={false}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={themeStyles.label}>cameraViewPreset JSON (preset)</label>
              <textarea
                value={cameraViewPresetJson}
                onChange={(e) => setCameraViewPresetJson(e.target.value)}
                style={styles.textarea}
                spellCheck={false}
              />
            </div>
          </ControlSection>

          <StatusDisplay
            isLoading={modelLoader.isLoading}
            error={modelLoader.error}
            loadResult={modelLoader.loadResult}
            modelUrl={modelLoader.modelUrl}
          />

          <ControlsInstructions isCSMode={false} />
        </DemoSidebar>

        <div style={styles.viewerColumn}>
          <div style={styles.viewerArea}>
            <DemoViewer
              ref={viewerRef}
              {...(modelLoader.modelUrl ? { modelUrl: modelLoader.modelUrl } : {})}
              grid={{ visible: true, size: 20, divisions: 20, plane: 'XZ', showAxes: true }}
              onLoad={modelLoader.handleLoadSuccess}
              onError={modelLoader.handleLoadError}
              onLoadingChange={modelLoader.handleLoadingChange}
              onViewerReady={modelAnimation.onViewerReady}
            />
          </div>

          <CameraScriptController
            viewerRef={viewerRef}
            mode={mode}
            cameraShotJson={cameraShotJson}
            cameraViewPresetJson={cameraViewPresetJson}
            loop={loop}
            autoPlay={autoPlay}
            modelCenter={modelLoader.loadResult?.center}
            modelRadius={modelRadius}
            onError={handleControllerError}
          />
        </div>
      </DemoMain>
    </DemoLayout>
  );
}
