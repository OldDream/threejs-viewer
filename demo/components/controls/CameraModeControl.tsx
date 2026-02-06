import React from 'react';
import { ControlSection } from './ControlSection';
import { styles as themeStyles, colors, spacing, typography } from '../../styles/theme';

const styles = {
  inputGroup: {
    marginBottom: spacing.md,
  } as React.CSSProperties,

  hint: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    lineHeight: 1.4,
  } as React.CSSProperties,
};

export type CameraFeatureMode = 'animation' | 'designer';

interface CameraModeControlProps {
  mode: CameraFeatureMode;
  onChangeMode: (mode: CameraFeatureMode) => void;
}

export function CameraModeControl({ mode, onChangeMode }: CameraModeControlProps) {
  return (
    <ControlSection title="Camera Mode">
      <div style={styles.inputGroup}>
        <label style={themeStyles.label}>Mode</label>
        <select
          value={mode}
          onChange={(e) => onChangeMode(e.target.value as CameraFeatureMode)}
          style={{ ...themeStyles.input, cursor: 'pointer' }}
        >
          <option value="animation">Path Animation (Auto)</option>
          <option value="designer">Path Designer (Edit)</option>
        </select>
        <div style={styles.hint}>
          Switching modes stops any active preview/animation.
        </div>
      </div>
    </ControlSection>
  );
}
