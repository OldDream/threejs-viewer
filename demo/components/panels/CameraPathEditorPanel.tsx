import React, { useEffect, useMemo, useState } from 'react';
import {
  CameraPathDefaults,
  CameraPathSegmentConfig,
  EasingSpec,
  InterpolationType,
  SegmentOverride,
} from '../../../src';
import { colors, spacing, styles as themeStyles, typography } from '../../styles/theme';
import { SegmentInspector } from './SegmentInspector';
import { ShotJsonModal } from './ShotJsonModal';
import { TimelineEditor } from './TimelineEditor';

const SNAP_OPTIONS = [0.1, 0.01] as const;

function formatTime(seconds: number): string {
  return `${seconds.toFixed(2)}s`;
}

type SegmentEasingMode = 'inherit' | 'linear' | 'smoothstep';

function getSegmentInterpolationMode(segment: CameraPathSegmentConfig): 'inherit' | InterpolationType {
  if (!segment.interpolation || segment.interpolation.mode === 'inherit') return 'inherit';
  return segment.interpolation.value;
}

function getSegmentEasingMode(segment: CameraPathSegmentConfig): SegmentEasingMode {
  if (!segment.easing || segment.easing.mode === 'inherit') return 'inherit';
  return segment.easing.value.type === 'linear' ? 'linear' : 'smoothstep';
}

function getSegmentSmoothstepStrength(segment: CameraPathSegmentConfig, defaults: CameraPathDefaults): number {
  if (segment.easing?.mode === 'override' && segment.easing.value.type === 'smoothstep') {
    return segment.easing.value.strength;
  }
  if (defaults.easing.type === 'smoothstep') {
    return defaults.easing.strength;
  }
  return 0.6;
}

