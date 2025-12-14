export interface MimeTypeMapping {
  [key: string]: string;
}

// MIME type to Lucide icon mapping
export const mimeTypeToIcon: MimeTypeMapping = {
  // PDF Documents
  'application/pdf': 'FileText',

  // Word Documents
  'application/msword': 'FileText',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'FileText',

  // Excel Spreadsheets
  'application/vnd.ms-excel': 'FileSpreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'FileSpreadsheet',

  // PowerPoint Presentations
  'application/vnd.ms-powerpoint': 'Presentation',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'Presentation',

  // Archives
  'application/zip': 'FileArchive',
  'application/x-rar-compressed': 'FileArchive',
  'application/x-7z-compressed': 'FileArchive',
  'application/x-tar': 'FileArchive',
  'application/gzip': 'FileArchive',

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
  // PDF Documents
  'pdf': 'FileText',

  // Word Documents
  'doc': 'FileText',
  'docx': 'FileText',

  // Excel Spreadsheets
  'xls': 'FileSpreadsheet',
  'xlsx': 'FileSpreadsheet',

  // PowerPoint Presentations
  'ppt': 'Presentation',
  'pptx': 'Presentation',

  // Archives
  'zip': 'FileArchive',
  'rar': 'FileArchive',
  '7z': 'FileArchive',
  'tar': 'FileArchive',
  'gz': 'FileArchive',

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
  if (normalizedMimeType.startsWith('application/pdf')) return 'FileText';
  if (normalizedMimeType.includes('word') || normalizedMimeType.includes('msword')) return 'FileText';
  if (normalizedMimeType.includes('excel') || normalizedMimeType.includes('spreadsheet')) return 'FileSpreadsheet';
  if (normalizedMimeType.includes('powerpoint') || normalizedMimeType.includes('presentation')) return 'Presentation';
  if (normalizedMimeType.includes('zip') || normalizedMimeType.includes('rar') || normalizedMimeType.includes('compress') || normalizedMimeType.includes('tar') || normalizedMimeType.includes('gzip')) return 'FileArchive';
  
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
    'application/vnd.ms-excel': 'Excel Spreadsheet',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
    'application/vnd.ms-powerpoint': 'PowerPoint Presentation',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint Presentation',
    'application/zip': 'ZIP Archive',
    'application/x-rar-compressed': 'RAR Archive',
    'application/x-7z-compressed': '7Z Archive',
    'application/x-tar': 'TAR Archive',
    'application/gzip': 'GZIP Archive',
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
  if (normalizedMimeType.startsWith('application/pdf')) return 'PDF Document';
  if (normalizedMimeType.includes('word') || normalizedMimeType.includes('msword')) return 'Word Document';
  if (normalizedMimeType.includes('excel') || normalizedMimeType.includes('spreadsheet')) return 'Excel Spreadsheet';
  if (normalizedMimeType.includes('powerpoint') || normalizedMimeType.includes('presentation')) return 'PowerPoint Presentation';
  if (normalizedMimeType.includes('zip') || normalizedMimeType.includes('rar') || normalizedMimeType.includes('compress') || normalizedMimeType.includes('tar') || normalizedMimeType.includes('gzip')) return 'Archive File';

  // Extension fallback
  if (fileName) {
    const extension = getFileExtension(fileName).toUpperCase();
    if (extension) {
      return `${extension} File`;
    }
  }

  return 'File';
}

/**
 * Get the appropriate color class for a file type icon
 * @param mimeType - The MIME type string
 * @param fileName - Optional filename for extension fallback
 * @returns Tailwind CSS color class
 */
export function getFileTypeIconColor(mimeType: string | null | undefined, fileName?: string): string {
  if (!mimeType || mimeType === 'application/octet-stream') {
    if (fileName) {
      const extension = getFileExtension(fileName);
      // Check extension-based colors
      if (extension === 'pdf') return 'text-red-500';
      if (extension === 'doc' || extension === 'docx') return 'text-blue-500';
      if (extension === 'xls' || extension === 'xlsx') return 'text-green-500';
      if (extension === 'ppt' || extension === 'pptx') return 'text-orange-500';
      if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'text-yellow-600';
    }
    return 'text-gray-500';
  }

  const normalizedMimeType = mimeType.toLowerCase().trim();

  // PDF - Red
  if (normalizedMimeType.includes('pdf')) return 'text-red-500';

  // Word - Blue
  if (normalizedMimeType.includes('word') || normalizedMimeType.includes('msword')) return 'text-blue-500';

  // Excel - Green
  if (normalizedMimeType.includes('excel') || normalizedMimeType.includes('spreadsheet')) return 'text-green-500';

  // PowerPoint - Orange
  if (normalizedMimeType.includes('powerpoint') || normalizedMimeType.includes('presentation')) return 'text-orange-500';

  // Archives - Yellow
  if (normalizedMimeType.includes('zip') || normalizedMimeType.includes('rar') || normalizedMimeType.includes('compress') || normalizedMimeType.includes('tar') || normalizedMimeType.includes('gzip')) return 'text-yellow-600';

  // Default - Gray
  return 'text-gray-500';
}