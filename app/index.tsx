import React from "react";
import BottomTabNavigator from "../components/BottomTabNavigator";
import AuthScreen from "../components/screens/AuthScreen";
import LoadingScreen from "../components/screens/LoadingScreen";
import { AuthProvider } from "../contexts/AuthContext";
import { useAuth } from "../hooks/useAuth";
import "./global.css";

// Inner component that uses the auth context
function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // Show main app if authenticated
  return <BottomTabNavigator />;
}

// Main app wrapped with AuthProvider
export default function Index() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
