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
import { signUp } from "../../lib/auth";

interface RegistrationScreenProps {
  onSwitchToLogin: () => void;
}

export default function RegistrationScreen({
  onSwitchToLogin,
}: RegistrationScreenProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return false;
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await signUp(
        formData.email.trim(),
        formData.password,
        formData.fullName.trim()
      );

      if (result.success) {
        // Success message is now handled in the auth.ts file
        // Auto switch to login after successful registration
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Error", "An unexpected error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center p-6">
        <View className="bg-white rounded-xl p-6 shadow-sm">
          {/* Header */}
          <View className="items-center mb-6">
            <View className="bg-blue-100 p-4 rounded-full mb-4">
              <Ionicons name="person-add" size={32} color="#2563eb" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              Create Account
            </Text>
            <Text className="text-gray-600 text-center">
              Join us to manage your hotel operations
            </Text>
          </View>

          {/* Full Name */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Full Name
            </Text>
            <TextInput
              value={formData.fullName}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, fullName: text }))
              }
              placeholder="Enter your full name"
              autoCapitalize="words"
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
            />
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Email Address
            </Text>
            <TextInput
              value={formData.email}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, email: text }))
              }
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
            />
          </View>

          {/* Phone (Optional) */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Phone Number <Text className="text-gray-400">(Optional)</Text>
            </Text>
            <TextInput
              value={formData.phone}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, phone: text }))
              }
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
            />
          </View>

          {/* Password */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Password
            </Text>
            <View className="relative">
              <TextInput
                value={formData.password}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, password: text }))
                }
                placeholder="Create a strong password"
                secureTextEntry={!showPassword}
                className="border border-gray-300 rounded-lg px-4 py-3 pr-12 text-gray-800"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3"
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </Text>
            <View className="relative">
              <TextInput
                value={formData.confirmPassword}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, confirmPassword: text }))
                }
                placeholder="Confirm your password"
                secureTextEntry={!showConfirmPassword}
                className="border border-gray-300 rounded-lg px-4 py-3 pr-12 text-gray-800"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3"
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            className={`bg-blue-600 rounded-lg py-3 mb-4 ${
              loading ? "opacity-50" : ""
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-medium text-center text-lg">
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Switch to Login */}
          <TouchableOpacity onPress={onSwitchToLogin} className="py-2">
            <Text className="text-blue-600 text-center">
              Already have an account? Sign In
            </Text>
          </TouchableOpacity>

          {/* Terms Notice */}
          <Text className="text-xs text-gray-500 text-center mt-4">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
