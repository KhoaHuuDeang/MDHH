import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * SSR Fetch Client - Server-side only
 * Uses getServerSession() for token management
 */
class SSRFetchClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }
  /**
   * Get auth token from server session
   */
  private async getAuthToken(): Promise<string | null> {
    const session = await getServerSession(authOptions);
    return session?.accessToken || null;
  }

  /**
   * Main fetch method with authentication
   */
  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getAuthToken();
    
    const headers: HeadersInit = {
      ...this.defaultHeaders,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    return response;
  }

  /**
   * Helper methods for common HTTP operations
   */
  async get(url: string, options: RequestInit = {}) {
    return this.fetch(url, { ...options, method: 'GET' });
  }

  async post(url: string, data?: any, options: RequestInit = {}) {
    return this.fetch(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(url: string, data?: any, options: RequestInit = {}) {
    return this.fetch(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(url: string, options: RequestInit = {}) {
    return this.fetch(url, { ...options, method: 'DELETE' });
  }

  /**
   * Helper method to handle JSON responses with error handling
   */
  async fetchJSON<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await this.fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const ssrFetchClient = new SSRFetchClient(API_BASE_URL);

// Export class for custom instances if needed
export { SSRFetchClient };