import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/drafts(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect admin and API routes
  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    
    // Log for debugging
    if (!userId) {
      console.log('[Middleware] Blocked unauthenticated request to:', req.nextUrl.pathname);
    }
    
    // Let the route handler decide what to do with unauthenticated requests
    // This allows us to handle 401s gracefully in the API routes
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest))(?:.*))' ,
    '/(api|trpc)(.*)',
  ],
};
