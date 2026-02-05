/**
 * LocalFileManager
 * 
 * Manages local file loading for 3D models (GLTF/GLB formats).
 * Handles Object URL creation, texture path resolution, and resource cleanup.
 * 
 * Requirements: 7.1, 7.2, 7.3
 */

/**
 * GLTF Image definition (subset of GLTF specification)
 */
interface GLTFImage {
  uri?: string;
  mimeType?: string;
  bufferView?: number;
}

/**
 * GLTF JSON structure (subset of GLTF specification)
 */
interface GLTFJson {
  images?: GLTFImage[];
  [key: string]: unknown;
}

/**
 * Result of loading a model from local files
 */
export interface LoadResult {
  /**
   * Object URL for the model, can be passed directly to ThreeViewer
   */
  modelUrl: string;

  /**
   * Cleanup function to release all created Object URLs
   */
  cleanup: () => void;
}

/**
 * LocalFileManager class
 * 
 * Manages the lifecycle of local file loading including:
 * - Creating Object URLs for files
 * - Tracking created URLs for cleanup
 * - Resolving texture paths in GLTF files
 * - Cleaning up resources to prevent memory leaks
 */
export class LocalFileManager {
  /**
   * Array to track all created Object URLs for cleanup
   * Requirements: 7.1
   */
  private objectUrls: string[] = [];

  /**
   * Clean up all created Object URLs
   * 
   * This method should be called:
   * - When loading a new model (before creating new URLs)
   * - When model loading completes or fails
   * - When the component unmounts
   * 
   * Requirements: 7.2, 7.3
   */
  cleanup(): void {
    for (const url of this.objectUrls) {
      URL.revokeObjectURL(url);
    }
    this.objectUrls = [];
  }

