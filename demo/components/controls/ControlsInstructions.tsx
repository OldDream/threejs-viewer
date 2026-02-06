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
    <ControlSection title="Controls">
      <div style={styles.instructions}>
        <p style={styles.paragraph}><strong>Rotate:</strong> Left-click and drag</p>
        <p style={styles.paragraph}><strong>Zoom:</strong> Scroll wheel or pinch</p>
        <p style={styles.paragraph}><strong>Pan:</strong> Right-click and drag</p>
        
        <p style={{ ...styles.paragraph, ...styles.divider }}>
          <strong>Keyboard Movement:</strong>
        </p>
        <p style={styles.paragraph}>
          <strong>W / S:</strong> Move forward / backward {isCSMode ? '(View Direction)' : '(Ground)'}
        </p>
        <p style={styles.paragraph}><strong>A / D:</strong> Move left / right</p>
        <p style={styles.paragraph}><strong>Shift:</strong> Move up</p>
        <p style={styles.paragraph}><strong>Ctrl:</strong> Move down</p>
      </div>
    </ControlSection>
  );
}
