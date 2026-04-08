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
  loop: boolean;
  isPickTargetArmed: boolean;
  onTogglePanel: () => void;
  onToggleEditing: () => void;
  onPlay: () => void;
  onStop: () => void;
  onToggleLoop: (value: boolean) => void;
  onAddPoint: () => void;
  onSetTargetToCenter: () => void;
  onPickTargetOnce: () => void;
}

export function CameraPathDesignerControl({
  isEditing,
  isPlaying,
  panelOpen,
  pointCount,
  loop,
  isPickTargetArmed,
  onTogglePanel,
  onToggleEditing,
  onPlay,
  onStop,
  onToggleLoop,
  onAddPoint,
  onSetTargetToCenter,
  onPickTargetOnce,
}: CameraPathDesignerControlProps) {
  const canEditPath = isEditing && !isPlaying;

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

      <div style={{ ...styles.row, marginTop: spacing.md }}>
        <button type="button" onClick={onToggleEditing} disabled={isPlaying} style={themeStyles.buttonSecondary}>
          {isEditing ? '编辑: 开 (ON)' : '编辑: 关 (OFF)'}
        </button>
        <button
          type="button"
          onClick={isPlaying ? onStop : onPlay}
          disabled={pointCount < 2}
          style={{
            ...themeStyles.buttonSecondary,
            backgroundColor: isPlaying ? colors.button.primaryHover : colors.button.success,
          }}
        >
          {isPlaying ? '停止' : '播放'}
        </button>
      </div>

      <div style={styles.row}>
        <button type="button" onClick={onAddPoint} disabled={!canEditPath} style={themeStyles.buttonSecondary}>
          添加关键点 (Point)
        </button>
        <label style={{ ...themeStyles.label, marginBottom: 0, display: 'flex', alignItems: 'center', gap: spacing.xs }}>
          <input
            type="checkbox"
            checked={loop}
            onChange={(e) => onToggleLoop(e.target.checked)}
          />
          循环
        </label>
      </div>

      <div style={styles.row}>
        <button type="button" onClick={onSetTargetToCenter} disabled={!canEditPath} style={themeStyles.buttonSecondary}>
          看向中心
        </button>
        <button type="button" onClick={onPickTargetOnce} disabled={!canEditPath} style={themeStyles.buttonSecondary}>
          {isPickTargetArmed ? '选取目标点…' : '选取目标点'}
        </button>
      </div>

      <div style={styles.hint}>
        关键点数 (Points): {pointCount}。高级段落时间和插值设置在独立的编辑器面板中。
      </div>
    </ControlSection>
  );
}
