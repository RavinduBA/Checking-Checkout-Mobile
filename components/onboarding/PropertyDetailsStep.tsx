import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
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
    icon: "island",
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.iconContainer}>
        <Ionicons name="business" size={48} color="#007AFF" />
      </View>

      <Text style={styles.title}>Property Information</Text>
      <Text style={styles.subtitle}>
        Help us understand your property setup
      </Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            What type of property do you manage? *
          </Text>
          <View style={styles.propertyTypesGrid}>
            {PROPERTY_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.propertyTypeCard,
                  formData.propertyType === type.id &&
                    styles.propertyTypeCardSelected,
                ]}
                onPress={() => updateFormData("propertyType", type.id)}
              >
                <Ionicons
                  name={type.icon as any}
                  size={24}
                  color={formData.propertyType === type.id ? "#007AFF" : "#666"}
                />
                <Text
                  style={[
                    styles.propertyTypeLabel,
                    formData.propertyType === type.id &&
                      styles.propertyTypeLabelSelected,
                  ]}
                >
                  {type.label}
                </Text>
                <Text style={styles.propertyTypeDescription}>
                  {type.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={styles.label}>Number of Properties *</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() =>
                setShowPropertyCountPicker(!showPropertyCountPicker)
              }
            >
              <Text
                style={[
                  styles.selectButtonText,
                  !formData.propertyCount && styles.placeholder,
                ]}
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
              <View style={styles.dropdown}>
                {PROPERTY_COUNT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      updateFormData("propertyCount", option.value);
                      setShowPropertyCountPicker(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{option.label}</Text>
                    {formData.propertyCount === option.value && (
                      <Ionicons name="checkmark" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={styles.label}>Total Rooms/Units *</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowRoomCountPicker(!showRoomCountPicker)}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  !formData.totalRooms && styles.placeholder,
                ]}
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
              <View style={styles.dropdown}>
                {ROOM_COUNT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      updateFormData("totalRooms", option.value);
                      setShowRoomCountPicker(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{option.label}</Text>
                    {formData.totalRooms === option.value && (
                      <Ionicons name="checkmark" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Brief Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 32,
  },
  form: {
    gap: 24,
  },
  inputContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1a1a1a",
  },
  propertyTypesGrid: {
    gap: 12,
  },
  propertyTypeCard: {
    borderWidth: 2,
    borderColor: "#e1e5e9",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "white",
    alignItems: "center",
  },
  propertyTypeCardSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#f0f8ff",
  },
  propertyTypeLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
    color: "#1a1a1a",
  },
  propertyTypeLabelSelected: {
    color: "#007AFF",
  },
  propertyTypeDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  selectButton: {
    borderWidth: 1,
    borderColor: "#e1e5e9",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectButtonText: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  placeholder: {
    color: "#999",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#e1e5e9",
    borderRadius: 8,
    backgroundColor: "white",
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e1e5e9",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "white",
    color: "#1a1a1a",
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
});
