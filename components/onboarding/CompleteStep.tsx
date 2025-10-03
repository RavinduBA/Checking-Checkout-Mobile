import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { OnboardingFormData } from "../screens/OnboardingScreen";

interface CompleteStepProps {
  formData: OnboardingFormData;
  onComplete: () => void;
  loading: boolean;
}

export default function CompleteStep({
  formData,
  onComplete,
  loading,
}: CompleteStepProps) {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={64} color="#00C851" />
      </View>

      <Text style={styles.title}>You're All Set! 🎉</Text>
      <Text style={styles.subtitle}>
        Welcome to Check In_Check Out! Your account has been configured based on
        your preferences.
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Setup Summary</Text>
        <View style={styles.summaryContent}>
          <View style={styles.summaryRow}>
            <Ionicons name="business" size={20} color="#007AFF" />
            <Text style={styles.summaryLabel}>Company:</Text>
            <Text style={styles.summaryValue}>{formData.companyName}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Ionicons name="person" size={20} color="#007AFF" />
            <Text style={styles.summaryLabel}>Contact:</Text>
            <Text style={styles.summaryValue}>{formData.contactName}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Ionicons name="mail" size={20} color="#007AFF" />
            <Text style={styles.summaryLabel}>Email:</Text>
            <Text style={styles.summaryValue}>{formData.email}</Text>
          </View>

          {formData.propertyType && (
            <View style={styles.summaryRow}>
              <Ionicons name="home" size={20} color="#007AFF" />
              <Text style={styles.summaryLabel}>Property Type:</Text>
              <Text style={styles.summaryValue}>
                {formData.propertyType.charAt(0).toUpperCase() +
                  formData.propertyType.slice(1)}
              </Text>
            </View>
          )}

          {formData.propertyCount && (
            <View style={styles.summaryRow}>
              <Ionicons name="layers" size={20} color="#007AFF" />
              <Text style={styles.summaryLabel}>Properties:</Text>
              <Text style={styles.summaryValue}>{formData.propertyCount}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.nextStepsCard}>
        <Text style={styles.nextStepsTitle}>What's Next:</Text>
        <View style={styles.nextStepsList}>
          <View style={styles.nextStepItem}>
            <Ionicons name="checkmark-circle" size={16} color="#00C851" />
            <Text style={styles.nextStepText}>Set up your first property</Text>
          </View>
          <View style={styles.nextStepItem}>
            <Ionicons name="checkmark-circle" size={16} color="#00C851" />
            <Text style={styles.nextStepText}>
              Configure room types and pricing
            </Text>
          </View>
          <View style={styles.nextStepItem}>
            <Ionicons name="checkmark-circle" size={16} color="#00C851" />
            <Text style={styles.nextStepText}>Start accepting bookings</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.completeButton,
          loading && styles.completeButtonDisabled,
        ]}
        onPress={onComplete}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Text style={styles.completeButtonText}>Enter Your Dashboard</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </>
        )}
      </TouchableOpacity>

      <View style={styles.trialInfo}>
        <Text style={styles.trialInfoText}>
          🎉 You're now on a 7-day free trial with full access to all features!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: "center",
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  summaryCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    width: "100%",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#1a1a1a",
  },
  summaryContent: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
    minWidth: 80,
  },
  summaryValue: {
    fontSize: 14,
    color: "#1a1a1a",
    fontWeight: "500",
    flex: 1,
  },
  nextStepsCard: {
    backgroundColor: "#f0f8ff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    width: "100%",
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    color: "#1a1a1a",
  },
  nextStepsList: {
    gap: 12,
  },
  nextStepItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  nextStepText: {
    fontSize: 14,
    color: "#1a1a1a",
    flex: 1,
  },
  completeButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
    minWidth: 250,
    justifyContent: "center",
  },
  completeButtonDisabled: {
    backgroundColor: "#ccc",
  },
  completeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  trialInfo: {
    backgroundColor: "#e8f5e8",
    borderRadius: 8,
    padding: 16,
    width: "100%",
  },
  trialInfoText: {
    fontSize: 14,
    color: "#2d5016",
    textAlign: "center",
    lineHeight: 20,
  },
});
