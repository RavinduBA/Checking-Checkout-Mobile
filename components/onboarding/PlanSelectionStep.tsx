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

const DUMMY_PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    billing_interval: "month",
    description: "Perfect for small properties",
    features: [
      "Up to 10 rooms",
      "Basic booking management",
      "Payment processing",
      "Email support",
    ],
    max_locations: 1,
    max_rooms: 10,
  },
  {
    id: "professional",
    name: "Professional",
    price: 79,
    billing_interval: "month",
    description: "Best for growing businesses",
    features: [
      "Up to 50 rooms",
      "Advanced booking management",
      "Payment processing",
      "Multi-property support",
      "Financial reports",
      "Priority support",
    ],
    max_locations: 3,
    max_rooms: 50,
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    billing_interval: "month",
    description: "For large hotel chains",
    features: [
      "Unlimited rooms",
      "All features included",
      "Channel manager",
      "Advanced security",
      "Custom integrations",
      "Dedicated support",
    ],
    max_locations: 999,
    max_rooms: 999,
  },
];

interface PlanSelectionStepProps {
  selectedPlanId: string | null;
  setSelectedPlanId: (planId: string) => void;
  onStartTrial: () => void;
  loading: boolean;
}

export default function PlanSelectionStep({
  selectedPlanId,
  setSelectedPlanId,
  onStartTrial,
  loading,
}: PlanSelectionStepProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.iconContainer}>
        <Ionicons name="card" size={48} color="#007AFF" />
      </View>

      <Text style={styles.title}>Choose Your Plan</Text>
      <Text style={styles.subtitle}>
        Start with a 7-day free trial, then choose the plan that fits your needs
      </Text>

      <View style={styles.plansContainer}>
        {DUMMY_PLANS.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              selectedPlanId === plan.id && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlanId(plan.id)}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>Most Popular</Text>
              </View>
            )}

            <View style={styles.planHeader}>
              <View style={styles.planTitleRow}>
                {plan.name === "Professional" && (
                  <Ionicons name="star" size={20} color="#FFD700" />
                )}
                <Text style={styles.planName}>{plan.name}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.planPrice}>${plan.price}</Text>
                <Text style={styles.planInterval}>
                  /{plan.billing_interval}
                </Text>
              </View>
              {plan.description && (
                <Text style={styles.planDescription}>{plan.description}</Text>
              )}
            </View>

            <View style={styles.planFeatures}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#00C851" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}

              <View style={styles.planLimits}>
                <View style={styles.limitRow}>
                  <Ionicons name="business" size={16} color="#007AFF" />
                  <Text style={styles.limitText}>
                    Up to{" "}
                    {plan.max_locations === 999
                      ? "unlimited"
                      : plan.max_locations}{" "}
                    locations
                  </Text>
                </View>
                <View style={styles.limitRow}>
                  <Ionicons name="bed" size={16} color="#9C27B0" />
                  <Text style={styles.limitText}>
                    Up to{" "}
                    {plan.max_rooms === 999 ? "unlimited" : plan.max_rooms}{" "}
                    rooms
                  </Text>
                </View>
              </View>
            </View>

            {selectedPlanId === plan.id && (
              <View style={styles.selectedIndicator}>
                <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {selectedPlanId && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.trialButton}
            onPress={onStartTrial}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.trialButtonText}>
                  Start 7-Day Free Trial
                </Text>
                <Ionicons name="calendar" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.trialInfo}>
            <Text style={styles.trialInfoText}>
              ✨ 7-day free trial • Cancel anytime • No hidden fees
            </Text>
          </View>
        </View>
      )}
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
  plansContainer: {
    gap: 16,
    marginBottom: 24,
  },
  planCard: {
    borderWidth: 2,
    borderColor: "#e1e5e9",
    borderRadius: 16,
    padding: 20,
    backgroundColor: "white",
    position: "relative",
  },
  planCardSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#f0f8ff",
  },
  popularBadge: {
    position: "absolute",
    top: -8,
    right: 20,
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  planHeader: {
    marginBottom: 20,
    alignItems: "center",
  },
  planTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  planInterval: {
    fontSize: 16,
    color: "#666",
    marginLeft: 4,
  },
  planDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  planFeatures: {
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#1a1a1a",
    flex: 1,
  },
  planLimits: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 8,
  },
  limitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  limitText: {
    fontSize: 14,
    color: "#666",
  },
  selectedIndicator: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  actionContainer: {
    alignItems: "center",
    paddingTop: 16,
    gap: 16,
  },
  trialButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 200,
    justifyContent: "center",
  },
  trialButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  trialInfo: {
    alignItems: "center",
  },
  trialInfoText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
