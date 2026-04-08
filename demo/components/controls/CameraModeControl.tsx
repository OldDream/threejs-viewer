import React from 'react';
import { ControlSection } from './ControlSection';
import { colors, spacing, typography } from '../../styles/theme';

const styles = {
  container: {
    display: 'flex',
    gap: spacing.sm,
    marginBottom: spacing.md,
  } as React.CSSProperties,
  
  button: {
    flex: 1,
    padding: '8px 12px',
    border: `1px solid ${colors.border.primary}`,
    borderRadius: '6px',
    backgroundColor: colors.background.input,
    color: colors.text.secondary,
    cursor: 'pointer',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    transition: 'all 0.2s ease',
    textAlign: 'center',
  } as React.CSSProperties,

  buttonActive: {
    backgroundColor: colors.button.primary,
    borderColor: colors.button.primary,
    color: '#ffffff',
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
      <div style={styles.container}>
        <button
          style={{
            ...styles.button,
            ...(mode === 'animation' ? styles.buttonActive : {})
          }}
          onClick={() => onChangeMode('animation')}
        >
          Path Animation
        </button>
        <button
          style={{
            ...styles.button,
            ...(mode === 'designer' ? styles.buttonActive : {})
          }}
          onClick={() => onChangeMode('designer')}
        >
          Path Designer
        </button>
      </div>
      <div style={styles.hint}>
        Switching modes stops any active preview/animation.
      </div>
    </ControlSection>
  );
}
