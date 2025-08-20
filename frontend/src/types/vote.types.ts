// Vote system types for frontend
export type VoteType = 'up' | 'down';

export interface VoteData {
  upvotes: number;
  downvotes: number;
  userVote: VoteType | null;
}

export interface VoteResult {
  success: boolean;
  voteData: VoteData;
  message?: string;
}

// API request/response types
export interface VoteRequest {
  voteType: VoteType;
}

export interface BulkVoteData {
  votes: Record<string, VoteData>;
}

// Extended file data with votes
export interface FileDataWithVotes {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  createdAt: string;
  fileType: string;
  downloadCount: number;
  voteData: VoteData;
  folderName?: string; // Will be added later
}