import { useState, useCallback } from 'react';

export function usePivotControl() {
  const [pivotPoint, setPivotPoint] = useState<{ x: number; y: number; z: number } | undefined>(undefined);
  const [pivotX, setPivotX] = useState<string>('0');
  const [pivotY, setPivotY] = useState<string>('0');
  const [pivotZ, setPivotZ] = useState<string>('0');
  const [usePivotPoint, setUsePivotPoint] = useState<boolean>(false);

  const formatCoord = useCallback((value: number) => {
    if (!Number.isFinite(value)) return '0';
    const rounded = Math.round(value * 1000) / 1000;
    return String(rounded);
  }, []);

  const syncFromTarget = useCallback(
    (target: { x: number; y: number; z: number }) => {
      const nextX = formatCoord(target.x);
      const nextY = formatCoord(target.y);
      const nextZ = formatCoord(target.z);

      setPivotX((prev) => (prev === nextX ? prev : nextX));
      setPivotY((prev) => (prev === nextY ? prev : nextY));
      setPivotZ((prev) => (prev === nextZ ? prev : nextZ));

      if (usePivotPoint) {
        setPivotPoint((prev) => {
          if (!prev) return { x: target.x, y: target.y, z: target.z };
          const eps = 1e-6;
          if (
            Math.abs(prev.x - target.x) < eps &&
            Math.abs(prev.y - target.y) < eps &&
            Math.abs(prev.z - target.z) < eps
          ) {
            return prev;
          }
          return { x: target.x, y: target.y, z: target.z };
        });
      }
    },
    [formatCoord, usePivotPoint]
  );

  const handleApply = useCallback(() => {
    if (usePivotPoint) {
      const x = parseFloat(pivotX) || 0;
      const y = parseFloat(pivotY) || 0;
      const z = parseFloat(pivotZ) || 0;
      setPivotPoint({ x, y, z });
    } else {
      setPivotPoint(undefined);
    }
  }, [usePivotPoint, pivotX, pivotY, pivotZ]);

  const handleReset = useCallback(() => {
    setPivotX('0');
    setPivotY('0');
    setPivotZ('0');
    setUsePivotPoint(false);
    setPivotPoint(undefined);
  }, []);

  return {
    pivotPoint,
    pivotX,
    pivotY,
    pivotZ,
    usePivotPoint,
    setPivotX,
    setPivotY,
    setPivotZ,
    setUsePivotPoint,
    syncFromTarget,
    handleApply,
    handleReset,
  };
}
