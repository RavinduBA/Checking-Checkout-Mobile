import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
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
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="items-center mb-6">
        <Ionicons name="card" size={48} color="#007AFF" />
      </View>

      <Text className="text-xl font-bold text-center mb-2 text-gray-800">
        Choose Your Plan
      </Text>
      <Text className="text-base text-center text-gray-600 mb-8">
        Start with a 7-day free trial, then choose the plan that fits your needs
      </Text>

      <View className="gap-4 mb-6">
        {DUMMY_PLANS.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            className={`border-2 ${
              selectedPlanId === plan.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200"
            } rounded-2xl p-5 bg-white relative`}
            onPress={() => setSelectedPlanId(plan.id)}
          >
            {plan.popular && (
              <View className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 px-3 py-1 rounded-full">
                <Text className="text-xs font-semibold text-white">
                  Most Popular
                </Text>
              </View>
            )}

            <View className="mb-4">
              <View className="flex-row items-center gap-2 mb-2">
                {plan.name === "Professional" && (
                  <Ionicons name="star" size={20} color="#FFD700" />
                )}
                <Text className="text-xl font-bold text-gray-800">
                  {plan.name}
                </Text>
              </View>
              <View className="flex-row items-baseline gap-1 mb-2">
                <Text className="text-2xl font-bold text-gray-800">
                  ${plan.price}
                </Text>
                <Text className="text-base text-gray-600">
                  /{plan.billing_interval}
                </Text>
              </View>
              {plan.description && (
                <Text className="text-sm text-gray-600 mb-3">
                  {plan.description}
                </Text>
              )}
            </View>

            <View className="gap-3">
              {plan.features.map((feature, index) => (
                <View key={index} className="flex-row items-center gap-3">
                  <Ionicons name="checkmark-circle" size={16} color="#00C851" />
                  <Text className="text-sm text-gray-700 flex-1">
                    {feature}
                  </Text>
                </View>
              ))}

              <View className="gap-2 mt-3 pt-3 border-t border-gray-100">
                <View className="flex-row items-center gap-3">
                  <Ionicons name="business" size={16} color="#007AFF" />
                  <Text className="text-sm text-gray-600">
                    Up to{" "}
                    {plan.max_locations === 999
                      ? "unlimited"
                      : plan.max_locations}{" "}
                    locations
                  </Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <Ionicons name="bed" size={16} color="#9C27B0" />
                  <Text className="text-sm text-gray-600">
                    Up to{" "}
                    {plan.max_rooms === 999 ? "unlimited" : plan.max_rooms}{" "}
                    rooms
                  </Text>
                </View>
              </View>
            </View>

            {selectedPlanId === plan.id && (
              <View className="absolute top-4 right-4">
                <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {selectedPlanId && (
        <View className="gap-4">
          <TouchableOpacity
            className="bg-blue-500 rounded-xl py-4 px-6 flex-row items-center justify-center gap-3 disabled:opacity-50"
            onPress={onStartTrial}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white text-lg font-semibold">
                  Start 7-Day Free Trial
                </Text>
                <Ionicons name="calendar" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>

          <View className="bg-green-50 rounded-xl p-4">
            <Text className="text-center text-sm text-green-700 font-medium">
              ✨ 7-day free trial • Cancel anytime • No hidden fees
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
