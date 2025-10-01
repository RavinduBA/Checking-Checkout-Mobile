import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

interface TopBarProps {
  selectedLocation?: string;
  userName?: string;
  userEmail?: string;
  onLocationChange?: (location: string) => void;
  onSearch?: (query: string) => void;
  onSettingsPress?: () => void;
  onUserManagementPress?: () => void;
  onLogout?: () => void;
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
}: TopBarProps) {
  const navigation = useNavigation();
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

        {/* Search Bar */}
        <View className="flex-1 mx-4">
          <View className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg">
            <Ionicons name="search" size={16} color="#6b7280" />
            <TextInput
              placeholder="Search..."
              value={searchQuery}
              onChangeText={handleSearch}
              className="flex-1 ml-2 text-sm text-gray-700"
              placeholderTextColor="#9ca3af"
            />
          </View>
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
