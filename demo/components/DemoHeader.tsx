import React from 'react';
import { colors, typography } from '../styles/theme';

const styles = {
  header: {
    padding: '16px 24px',
    backgroundColor: colors.background.secondary,
    borderBottom: `1px solid ${colors.border.primary}`,
  } as React.CSSProperties,
  
  title: {
    margin: 0,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.accent,
  } as React.CSSProperties,
  
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  } as React.CSSProperties,
};

export function DemoHeader() {
  return (
    <header style={styles.header}>
      <h1 style={styles.title}>Three.js Viewer Demo</h1>
      <p style={styles.subtitle}>
        A modular 3D model viewer component for React
      </p>
    </header>
  );
}