  /**
   * Extract file extension from filename
   * 
   * @param fileName - The filename to extract extension from
   * @returns The file extension in lowercase (without the dot)
   * 
   * Requirements: 7.3
   */
  private getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    const extension = parts[parts.length - 1];
    return extension ? extension.toLowerCase() : '';
  }

  /**
   * Extract filename from a file path
   * 
   * Handles both Windows backslashes and Unix forward slashes.
   * 
   * @param path - The file path (can contain / or \)
   * @returns The filename (last part of the path)
   * 
   * Requirements: 4.1
   */
  private extractFileName(path: string): string {
    // Handle both Windows and Unix path separators
    const parts = path.split(/[/\\]/);
    const fileName = parts[parts.length - 1];
    return fileName || '';
  }

  /**
   * Resolve texture paths in GLTF JSON
   * 
   * Iterates through the GLTF images array and replaces texture file paths
   * with their corresponding Object URLs from the textureUrlMap.
   * 
   * @param gltfJson - The parsed GLTF JSON object
   * @param textureUrlMap - Map of texture filenames to their Object URLs
   * 
   * Requirements: 3.4, 4.1, 4.2, 4.3
   */
  private resolveTexturePaths(
    gltfJson: GLTFJson,
    textureUrlMap: Map<string, string>
  ): void {
    // GLTF specification: images array contains all texture references
    if (gltfJson.images && Array.isArray(gltfJson.images)) {
      for (const image of gltfJson.images) {
        // Only process images with URI (not embedded in buffers)
        if (image.uri) {
          // Extract filename from the URI (handles relative paths)
          const fileName = this.extractFileName(image.uri);
          
          // Look up the Object URL for this filename
          const objectUrl = textureUrlMap.get(fileName);
          
          if (objectUrl) {
            // Replace with Object URL if found
            image.uri = objectUrl;
          }
          // If not found, keep the original URI (texture will be missing but model can still load)
          // This satisfies Requirement 4.3: allow model loading even if some textures are missing
        }
      }
    }
  }

  /**
   * Load a model from local files
   * 
   * Main entry point for loading local model files. Handles both GLB and GLTF formats.
   * 
   * @param file - The model file to load (GLTF or GLB)
   * @param textureFiles - Optional array of texture files (only used for GLTF)
   * @returns Promise<LoadResult> - Contains the model URL and cleanup function
   * @throws Error if file format is unsupported or loading fails
   * 
   * Requirements: 1.3, 6.1, 6.2, 6.3, 6.4, 6.5, 7.4
   */
  async loadModelFromFiles(
    file: File,
    textureFiles: File[] = []
  ): Promise<LoadResult> {
    try {
      // Clean up previous resources before loading new model
      // Requirement 7.4: Release previous model's Object URLs before creating new ones
      this.cleanup();

      // Validate file format
      // Requirement 1.3: Accept only .gltf or .glb files
      const fileExtension = this.getFileExtension(file.name);

      if (fileExtension === 'glb') {
        // Load GLB format (self-contained binary file)
        return await this.loadGLB(file);
      } else if (fileExtension === 'gltf') {
        // Load GLTF format (with external texture dependencies)
        return await this.loadGLTF(file, textureFiles);
      } else {
        // Requirement 6.1: Display error for unsupported formats
        throw new Error(
          `Unsupported file format: ${fileExtension}. Please select a .gltf or .glb file.`
        );
      }
    } catch (error) {
      // Requirement 6.5: Clean up Object URLs on error to prevent memory leaks
      this.cleanup();
      // Re-throw the error for the caller to handle
      throw error;
    }
  }

  /**
   * Load a GLB format model file
   * 
   * GLB files are self-contained binary files that include all textures,
   * so they only require a single Object URL.
   * 
   * @param file - The GLB file to load
   * @returns Promise<LoadResult> - Contains the model URL and cleanup function
   * 
   * Requirements: 2.1, 2.2
   */
  private async loadGLB(file: File): Promise<LoadResult> {
    // Create Object URL for the GLB file
    const url = URL.createObjectURL(file);
    
    // Track the URL for cleanup
    this.objectUrls.push(url);

    // Return the LoadResult with the URL and cleanup function
    return {
      modelUrl: url,
      cleanup: () => this.cleanup(),
    };
  }

  /**
   * Load a GLTF format model file with texture dependencies
   * 
   * GLTF files reference external texture files. This method:
   * 1. Reads and parses the GLTF JSON
   * 2. Creates Object URLs for all texture files
   * 3. Maps texture filenames to their Object URLs
   * 4. Modifies the GLTF JSON to use Object URLs instead of file paths
   * 5. Creates a new Blob with the modified GLTF and returns its Object URL
   * 
   * @param file - The GLTF file to load
   * @param textureFiles - Array of texture image files referenced by the GLTF
   * @returns Promise<LoadResult> - Contains the model URL and cleanup function
   * @throws Error if file reading fails or JSON parsing fails
   * 
   * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
   */
  private async loadGLTF(
    file: File,
    textureFiles: File[]
  ): Promise<LoadResult> {
    try {
      // 1. Read GLTF file content
      const gltfText = await file.text();

      // 2. Parse JSON with error handling
      let gltfJson: GLTFJson;
      try {
        gltfJson = JSON.parse(gltfText);
      } catch {
        throw new Error('Invalid GLTF file: Failed to parse JSON');
      }

      // 3. Create Object URLs for each texture file
      const textureUrlMap = new Map<string, string>();
      for (const textureFile of textureFiles) {
        const url = URL.createObjectURL(textureFile);
        this.objectUrls.push(url);
        textureUrlMap.set(textureFile.name, url);
      }

      // 4. Resolve texture paths - map file paths to Object URLs
      this.resolveTexturePaths(gltfJson, textureUrlMap);

      // 5. Create modified GLTF Blob and Object URL
      const modifiedGltfBlob = new Blob(
        [JSON.stringify(gltfJson)],
        { type: 'model/gltf+json' }
      );
      const gltfUrl = URL.createObjectURL(modifiedGltfBlob);
      this.objectUrls.push(gltfUrl);

      // 6. Return LoadResult object
      return {
        modelUrl: gltfUrl,
        cleanup: () => this.cleanup(),
      };
    } catch (error) {
      // Clean up any Object URLs created before the error
      this.cleanup();
      throw error;
    }
  }
}
