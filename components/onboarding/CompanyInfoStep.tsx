import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { OnboardingFormData } from "../screens/OnboardingScreen";

const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "UK", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "LK", label: "Sri Lanka" },
  { value: "IN", label: "India" },
  { value: "TH", label: "Thailand" },
  { value: "MY", label: "Malaysia" },
  { value: "SG", label: "Singapore" },
  { value: "other", label: "Other" },
];

interface CompanyInfoStepProps {
  formData: OnboardingFormData;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingFormData>>;
}

export default function CompanyInfoStep({
  formData,
  setFormData,
}: CompanyInfoStepProps) {
  const [showCountryPicker, setShowCountryPicker] = React.useState(false);

  const updateFormData = (field: keyof OnboardingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView
      className="flex-1 bg-white px-6"
      showsVerticalScrollIndicator={true}
    >
      <View className="items-center mb-2">
        <Ionicons name="business" size={40} color="#007AFF" />
      </View>

      <Text className="text-lg font-bold text-gray-900 text-center ">
        Tell us about your business
      </Text>
      <Text className="text-base text-gray-600 text-center mb-5">
        We'll use this information to customize your experience
      </Text>

      <View className="space-y-6">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Company/Hotel Name *
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base  bg-white mb-2"
            value={formData.companyName}
            onChangeText={(value) => updateFormData("companyName", value)}
            placeholder="e.g., Oceanview Resort"
            placeholderTextColor="#999"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Contact Person *
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white h-10 mb-2"
            value={formData.contactName}
            onChangeText={(value) => updateFormData("contactName", value)}
            placeholder="Your full name"
            placeholderTextColor="#999"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Business Email *
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white h-10 mb-2"
            value={formData.email}
            onChangeText={(value) => updateFormData("email", value)}
            placeholder="contact@yourhotel.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white h-10 mb-2"
            value={formData.phone}
            onChangeText={(value) => updateFormData("phone", value)}
            placeholder="Enter a phone number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Business Address
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white h-15 mb-2"
            value={formData.address}
            onChangeText={(value) => updateFormData("address", value)}
            placeholder="Street address, city, state/province, country"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Country
          </Text>
          <TouchableOpacity
            className="border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center bg-white h-12 "
            onPress={() => setShowCountryPicker(!showCountryPicker)}
          >
            <Text
              className={`text-base ${
                !formData.country ? "text-gray-400" : "text-gray-900"
              }`}
            >
              {formData.country
                ? COUNTRIES.find((c) => c.value === formData.country)?.label
                : "Select your country"}
            </Text>
            <Ionicons
              name={showCountryPicker ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>

          {showCountryPicker && (
            <View className="border border-gray-200 rounded-lg mt-2 bg-white shadow-sm">
              {COUNTRIES.map((country) => (
                <TouchableOpacity
                  key={country.value}
                  className="px-4 py-3 flex-row justify-between items-center border-b border-gray-100 last:border-b-0"
                  onPress={() => {
                    updateFormData("country", country.value);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text className="text-base text-gray-900">
                    {country.label}
                  </Text>
                  {formData.country === country.value && (
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
