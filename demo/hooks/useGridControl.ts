import { useState, useEffect } from 'react';
import { GridConfig } from '../../src';

export function useGridControl() {
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showAxes, setShowAxes] = useState<boolean>(true);
  const [gridPlane, setGridPlane] = useState<'XY' | 'XZ' | 'YZ'>('XZ');
  const [gridConfig, setGridConfig] = useState<GridConfig>({
    visible: true,
    showAxes: true,
    plane: 'XZ',
  });

  useEffect(() => {
    setGridConfig({
      visible: showGrid,
      showAxes: showAxes,
      plane: gridPlane,
    });
  }, [showGrid, showAxes, gridPlane]);

  return {
    gridConfig,
    showGrid,
    showAxes,
    gridPlane,
    setShowGrid,
    setShowAxes,
    setGridPlane,
  };
}
