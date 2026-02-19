import React, { useEffect, useMemo, useState } from 'react';
import { colors, spacing, styles as themeStyles, typography } from '../styles/theme';

const styles = {
  header: {
    padding: `${spacing.sm} ${spacing.xl}`,
    backgroundColor: colors.background.secondary,
    borderBottom: `1px solid ${colors.border.primary}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  } as React.CSSProperties,
  
  titleGroup: {
    display: 'flex',
    alignItems: 'baseline',
    gap: spacing.sm,
    minWidth: 0,
  } as React.CSSProperties,

  title: {
    margin: 0,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.accent,
    lineHeight: 1.1,
    whiteSpace: 'nowrap',
  } as React.CSSProperties,
  
  subtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    lineHeight: 1.1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as React.CSSProperties,

  nav: {
    display: 'flex',
    gap: spacing.sm,
    flexShrink: 0,
  } as React.CSSProperties,
};

export function DemoHeader() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const route = useMemo(() => {
    if (hash.startsWith('#/demo2')) return 'demo2';
    return 'demo1';
  }, [hash]);

  const navButtonBase: React.CSSProperties = useMemo(() => {
    return {
      ...themeStyles.buttonSecondary,
      width: 'auto',
      padding: '6px 10px',
      fontSize: typography.fontSize.xs,
      borderRadius: '6px',
      whiteSpace: 'nowrap',
    };
  }, []);

  return (
    <header style={styles.header}>
      <div style={styles.titleGroup}>
        <h1 style={styles.title}>Three.js Viewer</h1>
        <span style={styles.subtitle}>Demo / Demo2</span>
      </div>
      <nav style={styles.nav}>
        <button
          type="button"
          onClick={() => {
            window.location.hash = '#/';
          }}
          style={{
            ...navButtonBase,
            backgroundColor: route === 'demo1' ? colors.button.primary : colors.button.secondary,
          }}
        >
          Demo
        </button>
        <button
          type="button"
          onClick={() => {
            window.location.hash = '#/demo2';
          }}
          style={{
            ...navButtonBase,
            backgroundColor: route === 'demo2' ? colors.button.primary : colors.button.secondary,
          }}
        >
          Demo2
        </button>
      </nav>
    </header>
  );
}
