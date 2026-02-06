import type { ModelLoadResult } from '../../../src';
import { styles } from '../../styles';

export function StatusSection(props: {
  isLoading: boolean;
  error: Error | null;
  loadResult: ModelLoadResult | null;
  modelUrl: string;
}) {
  const { isLoading, error, loadResult, modelUrl } = props;

  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>Status</h2>
      <div style={styles.statusContainer}>
        {isLoading && (
          <div style={styles.loadingIndicator}>
            <div style={styles.spinner} />
            <span>Loading model...</span>
          </div>
        )}
        {error && (
          <div style={styles.errorMessage}>
            <strong>Error:</strong> {error.message}
          </div>
        )}
        {!isLoading && !error && loadResult && (
          <div>
            <div style={styles.successMessage}>✓ Model loaded successfully</div>
            <div style={styles.modelInfo}>
              <div>
                Center: ({loadResult.center.x.toFixed(2)},{' '}
                {loadResult.center.y.toFixed(2)},{' '}
                {loadResult.center.z.toFixed(2)})
              </div>
            </div>
          </div>
        )}
        {!isLoading && !error && !loadResult && !modelUrl && (
          <div style={{ color: '#a0a0a0', fontSize: '13px' }}>
            Enter a model URL and click &quot;Load Model&quot; to begin
          </div>
        )}
      </div>
    </section>
  );
}
