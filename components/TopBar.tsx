import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Rect } from "react-native-svg";
import { useLocationContext } from "../contexts/LocationContext";
import { useUserProfile } from "../hooks/useUserProfile";

interface TopBarProps {
  onSearch?: (query: string) => void;
  onSettingsPress?: () => void;
  onUserManagementPress?: () => void;
  onLogout?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToUsers?: () => void;
  onNavigateToBilling?: () => void;
  onNavigateToMasterFiles?: () => void;
}

export default function TopBar({
  onSearch,
  onSettingsPress,
  onUserManagementPress,
  onLogout,
  onNavigateToSettings,
  onNavigateToUsers,
  onNavigateToBilling,
  onNavigateToMasterFiles,
}: TopBarProps) {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { profile } = useUserProfile();
  const {
    selectedLocation,
    setSelectedLocation,
    locations,
    loading: locationsLoading,
    getSelectedLocationData,
  } = useLocationContext();

  // Get the selected location data
  const selectedLocationData = getSelectedLocationData();
  const selectedLocationName = selectedLocationData?.name || "No Locations";

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(locationId);
    setShowLocationDropdown(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-white border-b border-gray-200 px-3 py-2"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center justify-between">
        {/* Left side with Logo, App Name and Location Selector */}
        <View className="flex-row items-center flex-1 mr-2">
          {/* Logo */}
          <View className="w-7 h-7 mr-2">
            <Svg width="28" height="28" viewBox="0 0 100 100">
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
            className="flex-row items-center bg-gray-100 px-2 py-1.5 rounded-lg flex-1"
            style={{ maxWidth: 250 }}
          >
            <Ionicons name="location" size={14} color="#000000" />
            <View className="ml-1.5 flex-1">
              <Text
                className="text-xs font-medium text-black"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {selectedLocationName}
              </Text>
              <Text className="text-[10px] text-gray-600">active location</Text>
            </View>
            <Ionicons
              name="chevron-down"
              size={14}
              color="#000000"
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        </View>

        {/* User Menu */}
        <TouchableOpacity
          onPress={() => setShowUserDropdown(true)}
          className="flex-row items-center"
        >
          <View className="w-7 h-7 bg-black rounded-full items-center justify-center">
            <Text className="text-white text-xs font-semibold">
              {profile?.name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("") || "U"}
            </Text>
          </View>
          <Ionicons
            name="chevron-down"
            size={14}
            color="#000000"
            style={{ marginLeft: 4 }}
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
              Locations
            </Text>
            {locationsLoading ? (
              <View className="px-4 py-3">
                <Text className="text-sm text-gray-500">
                  Loading locations...
                </Text>
              </View>
            ) : locations.length === 0 ? (
              <View className="px-4 py-3">
                <Text className="text-sm text-gray-500">
                  No locations found
                </Text>
              </View>
            ) : (
              locations.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  onPress={() => handleLocationSelect(location.id)}
                  className="px-4 py-3 border-b border-gray-100"
                >
                  <Text
                    className={`text-sm ${
                      location.id === selectedLocation
                        ? "text-blue-600 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {location.name}
                  </Text>
                </TouchableOpacity>
              ))
            )}
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
                {profile?.name || "User"}
              </Text>
              <Text className="text-xs text-gray-600">
                {profile?.email || ""}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                setShowUserDropdown(false);
                onNavigateToSettings?.();
                onSettingsPress?.();
              }}
              className="flex-row items-center px-4 py-3 border-b border-gray-100"
            >
              <Ionicons name="settings-outline" size={16} color="#000000" />
              <Text className="ml-3 text-sm text-black">Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowUserDropdown(false);
                onNavigateToMasterFiles?.();
              }}
              className="flex-row items-center px-4 py-3 border-b border-gray-100"
            >
              <Ionicons name="folder-outline" size={16} color="#000000" />
              <Text className="ml-3 text-sm text-black">Master Files</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowUserDropdown(false);
                onNavigateToUsers?.();
                onUserManagementPress?.();
              }}
              className="flex-row items-center px-4 py-3 border-b border-gray-100"
            >
              <Ionicons name="people-outline" size={16} color="#000000" />
              <Text className="ml-3 text-sm text-black">User Management</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowUserDropdown(false);
                onNavigateToBilling?.();
              }}
              className="flex-row items-center px-4 py-3 border-b border-gray-100"
            >
              <Ionicons name="card-outline" size={16} color="#000000" />
              <Text className="ml-3 text-sm text-black">
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
