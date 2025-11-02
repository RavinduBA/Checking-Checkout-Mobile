import AccessDenied from "@/components/AccessDenied";
import { usePermissions } from "@/hooks/usePermissions";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

// Import sub-screen components
import CommissionSettingsScreen from "./CommissionSettingsScreen";
import HotelLocationsScreen from "./HotelLocationsScreen";
import RoomsScreen from "./RoomsScreen";
import TourGuidesScreen from "./TourGuidesScreen";
import TravelAgentsScreen from "./TravelAgentsScreen";

type ActiveScreen =
  | "main"
  | "hotelLocations"
  | "rooms"
  | "tourGuides"
  | "travelAgents"
  | "commissionSettings";

interface MasterFilesScreenProps {
  navigation?: any;
}

export default function MasterFilesScreen({
  navigation,
}: MasterFilesScreenProps) {
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>("main");

  // Permission check
  if (permissionsLoading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="mt-2 text-gray-600">Loading...</Text>
      </View>
    );
  }

  if (!hasPermission("access_master_files")) {
    return (
      <AccessDenied message="You don't have permission to access Master Files." />
    );
  }

  const masterFileOptions = [
    {
      title: "Hotel Locations",
      icon: "location" as const,
      color: "#3b82f6",
      onPress: () => setActiveScreen("hotelLocations"),
    },
    {
      title: "Rooms",
      icon: "bed" as const,
      color: "#059669",
      onPress: () => setActiveScreen("rooms"),
    },
    {
      title: "Tour Guides",
      icon: "person" as const,
      color: "#dc2626",
      onPress: () => setActiveScreen("tourGuides"),
    },
    {
      title: "Travel Agents",
      icon: "airplane" as const,
      color: "#7c3aed",
      onPress: () => setActiveScreen("travelAgents"),
    },
    {
      title: "Commission Settings",
      icon: "settings" as const,
      color: "#ea580c",
      onPress: () => setActiveScreen("commissionSettings"),
    },
  ];

  // Render the main Master Files grid
  const renderMainScreen = () => (
    <View className="flex-1 bg-gray-50">
      {/* Back button header */}
      <View className="flex-row items-center p-4 bg-white border-b mt-20 border-gray-200">
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          className="flex-row items-center"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
          <Text className="ml-2 text-lg font-semibold text-gray-700">
            Back to Dashboard
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 p-4">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Master Files
          </Text>
          <Text className="text-gray-600">
            Manage master data and configuration settings
          </Text>
        </View>

        <View className="flex-1">
          <View className="flex-row flex-wrap justify-between">
            {masterFileOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={option.onPress}
                className="w-[48%] bg-white rounded-xl p-6 mb-4 shadow-sm"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 3,
                }}
              >
                <View className="items-center">
                  <View
                    className="w-16 h-16 rounded-full items-center justify-center mb-4"
                    style={{ backgroundColor: `${option.color}20` }}
                  >
                    <Ionicons
                      name={option.icon}
                      size={32}
                      color={option.color}
                    />
                  </View>
                  <Text className="text-base font-semibold text-gray-800 text-center">
                    {option.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  // Render sub-screen with back button
  const renderSubScreen = () => {
    let ScreenComponent;
    let title = "";

    switch (activeScreen) {
      case "hotelLocations":
        ScreenComponent = HotelLocationsScreen;
        title = "Hotel Locations";
        break;
      case "rooms":
        ScreenComponent = RoomsScreen;
        title = "Rooms";
        break;
      case "tourGuides":
        ScreenComponent = TourGuidesScreen;
        title = "Tour Guides";
        break;
      case "travelAgents":
        ScreenComponent = TravelAgentsScreen;
        title = "Travel Agents";
        break;
      case "commissionSettings":
        ScreenComponent = CommissionSettingsScreen;
        title = "Commission Settings";
        break;
      default:
        return renderMainScreen();
    }

    return (
      <View className="flex-1 bg-gray-50">
        {/* Back button header */}
        <View className="flex-row items-center p-4 mt-20 bg-white border-b border-gray-200">
          <TouchableOpacity
            onPress={() => setActiveScreen("main")}
            className="flex-row items-center"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
            <Text className="ml-2 text-lg font-semibold text-gray-700">
              Back to Master Files
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sub-screen content */}
        <View className="flex-1">
          <ScreenComponent />
        </View>
      </View>
    );
  };

  return activeScreen === "main" ? renderMainScreen() : renderSubScreen();
}
