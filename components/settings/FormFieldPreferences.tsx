import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFormFieldPreferences } from "../../hooks/useFormFieldPreferences";
import { useUserProfile } from "../../hooks/useUserProfile";

export default function FormFieldPreferences() {
  const {
    preferences: formPreferences,
    updatePreferences: updateFormPreferences,
    loading: formPreferencesLoading,
    error,
  } = useFormFieldPreferences();

  const { profile } = useUserProfile();

  // Local state for pending changes
  const [localPreferences, setLocalPreferences] = useState<any>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Update local state when preferences are loaded
  useEffect(() => {
    if (formPreferences) {
      setLocalPreferences(formPreferences);
      setHasChanges(false);
    }
  }, [formPreferences]);

  // Handle local preference change
  const handlePreferenceChange = (key: string, value: boolean) => {
    setLocalPreferences((prev: any) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  // Save changes to database
  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      console.log("=== SAVING PREFERENCES ===");
      console.log(
        "Full local preferences:",
        JSON.stringify(localPreferences, null, 2)
      );

      // Filter out read-only fields that shouldn't be updated
      const { id, tenant_id, created_at, updated_at, ...updateFields } =
        localPreferences;
      console.log(
        "Filtered update fields:",
        JSON.stringify(updateFields, null, 2)
      );

      // Validate that we have valid data
      if (Object.keys(updateFields).length === 0) {
        throw new Error("No valid fields to update");
      }

      const result = await updateFormPreferences(updateFields);
      console.log("Save result:", JSON.stringify(result, null, 2));

      setHasChanges(false);
      Alert.alert("Success", "Form field preferences updated successfully!");
    } catch (error: any) {
      console.error("=== SAVE ERROR ===");
      console.error("Error details:", error);
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      Alert.alert(
        "Error",
        `Failed to save preferences: ${error.message || "Unknown error"}`
      );
    } finally {
      setSaving(false);
    }
  };

  // Reset to server state
  const handleResetChanges = () => {
    if (formPreferences) {
      setLocalPreferences(formPreferences);
      setHasChanges(false);
    }
  };

  if (formPreferencesLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="mt-3 text-base text-gray-600">
          Loading preferences...
        </Text>
      </View>
    );
  }

  const PreferenceItem = ({
    id,
    label,
    value,
    onValueChange,
  }: {
    id: string;
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
      <Text className="text-base text-gray-900 flex-1">{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#e1e5e9", true: "#007AFF" }}
        thumbColor={value ? "#ffffff" : "#f4f3f4"}
      />
    </View>
  );

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      showsVerticalScrollIndicator={false}
    >
      <View className="p-5 bg-white border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900 mb-2">
          Reservation Form Field Preferences
        </Text>
        <Text className="text-sm text-gray-600 leading-5">
          Select which fields to show in the reservation form. Disabled fields
          will be hidden from the form.
        </Text>
        {error && (
          <View className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <Text className="text-sm text-red-600">{error}</Text>
          </View>
        )}
      </View>

      <View className="flex-1">
        {/* Guest Information Section */}
        <View className="bg-white mt-4 mx-4 rounded-3xl overflow-hidden shadow-sm">
          <Text className="text-base font-semibold text-gray-900 p-4 bg-gray-50 border-b border-gray-200">
            Guest Information
          </Text>
          <View className="p-4">
            <PreferenceItem
              id="show_guest_email"
              label="Guest Email"
              value={localPreferences?.show_guest_email ?? true}
              onValueChange={(value) =>
                handlePreferenceChange("show_guest_email", value)
              }
            />
            <PreferenceItem
              id="show_guest_phone"
              label="Guest Phone"
              value={localPreferences?.show_guest_phone ?? true}
              onValueChange={(value) =>
                handlePreferenceChange("show_guest_phone", value)
              }
            />
            <PreferenceItem
              id="show_guest_address"
              label="Guest Address"
              value={localPreferences?.show_guest_address ?? true}
              onValueChange={(value) =>
                handlePreferenceChange("show_guest_address", value)
              }
            />
            <PreferenceItem
              id="show_guest_nationality"
              label="Guest Nationality"
              value={localPreferences?.show_guest_nationality ?? true}
              onValueChange={(value) =>
                handlePreferenceChange("show_guest_nationality", value)
              }
            />
            <PreferenceItem
              id="show_guest_passport_number"
              label="Passport Number"
              value={localPreferences?.show_guest_passport_number ?? true}
              onValueChange={(value) =>
                handlePreferenceChange("show_guest_passport_number", value)
              }
            />
            <PreferenceItem
              id="show_guest_id_number"
              label="ID Number"
              value={localPreferences?.show_guest_id_number ?? false}
              onValueChange={(value) =>
                handlePreferenceChange("show_guest_id_number", value)
              }
            />
          </View>
        </View>

        {/* Booking Details Section */}
        <View className="bg-white mt-4 mx-4 rounded-3xl overflow-hidden shadow-sm">
          <Text className="text-base font-semibold text-gray-900 p-4 bg-gray-50 border-b border-gray-200">
            Booking Details
          </Text>
          <View className="p-4">
            <PreferenceItem
              id="show_adults"
              label="Number of Adults"
              value={localPreferences?.show_adults ?? true}
              onValueChange={(value) =>
                handlePreferenceChange("show_adults", value)
              }
            />
            <PreferenceItem
              id="show_children"
              label="Number of Children"
              value={localPreferences?.show_children ?? true}
              onValueChange={(value) =>
                handlePreferenceChange("show_children", value)
              }
            />
            <PreferenceItem
              id="show_arrival_time"
              label="Arrival Time"
              value={localPreferences?.show_arrival_time ?? false}
              onValueChange={(value) =>
                handlePreferenceChange("show_arrival_time", value)
              }
            />
            <PreferenceItem
              id="show_special_requests"
              label="Special Requests"
              value={localPreferences?.show_special_requests ?? true}
              onValueChange={(value) =>
                handlePreferenceChange("show_special_requests", value)
              }
            />
          </View>
        </View>

        {/* Financial & Commission Section */}
        <View className="bg-white mt-4 mx-4 rounded-3xl overflow-hidden shadow-sm">
          <Text className="text-base font-semibold text-gray-900 p-4 bg-gray-50 border-b border-gray-200">
            Financial & Commission
          </Text>
          <View className="p-4">
            <PreferenceItem
              id="show_advance_amount"
              label="Advance Amount"
              value={localPreferences?.show_advance_amount ?? true}
              onValueChange={(value) =>
                handlePreferenceChange("show_advance_amount", value)
              }
            />
            <PreferenceItem
              id="show_paid_amount"
              label="Paid Amount"
              value={localPreferences?.show_paid_amount ?? true}
              onValueChange={(value) =>
                handlePreferenceChange("show_paid_amount", value)
              }
            />
            <PreferenceItem
              id="show_guide"
              label="Guide Selection"
              value={localPreferences?.show_guide ?? true}
              onValueChange={(value) =>
                handlePreferenceChange("show_guide", value)
              }
            />
            <PreferenceItem
              id="show_agent"
              label="Agent Selection"
              value={localPreferences?.show_agent ?? true}
              onValueChange={(value) =>
                handlePreferenceChange("show_agent", value)
              }
            />
            <PreferenceItem
              id="show_booking_source"
              label="Booking Source"
              value={localPreferences?.show_booking_source ?? false}
              onValueChange={(value) =>
                handlePreferenceChange("show_booking_source", value)
              }
            />
            <PreferenceItem
              id="show_id_photos"
              label="ID Photo Upload"
              value={localPreferences?.show_id_photos ?? false}
              onValueChange={(value) =>
                handlePreferenceChange("show_id_photos", value)
              }
            />
            <PreferenceItem
              id="show_guest_signature"
              label="Guest Signature"
              value={localPreferences?.show_guest_signature ?? false}
              onValueChange={(value) =>
                handlePreferenceChange("show_guest_signature", value)
              }
            />
          </View>
        </View>

        {/* Save Changes Section */}
        {hasChanges && (
          <View className="bg-white mt-4 mx-4 rounded-xl p-4 shadow-sm">
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={handleSaveChanges}
                disabled={saving}
                className={`flex-1 flex-row justify-center items-center py-3 px-4 rounded-lg ${
                  saving ? "bg-gray-400" : "bg-blue-500"
                }`}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="save" size={20} color="white" />
                )}
                <Text className="text-white font-semibold ml-2">
                  {saving ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleResetChanges}
                disabled={saving}
                className="flex-1 flex-row justify-center items-center py-3 px-4 rounded-lg bg-gray-100 border border-gray-300"
              >
                <Ionicons name="refresh" size={20} color="#6B7280" />
                <Text className="text-gray-600 font-semibold ml-2">Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Note Section */}
        <View className="m-4 p-4 bg-blue-50 rounded-2xl border-l-4 border-blue-500">
          <Text className="text-sm font-semibold text-blue-900 mb-1">
            Note:
          </Text>
          <Text className="text-sm text-blue-800 leading-4.5">
            Required fields like Guest Name, Room, Check-in/Check-out dates, and
            Room Rate are always visible and cannot be hidden.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
