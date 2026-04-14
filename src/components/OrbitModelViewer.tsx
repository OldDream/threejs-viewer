import { forwardRef, useMemo } from 'react';
import { ModelViewer } from './ModelViewer';
import type {
  ModelViewerCameraScript,
  ModelViewerHandle,
  OrbitModelViewerProps,
} from '../types/modelViewer';

/**
 * 把第三方真正需要的 orbit 能力收敛成一个更稳定的高层组件。
 *
 * 设计目标：
 * 1. 外部不需要理解 cameraScript 联合类型
 * 2. 距离策略固定为 fit，避免策略切换带来的学习和维护成本
 * 3. 内部仍然复用 ModelViewer 的既有加载链路和 handle 能力
 */
export const OrbitModelViewer = forwardRef<ModelViewerHandle, OrbitModelViewerProps>(
  function OrbitModelViewer(
    {
      orbitAxis = 'y',
      axisAngleDeg = 60,
      initialPhaseDeg = 45,
      autoRotate = true,
      rotationSpeedDegPerSec = 15,
      fitPadding = 1.15,
      glassEffect,
      ...restProps
    },
    ref
  ) {
    /**
     * 第三方传入的是简单 props，
     * 这里再翻译成底层统一使用的 cameraScript 结构。
     */
    const cameraScript = useMemo<ModelViewerCameraScript>(() => {
      return {
        mode: 'orbit',
        data: {
          kind: 'axisOrbit',
          axis: orbitAxis,
          axisAngleDeg,
          phaseDeg: initialPhaseDeg,
          autoRotate,
          speedDegPerSec: rotationSpeedDegPerSec,
          distance: {
            mode: 'fit',
            padding: fitPadding,
          },
        },
      };
    }, [autoRotate, axisAngleDeg, fitPadding, initialPhaseDeg, orbitAxis, rotationSpeedDegPerSec]);

    const glassStyles: React.CSSProperties = useMemo(() => {
      if (!glassEffect) return {};
      const blur = typeof glassEffect === 'object' && glassEffect.blur !== undefined ? glassEffect.blur : 10;
      const color = typeof glassEffect === 'object' && glassEffect.color !== undefined ? glassEffect.color : 'rgba(255, 255, 255, 0.1)';
      return {
        backgroundColor: color,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
      };
    }, [glassEffect]);

    return (
      <ModelViewer
        ref={ref}
        {...restProps}
        cameraScript={cameraScript}
        style={{ ...glassStyles, ...restProps.style }}
        {...(glassEffect ? { backgroundColor: 'transparent' } : {})}
      />
    );
  }
);

OrbitModelViewer.displayName = 'OrbitModelViewer';

export type { OrbitModelViewerProps } from '../types/modelViewer';
