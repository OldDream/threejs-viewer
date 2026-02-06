import React from 'react';
import { colors, typography } from '../styles/theme';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    backgroundColor: colors.background.primary,
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
  } as React.CSSProperties,
  
  main: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  } as React.CSSProperties,
};

interface DemoLayoutProps {
  children: React.ReactNode;
}

export function DemoLayout({ children }: DemoLayoutProps) {
  return (
    <div style={styles.container}>
      {children}
    </div>
  );
}

interface DemoMainProps {
  children: React.ReactNode;
}

export function DemoMain({ children }: DemoMainProps) {
  return (
    <main style={styles.main}>
      {children}
    </main>
  );
}
