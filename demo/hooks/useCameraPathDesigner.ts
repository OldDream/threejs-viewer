import { useCallback, useEffect, useMemo, useRef, useState, RefObject } from 'react';
import * as THREE from 'three';
import {
  CameraPathAnimationPlugin,
  CameraPathDesignerPlugin,
  CameraPathDesignerShot,
  IOrbitControlsPlugin,
  ModelLoadResult,
  ThreeViewerHandle,
  ViewerCore,
} from '../../src';

export function useCameraPathDesigner(
  viewerRef: RefObject<ThreeViewerHandle | null>,
  loadResult: ModelLoadResult | null
) {
  const designerRef = useRef<CameraPathDesignerPlugin | null>(null);
  const animationRef = useRef<CameraPathAnimationPlugin | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [duration, setDuration] = useState<number>(12);
  const [loop, setLoop] = useState<boolean>(false);
  const [easeInOut, setEaseInOut] = useState<number>(0.6);

  const [points, setPoints] = useState<Array<{ x: number; y: number; z: number }>>([]);
  const [pointCount, setPointCount] = useState<number>(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isPickTargetArmed, setIsPickTargetArmed] = useState<boolean>(false);

  const [shotJson, setShotJson] = useState<string>('');

  const defaultTarget = useMemo(() => {
    return loadResult ? loadResult.center.clone() : new THREE.Vector3(0, 0, 0);
  }, [loadResult]);

  const syncFromDesigner = useCallback(() => {
    const d = designerRef.current;
    if (!d) return;
    const pathPoints = d.getPathPoints();
    setPoints(pathPoints.map((p) => ({ x: p.x, y: p.y, z: p.z })));
    setPointCount(pathPoints.length);
    setSelectedIndex(d.getSelectedIndex());
    setIsPickTargetArmed(d.isPickTargetArmed());
    setIsEditing(d.isEnabled());
  }, []);

  const onViewerReady = useCallback((viewerCore: ViewerCore) => {
    const existingDesigner = viewerCore.plugins.get<CameraPathDesignerPlugin>('CameraPathDesignerPlugin');
    const designer = existingDesigner ?? new CameraPathDesignerPlugin();
    if (!existingDesigner && !viewerCore.plugins.has(designer.name)) {
      viewerCore.plugins.register(designer);
    }
    designerRef.current = designer;

    const existingAnim = viewerCore.plugins.get<CameraPathAnimationPlugin>('CameraPathAnimationPlugin');
    const anim = existingAnim ?? new CameraPathAnimationPlugin();
    if (!existingAnim && !viewerCore.plugins.has(anim.name)) {
      viewerCore.plugins.register(anim);
    }
    animationRef.current = anim;

    const orbitPlugin = viewerCore.plugins.get<IOrbitControlsPlugin>('OrbitControlsPlugin');
    if (orbitPlugin) {
      designer.setOrbitControlsPlugin(orbitPlugin);
      anim.setOrbitControlsPlugin(orbitPlugin);
    }

    designer.setDuration(duration);
    designer.setLoop(loop);
    designer.setEaseInOut(easeInOut);
    if (!designer.getTargetPoint()) {
      designer.setTargetPoint(defaultTarget);
    }

    syncFromDesigner();
  }, [defaultTarget, duration, easeInOut, loop, syncFromDesigner]);

  useEffect(() => {
    return () => {
      const viewerCore = viewerRef.current?.getViewerCore();
      const designer = designerRef.current;
      const anim = animationRef.current;
      if (viewerCore && designer) viewerCore.plugins.unregister(designer.name);
      if (viewerCore && anim) viewerCore.plugins.unregister(anim.name);
      designerRef.current = null;
      animationRef.current = null;
    };
  }, [viewerRef]);

  useEffect(() => {
    const d = designerRef.current;
    if (!d) return;
    d.setDuration(duration);
  }, [duration]);

  useEffect(() => {
    const d = designerRef.current;
    if (!d) return;
    d.setLoop(loop);
  }, [loop]);

  useEffect(() => {
    const d = designerRef.current;
    if (!d) return;
    d.setEaseInOut(easeInOut);
  }, [easeInOut]);

  useEffect(() => {
    const d = designerRef.current;
    if (!d) return;

    const id = window.setInterval(() => {
      syncFromDesigner();
    }, 150);

    return () => {
      window.clearInterval(id);
    };
  }, [syncFromDesigner]);

  const enableEditing = useCallback(() => {
    const d = designerRef.current;
    if (!d) return;
    if (isPlaying) return;
    d.enable();
    setIsEditing(true);
    syncFromDesigner();
  }, [isPlaying, syncFromDesigner]);

  const disableEditing = useCallback(() => {
    const d = designerRef.current;
    if (!d) return;
    d.disable();
    setIsEditing(false);
    syncFromDesigner();
  }, [syncFromDesigner]);

  const toggleEditing = useCallback(() => {
    if (isEditing) disableEditing();
    else enableEditing();
  }, [disableEditing, enableEditing, isEditing]);

  const addPoint = useCallback(() => {
    const d = designerRef.current;
    if (!d) return;
    d.addPointFromCamera();
    syncFromDesigner();
  }, [syncFromDesigner]);

  const insertPoint = useCallback(() => {
    const d = designerRef.current;
    if (!d) return;
    const idx = d.getSelectedIndex();
    if (idx === null) return;
    d.insertPointAfter(idx);
    syncFromDesigner();
  }, [syncFromDesigner]);

  const deletePoint = useCallback(() => {
    const d = designerRef.current;
    if (!d) return;
    d.removeSelectedPoint();
    syncFromDesigner();
  }, [syncFromDesigner]);

  const selectPoint = useCallback(
    (index: number) => {
      const d = designerRef.current;
      if (!d) return;
      if (isPlaying) return;
      if (!d.isEnabled()) d.enable();
      d.setSelectedIndex(index);
      syncFromDesigner();
    },
    [isPlaying, syncFromDesigner]
  );

  const insertPointAfterAt = useCallback(
    (index: number) => {
      const d = designerRef.current;
      if (!d) return;
      if (isPlaying) return;
      if (!d.isEnabled()) d.enable();
      d.insertPointAfter(index);
      syncFromDesigner();
    },
    [isPlaying, syncFromDesigner]
  );

  const deletePointAt = useCallback(
    (index: number) => {
      const d = designerRef.current;
      if (!d) return;
      if (isPlaying) return;
      if (!d.isEnabled()) d.enable();
      d.removePoint(index);
      syncFromDesigner();
    },
    [isPlaying, syncFromDesigner]
  );

  const clearPath = useCallback(() => {
    const d = designerRef.current;
    if (!d) return;
    d.clear();
    syncFromDesigner();
  }, [syncFromDesigner]);

  const setTargetToCenter = useCallback(() => {
    const d = designerRef.current;
    if (!d) return;
    d.setTargetPoint(defaultTarget);
    syncFromDesigner();
  }, [defaultTarget, syncFromDesigner]);

  const pickTargetOnce = useCallback(() => {
    const d = designerRef.current;
    if (!d) return;
    d.armPickTargetOnce();
    syncFromDesigner();
  }, [syncFromDesigner]);

  const play = useCallback(() => {
    const d = designerRef.current;
    const anim = animationRef.current;
    if (!d || !anim) return;

    const points = d.getPathPoints();
    if (points.length < 2) return;

    disableEditing();

    const target = d.getTargetPoint() ?? defaultTarget;
    anim.configure({
      pathPoints: points,
      duration,
      loop,
      easeInOut,
      target,
      autoPlay: true,
    });

    setIsPlaying(true);
  }, [defaultTarget, disableEditing, duration, easeInOut, loop]);

  const stop = useCallback(() => {
    const anim = animationRef.current;
    if (!anim) return;
    anim.stop();
    setIsPlaying(false);
  }, []);

  const exportShot = useCallback(() => {
    const d = designerRef.current;
    if (!d) return;
    const shot = d.exportShot();
    setShotJson(JSON.stringify(shot, null, 2));
  }, []);

  const importShot = useCallback(() => {
    const d = designerRef.current;
    if (!d) return;
    try {
      const parsed = JSON.parse(shotJson) as CameraPathDesignerShot;
      d.importShot(parsed);
      setDuration(parsed.duration);
      setLoop(parsed.loop);
      setEaseInOut(parsed.easeInOut);
      setIsEditing(d.isEnabled());
      syncFromDesigner();
    } catch {
      window.alert('Import failed: invalid JSON');
    }
  }, [shotJson, syncFromDesigner]);

  const reset = useCallback(() => {
    stop();
    disableEditing();
    setDuration(12);
    setLoop(false);
    setEaseInOut(0.6);
    setShotJson('');
    const d = designerRef.current;
    if (d) {
      d.setDuration(12);
      d.setLoop(false);
      d.setEaseInOut(0.6);
      d.clear();
      d.setTargetPoint(defaultTarget);
    }
    syncFromDesigner();
  }, [defaultTarget, disableEditing, stop, syncFromDesigner]);

  return {
    onViewerReady,
    isEditing,
    isPlaying,
    duration,
    loop,
    easeInOut,
    points,
    pointCount,
    selectedIndex,
    isPickTargetArmed,
    shotJson,
    setDuration,
    setLoop,
    setEaseInOut,
    setShotJson,
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
