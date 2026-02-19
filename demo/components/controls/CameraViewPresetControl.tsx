import React from 'react';
import { ControlSection } from './ControlSection';
import { styles as themeStyles, colors, spacing, typography } from '../../styles/theme';

const styles = {
  hint: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    lineHeight: 1.4,
  } as React.CSSProperties,
};

interface CameraViewPresetControlProps {
  onOpen: () => void;
}

export function CameraViewPresetControl({ onOpen }: CameraViewPresetControlProps) {
  return (
    <ControlSection title="Camera View Preset">
      <button type="button" onClick={onOpen} style={themeStyles.buttonSecondary}>
        Open Preset JSON
      </button>
      <div style={styles.hint}>
        Export current view or paste JSON to apply an initial camera view.
      </div>
    </ControlSection>
  );
}

