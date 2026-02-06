import React from 'react';
import { styles as themeStyles } from '../../styles/theme';

interface ControlSectionProps {
  title: string;
  children: React.ReactNode;
}

export function ControlSection({ title, children }: ControlSectionProps) {
  return (
    <section style={themeStyles.section}>
      <h2 style={themeStyles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}
