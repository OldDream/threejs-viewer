import { styles } from '../../styles';

export function GridAxesSection(props: {
  showGrid: boolean;
  setShowGrid: (value: boolean) => void;
  showAxes: boolean;
  setShowAxes: (value: boolean) => void;
  gridPlane: 'XY' | 'XZ' | 'YZ';
  setGridPlane: (value: 'XY' | 'XZ' | 'YZ') => void;
}) {
  const { showGrid, setShowGrid, showAxes, setShowAxes, gridPlane, setGridPlane } =
    props;

  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>Grid & Axes</h2>
      <div style={styles.inputGroup}>
        <label
          style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
          />
          Show Grid
        </label>
      </div>
      <div style={styles.inputGroup}>
        <label
          style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <input
            type="checkbox"
            checked={showAxes}
            onChange={(e) => setShowAxes(e.target.checked)}
          />
          Show Axes (R=X, G=Y, B=Z)
        </label>
      </div>
      <div style={styles.inputGroup}>
        <label style={styles.label}>Grid Plane</label>
        <select
          value={gridPlane}
          onChange={(e) => setGridPlane(e.target.value as 'XY' | 'XZ' | 'YZ')}
          style={{ ...styles.input, cursor: 'pointer' }}
        >
          <option value="XZ">XZ (Ground)</option>
          <option value="XY">XY (Vertical)</option>
          <option value="YZ">YZ (Side)</option>
        </select>
      </div>
    </section>
  );
}
