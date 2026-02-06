import { styles } from '../../styles';

export function CameraMovementSection(props: {
  enableCameraMovement: boolean;
  setEnableCameraMovement: (value: boolean) => void;
  flyMode: boolean;
  setFlyMode: (value: boolean) => void;
  cameraMovementSpeed: number;
  setCameraMovementSpeed: (value: number) => void;
  isAnimating: boolean;
}) {
  const {
    enableCameraMovement,
    setEnableCameraMovement,
    flyMode,
    setFlyMode,
    cameraMovementSpeed,
    setCameraMovementSpeed,
    isAnimating,
  } = props;

  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>Camera Movement</h2>
      <div style={styles.inputGroup}>
        <label
          style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <input
            type="checkbox"
            checked={enableCameraMovement}
            onChange={(e) => setEnableCameraMovement(e.target.checked)}
            disabled={isAnimating}
          />
          Enable WASD Control
        </label>
      </div>
      <div style={styles.inputGroup}>
        <label
          style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <input
            type="checkbox"
            checked={flyMode}
            onChange={(e) => setFlyMode(e.target.checked)}
            disabled={!enableCameraMovement || isAnimating}
          />
          Enable CS Mode (Fly)
        </label>
      </div>
      <div style={{ ...styles.inputGroup, opacity: enableCameraMovement ? 1 : 0.5 }}>
        <label style={styles.label}>
          Movement Speed: {cameraMovementSpeed.toFixed(1)}
        </label>
        <input
          type="range"
          min="1"
          max="300"
          step="1"
          value={cameraMovementSpeed}
          onChange={(e) => setCameraMovementSpeed(parseFloat(e.target.value))}
          disabled={!enableCameraMovement || isAnimating}
          style={{
            width: '100%',
            cursor: enableCameraMovement && !isAnimating ? 'pointer' : 'not-allowed',
          }}
        />
      </div>
    </section>
  );
}
