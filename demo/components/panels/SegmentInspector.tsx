import React from 'react';
import {
  CameraPathDefaults,
  CameraPathSegmentConfig,
  EasingSpec,
  InterpolationType,
  SegmentOverride,
} from '../../../src';
import { colors, spacing, styles as themeStyles, typography } from '../../styles/theme';

const styles = {
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: '0.55px',
    color: 'rgba(194, 206, 236, 0.86)',
    marginBottom: spacing.xs,
  } as React.CSSProperties,

  card: {
    border: `1px solid ${colors.border.primary}`,
    borderRadius: '8px',
    padding: spacing.md,
    backgroundColor: 'rgba(15, 26, 56, 0.78)',
  } as React.CSSProperties,

  intro: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  } as React.CSSProperties,

  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  } as React.CSSProperties,

  segmentBadge: {
    border: '1px solid rgba(255, 207, 218, 0.65)',
    borderRadius: '999px',
    padding: '2px 9px',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: '#fff',
    backgroundColor: 'rgba(233, 69, 96, 0.24)',
  } as React.CSSProperties,

  playbackBadge: {
    border: `1px solid ${colors.border.primary}`,
    borderRadius: '999px',
    padding: '2px 9px',
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    backgroundColor: 'rgba(9, 14, 30, 0.55)',
  } as React.CSSProperties,

  group: {
    marginBottom: spacing.md,
    border: '1px solid rgba(98, 126, 193, 0.28)',
    borderRadius: '7px',
    padding: spacing.sm,
    backgroundColor: 'rgba(9, 14, 30, 0.38)',
  } as React.CSSProperties,

  hint: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  } as React.CSSProperties,
};

interface SegmentInspectorProps {
  selectedSegmentIndex: number | null;
  segment: CameraPathSegmentConfig | null;
  defaults: CameraPathDefaults;
  isPlaying: boolean;
  onChangeDuration: (value: number) => void;
  onChangeInterpolation: (override: SegmentOverride<InterpolationType>) => void;
  onChangeEasing: (override: SegmentOverride<EasingSpec>) => void;
}

function getInterpolationMode(segment: CameraPathSegmentConfig | null): string {
  if (!segment?.interpolation || segment.interpolation.mode === 'inherit') {
    return 'inherit';
  }
  return segment.interpolation.value;
}

function getEasingMode(segment: CameraPathSegmentConfig | null): string {
  if (!segment?.easing || segment.easing.mode === 'inherit') {
    return 'inherit';
  }
  if (segment.easing.value.type === 'linear') {
    return 'linear';
  }
  return 'smoothstep';
}

export function SegmentInspector({
  selectedSegmentIndex,
  segment,
  defaults,
  isPlaying,
  onChangeDuration,
  onChangeInterpolation,
  onChangeEasing,
}: SegmentInspectorProps) {
  const interpolationMode = getInterpolationMode(segment);
  const easingMode = getEasingMode(segment);
  const smoothstepStrength = segment?.easing?.mode === 'override' && segment.easing.value.type === 'smoothstep'
    ? segment.easing.value.strength
    : defaults.easing.type === 'smoothstep'
      ? defaults.easing.strength
      : 0.6;

  return (
    <div>
      <div style={styles.sectionTitle}>Segment Inspector</div>
      <div style={styles.card}>
        {segment && selectedSegmentIndex !== null ? (
          <>
            <div style={styles.intro}>Adjust this segment without affecting the rest of the path.</div>

            <div style={styles.badgeRow}>
              <span style={styles.segmentBadge}>Segment #{selectedSegmentIndex + 1}</span>
              <span style={styles.playbackBadge}>{isPlaying ? 'Playback locked' : 'Editable'}</span>
            </div>

            <div style={styles.group}>
              <label style={themeStyles.label}>Duration (s)</label>
              <input
                type="number"
                min={0.05}
                step={0.05}
                value={segment.duration}
                disabled={isPlaying}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (!Number.isFinite(value)) return;
                  onChangeDuration(Math.max(0.05, value));
                }}
                style={themeStyles.input}
              />
            </div>

            <div style={styles.group}>
              <label style={themeStyles.label}>Interpolation</label>
              <select
                value={interpolationMode}
                disabled={isPlaying}
                onChange={(e) => {
                  const mode = e.target.value;
                  if (mode === 'inherit') {
                    onChangeInterpolation({ mode: 'inherit' });
                    return;
                  }
                  onChangeInterpolation({
                    mode: 'override',
                    value: mode as InterpolationType,
                  });
                }}
                style={themeStyles.input}
              >
                <option value="inherit">Inherit ({defaults.interpolation})</option>
                <option value="linear">Linear</option>
                <option value="curve">Curve</option>
              </select>
            </div>

            <div style={styles.group}>
              <label style={themeStyles.label}>Easing</label>
              <select
                value={easingMode}
                disabled={isPlaying}
                onChange={(e) => {
                  const mode = e.target.value;
                  if (mode === 'inherit') {
                    onChangeEasing({ mode: 'inherit' });
                    return;
                  }
                  if (mode === 'linear') {
                    onChangeEasing({ mode: 'override', value: { type: 'linear' } });
                    return;
                  }
                  onChangeEasing({
                    mode: 'override',
                    value: {
                      type: 'smoothstep',
                      strength: smoothstepStrength,
                    },
                  });
                }}
                style={themeStyles.input}
              >
                <option value="inherit">
                  Inherit ({defaults.easing.type === 'linear' ? 'linear' : `smoothstep(${defaults.easing.strength.toFixed(2)})`})
                </option>
                <option value="linear">Linear</option>
                <option value="smoothstep">Smoothstep</option>
              </select>

              {easingMode === 'smoothstep' ? (
                <>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={smoothstepStrength}
                    disabled={isPlaying}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      onChangeEasing({
                        mode: 'override',
                        value: {
                          type: 'smoothstep',
                          strength: Math.max(0, Math.min(1, value)),
                        },
                      });
                    }}
                    style={{ width: '100%', marginTop: spacing.sm }}
                  />
                  <div style={styles.hint}>Smoothstep Strength: {smoothstepStrength.toFixed(2)}</div>
                </>
              ) : null}
            </div>
          </>
        ) : (
          <div style={styles.hint}>Select a segment in timeline to edit.</div>
        )}
      </div>
    </div>
  );
}
