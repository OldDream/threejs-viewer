import React from 'react';
import { ControlSection } from './ControlSection';
import { styles as themeStyles, spacing } from '../../styles/theme';

const styles = {
  inputGroup: {
    marginBottom: spacing.md,
  } as React.CSSProperties,
  
  checkboxLabel: {
    ...themeStyles.label,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as React.CSSProperties,
};

interface CameraMovementControlProps {
  enabled: boolean;
  speed: number;
  isCSMode: boolean;
  isAnimating: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  onChangeSpeed: (speed: number) => void;
  onToggleCSMode: (enabled: boolean) => void;
}

export function CameraMovementControl({
  enabled,
  speed,
  isCSMode,
  isAnimating,
  onToggleEnabled,
  onChangeSpeed,
  onToggleCSMode,
}: CameraMovementControlProps) {
  return (
    <ControlSection title="相机运动 (Camera Movement)">
      <div style={styles.inputGroup}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggleEnabled(e.target.checked)}
            disabled={isAnimating}
          />
          启用 WASD 控制
        </label>
      </div>
      
      <div style={styles.inputGroup}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={isCSMode}
            onChange={(e) => onToggleCSMode(e.target.checked)}
            disabled={!enabled || isAnimating}
          />
          启用 CS 模式 (第一人称)
        </label>
      </div>
      
      <div style={{ ...styles.inputGroup, opacity: enabled ? 1 : 0.5 }}>
        <label style={themeStyles.label}>
          运动速度 (Speed): {speed.toFixed(1)}
        </label>
        <input
          type="range"
          min="1"
          max="300"
          step="1"
          value={speed}
          onChange={(e) => onChangeSpeed(parseFloat(e.target.value))}
          disabled={!enabled || isAnimating}
          style={{
            width: '100%',
            cursor: enabled && !isAnimating ? 'pointer' : 'not-allowed',
          }}
        />
      </div>
    </ControlSection>
  );
}
