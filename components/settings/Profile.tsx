import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useUserProfile } from "../../hooks/useUserProfile";
import { supabase } from "../../lib/supabase";

export default function Profile() {
  const { user } = useAuth();
  const { profile, loading } = useUserProfile();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    email: profile?.email || user?.email || "",
    phone: profile?.phone || "",
    tenant_role: profile?.tenant_role || "",
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || user?.email || "",
        phone: profile.phone || "",
        tenant_role: profile.tenant_role || "",
      });
    }
  }, [profile, user]);

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!user?.id) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          phone: formData.phone,
        })
        .eq("id", user.id);

      if (error) throw error;

      Alert.alert("Success", "Profile updated successfully");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="mt-3 text-base text-gray-600">Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Profile Header */}
        <View className="bg-white rounded-xl p-6 mb-4 shadow-sm">
          <View className="items-center mb-6">
            <View className="w-20 h-20 bg-blue-100 rounded-full justify-center items-center mb-3">
              <Ionicons name="person" size={32} color="#007AFF" />
            </View>
            <Text className="text-xl font-bold text-gray-900">
              {formData.name || "User Profile"}
            </Text>
            <Text className="text-sm text-gray-600 capitalize">
              {formData.tenant_role?.replace("_", " ") || "User"}
            </Text>
          </View>
        </View>

        {/* Profile Form */}
        <View className="bg-white rounded-xl p-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Personal Information
          </Text>

          {/* Name Field */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Full Name
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900"
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          {/* Email Field (Read-only) */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Email Address
            </Text>
            <TextInput
              className="border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-500 bg-gray-50"
              placeholder="Email address"
              value={formData.email}
              editable={false}
            />
            <Text className="text-xs text-gray-500 mt-1">
              Email cannot be changed here
            </Text>
          </View>

          {/* Phone Field */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          {/* Role Field (Read-only) */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Role</Text>
            <TextInput
              className="border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-500 bg-gray-50 capitalize"
              value={formData.tenant_role?.replace("_", " ") || "User"}
              editable={false}
            />
            <Text className="text-xs text-gray-500 mt-1">
              Role is managed by administrators
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            className={`py-3 px-6 rounded-lg flex-row justify-center items-center ${
              saving ? "bg-gray-400" : "bg-blue-500"
            }`}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="save" size={20} color="white" />
            )}
            <Text className="text-white font-semibold ml-2">
              {saving ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Account Info */}
        <View className="bg-white rounded-xl p-6 mt-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Account Information
          </Text>

          <View className="space-y-3">
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-sm text-gray-600">User ID</Text>
              <Text className="text-sm text-gray-900 font-mono">
                {user?.id?.slice(0, 8)}...
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-2">
              <Text className="text-sm text-gray-600">Account Created</Text>
              <Text className="text-sm text-gray-900">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "Unknown"}
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-2">
              <Text className="text-sm text-gray-600">Last Sign In</Text>
              <Text className="text-sm text-gray-900">
                {user?.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleDateString()
                  : "Unknown"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
