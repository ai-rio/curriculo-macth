/**
 * User profile types for the frontend application
 * Matches the backend UserProfile schema
 */

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserProfileCreate {
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
}

export interface UserStats {
  total_optimizations: number;
  free_optimizations_used: number;
  free_optimizations_limit: number;
  subscription_status: 'free' | 'premium' | 'lifetime' | 'monthly';
  last_optimization?: string;
}

export interface EnhancedUserProfile extends UserProfile {
  stats: UserStats;
}
