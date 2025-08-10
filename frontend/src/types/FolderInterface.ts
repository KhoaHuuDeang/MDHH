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
  description: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  user_id: string;
  created_at: string;
  updated_at: string; 
  classification_level_id?: string;
  tags?: Tag[];
}


export interface CreateFolderDto {
  name: string;
  description: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  classificationLevelId: string;
  tagIds?: string[];
}