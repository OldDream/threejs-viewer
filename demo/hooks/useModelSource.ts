import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { LocalFileManager } from '../../src/utils/LocalFileManager';

export type ModelSourceState = {
  modelUrl: string;
  inputUrl: string;
  setInputUrlFromUser: (value: string) => void;
  isLocalFile: boolean;
  selectedModelFile: File | null;
  selectedTextureFiles: File[];
  isFolderMode: boolean;
  selectedFolderFiles: File[];
  isUsingLocalAssets: boolean;
  handleLoad: () => Promise<void>;
  handleFolderSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  handleModelFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  handleTextureFilesSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  cleanupObjectUrls: () => void;
  cleanupObjectUrlsLater: (delayMs?: number) => void;
  reset: () => void;
};

export function useModelSource(defaultModelUrl: string): ModelSourceState {
  const [modelUrl, setModelUrl] = useState<string>(defaultModelUrl);
  const [inputUrl, setInputUrl] = useState<string>(defaultModelUrl);

  const [localFileManager] = useState(() => new LocalFileManager());
  const [selectedModelFile, setSelectedModelFile] = useState<File | null>(null);
  const [selectedTextureFiles, setSelectedTextureFiles] = useState<File[]>([]);
  const [isLocalFile, setIsLocalFile] = useState<boolean>(false);

  const [selectedFolderFiles, setSelectedFolderFiles] = useState<File[]>([]);
  const [isFolderMode, setIsFolderMode] = useState<boolean>(false);

  const isUsingLocalAssets = useMemo(
    () => isLocalFile || isFolderMode,
    [isFolderMode, isLocalFile]
  );

  const setInputUrlFromUser = useCallback((value: string) => {
    setInputUrl(value);

    const isMarker =
      value.startsWith('[Local File]') || value.startsWith('[Local Folder]');

    if (!isMarker) {
      setIsLocalFile(false);
      setSelectedModelFile(null);
      setSelectedTextureFiles([]);
      setIsFolderMode(false);
      setSelectedFolderFiles([]);
    }
  }, []);

  const handleFolderSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;

      setSelectedFolderFiles(files);
      setIsFolderMode(true);

      setIsLocalFile(false);
      setSelectedModelFile(null);
      setSelectedTextureFiles([]);

      setInputUrl(`[Local Folder] ${files.length} files selected`);
    },
    []
  );

  const handleModelFileSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setSelectedModelFile(file);
      setIsLocalFile(true);

      setIsFolderMode(false);
      setSelectedFolderFiles([]);

      setInputUrl(`[Local File] ${file.name}`);

      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'gltf') {
        setSelectedTextureFiles([]);
      }
    },
    []
  );

  const handleTextureFilesSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      setSelectedTextureFiles(files);
    },
    []
  );

  const handleLoad = useCallback(async () => {
    if (isFolderMode && selectedFolderFiles.length > 0) {
      const result = await localFileManager.loadModelFromFolder(
        selectedFolderFiles
      );
      setModelUrl(result.modelUrl);
      return;
    }

    if (isLocalFile && selectedModelFile) {
      const result = await localFileManager.loadModelFromFiles(
        selectedModelFile,
        selectedTextureFiles
      );
      setModelUrl(result.modelUrl);
      return;
    }

    setModelUrl(inputUrl);
  }, [
    inputUrl,
    isFolderMode,
    isLocalFile,
    localFileManager,
    selectedFolderFiles,
    selectedModelFile,
    selectedTextureFiles,
  ]);

  const cleanupObjectUrls = useCallback(() => {
    localFileManager.cleanup();
  }, [localFileManager]);

  const cleanupObjectUrlsLater = useCallback(
    (delayMs: number = 1000) => {
      setTimeout(() => {
        localFileManager.cleanup();
      }, delayMs);
    },
    [localFileManager]
  );

  const reset = useCallback(() => {
    setInputUrl(defaultModelUrl);
    setModelUrl(defaultModelUrl);

    setIsLocalFile(false);
    setSelectedModelFile(null);
    setSelectedTextureFiles([]);

    setIsFolderMode(false);
    setSelectedFolderFiles([]);

    localFileManager.cleanup();
  }, [defaultModelUrl, localFileManager]);

  useEffect(() => {
    return () => {
      localFileManager.cleanup();
    };
  }, [localFileManager]);

  return {
    modelUrl,
    inputUrl,
    setInputUrlFromUser,
    isLocalFile,
    selectedModelFile,
    selectedTextureFiles,
    isFolderMode,
    selectedFolderFiles,
    isUsingLocalAssets,
    handleLoad,
    handleFolderSelect,
    handleModelFileSelect,
    handleTextureFilesSelect,
    cleanupObjectUrls,
    cleanupObjectUrlsLater,
    reset,
  };
}
