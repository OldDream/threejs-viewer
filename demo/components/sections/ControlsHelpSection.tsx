import { styles } from '../../styles';

export function ControlsHelpSection(props: { flyMode: boolean }) {
  const { flyMode } = props;

  return (
    <section style={{ ...styles.section, marginTop: '24px' }}>
      <h2 style={styles.sectionTitle}>Controls</h2>
      <div style={{ fontSize: '12px', color: '#a0a0a0', lineHeight: 1.6 }}>
        <p>
          <strong>Rotate:</strong> Left-click and drag
        </p>
        <p>
          <strong>Zoom:</strong> Scroll wheel or pinch
        </p>
        <p>
          <strong>Pan:</strong> Right-click and drag
        </p>
        <p
          style={{
            marginTop: '12px',
            borderTop: '1px solid #0f3460',
            paddingTop: '12px',
          }}
        >
          <strong>Keyboard Movement:</strong>
        </p>
        <p>
          <strong>W / S:</strong> Move forward / backward{' '}
          {flyMode ? '(View Direction)' : '(Ground)'}
        </p>
        <p>
          <strong>A / D:</strong> Move left / right
        </p>
        <p>
          <strong>Shift:</strong> Move up
        </p>
        <p>
          <strong>Ctrl:</strong> Move down
        </p>
      </div>
    </section>
  );
}
