import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePermissions } from "../../hooks/usePermissions";
import {
  AccountsReportsMobile,
  CommissionReportsMobile,
  ComprehensiveReportsMobile,
  EnhancedFinancialReportsMobile,
} from "../reports";

type TabType = "comprehensive" | "detailed" | "accounts" | "commission";

export default function ReportsScreen() {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<TabType>("comprehensive");
  const [refreshing, setRefreshing] = useState(false);

  // Permission check
  if (!hasPermission("access_reports")) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-gray-50">
        <View className="bg-red-50 border border-red-200 rounded-lg p-6 items-center">
          <Ionicons name="alert-circle" size={48} color="#dc2626" />
          <Text className="text-lg font-semibold text-red-900 mt-4">
            Access Denied
          </Text>
          <Text className="text-sm text-red-700 text-center mt-2">
            You don't have permission to access reports. Please contact your
            administrator.
          </Text>
        </View>
      </View>
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh logic here
    setTimeout(() => setRefreshing(false), 1000);
  };

  const tabs = [
    {
      id: "comprehensive",
      label: "Overview",
      icon: "bar-chart-outline" as const,
    },
    { id: "detailed", label: "Detailed", icon: "trending-up-outline" as const },
    { id: "accounts", label: "Accounts", icon: "card-outline" as const },
    {
      id: "commission",
      label: "Commission",
      icon: "pricetag-outline" as const,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "comprehensive":
        return <ComprehensiveReportsMobile />;
      case "detailed":
        return <EnhancedFinancialReportsMobile />;
      case "accounts":
        return <AccountsReportsMobile />;
      case "commission":
        return <CommissionReportsMobile />;
      default:
        return <ComprehensiveReportsMobile />;
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-2 pb-3 bg-white border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">Reports</Text>
            <Text className="text-xs text-gray-600">
              Financial insights and analytics
            </Text>
          </View>
          <TouchableOpacity
            onPress={onRefresh}
            className="ml-2 p-2 rounded-full bg-gray-100"
          >
            <Ionicons name="refresh" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-2"
        >
          <View className="flex-row gap-2">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as TabType)}
                className={`flex-row items-center gap-2 px-4 py-2.5 rounded-lg ${
                  activeTab === tab.id ? "bg-blue-500" : "bg-gray-100"
                }`}
              >
                <Ionicons
                  name={tab.icon}
                  size={18}
                  color={activeTab === tab.id ? "#ffffff" : "#666666"}
                />
                <Text
                  className={`text-sm font-medium ${
                    activeTab === tab.id ? "text-white" : "text-gray-600"
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}
