import { useMemo } from 'react';
import type { GridConfig } from '../../src';

export function useGridConfig(
  showGrid: boolean,
  showAxes: boolean,
  plane: 'XY' | 'XZ' | 'YZ'
): GridConfig {
  return useMemo(
    () => ({
      visible: showGrid,
      showAxes,
      plane,
    }),
    [plane, showAxes, showGrid]
  );
}

