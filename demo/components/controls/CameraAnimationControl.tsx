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
    <ControlSection title="Camera Path Animation">
      <div style={styles.inputGroup}>
        <label style={themeStyles.label}>View Mode</label>
        <select
          value={viewMode}
          onChange={(e) => onChangeViewMode(e.target.value as 'target' | 'fixed' | 'path')}
          disabled={isAnimating}
          style={{ ...themeStyles.input, cursor: isAnimating ? 'not-allowed' : 'pointer' }}
        >
          <option value="target">Look at Center/Model</option>
          <option value="fixed">Fixed Direction</option>
          <option value="path">Look Along Path</option>
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
        {isAnimating ? 'Stop Animation' : 'Start Animation'}
      </button>
      
      <div style={styles.hint}>
        {isAnimating 
          ? 'Orbit Controls disabled during animation' 
          : 'Path is automatically generated around the model'}
      </div>
    </ControlSection>
  );
}
