import React from 'react';
import { ControlSection } from './ControlSection';
import { colors, spacing, styles as themeStyles, typography } from '../../styles/theme';

const styles = {
  row: {
    display: 'flex',
    gap: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.md,
  } as React.CSSProperties,

  hint: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    lineHeight: 1.4,
    marginTop: spacing.sm,
  } as React.CSSProperties,
};

interface CameraPathDesignerControlProps {
  isEditing: boolean;
  isPlaying: boolean;
  panelOpen: boolean;
  pointCount: number;
  onTogglePanel: () => void;
}

export function CameraPathDesignerControl({
  isEditing,
  isPlaying,
  panelOpen,
  pointCount,
  onTogglePanel,
}: CameraPathDesignerControlProps) {
  return (
    <ControlSection title="相机路径设计器 (Camera Path Designer)">
      <button
        type="button"
        onClick={onTogglePanel}
        style={{
          ...themeStyles.button,
          backgroundColor: panelOpen ? colors.button.success : colors.button.primary,
        }}
      >
        {panelOpen ? '隐藏路径编辑器' : '打开路径编辑器'}
      </button>

      <div style={{ ...styles.hint, marginTop: spacing.md }}>
        状态: {isPlaying ? '播放中' : (isEditing ? '编辑中' : '空闲')} | 关键点数: {pointCount}
      </div>
      <div style={styles.hint}>
        详细的路径编辑、播放控制与相关设置，请在独立面板中进行操作。
      </div>
    </ControlSection>
  );
}
