import React from 'react';

/**
 * Theme constants for the demo application
 */
export const colors = {
  background: {
    primary: '#1a1a2e',
    secondary: '#16213e',
    tertiary: '#0f0f23',
    input: '#1a1a2e',
  },
  border: {
    primary: '#0f3460',
  },
  text: {
    primary: '#eaeaea',
    secondary: '#a0a0a0',
    accent: '#e94560',
    success: '#69f0ae',
    error: '#ff6b6b',
    info: '#4fc3f7',
  },
  button: {
    primary: '#e94560',
    primaryHover: '#d63850',
    secondary: '#0f3460',
    disabled: '#4a4a5a',
    success: '#4caf50',
    neutral: '#333',
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
} as const;

export const typography = {
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: {
    xs: '12px',
    sm: '13px',
    md: '14px',
    lg: '16px',
    xl: '24px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
  },
} as const;

export const styles = {
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: typography.fontSize.md,
    backgroundColor: colors.background.input,
    border: `1px solid ${colors.border.primary}`,
    borderRadius: '6px',
    color: colors.text.primary,
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  } as React.CSSProperties,
  
  button: {
    width: '100%',
    padding: '12px 16px',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    backgroundColor: colors.button.primary,
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
  } as React.CSSProperties,
  
  buttonSecondary: {
    width: '100%',
    padding: '10px 14px',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    backgroundColor: colors.button.secondary,
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,
  
  label: {
    display: 'block',
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  } as React.CSSProperties,
  
  section: {
    marginBottom: spacing.xxl,
  } as React.CSSProperties,
  
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.accent,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  } as React.CSSProperties,
} as const;
