import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'three-viewer-camera-path-editor-layout-v1';

export interface FloatingRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DockablePanelStateValue {
  isOpen: boolean;
  isDocked: boolean;
  dockHeight: number;
  floatingRect: FloatingRect;
  timelineZoom: number;
  timelineSnap: number;
}

function clampDockHeight(dockHeight: number, innerHeight?: number) {
  const maxHeight = typeof innerHeight === 'number' ? Math.floor(innerHeight * 0.65) : 650;
  return Math.max(240, Math.min(Math.round(dockHeight), maxHeight));
}

function getDefaultDockHeight() {
  if (typeof window === 'undefined') return 360;
  return clampDockHeight(Math.round(window.innerHeight * 0.42), window.innerHeight);
}

const defaultState: DockablePanelStateValue = {
  isOpen: true,
  isDocked: true,
  dockHeight: 360,
  floatingRect: {
    x: 120,
    y: 120,
    width: 720,
    height: 420,
  },
  timelineZoom: 80,
  timelineSnap: 0.1,
};

export function useDockablePanelState() {
  const [state, setState] = useState<DockablePanelStateValue>(() => {
    if (typeof window === 'undefined') return defaultState;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaultState, dockHeight: getDefaultDockHeight() };
      const parsed = JSON.parse(raw) as Partial<DockablePanelStateValue>;
      return {
        ...defaultState,
        ...parsed,
        dockHeight: clampDockHeight(parsed.dockHeight ?? defaultState.dockHeight, window.innerHeight),
        floatingRect: {
          ...defaultState.floatingRect,
          ...(parsed.floatingRect ?? {}),
        },
      };
    } catch {
      return defaultState;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore persistence failures (privacy mode / quota / disabled storage).
    }
  }, [state]);

  const setOpen = useCallback((isOpen: boolean) => {
    setState((prev) => ({ ...prev, isOpen }));
  }, []);

  const setDocked = useCallback((isDocked: boolean) => {
    setState((prev) => ({ ...prev, isDocked }));
  }, []);

  const toggleOpen = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const toggleDocked = useCallback(() => {
    setState((prev) => ({ ...prev, isDocked: !prev.isDocked }));
  }, []);

  const setDockHeight = useCallback((dockHeight: number) => {
    setState((prev) => ({ ...prev, dockHeight: clampDockHeight(dockHeight, window.innerHeight) }));
  }, []);

  const setFloatingRect = useCallback((floatingRect: FloatingRect) => {
    setState((prev) => ({
      ...prev,
      floatingRect: {
        x: Math.round(floatingRect.x),
        y: Math.round(floatingRect.y),
        width: Math.max(480, Math.round(floatingRect.width)),
        height: Math.max(300, Math.round(floatingRect.height)),
      },
    }));
  }, []);

  const setTimelineZoom = useCallback((timelineZoom: number) => {
    setState((prev) => ({ ...prev, timelineZoom: Math.max(30, Math.min(240, timelineZoom)) }));
  }, []);

  const setTimelineSnap = useCallback((timelineSnap: number) => {
    const valid = timelineSnap === 0.01 ? 0.01 : 0.1;
    setState((prev) => ({ ...prev, timelineSnap: valid }));
  }, []);

  return useMemo(() => ({
    panelState: state,
    setOpen,
    setDocked,
    toggleOpen,
    toggleDocked,
    setDockHeight,
    setFloatingRect,
    setTimelineZoom,
    setTimelineSnap,
  }), [
    setDockHeight,
    setDocked,
    setFloatingRect,
    setOpen,
    setTimelineSnap,
    setTimelineZoom,
    state,
    toggleDocked,
    toggleOpen,
  ]);
}
