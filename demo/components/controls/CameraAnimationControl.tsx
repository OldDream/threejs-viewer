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
  } as React.CSSProperties,
};

interface CameraAnimationControlProps {
  isAnimating: boolean;
  viewMode: 'target' | 'fixed' | 'path';
  onToggle: () => void;
  onChangeViewMode: (mode: 'target' | 'fixed' | 'path') => void;
}

export function CameraAnimationControl({
  isAnimating,
  viewMode,
  onToggle,
  onChangeViewMode,
}: CameraAnimationControlProps) {
  return (
    <ControlSection title="相机路径动画 (Camera Path Animation)">
      <div style={styles.inputGroup}>
        <label style={themeStyles.label}>视角模式 (View Mode)</label>
        <select
          value={viewMode}
          onChange={(e) => onChangeViewMode(e.target.value as 'target' | 'fixed' | 'path')}
          disabled={isAnimating}
          style={{ ...themeStyles.input, cursor: isAnimating ? 'not-allowed' : 'pointer' }}
        >
          <option value="target">看向中心/模型 (Look at Center)</option>
          <option value="fixed">固定方向 (Fixed Direction)</option>
          <option value="path">沿路径方向 (Look Along Path)</option>
        </select>
      </div>
      
      <button
        type="button"
        onClick={onToggle}
        style={{
          ...themeStyles.button,
          backgroundColor: isAnimating ? colors.button.primaryHover : colors.button.success,
        }}
      >
        {isAnimating ? '停止动画' : '开始动画'}
      </button>
      
      <div style={styles.hint}>
        {isAnimating 
          ? '动画播放期间禁用 OrbitControls' 
          : '路径根据模型自动生成'}
      </div>
    </ControlSection>
  );
}
