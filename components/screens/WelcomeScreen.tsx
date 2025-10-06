import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <View className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Background decorative elements */}
      <View className="absolute top-20 left-8">
        <View className="w-16 h-16 bg-blue-100 rounded-full opacity-60" />
      </View>
      <View className="absolute top-32 right-12">
        <View className="w-8 h-8 bg-purple-100 rounded-lg opacity-50" />
      </View>
      <View className="absolute top-48 left-16">
        <View className="w-4 h-4 bg-green-100 rounded-full opacity-40" />
      </View>
      <View className="absolute bottom-64 right-8">
        <View className="w-12 h-12 bg-yellow-100 rounded-full opacity-50" />
      </View>
      <View className="absolute bottom-48 left-6">
        <View className="w-6 h-6 bg-pink-100 rounded-lg opacity-40" />
      </View>

      {/* Main content */}
      <View className="flex-1 justify-center items-center px-8">
        {/* Illustration area */}
        <View className="mb-12 items-center">
          {/* Hotel/Management themed illustration */}
          <View className="relative mb-8">
            {/* Main character/building illustration */}
            <View className="w-48 h-48 bg-white rounded-3xl shadow-lg items-center justify-center">
              {/* Hotel building icon */}
              <Svg width="120" height="120" viewBox="0 0 120 120">
                {/* Building structure */}
                <Rect x="20" y="40" width="80" height="60" rx="4" fill="#3b82f6" />
                <Rect x="25" y="45" width="15" height="15" rx="2" fill="#ffffff" />
                <Rect x="40" y="45" width="15" height="15" rx="2" fill="#ffffff" />
                <Rect x="65" y="45" width="15" height="15" rx="2" fill="#ffffff" />
                <Rect x="80" y="45" width="15" height="15" rx="2" fill="#ffffff" />
                
                <Rect x="25" y="65" width="15" height="15" rx="2" fill="#ffffff" />
                <Rect x="40" y="65" width="15" height="15" rx="2" fill="#ffffff" />
                <Rect x="65" y="65" width="15" height="15" rx="2" fill="#ffffff" />
                <Rect x="80" y="65" width="15" height="15" rx="2" fill="#ffffff" />
                
                <Rect x="25" y="85" width="15" height="15" rx="2" fill="#ffffff" />
                <Rect x="80" y="85" width="15" height="15" rx="2" fill="#ffffff" />
                
                {/* Door */}
                <Rect x="50" y="85" width="20" height="15" rx="2" fill="#1f2937" />
                
                {/* Roof */}
                <Path d="M15 40 L60 20 L105 40 Z" fill="#ef4444" />
                
                {/* Flag */}
                <Rect x="58" y="15" width="4" height="25" fill="#6b7280" />
                <Path d="M62 15 L85 20 L62 25 Z" fill="#10b981" />
              </Svg>
            </View>

            {/* Floating elements around the illustration */}
            <View className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
              <Ionicons name="key" size={16} color="white" />
            </View>
            <View className="absolute -bottom-2 -left-2 w-10 h-10 bg-green-500 rounded-full items-center justify-center">
              <Ionicons name="calendar" size={18} color="white" />
            </View>
            <View className="absolute top-8 -left-6 w-6 h-6 bg-purple-500 rounded-full items-center justify-center">
              <Ionicons name="person" size={12} color="white" />
            </View>
            <View className="absolute bottom-12 -right-6 w-8 h-8 bg-orange-500 rounded-full items-center justify-center">
              <Ionicons name="card" size={16} color="white" />
            </View>
          </View>
        </View>

        {/* Title and description */}
        <View className="items-center mb-12">
          <Text className="text-3xl font-bold text-gray-900 mb-4 text-center">
            CheckingCheckout
          </Text>
          <Text className="text-lg font-semibold text-gray-800 mb-3 text-center">
            Hotel Management System
          </Text>
          <Text className="text-base text-gray-600 text-center leading-6 px-4">
            Streamline your hotel operations with our comprehensive management platform.
            Handle bookings, guests, and finances effortlessly!
          </Text>
        </View>

        {/* Get Started button */}
        <TouchableOpacity
          onPress={onGetStarted}
          className="bg-blue-600 px-12 py-4 rounded-full shadow-lg active:bg-blue-700 flex-row items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-semibold mr-2">
            Get Started
          </Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>

        {/* Feature highlights */}
        <View className="flex-row justify-center mt-8 space-x-8">
          <View className="items-center">
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="bed" size={20} color="#3b82f6" />
            </View>
            <Text className="text-xs text-gray-600">Rooms</Text>
          </View>
          <View className="items-center">
            <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="calendar" size={20} color="#10b981" />
            </View>
            <Text className="text-xs text-gray-600">Bookings</Text>
          </View>
          <View className="items-center">
            <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="people" size={20} color="#8b5cf6" />
            </View>
            <Text className="text-xs text-gray-600">Guests</Text>
          </View>
          <View className="items-center">
            <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="analytics" size={20} color="#f59e0b" />
            </View>
            <Text className="text-xs text-gray-600">Reports</Text>
          </View>
        </View>
      </View>

      {/* Bottom branding */}
      <View className="pb-8 items-center">
        <Text className="text-xs text-gray-500">
          Powered by CheckingCheckout
        </Text>
      </View>
    </View>
  );
}