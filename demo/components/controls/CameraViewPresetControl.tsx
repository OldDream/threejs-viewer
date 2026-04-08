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
    <ControlSection title="相机视角预设 (Camera View Preset)">
      <button type="button" onClick={onOpen} style={themeStyles.buttonSecondary}>
        打开预设 JSON
      </button>
      <div style={styles.hint}>
        导出当前视角或粘贴 JSON 以应用初始相机视角。
      </div>
    </ControlSection>
  );
}

