import React, { forwardRef } from 'react';
import { ThreeViewer, ThreeViewerHandle, GridConfig, ModelLoadResult } from '../../src';
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
  modelUrl: string;
  pivotPoint?: { x: number; y: number; z: number };
  zoomLimits?: { min?: number; max?: number };
  grid: GridConfig;
  onLoad: (result: ModelLoadResult) => void;
  onError: (error: Error) => void;
  onLoadingChange: (loading: boolean) => void;
}

export const DemoViewer = forwardRef<ThreeViewerHandle, DemoViewerProps>(
  ({ modelUrl, pivotPoint, zoomLimits, grid, onLoad, onError, onLoadingChange }, ref) => {
    return (
      <div style={styles.viewerContainer}>
        {modelUrl ? (
          <ThreeViewer
            ref={ref}
            modelUrl={modelUrl}
            {...(pivotPoint && { pivotPoint })}
            {...(zoomLimits && { zoomLimits })}
            grid={grid}
            backgroundColor={0x545454}
            onLoad={onLoad}
            onError={onError}
            onLoadingChange={onLoadingChange}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <div style={styles.overlay}>
            <div style={styles.overlayText}>No model loaded</div>
            <div style={styles.overlayHint}>
              Enter a GLTF/GLB model URL in the sidebar and click "Load Model"
            </div>
          </div>
        )}
      </div>
    );
  }
);

DemoViewer.displayName = 'DemoViewer';
