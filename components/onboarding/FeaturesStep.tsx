import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { OnboardingFormData } from "../screens/OnboardingScreen";

const FEATURES = [
  {
    id: "bookings",
    icon: "calendar",
    description: "Reservation system with calendar",
    essential: true,
  },
  {
    id: "payments",
    label: "Payment Processing",
    icon: "card",
    description: "Secure payment handling",
    essential: true,
  },
  {
    id: "reports",
    label: "Financial Reports",
    icon: "bar-chart",
    description: "Revenue and expense analytics",
  },
  {
    id: "multi_property",
    label: "Multi-Property",
    icon: "business",
    description: "Manage multiple locations",
  },
  {
    id: "guest_management",
    label: "Guest Management",
    icon: "people",
    description: "Guest profiles and history",
  },
  {
    id: "channel_manager",
    label: "Channel Manager",
    icon: "flash",
    description: "OTA integrations (Booking.com, etc.)",
  },
  {
    id: "advanced_security",
    label: "Advanced Security",
    icon: "shield-checkmark",
    description: "Enhanced security features",
  },
];

const CURRENCIES = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "LKR", label: "LKR - Sri Lankan Rupee" },
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "THB", label: "THB - Thai Baht" },
];

interface FeaturesStepProps {
  formData: OnboardingFormData;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingFormData>>;
}

export default function FeaturesStep({
  formData,
  setFormData,
}: FeaturesStepProps) {
  const [showCurrencyPicker, setShowCurrencyPicker] = React.useState(false);

  const handleFeatureToggle = (featureId: string, essential: boolean) => {
    if (essential) return; // Don't allow toggling essential features

    setFormData((prev) => ({
      ...prev,
      selectedFeatures: prev.selectedFeatures.includes(featureId)
        ? prev.selectedFeatures.filter((id) => id !== featureId)
        : [...prev.selectedFeatures, featureId],
    }));
  };

  return (
    <ScrollView
      className="flex-1 bg-white px-6"
      showsVerticalScrollIndicator={false}
    >
      <View className="items-center mb-8">
        <Ionicons name="flash" size={48} color="#007AFF" />
      </View>

      <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
        Choose Your Features
      </Text>
      <Text className="text-base text-gray-600 text-center mb-8">
        Select the features you need to get started
      </Text>

      <View className="space-y-6">
        <View className="space-y-3">
          {FEATURES.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              className={`p-4 border-2 rounded-lg flex-row items-center ${
                formData.selectedFeatures.includes(feature.id)
                  ? "border-blue-500 bg-blue-50"
                  : feature.essential
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 bg-white"
              }`}
              onPress={() =>
                handleFeatureToggle(feature.id, feature.essential || false)
              }
              disabled={feature.essential}
            >
              <View className="flex-row items-center">
                <View
                  className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
                    formData.selectedFeatures.includes(feature.id)
                      ? "bg-blue-500 border-blue-500"
                      : feature.essential
                      ? "bg-green-500 border-green-500"
                      : "border-gray-300"
                  }`}
                >
                  {formData.selectedFeatures.includes(feature.id) && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <Ionicons
                  name={feature.icon as any}
                  size={24}
                  color="#007AFF"
                  className="mr-3"
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-base font-semibold text-gray-900">
                    {feature.label}
                  </Text>
                  {feature.essential && (
                    <View className="bg-green-100 px-2 py-1 rounded">
                      <Text className="text-xs font-medium text-green-800">
                        Essential
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-sm text-gray-600">
                  {feature.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Preferred Currency
          </Text>
          <TouchableOpacity
            className="border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center bg-white"
            onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
          >
            <Text className="text-base text-gray-900">
              {CURRENCIES.find((c) => c.value === formData.currency)?.label ||
                "Select currency"}
            </Text>
            <Ionicons
              name={showCurrencyPicker ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>

          {showCurrencyPicker && (
            <View className="border border-gray-200 rounded-lg mt-2 bg-white shadow-sm">
              {CURRENCIES.map((currency) => (
                <TouchableOpacity
                  key={currency.value}
                  className="px-4 py-3 flex-row justify-between items-center border-b border-gray-100 last:border-b-0"
                  onPress={() => {
                    setFormData((prev) => ({
                      ...prev,
                      currency: currency.value,
                    }));
                    setShowCurrencyPicker(false);
                  }}
                >
                  <Text className="text-base text-gray-900">
                    {currency.label}
                  </Text>
                  {formData.currency === currency.value && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
