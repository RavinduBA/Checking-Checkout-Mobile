import { useAuth } from "../hooks/useAuth";

export function usePermissions() {
  const { user, session, loading, isAuthenticated } = useAuth();

  // Example permission check
  function hasAnyPermission(permission: string) {
    // TODO: Implement actual permission logic
    // For now, allow all
    return true;
  }

  return { hasAnyPermission };
}
