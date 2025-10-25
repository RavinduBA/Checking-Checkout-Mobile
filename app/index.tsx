import React, { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import BottomTabNavigator from "../components/BottomTabNavigator";
import LoginScreen from "../components/screens/LoginScreen";
import RegistrationScreen from "../components/screens/RegistrationScreen";
import LoadingScreen from "../components/screens/LoadingScreen";
import OnboardingScreen from "../components/screens/OnboardingScreen";
import WelcomeScreen from "../components/screens/WelcomeScreen";
import { AuthProvider } from "../contexts/AuthContext";
import { LocationProvider } from "../contexts/LocationContext";
import { useAuth } from "../hooks/useAuth";
import { useUserProfile } from "../hooks/useUserProfile";
import "./global.css";

// main logic of your app that decides what screen to show based on the auth and profile state.
function AppContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();

  // this local state replaces what used to be inside AuthScreen
  const [showLogin, setShowLogin] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  // Show loading spinner while checking authentication and profile
  if (authLoading || (isAuthenticated && profileLoading)) {
    return <LoadingScreen />;
  }

  // Show welcome screen first (only for unauthenticated users)
  if (!isAuthenticated && showWelcome) {
    return <WelcomeScreen onGetStarted={() => setShowWelcome(false)} />;
  }

  // Show login/registration after welcome screen
  if (!isAuthenticated) {
    return showLogin ? (
      <LoginScreen onSwitchToRegister={() => setShowLogin(false)} />
    ) : (
      <RegistrationScreen onSwitchToLogin={() => setShowLogin(true)} />
    );
  }

  // Show onboarding if authenticated but either no profile or no tenant
  if (
    isAuthenticated &&
    (!profile || !profile.tenant_id || !profile.first_login_completed)
  ) {
    return <OnboardingScreen />;
  }

  // Show main app if authenticated and has tenant
  return (
    <LocationProvider>
      <BottomTabNavigator />
    </LocationProvider>
  );
}

// Main app wrapped with AuthProvider
export default function Index() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
