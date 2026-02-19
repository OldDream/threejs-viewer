import React from 'react';
import ReactDOM from 'react-dom';
import { colors, spacing, styles as themeStyles, typography } from '../../styles/theme';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 3000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  modal: {
    backgroundColor: colors.background.primary,
    border: `1px solid ${colors.border.primary}`,
    borderRadius: '8px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)',
    width: '600px',
    maxWidth: '90vw',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  } as React.CSSProperties,

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing.sm} ${spacing.md}`,
    backgroundColor: colors.background.secondary,
    borderBottom: `1px solid ${colors.border.primary}`,
  } as React.CSSProperties,

  title: {
    margin: 0,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  } as React.CSSProperties,

  body: {
    padding: spacing.md,
    overflowY: 'auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  } as React.CSSProperties,

  textarea: {
    ...themeStyles.input,
    width: '100%',
    flex: 1,
    minHeight: '200px',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: typography.fontSize.xs,
    resize: 'none',
  } as React.CSSProperties,

  footer: {
    padding: spacing.md,
    borderTop: `1px solid ${colors.border.primary}`,
    backgroundColor: colors.background.secondary,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  } as React.CSSProperties,
};

interface CameraViewPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  json: string;
  onChangeJson: (value: string) => void;
  onExportFromCamera: () => void;
  onApplyToCamera: () => void;
}

export function CameraViewPresetModal({
  isOpen,
  onClose,
  json,
  onChangeJson,
  onExportFromCamera,
  onApplyToCamera,
}: CameraViewPresetModalProps) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>Camera View Preset</h3>
          <button
            type="button"
            onClick={onClose}
            style={{ ...themeStyles.buttonSecondary, padding: '4px 8px' }}
          >
            ✕
          </button>
        </div>

        <div style={styles.body}>
          <textarea
            value={json}
            onChange={(e) => onChangeJson(e.target.value)}
            style={styles.textarea}
            spellCheck={false}
          />
        </div>

        <div style={styles.footer}>
          <button type="button" onClick={onExportFromCamera} style={themeStyles.buttonSecondary}>
            Export from Current
          </button>
          <button type="button" onClick={onApplyToCamera} style={themeStyles.buttonSecondary}>
            Apply
          </button>
          <button type="button" onClick={onClose} style={themeStyles.button}>
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

