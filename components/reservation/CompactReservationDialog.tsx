import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface CompactReservationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reservationData: any) => void;
}

export function CompactReservationDialog({
  isOpen,
  onClose,
  onSave,
}: CompactReservationDialogProps) {
  const [formData, setFormData] = useState({
    guest_name: "",
    guest_phone: "",
    check_in_date: "",
    check_out_date: "",
    adults: "1",
    room_number: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      guest_name: "",
      guest_phone: "",
      check_in_date: "",
      check_out_date: "",
      adults: "1",
      room_number: "",
    });
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.guest_name.trim()) {
      Alert.alert("Error", "Guest name is required");
      return;
    }

    if (!formData.check_in_date || !formData.check_out_date) {
      Alert.alert("Error", "Check-in and check-out dates are required");
      return;
    }

    if (new Date(formData.check_in_date) >= new Date(formData.check_out_date)) {
      Alert.alert("Error", "Check-out date must be after check-in date");
      return;
    }

    setIsLoading(true);

    try {
      const reservationData = {
        guest_name: formData.guest_name.trim(),
        guest_phone: formData.guest_phone.trim() || undefined,
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        adults: parseInt(formData.adults) || 1,
        children: 0,
        room_number: formData.room_number.trim() || undefined,
        status: "tentative",
        total_amount: 0,
        currency: "LKR" as const,
      };

      await onSave(reservationData);
      resetForm();
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to create reservation");
    } finally {
      setIsLoading(false);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-blue-600 px-4 py-3 pt-12 flex-row items-center justify-between">
          <View>
            <Text className="text-white text-lg font-semibold">Quick Add</Text>
            <Text className="text-blue-100 text-sm">Create new reservation</Text>
          </View>
          <TouchableOpacity onPress={onClose} className="p-1">
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4 py-4">
          {/* Essential Information */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Essential Information
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Guest Name *
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                value={formData.guest_name}
                onChangeText={(text) =>
                  setFormData({ ...formData, guest_name: text })
                }
                placeholder="Enter guest name"
                autoFocus
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                value={formData.guest_phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, guest_phone: text })
                }
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Check-in Date *
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  value={formData.check_in_date}
                  onChangeText={(text) =>
                    setFormData({ ...formData, check_in_date: text })
                  }
                  placeholder="YYYY-MM-DD"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Check-out Date *
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  value={formData.check_out_date}
                  onChangeText={(text) =>
                    setFormData({ ...formData, check_out_date: text })
                  }
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>

            {/* Quick Date Buttons */}
            <View className="flex-row gap-2 mb-4">
              <TouchableOpacity
                onPress={() =>
                  setFormData({
                    ...formData,
                    check_in_date: getTodayDate(),
                    check_out_date: getTomorrowDate(),
                  })
                }
                className="flex-1 bg-blue-100 py-2 px-3 rounded border border-blue-300"
              >
                <Text className="text-blue-700 text-center text-xs font-medium">
                  Today - Tomorrow
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  setFormData({
                    ...formData,
                    check_in_date: getTomorrowDate(),
                    check_out_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0],
                  })
                }
                className="flex-1 bg-gray-100 py-2 px-3 rounded border border-gray-300"
              >
                <Text className="text-gray-700 text-center text-xs font-medium">
                  Tomorrow - Next Day
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Adults
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  value={formData.adults}
                  onChangeText={(text) =>
                    setFormData({ ...formData, adults: text })
                  }
                  placeholder="1"
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Room Number
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  value={formData.room_number}
                  onChangeText={(text) =>
                    setFormData({ ...formData, room_number: text })
                  }
                  placeholder="Optional"
                />
              </View>
            </View>
          </View>

          <View className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle" size={16} color="#D97706" />
              <Text className="text-yellow-800 font-medium ml-2">Quick Add</Text>
            </View>
            <Text className="text-yellow-700 text-sm">
              This creates a tentative reservation with basic information. You can
              edit it later to add more details, set pricing, and confirm the
              booking.
            </Text>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View className="px-4 py-4 border-t border-gray-200 bg-gray-50">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 border border-gray-300 py-3 rounded-lg flex-row items-center justify-center"
            >
              <Text className="text-gray-700 font-medium">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg flex-row items-center justify-center ${
                isLoading ? "bg-gray-400" : "bg-blue-600"
              }`}
            >
              {isLoading ? (
                <Text className="text-white font-medium">Creating...</Text>
              ) : (
                <>
                  <Ionicons name="add" size={16} color="white" />
                  <Text className="text-white font-medium ml-2">Create</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
