import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { OnboardingFormData } from "../screens/OnboardingScreen";

interface CompleteStepProps {
  formData: OnboardingFormData;
  onComplete: () => void;
  loading: boolean;
}

export default function CompleteStep({
  formData,
  onComplete,
  loading,
}: CompleteStepProps) {
  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
    >
      <View className="items-center mb-2">
        <Ionicons name="checkmark-circle" size={50} color="#00C851" />
      </View>

      <Text className="text-lg font-bold text-center  text-gray-800">
        You're All Set! 🎉
      </Text>
      <Text className="text-base text-center text-gray-600 mb-5 px-4">
        Welcome to Check In_Check Out! Your account has been configured based on
        your preferences.
      </Text>

      <View className="bg-white rounded-2xl p-4 w-full border border-gray-100">
        <Text className="text-lg font-bold mb-4 text-gray-800">
          Setup Summary
        </Text>
        <View className="gap-4">
          <View className="flex-row items-center gap-3">
            <Ionicons name="business" size={20} color="#007AFF" />
            <Text className="text-sm font-medium text-gray-600">Company:</Text>
            <Text className="text-sm text-gray-800 flex-1">
              {formData.companyName}
            </Text>
          </View>

          <View className="flex-row items-center gap-3">
            <Ionicons name="person" size={20} color="#007AFF" />
            <Text className="text-sm font-medium text-gray-600">Contact:</Text>
            <Text className="text-sm text-gray-800 flex-1">
              {formData.contactName}
            </Text>
          </View>

          <View className="flex-row items-center gap-3">
            <Ionicons name="mail" size={20} color="#007AFF" />
            <Text className="text-sm font-medium text-gray-600">Email:</Text>
            <Text className="text-sm text-gray-800 flex-1">
              {formData.email}
            </Text>
          </View>

          {formData.propertyType && (
            <View className="flex-row items-center gap-3">
              <Ionicons name="home" size={20} color="#007AFF" />
              <Text className="text-sm font-medium text-gray-600">
                Property Type:
              </Text>
              <Text className="text-sm text-gray-800 flex-1">
                {formData.propertyType.charAt(0).toUpperCase() +
                  formData.propertyType.slice(1)}
              </Text>
            </View>
          )}

          {formData.propertyCount && (
            <View className="flex-row items-center gap-3">
              <Ionicons name="layers" size={20} color="#007AFF" />
              <Text className="text-sm font-medium text-gray-600">
                Properties:
              </Text>
              <Text className="text-sm text-gray-800 flex-1">
                {formData.propertyCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className="bg-green-50 rounded-2xl p-6 w-full m-6 border border-green-100">
        <Text className="text-lg font-bold mb-4 text-green-800">
          What's Next:
        </Text>
        <View className="gap-3">
          <View className="flex-row items-center gap-3">
            <Ionicons name="checkmark-circle" size={16} color="#00C851" />
            <Text className="text-sm text-green-700">
              Set up your first property
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Ionicons name="checkmark-circle" size={16} color="#00C851" />
            <Text className="text-sm text-green-700">
              Configure room types and pricing
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Ionicons name="checkmark-circle" size={16} color="#00C851" />
            <Text className="text-sm text-green-700">
              Start accepting bookings
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        className={`bg-blue-500 rounded-xl py-4 px-8 flex-row items-center justify-center gap-3 w-full mb-6 ${
          loading ? "opacity-50" : ""
        }`}
        onPress={onComplete}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Text className="text-white text-lg font-semibold">
              Enter Your Dashboard
            </Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </>
        )}
      </TouchableOpacity>

      <View className="bg-blue-50 rounded-xl p-4 w-full">
        <Text className="text-center text-sm text-blue-700 font-medium">
          🎉 You're now on a 7-day free trial with full access to all features!
        </Text>
      </View>
    </ScrollView>
  );
}
