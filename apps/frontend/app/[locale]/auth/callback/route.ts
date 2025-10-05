/**
 * Auth callback handler for Supabase authentication
 * Handles email confirmations, OAuth callbacks, and password resets
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successful authentication, redirect to the intended destination
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    }

    console.error('Auth callback error:', error);

    // If there's an error, redirect to login with error message
    const errorParams = new URLSearchParams({
      error: 'auth_failed',
      message: error.message || 'Authentication failed',
    });
    return NextResponse.redirect(`${requestUrl.origin}/login?${errorParams.toString()}`);
  }

  // No code provided, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login?error=no_code`);
}
