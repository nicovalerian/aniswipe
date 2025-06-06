import { createSupabaseMiddlewareClient } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createSupabaseMiddlewareClient(req, res);

  const {
    data: { user },
  } = await supabase.auth.getUser() // Ensure session is refreshed and user data is available

  const protectedRoutes = ['/swipe', '/import-mal']; // Add more protected routes here

  // If the current path is one of the protected routes AND there is no user (meaning no active session), redirect to login
  if (protectedRoutes.includes(req.nextUrl.pathname) && !user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api).*)'], // Apply middleware to all paths except static assets and API routes
};