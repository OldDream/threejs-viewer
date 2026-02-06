import React from 'react';
import { ControlSection } from './ControlSection';
import { styles as themeStyles, spacing } from '../../styles/theme';

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
};

interface GridControlProps {
  showGrid: boolean;
  showAxes: boolean;
  gridPlane: 'XY' | 'XZ' | 'YZ';
  onToggleGrid: (enabled: boolean) => void;
  onToggleAxes: (enabled: boolean) => void;
  onChangePlane: (plane: 'XY' | 'XZ' | 'YZ') => void;
}

export function GridControl({
  showGrid,
  showAxes,
  gridPlane,
  onToggleGrid,
  onToggleAxes,
  onChangePlane,
}: GridControlProps) {
  return (
    <ControlSection title="Grid & Axes">
      <div style={styles.inputGroup}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => onToggleGrid(e.target.checked)}
          />
          Show Grid
        </label>
      </div>
      
      <div style={styles.inputGroup}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={showAxes}
            onChange={(e) => onToggleAxes(e.target.checked)}
          />
          Show Axes (R=X, G=Y, B=Z)
        </label>
      </div>
      
      <div style={styles.inputGroup}>
        <label style={themeStyles.label}>Grid Plane</label>
        <select
          value={gridPlane}
          onChange={(e) => onChangePlane(e.target.value as 'XY' | 'XZ' | 'YZ')}
          style={{ ...themeStyles.input, cursor: 'pointer' }}
        >
          <option value="XZ">XZ (Ground)</option>
          <option value="XY">XY (Vertical)</option>
          <option value="YZ">YZ (Side)</option>
        </select>
      </div>
    </ControlSection>
  );
}
