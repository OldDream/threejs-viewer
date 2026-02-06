import { styles } from '../../styles';

export function PivotSection(props: {
  usePivotPoint: boolean;
  setUsePivotPoint: (value: boolean) => void;
  pivotX: string;
  pivotY: string;
  pivotZ: string;
  setPivotX: (value: string) => void;
  setPivotY: (value: string) => void;
  setPivotZ: (value: string) => void;
  onApply: () => void;
}) {
  const {
    usePivotPoint,
    setUsePivotPoint,
    pivotX,
    pivotY,
    pivotZ,
    setPivotX,
    setPivotY,
    setPivotZ,
    onApply,
  } = props;

  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>Pivot Point</h2>
      <div style={styles.inputGroup}>
        <label
          style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <input
            type="checkbox"
            checked={usePivotPoint}
            onChange={(e) => setUsePivotPoint(e.target.checked)}
          />
          Use Custom Pivot Point
        </label>
      </div>
      <div style={{ ...styles.row, opacity: usePivotPoint ? 1 : 0.5 }}>
        <div style={styles.col}>
          <label style={styles.label}>X</label>
          <input
            type="number"
            value={pivotX}
            onChange={(e) => setPivotX(e.target.value)}
            disabled={!usePivotPoint}
            style={styles.input}
            step="0.1"
          />
        </div>
        <div style={styles.col}>
          <label style={styles.label}>Y</label>
          <input
            type="number"
            value={pivotY}
            onChange={(e) => setPivotY(e.target.value)}
            disabled={!usePivotPoint}
            style={styles.input}
            step="0.1"
          />
        </div>
        <div style={styles.col}>
          <label style={styles.label}>Z</label>
          <input
            type="number"
            value={pivotZ}
            onChange={(e) => setPivotZ(e.target.value)}
            disabled={!usePivotPoint}
            style={styles.input}
            step="0.1"
          />
        </div>
      </div>
      <button
        onClick={onApply}
        style={{ ...styles.button, marginTop: '12px', backgroundColor: '#0f3460' }}
      >
        Apply Pivot Point
      </button>
    </section>
  );
}
