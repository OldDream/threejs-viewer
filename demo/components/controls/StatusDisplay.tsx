import React from 'react';
import { ControlSection } from './ControlSection';
import { colors, spacing, typography } from '../../styles/theme';
import { ModelLoadResult } from '../../../src';

const styles = {
  statusContainer: {
    padding: spacing.md,
    borderRadius: '6px',
    backgroundColor: colors.background.input,
    border: `1px solid ${colors.border.primary}`,
  } as React.CSSProperties,
  
  loadingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    color: colors.text.info,
  } as React.CSSProperties,
  
  spinner: {
    width: '16px',
    height: '16px',
    border: `2px solid ${colors.text.info}`,
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  } as React.CSSProperties,
  
  errorMessage: {
    color: colors.text.error,
    fontSize: typography.fontSize.sm,
    wordBreak: 'break-word',
  } as React.CSSProperties,
  
  successMessage: {
    color: colors.text.success,
    fontSize: typography.fontSize.sm,
  } as React.CSSProperties,
  
  modelInfo: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  } as React.CSSProperties,
  
  idleMessage: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
  } as React.CSSProperties,
};

interface StatusDisplayProps {
  isLoading: boolean;
  error: Error | null;
  loadResult: ModelLoadResult | null;
  modelUrl: string;
}

export function StatusDisplay({ isLoading, error, loadResult, modelUrl }: StatusDisplayProps) {
  return (
    <ControlSection title="Status">
      <div style={styles.statusContainer}>
        {isLoading && (
          <div style={styles.loadingIndicator}>
            <div style={styles.spinner} />
            <span>Loading model...</span>
          </div>
        )}
        
        {error && (
          <div style={styles.errorMessage}>
            <strong>Error:</strong> {error.message}
          </div>
        )}
        
        {!isLoading && !error && loadResult && (
          <div>
            <div style={styles.successMessage}>✓ Model loaded successfully</div>
            <div style={styles.modelInfo}>
              <div>
                Center: ({loadResult.center.x.toFixed(2)}, {loadResult.center.y.toFixed(2)}, {loadResult.center.z.toFixed(2)})
              </div>
            </div>
          </div>
        )}
        
        {!isLoading && !error && !loadResult && !modelUrl && (
          <div style={styles.idleMessage}>
            Enter a model URL and click "Load Model" to begin
          </div>
        )}
      </div>
    </ControlSection>
  );
}
