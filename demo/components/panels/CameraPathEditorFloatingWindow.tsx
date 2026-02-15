import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { FloatingRect } from '../../hooks/useDockablePanelState';
import { colors, spacing, styles as themeStyles, typography } from '../../styles/theme';
import { CameraPathEditorPanel, CameraPathEditorProps } from './CameraPathEditorPanel';

const styles = {
  window: {
    position: 'fixed',
    zIndex: 2000,
    border: `1px solid ${colors.border.primary}`,
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)',
    backgroundColor: colors.background.primary,
    minWidth: 600,
    minHeight: 500,
  } as React.CSSProperties,

  titleBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing.xs} ${spacing.sm}`,
    backgroundColor: colors.background.secondary,
    borderBottom: `1px solid ${colors.border.primary}`,
    cursor: 'move',
    userSelect: 'none',
    fontSize: typography.fontSize.xs,
    color: colors.text.accent,
    fontWeight: typography.fontWeight.semibold,
  } as React.CSSProperties,

  body: {
    height: 'calc(100% - 34px)',
    overflow: 'hidden',
  } as React.CSSProperties,

  resizeHandle: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '16px',
    height: '16px',
    cursor: 'nwse-resize',
    background: 'linear-gradient(135deg, transparent 0%, transparent 50%, rgba(233, 69, 96, 0.7) 50%, rgba(233, 69, 96, 0.7) 100%)',
  } as React.CSSProperties,
};

interface CameraPathEditorFloatingWindowProps extends CameraPathEditorProps {
  rect: FloatingRect;
  onChangeRect: (nextRect: FloatingRect) => void;
  onDock: () => void;
  onClose: () => void;
}

export function CameraPathEditorFloatingWindow({
  rect,
  onChangeRect,
  onDock,
  onClose,
  ...panelProps
}: CameraPathEditorFloatingWindowProps) {
  const dragStateRef = useRef<{
    mode: 'move' | 'resize';
    startX: number;
    startY: number;
    startRect: FloatingRect;
  } | null>(null);
  const cleanupDragRef = useRef<(() => void) | null>(null);

  const portalRoot = useMemo(() => {
    if (typeof document === 'undefined') return null;
    return document.body;
  }, []);

  const cleanupDrag = useCallback(() => {
    if (!cleanupDragRef.current) return;
    cleanupDragRef.current();
    cleanupDragRef.current = null;
  }, []);

  useEffect(() => {
    return () => cleanupDrag();
  }, [cleanupDrag]);

  const beginDrag = useCallback((
    mode: 'move' | 'resize',
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    cleanupDrag();

    dragStateRef.current = {
      mode,
      startX: event.clientX,
      startY: event.clientY,
      startRect: rect,
    };

    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = 'none';

    const handleMove = (moveEvent: MouseEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState) return;

      const deltaX = moveEvent.clientX - dragState.startX;
      const deltaY = moveEvent.clientY - dragState.startY;

      if (dragState.mode === 'move') {
        onChangeRect({
          ...dragState.startRect,
          x: dragState.startRect.x + deltaX,
          y: dragState.startRect.y + deltaY,
        });
        return;
      }

      onChangeRect({
        ...dragState.startRect,
        width: Math.max(480, dragState.startRect.width + deltaX),
        height: Math.max(300, dragState.startRect.height + deltaY),
      });
    };

    const handleUp = () => {
      cleanupDrag();
    };

    cleanupDragRef.current = () => {
      dragStateRef.current = null;
      document.body.style.userSelect = prevUserSelect;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [cleanupDrag, onChangeRect, rect]);

  if (!portalRoot) return null;

  const compactButton: React.CSSProperties = {
    ...themeStyles.buttonSecondary,
    width: 'auto',
    padding: '6px 10px',
    fontSize: typography.fontSize.xs,
    borderRadius: '6px',
    whiteSpace: 'nowrap',
  };

  return ReactDOM.createPortal(
    <div
      style={{
        ...styles.window,
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
      }}
    >
      <div
        style={styles.titleBar}
        onMouseDown={(event) => beginDrag('move', event)}
      >
        <div>Path Editor</div>
        <div style={{ display: 'flex', gap: spacing.sm }}>
          <button
            type="button"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={onDock}
            style={compactButton}
          >
            Dock
          </button>
          <button
            type="button"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={onClose}
            style={compactButton}
          >
            Close
          </button>
        </div>
      </div>

      <div style={styles.body}>
        <CameraPathEditorPanel
          {...panelProps}
          headerActions={null}
        />
      </div>

      <div
        style={styles.resizeHandle}
        onMouseDown={(event) => {
          beginDrag('resize', event);
        }}
      />
    </div>,
    portalRoot
  );
}
