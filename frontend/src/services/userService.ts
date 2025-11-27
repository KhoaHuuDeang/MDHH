import { csrAxiosClient } from '@/utils/axiosClient'

// Auth services
export const authService = {
  register: async (userData: {
    birth: string;
    email: string;
    displayname: string;
    username: string;
    password: string;
  }) => {
    const response = await csrAxiosClient.post('/auth/register', userData)
    return response.data
  }
}

// User services
export const userService = {
  getUsers: async () => {
    const response = await csrAxiosClient.get('/users')
    return response.data
  },

  getUser: async (id: string) => {
    const response = await csrAxiosClient.get(`/users/${id}`)
    return response.data
  },

  updateUser: async (id: string, userData: any) => {
    const response = await csrAxiosClient.patch(`/users/${id}`, userData)
    return response.data
  },

  getUserStats: async (id: string) => {
    const response = await csrAxiosClient.get(`/users/${id}/stats`)
    return response.data
  },

  deleteUser: async (id: string) => {
    const response = await csrAxiosClient.delete(`/users/${id}`)
    return response.data
  },

  // Profile image upload
  uploadProfileImage: async (file: File, imageType: 'avatar' | 'banner') => {
    // Step 1: Get presigned URL
    const presignedResponse = await csrAxiosClient.post('/uploads/profile-image', {
      filename: file.name,
      mimetype: file.type,
      fileSize: file.size,
      imageType
    })

    const { uploadUrl, publicUrl } = presignedResponse.data.result

    // Step 2: Upload to S3
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    })

    // Step 3: Return public URL
    return publicUrl
  }
}

export default csrAxiosClient