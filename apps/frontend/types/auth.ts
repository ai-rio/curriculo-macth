/**
 * Authentication types and interfaces
 */

export interface AuthError {
  message: string;
  code?: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
}

export interface PasswordResetData {
  email: string;
}
