/**
 * Unit tests for LocalFileManager
 * 
 * Tests the core functionality of local file management including:
 * - File name extraction from paths
 * - File extension extraction
 * - Object URL cleanup
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LocalFileManager } from './LocalFileManager';

describe('LocalFileManager', () => {
  let manager: LocalFileManager;

  beforeEach(() => {
    manager = new LocalFileManager();
  });

  afterEach(() => {
    manager.cleanup();
  });

  describe('extractFileName', () => {
    it('should extract filename from Unix-style path', () => {
      // Access private method for testing
      const extractFileName = (manager as any).extractFileName.bind(manager);
      
      expect(extractFileName('path/to/file.txt')).toBe('file.txt');
      expect(extractFileName('folder/image.png')).toBe('image.png');
      expect(extractFileName('a/b/c/model.gltf')).toBe('model.gltf');
    });

    it('should extract filename from Windows-style path', () => {
      const extractFileName = (manager as any).extractFileName.bind(manager);
      
      expect(extractFileName('path\\to\\file.txt')).toBe('file.txt');
      expect(extractFileName('folder\\image.png')).toBe('image.png');
      expect(extractFileName('C:\\Users\\Documents\\model.glb')).toBe('model.glb');
    });

    it('should extract filename from mixed path separators', () => {
      const extractFileName = (manager as any).extractFileName.bind(manager);
      
      expect(extractFileName('path/to\\file.txt')).toBe('file.txt');
      expect(extractFileName('folder\\subfolder/image.png')).toBe('image.png');
    });

    it('should handle filename without path', () => {
      const extractFileName = (manager as any).extractFileName.bind(manager);
      
      expect(extractFileName('file.txt')).toBe('file.txt');
      expect(extractFileName('model.gltf')).toBe('model.gltf');
    });

    it('should handle empty string', () => {
      const extractFileName = (manager as any).extractFileName.bind(manager);
      
      expect(extractFileName('')).toBe('');
    });

    it('should handle path ending with separator', () => {
      const extractFileName = (manager as any).extractFileName.bind(manager);
      
      expect(extractFileName('path/to/')).toBe('');
      expect(extractFileName('path\\to\\')).toBe('');
    });

    it('should handle relative paths', () => {
      const extractFileName = (manager as any).extractFileName.bind(manager);
      
      expect(extractFileName('./file.txt')).toBe('file.txt');
      expect(extractFileName('../file.txt')).toBe('file.txt');
      expect(extractFileName('../../textures/image.png')).toBe('image.png');
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extension in lowercase', () => {
      const getFileExtension = (manager as any).getFileExtension.bind(manager);
      
      expect(getFileExtension('file.txt')).toBe('txt');
      expect(getFileExtension('model.gltf')).toBe('gltf');
      expect(getFileExtension('model.GLB')).toBe('glb');
      expect(getFileExtension('image.PNG')).toBe('png');
    });

    it('should handle files without extension', () => {
      const getFileExtension = (manager as any).getFileExtension.bind(manager);
      
      // When there's no dot, the whole filename is returned as the extension
      expect(getFileExtension('file')).toBe('file');
      expect(getFileExtension('')).toBe('');
    });

    it('should handle multiple dots in filename', () => {
      const getFileExtension = (manager as any).getFileExtension.bind(manager);
      
      expect(getFileExtension('file.backup.txt')).toBe('txt');
      expect(getFileExtension('model.v2.gltf')).toBe('gltf');
    });
  });

  describe('cleanup', () => {
    it('should clear objectUrls array after cleanup', () => {
      // Manually add some URLs to simulate usage
      (manager as any).objectUrls.push('blob:test1');
      (manager as any).objectUrls.push('blob:test2');
      
      expect((manager as any).objectUrls.length).toBe(2);
      
      manager.cleanup();
      
      expect((manager as any).objectUrls.length).toBe(0);
    });
  });

  describe('loadModelFromFiles', () => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    let mockCreateObjectURL: ReturnType<typeof vi.spyOn>;
    let mockRevokeObjectURL: ReturnType<typeof vi.spyOn>;
    let urlCounter = 0;

    // Helper function to create a File with text() method
    const createMockFile = (content: string, filename: string, type: string): File => {
      const file = new File([content], filename, { type });
      // Add text() method to the file object
      (file as any).text = vi.fn().mockResolvedValue(content);
      return file;
    };

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

    describe('GLB file loading', () => {
      it('should load GLB file and create single Object URL', async () => {
        // Create a mock GLB file
        const glbFile = new File(['mock glb content'], 'model.glb', { type: 'model/gltf-binary' });

        const result = await manager.loadModelFromFiles(glbFile);

        // Should create one Object URL for the GLB file
        expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
        expect(mockCreateObjectURL).toHaveBeenCalledWith(glbFile);
        expect(result.modelUrl).toBe('blob:mock-url-1');
        expect(typeof result.cleanup).toBe('function');
      });

      it('should track GLB Object URL for cleanup', async () => {
        const glbFile = new File(['mock glb content'], 'model.GLB', { type: 'model/gltf-binary' });

        await manager.loadModelFromFiles(glbFile);

        // Check that URL is tracked
        expect((manager as any).objectUrls.length).toBe(1);
        expect((manager as any).objectUrls[0]).toBe('blob:mock-url-1');
      });
    });

    describe('GLTF file loading', () => {
      it('should load GLTF file with textures and create multiple Object URLs', async () => {
        // Create a mock GLTF file with texture references
        const gltfContent = JSON.stringify({
          images: [
            { uri: 'textures/diffuse.png' },
            { uri: 'textures/normal.jpg' }
          ]
        });
        const gltfFile = createMockFile(gltfContent, 'model.gltf', 'model/gltf+json');

        // Create mock texture files
        const texture1 = new File(['mock texture 1'], 'diffuse.png', { type: 'image/png' });
        const texture2 = new File(['mock texture 2'], 'normal.jpg', { type: 'image/jpeg' });

        const result = await manager.loadModelFromFiles(gltfFile, [texture1, texture2]);

        // Should create Object URLs for: 2 textures + 1 modified GLTF = 3 total
        expect(mockCreateObjectURL).toHaveBeenCalledTimes(3);
        expect(result.modelUrl).toBe('blob:mock-url-3'); // The modified GLTF blob
        expect(typeof result.cleanup).toBe('function');
      });

      it('should resolve texture paths in GLTF JSON', async () => {
        const gltfContent = JSON.stringify({
          images: [
            { uri: 'textures/diffuse.png' },
            { uri: 'normal.jpg' }
          ]
        });
        const gltfFile = createMockFile(gltfContent, 'model.gltf', 'model/gltf+json');
        
        const texture1 = new File(['mock texture 1'], 'diffuse.png', { type: 'image/png' });
        const texture2 = new File(['mock texture 2'], 'normal.jpg', { type: 'image/jpeg' });

        await manager.loadModelFromFiles(gltfFile, [texture1, texture2]);

        // Verify that the modified GLTF was created with resolved paths
        // The third call to createObjectURL should be for the modified GLTF blob
        const modifiedGltfBlob = mockCreateObjectURL.mock.calls[2][0];
        expect(modifiedGltfBlob).toBeInstanceOf(Blob);
        
        // Read the blob content to verify texture paths were resolved
        const reader = new FileReader();
        const blobText = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsText(modifiedGltfBlob);
        });
        const modifiedGltf = JSON.parse(blobText);
        
        expect(modifiedGltf.images[0].uri).toBe('blob:mock-url-1'); // diffuse.png
        expect(modifiedGltf.images[1].uri).toBe('blob:mock-url-2'); // normal.jpg
      });

      it('should handle GLTF with missing textures gracefully', async () => {
        const gltfContent = JSON.stringify({
          images: [
            { uri: 'textures/diffuse.png' },
            { uri: 'missing.jpg' }
          ]
        });
        const gltfFile = createMockFile(gltfContent, 'model.gltf', 'model/gltf+json');
        
        const texture1 = new File(['mock texture 1'], 'diffuse.png', { type: 'image/png' });

        const result = await manager.loadModelFromFiles(gltfFile, [texture1]);

        // Should still succeed
        expect(result.modelUrl).toBe('blob:mock-url-2');
        
        // Verify that missing texture path is preserved
        const modifiedGltfBlob = mockCreateObjectURL.mock.calls[1][0];
        const reader = new FileReader();
        const blobText = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsText(modifiedGltfBlob);
        });
        const modifiedGltf = JSON.parse(blobText);
        
        expect(modifiedGltf.images[0].uri).toBe('blob:mock-url-1'); // diffuse.png resolved
        expect(modifiedGltf.images[1].uri).toBe('missing.jpg'); // missing.jpg preserved
      });

      it('should handle GLTF without images array', async () => {
        const gltfContent = JSON.stringify({
          meshes: [{ name: 'test' }]
        });
        const gltfFile = createMockFile(gltfContent, 'model.gltf', 'model/gltf+json');

        const result = await manager.loadModelFromFiles(gltfFile, []);

        // Should succeed without errors
        expect(result.modelUrl).toBe('blob:mock-url-1');
      });
    });

    describe('File format validation', () => {
      it('should reject unsupported file formats', async () => {
        const objFile = new File(['mock obj content'], 'model.obj', { type: 'text/plain' });

        await expect(manager.loadModelFromFiles(objFile)).rejects.toThrow(
          'Unsupported file format: obj. Please select a .gltf or .glb file.'
        );
      });

      it('should reject files without extension', async () => {
        const noExtFile = new File(['mock content'], 'model', { type: 'application/octet-stream' });

        await expect(manager.loadModelFromFiles(noExtFile)).rejects.toThrow(
          'Unsupported file format: model. Please select a .gltf or .glb file.'
        );
      });

      it('should handle case-insensitive file extensions', async () => {
        const glbFile = new File(['mock glb content'], 'model.GLB', { type: 'model/gltf-binary' });
        const gltfContent = JSON.stringify({});
        const gltfFile = createMockFile(gltfContent, 'model.GLTF', 'model/gltf+json');

        // Should not throw
        await expect(manager.loadModelFromFiles(glbFile)).resolves.toBeDefined();
        await expect(manager.loadModelFromFiles(gltfFile)).resolves.toBeDefined();
      });
    });

    describe('Error handling and cleanup', () => {
      it('should cleanup previous resources before loading new model', async () => {
        const glbFile1 = new File(['mock glb 1'], 'model1.glb', { type: 'model/gltf-binary' });
        const glbFile2 = new File(['mock glb 2'], 'model2.glb', { type: 'model/gltf-binary' });

        // Load first model
        await manager.loadModelFromFiles(glbFile1);
        expect((manager as any).objectUrls.length).toBe(1);

        // Load second model - should cleanup first
        await manager.loadModelFromFiles(glbFile2);
        
        // Should have revoked the first URL
        expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url-1');
        // Should only have the second URL now
        expect((manager as any).objectUrls.length).toBe(1);
        expect((manager as any).objectUrls[0]).toBe('blob:mock-url-2');
      });

      it('should cleanup on GLTF JSON parse error', async () => {
        const invalidGltfContent = 'invalid json {';
        const invalidGltfFile = createMockFile(invalidGltfContent, 'model.gltf', 'model/gltf+json');

        await expect(manager.loadModelFromFiles(invalidGltfFile)).rejects.toThrow(
          'Invalid GLTF file: Failed to parse JSON'
        );

        // Should have cleaned up
        expect((manager as any).objectUrls.length).toBe(0);
      });

      it('should cleanup on unsupported format error', async () => {
        const objFile = new File(['mock obj content'], 'model.obj', { type: 'text/plain' });

        await expect(manager.loadModelFromFiles(objFile)).rejects.toThrow();

        // Should have cleaned up
        expect((manager as any).objectUrls.length).toBe(0);
      });

      it('should cleanup partial resources on GLTF loading error', async () => {
        // Create a GLTF file that will fail during processing
        const gltfContent = JSON.stringify({
          images: [{ uri: 'texture.png' }]
        });
        const gltfFile = createMockFile(gltfContent, 'model.gltf', 'model/gltf+json');
        const texture = new File(['mock texture'], 'texture.png', { type: 'image/png' });

        // Override the text() mock to throw an error
        (gltfFile as any).text = vi.fn().mockRejectedValue(new Error('File read error'));

        await expect(manager.loadModelFromFiles(gltfFile, [texture])).rejects.toThrow('File read error');

        // Should have cleaned up any created URLs
        expect((manager as any).objectUrls.length).toBe(0);
      });
    });

    describe('LoadResult interface', () => {
      it('should return LoadResult with modelUrl and cleanup function', async () => {
        const glbFile = new File(['mock glb content'], 'model.glb', { type: 'model/gltf-binary' });

        const result = await manager.loadModelFromFiles(glbFile);

        expect(result).toHaveProperty('modelUrl');
        expect(result).toHaveProperty('cleanup');
        expect(typeof result.modelUrl).toBe('string');
        expect(typeof result.cleanup).toBe('function');
      });

      it('should cleanup function should revoke all URLs', async () => {
        const glbFile = new File(['mock glb content'], 'model.glb', { type: 'model/gltf-binary' });

        const result = await manager.loadModelFromFiles(glbFile);
        
        // Call the cleanup function from the result
        result.cleanup();

        // Should have revoked the URL
        expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url-1');
        expect((manager as any).objectUrls.length).toBe(0);
      });
    });
  });
});
