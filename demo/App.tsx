import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ThreeViewer, ModelLoadResult, GridConfig, CameraMovementPlugin, ICameraMovementPlugin, ThreeViewerHandle, IOrbitControlsPlugin } from '../src';
import { LocalFileManager } from '../src/utils/LocalFileManager';

/**
 * Demo Application for ThreeViewer Component
 * 
 * This demo showcases the basic usage of the ThreeViewer component including:
 * - Model URL input for loading GLTF/GLB models
 * - Pivot point controls (x, y, z)
 * - Zoom limits controls (min, max)
 * - Loading state indicator
 * - Error message display
 * 
 * Requirement 6.3: THE project SHALL include a demo application that showcases the Viewer component
 */

// Default sample model URL (a public GLTF model)
const DEFAULT_MODEL_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/refs/heads/main/2.0/2CylinderEngine/glTF/2CylinderEngine.gltf';

// Demo styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#1a1a2e',
    color: '#eaeaea',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    padding: '16px 24px',
    backgroundColor: '#16213e',
    borderBottom: '1px solid #0f3460',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
    color: '#e94560',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#a0a0a0',
  },
  main: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    flexShrink: 0,
    width: '320px',
    padding: '20px',
    backgroundColor: '#16213e',
    borderRight: '1px solid #0f3460',
    overflowY: 'auto',
  },
  viewerContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#0f0f23',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#e94560',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  inputGroup: {
    marginBottom: '12px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    color: '#a0a0a0',
    marginBottom: '4px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    backgroundColor: '#1a1a2e',
    border: '1px solid #0f3460',
    borderRadius: '6px',
    color: '#eaeaea',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  inputFocus: {
    borderColor: '#e94560',
  },
  button: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: 600,
    backgroundColor: '#e94560',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
  },
  buttonSecondary: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '13px',
    fontWeight: 500,
    backgroundColor: '#0f3460',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonHover: {
    backgroundColor: '#d63850',
  },
  buttonDisabled: {
    backgroundColor: '#4a4a5a',
    cursor: 'not-allowed',
  },
  row: {
    display: 'flex',
    gap: '12px',
  },
  col: {
    flex: 1,
  },
  statusContainer: {
    padding: '12px',
    borderRadius: '6px',
    backgroundColor: '#1a1a2e',
    border: '1px solid #0f3460',
  },
  loadingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#4fc3f7',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #4fc3f7',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorMessage: {
    color: '#ff6b6b',
    fontSize: '13px',
    wordBreak: 'break-word',
  },
  successMessage: {
    color: '#69f0ae',
    fontSize: '13px',
  },
  modelInfo: {
    marginTop: '8px',
    fontSize: '12px',
    color: '#a0a0a0',
  },
  overlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    color: '#a0a0a0',
  },
  overlayText: {
    fontSize: '16px',
    marginBottom: '8px',
  },
  overlayHint: {
    fontSize: '12px',
    color: '#666',
  },
} as const satisfies Record<string, React.CSSProperties>;

