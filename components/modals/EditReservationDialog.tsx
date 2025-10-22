import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocationContext } from "../../contexts/LocationContext";
import { useProfile } from "../../hooks/useProfile";
import { useToast } from "../../hooks/useToast";
import { supabase } from "../../lib/supabase";
import { convertCurrency } from "../../utils/currency";
import { OTPVerification } from "../auth/OTPVerification";

interface Reservation {
  id: string;
  reservation_number: string;
  guest_name: string;
  guest_email?: string;
  guest_phone?: string;
  guest_address?: string;
  guest_id_number?: string;
  guest_nationality?: string;
  adults: number;
  children: number;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  room_rate: number;
  total_amount: number;
  advance_amount?: number;
  paid_amount?: number;
  balance_amount?: number;
  currency: "USD" | "LKR" | "EUR" | "GBP";
  status:
    | "pending"
    | "confirmed"
    | "checked_in"
    | "checked_out"
    | "cancelled"
    | "tentative";
  special_requests?: string;
  arrival_time?: string;
  room_id: string;
  location_id: string;
  tenant_id?: string;
  agent_id?: string;
  guide_id?: string;
  agent_commission?: number;
  guide_commission?: number;
  booking_source?: string;
}

interface ReservationEditDialogProps {
  visible: boolean;
  reservation: Reservation | null;
  onClose: () => void;
  onUpdate: () => void;
}

