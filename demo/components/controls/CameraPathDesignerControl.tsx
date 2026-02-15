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

  listContainer: {
    marginTop: spacing.md,
    border: `1px solid ${colors.border.primary}`,
    borderRadius: '6px',
    overflow: 'hidden',
  } as React.CSSProperties,

  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 10px',
    backgroundColor: colors.background.secondary,
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
  } as React.CSSProperties,

  listBody: {
    maxHeight: '160px',
    overflowY: 'auto',
    backgroundColor: colors.background.tertiary,
  } as React.CSSProperties,

  listRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: '8px 10px',
    borderTop: `1px solid ${colors.border.primary}`,
    userSelect: 'none',
  } as React.CSSProperties,

  listRowSelected: {
    backgroundColor: colors.background.secondary,
  } as React.CSSProperties,

  listRowMain: {
    flex: 1,
    display: 'flex',
    gap: spacing.sm,
    alignItems: 'baseline',
    minWidth: 0,
  } as React.CSSProperties,

  listIndex: {
    width: '44px',
    flex: '0 0 auto',
    color: colors.text.accent,
    fontSize: typography.fontSize.xs,
  } as React.CSSProperties,

  listCoords: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as React.CSSProperties,

  listAction: {
    ...themeStyles.buttonSecondary,
    width: 'auto',
    flex: '0 0 auto',
    padding: '6px 10px',
    fontSize: typography.fontSize.xs,
  } as React.CSSProperties,

  listEmpty: {
    padding: spacing.md,
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
    lineHeight: 1.4,
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
  points: Array<{ x: number; y: number; z: number }>;
  pointCount: number;
  selectedIndex: number | null;
  isPickTargetArmed: boolean;
  shotJson: string;
  onToggleEditing: () => void;
  onAddPoint: () => void;
  onInsertPoint: () => void;
  onDeletePoint: () => void;
  onSelectPoint: (index: number) => void;
  onInsertPointAfterAt: (index: number) => void;
  onDeletePointAt: (index: number) => void;
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
    points,
    pointCount,
    selectedIndex,
    isPickTargetArmed,
    shotJson,
    onToggleEditing,
    onAddPoint,
    onInsertPoint,
    onDeletePoint,
    onSelectPoint,
    onInsertPointAfterAt,
    onDeletePointAt,
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
          type="button"
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
        <button type="button" onClick={onAddPoint} disabled={isPlaying} style={styles.smallButton}>
          Add Point (Current View)
        </button>
        <button
          type="button"
          onClick={onInsertPoint}
          disabled={isPlaying || selectedIndex === null}
          style={styles.smallButton}
        >
          Insert After
        </button>
      </div>

      <div style={styles.row}>
        <button
          type="button"
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
          type="button"
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

      <div style={styles.listContainer}>
        <div style={styles.listHeader}>
          <div>Points List</div>
          <div>{selectedIndex !== null ? `Selected: #${selectedIndex + 1}` : 'No selection'}</div>
        </div>
        <div style={styles.listBody}>
          {points.length === 0 ? (
            <div style={styles.listEmpty}>Add points to start building a camera path.</div>
          ) : (
            points.map((p, index) => {
              const isSelected = selectedIndex === index;
              const coords = `${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}`;
              return (
                <div
                  key={index}
                  onClick={() => {
                    if (isPlaying) return;
                    onSelectPoint(index);
                  }}
                  style={{
                    ...styles.listRow,
                    ...(isSelected ? styles.listRowSelected : null),
                    cursor: isPlaying ? 'not-allowed' : 'pointer',
                    opacity: isPlaying ? 0.6 : 1,
                  }}
                >
                  <div style={styles.listRowMain}>
                    <div style={styles.listIndex}>#{index + 1}</div>
                    <div style={styles.listCoords} title={coords}>
                      {coords}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onInsertPointAfterAt(index);
                    }}
                    disabled={isPlaying}
                    style={styles.listAction}
                  >
                    Insert
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePointAt(index);
                    }}
                    disabled={isPlaying}
                    style={{ ...styles.listAction, backgroundColor: colors.button.neutral }}
                  >
                    Delete
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div style={{ ...styles.row, marginTop: spacing.lg }}>
        <button type="button" onClick={onSetTargetToCenter} disabled={isPlaying} style={styles.smallButton}>
          Target: Model Center
        </button>
        <button
          type="button"
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
              onChange={(e) => {
                const next = Number(e.target.value);
                if (!Number.isFinite(next)) return;
                onChangeDuration(Math.max(1, next));
              }}
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
          type="button"
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
          <button type="button" onClick={onExportShot} style={styles.smallButton}>
            Export
          </button>
          <button type="button" onClick={onImportShot} style={styles.smallButton}>
            Import
          </button>
        </div>
      </div>

      <button
        type="button"
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
