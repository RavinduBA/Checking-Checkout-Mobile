import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useLocationContext } from "../../hooks/useLocationContext";
import { useTenant } from "../../hooks/useTenant";
import { useToast } from "../../hooks/useToast";
import { useRoomAvailability } from "../../hooks/useRoomAvailability";
import { convertCurrency } from "../../utils/currency";

interface Room {
  id: string;
  room_number: string;
  room_type: string;
  base_price: number;
  currency: string;
  location_id: string;
  tenant_id: string;
  is_active: boolean;
}

interface RoomSelection {
  room_id: string;
  room_number: string;
  room_type: string;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  adults: number;
  children: number;
  room_rate: number;
  total_amount: number;
  currency: string;
}

interface GuestData {
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

interface PaymentData {
  advance_amount: number;
  currency: string;
}

interface NewReservationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onReservationCreated: () => void;
}

const STEPS = [
  { id: "guest", title: "Guest Information", icon: "person" },
  { id: "rooms", title: "Room Selection", icon: "bed" },
  { id: "pricing", title: "Pricing", icon: "calculator" },
  { id: "payment", title: "Payment", icon: "card" },
  { id: "confirmation", title: "Confirmation", icon: "checkmark-circle" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

export function NewReservationDialog({
  isOpen,
  onClose,
  onReservationCreated,
}: NewReservationDialogProps) {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { selectedLocation } = useLocationContext();
  const { toast } = useToast();
  const { isRangeAvailable } = useRoomAvailability();

  const [currentStep, setCurrentStep] = useState<StepId>("guest");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [roomSelections, setRoomSelections] = useState<RoomSelection[]>([]);

  const [guestData, setGuestData] = useState<GuestData>({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    guest_address: "",
    guest_nationality: "",
    guest_passport_number: "",
    guest_id_number: "",
    special_requests: "",
    booking_source: "direct",
  });

  const [paymentData, setPaymentData] = useState<PaymentData>({
    advance_amount: 0,
    currency: "LKR",
  });

  // State to store converted total amount
  const [convertedTotal, setConvertedTotal] = useState(0);

  // Calculate total amount across all room selections in payment currency
  const calculateTotalAmount = useCallback(async () => {
    let total = 0;
    for (const selection of roomSelections) {
      if (selection.currency === paymentData.currency) {
        total += selection.total_amount;
      } else {
        try {
          const converted = await convertCurrency(
            selection.total_amount,
            selection.currency as any,
            paymentData.currency as any
          );
          total += converted;
        } catch (error) {
          console.error("Error converting currency:", error);
          total += selection.total_amount; // Fallback to original amount
        }
      }
    }
    return total;
  }, [roomSelections, paymentData.currency]);

  // Update converted total when room selections or payment currency changes
  useEffect(() => {
    const updateTotal = async () => {
      const total = await calculateTotalAmount();
      setConvertedTotal(total);
    };
    updateTotal();
  }, [calculateTotalAmount]);

  // Fetch rooms for selected location
  const fetchRooms = useCallback(async () => {
    if (!selectedLocation || !tenant?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("location_id", selectedLocation)
        .eq("tenant_id", tenant.id)
        .eq("is_active", true)
        .order("room_number");

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      Alert.alert("Error", "Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, tenant?.id]);

  // Fetch rooms when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchRooms();
      setCurrentStep("guest"); // Reset to first step
    }
  }, [isOpen, fetchRooms]);

  const handleGuestDataChange = (field: string, value: any) => {
    setGuestData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentDataChange = (field: string, value: any) => {
    setPaymentData((prev) => ({ ...prev, [field]: value }));
  };

  const generateReservationNumber = async (): Promise<string> => {
    try {
      const { data, error } = await supabase.rpc("generate_reservation_number", {
        p_tenant_id: tenant?.id,
      });

      if (error) throw error;
      return data || `RES${Date.now()}`;
    } catch (error) {
      console.error("Error generating reservation number:", error);
      return `RES${Date.now()}`;
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case "guest": {
        if (!guestData.guest_name.trim()) {
          Alert.alert("Error", "Guest name is required");
          return false;
        }
        return true;
      }

      case "rooms": {
        if (roomSelections.length === 0) {
          Alert.alert("Error", "Please select at least one room");
          return false;
        }
        return true;
      }

      case "pricing":
      case "payment":
      case "confirmation":
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    const currentIndex = STEPS.findIndex((step) => step.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = STEPS.findIndex((step) => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    if (!tenant?.id || !user?.id || !selectedLocation) {
      Alert.alert("Error", "Missing required information");
      return;
    }

    setSubmitting(true);

    try {
      // Generate a group ID for multiple rooms
      const bookingGroupId = crypto.randomUUID();
      const reservations = [];

      // Create reservation data for each room
      for (const selection of roomSelections) {
        const reservationNumber = await generateReservationNumber();
        
        const reservationData = {
          reservation_number: reservationNumber,
          tenant_id: tenant.id,
          location_id: selectedLocation,
          room_id: selection.room_id,
          guest_name: guestData.guest_name,
          guest_email: guestData.guest_email || null,
          guest_phone: guestData.guest_phone || null,
          guest_address: guestData.guest_address || null,
          guest_nationality: guestData.guest_nationality || null,
          guest_passport_number: guestData.guest_passport_number || null,
          guest_id_number: guestData.guest_id_number || null,
          adults: selection.adults,
          children: selection.children,
          check_in_date: selection.check_in_date,
          check_out_date: selection.check_out_date,
          nights: selection.nights,
          room_rate: selection.room_rate,
          total_amount: selection.total_amount,
          advance_amount: paymentData.advance_amount || 0,
          paid_amount: paymentData.advance_amount || 0,
          balance_amount: selection.total_amount - (paymentData.advance_amount || 0),
          currency: selection.currency,
          status: "tentative",
          special_requests: guestData.special_requests || null,
          booking_source: guestData.booking_source,
          created_by: user.id,
          booking_group_id: roomSelections.length > 1 ? bookingGroupId : null,
        };

        reservations.push(reservationData);
      }

      // Insert all reservations in a single transaction
      const { error } = await supabase.from("reservations").insert(reservations);

      if (error) throw error;

      const reservationNumbers = reservations
        .map((r) => r.reservation_number)
        .join(", ");
      
      Alert.alert("Success", `Reservation(s) ${reservationNumbers} created successfully`);

      // Reset form and close dialog
      resetForm();
      onReservationCreated();
      onClose();
    } catch (error) {
      console.error("Error creating reservation:", error);
      Alert.alert("Error", "Failed to create reservation");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep("guest");
    setRoomSelections([]);
    setGuestData({
      guest_name: "",
      guest_email: "",
      guest_phone: "",
      guest_address: "",
      guest_nationality: "",
      guest_passport_number: "",
      guest_id_number: "",
      special_requests: "",
      booking_source: "direct",
    });
    setPaymentData({
      advance_amount: 0,
      currency: "LKR",
    });
  };

  const addRoomSelection = () => {
    const newSelection: RoomSelection = {
      room_id: "",
      room_number: "",
      room_type: "",
      check_in_date: "",
      check_out_date: "",
      nights: 1,
      adults: 1,
      children: 0,
      room_rate: 0,
      total_amount: 0,
      currency: "LKR",
    };
    setRoomSelections([...roomSelections, newSelection]);
  };

  const updateRoomSelection = (index: number, field: keyof RoomSelection, value: any) => {
    const updated = [...roomSelections];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-calculate nights and total when dates or rate change
    if (field === "check_in_date" || field === "check_out_date" || field === "room_rate") {
      const selection = updated[index];
      if (selection.check_in_date && selection.check_out_date) {
        const checkIn = new Date(selection.check_in_date);
        const checkOut = new Date(selection.check_out_date);
        const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
        updated[index].nights = nights;
        updated[index].total_amount = nights * selection.room_rate;
      }
    }

    // Update room details when room is selected
    if (field === "room_id" && value) {
      const selectedRoom = rooms.find(r => r.id === value);
      if (selectedRoom) {
        updated[index].room_number = selectedRoom.room_number;
        updated[index].room_type = selectedRoom.room_type;
        updated[index].room_rate = selectedRoom.base_price;
        updated[index].currency = selectedRoom.currency;
        updated[index].total_amount = updated[index].nights * selectedRoom.base_price;
      }
    }

    setRoomSelections(updated);
  };

  const removeRoomSelection = (index: number) => {
    setRoomSelections(roomSelections.filter((_, i) => i !== index));
  };

  const renderGuestStep = () => (
    <View className="space-y-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">Guest Information</Text>
      
      <View className="space-y-4">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Guest Name *</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            value={guestData.guest_name}
            onChangeText={(text) => handleGuestDataChange("guest_name", text)}
            placeholder="Enter guest name"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            value={guestData.guest_email}
            onChangeText={(text) => handleGuestDataChange("guest_email", text)}
            placeholder="Enter email address"
            keyboardType="email-address"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Phone</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            value={guestData.guest_phone}
            onChangeText={(text) => handleGuestDataChange("guest_phone", text)}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Nationality</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            value={guestData.guest_nationality}
            onChangeText={(text) => handleGuestDataChange("guest_nationality", text)}
            placeholder="Enter nationality"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Special Requests</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            value={guestData.special_requests}
            onChangeText={(text) => handleGuestDataChange("special_requests", text)}
            placeholder="Any special requests"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>
    </View>
  );

  const renderRoomsStep = () => (
    <View className="space-y-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-gray-900">Room Selection</Text>
        <TouchableOpacity
          onPress={addRoomSelection}
          className="bg-blue-600 px-3 py-1 rounded flex-row items-center"
        >
          <Ionicons name="add" size={16} color="white" />
          <Text className="text-white font-medium ml-1">Add Room</Text>
        </TouchableOpacity>
      </View>

      {roomSelections.length === 0 && (
        <View className="bg-gray-50 p-4 rounded-lg">
          <Text className="text-gray-600 text-center">No rooms selected. Tap "Add Room" to get started.</Text>
        </View>
      )}

      {roomSelections.map((selection, index) => (
        <View key={index} className="bg-white p-4 rounded-lg border border-gray-200">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-semibold">Room {index + 1}</Text>
            <TouchableOpacity
              onPress={() => removeRoomSelection(index)}
              className="p-1"
            >
              <Ionicons name="trash" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {/* Room Selection */}
          <View className="mb-3">
            <Text className="text-sm font-medium text-gray-700 mb-2">Select Room</Text>
            <View className="border border-gray-300 rounded-lg">
              {rooms.map((room) => (
                <TouchableOpacity
                  key={room.id}
                  onPress={() => updateRoomSelection(index, "room_id", room.id)}
                  className={`p-3 border-b border-gray-100 ${
                    selection.room_id === room.id ? "bg-blue-50" : ""
                  }`}
                >
                  <Text className="font-medium">{room.room_number} - {room.room_type}</Text>
                  <Text className="text-sm text-gray-600">{room.currency} {room.base_price}/night</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Dates */}
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-2">Check-in</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                value={selection.check_in_date}
                onChangeText={(text) => updateRoomSelection(index, "check_in_date", text)}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-2">Check-out</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                value={selection.check_out_date}
                onChangeText={(text) => updateRoomSelection(index, "check_out_date", text)}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

          {/* Guests */}
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-2">Adults</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                value={selection.adults.toString()}
                onChangeText={(text) => updateRoomSelection(index, "adults", parseInt(text) || 1)}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-2">Children</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                value={selection.children.toString()}
                onChangeText={(text) => updateRoomSelection(index, "children", parseInt(text) || 0)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Summary */}
          {selection.nights > 0 && (
            <View className="bg-gray-50 p-3 rounded">
              <Text className="text-sm text-gray-600">
                {selection.nights} nights × {selection.currency} {selection.room_rate} = {selection.currency} {selection.total_amount}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );

  const renderPricingStep = () => (
    <View className="space-y-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">Pricing Summary</Text>
      
      {roomSelections.map((selection, index) => (
        <View key={index} className="bg-gray-50 p-4 rounded border">
          <Text className="font-medium mb-2">Room {index + 1}: {selection.room_number}</Text>
          <Text className="text-sm text-gray-600">
            {selection.nights} nights × {selection.currency} {selection.room_rate} = {selection.currency} {selection.total_amount}
          </Text>
        </View>
      ))}

      <View className="bg-blue-50 p-4 rounded border border-blue-200">
        <Text className="font-semibold">Grand Total: {paymentData.currency} {convertedTotal.toFixed(2)}</Text>
      </View>
    </View>
  );

  const renderPaymentStep = () => (
    <View className="space-y-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">Payment Information</Text>
      
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Advance Amount</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
          value={paymentData.advance_amount.toString()}
          onChangeText={(text) => handlePaymentDataChange("advance_amount", parseFloat(text) || 0)}
          placeholder="Enter advance amount"
          keyboardType="numeric"
        />
      </View>

      <View className="bg-blue-50 p-4 rounded border border-blue-200">
        <Text className="font-semibold mb-2">Payment Summary</Text>
        <Text>Total Amount: {paymentData.currency} {convertedTotal.toFixed(2)}</Text>
        <Text>Advance: {paymentData.currency} {paymentData.advance_amount.toFixed(2)}</Text>
        <Text>Balance: {paymentData.currency} {(convertedTotal - paymentData.advance_amount).toFixed(2)}</Text>
      </View>
    </View>
  );

  const renderConfirmationStep = () => (
    <View className="space-y-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">Confirmation</Text>
      
      <View className="bg-gray-50 p-4 rounded">
        <Text className="font-semibold mb-2">Guest Information</Text>
        <Text>Name: {guestData.guest_name}</Text>
        {guestData.guest_email && <Text>Email: {guestData.guest_email}</Text>}
        {guestData.guest_phone && <Text>Phone: {guestData.guest_phone}</Text>}
      </View>

      <View className="bg-gray-50 p-4 rounded">
        <Text className="font-semibold mb-2">Room Selections ({roomSelections.length})</Text>
        {roomSelections.map((selection, index) => (
          <Text key={index} className="mb-1">
            {selection.room_number} - {selection.check_in_date} to {selection.check_out_date} ({selection.nights} nights)
          </Text>
        ))}
      </View>

      <View className="bg-blue-50 p-4 rounded border border-blue-200">
        <Text className="font-semibold">Total: {paymentData.currency} {convertedTotal.toFixed(2)}</Text>
        <Text>Advance: {paymentData.currency} {paymentData.advance_amount.toFixed(2)}</Text>
        <Text>Balance: {paymentData.currency} {(convertedTotal - paymentData.advance_amount).toFixed(2)}</Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "guest":
        return renderGuestStep();
      case "rooms":
        return renderRoomsStep();
      case "pricing":
        return renderPricingStep();
      case "payment":
        return renderPaymentStep();
      case "confirmation":
        return renderConfirmationStep();
      default:
        return null;
    }
  };

  const currentStepIndex = STEPS.findIndex((step) => step.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;

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
            <Text className="text-white text-lg font-semibold">New Reservation</Text>
            <Text className="text-blue-100 text-sm">
              Step {currentStepIndex + 1} of {STEPS.length}: {STEPS[currentStepIndex].title}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} className="p-1">
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View className="bg-white px-4 py-2">
          <View className="bg-gray-200 h-1 rounded-full">
            <View 
              className="bg-blue-600 h-1 rounded-full"
              style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
            />
          </View>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-4 py-4">
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#0066cc" />
              <Text className="mt-2 text-gray-600">Loading...</Text>
            </View>
          ) : (
            renderCurrentStep()
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View className="px-4 py-4 border-t border-gray-200 bg-gray-50">
          <View className="flex-row gap-3">
            {!isFirstStep && (
              <TouchableOpacity
                onPress={handlePrevious}
                className="flex-1 border border-gray-300 py-3 rounded-lg flex-row items-center justify-center"
              >
                <Ionicons name="chevron-back" size={16} color="#374151" />
                <Text className="text-gray-700 font-medium ml-2">Previous</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={isLastStep ? handleSubmit : handleNext}
              disabled={submitting}
              className={`flex-1 py-3 rounded-lg flex-row items-center justify-center ${
                submitting ? "bg-gray-400" : "bg-blue-600"
              }`}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Text className="text-white font-medium">
                    {isLastStep ? "Create Reservation" : "Next"}
                  </Text>
                  {!isLastStep && <Ionicons name="chevron-forward" size={16} color="white" />}
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