export function EditReservationDialog({
  visible,
  reservation,
  onClose,
  onUpdate,
}: ReservationEditDialogProps) {
  const { toast } = useToast();
  const [isOTPVerified, setIsOTPVerified] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Reservation>>({});
  const [rooms, setRooms] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [location, setLocation] = useState<any>(null);
  const { profile } = useProfile();
  const { selectedLocation } = useLocationContext();
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!selectedLocation) {
        console.log("No selected location, skipping room fetch");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("rooms")
          .select(
            "id, room_number, room_type, location_id, base_price, currency"
          )
          .eq("is_active", true)
          .eq("location_id", selectedLocation);

        if (error) {
          console.error("Error fetching rooms:", error);
          toast({
            title: "Connection Error",
            description:
              "Unable to load rooms. Please check your internet connection.",
          });
          return;
        }

        console.log(
          "Fetched rooms for selected location:",
          selectedLocation,
          data
        );
        setRooms(data || []);
      } catch (networkError) {
        console.error("Network error fetching rooms:", networkError);
        toast({
          title: "Network Error",
          description:
            "Unable to connect to the server. Please check your internet connection and try again.",
        });
      }
    };

    const fetchAgents = async () => {
      try {
        const { data, error } = await supabase
          .from("agents")
          .select("id, name, commission_rate")
          .eq("is_active", true);

        if (error) {
          console.error("Error fetching agents:", error);
          return;
        }

        setAgents(data || []);
      } catch (networkError) {
        console.error("Network error fetching agents:", networkError);
      }
    };

    const fetchGuides = async () => {
      try {
        const { data, error } = await supabase
          .from("guides")
          .select("id, name, commission_rate")
          .eq("is_active", true);

        if (error) {
          console.error("Error fetching guides:", error);
          return;
        }

        setGuides(data || []);
      } catch (networkError) {
        console.error("Network error fetching guides:", networkError);
      }
    };

    const fetchLocation = async () => {
      if (!reservation?.location_id) return;

      try {
        const { data, error } = await supabase
          .from("locations")
          .select("id, name, phone, email")
          .eq("id", reservation.location_id)
          .single();

        if (error) {
          console.error("Error fetching location:", error);
          return;
        }

        setLocation(data);
      } catch (networkError) {
        console.error("Network error fetching location:", networkError);
      }
    };

    if (reservation && visible) {
      console.log("Initializing form with reservation:", reservation);
      console.log("Selected location:", selectedLocation);

      // Initialize form data with reservation
      const initialFormData = { ...reservation };

      // If the reservation is for a different location than currently selected,
      // clear the room_id to force user to select a new room
      if (reservation.location_id !== selectedLocation) {
        console.log(
          "Reservation location differs from selected location, clearing room_id"
        );
        initialFormData.room_id = "";
      }

      setFormData(initialFormData);
      fetchRooms();
      fetchAgents();
      fetchGuides();
      fetchLocation();
    }
  }, [reservation, visible, selectedLocation]);

  const handleOTPVerified = () => {
    setIsOTPVerified(true);
  };

  const handleSubmit = async () => {
    if (!isOTPVerified) {
      Alert.alert(
        "Verification Required",
        "Please verify OTP before saving changes."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Filter formData to only include valid database fields
      const updateData = {
        guest_name: formData.guest_name,
        guest_email: formData.guest_email,
        guest_phone: formData.guest_phone,
        guest_address: formData.guest_address,
        guest_id_number: formData.guest_id_number,
        guest_nationality: formData.guest_nationality,
        adults: formData.adults,
        children: formData.children,
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        nights: formData.nights,
        room_rate: formData.room_rate,
        total_amount: formData.total_amount,
        advance_amount: formData.advance_amount,
        paid_amount: formData.paid_amount,
        balance_amount: formData.balance_amount,
        currency: formData.currency,
        status: formData.status,
        special_requests: formData.special_requests,
        arrival_time: formData.arrival_time,
        room_id: formData.room_id === "" ? null : formData.room_id,
        agent_id:
          formData.agent_id === "none" || formData.agent_id === ""
            ? null
            : formData.agent_id,
        guide_id:
          formData.guide_id === "none" || formData.guide_id === ""
            ? null
            : formData.guide_id,
        agent_commission: formData.agent_commission,
        guide_commission: formData.guide_commission,
        booking_source: formData.booking_source,
      };

      console.log("Updating reservation with data:", updateData);

      const { error } = await supabase
        .from("reservations")
        .update(updateData)
        .eq("id", reservation?.id);

      if (error) throw error;

      // Send SMS notification after successful update
      if (reservation?.guest_phone) {
        try {
          // Get room details for SMS
          const { data: roomData } = await supabase
            .from("rooms")
            .select("room_number")
            .eq("id", formData.room_id || reservation?.room_id || "")
            .single();

          // Send SMS notification about the update
          await supabase.functions.invoke("send-sms-notification", {
            body: {
              type: "reservation",
              phoneNumber: reservation.guest_phone,
              guestName: formData.guest_name || reservation.guest_name,
              reservationNumber: reservation.reservation_number,
              roomNumber: roomData?.room_number || "N/A",
              checkIn: formData.check_in_date || reservation.check_in_date,
              checkOut: formData.check_out_date || reservation.check_out_date,
              amount: formData.total_amount || reservation.total_amount,
              currency: formData.currency || reservation.currency,
              status: "UPDATED",
            },
          });

          console.log(
            "SMS notification sent successfully for reservation update"
          );
        } catch (smsError) {
          console.error("Error sending SMS notification:", smsError);
          // Don't show error to user as the main operation succeeded
        }
      }

      toast({
        title: "Success",
        description: "Reservation updated successfully",
      });

      onUpdate();
      onClose();
      setIsOTPVerified(false);
    } catch (error: any) {
      console.error("Error updating reservation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update reservation",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOTPVerified(false);
    onClose();
  };

  if (!reservation) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">
              Edit Reservation
            </Text>
            <Text className="text-sm text-gray-600">
              {reservation.reservation_number}
            </Text>
          </View>
          <TouchableOpacity onPress={handleClose} className="p-2">
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Guest Name and Email */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Guest Name *
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
              value={formData.guest_name || ""}
              onChangeText={(value) =>
                setFormData({ ...formData, guest_name: value })
              }
              placeholder="Enter guest name"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Guest Email
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
              value={formData.guest_email || ""}
              onChangeText={(value) =>
                setFormData({ ...formData, guest_email: value })
              }
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Guest Phone and Nationality */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Guest Phone
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
              value={formData.guest_phone || ""}
              onChangeText={(value) =>
                setFormData({ ...formData, guest_phone: value })
              }
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Guest Nationality
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
              value={formData.guest_nationality || ""}
              onChangeText={(value) =>
                setFormData({ ...formData, guest_nationality: value })
              }
              placeholder="Enter nationality"
            />
          </View>

          {/* Guest Address */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Guest Address
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
              value={formData.guest_address || ""}
              onChangeText={(value) =>
                setFormData({ ...formData, guest_address: value })
              }
              placeholder="Enter address"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Guest ID Number */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              ID Number
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
              value={formData.guest_id_number || ""}
              onChangeText={(value) =>
                setFormData({ ...formData, guest_id_number: value })
              }
              placeholder="Enter ID or passport number"
            />
          </View>

          {/* Booking Source */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Booking Source
            </Text>
            <View className="border border-gray-300 rounded-lg bg-white">
              <Picker
                selectedValue={formData.booking_source || "direct"}
                onValueChange={(value) =>
                  setFormData({ ...formData, booking_source: value })
                }
              >
                <Picker.Item label="Direct" value="direct" />
                <Picker.Item label="Airbnb" value="airbnb" />
                <Picker.Item label="Booking.com" value="booking_com" />
                <Picker.Item label="Expedia" value="expedia" />
                <Picker.Item label="Agoda" value="agoda" />
                <Picker.Item label="Beds24" value="beds24" />
                <Picker.Item label="Manual" value="manual" />
                <Picker.Item label="Online" value="online" />
                <Picker.Item label="Phone" value="phone" />
                <Picker.Item label="Email" value="email" />
                <Picker.Item label="Walk-in" value="walk_in" />
                <Picker.Item label="iCal" value="ical" />
              </Picker>
            </View>
          </View>

          {/* Adults, Children, Arrival Time */}
          <View className="flex-row mb-4 space-x-2">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Adults *
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                value={String(formData.adults || 1)}
                onChangeText={(value) =>
                  setFormData({ ...formData, adults: parseInt(value) || 1 })
                }
                keyboardType="number-pad"
              />
            </View>

            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Children
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                value={String(formData.children || 0)}
                onChangeText={(value) =>
                  setFormData({ ...formData, children: parseInt(value) || 0 })
                }
                keyboardType="number-pad"
              />
            </View>

            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Arrival Time
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                value={formData.arrival_time || ""}
                onChangeText={(value) =>
                  setFormData({ ...formData, arrival_time: value })
                }
                placeholder="HH:MM"
              />
            </View>
          </View>

          {/* Check-in Date */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Check-in Date *
            </Text>
            <TouchableOpacity
              onPress={() => setShowCheckInPicker(true)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <Text className="text-gray-900">
                {formData.check_in_date || "Select date"}
              </Text>
            </TouchableOpacity>
            {showCheckInPicker && (
              <DateTimePicker
                value={
                  formData.check_in_date
                    ? new Date(formData.check_in_date)
                    : new Date()
                }
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setShowCheckInPicker(Platform.OS === "ios");
                  if (selectedDate) {
                    const dateStr = selectedDate.toISOString().split("T")[0];
                    const checkInDate = new Date(dateStr);
                    const checkOutDate = formData.check_out_date
                      ? new Date(formData.check_out_date)
                      : null;
                    let nights = 1;
                    if (checkOutDate) {
                      nights = Math.max(
                        1,
                        Math.ceil(
                          (checkOutDate.getTime() - checkInDate.getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      );
                    }
                    setFormData({
                      ...formData,
                      check_in_date: dateStr,
                      nights,
                      total_amount: (formData.room_rate || 0) * nights,
                    });
                  }
                }}
              />
            )}
          </View>

          {/* Check-out Date */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Check-out Date *
            </Text>
            <TouchableOpacity
              onPress={() => setShowCheckOutPicker(true)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <Text className="text-gray-900">
                {formData.check_out_date || "Select date"}
              </Text>
            </TouchableOpacity>
            {showCheckOutPicker && (
              <DateTimePicker
                value={
                  formData.check_out_date
                    ? new Date(formData.check_out_date)
                    : new Date()
                }
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                minimumDate={
                  formData.check_in_date
                    ? new Date(formData.check_in_date)
                    : new Date()
                }
                onChange={(event, selectedDate) => {
                  setShowCheckOutPicker(Platform.OS === "ios");
                  if (selectedDate) {
                    const dateStr = selectedDate.toISOString().split("T")[0];
                    const checkInDate = formData.check_in_date
                      ? new Date(formData.check_in_date)
                      : new Date();
                    const checkOutDate = new Date(dateStr);
                    const nights = Math.max(
                      1,
                      Math.ceil(
                        (checkOutDate.getTime() - checkInDate.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    );
                    setFormData({
                      ...formData,
                      check_out_date: dateStr,
                      nights,
                      total_amount: (formData.room_rate || 0) * nights,
                    });
                  }
                }}
              />
            )}
          </View>

          {/* Room Selection */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Room *
            </Text>
            <View className="border border-gray-300 rounded-lg bg-white">
              <Picker
                selectedValue={formData.room_id || ""}
                onValueChange={async (value) => {
                  const selectedRoom = rooms.find((r) => r.id === value);
                  if (selectedRoom) {
                    try {
                      const convertedPrice = await convertCurrency(
                        selectedRoom.base_price,
                        selectedRoom.currency,
                        formData.currency || "USD",
                        reservation?.tenant_id || "",
                        selectedLocation || ""
                      );
                      setFormData({
                        ...formData,
                        room_id: value,
                        room_rate: convertedPrice,
                        total_amount: convertedPrice * (formData.nights || 1),
                      });
                    } catch (error) {
                      console.error("Currency conversion failed:", error);
                      setFormData({
                        ...formData,
                        room_id: value,
                        room_rate: selectedRoom.base_price,
                        total_amount:
                          selectedRoom.base_price * (formData.nights || 1),
                      });
                    }
                  }
                }}
              >
                <Picker.Item label="Select room" value="" />
                {rooms.map((room) => (
                  <Picker.Item
                    key={room.id}
                    label={`${room.room_number} - ${room.room_type}`}
                    value={room.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Room Rate */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Room Rate *
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
              value={String(formData.room_rate || 0)}
              onChangeText={(value) => {
                const rate = parseFloat(value) || 0;
                setFormData({
                  ...formData,
                  room_rate: rate,
                  total_amount: rate * (formData.nights || 1),
                });
              }}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Agent Selection */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Agent (Optional)
            </Text>
            <View className="border border-gray-300 rounded-lg bg-white">
              <Picker
                selectedValue={formData.agent_id || "none"}
                onValueChange={(value) => {
                  const selectedAgent = agents.find((a) => a.id === value);
                  setFormData({
                    ...formData,
                    agent_id: value === "none" ? undefined : value,
                    agent_commission: selectedAgent?.commission_rate || 0,
                  });
                }}
              >
                <Picker.Item label="No Agent" value="none" />
                {agents.map((agent) => (
                  <Picker.Item
                    key={agent.id}
                    label={`${agent.name} (${agent.commission_rate}%)`}
                    value={agent.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Guide Selection */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Guide (Optional)
            </Text>
            <View className="border border-gray-300 rounded-lg bg-white">
              <Picker
                selectedValue={formData.guide_id || "none"}
                onValueChange={(value) => {
                  const selectedGuide = guides.find((g) => g.id === value);
                  setFormData({
                    ...formData,
                    guide_id: value === "none" ? undefined : value,
                    guide_commission: selectedGuide?.commission_rate || 0,
                  });
                }}
              >
                <Picker.Item label="No Guide" value="none" />
                {guides.map((guide) => (
                  <Picker.Item
                    key={guide.id}
                    label={`${guide.name} (${guide.commission_rate}%)`}
                    value={guide.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Special Requests */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Special Requests
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
              value={formData.special_requests || ""}
              onChangeText={(value) =>
                setFormData({ ...formData, special_requests: value })
              }
              placeholder="Any special requests or notes..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Financial Summary */}
          <View className="bg-gray-50 rounded-lg p-4 mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Financial Summary
            </Text>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-600">Total Amount:</Text>
              <Text className="text-sm font-semibold">
                {formData.currency}{" "}
                {(formData.total_amount || 0).toLocaleString()}
              </Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-600">Paid Amount:</Text>
              <Text className="text-sm font-semibold text-emerald-600">
                {formData.currency}{" "}
                {(formData.paid_amount || 0).toLocaleString()}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm font-medium">Balance:</Text>
              <Text
                className={`text-base font-bold ${
                  (formData.total_amount || 0) - (formData.paid_amount || 0) > 0
                    ? "text-red-600"
                    : "text-emerald-600"
                }`}
              >
                {formData.currency}{" "}
                {(
                  (formData.total_amount || 0) - (formData.paid_amount || 0)
                ).toLocaleString()}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View className="border-t border-gray-200 p-4 flex-row justify-between items-center">
          <TouchableOpacity
            onPress={handleClose}
            className="px-6 py-3 rounded-lg bg-gray-100"
          >
            <Text className="text-gray-700 font-medium">Cancel</Text>
          </TouchableOpacity>

          {!isOTPVerified ? (
            <OTPVerification
              onVerified={handleOTPVerified}
              phoneNumber={location?.phone || profile?.phone || ""}
              locationId={reservation?.location_id}
              triggerComponent={
                <TouchableOpacity className="px-6 py-3 rounded-lg bg-blue-600">
                  <Text className="text-white font-medium">
                    Verify & Enable Editing
                  </Text>
                </TouchableOpacity>
              }
            />
          ) : (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-lg ${
                isSubmitting ? "bg-gray-400" : "bg-blue-600"
              }`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-medium">Save Changes</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
