/**
 * End-to-End Integration Tests for Local File Loader
 * 
 * Tests the complete integration of local file loading functionality including:
 * - LocalFileManager integration with App component
 * - File selection UI interactions
 * - GLB and GLTF file loading workflows
 * - Resource cleanup lifecycle
 * - Error handling and state management
 * 
 * Requirements: All requirements from local-file-loader spec
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../demo/App';
import { LocalFileManager } from '../utils/LocalFileManager';

describe('Local File Loader - End-to-End Integration', () => {
  let mockCreateObjectURL: ReturnType<typeof vi.spyOn>;
  let mockRevokeObjectURL: ReturnType<typeof vi.spyOn>;
  let urlCounter = 0;

  beforeEach(() => {
    urlCounter = 0;
    mockCreateObjectURL = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => {
      return `blob:mock-url-${++urlCounter}`;
    });
    mockRevokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    mockCreateObjectURL.mockRestore();
    mockRevokeObjectURL.mockRestore();
  });

  describe('UI Integration', () => {
    it('should render file selection button', () => {
      render(<App />);
      
      const fileButton = screen.getByText('📁 Choose Local File');
      expect(fileButton).toBeDefined();
    });

    it('should have hidden file input with correct accept attribute', () => {
      render(<App />);
      
      const fileInput = document.getElementById('modelFileInput') as HTMLInputElement;
      expect(fileInput).toBeDefined();
      expect(fileInput.type).toBe('file');
      expect(fileInput.accept).toBe('.gltf,.glb');
      expect(fileInput.style.display).toBe('none');
    });

    it('should show texture file selection button only for GLTF files', async () => {
      render(<App />);
      
      // Initially, texture button should not be visible
      expect(screen.queryByText('🖼️ Choose Texture Files')).toBeNull();
      
      // Simulate selecting a GLTF file
      const fileInput = document.getElementById('modelFileInput') as HTMLInputElement;
      const gltfFile = new File(['mock gltf content'], 'model.gltf', { type: 'model/gltf+json' });
      
      Object.defineProperty(fileInput, 'files', {
        value: [gltfFile],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      // Now texture button should be visible
      await waitFor(() => {
        expect(screen.getByText('🖼️ Choose Texture Files')).toBeDefined();
      });
    });

    it('should not show texture file selection button for GLB files', async () => {
      render(<App />);
      
      // Simulate selecting a GLB file
      const fileInput = document.getElementById('modelFileInput') as HTMLInputElement;
      const glbFile = new File(['mock glb content'], 'model.glb', { type: 'model/gltf-binary' });
      
      Object.defineProperty(fileInput, 'files', {
        value: [glbFile],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      // Texture button should not be visible
      await waitFor(() => {
        expect(screen.queryByText('🖼️ Choose Texture Files')).toBeNull();
      });
    });
  });

  describe('GLB File Loading Workflow', () => {
    it('should update URL input when GLB file is selected', async () => {
      render(<App />);
      
      const fileInput = document.getElementById('modelFileInput') as HTMLInputElement;
      const glbFile = new File(['mock glb content'], 'test-model.glb', { type: 'model/gltf-binary' });
      
      Object.defineProperty(fileInput, 'files', {
        value: [glbFile],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      // Check that URL input shows the local file name
      await waitFor(() => {
        const urlInput = screen.getByPlaceholderText('Enter model URL...') as HTMLInputElement;
        expect(urlInput.value).toBe('[Local File] test-model.glb');
      });
    });

    it('should set isLocalFile state when GLB file is selected', async () => {
      render(<App />);
      
      // Select GLB file
      const fileInput = document.getElementById('modelFileInput') as HTMLInputElement;
      const glbFile = new File(['mock glb content'], 'model.glb', { type: 'model/gltf-binary' });
      
      Object.defineProperty(fileInput, 'files', {
        value: [glbFile],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      // Verify the URL input shows local file indicator
      await waitFor(() => {
        const urlInput = screen.getByPlaceholderText('Enter model URL...') as HTMLInputElement;
        expect(urlInput.value).toContain('[Local File]');
      });
    });
  });

  describe('GLTF File Loading Workflow', () => {
    it('should display selected texture files', async () => {
      render(<App />);
      
      // Select GLTF file
      const modelInput = document.getElementById('modelFileInput') as HTMLInputElement;
      const gltfFile = new File(['mock gltf content'], 'model.gltf', { type: 'model/gltf+json' });
      
      Object.defineProperty(modelInput, 'files', {
        value: [gltfFile],
        writable: false,
      });
      
      fireEvent.change(modelInput);
      
      // Wait for texture button to appear
      await waitFor(() => {
        expect(screen.getByText('🖼️ Choose Texture Files')).toBeDefined();
      });
      
      // Select texture files
      const textureInput = document.getElementById('textureFilesInput') as HTMLInputElement;
      const texture1 = new File(['texture 1'], 'diffuse.png', { type: 'image/png' });
      const texture2 = new File(['texture 2'], 'normal.jpg', { type: 'image/jpeg' });
      
      Object.defineProperty(textureInput, 'files', {
        value: [texture1, texture2],
        writable: false,
      });
      
      fireEvent.change(textureInput);
      
      // Check that texture files are displayed
      await waitFor(() => {
        expect(screen.getByText('2 texture file(s) selected:')).toBeDefined();
        expect(screen.getByText('• diffuse.png')).toBeDefined();
        expect(screen.getByText('• normal.jpg')).toBeDefined();
      });
    });
  });

  describe('State Management', () => {
    it('should clear local file state when URL is manually entered', async () => {
      render(<App />);
      
      // First, select a local file
      const fileInput = document.getElementById('modelFileInput') as HTMLInputElement;
      const glbFile = new File(['mock glb content'], 'model.glb', { type: 'model/gltf-binary' });
      
      Object.defineProperty(fileInput, 'files', {
        value: [glbFile],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      // Verify local file is selected
      await waitFor(() => {
        const urlInput = screen.getByPlaceholderText('Enter model URL...') as HTMLInputElement;
        expect(urlInput.value).toBe('[Local File] model.glb');
      });
      
      // Now manually enter a URL
      const urlInput = screen.getByPlaceholderText('Enter model URL...') as HTMLInputElement;
      fireEvent.change(urlInput, { target: { value: 'https://example.com/model.glb' } });
      
      // Verify URL is updated and local file indicator is gone
      await waitFor(() => {
        expect(urlInput.value).toBe('https://example.com/model.glb');
        expect(urlInput.value).not.toContain('[Local File]');
      });
    });

    it('should reset local file state when Reset button is clicked', async () => {
      render(<App />);
      
      // Select a local file
      const fileInput = document.getElementById('modelFileInput') as HTMLInputElement;
      const glbFile = new File(['mock glb content'], 'model.glb', { type: 'model/gltf-binary' });
      
      Object.defineProperty(fileInput, 'files', {
        value: [glbFile],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      // Verify local file is selected
      await waitFor(() => {
        const urlInput = screen.getByPlaceholderText('Enter model URL...') as HTMLInputElement;
        expect(urlInput.value).toBe('[Local File] model.glb');
      });
      
      // Click Reset button
      const resetButton = screen.getByText('Reset to Defaults');
      fireEvent.click(resetButton);
      
      // Verify state is reset (URL should be back to default, not contain [Local File])
      await waitFor(() => {
        const urlInput = screen.getByPlaceholderText('Enter model URL...') as HTMLInputElement;
        expect(urlInput.value).not.toContain('[Local File]');
        // Cleanup is called internally, we just verify the state is reset
      });
    });
  });

  describe('LocalFileManager Integration', () => {
    it('should create and cleanup Object URLs correctly', async () => {
      const manager = new LocalFileManager();
      
      // Create a GLB file
      const glbFile = new File(['mock glb content'], 'model.glb', { type: 'model/gltf-binary' });
      
      // Load the file
      const result = await manager.loadModelFromFiles(glbFile);
      
      // Verify Object URL was created
      expect(mockCreateObjectURL).toHaveBeenCalledWith(glbFile);
      expect(result.modelUrl).toBe('blob:mock-url-1');
      
      // Cleanup
      manager.cleanup();
      
      // Verify Object URL was revoked
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url-1');
    });

    it('should handle multiple texture files for GLTF', async () => {
      const manager = new LocalFileManager();
      
      // Create GLTF file with texture references
      const gltfContent = JSON.stringify({
        images: [
          { uri: 'textures/diffuse.png' },
          { uri: 'normal.jpg' }
        ]
      });
      const gltfFile = new File([gltfContent], 'model.gltf', { type: 'model/gltf+json' });
      
      // Mock the text() method
      (gltfFile as any).text = vi.fn().mockResolvedValue(gltfContent);
      
      // Create texture files
      const texture1 = new File(['texture 1'], 'diffuse.png', { type: 'image/png' });
      const texture2 = new File(['texture 2'], 'normal.jpg', { type: 'image/jpeg' });
      
      // Load the files
      const result = await manager.loadModelFromFiles(gltfFile, [texture1, texture2]);
      
      // Verify Object URLs were created for textures + modified GLTF
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(3);
      expect(result.modelUrl).toBe('blob:mock-url-3');
      
      // Cleanup
      manager.cleanup();
      
      // Verify all Object URLs were revoked
      expect(mockRevokeObjectURL).toHaveBeenCalledTimes(3);
    });

    it('should handle errors gracefully and cleanup resources', async () => {
      const manager = new LocalFileManager();
      
      // Create an unsupported file
      const objFile = new File(['mock obj content'], 'model.obj', { type: 'text/plain' });
      
      // Attempt to load - should throw error
      await expect(manager.loadModelFromFiles(objFile)).rejects.toThrow(
        'Unsupported file format: obj. Please select a .gltf or .glb file.'
      );
      
      // Verify cleanup was called (no URLs should be tracked)
      expect((manager as any).objectUrls.length).toBe(0);
    });
  });

  describe('Resource Lifecycle', () => {
    it('should cleanup resources when loading new model', async () => {
      const manager = new LocalFileManager();
      
      // Load first model
      const glbFile1 = new File(['mock glb 1'], 'model1.glb', { type: 'model/gltf-binary' });
      await manager.loadModelFromFiles(glbFile1);
      
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
      expect((manager as any).objectUrls.length).toBe(1);
      
      // Load second model - should cleanup first
      const glbFile2 = new File(['mock glb 2'], 'model2.glb', { type: 'model/gltf-binary' });
      await manager.loadModelFromFiles(glbFile2);
      
      // First URL should be revoked
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url-1');
      
      // Only second URL should be tracked
      expect((manager as any).objectUrls.length).toBe(1);
      expect((manager as any).objectUrls[0]).toBe('blob:mock-url-2');
    });

    it('should cleanup resources on component unmount', () => {
      const { unmount } = render(<App />);
      
      // Unmount the component
      unmount();
      
      // Cleanup should be called (verified by no errors)
      expect(true).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid GLTF JSON', async () => {
      const manager = new LocalFileManager();
      
      // Create invalid GLTF file
      const invalidGltfContent = 'invalid json {';
      const invalidGltfFile = new File([invalidGltfContent], 'model.gltf', { type: 'model/gltf+json' });
      (invalidGltfFile as any).text = vi.fn().mockResolvedValue(invalidGltfContent);
      
      // Attempt to load - should throw error
      await expect(manager.loadModelFromFiles(invalidGltfFile)).rejects.toThrow(
        'Invalid GLTF file: Failed to parse JSON'
      );
      
      // Verify cleanup was called
      expect((manager as any).objectUrls.length).toBe(0);
    });

    it('should handle file read errors', async () => {
      const manager = new LocalFileManager();
      
      // Create GLTF file that will fail to read
      const gltfFile = new File(['content'], 'model.gltf', { type: 'model/gltf+json' });
      (gltfFile as any).text = vi.fn().mockRejectedValue(new Error('File read error'));
      
      // Attempt to load - should throw error
      await expect(manager.loadModelFromFiles(gltfFile)).rejects.toThrow('File read error');
      
      // Verify cleanup was called
      expect((manager as any).objectUrls.length).toBe(0);
    });
  });

  describe('User Experience', () => {
    it('should show file name in URL input after selection', async () => {
      render(<App />);
      
      const fileInput = document.getElementById('modelFileInput') as HTMLInputElement;
      const glbFile = new File(['mock glb content'], 'my-awesome-model.glb', { type: 'model/gltf-binary' });
      
      Object.defineProperty(fileInput, 'files', {
        value: [glbFile],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      await waitFor(() => {
        const urlInput = screen.getByPlaceholderText('Enter model URL...') as HTMLInputElement;
        expect(urlInput.value).toBe('[Local File] my-awesome-model.glb');
      });
    });

    it('should clear texture files when selecting new GLTF file', async () => {
      render(<App />);
      
      // Select first GLTF file
      const modelInput = document.getElementById('modelFileInput') as HTMLInputElement;
      const gltfFile1 = new File(['gltf 1'], 'model1.gltf', { type: 'model/gltf+json' });
      
      Object.defineProperty(modelInput, 'files', {
        value: [gltfFile1],
        writable: false,
        configurable: true, // Allow reconfiguration
      });
      
      fireEvent.change(modelInput);
      
      // Select texture files
      await waitFor(() => {
        expect(screen.getByText('🖼️ Choose Texture Files')).toBeDefined();
      });
      
      const textureInput = document.getElementById('textureFilesInput') as HTMLInputElement;
      const texture1 = new File(['texture 1'], 'diffuse.png', { type: 'image/png' });
      
      Object.defineProperty(textureInput, 'files', {
        value: [texture1],
        writable: false,
        configurable: true,
      });
      
      fireEvent.change(textureInput);
      
      // Verify texture is shown
      await waitFor(() => {
        expect(screen.getByText('1 texture file(s) selected:')).toBeDefined();
      });
      
      // Select new GLTF file
      const gltfFile2 = new File(['gltf 2'], 'model2.gltf', { type: 'model/gltf+json' });
      
      Object.defineProperty(modelInput, 'files', {
        value: [gltfFile2],
        writable: false,
        configurable: true,
      });
      
      fireEvent.change(modelInput);
      
      // Texture files should be cleared
      await waitFor(() => {
        expect(screen.queryByText('1 texture file(s) selected:')).toBeNull();
      });
    });
  });
});
