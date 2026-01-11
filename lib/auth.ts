export type UserRole = "test_owner" | "test_reviewer" | null

const ROLE_OVERRIDE_KEY = "user_role_override"

export function getUserRole(email: string | undefined | null): UserRole {
  if (!email) return null
  
  // Normalize email: trim whitespace and convert to lowercase
  const normalizedEmail = email.trim().toLowerCase()
  
  // Test Owner: claramuntoriol@gmail.com (correct) and claramutoriol@gmail.com (legacy compatibility)
  if (normalizedEmail === "claramuntoriol@gmail.com" || normalizedEmail === "claramutoriol@gmail.com") {
    return "test_owner"
  }
  
  // Test Reviewer: any email with @aristocrat.com or @productmadness.com
  if (normalizedEmail.endsWith("@aristocrat.com") || normalizedEmail.endsWith("@productmadness.com")) {
    return "test_reviewer"
  }
  
  return null
}

export function getEffectiveRole(email: string | undefined | null): UserRole {
  if (typeof window === "undefined") {
    // Server-side: no override
    return getUserRole(email)
  }
  
  const override = localStorage.getItem(ROLE_OVERRIDE_KEY)
  const actualRole = getUserRole(email)
  
  // Only allow override if user is actually test_owner
  if (actualRole === "test_owner" && override) {
    return override as UserRole
  }
  
  return actualRole
}

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

export function canEdit(userRole: UserRole): boolean {
  return userRole === "test_owner"
}

export function canView(userRole: UserRole): boolean {
  return userRole === "test_owner" || userRole === "test_reviewer"
}

export function getRoleLabel(userRole: UserRole): string {
  switch (userRole) {
    case "test_owner":
      return "Test Owner"
    case "test_reviewer":
      return "Test Reviewer"
    default:
      return "Guest"
  }
}
