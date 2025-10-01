import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

interface TopBarProps {
  selectedLocation?: string;
  userName?: string;
  userEmail?: string;
  onLocationChange?: (location: string) => void;
  onSearch?: (query: string) => void;
  onSettingsPress?: () => void;
  onUserManagementPress?: () => void;
  onLogout?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToUsers?: () => void;
  onNavigateToBilling?: () => void;
}

export default function TopBar({
  selectedLocation = "Downtown Hotel",
  userName = "John Doe",
  userEmail = "john.doe@hotel.com",
  onLocationChange,
  onSearch,
  onSettingsPress,
  onUserManagementPress,
  onLogout,
  onNavigateToSettings,
  onNavigateToUsers,
  onNavigateToBilling,
}: TopBarProps) {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const locations = [
    "Downtown Hotel",
    "Beach Resort",
    "Mountain Lodge",
    "City Center",
    "Airport Hotel",
  ];

  const handleLocationSelect = (location: string) => {
    onLocationChange?.(location);
    setShowLocationDropdown(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <View className="bg-white border-b border-gray-200 px-4 py-3">
      <View className="flex-row items-center justify-between">
        {/* Left side with Logo and Location Selector */}
        <View className="flex-row items-center">
          {/* Logo */}
          <View className="w-8 h-8 mr-3">
            <Svg width="32" height="32" viewBox="0 0 100 100">
              <Rect width="100" height="100" fill="#1f2937" rx="12" />
              <Path d="M 75 35 L 25 65 L 40 35 L 25 20 Z" fill="#ffffff" />
              <Path
                d="M 25 35 L 45 45 L 75 20 L 45 55 L 25 65 Z"
                fill="#ffffff"
              />
            </Svg>
          </View>

          {/* Location Selector */}
          <TouchableOpacity
            onPress={() => setShowLocationDropdown(true)}
            className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg"
          >
            <Ionicons name="location" size={16} color="#6b7280" />
            <Text className="ml-2 text-sm font-medium text-gray-700">
              {selectedLocation}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color="#6b7280"
              className="ml-1"
            />
          </TouchableOpacity>
        </View>

        {/* User Menu */}
        <TouchableOpacity
          onPress={() => setShowUserDropdown(true)}
          className="flex-row items-center"
        >
          <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
            <Text className="text-white text-sm font-semibold">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Text>
          </View>
          <Ionicons
            name="chevron-down"
            size={16}
            color="#6b7280"
            className="ml-1"
          />
        </TouchableOpacity>
      </View>

      {/* Location Dropdown Modal */}
      <Modal
        visible={showLocationDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLocationDropdown(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setShowLocationDropdown(false)}
        >
          <View className="bg-white rounded-lg mx-4 py-2 w-64">
            <Text className="text-lg font-semibold text-gray-800 px-4 py-2 border-b border-gray-200">
              Select Location
            </Text>
            {locations.map((location) => (
              <TouchableOpacity
                key={location}
                onPress={() => handleLocationSelect(location)}
                className="px-4 py-3 border-b border-gray-100"
              >
                <Text
                  className={`text-sm ${
                    location === selectedLocation
                      ? "text-blue-600 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {location}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* User Dropdown Modal */}
      <Modal
        visible={showUserDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUserDropdown(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-start items-end pt-16 pr-4"
          activeOpacity={1}
          onPress={() => setShowUserDropdown(false)}
        >
          <View className="bg-white rounded-lg py-2 w-64">
            <View className="px-4 py-3 border-b border-gray-200">
              <Text className="text-sm font-semibold text-gray-800">
                {userName}
              </Text>
              <Text className="text-xs text-gray-600">{userEmail}</Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                setShowUserDropdown(false);
                onNavigateToSettings?.();
                onSettingsPress?.();
              }}
              className="flex-row items-center px-4 py-3 border-b border-gray-100"
            >
              <Ionicons name="settings-outline" size={16} color="#6b7280" />
              <Text className="ml-3 text-sm text-gray-700">Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowUserDropdown(false);
                onNavigateToUsers?.();
                onUserManagementPress?.();
              }}
              className="flex-row items-center px-4 py-3 border-b border-gray-100"
            >
              <Ionicons name="people-outline" size={16} color="#6b7280" />
              <Text className="ml-3 text-sm text-gray-700">
                User Management
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowUserDropdown(false);
                onNavigateToBilling?.();
              }}
              className="flex-row items-center px-4 py-3 border-b border-gray-100"
            >
              <Ionicons name="card-outline" size={16} color="#6b7280" />
              <Text className="ml-3 text-sm text-gray-700">
                Billing & Subscriptions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowUserDropdown(false);
                onLogout?.();
              }}
              className="flex-row items-center px-4 py-3"
            >
              <Ionicons name="log-out-outline" size={16} color="#ef4444" />
              <Text className="ml-3 text-sm text-red-500">Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
