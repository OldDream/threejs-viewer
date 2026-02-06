import { useState, useCallback } from 'react';

export function usePivotControl() {
  const [pivotPoint, setPivotPoint] = useState<{ x: number; y: number; z: number } | undefined>(undefined);
  const [pivotX, setPivotX] = useState<string>('0');
  const [pivotY, setPivotY] = useState<string>('0');
  const [pivotZ, setPivotZ] = useState<string>('0');
  const [usePivotPoint, setUsePivotPoint] = useState<boolean>(false);

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
    handleApply,
    handleReset,
  };
}
