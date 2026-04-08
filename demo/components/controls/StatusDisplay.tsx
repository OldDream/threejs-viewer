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
    <ControlSection title="状态">
      <div style={styles.statusContainer}>
        {isLoading && (
          <div style={styles.loadingIndicator}>
            <div style={styles.spinner} />
            <span>加载模型中...</span>
          </div>
        )}
        
        {error && (
          <div style={styles.errorMessage}>
            <strong>错误:</strong> {error.message}
          </div>
        )}
        
        {!isLoading && !error && loadResult && (
          <div>
            <div style={styles.successMessage}>✓ 模型加载成功</div>
            <div style={styles.modelInfo}>
              <div>
                中心坐标: ({loadResult.center.x.toFixed(2)}, {loadResult.center.y.toFixed(2)}, {loadResult.center.z.toFixed(2)})
              </div>
            </div>
          </div>
        )}
        
        {!isLoading && !error && !loadResult && !modelUrl && (
          <div style={styles.idleMessage}>
            请输入模型 URL 并点击 "加载模型" 开始
          </div>
        )}
      </div>
    </ControlSection>
  );
}
