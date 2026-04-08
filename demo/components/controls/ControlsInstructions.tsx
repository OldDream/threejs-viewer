import React from 'react';
import { ControlSection } from './ControlSection';
import { colors, spacing, typography } from '../../styles/theme';

const styles = {
  instructions: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    lineHeight: 1.6,
  } as React.CSSProperties,
  
  paragraph: {
    margin: 0,
    marginBottom: spacing.xs,
  } as React.CSSProperties,
  
  divider: {
    marginTop: spacing.md,
    borderTop: `1px solid ${colors.border.primary}`,
    paddingTop: spacing.md,
  } as React.CSSProperties,
};

interface ControlsInstructionsProps {
  isCSMode: boolean;
}

export function ControlsInstructions({ isCSMode }: ControlsInstructionsProps) {
  return (
    <ControlSection title="操作说明">
      <div style={styles.instructions}>
        <p style={styles.paragraph}><strong>旋转:</strong> 左键 + 拖拽</p>
        <p style={styles.paragraph}><strong>缩放:</strong> 滚轮或双指缩放</p>
        <p style={styles.paragraph}><strong>平移:</strong> 右键 + 拖拽</p>
        
        <p style={{ ...styles.paragraph, ...styles.divider }}>
          <strong>键盘移动:</strong>
        </p>
        <p style={styles.paragraph}>
          <strong>W / S:</strong> 前进 / 后退 {isCSMode ? '(参照视图方向)' : '(参照地面)'}
        </p>
        <p style={styles.paragraph}><strong>A / D:</strong> 向左 / 向右平移</p>
        <p style={styles.paragraph}><strong>Shift:</strong> 向上平移</p>
        <p style={styles.paragraph}><strong>Ctrl:</strong> 向下平移</p>
      </div>
    </ControlSection>
  );
}
