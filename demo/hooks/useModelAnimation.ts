import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ModelAnimationPlugin,
  ModelLoadResult,
  ThreeViewerHandle,
  ViewerCore,
} from '../../src';

export function useModelAnimation(
  viewerRef: RefObject<ThreeViewerHandle | null>,
  loadResult: ModelLoadResult | null
) {
  const pluginRef = useRef<ModelAnimationPlugin | null>(null);
  const viewerCoreRef = useRef<ViewerCore | null>(null);
  const [autoPlay, setAutoPlay] = useState(true);

  const clipCount = useMemo(() => loadResult?.animations?.length ?? 0, [loadResult]);

  const attachToViewerCore = useCallback(
    (viewerCore: ViewerCore) => {
      viewerCoreRef.current = viewerCore;

      const existing = viewerCore.plugins.get<ModelAnimationPlugin>('ModelAnimationPlugin');
      const plugin = existing ?? new ModelAnimationPlugin();

      if (!existing && !viewerCore.plugins.has(plugin.name)) {
        viewerCore.plugins.register(plugin);
      }

      pluginRef.current = plugin;
      plugin.configure({ autoPlay });

      if (loadResult) {
        plugin.setSource(loadResult.model, loadResult.animations ?? []);
      }
    },
    [autoPlay, loadResult]
  );

  useEffect(() => {
    let disposed = false;
    let raf = 0;

    const attachPlugin = () => {
      if (disposed) {
        return;
      }

      const viewerCore = viewerRef.current?.getViewerCore();
      if (!viewerCore) {
        raf = window.requestAnimationFrame(attachPlugin);
        return;
      }

      attachToViewerCore(viewerCore);
    };

    attachPlugin();

    return () => {
      disposed = true;
      if (raf) {
        window.cancelAnimationFrame(raf);
      }
    };
  }, [attachToViewerCore, viewerRef]);

  useEffect(() => {
    return () => {
      const viewerCore = viewerCoreRef.current;
      const plugin = pluginRef.current;
      if (viewerCore && plugin) {
        viewerCore.plugins.unregister(plugin.name);
      }
      viewerCoreRef.current = null;
      pluginRef.current = null;
    };
  }, []);

  useEffect(() => {
    const plugin = pluginRef.current;
    if (!plugin) return;

    plugin.configure({ autoPlay });

    if (!loadResult) {
      plugin.setSource(null, []);
      return;
    }

    plugin.setSource(loadResult.model, loadResult.animations ?? []);
  }, [autoPlay, loadResult]);

  const toggleAutoPlay = useCallback(() => {
    const next = !autoPlay;
    setAutoPlay(next);
    const plugin = pluginRef.current;
    if (!plugin) return;
    plugin.configure({ autoPlay: next });
    if (next) {
      plugin.play();
    } else {
      plugin.stop({ resetTime: true });
    }
  }, [autoPlay]);

  const stopAndReset = useCallback(() => {
    const plugin = pluginRef.current;
    if (!plugin) return;
    plugin.stop({ resetTime: true });
  }, []);

  return {
    autoPlay,
    setAutoPlay,
    toggleAutoPlay,
    clipCount,
    hasAnimations: clipCount > 0,
    onViewerReady: attachToViewerCore,
    stopAndReset,
  };
}

