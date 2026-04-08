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
    <ControlSection title="网格与坐标系 (Grid & Axes)">
      <div style={styles.inputGroup}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => onToggleGrid(e.target.checked)}
          />
          显示网格 (Show Grid)
        </label>
      </div>
      
      <div style={styles.inputGroup}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={showAxes}
            onChange={(e) => onToggleAxes(e.target.checked)}
          />
          显示坐标轴 (R=X, G=Y, B=Z)
        </label>
      </div>
      
      <div style={styles.inputGroup}>
        <label style={themeStyles.label}>网格平面 (Grid Plane)</label>
        <select
          value={gridPlane}
          onChange={(e) => onChangePlane(e.target.value as 'XY' | 'XZ' | 'YZ')}
          style={{ ...themeStyles.input, cursor: 'pointer' }}
        >
          <option value="XZ">XZ (地面)</option>
          <option value="XY">XY (正立面)</option>
          <option value="YZ">YZ (侧立面)</option>
        </select>
      </div>
    </ControlSection>
  );
}
