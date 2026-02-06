import { useRef, type InputHTMLAttributes } from 'react';
import { styles } from '../../styles';

type DirectoryFileInputProps = InputHTMLAttributes<HTMLInputElement> & {
  webkitdirectory?: string;
  directory?: string;
};

export function ModelSourceSection(props: {
  inputUrl: string;
  setInputUrlFromUser: (value: string) => void;
  isLoading: boolean;
  onLoad: () => void;
  isLocalFile: boolean;
  selectedModelFile: File | null;
  selectedTextureFiles: File[];
  onFolderSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onModelFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTextureFilesSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const {
    inputUrl,
    setInputUrlFromUser,
    isLoading,
    onLoad,
    isLocalFile,
    selectedModelFile,
    selectedTextureFiles,
    onFolderSelect,
    onModelFileSelect,
    onTextureFilesSelect,
  } = props;

  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const modelFileInputRef = useRef<HTMLInputElement | null>(null);
  const textureFilesInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>Model URL</h2>
      <div style={styles.inputGroup}>
        <label style={styles.label}>GLTF/GLB Model URL</label>
        <input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrlFromUser(e.target.value)}
          placeholder="Enter model URL..."
          style={styles.input}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <input
          ref={folderInputRef}
          type="file"
          {...({
            webkitdirectory: '',
            directory: '',
          } as DirectoryFileInputProps)}
          multiple
          onChange={onFolderSelect}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => folderInputRef.current?.click()}
          style={styles.buttonSecondary}
          title="Select a folder containing model and all assets"
        >
          📂 Choose Folder
        </button>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <input
          ref={modelFileInputRef}
          type="file"
          accept=".gltf,.glb"
          onChange={onModelFileSelect}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => modelFileInputRef.current?.click()}
          style={styles.buttonSecondary}
          title="Select a local .gltf or .glb file"
        >
          📁 Choose Local File
        </button>
      </div>

      {isLocalFile &&
        selectedModelFile &&
        selectedModelFile.name.toLowerCase().endsWith('.gltf') && (
          <div style={{ marginBottom: '12px' }}>
            <input
              ref={textureFilesInputRef}
              type="file"
              accept=".png,.jpg,.jpeg"
              multiple
              onChange={onTextureFilesSelect}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => textureFilesInputRef.current?.click()}
              style={styles.buttonSecondary}
              title="Select texture image files (.png, .jpg, .jpeg)"
            >
              🖼️ Choose Texture Files
            </button>
            {selectedTextureFiles.length > 0 && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '8px',
                  backgroundColor: '#1a1a2e',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#a0a0a0',
                }}
              >
                <div style={{ marginBottom: '4px', color: '#69f0ae' }}>
                  {selectedTextureFiles.length} texture file(s) selected:
                </div>
                {selectedTextureFiles.map((file, index) => (
                  <div key={index} style={{ paddingLeft: '8px' }}>
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
          ...styles.button,
          ...(isLoading || !inputUrl ? styles.buttonDisabled : {}),
        }}
      >
        {isLoading ? 'Loading...' : 'Load Model'}
      </button>
    </section>
  );
}
