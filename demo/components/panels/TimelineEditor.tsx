import React, { useEffect, useMemo, useRef } from 'react';
import { CameraPathSegmentConfig } from '../../../src';
import { colors, spacing, typography } from '../../styles/theme';

const MIN_SEGMENT_DURATION = 0.05;

const styles = {
  container: {
    border: `1px solid ${colors.border.primary}`,
    borderRadius: '8px',
    backgroundColor: 'rgba(13, 19, 38, 0.9)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  } as React.CSSProperties,

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: `${spacing.xs} ${spacing.sm}`,
    borderBottom: `1px solid ${colors.border.primary}`,
    backgroundColor: 'rgba(20, 29, 58, 0.92)',
    flexShrink: 0,
    flexWrap: 'wrap',
  } as React.CSSProperties,

  totalLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: '#edf2ff',
  } as React.CSSProperties,

  hint: {
    fontSize: '11px',
    color: 'rgba(190, 204, 239, 0.8)',
  } as React.CSSProperties,

  body: {
    flex: 1,
    minHeight: 0,
    overflowX: 'auto',
    overflowY: 'hidden',
    padding: spacing.sm,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  } as React.CSSProperties,

  canvas: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  } as React.CSSProperties,

  ruler: {
    height: '26px',
    position: 'relative',
    borderBottom: `1px solid rgba(126, 148, 205, 0.55)`,
    marginBottom: spacing.xs,
    flexShrink: 0,
  } as React.CSSProperties,

  rulerTick: {
    position: 'absolute',
    top: 0,
    width: '1px',
    height: '14px',
    backgroundColor: 'rgba(190, 203, 235, 0.7)',
  } as React.CSSProperties,

  rulerLabel: {
    position: 'absolute',
    top: '14px',
    transform: 'translateX(-50%)',
    fontSize: '10px',
    color: 'rgba(190, 203, 235, 0.84)',
  } as React.CSSProperties,

  trackFrame: {
    display: 'flex',
    alignItems: 'stretch',
    minHeight: '96px',
    position: 'relative',
    background: 'linear-gradient(180deg, rgba(8, 11, 26, 0.9) 0%, rgba(13, 16, 33, 0.92) 100%)',
    borderRadius: '8px',
    border: `1px solid rgba(115, 135, 192, 0.3)`,
    padding: '4px',
  } as React.CSSProperties,

  segment: {
    position: 'relative',
    borderRadius: '6px',
    padding: `${spacing.xs} ${spacing.xs}`,
    fontSize: typography.fontSize.xs,
    color: '#f5f7ff',
    cursor: 'pointer',
    userSelect: 'none',
    overflow: 'hidden',
    minWidth: '52px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    marginRight: spacing.xs,
  } as React.CSSProperties,

  segmentSelected: {
    boxShadow: '0 0 0 1px rgba(255, 219, 228, 0.7), 0 8px 18px rgba(0, 0, 0, 0.25)',
    transform: 'translateY(-1px)',
  } as React.CSSProperties,

  segmentTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  } as React.CSSProperties,

  segmentTopRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    minWidth: 0,
  } as React.CSSProperties,

  segmentId: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.45px',
    opacity: 0.95,
  } as React.CSSProperties,

  segmentDuration: {
    fontWeight: typography.fontWeight.semibold,
    fontSize: '11px',
    whiteSpace: 'nowrap',
  } as React.CSSProperties,

  segmentCurveButton: {
    border: '1px solid rgba(255, 255, 255, 0.35)',
    borderRadius: '999px',
    padding: '1px 7px',
    backgroundColor: 'rgba(8, 14, 30, 0.42)',
    color: '#ffffff',
    fontSize: '10px',
    lineHeight: 1.4,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  } as React.CSSProperties,

  segmentRange: {
    fontSize: '10px',
    opacity: 0.82,
    marginTop: '3px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as React.CSSProperties,

  segmentMeta: {
    fontSize: '10px',
    opacity: 0.78,
    marginTop: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as React.CSSProperties,

  segmentCompactMeta: {
    fontSize: '10px',
    opacity: 0.72,
    marginTop: '3px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as React.CSSProperties,

  boundaryHandle: {
    position: 'absolute',
    right: '-5px',
    top: 0,
    width: '10px',
    height: '100%',
    cursor: 'col-resize',
    zIndex: 4,
  } as React.CSSProperties,

  boundaryLine: {
    position: 'absolute',
    right: '4px',
    top: '11%',
    width: '2px',
    height: '78%',
    backgroundColor: 'rgba(255, 220, 227, 0.95)',
    borderRadius: '2px',
    boxShadow: '0 0 0 1px rgba(233, 69, 96, 0.35)',
  } as React.CSSProperties,

  emptyState: {
    minHeight: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    border: `1px dashed rgba(112, 139, 205, 0.42)`,
    backgroundColor: 'rgba(12, 16, 30, 0.4)',
    color: 'rgba(181, 195, 233, 0.86)',
    fontSize: typography.fontSize.xs,
    padding: spacing.md,
    textAlign: 'center',
  } as React.CSSProperties,
};

interface TimelineEditorProps {
  segments: CameraPathSegmentConfig[];
  selectedSegmentIndex: number | null;
  zoomPxPerSecond: number;
  snapSeconds: number;
  isPlaying: boolean;
  isEditing: boolean;
  onSelectSegment: (index: number) => void;
  onSetBoundaryDurations: (boundaryIndex: number, leftDuration: number, rightDuration: number) => void;
  onSetSegmentDuration: (index: number, duration: number) => void;
  onOpenCurveEditor?: (index: number) => void;
}

function formatInterpolation(segment: CameraPathSegmentConfig): string {
  if (!segment.interpolation || segment.interpolation.mode === 'inherit') return 'interp: inherit';
  return `interp: ${segment.interpolation.value}`;
}

function formatEasing(segment: CameraPathSegmentConfig): string {
  if (!segment.easing || segment.easing.mode === 'inherit') return 'easing: inherit';
  if (segment.easing.value.type === 'linear') return 'easing: linear';
  return `easing: smooth(${segment.easing.value.strength.toFixed(2)})`;
}

function formatTimestamp(seconds: number): string {
  return `${seconds.toFixed(2)}s`;
}

function getSegmentBackground(index: number, isSelected: boolean): string {
  if (isSelected) {
    return 'linear-gradient(140deg, rgba(233, 69, 96, 0.96) 0%, rgba(185, 45, 76, 0.96) 100%)';
  }
  const tones = [
    'linear-gradient(140deg, rgba(60, 106, 212, 0.84) 0%, rgba(37, 75, 160, 0.84) 100%)',
    'linear-gradient(140deg, rgba(65, 145, 187, 0.82) 0%, rgba(39, 102, 147, 0.82) 100%)',
    'linear-gradient(140deg, rgba(110, 96, 199, 0.82) 0%, rgba(69, 62, 155, 0.82) 100%)',
  ];
  return tones[index % tones.length] ?? 'linear-gradient(140deg, rgba(60, 106, 212, 0.84) 0%, rgba(37, 75, 160, 0.84) 100%)';
}

export function TimelineEditor({
  segments,
  selectedSegmentIndex,
  zoomPxPerSecond,
  snapSeconds,
  isPlaying,
  isEditing,
  onSelectSegment,
  onSetBoundaryDurations,
  onSetSegmentDuration,
  onOpenCurveEditor,
}: TimelineEditorProps) {
  const dragRef = useRef<{
    boundaryIndex: number;
    startX: number;
    leftDuration: number;
    rightDuration: number;
  } | null>(null);
  const cleanupDragRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      cleanupDragRef.current?.();
      cleanupDragRef.current = null;
    };
  }, []);

  const totalDuration = useMemo(() => {
    return segments.reduce((sum, segment) => sum + segment.duration, 0);
  }, [segments]);

  const segmentTimeline = useMemo(() => {
    let cursor = 0;
    return segments.map((segment, index) => {
      const start = cursor;
      const end = start + segment.duration;
      cursor = end;
      return {
        index,
        segment,
        start,
        end,
      };
    });
  }, [segments]);

  const timelineWidth = useMemo(() => {
    if (segments.length === 0) return 360;
    const computed = totalDuration * zoomPxPerSecond;
    return Math.max(computed, segments.length * 72, 360);
  }, [segments.length, totalDuration, zoomPxPerSecond]);

  const handleBoundaryDragStart = (event: React.MouseEvent, boundaryIndex: number) => {
    if (isPlaying || !isEditing) return;
    const left = segments[boundaryIndex];
    const right = segments[boundaryIndex + 1];
    if (!left || !right) return;

    event.preventDefault();
    event.stopPropagation();

    cleanupDragRef.current?.();
    cleanupDragRef.current = null;
    dragRef.current = {
      boundaryIndex,
      startX: event.clientX,
      leftDuration: left.duration,
      rightDuration: right.duration,
    };

    const handleMove = (moveEvent: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const deltaSecondsRaw = (moveEvent.clientX - drag.startX) / zoomPxPerSecond;
      const dynamicSnap = moveEvent.shiftKey ? 0.01 : snapSeconds;
      const deltaSeconds = Math.round(deltaSecondsRaw / dynamicSnap) * dynamicSnap;
      const total = drag.leftDuration + drag.rightDuration;
      const minLeft = MIN_SEGMENT_DURATION;
      const maxLeft = total - MIN_SEGMENT_DURATION;
      const nextLeft = Math.max(minLeft, Math.min(maxLeft, drag.leftDuration + deltaSeconds));
      const nextRight = total - nextLeft;
      onSetBoundaryDurations(drag.boundaryIndex, nextLeft, nextRight);
    };

    const handleUp = () => {
      cleanupDragRef.current?.();
    };

    cleanupDragRef.current = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      cleanupDragRef.current = null;
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const rulerMarks = useMemo(() => {
    if (totalDuration <= 0) return [];
    const step = totalDuration > 24 ? 2 : 1;
    const marks: number[] = [];
    for (let second = 0; second <= Math.ceil(totalDuration); second += step) {
      marks.push(second);
    }
    const roundedTotal = Math.ceil(totalDuration);
    if (marks[marks.length - 1] !== roundedTotal) {
      marks.push(roundedTotal);
    }
    return marks;
  }, [totalDuration]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.totalLabel}>Total {totalDuration.toFixed(2)}s</div>
        <div style={styles.hint}>
          {isEditing
            ? 'Drag a boundary to redistribute duration. Hold Shift for 0.01s precision.'
            : 'Viewing mode: timing controls are locked.'}
        </div>
      </div>

      <div style={styles.body}>
        {segments.length === 0 ? (
          <div style={styles.emptyState}>Create at least two keyframes to start editing timeline segments.</div>
        ) : (
          <div style={{ ...styles.canvas, width: `${timelineWidth}px` }}>
            <div style={styles.ruler}>
              {rulerMarks.map((mark) => {
                const left = `${(mark / Math.max(totalDuration, 1e-6)) * 100}%`;
                return (
                  <React.Fragment key={mark}>
                    <div style={{ ...styles.rulerTick, left }} />
                    <div style={{ ...styles.rulerLabel, left }}>{mark}s</div>
                  </React.Fragment>
                );
              })}
            </div>

            <div style={styles.trackFrame}>
              {segmentTimeline.map(({ segment, index, start, end }) => {
                const width = Math.max(52, segment.duration * zoomPxPerSecond);
                const selected = selectedSegmentIndex === index;
                const compact = width < 130;

                return (
                  <div
                    key={`segment-${index}`}
                    onClick={() => onSelectSegment(index)}
                    onDoubleClick={() => {
                      if (isPlaying || !isEditing) return;
                      const input = window.prompt('Set segment duration (seconds)', String(segment.duration));
                      if (!input) return;
                      const value = Number(input);
                      if (!Number.isFinite(value)) return;
                      onSetSegmentDuration(index, Math.max(MIN_SEGMENT_DURATION, value));
                    }}
                    style={{
                      ...styles.segment,
                      ...(selected ? styles.segmentSelected : null),
                      width: `${width}px`,
                      opacity: isPlaying ? 0.7 : isEditing ? 1 : 0.88,
                      filter: isPlaying ? 'saturate(0.85)' : isEditing ? 'none' : 'saturate(0.9)',
                      background: getSegmentBackground(index, selected),
                      marginRight: index === segmentTimeline.length - 1 ? 0 : styles.segment.marginRight,
                    }}
                    title={`Segment ${index + 1}: ${segment.duration.toFixed(2)}s`}
                  >
                    <div>
                      <div style={styles.segmentTop}>
                        <span style={styles.segmentId}>S{index + 1}</span>
                        <div style={styles.segmentTopRight}>
                          <span style={styles.segmentDuration}>{segment.duration.toFixed(2)}s</span>
                          {onOpenCurveEditor && isEditing ? (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                onOpenCurveEditor(index);
                              }}
                              style={styles.segmentCurveButton}
                              title={`Open curve editor for segment ${index + 1}`}
                            >
                              Curve
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <div style={styles.segmentRange}>{formatTimestamp(start)} - {formatTimestamp(end)}</div>
                    </div>

                    {compact ? (
                      <div style={styles.segmentCompactMeta}>{formatInterpolation(segment)}</div>
                    ) : (
                      <>
                        <div style={styles.segmentMeta}>{formatInterpolation(segment)}</div>
                        <div style={styles.segmentMeta}>{formatEasing(segment)}</div>
                      </>
                    )}

                    {index < segmentTimeline.length - 1 ? (
                      <div
                        style={styles.boundaryHandle}
                        onMouseDown={(event) => handleBoundaryDragStart(event, index)}
                      >
                        <div style={styles.boundaryLine} />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
