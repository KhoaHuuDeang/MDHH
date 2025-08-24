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
  }
}

export default csrAxiosClient