import React, { forwardRef } from 'react';
import {
  ModelViewer,
  type ModelViewerCameraScript,
  type ModelViewerErrorContext,
  type ModelViewerModel,
  ThreeViewer,
  ThreeViewerHandle,
  GridConfig,
  ModelLoadResult,
  ViewerCore,
} from '../../src';
import { colors } from '../styles/theme';

const styles = {
  viewerContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.background.tertiary,
  } as React.CSSProperties,
  
  overlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    color: colors.text.secondary,
  } as React.CSSProperties,
  
  overlayText: {
    fontSize: '16px',
    marginBottom: '8px',
  } as React.CSSProperties,
  
  overlayHint: {
    fontSize: '12px',
    color: '#666',
  } as React.CSSProperties,
};

interface DemoViewerProps {
  model?: ModelViewerModel | null;
  cameraScript?: ModelViewerCameraScript;
  modelUrl?: string;
  pivotPoint?: { x: number; y: number; z: number };
  zoomLimits?: { min?: number; max?: number };
  grid: GridConfig;
  onLoad: (result: ModelLoadResult) => void;
  onError: ((error: Error, context: ModelViewerErrorContext) => void) | ((error: Error) => void);
  onLoadingChange: (loading: boolean) => void;
  onViewerReady?: (viewerCore: ViewerCore) => void;
}

export const DemoViewer = forwardRef<ThreeViewerHandle, DemoViewerProps>(
  (
    {
      model,
      cameraScript,
      modelUrl,
      pivotPoint,
      zoomLimits,
      grid,
      onLoad,
      onError,
      onLoadingChange,
      onViewerReady,
    },
    ref
  ) => {
    const isModelViewerMode = model !== undefined || cameraScript !== undefined;

    return (
      <div style={styles.viewerContainer}>
        {isModelViewerMode ? (
          <ModelViewer
            ref={ref}
            {...(model ? { model } : {})}
            {...(cameraScript ? { cameraScript } : {})}
            {...(pivotPoint ? { pivotPoint } : {})}
            {...(zoomLimits ? { zoomLimits } : {})}
            grid={grid}
            backgroundColor={0x545454}
            onLoad={onLoad}
            onError={onError as (error: Error, context: ModelViewerErrorContext) => void}
            onLoadingChange={onLoadingChange}
            {...(onViewerReady ? { onViewerReady } : {})}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <ThreeViewer
            ref={ref}
            {...(modelUrl ? { modelUrl } : {})}
            {...(pivotPoint ? { pivotPoint } : {})}
            {...(zoomLimits ? { zoomLimits } : {})}
            grid={grid}
            backgroundColor={0x545454}
            onLoad={onLoad}
            onError={onError as (error: Error) => void}
            onLoadingChange={onLoadingChange}
            {...(onViewerReady ? { onViewerReady } : {})}
            style={{ width: '100%', height: '100%' }}
          />
        )}

        {!model && !modelUrl ? (
          <div style={styles.overlay}>
            <div style={styles.overlayText}>No model loaded</div>
            <div style={styles.overlayHint}>
              Enter a GLTF/GLB model URL in the sidebar and click "Load Model"
            </div>
          </div>
        ) : null}
      </div>
    );
  }
);

DemoViewer.displayName = 'DemoViewer';
