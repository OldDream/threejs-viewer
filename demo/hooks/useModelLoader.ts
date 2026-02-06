import { useState, useCallback } from 'react';
import { ModelLoadResult } from '../../src';
import { LocalFileManager } from '../../src/utils/LocalFileManager';

const DEFAULT_MODEL_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/refs/heads/main/2.0/2CylinderEngine/glTF/2CylinderEngine.gltf';

export interface FileState {
  selectedModelFile: File | null;
  selectedTextureFiles: File[];
  isLocalFile: boolean;
  selectedFolderFiles: File[];
  isFolderMode: boolean;
}

export function useModelLoader() {
  const [modelUrl, setModelUrl] = useState<string>(DEFAULT_MODEL_URL);
  const [inputUrl, setInputUrl] = useState<string>(DEFAULT_MODEL_URL);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [loadResult, setLoadResult] = useState<ModelLoadResult | null>(null);
  
  const [localFileManager] = useState(() => new LocalFileManager());
  const [fileState, setFileState] = useState<FileState>({
    selectedModelFile: null,
    selectedTextureFiles: [],
    isLocalFile: false,
    selectedFolderFiles: [],
    isFolderMode: false,
  });

  const handleLoad = useCallback(async () => {
    setError(null);
    setLoadResult(null);
    
    try {
      if (fileState.isFolderMode && fileState.selectedFolderFiles.length > 0) {
        const result = await localFileManager.loadModelFromFolder(fileState.selectedFolderFiles);
        setModelUrl(result.modelUrl);
      } else if (fileState.isLocalFile && fileState.selectedModelFile) {
        const result = await localFileManager.loadModelFromFiles(
          fileState.selectedModelFile,
          fileState.selectedTextureFiles
        );
        setModelUrl(result.modelUrl);
      } else {
        setModelUrl(inputUrl);
      }
    } catch (err) {
      setError(err as Error);
    }
  }, [fileState, inputUrl, localFileManager]);

  const handleFolderSelect = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFileState({
        selectedModelFile: null,
        selectedTextureFiles: [],
        isLocalFile: false,
        selectedFolderFiles: files,
        isFolderMode: true,
      });
      setInputUrl(`[Local Folder] ${files.length} files selected`);
    }
  }, []);

  const handleModelFileSelect = useCallback((file: File) => {
    setFileState({
      selectedModelFile: file,
      selectedTextureFiles: [],
      isLocalFile: true,
      selectedFolderFiles: [],
      isFolderMode: false,
    });
    setInputUrl(`[Local File] ${file.name}`);
  }, []);

  const handleTextureFilesSelect = useCallback((files: File[]) => {
    setFileState(prev => ({
      ...prev,
      selectedTextureFiles: files,
    }));
  }, []);

  const handleInputUrlChange = useCallback((url: string) => {
    setInputUrl(url);
    if (!url.startsWith('[Local File]') && !url.startsWith('[Local Folder]')) {
      setFileState({
        selectedModelFile: null,
        selectedTextureFiles: [],
        isLocalFile: false,
        selectedFolderFiles: [],
        isFolderMode: false,
      });
    }
  }, []);

  const handleLoadSuccess = useCallback((result: ModelLoadResult) => {
    setLoadResult(result);
    setError(null);
    
    if (fileState.isLocalFile || fileState.isFolderMode) {
      setTimeout(() => {
        localFileManager.cleanup();
      }, 1000);
    }
  }, [fileState.isLocalFile, fileState.isFolderMode, localFileManager]);

  const handleLoadError = useCallback((err: Error) => {
    setError(err);
    setLoadResult(null);
    
    if (fileState.isLocalFile || fileState.isFolderMode) {
      localFileManager.cleanup();
    }
  }, [fileState.isLocalFile, fileState.isFolderMode, localFileManager]);

  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const handleReset = useCallback(() => {
    setInputUrl(DEFAULT_MODEL_URL);
    setModelUrl(DEFAULT_MODEL_URL);
    setError(null);
    setLoadResult(null);
    setFileState({
      selectedModelFile: null,
      selectedTextureFiles: [],
      isLocalFile: false,
      selectedFolderFiles: [],
      isFolderMode: false,
    });
    localFileManager.cleanup();
  }, [localFileManager]);

  return {
    modelUrl,
    inputUrl,
    isLoading,
    error,
    loadResult,
    fileState,
    handleLoad,
    handleFolderSelect,
    handleModelFileSelect,
    handleTextureFilesSelect,
    handleInputUrlChange,
    handleLoadSuccess,
    handleLoadError,
    handleLoadingChange,
    handleReset,
  };
}
