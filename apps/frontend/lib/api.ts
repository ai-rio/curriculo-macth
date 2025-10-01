/**
 * Centralized API client for making requests to the backend
 * Handles authentication, error handling, and type safety
 */

import { createBrowserClient } from '@/lib/supabase/client';

// Simple error interface instead of @repo/shared-types
interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * API Client class for making HTTP requests
 */
class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  /**
   * Get authorization header with Supabase JWT
   */
  private async getAuthHeader(): Promise<Record<string, string>> {
    const supabase = createBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      return {
        Authorization: `Bearer ${session.access_token}`,
      };
    }

    return {};
  }

  /**
   * Handle API errors and convert to ApiError
   */
  private async handleError(response: Response): Promise<never> {
    let errorData: ApiError;

    try {
      errorData = await response.json();
    } catch {
      // If response is not JSON, create a generic error
      errorData = {
        message: 'Erro desconhecido do servidor',
        status: response.status,
      };
    }

    // Ensure error has message
    if (!errorData.message) {
      errorData.message = 'Erro desconhecido do servidor';
    }

    throw errorData;
  }

  /**
   * Make a GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    const authHeader = await this.getAuthHeader();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
      },
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Make a POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const authHeader = await this.getAuthHeader();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Make a PUT request
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const authHeader = await this.getAuthHeader();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    const authHeader = await this.getAuthHeader();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
      },
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  /**
   * Upload a file with multipart/form-data
   */
  async uploadFile<T>(endpoint: string, file: File): Promise<T> {
    const authHeader = await this.getAuthHeader();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...authHeader,
        // Don't set Content-Type for multipart/form-data
        // Browser will set it automatically with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json();
  }
}

/**
 * Singleton instance of the API client
 */
export const api = new ApiClient();
