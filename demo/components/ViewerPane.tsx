import type { RefObject } from 'react';
import { ThreeViewer, type GridConfig, type ModelLoadResult, type ThreeViewerHandle } from '../../src';
import { styles } from '../styles';

export function ViewerPane(props: {
  viewerRef: RefObject<ThreeViewerHandle | null>;
  modelUrl: string;
  pivotPoint: { x: number; y: number; z: number } | undefined;
  zoomLimits: { min?: number; max?: number } | undefined;
  grid: GridConfig;
  onLoad: (result: ModelLoadResult) => void;
  onError: (err: Error) => void;
  onLoadingChange: (loading: boolean) => void;
}) {
  const {
    viewerRef,
    modelUrl,
    pivotPoint,
    zoomLimits,
    grid,
    onLoad,
    onError,
    onLoadingChange,
  } = props;

  return (
    <div style={styles.viewerContainer}>
      {modelUrl ? (
        <ThreeViewer
          ref={viewerRef}
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
            Enter a GLTF/GLB model URL in the sidebar and click &quot;Load
            Model&quot;
          </div>
        </div>
      )}
    </div>
  );
}
