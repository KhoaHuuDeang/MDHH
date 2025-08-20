import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let authToken: string | null = null

export const setAuthToken = (token: string | null) => {
  authToken = token
}

export const getAuthToken = (): string | null => {
  return authToken
}

// Request interceptor - use stored token
apiClient.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // NextAuth will handle redirect to signin
      window.location.href = '/auth'
    }
    return Promise.reject(error)
  }
)

// Auth services
export const authService = {
  register: async (userData: {
    birth: string;
    email: string;
    displayname: string;
    username: string;
    password: string;
  }) => {
    const response = await apiClient.post('/auth/register', userData)
    return response.data
  }
}

// User services
export const userService = {
  getUsers: async () => {
    const response = await apiClient.get('/users')
    return response.data
  },

  getUser: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`)
    return response.data
  },

  updateUser: async (id: string, userData: any) => {
    const response = await apiClient.patch(`/users/${id}`, userData)
    return response.data
  },

  getUserStats: async (id: string) => {
    const response = await apiClient.get(`/users/${id}/stats`)
    return response.data
  },

  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`)
    return response.data
  }
}

export default apiClient