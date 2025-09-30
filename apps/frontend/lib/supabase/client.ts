/**
 * Supabase browser client for client-side components
 * Reference: https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { createBrowserClient as createClient } from '@supabase/ssr';

import type { Database } from '@/types/supabase';

/**
 * Create Supabase client for browser/client components
 * Should only be used in Client Components (marked with 'use client')
 */
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check .env file.');
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        if (typeof document === 'undefined') return undefined;
        const cookies = document.cookie.split('; ');
        const cookie = cookies.find((c) => c.startsWith(`${name}=`));
        return cookie?.substring(name.length + 1);
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        if (typeof document === 'undefined') return;
        document.cookie = `${name}=${value}; ${Object.entries(options)
          .map(([k, v]) => `${k}=${v}`)
          .join('; ')}`;
      },
      remove(name: string, options: Record<string, unknown>) {
        if (typeof document === 'undefined') return;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${Object.entries(
          options
        )
          .map(([k, v]) => `${k}=${v}`)
          .join('; ')}`;
      },
    },
  });
}