const styles = {
  panel: {
    borderTop: `1px solid ${colors.border.primary}`,
    background: 'radial-gradient(circle at top left, #1f2750 0%, #141a35 45%, #11162c 100%)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  } as React.CSSProperties,

  header: {
    padding: `${spacing.md} ${spacing.md} ${spacing.sm}`,
    borderBottom: `1px solid ${colors.border.primary}`,
    background: 'linear-gradient(160deg, rgba(30, 43, 84, 0.94) 0%, rgba(17, 23, 45, 0.96) 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  } as React.CSSProperties,

  headerTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    flexWrap: 'wrap',
  } as React.CSSProperties,

  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 220,
  } as React.CSSProperties,

  eyebrow: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.9px',
    color: 'rgba(170, 186, 230, 0.8)',
  } as React.CSSProperties,

  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: '#f5f7ff',
    lineHeight: 1.2,
  } as React.CSSProperties,

  subtitle: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(206, 216, 245, 0.78)',
  } as React.CSSProperties,

  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  } as React.CSSProperties,

  headerButton: {
    ...themeStyles.buttonSecondary,
    width: 'auto',
    padding: '6px 11px',
    fontSize: typography.fontSize.xs,
    borderRadius: '999px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(21, 34, 70, 0.86)',
  } as React.CSSProperties,

  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(110px, 1fr))',
    gap: spacing.sm,
  } as React.CSSProperties,

  metricCard: {
    border: `1px solid ${colors.border.primary}`,
    borderRadius: '8px',
    padding: `${spacing.xs} ${spacing.sm}`,
    backgroundColor: 'rgba(11, 18, 39, 0.7)',
    minWidth: 0,
  } as React.CSSProperties,

  metricLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.55px',
    color: 'rgba(181, 193, 227, 0.72)',
  } as React.CSSProperties,

  metricValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: '#ffffff',
    marginTop: '2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as React.CSSProperties,

  metricMeta: {
    fontSize: '11px',
    color: 'rgba(173, 190, 233, 0.8)',
    marginTop: '2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as React.CSSProperties,

  shortcutBar: {
    display: 'flex',
    gap: spacing.sm,
    flexWrap: 'wrap',
  } as React.CSSProperties,

  shortcut: {
    fontSize: '11px',
    color: 'rgba(180, 193, 231, 0.76)',
    padding: `1px ${spacing.xs}`,
    borderRadius: '4px',
    border: '1px dashed rgba(124, 154, 224, 0.34)',
    backgroundColor: 'rgba(9, 12, 26, 0.4)',
  } as React.CSSProperties,

  controlRail: {
    display: 'flex',
    gap: spacing.sm,
    flexWrap: 'wrap',
    padding: `${spacing.sm} ${spacing.md}`,
    borderBottom: `1px solid ${colors.border.primary}`,
    backgroundColor: 'rgba(10, 14, 30, 0.88)',
  } as React.CSSProperties,

  controlGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
    minWidth: 150,
    border: `1px solid ${colors.border.primary}`,
    borderRadius: '8px',
    padding: spacing.xs,
    backgroundColor: 'rgba(20, 36, 78, 0.23)',
    flex: '1 1 150px',
  } as React.CSSProperties,

  groupLabel: {
    fontSize: '10px',
    lineHeight: 1.2,
    color: 'rgba(178, 194, 235, 0.72)',
    textTransform: 'uppercase',
    letterSpacing: '0.55px',
    paddingLeft: spacing.xs,
  } as React.CSSProperties,

  commandRow: {
    display: 'flex',
    gap: spacing.xs,
    flexWrap: 'wrap',
  } as React.CSSProperties,

  commandButton: {
    ...themeStyles.buttonSecondary,
    width: 'auto',
    minWidth: 66,
    padding: '6px 10px',
    fontSize: typography.fontSize.xs,
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#eff3ff',
    backgroundColor: 'rgba(16, 50, 97, 0.75)',
  } as React.CSSProperties,

  commandButtonActive: {
    color: '#ffffff',
    backgroundColor: 'rgba(233, 69, 96, 0.8)',
    border: '1px solid rgba(255, 212, 220, 0.65)',
  } as React.CSSProperties,

  commandButtonDanger: {
    backgroundColor: 'rgba(116, 29, 42, 0.78)',
    border: '1px solid rgba(255, 158, 177, 0.4)',
  } as React.CSSProperties,

  commandButtonDisabled: {
    opacity: 0.45,
    cursor: 'not-allowed',
  } as React.CSSProperties,

  commandPrimary: {
    ...themeStyles.button,
    width: 'auto',
    minWidth: 82,
    padding: '6px 12px',
    fontSize: typography.fontSize.xs,
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.16)',
  } as React.CSSProperties,

  commandPrimaryDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as React.CSSProperties,

  content: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: 'minmax(220px, 1fr) minmax(420px, 2.1fr) minmax(260px, 1.2fr)',
    gap: spacing.sm,
    padding: spacing.sm,
  } as React.CSSProperties,

  sidePane: {
    ...themeStyles.section,
    marginBottom: 0,
    padding: spacing.sm,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    overflow: 'hidden',
    gap: spacing.sm,
  } as React.CSSProperties,

  timelineWrap: {
    ...themeStyles.section,
    marginBottom: 0,
    padding: spacing.sm,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    position: 'relative',
  } as React.CSSProperties,

  timelineToolbar: {
    border: `1px solid ${colors.border.primary}`,
    borderRadius: '8px',
    padding: `${spacing.xs} ${spacing.sm}`,
    backgroundColor: 'rgba(14, 20, 42, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    flexWrap: 'wrap',
  } as React.CSSProperties,

  timelineToolbarSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  } as React.CSSProperties,

  timelineChip: {
    border: `1px solid rgba(121, 147, 214, 0.36)`,
    borderRadius: '999px',
    padding: '2px 8px',
    fontSize: '11px',
    color: 'rgba(224, 232, 255, 0.9)',
    backgroundColor: 'rgba(26, 44, 90, 0.35)',
  } as React.CSSProperties,

  timelineControlStack: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  } as React.CSSProperties,

  timelineControl: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    border: `1px solid ${colors.border.primary}`,
    borderRadius: '6px',
    padding: `2px ${spacing.xs}`,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  } as React.CSSProperties,

  controlLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  } as React.CSSProperties,

  controlValue: {
    minWidth: 54,
    textAlign: 'right',
    fontSize: '11px',
    color: 'rgba(229, 236, 255, 0.95)',
  } as React.CSSProperties,

  zoomSlider: {
    width: 112,
  } as React.CSSProperties,

  snapButtons: {
    display: 'flex',
    gap: spacing.xs,
  } as React.CSSProperties,

  snapButton: {
    ...themeStyles.buttonSecondary,
    width: 'auto',
    padding: '4px 8px',
    fontSize: '11px',
    borderRadius: '5px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(15, 52, 96, 0.65)',
  } as React.CSSProperties,

  snapButtonActive: {
    backgroundColor: 'rgba(233, 69, 96, 0.8)',
    border: '1px solid rgba(255, 212, 220, 0.62)',
    color: '#ffffff',
  } as React.CSSProperties,

  timelineBody: {
    flex: 1,
    minHeight: 0,
  } as React.CSSProperties,

  segmentStyleHint: {
    border: `1px dashed rgba(121, 143, 203, 0.44)`,
    borderRadius: '8px',
    backgroundColor: 'rgba(10, 15, 30, 0.42)',
    padding: `${spacing.xs} ${spacing.sm}`,
    fontSize: typography.fontSize.xs,
    color: 'rgba(184, 198, 234, 0.8)',
    textAlign: 'center',
  } as React.CSSProperties,

  segmentStyleOverlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 20,
    backgroundColor: 'rgba(4, 8, 18, 0.52)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  } as React.CSSProperties,

  segmentStylePopup: {
    width: 'min(620px, 100%)',
    border: `1px solid rgba(255, 207, 218, 0.66)`,
    borderRadius: '10px',
    background: 'linear-gradient(160deg, rgba(30, 44, 84, 0.96) 0%, rgba(18, 25, 48, 0.95) 100%)',
    boxShadow: '0 10px 28px rgba(0, 0, 0, 0.34)',
    padding: spacing.sm,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  } as React.CSSProperties,

  segmentStylePopupHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  } as React.CSSProperties,

  segmentStyleBadge: {
    borderRadius: '999px',
    border: '1px solid rgba(255, 207, 218, 0.74)',
    backgroundColor: 'rgba(233, 69, 96, 0.24)',
    color: '#ffffff',
    padding: '3px 9px',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  } as React.CSSProperties,

  segmentStyleMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  } as React.CSSProperties,

  segmentStyleGrid: {
    display: 'grid',
    gap: spacing.sm,
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  } as React.CSSProperties,

  segmentStyleField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
  } as React.CSSProperties,

  segmentStyleLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.45px',
    color: 'rgba(193, 207, 241, 0.78)',
  } as React.CSSProperties,

  segmentStyleSelect: {
    width: '100%',
    minWidth: 0,
    marginBottom: 0,
  } as React.CSSProperties,

  segmentStyleStrengthRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: '2px',
  } as React.CSSProperties,

  segmentStyleStrengthValue: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    minWidth: 38,
    textAlign: 'right',
  } as React.CSSProperties,

  segmentStyleCloseButton: {
    ...themeStyles.buttonSecondary,
    width: 'auto',
    padding: '4px 10px',
    fontSize: typography.fontSize.xs,
    borderRadius: '999px',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    backgroundColor: 'rgba(10, 16, 33, 0.56)',
  } as React.CSSProperties,

  scroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: spacing.md,
  } as React.CSSProperties,

  sectionHeading: {
    fontSize: typography.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: '0.55px',
    color: 'rgba(194, 206, 236, 0.86)',
    marginBottom: spacing.xs,
  } as React.CSSProperties,

  keyframeMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  } as React.CSSProperties,

  list: {
    overflowY: 'auto',
    backgroundColor: 'rgba(12, 18, 35, 0.65)',
    border: `1px solid ${colors.border.primary}`,
    borderRadius: '8px',
    padding: spacing.xs,
  } as React.CSSProperties,

  listItem: {
    display: 'grid',
    gridTemplateColumns: '52px 1fr',
    alignItems: 'center',
    gap: spacing.sm,
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: '7px',
    backgroundColor: 'rgba(18, 34, 73, 0.34)',
    border: '1px solid transparent',
    cursor: 'pointer',
    marginBottom: spacing.xs,
  } as React.CSSProperties,

  listItemSelected: {
    border: '1px solid rgba(233, 69, 96, 0.75)',
    backgroundColor: 'rgba(233, 69, 96, 0.2)',
  } as React.CSSProperties,

  listItemIndex: {
    fontWeight: typography.fontWeight.semibold,
    color: '#ffd7de',
    fontSize: typography.fontSize.xs,
  } as React.CSSProperties,

  listItemBody: {
    minWidth: 0,
  } as React.CSSProperties,

  listItemTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: '#f3f6ff',
    marginBottom: '2px',
  } as React.CSSProperties,

  listItemCoords: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: '11px',
    color: 'rgba(206, 219, 255, 0.86)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as React.CSSProperties,

  inspectorSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTop: `1px solid ${colors.border.primary}`,
  } as React.CSSProperties,

  defaultsCard: {
    marginTop: spacing.sm,
    border: `1px solid ${colors.border.primary}`,
    borderRadius: '8px',
    backgroundColor: 'rgba(15, 26, 56, 0.78)',
    padding: spacing.md,
  } as React.CSSProperties,

  fieldRow: {
    display: 'flex',
    gap: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.sm,
  } as React.CSSProperties,

  strengthValue: {
    fontSize: typography.fontSize.xs,
    minWidth: 42,
    textAlign: 'right',
    color: colors.text.secondary,
  } as React.CSSProperties,

  emptyHint: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    padding: spacing.lg,
    color: 'rgba(184, 198, 234, 0.8)',
    textAlign: 'center',
    fontSize: typography.fontSize.xs,
    border: `1px dashed rgba(121, 143, 203, 0.5)`,
    borderRadius: '8px',
    backgroundColor: 'rgba(8, 13, 26, 0.4)',
  } as React.CSSProperties,
};

