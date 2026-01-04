export type UserRole = "test_owner" | "test_reviewer" | null

export function getUserRole(email: string | undefined | null): UserRole {
  if (!email) return null
  
  // Test Owner: solo claramuntoriol@gmail.com
  if (email.toLowerCase() === "claramuntoriol@gmail.com") {
    return "test_owner"
  }
  
  // Test Reviewer: cualquier email con @aristocrat.com
  if (email.toLowerCase().endsWith("@aristocrat.com")) {
    return "test_reviewer"
  }
  
  return null
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
