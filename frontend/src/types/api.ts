// Generic API types and utilities

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API endpoint types
export type ApiEndpoint = 
  | '/api/surveys'
  | '/api/surveys/:id'
  | '/api/surveys/:id/responses'
  | '/api/surveys/:id/stats'
  | '/api/convertkit/test-connection'
  | '/api/convertkit/custom-fields'
  | '/api/convertkit/update-subscriber'
  | '/api/auth/login'
  | '/api/auth/logout'
  | '/api/auth/verify';

// HTTP methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Request configuration
export interface ApiRequestConfig {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}