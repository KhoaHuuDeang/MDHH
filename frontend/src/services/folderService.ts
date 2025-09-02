import { ClassificationLevel, Folder, Tag, CreateFolderDto } from '@/types/FolderInterface';
import { getSession } from 'next-auth/react';

// interface ApiResponse<T> {
//     data: T;
//     message?: string;
// }

class FolderService {
    private baseUrl = process.env.NEXT_PUBLIC_API_URL;
    private maxRetries = 3;

    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {

        const url = `${this.baseUrl}${endpoint}`;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const response = await fetch(url, {
                    ...options,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${await this.getToken()}`,
                        ...options.headers,
                    },
                    ...options,
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.error(`Attempt ${attempt} failed for ${endpoint}:`, error);

                if (attempt === this.maxRetries) {
                    throw new Error(`Failed after ${this.maxRetries} attempts: ${error}`);
                }

                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }

        throw new Error('Unexpected error in makeRequest');
    }

    // Classification Levels API
    async getClassificationLevels(): Promise<ClassificationLevel[]> {
        return this.makeRequest<ClassificationLevel[]>('/classification-levels');
    }

    // Tags API with level filtering
    async getTagsByLevel(levelId: string,options? : {signal : AbortSignal}): Promise<Tag[]> {
        if (!levelId) {
            throw new Error('Level ID is required');
        }
        return this.makeRequest<Tag[]>(`/tags/by-level/${levelId}`,{signal: options?.signal, });
    }

    async getAllTags(): Promise<Tag[]> {
        return this.makeRequest<Tag[]>('/tags');
    }

    // Folders CRUD API matching backend controller
    async getUserFolders(options? : {signal?: AbortSignal}): Promise<Folder[]> {
        return this.makeRequest<Folder[]>('/folders', {signal: options?.signal});
    }

    async createFolder(data: CreateFolderDto): Promise<Folder> {
        return this.makeRequest<Folder>('/folders', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getFolderById(folderId: string): Promise<Folder> {
        if (!folderId) {
            throw new Error('Folder ID is required');
        }
        return this.makeRequest<Folder>(`/folders/${folderId}`);
    }

    async updateFolder(folderId: string, data: Partial<CreateFolderDto>): Promise<Folder> {
        if (!folderId) {
            throw new Error('Folder ID is required');
        }
        return this.makeRequest<Folder>(`/folders/${folderId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    //Validation helper
    validateFolderData(data: Partial<CreateFolderDto>): string[] {
        const errors: string[] = [];

        if (!data.name?.trim()) {
            errors.push('Folder name is required');
        }

        if (!data.classificationLevelId) {
            errors.push('Classification level is required');
        }

        if (!data.description?.trim()) {
            errors.push('Folder description is required');
        }

        return errors;
    }
    private async getToken(): Promise<string> {
            const session = await getSession();
            return session?.accessToken || '';
    }
}

export const folderService = new FolderService();