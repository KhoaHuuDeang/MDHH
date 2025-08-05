export interface ClassificationLevel {
  id: string;
  name: string;
  description: string;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
  level_id: string;
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  user_id: string;
  created_at: string;
  classification_level_id?: string;
  tags?: Tag[];
}

export interface ResourceMetadata {
  title: string;
  description: string;
  category: string;
  visibility: 'public' | 'private';
}

export interface CreateFolderDto {
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  classificationLevelId: string;
  tagIds?: string[];
}