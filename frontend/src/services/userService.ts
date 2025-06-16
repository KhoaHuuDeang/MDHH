import axios from 'axios'
import { getSession } from 'next-auth/react'

const API_URL = process.env.NEXT_PUBLIC_API_URL 

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - auto attach token
apiClient.interceptors.request.use(
  async (config) => {
    const session = await getSession()
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`
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
      window.location.href = '/api/auth/signin'
    }
    return Promise.reject(error)
  }
)

// Auth services
export const authService = {
  register: async (userData: {
    email: string
    username: string
    name: string
    password: string
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
  
  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`)
    return response.data
  }
}

export default apiClient