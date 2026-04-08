import React from 'react';
import { ControlSection } from './ControlSection';
import { colors, spacing, styles as themeStyles, typography } from '../../styles/theme';

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

  hint: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    lineHeight: 1.4,
  } as React.CSSProperties,
};

interface ModelAnimationControlProps {
  autoPlay: boolean;
  hasAnimations: boolean;
  clipCount: number;
  onToggleAutoPlay: () => void;
}

export function ModelAnimationControl({
  autoPlay,
  hasAnimations,
  clipCount,
  onToggleAutoPlay,
}: ModelAnimationControlProps) {
  return (
    <ControlSection title="模型动画 (Model Animation)">
      <div style={styles.inputGroup}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={autoPlay}
            onChange={onToggleAutoPlay}
            disabled={!hasAnimations}
          />
          自动播放 (AutoPlay)
        </label>
      </div>

      <div style={styles.hint}>
        {hasAnimations ? `动画片段数 (Clips): ${clipCount}` : '此模型没有动画'}
      </div>
    </ControlSection>
  );
}

