import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  CameraPathAnimationPlugin,
  CameraPathDefaults,
  CameraPathDesignerPlugin,
  CameraPathDesignerShot,
  CameraPathSegmentConfig,
  EasingSpec,
  IOrbitControlsPlugin,
  InterpolationType,
  ModelLoadResult,
  SegmentOverride,
  ThreeViewerHandle,
  ViewerCore,
} from '../../src';
import { useDockablePanelState } from './useDockablePanelState';

const DEFAULT_DEFAULTS: CameraPathDefaults = {
  interpolation: 'curve',
  easing: { type: 'smoothstep', strength: 0.6 },
};

const MIN_SEGMENT_DURATION = 0.05;

type DesignerSnapshot = {
  pointsKey: string;
  segmentsKey: string;
  defaultsKey: string;
  selectedIndex: number | null;
  isPickTargetArmed: boolean;
  isEditing: boolean;
  loop: boolean;
};

export function useCameraPathDesigner(
  viewerRef: RefObject<ThreeViewerHandle | null>,
  loadResult: ModelLoadResult | null
) {
  const designerRef = useRef<CameraPathDesignerPlugin | null>(null);
  const animationRef = useRef<CameraPathAnimationPlugin | null>(null);
  const lastSnapshotRef = useRef<DesignerSnapshot | null>(null);
  const { panelState, ...panelActions } = useDockablePanelState();

  const [isEditing, setIsEditing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loop, setLoopState] = useState(false);
  const [duration, setDurationState] = useState(10);

  const [points, setPoints] = useState<Array<{ x: number; y: number; z: number }>>([]);
  const [segments, setSegmentsState] = useState<CameraPathSegmentConfig[]>([]);
  const [defaults, setDefaultsState] = useState<CameraPathDefaults>(DEFAULT_DEFAULTS);
  const [pointCount, setPointCount] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number | null>(null);
  const [isPickTargetArmed, setIsPickTargetArmed] = useState(false);
  const [shotJson, setShotJson] = useState('');

  const defaultTarget = useMemo(() => {
    return loadResult ? loadResult.center.clone() : new THREE.Vector3(0, 0, 0);
  }, [loadResult]);

  const buildPointsKey = useCallback((pathPoints: THREE.Vector3[]) => {
    const scale = 10000;
    let key = `${pathPoints.length}|`;
    for (const point of pathPoints) {
      key += `${Math.round(point.x * scale)},${Math.round(point.y * scale)},${Math.round(point.z * scale)};`;
    }
    return key;
  }, []);

  const buildSegmentsKey = useCallback((segmentList: CameraPathSegmentConfig[]) => {
    const scale = 10000;
    return segmentList
      .map((segment) => {
        const interpolation = segment.interpolation?.mode === 'override'
          ? `o:${segment.interpolation.value}`
          : 'i';
        const easing = segment.easing?.mode === 'override'
          ? segment.easing.value.type === 'linear'
            ? 'o:linear'
            : `o:smooth:${Math.round(segment.easing.value.strength * scale)}`
          : 'i';
        return `${Math.round(segment.duration * scale)}:${interpolation}:${easing}`;
      })
      .join('|');
  }, []);

  const buildDefaultsKey = useCallback((nextDefaults: CameraPathDefaults) => {
    const interpolation = nextDefaults.interpolation;
    const easing = nextDefaults.easing.type === 'linear'
      ? 'linear'
      : `smooth:${Math.round(nextDefaults.easing.strength * 10000)}`;
    return `${interpolation}|${easing}`;
  }, []);

  const syncFromDesigner = useCallback(() => {
    const designer = designerRef.current;
    if (!designer) return;

    const pathPoints = designer.getPathPoints();
    const nextSegments = designer.getSegments();
    const nextDefaults = designer.getDefaults();
    const nextDuration = nextSegments.reduce((sum, segment) => sum + segment.duration, 0);
    const nextSelectedIndex = designer.getSelectedIndex();
    const derivedSegmentFromSelectedPoint = nextSegments.length === 0 || nextSelectedIndex === null
      ? null
      : Math.min(Math.max(0, nextSelectedIndex), nextSegments.length - 1);

    const nextSnapshot: DesignerSnapshot = {
      pointsKey: buildPointsKey(pathPoints),
      segmentsKey: buildSegmentsKey(nextSegments),
      defaultsKey: buildDefaultsKey(nextDefaults),
      selectedIndex: nextSelectedIndex,
      isPickTargetArmed: designer.isPickTargetArmed(),
      isEditing: designer.isEnabled(),
      loop: designer.getLoop(),
    };

    const prevSnapshot = lastSnapshotRef.current;
    if (
      prevSnapshot &&
      prevSnapshot.pointsKey === nextSnapshot.pointsKey &&
      prevSnapshot.segmentsKey === nextSnapshot.segmentsKey &&
      prevSnapshot.defaultsKey === nextSnapshot.defaultsKey &&
      prevSnapshot.selectedIndex === nextSnapshot.selectedIndex &&
      prevSnapshot.isPickTargetArmed === nextSnapshot.isPickTargetArmed &&
      prevSnapshot.isEditing === nextSnapshot.isEditing &&
      prevSnapshot.loop === nextSnapshot.loop
    ) {
      return;
    }
    lastSnapshotRef.current = nextSnapshot;

    if (!prevSnapshot || prevSnapshot.pointsKey !== nextSnapshot.pointsKey) {
      setPoints(pathPoints.map((point) => ({ x: point.x, y: point.y, z: point.z })));
      setPointCount(pathPoints.length);
    }
    if (!prevSnapshot || prevSnapshot.segmentsKey !== nextSnapshot.segmentsKey) {
      setSegmentsState(nextSegments);
      setDurationState(nextDuration);
      setSelectedSegmentIndex((current) => {
        if (nextSegments.length === 0) return null;
        if (derivedSegmentFromSelectedPoint !== null) return derivedSegmentFromSelectedPoint;
        if (current === null) return 0;
        return Math.min(current, nextSegments.length - 1);
      });
    }
    if (!prevSnapshot || prevSnapshot.defaultsKey !== nextSnapshot.defaultsKey) {
      setDefaultsState(nextDefaults);
    }
    if (!prevSnapshot || prevSnapshot.selectedIndex !== nextSnapshot.selectedIndex) {
      setSelectedIndex(nextSelectedIndex);
      setSelectedSegmentIndex((current) => {
        if (nextSegments.length === 0) return null;
        if (derivedSegmentFromSelectedPoint !== null) return derivedSegmentFromSelectedPoint;
        if (current === null) return 0;
        return Math.min(current, nextSegments.length - 1);
      });
    }
    if (!prevSnapshot || prevSnapshot.isPickTargetArmed !== nextSnapshot.isPickTargetArmed) {
      setIsPickTargetArmed(nextSnapshot.isPickTargetArmed);
    }
    if (!prevSnapshot || prevSnapshot.isEditing !== nextSnapshot.isEditing) {
      setIsEditing(nextSnapshot.isEditing);
    }
    if (!prevSnapshot || prevSnapshot.loop !== nextSnapshot.loop) {
      setLoopState(nextSnapshot.loop);
    }
  }, [buildDefaultsKey, buildPointsKey, buildSegmentsKey]);

  const onViewerReady = useCallback((viewerCore: ViewerCore) => {
    const existingDesigner = viewerCore.plugins.get<CameraPathDesignerPlugin>('CameraPathDesignerPlugin');
    const designer = existingDesigner ?? new CameraPathDesignerPlugin();
    if (!existingDesigner && !viewerCore.plugins.has(designer.name)) {
      viewerCore.plugins.register(designer);
    }
    designerRef.current = designer;

    const existingAnimation = viewerCore.plugins.get<CameraPathAnimationPlugin>('CameraPathAnimationPlugin');
    const animation = existingAnimation ?? new CameraPathAnimationPlugin();
    if (!existingAnimation && !viewerCore.plugins.has(animation.name)) {
      viewerCore.plugins.register(animation);
    }
    animationRef.current = animation;

    const orbitControlsPlugin = viewerCore.plugins.get<IOrbitControlsPlugin>('OrbitControlsPlugin');
    if (orbitControlsPlugin) {
      designer.setOrbitControlsPlugin(orbitControlsPlugin);
      animation.setOrbitControlsPlugin(orbitControlsPlugin);
    }

    if (!designer.getTargetPoint()) {
      designer.setTargetPoint(defaultTarget);
    }

    lastSnapshotRef.current = null;
    syncFromDesigner();
  }, [defaultTarget, syncFromDesigner]);

  useEffect(() => {
    return () => {
      const viewerCore = viewerRef.current?.getViewerCore();
      const designer = designerRef.current;
      const animation = animationRef.current;
      if (viewerCore && designer) viewerCore.plugins.unregister(designer.name);
      if (viewerCore && animation) viewerCore.plugins.unregister(animation.name);
      designerRef.current = null;
      animationRef.current = null;
    };
  }, [viewerRef]);

  useEffect(() => {
    const designer = designerRef.current;
    if (!designer) return;
    if (!isEditing && !isPickTargetArmed) return;
    const timerId = window.setInterval(syncFromDesigner, 120);
    return () => {
      window.clearInterval(timerId);
    };
  }, [isEditing, isPickTargetArmed, syncFromDesigner]);

  const setLoop = useCallback((nextLoop: boolean) => {
    const designer = designerRef.current;
    if (!designer) return;
    designer.setLoop(nextLoop);
    syncFromDesigner();
  }, [syncFromDesigner]);

  const setDuration = useCallback((nextDuration: number) => {
    const designer = designerRef.current;
    if (!designer) return;
    designer.setDuration(nextDuration);
    syncFromDesigner();
  }, [syncFromDesigner]);

  const setDefaultInterpolation = useCallback((interpolation: InterpolationType) => {
    const designer = designerRef.current;
    if (!designer || !designer.isEnabled() || isPlaying) return;
    designer.setDefaults({
      ...designer.getDefaults(),
      interpolation,
    });
    syncFromDesigner();
  }, [isPlaying, syncFromDesigner]);

  const setDefaultEasing = useCallback((easing: EasingSpec) => {
    const designer = designerRef.current;
    if (!designer || !designer.isEnabled() || isPlaying) return;
    designer.setDefaults({
      ...designer.getDefaults(),
      easing,
    });
    syncFromDesigner();
  }, [isPlaying, syncFromDesigner]);

  const setSegmentDuration = useCallback((index: number, nextDuration: number) => {
    const designer = designerRef.current;
    if (!designer || !designer.isEnabled() || isPlaying) return;
    designer.setSegmentDuration(index, nextDuration);
    syncFromDesigner();
  }, [isPlaying, syncFromDesigner]);

  const setAdjacentSegmentDurations = useCallback((boundaryIndex: number, leftDuration: number, rightDuration: number) => {
    const designer = designerRef.current;
    if (!designer || !designer.isEnabled() || isPlaying) return;

    const current = designer.getSegments();
    const left = current[boundaryIndex];
    const right = current[boundaryIndex + 1];
    if (!left || !right) return;

    left.duration = Math.max(MIN_SEGMENT_DURATION, leftDuration);
    right.duration = Math.max(MIN_SEGMENT_DURATION, rightDuration);
    designer.setSegments(current);
    syncFromDesigner();
  }, [isPlaying, syncFromDesigner]);

  const setSegmentInterpolation = useCallback((index: number, override: SegmentOverride<InterpolationType>) => {
    const designer = designerRef.current;
    if (!designer || !designer.isEnabled() || isPlaying) return;
    designer.setSegmentInterpolation(index, override);
    syncFromDesigner();
  }, [isPlaying, syncFromDesigner]);

  const setSegmentEasing = useCallback((index: number, override: SegmentOverride<EasingSpec>) => {
    const designer = designerRef.current;
    if (!designer || !designer.isEnabled() || isPlaying) return;
    designer.setSegmentEasing(index, override);
    syncFromDesigner();
  }, [isPlaying, syncFromDesigner]);

  const applyDefaultsToAllSegments = useCallback(() => {
    const designer = designerRef.current;
    if (!designer || !designer.isEnabled() || isPlaying) return;
    const nextSegments = designer.getSegments().map((segment) => ({
      ...segment,
      interpolation: { mode: 'inherit' as const },
      easing: { mode: 'inherit' as const },
    }));
    designer.setSegments(nextSegments);
    syncFromDesigner();
  }, [isPlaying, syncFromDesigner]);

  const setSelectedSegment = useCallback((index: number | null) => {
    setSelectedSegmentIndex(index);
  }, []);

  const enableEditing = useCallback(() => {
    const designer = designerRef.current;
    if (!designer || isPlaying) return;
    designer.enable();
    syncFromDesigner();
  }, [isPlaying, syncFromDesigner]);

  const disableEditing = useCallback(() => {
    const designer = designerRef.current;
    if (!designer) return;
    designer.disable();
    syncFromDesigner();
  }, [syncFromDesigner]);

  const toggleEditing = useCallback(() => {
    if (isEditing) disableEditing();
    else enableEditing();
  }, [disableEditing, enableEditing, isEditing]);

  const addPoint = useCallback(() => {
    const designer = designerRef.current;
    if (!designer || !designer.isEnabled() || isPlaying) return;
    designer.addPointFromCamera();
    syncFromDesigner();
  }, [isPlaying, syncFromDesigner]);

  const insertPoint = useCallback(() => {
    const designer = designerRef.current;
    if (!designer || !designer.isEnabled() || isPlaying) return;
    const index = designer.getSelectedIndex();
    if (index === null) return;
    designer.insertPointAfter(index);
    syncFromDesigner();
  }, [isPlaying, syncFromDesigner]);

  const deletePoint = useCallback(() => {
    const designer = designerRef.current;
    if (!designer || !designer.isEnabled() || isPlaying) return;
    designer.removeSelectedPoint();
    syncFromDesigner();
  }, [isPlaying, syncFromDesigner]);

  const selectPoint = useCallback((index: number) => {
    const designer = designerRef.current;
    if (!designer || isPlaying) return;
    if (!designer.isEnabled()) return;
    designer.setSelectedIndex(index);
    syncFromDesigner();
  }, [isPlaying, syncFromDesigner]);

  const insertPointAfterAt = useCallback((index: number) => {
    const designer = designerRef.current;
    if (!designer || isPlaying || !designer.isEnabled()) return;
    designer.insertPointAfter(index);
    syncFromDesigner();
  }, [isPlaying, syncFromDesigner]);

  const deletePointAt = useCallback((index: number) => {
    const designer = designerRef.current;
    if (!designer || isPlaying || !designer.isEnabled()) return;
    designer.removePoint(index);
    syncFromDesigner();
  }, [isPlaying, syncFromDesigner]);

  const clearPath = useCallback(() => {
    const designer = designerRef.current;
    if (!designer || !designer.isEnabled() || isPlaying) return;
    designer.clear();
    syncFromDesigner();
  }, [isPlaying, syncFromDesigner]);

  const setTargetToCenter = useCallback(() => {
    const designer = designerRef.current;
    if (!designer || !designer.isEnabled() || isPlaying) return;
    designer.setTargetPoint(defaultTarget);
    syncFromDesigner();
  }, [defaultTarget, isPlaying, syncFromDesigner]);

  const pickTargetOnce = useCallback(() => {
    const designer = designerRef.current;
    if (!designer || !designer.isEnabled() || isPlaying) return;
    designer.armPickTargetOnce();
    syncFromDesigner();
  }, [isPlaying, syncFromDesigner]);

  const play = useCallback(() => {
    const designer = designerRef.current;
    const animation = animationRef.current;
    if (!designer || !animation) return;

    const pathPoints = designer.getPathPoints();
    const pathSegments = designer.getSegments();
    if (pathPoints.length < 2 || pathSegments.length < 1) return;

    disableEditing();
    const target = designer.getTargetPoint() ?? defaultTarget;
    animation.configure({
      pathPoints,
      segments: pathSegments,
      defaults: designer.getDefaults(),
      loop: designer.getLoop(),
      target,
      autoPlay: true,
    });

    setIsPlaying(true);
  }, [defaultTarget, disableEditing]);

  const stop = useCallback(() => {
    const animation = animationRef.current;
    if (!animation) return;
    animation.stop();
    setIsPlaying(false);
  }, []);

  const exportShot = useCallback(() => {
    const designer = designerRef.current;
    if (!designer) return;
    const shot = designer.exportShot();
    setShotJson(JSON.stringify(shot, null, 2));
  }, []);

  const importShot = useCallback(() => {
    const designer = designerRef.current;
    if (!designer) return;
    try {
      const parsed = JSON.parse(shotJson) as CameraPathDesignerShot;
      designer.importShot(parsed);
      syncFromDesigner();
    } catch {
      window.alert('Import failed: invalid JSON');
    }
  }, [shotJson, syncFromDesigner]);

  const reset = useCallback(() => {
    stop();
    disableEditing();
    setShotJson('');
    const designer = designerRef.current;
    if (!designer) return;
    designer.clear();
    designer.setDefaults(DEFAULT_DEFAULTS);
    designer.setLoop(false);
    designer.setTargetPoint(defaultTarget);
    syncFromDesigner();
  }, [defaultTarget, disableEditing, stop, syncFromDesigner]);

  return {
    onViewerReady,
    isEditing,
    isPlaying,
    duration,
    loop,
    points,
    segments,
    defaults,
    pointCount,
    selectedIndex,
    selectedSegmentIndex,
    isPickTargetArmed,
    shotJson,
    panelState,
    ...panelActions,
    setLoop,
    setDuration,
    setShotJson,
    setDefaultInterpolation,
    setDefaultEasing,
    setSegmentDuration,
    setAdjacentSegmentDurations,
    setSegmentInterpolation,
    setSegmentEasing,
    applyDefaultsToAllSegments,
    setSelectedSegment,
    toggleEditing,
    addPoint,
    insertPoint,
    deletePoint,
    selectPoint,
    insertPointAfterAt,
    deletePointAt,
    clearPath,
    setTargetToCenter,
    pickTargetOnce,
    play,
    stop,
    exportShot,
    importShot,
    reset,
  };
}