// CSS keyframes for spinner animation (injected via style tag)
const spinnerKeyframes = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const App: React.FC = () => {
  // ThreeViewer ref for accessing ViewerCore and plugins
  const viewerRef = useRef<ThreeViewerHandle>(null);
  
  // CameraMovementPlugin instance ref
  const cameraMovementPluginRef = useRef<ICameraMovementPlugin | null>(null);

  // Model URL state
  const [modelUrl, setModelUrl] = useState<string>(DEFAULT_MODEL_URL);
  const [inputUrl, setInputUrl] = useState<string>(DEFAULT_MODEL_URL);

  // Local file loading state
  const [localFileManager] = useState(() => new LocalFileManager());
  const [selectedModelFile, setSelectedModelFile] = useState<File | null>(null);
  const [selectedTextureFiles, setSelectedTextureFiles] = useState<File[]>([]);
  const [isLocalFile, setIsLocalFile] = useState<boolean>(false);

  // Folder loading state
  const [selectedFolderFiles, setSelectedFolderFiles] = useState<File[]>([]);
  const [isFolderMode, setIsFolderMode] = useState<boolean>(false);

  // Pivot point state
  const [pivotPoint, setPivotPoint] = useState<{ x: number; y: number; z: number } | undefined>(undefined);
  const [pivotX, setPivotX] = useState<string>('0');
  const [pivotY, setPivotY] = useState<string>('0');
  const [pivotZ, setPivotZ] = useState<string>('0');
  const [usePivotPoint, setUsePivotPoint] = useState<boolean>(false);

  // Zoom limits state
  const [zoomLimits, setZoomLimits] = useState<{ min?: number; max?: number } | undefined>(undefined);
  const [zoomMin, setZoomMin] = useState<string>('0.1');
  const [zoomMax, setZoomMax] = useState<string>('100');
  const [useZoomLimits, setUseZoomLimits] = useState<boolean>(false);

  // Grid state
  const [gridConfig, setGridConfig] = useState<GridConfig>({ visible: true, showAxes: true, plane: 'XZ' });
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showAxes, setShowAxes] = useState<boolean>(true);
  const [gridPlane, setGridPlane] = useState<'XY' | 'XZ' | 'YZ'>('XZ');

  // Camera movement state
  const [enableCameraMovement, setEnableCameraMovement] = useState<boolean>(true);
  const [cameraMovementSpeed, setCameraMovementSpeed] = useState<number>(5.0);

  // Loading and error state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [loadResult, setLoadResult] = useState<ModelLoadResult | null>(null);

  // Handle model load
  const handleLoad = useCallback(async () => {
    setError(null);
    setLoadResult(null);
    
    try {
      if (isFolderMode && selectedFolderFiles.length > 0) {
        // Load from local folder
        const result = await localFileManager.loadModelFromFolder(selectedFolderFiles);
        setModelUrl(result.modelUrl);
      } else if (isLocalFile && selectedModelFile) {
        // Load from local file
        const result = await localFileManager.loadModelFromFiles(
          selectedModelFile,
          selectedTextureFiles
        );
        setModelUrl(result.modelUrl);
      } else {
        // Load from URL
        setModelUrl(inputUrl);
      }
    } catch (err) {
      setError(err as Error);
    }
  }, [isLocalFile, selectedModelFile, selectedTextureFiles, isFolderMode, selectedFolderFiles, inputUrl, localFileManager]);

  // Handle folder selection
  const handleFolderSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setSelectedFolderFiles(files);
      setIsFolderMode(true);
      
      // Clear single file mode state
      setIsLocalFile(false);
      setSelectedModelFile(null);
      setSelectedTextureFiles([]);
      
      // Display info in URL input box
      setInputUrl(`[Local Folder] ${files.length} files selected`);
    }
  }, []);

  // Handle model file selection
  const handleModelFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedModelFile(file);
      setIsLocalFile(true);
      
      // Clear folder mode state
      setIsFolderMode(false);
      setSelectedFolderFiles([]);
      
      // Display file name in URL input box
      setInputUrl(`[Local File] ${file.name}`);
      
      // Check if it's a GLTF file (will need texture files)
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'gltf') {
        // Clear texture files when selecting a new GLTF file
        setSelectedTextureFiles([]);
      }
    }
  }, []);

  // Handle texture files selection
  const handleTextureFilesSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedTextureFiles(files);
  }, []);

  // Handle model load success
  const handleLoadSuccess = useCallback((result: ModelLoadResult) => {
    setLoadResult(result);
    setError(null);
    
    // Cleanup Object URLs after successful load (they're no longer needed)
    if (isLocalFile || isFolderMode) {
      // Use a small delay to ensure the model is fully loaded
      setTimeout(() => {
        localFileManager.cleanup();
      }, 1000);
    }
  }, [isLocalFile, isFolderMode, localFileManager]);

  // Handle model load error
  const handleLoadError = useCallback((err: Error) => {
    setError(err);
    setLoadResult(null);
    
    // Cleanup Object URLs on error
    if (isLocalFile || isFolderMode) {
      localFileManager.cleanup();
    }
  }, [isLocalFile, isFolderMode, localFileManager]);

  // Handle loading state change
  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  // Apply pivot point
  const handleApplyPivotPoint = useCallback(() => {
    if (usePivotPoint) {
      const x = parseFloat(pivotX) || 0;
      const y = parseFloat(pivotY) || 0;
      const z = parseFloat(pivotZ) || 0;
      setPivotPoint({ x, y, z });
    } else {
      setPivotPoint(undefined);
    }
  }, [usePivotPoint, pivotX, pivotY, pivotZ]);

  // Apply zoom limits
  const handleApplyZoomLimits = useCallback(() => {
    if (useZoomLimits) {
      const min = parseFloat(zoomMin) || 0.1;
      const max = parseFloat(zoomMax) || 100;
      setZoomLimits({ min, max });
    } else {
      setZoomLimits(undefined);
    }
  }, [useZoomLimits, zoomMin, zoomMax]);

  // Update grid config when settings change
  useEffect(() => {
    setGridConfig({
      visible: showGrid,
      showAxes: showAxes,
      plane: gridPlane,
    });
  }, [showGrid, showAxes, gridPlane]);

  // Register CameraMovementPlugin when viewer is ready
  useEffect(() => {
    const viewerCore = viewerRef.current?.getViewerCore();
    if (!viewerCore || !viewerCore.isInitialized) {
      return;
    }

    // Create and register the CameraMovementPlugin
    const plugin = new CameraMovementPlugin();
    viewerCore.plugins.register(plugin);
    cameraMovementPluginRef.current = plugin;

    // Connect to OrbitControls target for FPS-style movement
    const orbitPlugin = viewerCore.plugins.get<IOrbitControlsPlugin>('OrbitControlsPlugin');
    if (orbitPlugin) {
      plugin.setOrbitControlsTarget(orbitPlugin.controls.target);
    }

    // Cleanup: unregister plugin when component unmounts
    return () => {
      if (cameraMovementPluginRef.current) {
        viewerCore.plugins.unregister(cameraMovementPluginRef.current.name);
        cameraMovementPluginRef.current = null;
      }
    };
  }, [modelUrl]); // Re-register when modelUrl changes (viewer re-initializes)

  // Sync enableCameraMovement state with plugin
  useEffect(() => {
    if (cameraMovementPluginRef.current) {
      cameraMovementPluginRef.current.setEnabled(enableCameraMovement);
    }
  }, [enableCameraMovement]);

  // Sync cameraMovementSpeed state with plugin
  useEffect(() => {
    if (cameraMovementPluginRef.current) {
      cameraMovementPluginRef.current.setMoveSpeed(cameraMovementSpeed);
    }
  }, [cameraMovementSpeed]);

  // Cleanup local file manager on component unmount
  useEffect(() => {
    return () => {
      localFileManager.cleanup();
    };
  }, [localFileManager]);

  // Reset to defaults
  const handleReset = useCallback(() => {
    setInputUrl(DEFAULT_MODEL_URL);
    setModelUrl(DEFAULT_MODEL_URL);
    setPivotX('0');
    setPivotY('0');
    setPivotZ('0');
    setUsePivotPoint(false);
    setPivotPoint(undefined);
    setZoomMin('0.1');
    setZoomMax('100');
    setUseZoomLimits(false);
    setZoomLimits(undefined);
    setError(null);
    setLoadResult(null);
    
    // Clear local file state
    setIsLocalFile(false);
    setSelectedModelFile(null);
    setSelectedTextureFiles([]);
    
    // Clear folder mode state
    setIsFolderMode(false);
    setSelectedFolderFiles([]);
    
    localFileManager.cleanup();
  }, [localFileManager]);

  return (
    <div style={styles.container}>
      {/* Inject spinner animation */}
      <style>{spinnerKeyframes}</style>

      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>Three.js Viewer Demo</h1>
        <p style={styles.subtitle}>
          A modular 3D model viewer component for React
        </p>
      </header>

      {/* Main content */}
      <main style={styles.main}>
        {/* Sidebar with controls */}
        <aside style={styles.sidebar}>
          {/* Model URL Section */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Model URL</h2>
            <div style={styles.inputGroup}>
              <label style={styles.label}>GLTF/GLB Model URL</label>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  // Clear local file selection when user types URL
                  if (!e.target.value.startsWith('[Local File]') && !e.target.value.startsWith('[Local Folder]')) {
                    setIsLocalFile(false);
                    setSelectedModelFile(null);
                    setSelectedTextureFiles([]);
                    setIsFolderMode(false);
                    setSelectedFolderFiles([]);
                  }
                }}
                placeholder="Enter model URL..."
                style={styles.input}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <input
                type="file"
                id="folderInput"
                // @ts-expect-error webkitdirectory is not a standard attribute
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleFolderSelect}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => document.getElementById('folderInput')?.click()}
                style={styles.buttonSecondary}
                title="Select a folder containing model and all assets"
              >
                📂 Choose Folder
              </button>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <input
                type="file"
                id="modelFileInput"
                accept=".gltf,.glb"
                onChange={handleModelFileSelect}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => document.getElementById('modelFileInput')?.click()}
                style={styles.buttonSecondary}
                title="Select a local .gltf or .glb file"
              >
                📁 Choose Local File
              </button>
            </div>
            
            {/* Texture files selection (only show for GLTF files) */}
            {isLocalFile && selectedModelFile && selectedModelFile.name.toLowerCase().endsWith('.gltf') && (
              <div style={{ marginBottom: '12px' }}>
                <input
                  type="file"
                  id="textureFilesInput"
                  accept=".png,.jpg,.jpeg"
                  multiple
                  onChange={handleTextureFilesSelect}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => document.getElementById('textureFilesInput')?.click()}
                  style={styles.buttonSecondary}
                  title="Select texture image files (.png, .jpg, .jpeg)"
                >
                  🖼️ Choose Texture Files
                </button>
                {selectedTextureFiles.length > 0 && (
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '8px', 
                    backgroundColor: '#1a1a2e', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#a0a0a0'
                  }}>
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
              onClick={handleLoad}
              disabled={isLoading || !inputUrl}
              style={{
                ...styles.button,
                ...(isLoading || !inputUrl ? styles.buttonDisabled : {}),
              }}
            >
              {isLoading ? 'Loading...' : 'Load Model'}
            </button>
          </section>

          {/* Pivot Point Section */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Pivot Point</h2>
            <div style={styles.inputGroup}>
              <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={usePivotPoint}
                  onChange={(e) => setUsePivotPoint(e.target.checked)}
                />
                Use Custom Pivot Point
              </label>
            </div>
            <div style={{ ...styles.row, opacity: usePivotPoint ? 1 : 0.5 }}>
              <div style={styles.col}>
                <label style={styles.label}>X</label>
                <input
                  type="number"
                  value={pivotX}
                  onChange={(e) => setPivotX(e.target.value)}
                  disabled={!usePivotPoint}
                  style={styles.input}
                  step="0.1"
                />
              </div>
              <div style={styles.col}>
                <label style={styles.label}>Y</label>
                <input
                  type="number"
                  value={pivotY}
                  onChange={(e) => setPivotY(e.target.value)}
                  disabled={!usePivotPoint}
                  style={styles.input}
                  step="0.1"
                />
              </div>
              <div style={styles.col}>
                <label style={styles.label}>Z</label>
                <input
                  type="number"
                  value={pivotZ}
                  onChange={(e) => setPivotZ(e.target.value)}
                  disabled={!usePivotPoint}
                  style={styles.input}
                  step="0.1"
                />
              </div>
            </div>
            <button
              onClick={handleApplyPivotPoint}
              style={{
                ...styles.button,
                marginTop: '12px',
                backgroundColor: '#0f3460',
              }}
            >
              Apply Pivot Point
            </button>
          </section>

          {/* Zoom Limits Section */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Zoom Limits</h2>
            <div style={styles.inputGroup}>
              <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={useZoomLimits}
                  onChange={(e) => setUseZoomLimits(e.target.checked)}
                />
                Use Custom Zoom Limits
              </label>
            </div>
            <div style={{ ...styles.row, opacity: useZoomLimits ? 1 : 0.5 }}>
              <div style={styles.col}>
                <label style={styles.label}>Min Distance</label>
                <input
                  type="number"
                  value={zoomMin}
                  onChange={(e) => setZoomMin(e.target.value)}
                  disabled={!useZoomLimits}
                  style={styles.input}
                  step="0.1"
                  min="0.01"
                />
              </div>
              <div style={styles.col}>
                <label style={styles.label}>Max Distance</label>
                <input
                  type="number"
                  value={zoomMax}
                  onChange={(e) => setZoomMax(e.target.value)}
                  disabled={!useZoomLimits}
                  style={styles.input}
                  step="1"
                  min="0.1"
                />
              </div>
            </div>
            <button
              onClick={handleApplyZoomLimits}
              style={{
                ...styles.button,
                marginTop: '12px',
                backgroundColor: '#0f3460',
              }}
            >
              Apply Zoom Limits
            </button>
          </section>

          {/* Grid & Axes Section */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Grid & Axes</h2>
            <div style={styles.inputGroup}>
              <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                />
                Show Grid
              </label>
            </div>
            <div style={styles.inputGroup}>
              <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={showAxes}
                  onChange={(e) => setShowAxes(e.target.checked)}
                />
                Show Axes (R=X, G=Y, B=Z)
              </label>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Grid Plane</label>
              <select
                value={gridPlane}
                onChange={(e) => setGridPlane(e.target.value as 'XY' | 'XZ' | 'YZ')}
                style={{ ...styles.input, cursor: 'pointer' }}
              >
                <option value="XZ">XZ (Ground)</option>
                <option value="XY">XY (Vertical)</option>
                <option value="YZ">YZ (Side)</option>
              </select>
            </div>
          </section>

          {/* Camera Movement Section */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Camera Movement</h2>
            <div style={styles.inputGroup}>
              <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={enableCameraMovement}
                  onChange={(e) => setEnableCameraMovement(e.target.checked)}
                />
                Enable Camera Movement
              </label>
            </div>
            <div style={{ ...styles.inputGroup, opacity: enableCameraMovement ? 1 : 0.5 }}>
              <label style={styles.label}>
                Movement Speed: {cameraMovementSpeed.toFixed(1)}
              </label>
              <input
                type="range"
                min="1"
                max="300"
                step="1"
                value={cameraMovementSpeed}
                onChange={(e) => setCameraMovementSpeed(parseFloat(e.target.value))}
                disabled={!enableCameraMovement}
                style={{
                  width: '100%',
                  cursor: enableCameraMovement ? 'pointer' : 'not-allowed',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666' }}>
                <span>0.5</span>
                <span>300</span>
              </div>
            </div>
          </section>

          {/* Status Section */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Status</h2>
            <div style={styles.statusContainer}>
              {isLoading && (
                <div style={styles.loadingIndicator}>
                  <div style={styles.spinner} />
                  <span>Loading model...</span>
                </div>
              )}
              {error && (
                <div style={styles.errorMessage}>
                  <strong>Error:</strong> {error.message}
                </div>
              )}
              {!isLoading && !error && loadResult && (
                <div>
                  <div style={styles.successMessage}>✓ Model loaded successfully</div>
                  <div style={styles.modelInfo}>
                    <div>Center: ({loadResult.center.x.toFixed(2)}, {loadResult.center.y.toFixed(2)}, {loadResult.center.z.toFixed(2)})</div>
                  </div>
                </div>
              )}
              {!isLoading && !error && !loadResult && !modelUrl && (
                <div style={{ color: '#a0a0a0', fontSize: '13px' }}>
                  Enter a model URL and click "Load Model" to begin
                </div>
              )}
            </div>
          </section>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            style={{
              ...styles.button,
              backgroundColor: '#333',
            }}
          >
            Reset to Defaults
          </button>

          {/* Instructions */}
          <section style={{ ...styles.section, marginTop: '24px' }}>
            <h2 style={styles.sectionTitle}>Controls</h2>
            <div style={{ fontSize: '12px', color: '#a0a0a0', lineHeight: 1.6 }}>
              <p><strong>Rotate:</strong> Left-click and drag</p>
              <p><strong>Zoom:</strong> Scroll wheel or pinch</p>
              <p><strong>Pan:</strong> Right-click and drag</p>
              <p style={{ marginTop: '12px', borderTop: '1px solid #0f3460', paddingTop: '12px' }}>
                <strong>Keyboard Movement:</strong>
              </p>
              <p><strong>W / S:</strong> Move forward / backward</p>
              <p><strong>A / D:</strong> Move left / right</p>
              <p><strong>Shift:</strong> Move up</p>
              <p><strong>Ctrl:</strong> Move down</p>
            </div>
          </section>
        </aside>

        {/* Viewer Container */}
        <div style={styles.viewerContainer}>
          {modelUrl ? (
            <ThreeViewer
              ref={viewerRef}
              modelUrl={modelUrl}
              {...(pivotPoint && { pivotPoint })}
              {...(zoomLimits && { zoomLimits })}
              grid={gridConfig}
              backgroundColor={0x545454}
              onLoad={handleLoadSuccess}
              onError={handleLoadError}
              onLoadingChange={handleLoadingChange}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <div style={styles.overlay}>
              <div style={styles.overlayText}>No model loaded</div>
              <div style={styles.overlayHint}>
                Enter a GLTF/GLB model URL in the sidebar and click "Load Model"
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
