import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState("Profile");

  const tabs = [
    "Profile",
    "Locations", 
    "Form Fields",
    "Expense Categories",
    "Income Types",
    "Currency Settings",
    "Booking Management"
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Profile":
        return (
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg text-gray-600">Profile Settings</Text>
          </View>
        );
      case "Locations":
        return (
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg text-gray-600">Location Settings</Text>
          </View>
        );
      case "Form Fields":
        return (
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg text-gray-600">Form Fields Settings</Text>
          </View>
        );
      case "Expense Categories":
        return (
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg text-gray-600">Expense Categories</Text>
          </View>
        );
      case "Income Types":
        return (
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg text-gray-600">Income Types</Text>
          </View>
        );
      case "Currency Settings":
        return (
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg text-gray-600">Currency Settings</Text>
          </View>
        );
      case "Booking Management":
        return (
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg text-gray-600">Booking Management</Text>
          </View>
        );
      default:
        return (
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg text-gray-600">Select a tab</Text>
          </View>
        );
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200 mt-20">
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("MainTabs", { screen: "Dashboard" })
          }
          className="flex-row items-center"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
          <Text className="ml-2 text-lg font-semibold text-gray-700">
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View className="bg-white border-b border-gray-200">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="px-2"
        >
          <View className="flex-row py-3">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`px-4 py-2 mx-1 rounded-full ${
                  activeTab === tab
                    ? "bg-blue-500"
                    : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    activeTab === tab
                      ? "text-white"
                      : "text-gray-600"
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View className="flex-1">
        {renderContent()}
      </View>
    </View>
  );
}
