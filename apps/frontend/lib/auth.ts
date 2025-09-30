'use client';

/**
 * Authentication utilities for sign up, login, and logout
 */

import { createBrowserClient } from '@/lib/supabase/client';

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, fullName?: string) {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = createBrowserClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  const supabase = createBrowserClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) {
    throw error;
  }
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string) {
  const supabase = createBrowserClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw error;
  }
}
