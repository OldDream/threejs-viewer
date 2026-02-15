import React from 'react';
import { colors, spacing, styles as themeStyles, typography } from '../../styles/theme';

interface TransportBarProps {
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
  onLoopToggle: (loop: boolean) => void;
  loop: boolean;
  onToggleEdit: () => void;
  isEditing: boolean;
}

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    padding: `${spacing.sm} ${spacing.md}`,
    flex: 1,
  } as React.CSSProperties,

  group: {
    display: 'flex',
    gap: spacing.sm,
    alignItems: 'center',
  } as React.CSSProperties,

  playButton: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.button.primary,
    color: colors.text.primary,
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  } as React.CSSProperties,

  secondaryButton: {
    ...themeStyles.buttonSecondary,
    padding: '6px 12px',
    fontSize: typography.fontSize.xs,
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
  } as React.CSSProperties,

  activeButton: {
    backgroundColor: colors.button.secondary,
    color: colors.text.accent,
    borderColor: colors.text.accent,
  } as React.CSSProperties,
};

export function TransportBar({
  isPlaying,
  onPlay,
  onStop,
  onLoopToggle,
  loop,
  onToggleEdit,
  isEditing,
}: TransportBarProps) {
  return (
    <div style={styles.container}>
      <div style={styles.group}>
        <button
          type="button"
          onClick={onToggleEdit}
          style={{
            ...styles.secondaryButton,
            ...(isEditing ? styles.activeButton : {}),
          }}
          title="Toggle Edit Mode"
        >
          {isEditing ? '🖊️ Editing' : '👁️ Viewing'}
        </button>
      </div>

      <div style={{ ...styles.group, justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => onLoopToggle(!loop)}
          style={{
            ...styles.secondaryButton,
            ...(loop ? styles.activeButton : {}),
          }}
          title="Loop Playback"
        >
          🔁
        </button>

        <button
          type="button"
          onClick={isPlaying ? onStop : onPlay}
          style={{
            ...styles.playButton,
            backgroundColor: isPlaying ? colors.button.primaryHover : colors.button.success,
          }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <button
          type="button"
          onClick={onStop}
          disabled={!isPlaying}
          style={{
            ...styles.secondaryButton,
            opacity: isPlaying ? 1 : 0.5,
          }}
          title="Stop"
        >
          ⏹
        </button>
      </div>
      
      <div style={styles.group}>
        <button
          type="button"
          style={{
            ...styles.secondaryButton,
            visibility: 'hidden',
          }}
        >
          {isEditing ? '🖊️ Editing' : '👁️ Viewing'}
        </button>
      </div>
    </div>
  );
}
