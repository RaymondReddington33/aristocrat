/**
 * Simple authentication utilities for supervisor login
 * Username: Laura
 * Password: Alohomora
 */

export interface SimpleAuthUser {
  username: string
  role: "test_reviewer"
}

export function getSupervisorSession(): SimpleAuthUser | null {
  if (typeof window === "undefined") return null
  
  // Check if supervisor session exists
  const session = document.cookie
    .split("; ")
    .find((row) => row.startsWith("supervisor_session="))
  
  if (session) {
    return {
      username: "Laura",
      role: "test_reviewer",
    }
  }
  
  return null
}

export async function loginSupervisor(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/auth/simple-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Failed to connect to server" }
  }
}

export async function logoutSupervisor(): Promise<void> {
  try {
    await fetch("/api/auth/simple-logout", {
      method: "POST",
    })
    // Clear cookie on client side
    document.cookie = "supervisor_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
  } catch (error) {
    console.error("Logout error:", error)
  }
}
