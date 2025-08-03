export interface Folder {
  id: string;
  name: string;
  visibility: 'public' | 'private';
  created_at: string;
  classificationLevelId: string;
  tags: Tag[];
}

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

export interface CreateFolderDto {
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  classificationLevelId: string;
  tagIds?: string[];
}