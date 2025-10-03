import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { 
  Text, 
  TouchableOpacity, 
  View, 
  ScrollView 
} from "react-native";
import FormFieldPreferences from "../settings/FormFieldPreferences";
import ExpenseCategories from "../settings/ExpenseCategories";
import IncomeTypes from "../settings/IncomeTypes";
import CurrencySettings from "../settings/CurrencySettings";
import BookingManagement from "../settings/BookingManagement";

type SettingsTab = 'form-fields' | 'expense-categories' | 'income-types' | 'currency' | 'booking-management';

interface Tab {
  id: SettingsTab;
  label: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: 'form-fields', label: 'Form Fields', icon: 'document-text' },
  { id: 'expense-categories', label: 'Expense Categories', icon: 'card' },
  { id: 'income-types', label: 'Income Types', icon: 'trending-up' },
  { id: 'currency', label: 'Currency Settings', icon: 'cash' },
  { id: 'booking-management', label: 'Booking Management', icon: 'calendar' },
];

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<SettingsTab>('form-fields');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'form-fields':
        return <FormFieldPreferences />;
      case 'expense-categories':
        return <ExpenseCategories />;
      case 'income-types':
        return <IncomeTypes />;
      case 'currency':
        return <CurrencySettings />;
      case 'booking-management':
        return <BookingManagement />;
      default:
        return <FormFieldPreferences />;
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Back button header */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200 pt-16">
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("MainTabs", { screen: "Dashboard" })
          }
          className="flex-row items-center"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
          <Text className="ml-2 text-lg font-semibold text-gray-700">
            Back to Dashboard
          </Text>
        </TouchableOpacity>
      </View>

      {/* Settings title */}
      <View className="p-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 mb-1">Settings</Text>
        <Text className="text-sm text-gray-600">
          Configure application settings and preferences
        </Text>
      </View>

      {/* Tab Navigation */}
      <View className="bg-white border-b border-gray-200">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="flex-grow-0"
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              className={`flex-row items-center px-4 py-3 mr-2 rounded-lg my-2 ${
                activeTab === tab.id 
                  ? 'bg-blue-50' 
                  : 'bg-gray-50'
              }`}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={activeTab === tab.id ? '#007AFF' : '#666'}
              />
              <Text
                className={`ml-1.5 text-sm font-medium ${
                  activeTab === tab.id 
                    ? 'text-blue-600 font-semibold' 
                    : 'text-gray-600'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View className="flex-1">
        {renderTabContent()}
      </View>
    </View>
  );
}
