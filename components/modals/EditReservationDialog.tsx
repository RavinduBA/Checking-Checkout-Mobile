import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useGuides } from "../../hooks/useGuides";
import { useLocationContext } from "../../hooks/useLocationContext";
import { useRooms } from "../../hooks/useRooms";
import { useToast } from "../../hooks/useToast";
import { CURRENCIES } from "../../lib/currencies";
import { supabase } from "../../lib/supabase";

interface Room {
  id: string;
  room_number: string;
  room_type: string;
  base_rate: number;
  currency: string;
}

interface Guide {
  id: string;
  name: string;
}

interface Agent {
  id: string;
  name: string;
}

interface EditReservationDialogProps {
  visible: boolean;
  reservation: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditReservationDialog({
  visible,
  reservation,
  onClose,
  onSuccess,
}: EditReservationDialogProps) {
  const { user, tenant } = useAuth();
  const { selectedLocation } = useLocationContext();
  const { data: rooms } = useRooms();
  const { data: guides } = useGuides();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    guest_nationality: "",
    adults: 1,
    children: 0,
    check_in_date: new Date(),
    check_out_date: new Date(),
    room_id: "",
    room_rate: 0,
    currency: "LKR" as keyof typeof CURRENCIES,
    guide_id: "",
    agent_id: "",
    special_requests: "",
    arrival_time: "",
    booking_source: "direct",
    status: "confirmed",
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);

  // Load reservation data when dialog opens
  useEffect(() => {
    if (visible && reservation) {
      setFormData({
        guest_name: reservation.guest_name || "",
        guest_email: reservation.guest_email || "",
        guest_phone: reservation.guest_phone || "",
        guest_nationality: reservation.guest_nationality || "",
        adults: reservation.adults || 1,
        children: reservation.children || 0,
        check_in_date: new Date(reservation.check_in_date),
        check_out_date: new Date(reservation.check_out_date),
        room_id: reservation.room_id || "",
        room_rate: reservation.room_rate || 0,
        currency: reservation.currency || "LKR",
        guide_id: reservation.guide_id || "",
        agent_id: reservation.agent_id || "",
        special_requests: reservation.special_requests || "",
        arrival_time: reservation.arrival_time || "",
        booking_source: reservation.booking_source || "direct",
        status: reservation.status || "confirmed",
      });
    }
  }, [visible, reservation]);

  // Load agents
  useEffect(() => {
    if (visible && tenant?.id && selectedLocation?.id) {
      loadAgents();
    }
  }, [visible, tenant?.id, selectedLocation?.id]);

  const loadAgents = async () => {
    try {
      const { data, error } = await supabase
        .from("agents")
        .select("id, name")
        .eq("tenant_id", tenant?.id)
        .eq("location_id", selectedLocation?.id);

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error("Error loading agents:", error);
    }
  };

  const calculateNights = (checkIn: Date, checkOut: Date) => {
    const diffTime = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotalAmount = () => {
    const nights = calculateNights(
      formData.check_in_date,
      formData.check_out_date
    );
    return nights * formData.room_rate;
  };

  const handleRoomChange = (roomId: string) => {
    const selectedRoom = rooms?.find((room) => room.id === roomId);
    if (selectedRoom) {
      setFormData((prev) => ({
        ...prev,
        room_id: roomId,
        room_rate: selectedRoom.base_rate,
        currency: selectedRoom.currency,
      }));
    }
  };

  const handleDateChange = (
    field: "check_in_date" | "check_out_date",
    date: Date
  ) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: date };