export interface CameraPathEditorProps {
  isEditing: boolean;
  isPlaying: boolean;
  loop: boolean;
  points: Array<{ x: number; y: number; z: number }>;
  pointCount: number;
  selectedIndex: number | null;
  isPickTargetArmed: boolean;
  segments: CameraPathSegmentConfig[];
  defaults: CameraPathDefaults;
  selectedSegmentIndex: number | null;
  shotJson: string;
  timelineZoom: number;
  timelineSnap: number;
  onToggleEditing: () => void;
  onPlay: () => void;
  onStop: () => void;
  onToggleLoop: (value: boolean) => void;
  onAddPoint: () => void;
  onInsertPoint: () => void;
  onDeletePoint: () => void;
  onClearPath: () => void;
  onSelectPoint: (index: number) => void;
  onSetTargetToCenter: () => void;
  onPickTargetOnce: () => void;
  onSelectSegment: (index: number) => void;
  onSetDefaultInterpolation: (value: InterpolationType) => void;
  onSetDefaultEasing: (value: EasingSpec) => void;
  onApplyDefaultsToAllSegments: () => void;
  onSetSegmentDuration: (index: number, duration: number) => void;
  onSetAdjacentSegmentDurations: (boundaryIndex: number, leftDuration: number, rightDuration: number) => void;
  onSetSegmentInterpolation: (index: number, value: SegmentOverride<InterpolationType>) => void;
  onSetSegmentEasing: (index: number, value: SegmentOverride<EasingSpec>) => void;
  onChangeShotJson: (value: string) => void;
  onExportShot: () => void;
  onImportShot: () => void;
  onChangeTimelineZoom: (value: number) => void;
  onChangeTimelineSnap: (value: number) => void;
  headerActions?: React.ReactNode;
}

