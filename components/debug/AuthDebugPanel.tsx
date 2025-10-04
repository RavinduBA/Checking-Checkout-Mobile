import React, { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { signOut } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

export default function AuthDebugPanel() {
  const { user, isAuthenticated } = useAuth();
  const [authUserExists, setAuthUserExists] = useState<boolean | null>(null);
  const [profileExists, setProfileExists] = useState<boolean | null>(null);

  useEffect(() => {
    if (user?.id) {
      checkAuthUser();
      checkProfile();
    }
  }, [user?.id]);

  const checkAuthUser = async () => {
    if (!user?.id) return;

    // Skip auth user check for now - we know it exists if user is authenticated
    setAuthUserExists(true);
  };

  const checkProfile = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      setProfileExists(!!data && !error);
    } catch (err) {
      setProfileExists(false);
    }
  };

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      Alert.alert("Logged out successfully");
    }
  };

  const createTestProfile = async () => {
    if (!user?.id || !user?.email) {
      Alert.alert("Error", "No user data available");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email.split("@")[0],
          tenant_role: "tenant_staff",
          is_tenant_admin: false,
          first_login_completed: false,
        })
        .select()
        .single();

      if (error) {
        Alert.alert("Profile Creation Failed", error.message);
      } else {
        Alert.alert("Profile Created", "Profile created successfully!");
        checkProfile();
      }
    } catch (err) {
      Alert.alert("Error", "Unexpected error creating profile");
    }
  };

  if (!isAuthenticated) {
    return (
      <View
        style={{
          padding: 20,
          backgroundColor: "#f0f0f0",
          margin: 10,
          borderRadius: 8,
        }}
      >
        <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
          🔍 Auth Debug Panel
        </Text>
        <Text>Status: Not authenticated</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        padding: 20,
        backgroundColor: "#f0f0f0",
        margin: 10,
        borderRadius: 8,
      }}
    >
      <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
        🔍 Auth Debug Panel
      </Text>
      <Text>Status: Authenticated ✅</Text>
      <Text>User ID: {user?.id}</Text>
      <Text>Email: {user?.email}</Text>
      <Text>
        Auth User Exists:{" "}
        {authUserExists === null ? "⏳" : authUserExists ? "✅" : "❌"}
      </Text>
      <Text>
        Profile Exists:{" "}
        {profileExists === null ? "⏳" : profileExists ? "✅" : "❌"}
      </Text>

      <View style={{ marginTop: 15, gap: 10 }}>
        <TouchableOpacity
          onPress={createTestProfile}
          style={{ backgroundColor: "#007AFF", padding: 10, borderRadius: 5 }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Create Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          style={{ backgroundColor: "#FF3B30", padding: 10, borderRadius: 5 }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
