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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.iconContainer}>
        <Ionicons name="business" size={48} color="#007AFF" />
      </View>

      <Text style={styles.title}>Tell us about your business</Text>
      <Text style={styles.subtitle}>
        We'll use this information to customize your experience
      </Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Company/Hotel Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.companyName}
            onChangeText={(value) => updateFormData("companyName", value)}
            placeholder="e.g., Oceanview Resort"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contact Person *</Text>
          <TextInput
            style={styles.input}
            value={formData.contactName}
            onChangeText={(value) => updateFormData("contactName", value)}
            placeholder="Your full name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Business Email *</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => updateFormData("email", value)}
            placeholder="contact@yourhotel.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(value) => updateFormData("phone", value)}
            placeholder="Enter a phone number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Business Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.address}
            onChangeText={(value) => updateFormData("address", value)}
            placeholder="Street address, city, state/province, country"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Country</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowCountryPicker(!showCountryPicker)}
          >
            <Text
              style={[
                styles.selectButtonText,
                !formData.country && styles.placeholder,
              ]}
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
            <View style={styles.dropdown}>
              {COUNTRIES.map((country) => (
                <TouchableOpacity
                  key={country.value}
                  style={styles.dropdownItem}
                  onPress={() => {
                    updateFormData("country", country.value);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{country.label}</Text>
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
    gap: 20,
  },
  inputContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
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
    height: 80,
    paddingTop: 12,
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
});
