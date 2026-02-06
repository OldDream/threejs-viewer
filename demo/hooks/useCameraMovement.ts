import { useRef, useState, useEffect, useCallback, RefObject } from 'react';
import { CameraMovementPlugin, ICameraMovementPlugin, ThreeViewerHandle, IOrbitControlsPlugin } from '../../src';

export function useCameraMovement(viewerRef: RefObject<ThreeViewerHandle | null>, isAnimating: boolean) {
  const pluginRef = useRef<ICameraMovementPlugin | null>(null);
  const [enabled, setEnabled] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(5.0);
  const [isCSMode, setIsCSMode] = useState<boolean>(false);

  // Register plugin
  useEffect(() => {
    const viewerCore = viewerRef.current?.getViewerCore();
    if (!viewerCore || !viewerCore.isInitialized) {
      return;
    }

    const plugin = new CameraMovementPlugin();
    viewerCore.plugins.register(plugin);
    pluginRef.current = plugin;

    const orbitPlugin = viewerCore.plugins.get<IOrbitControlsPlugin>('OrbitControlsPlugin');
    if (orbitPlugin) {
      plugin.setOrbitControlsTarget(orbitPlugin.controls.target);
    }

    return () => {
      if (pluginRef.current) {
        viewerCore.plugins.unregister(pluginRef.current.name);
        pluginRef.current = null;
      }
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
    handleReset,
  };
}
