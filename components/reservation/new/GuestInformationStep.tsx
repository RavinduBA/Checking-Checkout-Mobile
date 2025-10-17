import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFormFieldPreferences } from "../../../hooks/useFormFieldPreferences";

export interface GuestData {
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  guest_address: string;
  guest_nationality: string;
  guest_passport_number: string;
  guest_id_number: string;
  special_requests: string;
  booking_source: string;
}

interface GuestInformationStepProps {
  guestData: GuestData;
  onGuestDataChange: (field: string, value: any) => void;
}

export function GuestInformationStep({
  guestData,
  onGuestDataChange,
}: GuestInformationStepProps) {
  const { preferences: fieldPreferences, loading } = useFormFieldPreferences();

  // Show loading spinner while preferences are being fetched
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-2 text-gray-600">Loading preferences...</Text>
      </View>
    );
  }
  const bookingSources = [
    { value: "direct", label: "Direct" },
    { value: "airbnb", label: "Airbnb" },
    { value: "booking_com", label: "Booking.com" },
    { value: "expedia", label: "Expedia" },
    { value: "agoda", label: "Agoda" },
    { value: "beds24", label: "Beds24" },
    { value: "manual", label: "Manual" },
    { value: "online", label: "Online" },
    { value: "phone", label: "Phone" },
    { value: "email", label: "Email" },
    { value: "walk_in", label: "Walk-in" },
    { value: "ical", label: "iCal" },
  ];

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="space-y-4">
        <View className="flex-row items-center mb-4">
          <Ionicons name="person" size={24} color="#3B82F6" />
          <Text className="text-lg font-semibold ml-2 text-gray-900">
            Guest Information
          </Text>
        </View>

        {/* Guest Name - Required */}
        <View className="space-y-2">
          <Text className="text-sm font-medium text-gray-700">
            Guest Name *
          </Text>
          <TextInput
            className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
            value={guestData.guest_name}
            onChangeText={(value) => onGuestDataChange("guest_name", value)}
            placeholder="Enter guest name"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Email - Conditional based on preferences */}
        {fieldPreferences?.show_guest_email !== false && (
          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-700">Email</Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              value={guestData.guest_email}
              onChangeText={(value) => onGuestDataChange("guest_email", value)}
              placeholder="Enter email address"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        )}

        {/* Phone - Conditional based on preferences */}
        {fieldPreferences?.show_guest_phone !== false && (
          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-700">Phone</Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              value={guestData.guest_phone}
              onChangeText={(value) => onGuestDataChange("guest_phone", value)}
              placeholder="Enter phone number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
          </View>
        )}

        {/* Nationality - Conditional based on preferences */}
        {fieldPreferences?.show_guest_nationality !== false && (
          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-700">
              Nationality
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              value={guestData.guest_nationality}
              onChangeText={(value) =>
                onGuestDataChange("guest_nationality", value)
              }
              placeholder="Enter nationality"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        )}

        {/* Passport Number - Conditional based on preferences */}
        {fieldPreferences?.show_guest_passport_number !== false && (
          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-700">
              Passport Number
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              value={guestData.guest_passport_number}
              onChangeText={(value) =>
                onGuestDataChange("guest_passport_number", value)
              }
              placeholder="Enter passport number"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        )}

        {/* ID Number - Conditional based on preferences */}
        {fieldPreferences?.show_guest_id_number !== false && (
          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-700">ID Number</Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              value={guestData.guest_id_number}
              onChangeText={(value) =>
                onGuestDataChange("guest_id_number", value)
              }
              placeholder="Enter ID number"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        )}

        {/* Address - Conditional based on preferences */}
        {fieldPreferences?.show_guest_address !== false && (
          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-700">Address</Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              value={guestData.guest_address}
              onChangeText={(value) =>
                onGuestDataChange("guest_address", value)
              }
              placeholder="Enter address"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Booking Source - Conditional based on preferences */}
        {fieldPreferences?.show_booking_source !== false && (
          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-700">
              Booking Source
            </Text>
            <View className="bg-white border border-gray-300 rounded-lg">
              <Picker
                selectedValue={guestData.booking_source}
                onValueChange={(value) =>
                  onGuestDataChange("booking_source", value)
                }
                style={{ height: 50 }}
              >
                {bookingSources.map((source) => (
                  <Picker.Item
                    key={source.value}
                    label={source.label}
                    value={source.value}
                  />
                ))}
              </Picker>
            </View>
          </View>
        )}

        {/* Special Requests - Conditional based on preferences */}
        {fieldPreferences?.show_special_requests !== false && (
          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-700">
              Special Requests
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              value={guestData.special_requests}
              onChangeText={(value) =>
                onGuestDataChange("special_requests", value)
              }
              placeholder="Any special requests or notes"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}
