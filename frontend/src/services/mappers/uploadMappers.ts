// ❌ BLOCKER: Completely missing as required by Stage 2 section 5.3
// Target: frontend/src/services/mappers/uploadMappers.ts

import { FileMetadata, FileUploadInterface, FolderManagement, ResourceCreationMetadata } from "@/types/FileUploadInterface";

export interface FolderManagementDto {
  selectedFolderId?: string;
  newFolderData?: {
    name: string;
    description?: string;
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
  category: string;
  fileVisibility: string;
}

export interface ResourceCreationWithUploadDto {
  title: string;
  description: string;
  visibility: string;
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
        category: meta.category,
        fileVisibility: meta.visibility,
      };
    });
}

/**
 * Composite mapper: Complete payload for createResourceWithUploads
 */
export function buildResourceCreationWithUploadDto(
  metadata: ResourceCreationMetadata,
  folderManagement: FolderManagement,
  files: FileUploadInterface[],
  fileMetadata: Record<string, FileMetadata>
): ResourceCreationWithUploadDto {
  return {
    title: metadata.title,
    description: metadata.description,
    visibility: metadata.visibility,
    folderManagement: buildFolderManagementDto(folderManagement),
    files: buildUploadCreationData(files, fileMetadata),
  };
}