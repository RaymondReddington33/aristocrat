import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { getUserRole } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables in middleware")
      return response
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Refresh session if expired - required for Server Components
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("Error getting user in middleware:", authError)
      // Continue without user if there's an auth error
    }

    // Protect routes - require authentication for /admin and / (home)
    const pathname = request.nextUrl.pathname
    const isAdminPath = pathname.startsWith("/admin")
    const isHomePath = pathname === "/"
    const isAuthPath = pathname.startsWith("/auth")
    
    // Allow access to /auth routes without authentication
    if (isAuthPath) {
      return response
    }

    // Protect /admin and / (home) routes
    if (isAdminPath || isHomePath) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        url.searchParams.set("next", pathname)
        return NextResponse.redirect(url)
      }
      
      // Check if user has valid role
      try {
        const role = getUserRole(user.email)
        if (!role) {
          // User doesn't have a valid role, redirect to login with error
          const url = request.nextUrl.clone()
          url.pathname = "/auth/login"
          url.searchParams.set("error", "unauthorized")
          return NextResponse.redirect(url)
        }
      } catch (error) {
        console.error("Error checking user role in middleware:", error)
        // If role check fails, redirect to login
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        url.searchParams.set("error", "unauthorized")
        return NextResponse.redirect(url)
      }
    }

    return response
  } catch (error) {
    console.error("Middleware error:", error)
    // Return a response even if there's an error to prevent 500
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
