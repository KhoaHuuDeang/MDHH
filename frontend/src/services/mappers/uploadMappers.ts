

import { FileMetadata, FileUploadInterface, FolderManagement, VisibilityType } from "@/types/FileUploadInterface";

export interface FolderManagementDto {
  selectedFolderId?: string;
  newFolderData?: {
    name: string;
    description: string;
    folderClassificationId: string;
    folderTagIds?: string[];
  };
}

export interface UploadCreationData {
  originalFilename: string;
  mimetype: string;
  fileSize: number;
  s3Key: string;
  title: string;
  description: string;
  fileVisibility: VisibilityType;
}

export interface ResourceCreationWithUploadDto {
  title: string;
  description: string;
  visibility: VisibilityType;
  folderManagement: FolderManagementDto;
  files: UploadCreationData[];
}

/**
 * Pure mapper: FolderManagement → FolderManagementDto
 */
export function buildFolderManagementDto(
  folderManagement: FolderManagement
): FolderManagementDto {
  return {

    selectedFolderId: folderManagement.selectedFolderId,
    newFolderData: folderManagement.newFolderData ? {
      name: folderManagement.newFolderData.name,
      description: folderManagement.newFolderData.description,
      folderClassificationId: folderManagement.newFolderData.folderClassificationId,
      folderTagIds: folderManagement.newFolderData.folderTagIds,
    } : undefined,
  };
}

/**
 * Pure mapper: Files + FileMetadata → UploadCreationData[]
 */
export function buildUploadCreationData(
  files: FileUploadInterface[],
  fileMetadata: Record<string, FileMetadata>
): UploadCreationData[] {
  return files
    .filter(f => f.status === 'completed')
    .map(file => {
      const meta = fileMetadata[file.id];
      if (!meta) {
        throw new Error(`Missing metadata for file ${file.id}`);
      }

      return {
        originalFilename: file.name,
        mimetype: file.file!.type,
        fileSize: file.size,
        s3Key: file.s3Key!,
        title: meta.title,
        description: meta.description,
        fileVisibility: meta.visibility,
      };
    });
}

/**
 * Derives resource metadata from file metadata collection
 * Uses first file's metadata as resource metadata (file-first strategy)
 */
export function deriveResourceMetadata(
  fileMetadata: Record<string, FileMetadata>,
  files?: FileUploadInterface[]
): { title: string; description: string; visibility: VisibilityType } {
  const metadataEntries = Object.entries(fileMetadata);

  if (metadataEntries.length === 0) {
    throw new Error('Cannot derive resource metadata: no file metadata available');
  }

  // Strategy 1: Single file - use its metadata directly
  if (metadataEntries.length === 1) {
    const [, firstFile] = metadataEntries[0];
    return {
      title: firstFile.title.trim() || "Untitled Resource",
      description: firstFile.description.trim() || "No description provided",
      visibility: firstFile.visibility
    };
  }

  // Strategy 2: Multiple files - intelligent aggregation
  const validMetadata = metadataEntries
    .map(([, meta]) => meta)
    .filter(meta => meta.title?.trim() && meta.description?.trim());

  if (validMetadata.length === 0) {
    // Fallback: Use first available metadata even if incomplete
    const [, firstFile] = metadataEntries[0];
    return {
      title: firstFile.title.trim() || "Multi-file Resource",
      description: firstFile.description.trim() || `Collection of ${metadataEntries.length} files`,
      visibility: firstFile.visibility || 'PUBLIC'
    };
  }

  // Use first complete metadata as primary
  const primaryFile = validMetadata[0];
  const fileCount = metadataEntries.length;

  // Generate collection-aware title and description
  const collectionTitle = primaryFile.title.includes('Collection') || primaryFile.title.includes('Set')
    ? primaryFile.title
    : `${primaryFile.title} - Collection`;

  const collectionDescription = fileCount > 1
    ? `${primaryFile.description} (Collection of ${fileCount} files)`
    : primaryFile.description;

  // Most permissive visibility (if any file is public, resource is public)
  const isAnyPublic = validMetadata.some(meta => meta.visibility === 'PUBLIC');

  return {
    title: collectionTitle,
    description: collectionDescription,
    visibility: isAnyPublic ? VisibilityType.PUBLIC : VisibilityType.PRIVATE
  };
}


/**
 * Composite mapper: Complete payload for createResourceWithUploads
 */
export function buildResourceCreationWithUploadDto(
  folderManagement: FolderManagement, //folder -> folderManagement
  files: FileUploadInterface[],       //uploads -> files
  fileMetadata: Record<string, FileMetadata> //file ->fileMetadata
): ResourceCreationWithUploadDto {
  const resourceMeta = deriveResourceMetadata(fileMetadata);
  return {
    title: resourceMeta.title,
    description: resourceMeta.description,
    visibility: resourceMeta.visibility,
    folderManagement: buildFolderManagementDto(folderManagement),
    files: buildUploadCreationData(files, fileMetadata),
  };
}