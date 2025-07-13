// Authentication types for admin dashboard

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'editor';
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: Date;
}