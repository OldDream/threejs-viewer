import { styles } from '../../styles';

export function ZoomLimitsSection(props: {
  useZoomLimits: boolean;
  setUseZoomLimits: (value: boolean) => void;
  zoomMin: string;
  zoomMax: string;
  setZoomMin: (value: string) => void;
  setZoomMax: (value: string) => void;
  onApply: () => void;
}) {
  const {
    useZoomLimits,
    setUseZoomLimits,
    zoomMin,
    zoomMax,
    setZoomMin,
    setZoomMax,
    onApply,
  } = props;

  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>Zoom Limits</h2>
      <div style={styles.inputGroup}>
        <label
          style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <input
            type="checkbox"
            checked={useZoomLimits}
            onChange={(e) => setUseZoomLimits(e.target.checked)}
          />
          Use Custom Zoom Limits
        </label>
      </div>
      <div style={{ ...styles.row, opacity: useZoomLimits ? 1 : 0.5 }}>
        <div style={styles.col}>
          <label style={styles.label}>Min Distance</label>
          <input
            type="number"
            value={zoomMin}
            onChange={(e) => setZoomMin(e.target.value)}
            disabled={!useZoomLimits}
            style={styles.input}
            step="0.1"
            min="0.01"
          />
        </div>
        <div style={styles.col}>
          <label style={styles.label}>Max Distance</label>
          <input
            type="number"
            value={zoomMax}
            onChange={(e) => setZoomMax(e.target.value)}
            disabled={!useZoomLimits}
            style={styles.input}
            step="1"
            min="0.1"
          />
        </div>
      </div>
      <button
        onClick={onApply}
        style={{ ...styles.button, marginTop: '12px', backgroundColor: '#0f3460' }}
      >
        Apply Zoom Limits
      </button>
    </section>
  );
}
