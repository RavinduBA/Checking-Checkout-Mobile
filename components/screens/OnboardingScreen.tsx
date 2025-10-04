import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import CompanyInfoStep from "../onboarding/CompanyInfoStep";
import CompleteStep from "../onboarding/CompleteStep";
import FeaturesStep from "../onboarding/FeaturesStep";
import PlanSelectionStep from "../onboarding/PlanSelectionStep";
import PropertyDetailsStep from "../onboarding/PropertyDetailsStep";

const STEPS = [
  { id: 1, title: "Company Info", description: "Tell us about your business" },
  { id: 2, title: "Property Details", description: "Describe your properties" },
  { id: 3, title: "Features", description: "Choose your features" },
  { id: 4, title: "Select Plan", description: "Choose your subscription plan" },
  { id: 5, title: "Complete", description: "You're all set!" },
];

export interface OnboardingFormData {
  // Company Info
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  country: string;

  // Property Details
  propertyType: string;
  propertyCount: string;
  totalRooms: string;
  description: string;

  // Features
  selectedFeatures: string[];

  // User preferences
  currency: string;
  timezone: string;
}

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [formData, setFormData] = useState<OnboardingFormData>({
    // Company Info
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    country: "",

    // Property Details
    propertyType: "",
    propertyCount: "",
    totalRooms: "",
    description: "",

    // Features
    selectedFeatures: ["bookings", "payments"], // Essential features pre-selected

    // User preferences
    currency: "USD",
    timezone: "",
  });

  const router = useRouter();
  const { user } = useAuth();

  React.useEffect(() => {
    // Pre-fill user email if available
    if (user?.email && !formData.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email!,
        contactName: user.user_metadata?.name || "",
      }));
    }
  }, [user, formData.email]);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      setLoading(true);

      if (!user) {
        throw new Error("No authenticated user found");
      }

      // Generate unique slug for tenant
      const generateUniqueSlug = async (name: string): Promise<string> => {
        const baseSlug =
          name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim() || "tenant";

        // Check if base slug exists
        const { data: existing } = await supabase
          .from("tenants")
          .select("slug")
          .eq("slug", baseSlug)
          .limit(1);

        if (!existing || existing.length === 0) {
          return baseSlug;
        }

        // Find the next available slug with counter
        let counter = 2;
        let candidateSlug = `${baseSlug}-${counter}`;

        while (true) {
          const { data: existingCandidate } = await supabase
            .from("tenants")
            .select("slug")
            .eq("slug", candidateSlug)
            .limit(1);

          if (!existingCandidate || existingCandidate.length === 0) {
            return candidateSlug;
          }

          counter++;
          candidateSlug = `${baseSlug}-${counter}`;
        }
      };

      const slug = await generateUniqueSlug(formData.companyName);

      // Create tenant
      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .insert({
          name: formData.companyName,
          slug: slug,
          hotel_name: formData.companyName,
          hotel_email: formData.email,
          hotel_phone: formData.phone,
          hotel_address: formData.address,
          hotel_timezone: formData.timezone || "UTC",
          owner_profile_id: user.id,
          onboarding_completed: true,
          trial_ends_at: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          subscription_status: "trial",
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Ensure profile exists and update it with tenant_id
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      let profileError;
      if (!existingProfile) {
        // Create profile if it doesn't exist
        const { error } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name || user.email!.split("@")[0],
          tenant_role: "tenant_admin",
          tenant_id: tenant.id,
          is_tenant_admin: true,
          first_login_completed: true,
        });
        profileError = error;
      } else {
        // Update existing profile with tenant_id
        const { error } = await supabase
          .from("profiles")
          .update({
            tenant_id: tenant.id,
            tenant_role: "tenant_admin",
            is_tenant_admin: true,
            first_login_completed: true,
          })
          .eq("id", user.id);
        profileError = error;
      }

      if (profileError) throw profileError;

      // Create default location for the tenant
      const { data: location, error: locationError } = await supabase
        .from("locations")
        .insert({
          name: formData.companyName,
          tenant_id: tenant.id,
          is_active: true,
          property_type: formData.propertyType,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
        })
        .select()
        .single();

      if (locationError) throw locationError;

      // Create user permissions for the new location
      const { error: permissionsError } = await supabase
        .from("user_permissions")
        .insert([
          {
            user_id: user.id,
            tenant_id: tenant.id,
            location_id: location.id,
            tenant_role: "tenant_admin",
            is_tenant_admin: true,
            access_dashboard: true,
            access_income: true,
            access_expenses: true,
            access_reports: true,
            access_calendar: true,
            access_bookings: true,
            access_rooms: true,
            access_master_files: true,
            access_accounts: true,
            access_users: true,
            access_settings: true,
            access_booking_channels: true,
          },
        ]);

      if (permissionsError) throw permissionsError;

      // Note: Trial subscription creation disabled for now - will implement later
      // Features and plan selections are collected but not saved to database yet

      Alert.alert(
        "Welcome aboard! 🎉",
        `Your ${formData.companyName} account has been set up successfully. You can now access your dashboard!`,
        [
          {
            text: "Get Started",
            onPress: () => {
              router.replace("/");
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Onboarding error:", error);
      Alert.alert(
        "Setup Error",
        error.message || "Failed to complete setup. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return formData.companyName && formData.contactName && formData.email;
      case 2:
        return formData.propertyType && formData.propertyCount;
      case 3:
        return true; // Features step is optional for now
      case 4:
        return true; // Plan selection is optional for now
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CompanyInfoStep formData={formData} setFormData={setFormData} />
        );
      case 2:
        return (
          <PropertyDetailsStep formData={formData} setFormData={setFormData} />
        );
      case 3:
        return <FeaturesStep formData={formData} setFormData={setFormData} />;
      case 4:
        return (
          <PlanSelectionStep
            selectedPlanId={selectedPlanId}
            setSelectedPlanId={setSelectedPlanId}
            onStartTrial={completeOnboarding}
            loading={loading}
          />
        );
      case 5:
        return (
          <CompleteStep
            formData={formData}
            onComplete={completeOnboarding}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Progress Header */}
      <View className="pt-15 px-5 pb-4 mt-20 border-b border-gray-200">
        <View className="flex-row justify-center items-center mb-4">
          {STEPS.map((step, index) => (
            <View key={step.id} className="flex-row items-center">
              <View
                className={`w-8 h-8 rounded-full justify-center items-center ${
                  currentStep >= step.id ? "bg-blue-500" : "bg-gray-200"
                }`}
              >
                {currentStep > step.id ? (
                  <Ionicons name="checkmark" size={16} color="white" />
                ) : (
                  <Text
                    className={`text-sm font-semibold ${
                      currentStep >= step.id ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {step.id}
                  </Text>
                )}
              </View>
              {index < STEPS.length - 1 && (
                <View
                  className={`w-10 h-0.5 mx-2 ${
                    currentStep > step.id ? "bg-blue-500" : "bg-gray-200"
                  }`}
                />
              )}
            </View>
          ))}
        </View>
        <Text className="text-center text-sm text-gray-600">
          Step {currentStep} of {STEPS.length}:{" "}
          {STEPS[currentStep - 1]?.description}
        </Text>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-5 mt-4" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-xl pt-3 pb-3 mt-[10px] mb-[10px] shadow-sm">
          <Text className="text-xl font-bold text-center mb-2  text-gray-900">
            {STEPS[currentStep - 1]?.title}
          </Text>
          {renderStepContent()}
        </View>
      </ScrollView>

      {/* Navigation */}
      {currentStep < 5 && (
        <View className="absolute bottom-0 left-0 right-0 flex-row justify-between px-5 py-5 bg-white border-t border-gray-200">
          <TouchableOpacity
            className={`flex-row items-center py-3 px-6 rounded-lg border ${
              currentStep === 1
                ? "bg-gray-50 border-gray-200"
                : "bg-gray-50 border-gray-300"
            }`}
            onPress={handlePrevious}
            disabled={currentStep === 1}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={currentStep === 1 ? "#ccc" : "#666"}
            />
            <Text
              className={`ml-2 text-base font-semibold ${
                currentStep === 1 ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-row items-center py-3 px-6 rounded-lg ${
              !validateStep()
                ? "bg-gray-50 border border-gray-200"
                : "bg-blue-500"
            }`}
            onPress={handleNext}
            disabled={!validateStep()}
          >
            <Text
              className={`mr-2 text-base font-semibold ${
                !validateStep() ? "text-gray-400" : "text-white"
              }`}
            >
              Next Step
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={!validateStep() ? "#ccc" : "white"}
            />
          </TouchableOpacity>
        </View>
      )}

      {loading && (
        <View className="absolute inset-0 bg-black bg-opacity-50 justify-center items-center">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="mt-4 text-base text-white text-center">
            Setting up your account...
          </Text>
        </View>
      )}
    </View>
  );
}
