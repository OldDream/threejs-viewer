import { useRef, useState, useEffect, useCallback, RefObject } from 'react';
import { CameraMovementPlugin, ICameraMovementPlugin, ThreeViewerHandle, IOrbitControlsPlugin, ViewerCore } from '../../src';

export function useCameraMovement(viewerRef: RefObject<ThreeViewerHandle | null>, isAnimating: boolean) {
  const pluginRef = useRef<ICameraMovementPlugin | null>(null);
  const [enabled, setEnabled] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(5.0);
  const [isCSMode, setIsCSMode] = useState<boolean>(false);

  const onViewerReady = useCallback((viewerCore: ViewerCore) => {
    const existing = viewerCore.plugins.get<ICameraMovementPlugin>('CameraMovementPlugin');
    const plugin = existing ?? new CameraMovementPlugin();

    if (!existing && !viewerCore.plugins.has(plugin.name)) {
      viewerCore.plugins.register(plugin);
    }

    pluginRef.current = plugin;

    const orbitPlugin = viewerCore.plugins.get<IOrbitControlsPlugin>('OrbitControlsPlugin');
    if (orbitPlugin) {
      plugin.setOrbitControlsTarget(orbitPlugin.controls.target);
    }

    plugin.setMoveSpeed(speed);
    plugin.setFlyMode(isCSMode);
    plugin.setEnabled(enabled && !isAnimating);
  }, [enabled, isAnimating, isCSMode, speed]);

  useEffect(() => {
    return () => {
      const viewerCore = viewerRef.current?.getViewerCore();
      const plugin = pluginRef.current;
      if (viewerCore && plugin) {
        viewerCore.plugins.unregister(plugin.name);
      }
      pluginRef.current = null;
    };
  }, [viewerRef]);

  // Sync enabled state
  useEffect(() => {
    if (pluginRef.current) {
      pluginRef.current.setEnabled(enabled && !isAnimating);
    }
  }, [enabled, isAnimating]);

  // Sync speed
  useEffect(() => {
    if (pluginRef.current) {
      pluginRef.current.setMoveSpeed(speed);
    }
  }, [speed]);

  // Sync fly mode
  useEffect(() => {
    if (pluginRef.current) {
      pluginRef.current.setFlyMode(isCSMode);
    }
  }, [isCSMode]);

  const handleReset = useCallback(() => {
    setEnabled(true);
    setSpeed(5.0);
    setIsCSMode(false);
  }, []);

  return {
    enabled,
    speed,
    isCSMode,
    setEnabled,
    setSpeed,
    setIsCSMode,
    onViewerReady,
    handleReset,
  };
}
