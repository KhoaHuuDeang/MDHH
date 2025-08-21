export interface Tag {
  id: string;
  name: string;
  description: string;
  level_id: string;
}

export interface ClassificationLevel {
  id: string;
  name: string; // "Confidential", "Internal", "Public"
  description: string;
  tags: Tag[];
}

export interface TagsByLevel {
  id: string;
  name: string;
  description: string;
  level_id: string;
}