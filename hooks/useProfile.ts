import { useUserProfile } from "./useUserProfile";

/**
 * Alias hook for compatibility with web app
 * This hook provides the same interface as the web app's useProfile hook
 */
export function useProfile() {
  return useUserProfile();
}
