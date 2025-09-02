import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * CSR Axios Client - Client-side only
 * Uses useSession() hook and integrates with SWR
 */
class CSRAxiosClient {
  private instance: AxiosInstance;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request/response interceptors
   */
  private setupInterceptors() {
    // Request interceptor - auto-attach auth token
    this.instance.interceptors.request.use(
      async (config) => {
        const session = await getSession();
        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle common errors
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // window.location.href = '/auth';  // ← Commented for debugging
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Helper methods for common HTTP operations
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete(url, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.patch(url, data, config);
  }

  /**
   * SWR-compatible fetcher function
   */
  fetcher = async <T = any>(url: string): Promise<T> => {
    const response = await this.get<T>(url);
    return response.data;
  };

  /**
   * SWR-compatible mutator function for optimistic updates
   */
  mutator = async <T = any>(url: string, data?: any, method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST'): Promise<T> => {
    let response: AxiosResponse<T>;
    
    switch (method) {
      case 'POST':
        response = await this.post<T>(url, data);
        break;
      case 'PUT':
        response = await this.put<T>(url, data);
        break;
      case 'PATCH':
        response = await this.patch<T>(url, data);
        break;
      case 'DELETE':
        response = await this.delete<T>(url);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    
    return response.data;
  };

  /**
   * Get the underlying axios instance for advanced usage
   */
  getInstance(): AxiosInstance {
    return this.instance;
  }
}

// Export singleton instance
export const csrAxiosClient = new CSRAxiosClient(API_BASE_URL);

// Export class for custom instances if needed
export { CSRAxiosClient };