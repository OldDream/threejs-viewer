import React from 'react';
import { ControlSection } from './ControlSection';
import { styles as themeStyles, colors, spacing } from '../../styles/theme';

const styles = {
  inputGroup: {
    marginBottom: spacing.md,
  } as React.CSSProperties,
  
  row: {
    display: 'flex',
    gap: spacing.md,
  } as React.CSSProperties,
  
  col: {
    flex: 1,
  } as React.CSSProperties,
  
  checkboxLabel: {
    ...themeStyles.label,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as React.CSSProperties,
};

interface PivotPointControlProps {
  pivotX: string;
  pivotY: string;
  pivotZ: string;
  usePivotPoint: boolean;
  onChangeX: (value: string) => void;
  onChangeY: (value: string) => void;
  onChangeZ: (value: string) => void;
  onToggle: (enabled: boolean) => void;
  onApply: () => void;
}

export function PivotPointControl({
  pivotX,
  pivotY,
  pivotZ,
  usePivotPoint,
  onChangeX,
  onChangeY,
  onChangeZ,
  onToggle,
  onApply,
}: PivotPointControlProps) {
  return (
    <ControlSection title="Pivot Point">
      <div style={styles.inputGroup}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={usePivotPoint}
            onChange={(e) => onToggle(e.target.checked)}
          />
          Use Custom Pivot Point
        </label>
      </div>
      
      <div style={{ ...styles.row, opacity: usePivotPoint ? 1 : 0.5 }}>
        <div style={styles.col}>
          <label style={themeStyles.label}>X</label>
          <input
            type="number"
            value={pivotX}
            onChange={(e) => onChangeX(e.target.value)}
            disabled={!usePivotPoint}
            style={themeStyles.input}
            step="0.1"
          />
        </div>
        <div style={styles.col}>
          <label style={themeStyles.label}>Y</label>
          <input
            type="number"
            value={pivotY}
            onChange={(e) => onChangeY(e.target.value)}
            disabled={!usePivotPoint}
            style={themeStyles.input}
            step="0.1"
          />
        </div>
        <div style={styles.col}>
          <label style={themeStyles.label}>Z</label>
          <input
            type="number"
            value={pivotZ}
            onChange={(e) => onChangeZ(e.target.value)}
            disabled={!usePivotPoint}
            style={themeStyles.input}
            step="0.1"
          />
        </div>
      </div>
      
      <button
        onClick={onApply}
        style={{
          ...themeStyles.button,
          marginTop: spacing.md,
          backgroundColor: colors.button.secondary,
        }}
      >
        Apply Pivot Point
      </button>
    </ControlSection>
  );
}
