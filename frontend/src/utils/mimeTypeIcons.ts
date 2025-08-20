export interface MimeTypeMapping {
  [key: string]: string;
}

// MIME type to Lucide icon mapping
export const mimeTypeToIcon: MimeTypeMapping = {
  // Documents - Only PDF, DOC, DOCX
  'application/pdf': 'FileText',
  'application/msword': 'FileText',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'FileText',
  
  // Images
  'image/jpeg': 'Image',
  'image/jpg': 'Image',
  'image/png': 'Image',
  'image/gif': 'Image',
  'image/svg+xml': 'Image',
  'image/webp': 'Image',
  'image/bmp': 'Image',
  'image/tiff': 'Image',
  
  // Videos - Only MP4
  'video/mp4': 'Video',
  
  
  // Default fallback
  'application/octet-stream': 'File',
  'unknown': 'File'
};

// File extension to icon mapping (fallback)
export const extensionToIcon: MimeTypeMapping = {
  // Documents - Only PDF, DOC, DOCX
  'pdf': 'FileText',
  'doc': 'FileText', 
  'docx': 'FileText',
  
  // Images
  'jpg': 'Image',
  'jpeg': 'Image',
  'png': 'Image',
  'gif': 'Image',
  'svg': 'Image',
  'webp': 'Image',
  'bmp': 'Image',
  'tiff': 'Image',
  'ico': 'Image',
  
  // Videos - Only MP4
  'mp4': 'Video',
  
};

/**
 * Get the appropriate Lucide icon name for a given MIME type
 * @param mimeType - The MIME type string
 * @param fileName - Optional filename for extension fallback
 * @returns Lucide icon name
 */
export function getMimeTypeIcon(mimeType: string | null | undefined, fileName?: string): string {
  // Handle null/undefined MIME types
  if (!mimeType || mimeType === 'application/octet-stream') {
    if (fileName) {
      const extension = getFileExtension(fileName);
      const iconFromExtension = extensionToIcon[extension];
      if (iconFromExtension) {
        return iconFromExtension;
      }
    }
    return 'File'; // Default icon
  }

  // Normalize MIME type (lowercase, trim)
  const normalizedMimeType = mimeType.toLowerCase().trim();
  
  // Direct MIME type lookup
  const iconName = mimeTypeToIcon[normalizedMimeType];
  if (iconName) {
    return iconName;
  }

  // Category-based fallback - restricted to supported types
  if (normalizedMimeType.startsWith('image/')) return 'Image';
  if (normalizedMimeType === 'video/mp4') return 'Video'; // Only MP4
  if (normalizedMimeType.startsWith('application/pdf') || 
      normalizedMimeType.startsWith('application/msword') ||
      normalizedMimeType.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml')) return 'FileText';
  
  // Extension fallback if filename is provided
  if (fileName) {
    const extension = getFileExtension(fileName);
    const iconFromExtension = extensionToIcon[extension];
    if (iconFromExtension) {
      return iconFromExtension;
    }
  }

  // Ultimate fallback
  return 'File';
}

/**
 * Extract file extension from filename
 * @param fileName - The filename
 * @returns File extension in lowercase
 */
export function getFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === fileName.length - 1) {
    return '';
  }
  return fileName.substring(lastDotIndex + 1).toLowerCase();
}

/**
 * Get a user-friendly file type description
 * @param mimeType - The MIME type string
 * @param fileName - Optional filename for extension fallback
 * @returns Human-readable file type description
 */
export function getFileTypeDescription(mimeType: string | null | undefined, fileName?: string): string {
  if (!mimeType || mimeType === 'application/octet-stream') {
    if (fileName) {
      const extension = getFileExtension(fileName).toUpperCase();
      if (extension) {
        return `${extension} File`;
      }
    }
    return 'File';
  }

  const normalizedMimeType = mimeType.toLowerCase().trim();

  // Common MIME type descriptions - restricted to supported types
  const descriptions: { [key: string]: string } = {
    'application/pdf': 'PDF Document',
    'application/msword': 'Word Document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
    'image/jpeg': 'JPEG Image',
    'image/png': 'PNG Image',
    'image/gif': 'GIF Image',
    'image/svg+xml': 'SVG Image',
    'image/webp': 'WebP Image',
    'image/bmp': 'BMP Image',
    'image/tiff': 'TIFF Image',
    'video/mp4': 'MP4 Video'
  };

  const description = descriptions[normalizedMimeType];
  if (description) {
    return description;
  }

  // Category-based descriptions - restricted to supported types
  if (normalizedMimeType.startsWith('image/')) return 'Image File';
  if (normalizedMimeType === 'video/mp4') return 'Video File';
  if (normalizedMimeType.startsWith('application/pdf') || 
      normalizedMimeType.startsWith('application/msword') ||
      normalizedMimeType.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml')) return 'Document';

  // Extension fallback
  if (fileName) {
    const extension = getFileExtension(fileName).toUpperCase();
    if (extension) {
      return `${extension} File`;
    }
  }

  return 'File';
}