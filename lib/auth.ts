/**
 * Authentication & Authorization System
 * 
 * ROLES:
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 1. TEST OWNER (Admin)
 *    - Email: claramuntoriol@gmail.com
 *    - Permissions: Full access - can edit all fields, manage apps, access /admin
 *    - Routes: /admin, /preview, / (home)
 * 
 * 2. TEST REVIEWER (Viewer)
 *    - Emails: *@aristocrat.com, *@productmadness.com
 *    - Permissions: View only - can view previews, cannot edit
 *    - Routes: /preview, / (home) - NO ACCESS to /admin
 * 
 * 3. GUEST (No access)
 *    - Any other email
 *    - Permissions: None
 *    - Routes: Only /auth/login
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type UserRole = "test_owner" | "test_reviewer" | null

const ROLE_OVERRIDE_KEY = "user_role_override"

/**
 * Determine user role based on email address
 */
export function getUserRole(email: string | undefined | null): UserRole {
  if (!email) return null
  
  // Normalize email: trim whitespace and convert to lowercase
  const normalizedEmail = email.trim().toLowerCase()
  
  // TEST OWNER: Full admin access
  // - claramuntoriol@gmail.com (primary)
  // - claramutoriol@gmail.com (legacy compatibility)
  if (normalizedEmail === "claramuntoriol@gmail.com" || normalizedEmail === "claramutoriol@gmail.com") {
    return "test_owner"
  }
  
  // TEST REVIEWER: View-only access
  // - Any email ending with @aristocrat.com
  // - Any email ending with @productmadness.com
  if (normalizedEmail.endsWith("@aristocrat.com") || normalizedEmail.endsWith("@productmadness.com")) {
    return "test_reviewer"
  }
  
  // GUEST: No access
  return null
}

/**
 * Get effective role (considers role override for testing)
 * Only test_owner can override their role (to test as reviewer)
 */
export function getEffectiveRole(email: string | undefined | null): UserRole {
  if (typeof window === "undefined") {
    // Server-side: no override possible
    return getUserRole(email)
  }
  
  const override = localStorage.getItem(ROLE_OVERRIDE_KEY)
  const actualRole = getUserRole(email)
  
  // Only allow override if user is actually test_owner
  // This allows the owner to test the reviewer experience
  if (actualRole === "test_owner" && override) {
    return override as UserRole
  }
  
  return actualRole
}

/**
 * Set role override (only works for test_owner)
 */
export function setRoleOverride(role: UserRole | null) {
  if (typeof window === "undefined") return
  
  if (role) {
    localStorage.setItem(ROLE_OVERRIDE_KEY, role)
  } else {
    localStorage.removeItem(ROLE_OVERRIDE_KEY)
  }
  
  // Trigger storage event so other tabs/components can react
  window.dispatchEvent(new Event("storage"))
}

/**
 * Check if user can edit (only test_owner)
 */
export function canEdit(userRole: UserRole): boolean {
  return userRole === "test_owner"
}

/**
 * Check if user can view (test_owner or test_reviewer)
 */
export function canView(userRole: UserRole): boolean {
  return userRole === "test_owner" || userRole === "test_reviewer"
}

/**
 * Get human-readable role label
 */
export function getRoleLabel(userRole: UserRole): string {
  switch (userRole) {
    case "test_owner":
      return "Admin (Full Access)"
    case "test_reviewer":
      return "Reviewer (View Only)"
    default:
      return "Guest"
  }
}

/**
 * Get role description for UI
 */
export function getRoleDescription(userRole: UserRole): string {
  switch (userRole) {
    case "test_owner":
      return "You can edit all fields and manage apps"
    case "test_reviewer":
      return "You can view and analyse the exercise"
    default:
      return "No access"
  }
}
