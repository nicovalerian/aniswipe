import { createSupabaseMiddlewareClient } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createSupabaseMiddlewareClient(req, res);

  const { data: { user } } = await supabase.auth.getUser();

  const protectedRoutes = ['/swipe', '/import-mal'];
  const publicRoutes = ['/login', '/register', '/'];

  // If the user is logged in and trying to access a public-only route, redirect to /swipe

  // If the user is not logged in and trying to access a protected route, redirect to /login
  if (!user && protectedRoutes.includes(req.nextUrl.pathname)) {
    const redirectResponse = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api).*)'], // Apply middleware to all paths except static assets and API routes
};