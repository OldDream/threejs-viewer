import { useRef, useState, useEffect, useCallback, RefObject } from 'react';
import * as THREE from 'three';
import { 
  CameraPathAnimationPlugin, 
  CameraPathAnimationConfig, 
  ThreeViewerHandle, 
  IOrbitControlsPlugin,
  ModelLoadResult 
} from '../../src';

export function useCameraAnimation(
  viewerRef: RefObject<ThreeViewerHandle | null>,
  loadResult: ModelLoadResult | null
) {
  const pluginRef = useRef<CameraPathAnimationPlugin | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'target' | 'fixed' | 'path'>('target');

  // Register plugin
  useEffect(() => {
    const viewerCore = viewerRef.current?.getViewerCore();
    if (!viewerCore || !viewerCore.isInitialized) {
      return;
    }

    const plugin = new CameraPathAnimationPlugin();
    viewerCore.plugins.register(plugin);
    pluginRef.current = plugin;

    const orbitPlugin = viewerCore.plugins.get<IOrbitControlsPlugin>('OrbitControlsPlugin');
    if (orbitPlugin) {
      plugin.setOrbitControlsPlugin(orbitPlugin);
    }

    return () => {
      if (pluginRef.current) {
        viewerCore.plugins.unregister(pluginRef.current.name);
        pluginRef.current = null;
      }
    };
  }, [viewerRef]);

  const handleToggle = useCallback(() => {
    const plugin = pluginRef.current;
    if (!plugin) return;

    if (isAnimating) {
      plugin.stop();
      setIsAnimating(false);
    } else {
      const center = loadResult ? loadResult.center : new THREE.Vector3(0, 0, 0);
      const size = loadResult 
        ? loadResult.boundingBox.getSize(new THREE.Vector3()) 
        : new THREE.Vector3(10, 10, 10);
      const maxDim = Math.max(size.x, size.y, size.z);
      const radius = maxDim * 2.0;
      
      const points: THREE.Vector3[] = [];
      const segmentCount = 120;
      
      for (let i = 0; i <= segmentCount; i++) {
        const angle = (i / segmentCount) * Math.PI * 2;
        const heightOffset = Math.sin(angle * 2) * (maxDim * 0.8);
        
        points.push(new THREE.Vector3(
          center.x + Math.cos(angle) * radius,
          center.y + heightOffset,
          center.z + Math.sin(angle) * radius
        ));
      }

      const config: CameraPathAnimationConfig = {
        pathPoints: points,
        duration: 15,
        loop: true,
        autoPlay: true
      };

      if (viewMode === 'target') {
        config.target = center;
      } else if (viewMode === 'fixed') {
        config.fixedDirection = new THREE.Vector3(0, -0.5, -1).normalize();
      } else if (viewMode === 'path') {
        config.lookAlongPath = true;
      }

      plugin.configure(config);
      setIsAnimating(true);
    }
  }, [isAnimating, loadResult, viewMode]);

  const handleStop = useCallback(() => {
    if (pluginRef.current && isAnimating) {
      pluginRef.current.stop();
      setIsAnimating(false);
    }
  }, [isAnimating]);

  return {
    isAnimating,
    viewMode,
    setViewMode,
    handleToggle,
    handleStop,
  };
}
