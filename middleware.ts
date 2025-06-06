import { createServerClient } from '@supabase/ssr'
import { NextResponse, NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Parameters<typeof res.cookies.set>[2]) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: Parameters<typeof res.cookies.set>[2]) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  await supabase.auth.getSession()

  const protectedRoutes = ['/swipe', '/import-mal']; // Add more protected routes here

  if (!req.nextUrl.pathname.startsWith('/login') && !req.nextUrl.pathname.startsWith('/auth/callback')) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session && protectedRoutes.includes(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return res
}

export const config = {
  matcher: ['/', '/login', '/swipe', '/import-mal'], // Apply middleware to these paths
};