export function CameraPathEditorPanel(props: CameraPathEditorProps) {
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [curveEditorSegmentIndex, setCurveEditorSegmentIndex] = useState<number | null>(null);

  const selectedSegment = props.selectedSegmentIndex === null
    ? null
    : props.segments[props.selectedSegmentIndex] ?? null;
  const curveEditorSegment = curveEditorSegmentIndex === null
    ? null
    : props.segments[curveEditorSegmentIndex] ?? null;

  const totalDuration = useMemo(() => {
    return props.segments.reduce((sum, segment) => sum + segment.duration, 0);
  }, [props.segments]);

  const defaultEasingMode = useMemo(() => {
    return props.defaults.easing.type === 'linear' ? 'linear' : 'smoothstep';
  }, [props.defaults.easing.type]);

  const defaultSmoothStrength = useMemo(() => {
    return props.defaults.easing.type === 'smoothstep' ? props.defaults.easing.strength : 0.6;
  }, [props.defaults.easing]);

  const defaultEasingSummary = useMemo(() => {
    return props.defaults.easing.type === 'linear'
      ? 'linear'
      : `smoothstep(${props.defaults.easing.strength.toFixed(2)})`;
  }, [props.defaults.easing]);

  const canPlay = props.pointCount >= 2;
  const canMutateKeyframes = props.isEditing && !props.isPlaying;
  const canMutateSelectedPoint = canMutateKeyframes && props.selectedIndex !== null;

  useEffect(() => {
    if (curveEditorSegmentIndex === null) return;
    if (props.segments[curveEditorSegmentIndex]) return;
    setCurveEditorSegmentIndex(null);
  }, [curveEditorSegmentIndex, props.segments]);

  useEffect(() => {
    if (props.isEditing) return;
    setCurveEditorSegmentIndex(null);
  }, [props.isEditing]);

  useEffect(() => {
    if (curveEditorSegmentIndex === null) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCurveEditorSegmentIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [curveEditorSegmentIndex]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) {
      return;
    }
    if (event.code === 'Space') {
      event.preventDefault();
      if (props.isPlaying) props.onStop();
      else props.onPlay();
      return;
    }
    if (event.code === 'KeyE') {
      event.preventDefault();
      props.onToggleEditing();
      return;
    }
    if (event.code === 'KeyL') {
      event.preventDefault();
      props.onToggleLoop(!props.loop);
      return;
    }
    if (event.code === 'KeyK') {
      event.preventDefault();
      if (!canMutateKeyframes) return;
      props.onAddPoint();
      return;
    }
  };

  return (
    <div style={styles.panel} tabIndex={0} onKeyDown={handleKeyDown}>
      <ShotJsonModal
        isOpen={showJsonModal}
        onClose={() => setShowJsonModal(false)}
        shotJson={props.shotJson}
        onChangeShotJson={props.onChangeShotJson}
        onExportShot={props.onExportShot}
        onImportShot={props.onImportShot}
      />

      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div style={styles.titleBlock}>
            <div style={styles.eyebrow}>Camera Path</div>
            <div style={styles.title}>Path Editor</div>
            <div style={styles.subtitle}>Capture points, shape timing, and preview motion.</div>
          </div>
          <div style={styles.headerActions}>
            <button type="button" onClick={() => setShowJsonModal(true)} style={styles.headerButton}>
              JSON
            </button>
            {props.headerActions}
          </div>
        </div>

        <div style={styles.metricGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Path</div>
            <div style={styles.metricValue}>{props.pointCount} points</div>
            <div style={styles.metricMeta}>{props.segments.length} segments</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Selection</div>
            <div style={styles.metricValue}>{props.selectedIndex === null ? 'Point: None' : `Point: #${props.selectedIndex + 1}`}</div>
            <div style={styles.metricMeta}>
              {props.selectedSegmentIndex === null ? 'Segment: None' : `Segment: #${props.selectedSegmentIndex + 1}`}
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Playback</div>
            <div style={styles.metricValue}>{props.isPlaying ? 'Playing' : 'Idle'}</div>
            <div style={styles.metricMeta}>{props.loop ? 'Loop enabled' : 'Loop disabled'}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Timeline</div>
            <div style={styles.metricValue}>{formatTime(totalDuration)}</div>
            <div style={styles.metricMeta}>{props.timelineZoom}px/s</div>
          </div>
        </div>

        <div style={styles.shortcutBar}>
          <span style={styles.shortcut}>Space Play/Stop</span>
          <span style={styles.shortcut}>E Toggle Edit</span>
          <span style={styles.shortcut}>K Add Point</span>
          <span style={styles.shortcut}>L Toggle Loop</span>
        </div>
      </div>

      <div style={styles.controlRail}>
        <div style={styles.controlGroup}>
          <div style={styles.groupLabel}>Mode</div>
          <div style={styles.commandRow}>
            <button
              type="button"
              onClick={props.onToggleEditing}
              style={{
                ...styles.commandButton,
                ...(props.isEditing ? styles.commandButtonActive : null),
              }}
            >
              {props.isEditing ? 'Editing' : 'Viewing'}
            </button>
            <button
              type="button"
              onClick={() => props.onToggleLoop(!props.loop)}
              style={{
                ...styles.commandButton,
                ...(props.loop ? styles.commandButtonActive : null),
              }}
            >
              {props.loop ? 'Loop On' : 'Loop Off'}
            </button>
          </div>
        </div>

        <div style={styles.controlGroup}>
          <div style={styles.groupLabel}>Playback</div>
          <div style={styles.commandRow}>
            <button
              type="button"
              onClick={props.isPlaying ? props.onStop : props.onPlay}
              disabled={!canPlay}
              style={{
                ...styles.commandPrimary,
                backgroundColor: props.isPlaying ? colors.button.primaryHover : colors.button.success,
                ...(!canPlay ? styles.commandPrimaryDisabled : null),
              }}
            >
              {props.isPlaying ? 'Stop' : 'Play'}
            </button>
          </div>
        </div>

        <div style={styles.controlGroup}>
          <div style={styles.groupLabel}>Keyframes</div>
          <div style={styles.commandRow}>
            <button
              type="button"
              onClick={props.onAddPoint}
              disabled={!canMutateKeyframes}
              style={{
                ...styles.commandButton,
                ...(!canMutateKeyframes ? styles.commandButtonDisabled : null),
              }}
            >
              Add
            </button>
            <button
              type="button"
              onClick={props.onInsertPoint}
              disabled={!canMutateSelectedPoint}
              style={{
                ...styles.commandButton,
                ...(!canMutateSelectedPoint ? styles.commandButtonDisabled : null),
              }}
            >
              Insert
            </button>
            <button
              type="button"
              onClick={props.onDeletePoint}
              disabled={!canMutateSelectedPoint}
              style={{
                ...styles.commandButton,
                ...(!canMutateSelectedPoint ? styles.commandButtonDisabled : null),
              }}
            >
              Delete
            </button>
          </div>
        </div>

        <div style={styles.controlGroup}>
          <div style={styles.groupLabel}>Targets</div>
          <div style={styles.commandRow}>
            <button
              type="button"
              onClick={props.onPickTargetOnce}
              disabled={!canMutateKeyframes}
              style={{
                ...styles.commandButton,
                ...(props.isPickTargetArmed ? styles.commandButtonActive : null),
                ...(!canMutateKeyframes ? styles.commandButtonDisabled : null),
              }}
            >
              {props.isPickTargetArmed ? 'Picking...' : 'Pick Target'}
            </button>
            <button
              type="button"
              onClick={props.onSetTargetToCenter}
              disabled={!canMutateKeyframes}
              style={{
                ...styles.commandButton,
                ...(!canMutateKeyframes ? styles.commandButtonDisabled : null),
              }}
            >
              Target Center
            </button>
            <button
              type="button"
              onClick={props.onClearPath}
              disabled={!canMutateKeyframes || props.pointCount === 0}
              style={{
                ...styles.commandButton,
                ...styles.commandButtonDanger,
                ...(!canMutateKeyframes || props.pointCount === 0 ? styles.commandButtonDisabled : null),
              }}
            >
              Clear Path
            </button>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.sidePane}>
          <div style={styles.sectionHeading}>Keyframes</div>
          <div style={styles.keyframeMeta}>
            {props.selectedIndex === null
              ? 'Select a keyframe to inspect it.'
              : `Selected keyframe #${props.selectedIndex + 1}`}
          </div>
          <div style={styles.list}>
            {props.points.length === 0 ? (
              <div style={styles.emptyHint}>No keyframes yet. Enable editing and use Add to create your first point.</div>
            ) : (
              props.points.map((point, index) => {
                const isSelected = props.selectedIndex === index;
                const title = index === 0
                  ? 'Start Point'
                  : index === props.points.length - 1
                    ? 'End Point'
                    : `Point ${index + 1}`;
                return (
                  <div
                    key={`point-${index}`}
                    onClick={() => props.onSelectPoint(index)}
                    style={{
                      ...styles.listItem,
                      ...(isSelected ? styles.listItemSelected : null),
                      marginBottom: index === props.points.length - 1 ? 0 : styles.listItem.marginBottom,
                    }}
                  >
                    <span style={styles.listItemIndex}>#{index + 1}</span>
                    <div style={styles.listItemBody}>
                      <div style={styles.listItemTitle}>{title}</div>
                      <div style={styles.listItemCoords}>
                        X {point.x.toFixed(2)} | Y {point.y.toFixed(2)} | Z {point.z.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={styles.timelineWrap}>
          <div style={styles.timelineToolbar}>
            <div style={styles.timelineToolbarSummary}>
              <span style={styles.timelineChip}>Duration {formatTime(totalDuration)}</span>
              <span style={styles.timelineChip}>Segments {props.segments.length}</span>
            </div>
            <div style={styles.timelineControlStack}>
              <div style={styles.timelineControl}>
                <span style={styles.controlLabel}>Zoom</span>
                <input
                  type="range"
                  min={30}
                  max={240}
                  step={5}
                  value={props.timelineZoom}
                  onChange={(e) => props.onChangeTimelineZoom(Number(e.target.value))}
                  disabled={props.segments.length === 0}
                  style={styles.zoomSlider}
                />
                <span style={styles.controlValue}>{props.timelineZoom}px/s</span>
              </div>
              <div style={styles.timelineControl}>
                <span style={styles.controlLabel}>Snap</span>
                <div style={styles.snapButtons}>
                  {SNAP_OPTIONS.map((value) => {
                    const isActive = props.timelineSnap === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => props.onChangeTimelineSnap(value)}
                        style={{
                          ...styles.snapButton,
                          ...(isActive ? styles.snapButtonActive : null),
                        }}
                      >
                        {value.toFixed(2)}s
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div style={styles.timelineBody}>
            {props.segments.length === 0 ? (
              <div style={styles.emptyHint}>Add at least two keyframes to unlock timeline editing.</div>
            ) : (
              <TimelineEditor
                segments={props.segments}
                selectedSegmentIndex={props.selectedSegmentIndex}
                zoomPxPerSecond={props.timelineZoom}
                snapSeconds={props.timelineSnap}
                isPlaying={props.isPlaying}
                isEditing={props.isEditing}
                onSelectSegment={props.onSelectSegment}
                onSetBoundaryDurations={props.onSetAdjacentSegmentDurations}
                onSetSegmentDuration={props.onSetSegmentDuration}
                onOpenCurveEditor={(index) => {
                  props.onSelectSegment(index);
                  setCurveEditorSegmentIndex(index);
                }}
              />
            )}
          </div>

          <div style={styles.segmentStyleHint}>
            {props.isEditing
              ? 'Use a segment\'s Curve button to open temporary controls.'
              : 'Enable editing mode to change curve settings.'}
          </div>

          {curveEditorSegment && curveEditorSegmentIndex !== null ? (
            (() => {
              const segmentIndex = curveEditorSegmentIndex;
              const interpolationMode = getSegmentInterpolationMode(curveEditorSegment);
              const easingMode = getSegmentEasingMode(curveEditorSegment);
              const smoothstepStrength = getSegmentSmoothstepStrength(curveEditorSegment, props.defaults);

              return (
                <div style={styles.segmentStyleOverlay} onClick={() => setCurveEditorSegmentIndex(null)}>
                  <div
                    style={styles.segmentStylePopup}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div style={styles.segmentStylePopupHeader}>
                      <span style={styles.segmentStyleBadge}>Segment S{segmentIndex + 1}</span>
                      <button
                        type="button"
                        onClick={() => setCurveEditorSegmentIndex(null)}
                        style={styles.segmentStyleCloseButton}
                      >
                        Close
                      </button>
                    </div>
                    <div style={styles.segmentStyleMeta}>Per-Segment Curve Controls</div>
                    <div style={styles.segmentStyleGrid}>
                      <div style={styles.segmentStyleField}>
                        <label style={styles.segmentStyleLabel}>Interpolation</label>
                        <select
                          value={interpolationMode}
                          disabled={!canMutateKeyframes}
                          onChange={(event) => {
                            const mode = event.target.value;
                            if (mode === 'inherit') {
                              props.onSetSegmentInterpolation(segmentIndex, { mode: 'inherit' });
                              return;
                            }
                            props.onSetSegmentInterpolation(segmentIndex, {
                              mode: 'override',
                              value: mode as InterpolationType,
                            });
                          }}
                          style={{ ...themeStyles.input, ...styles.segmentStyleSelect }}
                        >
                          <option value="inherit">Inherit ({props.defaults.interpolation})</option>
                          <option value="linear">Linear</option>
                          <option value="curve">Curve</option>
                        </select>
                      </div>

                      <div style={styles.segmentStyleField}>
                        <label style={styles.segmentStyleLabel}>Easing</label>
                        <select
                          value={easingMode}
                          disabled={!canMutateKeyframes}
                          onChange={(event) => {
                            const mode = event.target.value;
                            if (mode === 'inherit') {
                              props.onSetSegmentEasing(segmentIndex, { mode: 'inherit' });
                              return;
                            }
                            if (mode === 'linear') {
                              props.onSetSegmentEasing(segmentIndex, {
                                mode: 'override',
                                value: { type: 'linear' },
                              });
                              return;
                            }
                            props.onSetSegmentEasing(segmentIndex, {
                              mode: 'override',
                              value: {
                                type: 'smoothstep',
                                strength: smoothstepStrength,
                              },
                            });
                          }}
                          style={{ ...themeStyles.input, ...styles.segmentStyleSelect }}
                        >
                          <option value="inherit">Inherit ({defaultEasingSummary})</option>
                          <option value="linear">Linear</option>
                          <option value="smoothstep">Smoothstep</option>
                        </select>

                        {easingMode === 'smoothstep' ? (
                          <div style={styles.segmentStyleStrengthRow}>
                            <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.05}
                              value={smoothstepStrength}
                              disabled={!canMutateKeyframes}
                              onChange={(event) => {
                                const value = Number(event.target.value);
                                props.onSetSegmentEasing(segmentIndex, {
                                  mode: 'override',
                                  value: {
                                    type: 'smoothstep',
                                    strength: Math.max(0, Math.min(1, value)),
                                  },
                                });
                              }}
                              style={{ flex: 1, minWidth: 0 }}
                            />
                            <span style={styles.segmentStyleStrengthValue}>{smoothstepStrength.toFixed(2)}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : null}
        </div>

        <div style={styles.sidePane}>
          <SegmentInspector
            selectedSegmentIndex={props.selectedSegmentIndex}
            segment={selectedSegment}
            defaults={props.defaults}
            isPlaying={!canMutateKeyframes}
            onChangeDuration={(value) => {
              if (props.selectedSegmentIndex === null) return;
              props.onSetSegmentDuration(props.selectedSegmentIndex, value);
            }}
            onChangeInterpolation={(value) => {
              if (props.selectedSegmentIndex === null) return;
              props.onSetSegmentInterpolation(props.selectedSegmentIndex, value);
            }}
            onChangeEasing={(value) => {
              if (props.selectedSegmentIndex === null) return;
              props.onSetSegmentEasing(props.selectedSegmentIndex, value);
            }}
          />

          <div style={styles.inspectorSection}>
            <div style={styles.sectionHeading}>Default Segment Style</div>
            <div style={styles.defaultsCard}>
              <div style={styles.fieldRow}>
                <label style={{ ...themeStyles.label, flex: 1 }}>Interpolation</label>
                <select
                  value={props.defaults.interpolation}
                  disabled={!canMutateKeyframes}
                  onChange={(e) => props.onSetDefaultInterpolation(e.target.value as InterpolationType)}
                  style={{ ...themeStyles.input, flex: 1 }}
                >
                  <option value="curve">Curve</option>
                  <option value="linear">Linear</option>
                </select>
              </div>

              <div style={styles.fieldRow}>
                <label style={{ ...themeStyles.label, flex: 1 }}>Easing</label>
                <select
                  value={defaultEasingMode}
                  disabled={!canMutateKeyframes}
                  onChange={(e) => {
                    const mode = e.target.value;
                    if (mode === 'linear') {
                      props.onSetDefaultEasing({ type: 'linear' });
                      return;
                    }
                    props.onSetDefaultEasing({ type: 'smoothstep', strength: defaultSmoothStrength });
                  }}
                  style={{ ...themeStyles.input, flex: 1 }}
                >
                  <option value="smoothstep">Smoothstep</option>
                  <option value="linear">Linear</option>
                </select>
              </div>

              {defaultEasingMode === 'smoothstep' ? (
                <div style={styles.fieldRow}>
                  <label style={{ ...themeStyles.label, width: 80 }}>Strength</label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={defaultSmoothStrength}
                    disabled={!canMutateKeyframes}
                    onChange={(e) => props.onSetDefaultEasing({ type: 'smoothstep', strength: Number(e.target.value) })}
                    style={{ flex: 1 }}
                  />
                  <span style={styles.strengthValue}>{defaultSmoothStrength.toFixed(2)}</span>
                </div>
              ) : null}

              <button
                type="button"
                onClick={props.onApplyDefaultsToAllSegments}
                disabled={!canMutateKeyframes || props.segments.length === 0}
                style={{
                  ...styles.commandButton,
                  width: '100%',
                  justifyContent: 'center',
                  ...((!canMutateKeyframes || props.segments.length === 0) ? styles.commandButtonDisabled : null),
                }}
              >
                Apply Defaults to All Segments
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
