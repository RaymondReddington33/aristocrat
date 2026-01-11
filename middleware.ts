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

    // Check for supervisor session (simple auth)
    const supervisorSession = request.cookies.get("supervisor_session")
    const hasSupervisorSession = supervisorSession && supervisorSession.value.startsWith("supervisor_")

    // Refresh session if expired - required for Server Components (for Supabase auth)
    let user = null
    if (supabaseUrl && supabaseAnonKey) {
      const {
        data: { user: supabaseUser },
        error: authError,
      } = await supabase.auth.getUser()

      // Only log non-session-missing errors (session missing is expected when not logged in)
      if (authError && authError.name !== "AuthSessionMissingError") {
        console.error("Error getting user in middleware:", authError)
      } else {
        user = supabaseUser
      }
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
      // Prioritize Supabase user over supervisor session if both exist
      // For Supabase users, check if user has valid role
      if (user && user.email) {
        try {
          // Debug: log the email being checked
          console.log("[Middleware] Checking role for email:", user.email)
          const role = getUserRole(user.email)
          console.log("[Middleware] Detected role:", role, "for path:", pathname)
          
          if (!role) {
            // User doesn't have a valid role, redirect to login with error
            console.log("[Middleware] No valid role found, redirecting to login")
            const url = request.nextUrl.clone()
            url.pathname = "/auth/login"
            url.searchParams.set("error", "unauthorized")
            return NextResponse.redirect(url)
          }
          
          // Block test_reviewer from accessing /admin
          if (isAdminPath && role === "test_reviewer") {
            console.log("[Middleware] test_reviewer blocked from /admin")
            const url = request.nextUrl.clone()
            url.pathname = "/"
            return NextResponse.redirect(url)
          }
          
          // Allow test_owner to access /admin
          if (isAdminPath && role === "test_owner") {
            console.log("[Middleware] test_owner allowed to access /admin")
            return response
          }
          
          // For home page, allow if user has any valid role
          if (!isAdminPath && role) {
            return response
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
      
      // If no Supabase user, check supervisor session
      if (hasSupervisorSession) {
        // Block supervisor (test_reviewer) from accessing /admin
        if (isAdminPath) {
          // Supervisor can only view previews, not edit admin
          const url = request.nextUrl.clone()
          url.pathname = "/"
          return NextResponse.redirect(url)
        }
        
        // If supervisor session for home page, allow access (test_reviewer role)
        if (!isAdminPath) {
          return response
        }
      }
      
      // No authentication found, redirect to login
      if (!user && !hasSupervisorSession) {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        url.searchParams.set("next", pathname)
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
