import React from 'react';
import { ControlSection } from './ControlSection';
import { styles as themeStyles, colors } from '../../styles/theme';
import { FileState } from '../../hooks/useModelLoader';

const styles = {
  inputGroup: {
    marginBottom: '12px',
  } as React.CSSProperties,
  
  textureInfo: {
    marginTop: '8px',
    padding: '8px',
    backgroundColor: colors.background.input,
    borderRadius: '4px',
    fontSize: '12px',
    color: colors.text.secondary,
  } as React.CSSProperties,
  
  textureTitle: {
    marginBottom: '4px',
    color: colors.text.success,
  } as React.CSSProperties,
  
  textureItem: {
    paddingLeft: '8px',
  } as React.CSSProperties,
};

interface ModelUrlControlProps {
  inputUrl: string;
  isLoading: boolean;
  fileState: FileState;
  onInputUrlChange: (url: string) => void;
  onFolderSelect: (files: File[]) => void;
  onModelFileSelect: (file: File) => void;
  onTextureFilesSelect: (files: File[]) => void;
  onLoad: () => void;
}

export function ModelUrlControl({
  inputUrl,
  isLoading,
  fileState,
  onInputUrlChange,
  onFolderSelect,
  onModelFileSelect,
  onTextureFilesSelect,
  onLoad,
}: ModelUrlControlProps) {
  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onFolderSelect(files);
  };

  const handleModelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onModelFileSelect(file);
    }
  };

  const handleTextureFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onTextureFilesSelect(files);
  };

  const showTextureInput = fileState.isLocalFile && 
    fileState.selectedModelFile && 
    fileState.selectedModelFile.name.toLowerCase().endsWith('.gltf');

  return (
    <ControlSection title="Model URL">
      <div style={styles.inputGroup}>
        <label style={themeStyles.label}>GLTF/GLB Model URL</label>
        <input
          type="text"
          value={inputUrl}
          onChange={(e) => onInputUrlChange(e.target.value)}
          placeholder="Enter model URL..."
          style={themeStyles.input}
        />
      </div>

      <div style={styles.inputGroup}>
        <input
          type="file"
          id="folderInput"
          // @ts-expect-error webkitdirectory is not a standard attribute
          webkitdirectory=""
          directory=""
          multiple
          onChange={handleFolderChange}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => document.getElementById('folderInput')?.click()}
          style={themeStyles.buttonSecondary}
          title="Select a folder containing model and all assets"
        >
          📂 Choose Folder
        </button>
      </div>

      <div style={styles.inputGroup}>
        <input
          type="file"
          id="modelFileInput"
          accept=".gltf,.glb"
          onChange={handleModelFileChange}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => document.getElementById('modelFileInput')?.click()}
          style={themeStyles.buttonSecondary}
          title="Select a local .gltf or .glb file"
        >
          📁 Choose Local File
        </button>
      </div>

      {showTextureInput && (
        <div style={styles.inputGroup}>
          <input
            type="file"
            id="textureFilesInput"
            accept=".png,.jpg,.jpeg"
            multiple
            onChange={handleTextureFilesChange}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => document.getElementById('textureFilesInput')?.click()}
            style={themeStyles.buttonSecondary}
            title="Select texture image files (.png, .jpg, .jpeg)"
          >
            🖼️ Choose Texture Files
          </button>
          {fileState.selectedTextureFiles.length > 0 && (
            <div style={styles.textureInfo}>
              <div style={styles.textureTitle}>
                {fileState.selectedTextureFiles.length} texture file(s) selected:
              </div>
              {fileState.selectedTextureFiles.map((file, index) => (
                <div key={index} style={styles.textureItem}>
                  • {file.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={onLoad}
        disabled={isLoading || !inputUrl}
        style={{
          ...themeStyles.button,
          ...(isLoading || !inputUrl ? { backgroundColor: colors.button.disabled, cursor: 'not-allowed' } : {}),
        }}
      >
        {isLoading ? 'Loading...' : 'Load Model'}
      </button>
    </ControlSection>
  );
}
