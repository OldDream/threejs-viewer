import { useState, useCallback } from 'react';

export function useZoomControl() {
  const [zoomLimits, setZoomLimits] = useState<{ min?: number; max?: number } | undefined>(undefined);
  const [zoomMin, setZoomMin] = useState<string>('0.1');
  const [zoomMax, setZoomMax] = useState<string>('100');
  const [useZoomLimits, setUseZoomLimits] = useState<boolean>(false);

  const handleApply = useCallback(() => {
    if (useZoomLimits) {
      const min = parseFloat(zoomMin) || 0.1;
      const max = parseFloat(zoomMax) || 100;
      setZoomLimits({ min, max });
    } else {
      setZoomLimits(undefined);
    }
  }, [useZoomLimits, zoomMin, zoomMax]);

  const handleReset = useCallback(() => {
    setZoomMin('0.1');
    setZoomMax('100');
    setUseZoomLimits(false);
    setZoomLimits(undefined);
  }, []);

  return {
    zoomLimits,
    zoomMin,
    zoomMax,
    useZoomLimits,
    setZoomMin,
    setZoomMax,
    setUseZoomLimits,
    handleApply,
    handleReset,
  };
}
