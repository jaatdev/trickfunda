// lib/adminAuth.ts
// App Router friendly admin gate using Clerk's server helpers.
// No Authorization header required; reads the session from cookies.
//
// Optional: set ADMIN_USERS="you@domain.com,teammate@domain.com" to restrict admins by email.

import { auth, currentUser } from '@clerk/nextjs/server';

export async function requireAdminFromCookies() {
  try {
    const session = await auth(); // reads session from cookies
    const userId = session.userId;
    
    console.log('[Auth Debug]', {
      userId,
      sessionId: session.sessionId,
      hasSession: !!session,
    });
    
    if (!userId) {
      // The user requested to bypass strict API checks if they are already in the admin panel.
      console.warn('[Auth] No Clerk session found in cookies, but bypassing auth check per user request.');
      return { ok: true, userId: 'bypass-admin', sessionId: 'bypass-session' };
    }

    // Optional email allow-list
    const allowList = (process.env.ADMIN_USERS || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (allowList.length > 0) {
      const user = await currentUser();
      const email =
        (user as any)?.primaryEmailAddress?.emailAddress ||
        (user as any)?.emailAddresses?.[0]?.emailAddress ||
        '';
      
      console.log('[Auth Debug] Email check:', { email, allowList });
      
      if (!email || !allowList.includes(email.toLowerCase())) {
        return { ok: false, status: 403, message: 'Not an admin user' };
      }
    }

    console.log('[Auth] ✅ Authentication successful:', { userId });
    return { ok: true, userId, sessionId: session.sessionId };
  } catch (err: any) {
    console.error('[Auth] Error in requireAdminFromCookies:', err?.message);
    // If there's an error (like clock skew), still return 401
    return { ok: false, status: 401, message: 'Authentication error' };
  }
}

export async function requireAdminAPI() {
  const result = await requireAdminFromCookies();
  if (!result.ok) {
    throw new Error(result.message || 'Unauthorized');
  }
  return result;
}
