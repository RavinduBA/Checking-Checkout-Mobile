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
import { resetPassword, signIn } from "../../lib/auth";

interface LoginScreenProps {
  onSwitchToRegister: () => void;
}

export default function LoginScreen({ onSwitchToRegister }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return false;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }
    if (!password) {
      Alert.alert("Error", "Please enter your password");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await signIn(email.trim(), password);

      if (result.success) {
        // Navigation will be handled automatically by the auth state change
        console.log("Login successful");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "An unexpected error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Reset Password", "Please enter your email address first");
      return;
    }

    try {
      await resetPassword(email.trim());
    } catch (error) {
      console.error("Password reset error:", error);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center p-6">
        <View className="bg-white rounded-xl p-6 shadow-sm">
          {/* Header */}
          <View className="items-center mb-6">
            <View className="bg-blue-100 p-4 rounded-full mb-4">
              <Ionicons name="log-in" size={32} color="#2563eb" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              Welcome Back
            </Text>
            <Text className="text-gray-600 text-center">
              Sign in to access your hotel management dashboard
            </Text>
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Email Address
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
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
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
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

          {/* Forgot Password */}
          <TouchableOpacity onPress={handleForgotPassword} className="mb-6">
            <Text className="text-blue-600 text-right text-sm">
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className={`bg-blue-600 rounded-lg py-3 mb-4 ${
              loading ? "opacity-50" : ""
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-medium text-center text-lg">
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          {/* Switch to Register */}
          <TouchableOpacity onPress={onSwitchToRegister} className="py-2">
            <Text className="text-blue-600 text-center">
              Don't have an account? Create Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
