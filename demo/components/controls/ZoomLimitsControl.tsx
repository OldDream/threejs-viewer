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

interface ZoomLimitsControlProps {
  zoomMin: string;
  zoomMax: string;
  useZoomLimits: boolean;
  onChangeMin: (value: string) => void;
  onChangeMax: (value: string) => void;
  onToggle: (enabled: boolean) => void;
  onApply: () => void;
}

export function ZoomLimitsControl({
  zoomMin,
  zoomMax,
  useZoomLimits,
  onChangeMin,
  onChangeMax,
  onToggle,
  onApply,
}: ZoomLimitsControlProps) {
  return (
    <ControlSection title="Zoom Limits">
      <div style={styles.inputGroup}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={useZoomLimits}
            onChange={(e) => onToggle(e.target.checked)}
          />
          Use Custom Zoom Limits
        </label>
      </div>
      
      <div style={{ ...styles.row, opacity: useZoomLimits ? 1 : 0.5 }}>
        <div style={styles.col}>
          <label style={themeStyles.label}>Min Distance</label>
          <input
            type="number"
            value={zoomMin}
            onChange={(e) => onChangeMin(e.target.value)}
            disabled={!useZoomLimits}
            style={themeStyles.input}
            step="0.1"
            min="0.01"
          />
        </div>
        <div style={styles.col}>
          <label style={themeStyles.label}>Max Distance</label>
          <input
            type="number"
            value={zoomMax}
            onChange={(e) => onChangeMax(e.target.value)}
            disabled={!useZoomLimits}
            style={themeStyles.input}
            step="1"
            min="0.1"
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
        Apply Zoom Limits
      </button>
    </ControlSection>
  );
}
