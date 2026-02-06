import React from 'react';
import { colors } from '../styles/theme';

const styles = {
  sidebar: {
    flexShrink: 0,
    width: '320px',
    padding: '20px',
    backgroundColor: colors.background.secondary,
    borderRight: `1px solid ${colors.border.primary}`,
    overflowY: 'auto',
  } as React.CSSProperties,
};

interface DemoSidebarProps {
  children: React.ReactNode;
}

export function DemoSidebar({ children }: DemoSidebarProps) {
  return (
    <aside style={styles.sidebar}>
      {children}
    </aside>
  );
}
