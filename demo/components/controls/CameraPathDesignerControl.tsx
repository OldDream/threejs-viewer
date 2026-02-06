import React from 'react';
import { ControlSection } from './ControlSection';
import { styles as themeStyles, colors, spacing, typography } from '../../styles/theme';

const styles = {
  row: {
    display: 'flex',
    gap: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.md,
  } as React.CSSProperties,

  half: {
    flex: 1,
  } as React.CSSProperties,

  hint: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    lineHeight: 1.4,
  } as React.CSSProperties,

  smallButton: {
    ...themeStyles.buttonSecondary,
    width: 'auto',
    flex: 1,
  } as React.CSSProperties,

  textarea: {
    ...themeStyles.input,
    height: '140px',
    resize: 'vertical',
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.xs,
  } as React.CSSProperties,
};

interface CameraPathDesignerControlProps {
  isEditing: boolean;
  isPlaying: boolean;
  duration: number;
  loop: boolean;
  easeInOut: number;
  pointCount: number;
  selectedIndex: number | null;
  isPickTargetArmed: boolean;
  shotJson: string;
  onToggleEditing: () => void;
  onAddPoint: () => void;
  onInsertPoint: () => void;
  onDeletePoint: () => void;
  onClearPath: () => void;
  onSetTargetToCenter: () => void;
  onPickTargetOnce: () => void;
  onPlay: () => void;
  onStop: () => void;
  onExportShot: () => void;
  onImportShot: () => void;
  onReset: () => void;
  onChangeDuration: (value: number) => void;
  onChangeLoop: (value: boolean) => void;
  onChangeEaseInOut: (value: number) => void;
  onChangeShotJson: (value: string) => void;
}

export function CameraPathDesignerControl(props: CameraPathDesignerControlProps) {
  const {
    isEditing,
    isPlaying,
    duration,
    loop,
    easeInOut,
    pointCount,
    selectedIndex,
    isPickTargetArmed,
    shotJson,
    onToggleEditing,
    onAddPoint,
    onInsertPoint,
    onDeletePoint,
    onClearPath,
    onSetTargetToCenter,
    onPickTargetOnce,
    onPlay,
    onStop,
    onExportShot,
    onImportShot,
    onReset,
    onChangeDuration,
    onChangeLoop,
    onChangeEaseInOut,
    onChangeShotJson,
  } = props;

  return (
    <ControlSection title="Camera Path Designer">
      <div style={styles.row}>
        <button
          onClick={onToggleEditing}
          disabled={isPlaying}
          style={{
            ...themeStyles.buttonSecondary,
            backgroundColor: isEditing ? colors.button.primary : colors.button.secondary,
            cursor: isPlaying ? 'not-allowed' : 'pointer',
          }}
        >
          {isEditing ? 'Editing: ON' : 'Editing: OFF'}
        </button>
      </div>

      <div style={styles.row}>
        <button onClick={onAddPoint} disabled={isPlaying} style={styles.smallButton}>
          Add Point (Current View)
        </button>
        <button
          onClick={onInsertPoint}
          disabled={isPlaying || selectedIndex === null}
          style={styles.smallButton}
        >
          Insert After
        </button>
      </div>

      <div style={styles.row}>
        <button
          onClick={onDeletePoint}
          disabled={isPlaying || selectedIndex === null}
          style={{
            ...styles.smallButton,
            backgroundColor: colors.button.neutral,
          }}
        >
          Delete Selected
        </button>
        <button
          onClick={onClearPath}
          disabled={isPlaying}
          style={{
            ...styles.smallButton,
            backgroundColor: colors.button.neutral,
          }}
        >
          Clear
        </button>
      </div>

      <div style={styles.hint}>
        Points: {pointCount}
        {selectedIndex !== null ? ` · Selected: #${selectedIndex + 1}` : ''}
      </div>

      <div style={{ ...styles.row, marginTop: spacing.lg }}>
        <button onClick={onSetTargetToCenter} disabled={isPlaying} style={styles.smallButton}>
          Target: Model Center
        </button>
        <button
          onClick={onPickTargetOnce}
          disabled={isPlaying}
          style={{
            ...styles.smallButton,
            backgroundColor: isPickTargetArmed ? colors.button.primaryHover : colors.button.secondary,
          }}
        >
          {isPickTargetArmed ? 'Click Scene to Pick…' : 'Target: Pick Once'}
        </button>
      </div>

      <div style={{ marginTop: spacing.lg }}>
        <div style={styles.row}>
          <div style={styles.half}>
            <label style={themeStyles.label}>Duration (s)</label>
            <input
              type="number"
              min={1}
              step={0.5}
              value={duration}
              disabled={isPlaying}
              onChange={(e) => onChangeDuration(Number(e.target.value))}
              style={themeStyles.input}
            />
          </div>
          <div style={styles.half}>
            <label style={themeStyles.label}>Loop</label>
            <select
              value={loop ? '1' : '0'}
              disabled={isPlaying}
              onChange={(e) => onChangeLoop(e.target.value === '1')}
              style={{ ...themeStyles.input, cursor: isPlaying ? 'not-allowed' : 'pointer' }}
            >
              <option value="0">Off</option>
              <option value="1">On</option>
            </select>
          </div>
        </div>

        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={themeStyles.label}>Ease In/Out</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={easeInOut}
              disabled={isPlaying}
              onChange={(e) => onChangeEaseInOut(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={styles.hint}>Current: {easeInOut.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: spacing.lg }}>
        <button
          onClick={isPlaying ? onStop : onPlay}
          style={{
            ...themeStyles.button,
            backgroundColor: isPlaying ? colors.button.primaryHover : colors.button.success,
          }}
          disabled={pointCount < 2}
        >
          {isPlaying ? 'Stop Preview' : 'Play Preview'}
        </button>
        <div style={styles.hint}>
          {isEditing
            ? 'Edit: click a point to select, drag to move. Orbit is disabled while dragging.'
            : 'Tip: move the camera to a view you like, then click “Add Point”.'}
        </div>
      </div>

      <div style={{ marginTop: spacing.lg }}>
        <label style={themeStyles.label}>Shot JSON</label>
        <textarea
          value={shotJson}
          onChange={(e) => onChangeShotJson(e.target.value)}
          style={styles.textarea}
          spellCheck={false}
        />
        <div style={styles.row}>
          <button onClick={onExportShot} style={styles.smallButton}>
            Export
          </button>
          <button onClick={onImportShot} style={styles.smallButton}>
            Import
          </button>
        </div>
      </div>

      <button
        onClick={onReset}
        style={{
          ...themeStyles.button,
          backgroundColor: colors.button.neutral,
          marginTop: spacing.lg,
        }}
      >
        Reset Designer
      </button>
    </ControlSection>
  );
}

