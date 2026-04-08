import { useEffect, useRef, useState } from 'react';
import type { ModelViewerModel } from '../types/modelViewer';
import { LocalFileManager } from '../utils/LocalFileManager';

interface ResolvedModelState {
  modelUrl: string | undefined;
  isPreparing: boolean;
  error: Error | null;
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export function useResolvedModel(model?: ModelViewerModel | null): ResolvedModelState {
  const [localFileManager] = useState(() => new LocalFileManager());
  const requestIdRef = useRef(0);
  const [state, setState] = useState<ResolvedModelState>({
    modelUrl: undefined,
    isPreparing: false,
    error: null,
  });

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    let disposed = false;

    localFileManager.cleanup();

    if (!model) {
      setState({
        modelUrl: undefined,
        isPreparing: false,
        error: null,
      });

      return () => {
        disposed = true;
      };
    }

    if (model.type === 'url') {
      setState({
        modelUrl: model.url,
        isPreparing: false,
        error: null,
      });

      return () => {
        disposed = true;
      };
    }

    setState({
      modelUrl: undefined,
      isPreparing: true,
      error: null,
    });

    const resolveModel = async () => {
      try {
        const result =
          model.type === 'file'
            ? await localFileManager.loadModelFromFiles(model.file, model.resources ?? [])
            : await localFileManager.loadModelFromFolder(model.files);

        if (disposed || requestId !== requestIdRef.current) {
          result.cleanup();
          return;
        }

        setState({
          modelUrl: result.modelUrl,
          isPreparing: false,
          error: null,
        });
      } catch (error) {
        if (disposed || requestId !== requestIdRef.current) {
          return;
        }

        setState({
          modelUrl: undefined,
          isPreparing: false,
          error: toError(error),
        });
      }
    };

    void resolveModel();

    return () => {
      disposed = true;
      localFileManager.cleanup();
    };
  }, [localFileManager, model]);

  return state;
}
