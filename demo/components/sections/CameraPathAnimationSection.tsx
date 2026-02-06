import { styles } from '../../styles';

export function CameraPathAnimationSection(props: {
  isAnimating: boolean;
  animationViewMode: 'target' | 'fixed' | 'path';
  setAnimationViewMode: (value: 'target' | 'fixed' | 'path') => void;
  onToggleAnimation: () => void;
}) {
  const { isAnimating, animationViewMode, setAnimationViewMode, onToggleAnimation } =
    props;

  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>Camera Path Animation</h2>
      <div style={styles.inputGroup}>
        <label style={styles.label}>View Mode</label>
        <select
          value={animationViewMode}
          onChange={(e) =>
            setAnimationViewMode(e.target.value as 'target' | 'fixed' | 'path')
          }
          disabled={isAnimating}
          style={{ ...styles.input, cursor: isAnimating ? 'not-allowed' : 'pointer' }}
        >
          <option value="target">Look at Center/Model</option>
          <option value="fixed">Fixed Direction</option>
          <option value="path">Look Along Path</option>
        </select>
      </div>
      <button
        onClick={onToggleAnimation}
        style={{
          ...styles.button,
          backgroundColor: isAnimating ? '#d63850' : '#4caf50',
        }}
      >
        {isAnimating ? 'Stop Animation' : 'Start Animation'}
      </button>
      <div style={{ marginTop: '8px', fontSize: '12px', color: '#a0a0a0' }}>
        {isAnimating
          ? 'Orbit Controls disabled during animation'
          : 'Path is automatically generated around the model'}
      </div>
    </section>
  );
}
