import React from 'react';

export const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#1a1a2e',
    color: '#eaeaea',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    padding: '16px 24px',
    backgroundColor: '#16213e',
    borderBottom: '1px solid #0f3460',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
    color: '#e94560',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#a0a0a0',
  },
  main: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    flexShrink: 0,
    width: '320px',
    padding: '20px',
    backgroundColor: '#16213e',
    borderRight: '1px solid #0f3460',
    overflowY: 'auto',
  },
  viewerContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#0f0f23',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#e94560',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  inputGroup: {
    marginBottom: '12px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    color: '#a0a0a0',
    marginBottom: '4px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    backgroundColor: '#1a1a2e',
    border: '1px solid #0f3460',
    borderRadius: '6px',
    color: '#eaeaea',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  inputFocus: {
    borderColor: '#e94560',
  },
  button: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: 600,
    backgroundColor: '#e94560',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
  },
  buttonSecondary: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '13px',
    fontWeight: 500,
    backgroundColor: '#0f3460',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonHover: {
    backgroundColor: '#d63850',
  },
  buttonDisabled: {
    backgroundColor: '#4a4a5a',
    cursor: 'not-allowed',
  },
  row: {
    display: 'flex',
    gap: '12px',
  },
  col: {
    flex: 1,
  },
  statusContainer: {
    padding: '12px',
    borderRadius: '6px',
    backgroundColor: '#1a1a2e',
    border: '1px solid #0f3460',
  },
  loadingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#4fc3f7',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #4fc3f7',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorMessage: {
    color: '#ff6b6b',
    fontSize: '13px',
    wordBreak: 'break-word',
  },
  successMessage: {
    color: '#69f0ae',
    fontSize: '13px',
  },
  modelInfo: {
    marginTop: '8px',
    fontSize: '12px',
    color: '#a0a0a0',
  },
  overlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    color: '#a0a0a0',
  },
  overlayText: {
    fontSize: '16px',
    marginBottom: '8px',
  },
  overlayHint: {
    fontSize: '12px',
    color: '#666',
  },
} as const satisfies Record<string, React.CSSProperties>;

export const spinnerKeyframes = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

