import { csrAxiosClient } from '@/utils/axiosClient';

export interface Souvenir {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSouvenirDto {
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
}

export interface UpdateSouvenirDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  image_url?: string;
  is_active?: boolean;
}

export const shopService = {
  // Get all souvenirs (optional filter by active status)
  async getAllSouvenirs(active?: boolean) {
    const response = await csrAxiosClient.get<{
      message: string;
      status: string;
      result: { souvenirs: Souvenir[]; count: number };
    }>('/shop/souvenirs', {
      params: active !== undefined ? { active: active.toString() } : undefined,
    });
    return response.data;
  },

  // Get souvenir by ID
  async getSouvenirById(id: string) {
    const response = await csrAxiosClient.get<{
      message: string;
      status: string;
      result: { souvenir: Souvenir };
    }>(`/shop/souvenirs/${id}`);
    return response.data;
  },

  // Create souvenir (ADMIN only)
  async createSouvenir(dto: CreateSouvenirDto) {
    const response = await csrAxiosClient.post<{
      message: string;
      status: string;
      result: { souvenir: Souvenir };
    }>('/shop/souvenirs', dto);
    return response.data;
  },

  // Update souvenir (ADMIN only)
  async updateSouvenir(id: string, dto: UpdateSouvenirDto) {
    const response = await csrAxiosClient.put<{
      message: string;
      status: string;
      result: { souvenir: Souvenir };
    }>(`/shop/souvenirs/${id}`, dto);
    return response.data;
  },

  // Delete souvenir (ADMIN only)
  async deleteSouvenir(id: string) {
    const response = await csrAxiosClient.delete<{
      message: string;
      status: string;
      result: null;
    }>(`/shop/souvenirs/${id}`);
    return response.data;
  },

  // Upload souvenir image to S3
  async uploadSouvenirImage(file: File) {
    // Step 1: Get presigned URL
    const presignedResponse = await csrAxiosClient.post('/uploads/souvenir-image', {
      filename: file.name,
      mimetype: file.type,
      fileSize: file.size,
    });

    const { uploadUrl, publicUrl } = presignedResponse.data.result;

    // Step 2: Upload to S3
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    // Step 3: Return public URL
    return publicUrl;
  }
};
