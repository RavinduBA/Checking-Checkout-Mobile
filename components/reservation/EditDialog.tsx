import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Reservation } from "../../hooks/useReservationsData";

interface EditDialogProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedReservation: Partial<Reservation>) => void;
}

export function EditDialog({
  reservation,
  isOpen,
  onClose,
  onSave,
}: EditDialogProps) {
  const [formData, setFormData] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    adults: "",
    children: "",
    room_number: "",
    check_in_date: "",
    check_out_date: "",
    total_amount: "",
    special_requests: "",
    status: "tentative",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (reservation) {
      setFormData({
        guest_name: reservation.guest_name || "",
        guest_email: reservation.guest_email || "",
        guest_phone: reservation.guest_phone || "",
        adults: reservation.adults?.toString() || "",
        children: reservation.children?.toString() || "",
        room_number: reservation.rooms?.room_number || "",
        check_in_date: reservation.check_in_date?.split("T")[0] || "",
        check_out_date: reservation.check_out_date?.split("T")[0] || "",
        total_amount: reservation.total_amount?.toString() || "",
        special_requests: reservation.special_requests || "",
        status: reservation.status || "tentative",
      });
    }
  }, [reservation]);

  const handleSave = async () => {
    if (!reservation) return;

    // Validation
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
      const updatedReservation: Partial<Reservation> = {
        id: reservation.id,
        guest_name: formData.guest_name.trim(),
        guest_email: formData.guest_email.trim() || undefined,
        guest_phone: formData.guest_phone.trim() || undefined,
        adults: formData.adults ? parseInt(formData.adults) : 1,
        children: formData.children ? parseInt(formData.children) : 0,
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        total_amount: formData.total_amount
          ? parseFloat(formData.total_amount)
          : 0,
        special_requests: formData.special_requests.trim() || undefined,
        status: formData.status as any,
      };

      await onSave(updatedReservation);
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to update reservation");
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: "tentative", label: "Tentative", color: "text-yellow-600" },
    { value: "confirmed", label: "Confirmed", color: "text-green-600" },
    { value: "checked_in", label: "Checked In", color: "text-blue-600" },
    { value: "checked_out", label: "Checked Out", color: "text-gray-600" },
    { value: "cancelled", label: "Cancelled", color: "text-red-600" },
  ];

  if (!reservation) return null;

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
          <View className="flex-1">
            <Text className="text-white text-lg font-semibold">
              Edit Reservation
            </Text>
            <Text className="text-blue-100 text-sm">
              {reservation.reservation_number}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} className="p-1">
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4 py-4">
          {/* Guest Information */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Guest Information
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
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                value={formData.guest_email}
                onChangeText={(text) =>
                  setFormData({ ...formData, guest_email: text })
                }
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Phone
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
                  Adults
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  value={formData.adults}
                  onChangeText={(text) =>
                    setFormData({ ...formData, adults: text })
                  }
                  placeholder="Adults"
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Children
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  value={formData.children}
                  onChangeText={(text) =>
                    setFormData({ ...formData, children: text })
                  }
                  placeholder="Children"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Reservation Details */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Reservation Details
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Room Number
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                value={formData.room_number}
                onChangeText={(text) =>
                  setFormData({ ...formData, room_number: text })
                }
                placeholder="Enter room number"
              />
            </View>

            <View className="mb-4">
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

            <View className="mb-4">
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

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Total Amount
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                value={formData.total_amount}
                onChangeText={(text) =>
                  setFormData({ ...formData, total_amount: text })
                }
                placeholder="Enter total amount"
                keyboardType="numeric"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Status
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {statusOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() =>
                        setFormData({ ...formData, status: option.value })
                      }
                      className={`px-3 py-2 rounded-lg border ${
                        formData.status === option.value
                          ? "bg-blue-100 border-blue-300"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          formData.status === option.value
                            ? "text-blue-700"
                            : option.color
                        }`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Special Requests
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                value={formData.special_requests}
                onChangeText={(text) =>
                  setFormData({ ...formData, special_requests: text })
                }
                placeholder="Enter any special requests"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
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
                <Text className="text-white font-medium">Saving...</Text>
              ) : (
                <>
                  <Ionicons name="save" size={16} color="white" />
                  <Text className="text-white font-medium ml-2">Save</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
