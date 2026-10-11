import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isSupabaseConfigured =
    Boolean(supabaseUrl) &&
    Boolean(supabaseKey) &&
    !supabaseUrl?.includes('your_supabase') &&
    supabaseUrl?.startsWith('http')

  // Check for demo session cookie
  const isDemoSession = request.cookies.get('demo_session')?.value === 'true'

  // If Supabase is not configured or in active demo mode, allow access
  if (!isSupabaseConfigured || isDemoSession) {
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(
      supabaseUrl!,
      supabaseKey!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              supabaseResponse.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Protected routes
    const isProtectedPath = request.nextUrl.pathname.startsWith('/dashboard')

    if (isProtectedPath && !user) {
      const redirectUrl = new URL('/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  } catch {
    // If Supabase check fails unexpectedly, allow demo fallback
    return supabaseResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
