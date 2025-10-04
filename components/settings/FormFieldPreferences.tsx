import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { useFormFieldPreferences } from "../../hooks/useFormFieldPreferences";

export default function FormFieldPreferences() {
  const {
    preferences: formPreferences,
    updatePreferences: updateFormPreferences,
    loading: formPreferencesLoading,
  } = useFormFieldPreferences();

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
              value={formPreferences?.show_guest_email ?? true}
              onValueChange={(value) =>
                updateFormPreferences({ show_guest_email: value })
              }
            />
            <PreferenceItem
              id="show_guest_phone"
              label="Guest Phone"
              value={formPreferences?.show_guest_phone ?? true}
              onValueChange={(value) =>
                updateFormPreferences({ show_guest_phone: value })
              }
            />
            <PreferenceItem
              id="show_guest_address"
              label="Guest Address"
              value={formPreferences?.show_guest_address ?? true}
              onValueChange={(value) =>
                updateFormPreferences({ show_guest_address: value })
              }
            />
            <PreferenceItem
              id="show_guest_nationality"
              label="Guest Nationality"
              value={formPreferences?.show_guest_nationality ?? true}
              onValueChange={(value) =>
                updateFormPreferences({ show_guest_nationality: value })
              }
            />
            <PreferenceItem
              id="show_guest_passport_number"
              label="Passport Number"
              value={formPreferences?.show_guest_passport_number ?? true}
              onValueChange={(value) =>
                updateFormPreferences({ show_guest_passport_number: value })
              }
            />
            <PreferenceItem
              id="show_guest_id_number"
              label="ID Number"
              value={formPreferences?.show_guest_id_number ?? false}
              onValueChange={(value) =>
                updateFormPreferences({ show_guest_id_number: value })
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
              value={formPreferences?.show_adults ?? true}
              onValueChange={(value) =>
                updateFormPreferences({ show_adults: value })
              }
            />
            <PreferenceItem
              id="show_children"
              label="Number of Children"
              value={formPreferences?.show_children ?? true}
              onValueChange={(value) =>
                updateFormPreferences({ show_children: value })
              }
            />
            <PreferenceItem
              id="show_arrival_time"
              label="Arrival Time"
              value={formPreferences?.show_arrival_time ?? false}
              onValueChange={(value) =>
                updateFormPreferences({ show_arrival_time: value })
              }
            />
            <PreferenceItem
              id="show_special_requests"
              label="Special Requests"
              value={formPreferences?.show_special_requests ?? true}
              onValueChange={(value) =>
                updateFormPreferences({ show_special_requests: value })
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
              value={formPreferences?.show_advance_amount ?? true}
              onValueChange={(value) =>
                updateFormPreferences({ show_advance_amount: value })
              }
            />
            <PreferenceItem
              id="show_paid_amount"
              label="Paid Amount"
              value={formPreferences?.show_paid_amount ?? true}
              onValueChange={(value) =>
                updateFormPreferences({ show_paid_amount: value })
              }
            />
            <PreferenceItem
              id="show_guide"
              label="Guide Selection"
              value={formPreferences?.show_guide ?? true}
              onValueChange={(value) =>
                updateFormPreferences({ show_guide: value })
              }
            />
            <PreferenceItem
              id="show_agent"
              label="Agent Selection"
              value={formPreferences?.show_agent ?? true}
              onValueChange={(value) =>
                updateFormPreferences({ show_agent: value })
              }
            />
            <PreferenceItem
              id="show_booking_source"
              label="Booking Source"
              value={formPreferences?.show_booking_source ?? false}
              onValueChange={(value) =>
                updateFormPreferences({ show_booking_source: value })
              }
            />
            <PreferenceItem
              id="show_id_photos"
              label="ID Photo Upload"
              value={formPreferences?.show_id_photos ?? false}
              onValueChange={(value) =>
                updateFormPreferences({ show_id_photos: value })
              }
            />
            <PreferenceItem
              id="show_guest_signature"
              label="Guest Signature"
              value={formPreferences?.show_guest_signature ?? false}
              onValueChange={(value) =>
                updateFormPreferences({ show_guest_signature: value })
              }
            />
          </View>
        </View>

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
