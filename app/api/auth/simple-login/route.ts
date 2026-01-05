import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { cookies } from "next/headers"

// Simple authentication credentials
const SUPERVISOR_CREDENTIALS = {
  username: "Laura",
  password: "Alohomora",
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Validate credentials
    if (
      username === SUPERVISOR_CREDENTIALS.username &&
      password === SUPERVISOR_CREDENTIALS.password
    ) {
      // Create session cookie
      const cookieStore = await cookies()
      const sessionToken = `supervisor_${Date.now()}_${Math.random().toString(36).substring(7)}`
      
      cookieStore.set("supervisor_session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })

      return NextResponse.json({ 
        success: true, 
        user: { username: "Laura", role: "test_reviewer" } 
      })
    }

    return NextResponse.json(
      { success: false, error: "Invalid username or password" },
      { status: 401 }
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, error: "An error occurred" },
      { status: 500 }
    )
  }
}
