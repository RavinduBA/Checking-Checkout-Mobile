import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.iconContainer}>
        <Ionicons name="flash" size={48} color="#007AFF" />
      </View>

      <Text style={styles.title}>Choose Your Features</Text>
      <Text style={styles.subtitle}>
        Select the features you need to get started
      </Text>

      <View style={styles.form}>
        <View style={styles.featuresContainer}>
          {FEATURES.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={[
                styles.featureCard,
                formData.selectedFeatures.includes(feature.id) &&
                  styles.featureCardSelected,
                feature.essential && styles.featureCardEssential,
              ]}
              onPress={() => handleFeatureToggle(feature.id, feature.essential)}
              disabled={feature.essential}
            >
              <View style={styles.featureHeader}>
                <View style={styles.featureIconContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      formData.selectedFeatures.includes(feature.id) &&
                        styles.checkboxSelected,
                      feature.essential && styles.checkboxEssential,
                    ]}
                  >
                    {formData.selectedFeatures.includes(feature.id) && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                  <Ionicons
                    name={feature.icon as any}
                    size={24}
                    color="#007AFF"
                    style={styles.featureIcon}
                  />
                </View>
                <View style={styles.featureContent}>
                  <View style={styles.featureTitleRow}>
                    <Text style={styles.featureLabel}>{feature.label}</Text>
                    {feature.essential && (
                      <View style={styles.essentialBadge}>
                        <Text style={styles.essentialBadgeText}>Essential</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Preferred Currency</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
          >
            <Text style={styles.selectButtonText}>
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
            <View style={styles.dropdown}>
              {CURRENCIES.map((currency) => (
                <TouchableOpacity
                  key={currency.value}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFormData((prev) => ({
                      ...prev,
                      currency: currency.value,
                    }));
                    setShowCurrencyPicker(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{currency.label}</Text>
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
  featuresContainer: {
    gap: 12,
  },
  featureCard: {
    borderWidth: 2,
    borderColor: "#e1e5e9",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "white",
  },
  featureCardSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#f0f8ff",
  },
  featureCardEssential: {
    opacity: 0.8,
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  featureIconContainer: {
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#e1e5e9",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  checkboxEssential: {
    backgroundColor: "#666",
    borderColor: "#666",
  },
  featureIcon: {
    marginTop: 4,
  },
  featureContent: {
    flex: 1,
  },
  featureTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  featureLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  essentialBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  essentialBadgeText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  featureDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
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