      // Ensure check-out is after check-in
      if (field === "check_in_date" && date >= prev.check_out_date) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        newData.check_out_date = nextDay;
      }

      return newData;
    });
  };

  const validateForm = () => {
    if (!formData.guest_name.trim()) {
      Alert.alert("Validation Error", "Guest name is required");
      return false;
    }

    if (!formData.room_id) {
      Alert.alert("Validation Error", "Please select a room");
      return false;
    }

    if (formData.adults < 1) {
      Alert.alert("Validation Error", "At least one adult is required");
      return false;
    }

    if (formData.room_rate <= 0) {
      Alert.alert("Validation Error", "Room rate must be greater than 0");
      return false;
    }

    const nights = calculateNights(
      formData.check_in_date,
      formData.check_out_date
    );
    if (nights <= 0) {
      Alert.alert(
        "Validation Error",
        "Check-out date must be after check-in date"
      );
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const nights = calculateNights(
        formData.check_in_date,
        formData.check_out_date
      );
      const totalAmount = calculateTotalAmount();

      const updateData = {
        guest_name: formData.guest_name.trim(),
        guest_email: formData.guest_email?.trim() || null,
        guest_phone: formData.guest_phone?.trim() || null,
        guest_nationality: formData.guest_nationality?.trim() || null,
        adults: formData.adults,
        children: formData.children,
        check_in_date: formData.check_in_date.toISOString().split("T")[0],
        check_out_date: formData.check_out_date.toISOString().split("T")[0],
        nights,
        room_id: formData.room_id,
        room_rate: formData.room_rate,
        total_amount: totalAmount,
        currency: formData.currency,
        guide_id: formData.guide_id || null,
        agent_id: formData.agent_id || null,
        special_requests: formData.special_requests?.trim() || null,
        arrival_time: formData.arrival_time?.trim() || null,
        booking_source: formData.booking_source,
        status: formData.status,
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("reservations")
        .update(updateData)
        .eq("id", reservation.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reservation updated successfully",
        type: "success",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error updating reservation:", error);
      Alert.alert("Error", "Failed to update reservation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      LKR: "Rs.",
      USD: "$",
      EUR: "€",
      GBP: "£",
    };
    return symbols[currency] || currency;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
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
              #{reservation?.reservation_number}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} className="p-1">
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4 py-4">
          {/* Guest Information */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3">
              Guest Information
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Guest Name *
              </Text>
              <TextInput
                value={formData.guest_name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, guest_name: text }))
                }
                placeholder="Enter guest name"
                className="border border-gray-300 rounded-lg px-3 py-3 text-base"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Email
              </Text>
              <TextInput
                value={formData.guest_email}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, guest_email: text }))
                }
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
                className="border border-gray-300 rounded-lg px-3 py-3 text-base"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </Text>
              <TextInput
                value={formData.guest_phone}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, guest_phone: text }))
                }
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                className="border border-gray-300 rounded-lg px-3 py-3 text-base"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Nationality
              </Text>
              <TextInput
                value={formData.guest_nationality}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, guest_nationality: text }))
                }
                placeholder="Enter nationality"
                className="border border-gray-300 rounded-lg px-3 py-3 text-base"
              />
            </View>

            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Adults *
                </Text>
                <View className="border border-gray-300 rounded-lg">
                  <Picker
                    selectedValue={formData.adults}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, adults: value }))
                    }
                    style={{ height: 50 }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <Picker.Item
                        key={num}
                        label={num.toString()}
                        value={num}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Children
                </Text>
                <View className="border border-gray-300 rounded-lg">
                  <Picker
                    selectedValue={formData.children}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, children: value }))
                    }
                    style={{ height: 50 }}
                  >
                    {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                      <Picker.Item
                        key={num}
                        label={num.toString()}
                        value={num}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          </View>

          {/* Stay Details */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3">Stay Details</Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Check-in Date *
              </Text>
              <TouchableOpacity
                onPress={() => setShowCheckInPicker(true)}
                className="border border-gray-300 rounded-lg px-3 py-3"
              >
                <Text className="text-base">
                  {formData.check_in_date.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Check-out Date *
              </Text>
              <TouchableOpacity
                onPress={() => setShowCheckOutPicker(true)}
                className="border border-gray-300 rounded-lg px-3 py-3"
              >
                <Text className="text-base">
                  {formData.check_out_date.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Arrival Time
              </Text>
              <TextInput
                value={formData.arrival_time}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, arrival_time: text }))
                }
                placeholder="e.g., 2:00 PM"
                className="border border-gray-300 rounded-lg px-3 py-3 text-base"
              />
            </View>

            <View className="bg-blue-50 rounded-lg p-3">
              <Text className="text-sm text-blue-800">
                Nights:{" "}
                {calculateNights(
                  formData.check_in_date,
                  formData.check_out_date
                )}
              </Text>
            </View>
          </View>

          {/* Room & Pricing */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3">Room & Pricing</Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Room *
              </Text>
              <View className="border border-gray-300 rounded-lg">
                <Picker
                  selectedValue={formData.room_id}
                  onValueChange={handleRoomChange}
                  style={{ height: 50 }}
                >
                  <Picker.Item label="Select a room" value="" />
                  {rooms?.map((room) => (
                    <Picker.Item
                      key={room.id}
                      label={`${room.room_number} - ${room.room_type}`}
                      value={room.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Room Rate *
              </Text>
              <View className="flex-row">
                <View className="flex-1 mr-2">
                  <TextInput
                    value={formData.room_rate.toString()}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        room_rate: parseFloat(text) || 0,
                      }))
                    }
                    placeholder="0.00"
                    keyboardType="numeric"
                    className="border border-gray-300 rounded-lg px-3 py-3 text-base"
                  />
                </View>
                <View className="w-24">
                  <View className="border border-gray-300 rounded-lg">
                    <Picker
                      selectedValue={formData.currency}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, currency: value }))
                      }
                      style={{ height: 50 }}
                    >
                      {Object.entries(CURRENCIES).map(([code, name]) => (
                        <Picker.Item key={code} label={code} value={code} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
            </View>

            <View className="bg-green-50 rounded-lg p-3">
              <Text className="text-sm font-medium text-green-800">
                Total Amount: {getCurrencySymbol(formData.currency)}
                {calculateTotalAmount().toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Commission & Status */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3">
              Commission & Status
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Guide
              </Text>
              <View className="border border-gray-300 rounded-lg">
                <Picker
                  selectedValue={formData.guide_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, guide_id: value }))
                  }
                  style={{ height: 50 }}
                >
                  <Picker.Item label="Select guide (optional)" value="" />
                  {guides?.map((guide) => (
                    <Picker.Item
                      key={guide.id}
                      label={guide.name}
                      value={guide.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Agent
              </Text>
              <View className="border border-gray-300 rounded-lg">
                <Picker
                  selectedValue={formData.agent_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, agent_id: value }))
                  }
                  style={{ height: 50 }}
                >
                  <Picker.Item label="Select agent (optional)" value="" />
                  {agents.map((agent) => (
                    <Picker.Item
                      key={agent.id}
                      label={agent.name}
                      value={agent.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Status
              </Text>
              <View className="border border-gray-300 rounded-lg">
                <Picker
                  selectedValue={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                  style={{ height: 50 }}
                >
                  <Picker.Item label="Tentative" value="tentative" />
                  <Picker.Item label="Confirmed" value="confirmed" />
                  <Picker.Item label="Checked In" value="checked_in" />
                  <Picker.Item label="Checked Out" value="checked_out" />
                  <Picker.Item label="Cancelled" value="cancelled" />
                </Picker>
              </View>
            </View>
          </View>

          {/* Special Requests */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3">
              Additional Information
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Special Requests
              </Text>
              <TextInput
                value={formData.special_requests}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, special_requests: text }))
                }
                placeholder="Any special requests or notes..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="border border-gray-300 rounded-lg px-3 py-3 text-base"
              />
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View className="px-4 py-4 border-t border-gray-200 bg-gray-50 flex-row space-x-3">
          <TouchableOpacity
            onPress={onClose}
            className="flex-1 bg-gray-600 py-3 rounded-lg flex-row items-center justify-center"
          >
            <Ionicons name="close" size={16} color="white" />
            <Text className="text-white font-medium ml-2">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            className="flex-1 bg-blue-600 py-3 rounded-lg flex-row items-center justify-center"
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="save" size={16} color="white" />
                <Text className="text-white font-medium ml-2">
                  Save Changes
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Date Pickers */}
        {showCheckInPicker && (
          <DateTimePicker
            value={formData.check_in_date}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowCheckInPicker(false);
              if (selectedDate) {
                handleDateChange("check_in_date", selectedDate);
              }
            }}
          />
        )}

        {showCheckOutPicker && (
          <DateTimePicker
            value={formData.check_out_date}
            mode="date"
            display="default"
            minimumDate={formData.check_in_date}
            onChange={(event, selectedDate) => {
              setShowCheckOutPicker(false);
              if (selectedDate) {
                handleDateChange("check_out_date", selectedDate);
              }
            }}
          />
        )}
      </View>
    </Modal>
  );
}
