import React from "react";
import BottomTabNavigator from "../components/BottomTabNavigator";
import AuthScreen from "../components/screens/AuthScreen";
import LoadingScreen from "../components/screens/LoadingScreen";
import OnboardingScreen from "../components/screens/OnboardingScreen";
import { AuthProvider } from "../contexts/AuthContext";
import { LocationProvider } from "../contexts/LocationContext";
import { useAuth } from "../hooks/useAuth";
import { useUserProfile } from "../hooks/useUserProfile";
import "./global.css";

// Inner component that uses the auth context
function AppContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, tenantId } = useUserProfile();

  // Debug logging
  React.useEffect(() => {
    console.log("AppContent Debug:", {
      isAuthenticated,
      authLoading,
      profileLoading,
      profile: profile ? { ...profile, tenant_id: profile.tenant_id } : null,
      tenantId,
    });
  }, [isAuthenticated, authLoading, profileLoading, profile, tenantId]);

  // Show loading spinner while checking authentication and profile
  if (authLoading || (isAuthenticated && profileLoading)) {
    return <LoadingScreen />;
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // Show onboarding if authenticated but either no profile or no tenant
  // This handles cases where profile creation failed or user hasn't completed onboarding
  if (
    isAuthenticated &&
    (!profile || !profile.tenant_id || !profile.first_login_completed)
  ) {
    console.log(
      "Showing onboarding - profile:",
      !!profile,
      "tenantId:",
      profile?.tenant_id,
      "firstLoginCompleted:",
      profile?.first_login_completed
    );
    return <OnboardingScreen />;
  }

  // Show main app if authenticated and has tenant
  console.log("Showing main app - has tenant:", profile?.tenant_id);
  return (
    <LocationProvider>
      <BottomTabNavigator />
    </LocationProvider>
  );
}

// Main app wrapped with AuthProvider
export default function Index() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
