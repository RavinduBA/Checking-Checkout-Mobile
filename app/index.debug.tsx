import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import BottomTabNavigator from "../components/BottomTabNavigator";
import AuthScreen from "../components/screens/AuthScreen";
import LoadingScreen from "../components/screens/LoadingScreen";
import OnboardingScreen from "../components/screens/OnboardingScreen";
import { AuthProvider } from "../contexts/AuthContext";
import { useAuth } from "../hooks/useAuth";
import { useUserProfile } from "../hooks/useUserProfile";
import { signOut } from "../lib/auth";
import "./global.css";

// Simple debug component
function DebugInfo({
  user,
  profile,
  isAuthenticated,
  authLoading,
  profileLoading,
}: any) {
  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      Alert.alert("Logged out");
    }
  };

  return (
    <View style={{ padding: 20, backgroundColor: "#f0f0f0", margin: 10 }}>
      <Text style={{ fontWeight: "bold" }}>🔍 Debug Info</Text>
      <Text>Auth Loading: {authLoading ? "Yes" : "No"}</Text>
      <Text>Profile Loading: {profileLoading ? "Yes" : "No"}</Text>
      <Text>Is Authenticated: {isAuthenticated ? "Yes" : "No"}</Text>
      <Text>User ID: {user?.id || "None"}</Text>
      <Text>User Email: {user?.email || "None"}</Text>
      <Text>Profile Exists: {profile ? "Yes" : "No"}</Text>
      <Text>Tenant ID: {profile?.tenant_id || "None"}</Text>
      <Text>
        First Login Done: {profile?.first_login_completed ? "Yes" : "No"}
      </Text>

      {isAuthenticated && (
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            marginTop: 10,
            backgroundColor: "#FF3B30",
            padding: 10,
            borderRadius: 5,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>Log Out</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Inner component that uses the auth context
function AppContent() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();

  // Show debug info and loading state
  if (authLoading || (isAuthenticated && profileLoading)) {
    return (
      <View>
        <DebugInfo
          user={user}
          profile={profile}
          isAuthenticated={isAuthenticated}
          authLoading={authLoading}
          profileLoading={profileLoading}
        />
        <LoadingScreen />
      </View>
    );
  }

  // Show debug info for all states
  const debugInfo = (
    <DebugInfo
      user={user}
      profile={profile}
      isAuthenticated={isAuthenticated}
      authLoading={authLoading}
      profileLoading={profileLoading}
    />
  );

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    return (
      <View>
        {debugInfo}
        <AuthScreen />
      </View>
    );
  }

  // Show onboarding if authenticated but no tenant or first login not completed
  if (
    isAuthenticated &&
    (!profile || !profile.tenant_id || !profile.first_login_completed)
  ) {
    return (
      <View>
        {debugInfo}
        <OnboardingScreen />
      </View>
    );
  }

  // Show main app
  return (
    <View>
      {debugInfo}
      <BottomTabNavigator />
    </View>
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
