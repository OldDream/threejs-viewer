import React, { useState } from 'react';
import { colors, spacing, typography } from '../../styles/theme';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  initialTabId?: string;
  className?: string;
  style?: React.CSSProperties;
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  } as React.CSSProperties,

  header: {
    display: 'flex',
    borderBottom: `1px solid ${colors.border.primary}`,
    backgroundColor: colors.background.tertiary,
  } as React.CSSProperties,

  tabButton: {
    flex: 1,
    padding: `${spacing.sm} ${spacing.md}`,
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: `2px solid transparent`,
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    transition: 'all 0.2s ease',
    outline: 'none',
    textAlign: 'center',
  } as React.CSSProperties,

  activeTab: {
    color: colors.text.accent,
    borderBottom: `2px solid ${colors.text.accent}`,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  } as React.CSSProperties,

  content: {
    flex: 1,
    overflowY: 'auto',
    padding: spacing.md,
    backgroundColor: colors.background.primary,
  } as React.CSSProperties,
};

export function Tabs({ tabs, initialTabId, style }: TabsProps) {
  const [activeTabId, setActiveTabId] = useState(initialTabId || tabs[0]?.id);

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <div style={{ ...styles.container, ...style }}>
      <div style={styles.header}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTabId(tab.id)}
            style={{
              ...styles.tabButton,
              ...(activeTabId === tab.id ? styles.activeTab : {}),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={styles.content}>
        {activeTab?.content}
      </div>
    </div>
  );
}
