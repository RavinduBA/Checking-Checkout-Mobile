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

const PROPERTY_TYPES = [
  {
    id: "hotel",
    label: "Hotel",
    icon: "business",
    description: "Traditional hotel with multiple rooms",
  },
  {
    id: "resort",
    label: "Resort",
    icon: "home",
    description: "Resort with amenities and activities",
  },
  {
    id: "villa",
    label: "Villa",
    icon: "home",
    description: "Private villa or vacation rental",
  },
  {
    id: "mixed",
    label: "Mixed",
    icon: "apps",
    description: "Multiple property types",
  },
];

const PROPERTY_COUNT_OPTIONS = [
  { value: "1", label: "1 Property" },
  { value: "2-5", label: "2-5 Properties" },
  { value: "6-10", label: "6-10 Properties" },
  { value: "11-25", label: "11-25 Properties" },
  { value: "25+", label: "25+ Properties" },
];

const ROOM_COUNT_OPTIONS = [
  { value: "1-10", label: "1-10 Rooms" },
  { value: "11-25", label: "11-25 Rooms" },
  { value: "26-50", label: "26-50 Rooms" },
  { value: "51-100", label: "51-100 Rooms" },
  { value: "100+", label: "100+ Rooms" },
];

interface PropertyDetailsStepProps {
  formData: OnboardingFormData;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingFormData>>;
}

export default function PropertyDetailsStep({
  formData,
  setFormData,
}: PropertyDetailsStepProps) {
  const [showPropertyCountPicker, setShowPropertyCountPicker] =
    React.useState(false);
  const [showRoomCountPicker, setShowRoomCountPicker] = React.useState(false);

  const updateFormData = (field: keyof OnboardingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView
      className="flex-1 bg-white px-6"
      showsVerticalScrollIndicator={false}
    >
      <View className="items-center mb-2">
        <Ionicons name="business" size={40} color="#007AFF" />
      </View>

      <Text className="text-lg font-bold text-gray-900 text-center ">
        Property Information
      </Text>
      <Text className="text-base text-gray-600 text-center mb-5">
        Help us understand your property setup
      </Text>

      <View className="space-y-6">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            What type of property do you manage? *
          </Text>
          <View className="flex-row flex-wrap gap-3 mb-2">
            {PROPERTY_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                className={`flex-1 min-w-[45%] p-4 border-2 rounded-lg items-center ${
                  formData.propertyType === type.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
                onPress={() => updateFormData("propertyType", type.id)}
              >
                <Ionicons
                  name={type.icon as any}
                  size={24}
                  color={formData.propertyType === type.id ? "#007AFF" : "#666"}
                />
                <Text
                  className={`text-sm font-medium mt-2 ${
                    formData.propertyType === type.id
                      ? "text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  {type.label}
                </Text>
                <Text className="text-xs text-gray-500 mt-1 text-center">
                  {type.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="flex-row gap-4">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Number of Properties *
            </Text>
            <TouchableOpacity
              className="border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center bg-white"
              onPress={() =>
                setShowPropertyCountPicker(!showPropertyCountPicker)
              }
            >
              <Text
                className={`text-base ${
                  !formData.propertyCount ? "text-gray-400" : "text-gray-900"
                }`}
              >
                {formData.propertyCount
                  ? PROPERTY_COUNT_OPTIONS.find(
                      (o) => o.value === formData.propertyCount
                    )?.label
                  : "Select number"}
              </Text>
              <Ionicons
                name={showPropertyCountPicker ? "chevron-up" : "chevron-down"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>

            {showPropertyCountPicker && (
              <View className="border border-gray-200 rounded-lg mt-2 bg-white shadow-sm">
                {PROPERTY_COUNT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    className="px-4 py-3 flex-row justify-between items-center border-b  border-gray-100 last:border-b-0"
                    onPress={() => {
                      updateFormData("propertyCount", option.value);
                      setShowPropertyCountPicker(false);
                    }}
                  >
                    <Text className="text-base text-gray-900 ">
                      {option.label}
                    </Text>
                    {formData.propertyCount === option.value && (
                      <Ionicons name="checkmark" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Total Rooms/Units *
            </Text>
            <TouchableOpacity
              className="border border-gray-300 rounded-lg px-4 py-3 mb-2 flex-row justify-between items-center bg-white"
              onPress={() => setShowRoomCountPicker(!showRoomCountPicker)}
            >
              <Text
                className={`text-base ${
                  !formData.totalRooms ? "text-gray-400" : "text-gray-900"
                }`}
              >
                {formData.totalRooms
                  ? ROOM_COUNT_OPTIONS.find(
                      (o) => o.value === formData.totalRooms
                    )?.label
                  : "Select range"}
              </Text>
              <Ionicons
                name={showRoomCountPicker ? "chevron-up" : "chevron-down"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>

            {showRoomCountPicker && (
              <View className="border border-gray-200 rounded-lg mt-2  bg-white shadow-sm">
                {ROOM_COUNT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    className="px-4 py-3 flex-row justify-between items-center border-b border-gray-100 last:border-b-0"
                    onPress={() => {
                      updateFormData("totalRooms", option.value);
                      setShowRoomCountPicker(false);
                    }}
                  >
                    <Text className="text-base text-gray-900">
                      {option.label}
                    </Text>
                    {formData.totalRooms === option.value && (
                      <Ionicons name="checkmark" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Brief Description
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white h-[70px]"
            value={formData.description}
            onChangeText={(value) => updateFormData("description", value)}
            placeholder="Tell us about your property, target guests, special features..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </View>
    </ScrollView>
  );
}
