/**
 * ImageService - Handles image uploads to Pinata IPFS
 */

export interface ImageUploadResult {
  cid: string;
  filenames: string[];
}

export interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export class ImageService {
  private static readonly PINATA_API_URL = 'https://api.pinata.cloud';
  private static readonly PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

  /**
   * Upload multiple images as a directory to Pinata
   * @param files - Array of File objects
   * @param issueId - Optional issue ID for directory naming
   * @returns Promise with CID and filenames
   */
  static async uploadImages(files: File[], issueId?: string): Promise<ImageUploadResult> {
    try {
      const apiKey = import.meta.env.VITE_PINATA_API_KEY;
      const secretKey = import.meta.env.VITE_PINATA_SECRET_API_KEY;

      if (!apiKey || !secretKey) {
        throw new Error('Pinata API keys not configured');
      }

      const formData = new FormData();
      const filenames: string[] = [];

      // Add each file to FormData with numbered filenames
      files.forEach((file, index) => {
        const extension = file.name.split('.').pop() || 'jpg';
        const filename = `${index}.${extension}`;
        formData.append('file', file, filename);
        filenames.push(filename);
      });

      // Add metadata
      const metadata = {
        name: issueId ? `civic-issue-${issueId}-images` : `civic-issue-images-${Date.now()}`,
        keyvalues: {
          type: 'civic-issue-images',
          uploadedAt: new Date().toISOString(),
          ...(issueId && { issueId })
        }
      };

      formData.append('pinataMetadata', JSON.stringify(metadata));

      // Pin options
      const options = {
        cidVersion: 1,
        wrapWithDirectory: true
      };
      formData.append('pinataOptions', JSON.stringify(options));

      // Upload to Pinata
      const response = await fetch(`${this.PINATA_API_URL}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          'pinata_api_key': apiKey,
          'pinata_secret_api_key': secretKey,
          // Note: Don't set Content-Type for FormData - let browser set it
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Pinata upload error:', errorText);
        throw new Error(`Failed to upload images: ${response.status} ${response.statusText}`);
      }

      const result: PinataResponse = await response.json();

      return {
        cid: result.IpfsHash,
        filenames
      };

    } catch (error) {
      console.error('Error uploading images to Pinata:', error);
      throw error;
    }
  }

  /**
   * Upload method using JWT authentication for multiple files
   * Uses individual uploads and creates a directory CID
   */
  static async uploadImagesWithJWT(files: File[], issueId?: string): Promise<ImageUploadResult> {
    try {
      const jwt = import.meta.env.VITE_PINATA_JWT;

      if (!jwt) {
        throw new Error('Pinata JWT not configured');
      }

      // Upload each file individually and collect CIDs
      const uploadPromises = files.map(async (file, index) => {
        const extension = file.name.split('.').pop() || 'jpg';
        const filename = `${index}.${extension}`;
        
        const formData = new FormData();
        formData.append('file', file, filename);

        // Add metadata for individual file
        const metadata = {
          name: issueId ? `civic-issue-${issueId}-image-${index}` : `civic-issue-image-${index}-${Date.now()}`,
          keyvalues: {
            type: 'civic-issue-image',
            uploadedAt: new Date().toISOString(),
            index: index.toString(),
            filename,
            ...(issueId && { issueId })
          }
        };

        formData.append('pinataMetadata', JSON.stringify(metadata));

        const response = await fetch(`${this.PINATA_API_URL}/pinning/pinFileToIPFS`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwt}`,
          },
          body: formData
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Pinata upload error for file ${index}:`, errorText);
          throw new Error(`Failed to upload image ${index}: ${response.status}`);
        }

        const result: PinataResponse = await response.json();
        return {
          filename,
          cid: result.IpfsHash
        };
      });

      // Wait for all uploads to complete
      const uploadResults = await Promise.all(uploadPromises);

      // Create a directory manifest
      const directoryManifest = {
        images: uploadResults.reduce((acc, result) => {
          acc[result.filename] = result.cid;
          return acc;
        }, {} as Record<string, string>),
        metadata: {
          totalImages: files.length,
          uploadedAt: new Date().toISOString(),
          issueId
        }
      };

      // Upload the manifest as a JSON file to create a directory CID
      const manifestFormData = new FormData();
      const manifestBlob = new Blob([JSON.stringify(directoryManifest, null, 2)], {
        type: 'application/json'
      });
      
      manifestFormData.append('file', manifestBlob, 'manifest.json');

      const manifestMetadata = {
        name: issueId ? `civic-issue-${issueId}-manifest` : `civic-issue-manifest-${Date.now()}`,
        keyvalues: {
          type: 'civic-issue-manifest',
          uploadedAt: new Date().toISOString(),
          ...(issueId && { issueId })
        }
      };

      manifestFormData.append('pinataMetadata', JSON.stringify(manifestMetadata));

      const manifestResponse = await fetch(`${this.PINATA_API_URL}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
        body: manifestFormData
      });

      if (!manifestResponse.ok) {
        console.warn('Failed to upload manifest, using first image CID as fallback');
      }

      // Return the first image's CID as the main CID and individual CIDs as filenames
      // This allows us to access images directly via their individual CIDs
      return {
        cid: uploadResults[0].cid, // Use first image CID as primary
        filenames: uploadResults.map(result => result.cid) // Store individual CIDs as "filenames"
      };

    } catch (error) {
      console.error('Error uploading images to Pinata:', error);
      throw error;
    }
  }

  /**
   * Get image URL from IPFS
   * @param cid - Main CID (not used in new approach)
   * @param filename - Individual image CID or filename
   * @returns Full IPFS URL
   */
  static getImageUrl(cid: string, filename: string): string {
    // If filename looks like a CID (starts with Q or b), use it directly
    if (filename.startsWith('Q') || filename.startsWith('b')) {
      return `${this.PINATA_GATEWAY}/${filename}`;
    }
    // Otherwise, use traditional directory/filename approach
    return `${this.PINATA_GATEWAY}/${cid}/${filename}`;
  }

  /**
   * Get all image URLs for an issue
   * @param cid - Directory CID
   * @param filenames - Array of filenames
   * @returns Array of full IPFS URLs
   */
  static getImageUrls(cid: string, filenames: string[]): string[] {
    return filenames.map(filename => this.getImageUrl(cid, filename));
  }

  /**
   * Validate file types (images only)
   * @param files - Array of File objects
   * @returns Boolean indicating if all files are valid images
   */
  static validateImageFiles(files: File[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB per file
    const maxFiles = 10; // Maximum 10 images per issue

    if (files.length === 0) {
      errors.push('No files selected');
      return { isValid: false, errors };
    }

    if (files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} images allowed`);
    }

    files.forEach((file, index) => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`File ${index + 1}: Invalid file type. Only images are allowed.`);
      }

      if (file.size > maxSize) {
        errors.push(`File ${index + 1}: File size too large. Maximum 10MB per image.`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Test Pinata connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      const apiKey = import.meta.env.VITE_PINATA_API_KEY;
      const secretKey = import.meta.env.VITE_PINATA_SECRET_API_KEY;

      if (!apiKey || !secretKey) {
        console.error('Pinata credentials not configured');
        return false;
      }

      const response = await fetch(`${this.PINATA_API_URL}/data/testAuthentication`, {
        method: 'GET',
        headers: {
          'pinata_api_key': apiKey,
          'pinata_secret_api_key': secretKey,
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error testing Pinata connection:', error);
      return false;
    }
  }
}
