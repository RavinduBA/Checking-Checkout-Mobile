import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useLocationContext } from "../../contexts/LocationContext";
import { useRoomAvailability } from "../../hooks/useRoomAvailability";
import { useTenant } from "../../hooks/useTenant";
import { useToast } from "../../hooks/useToast";
import { Database } from "../../integrations/supabase/types";
import { supabase } from "../../lib/supabase";
import { convertCurrency } from "../../utils/currency";
import { ConfirmationStep } from "../reservation/new/ConfirmationStep";
import {
  GuestData,
  GuestInformationStep,
} from "../reservation/new/GuestInformationStep";
import { PaymentData, PaymentStep } from "../reservation/new/PaymentStep";
import { PricingStep } from "../reservation/new/PricingStep";
import {
  RoomSelection,
  RoomSelectionStep,
} from "../reservation/new/RoomSelectionStep";

type CurrencyType = Database["public"]["Enums"]["currency_type"];
type Room = Database["public"]["Tables"]["rooms"]["Row"];

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

  // Sync payment currency with the first room selection's currency
  useEffect(() => {
    if (roomSelections.length > 0 && roomSelections[0].currency) {
      const newCurrency = roomSelections[0].currency as CurrencyType;
      if (newCurrency !== paymentData.currency) {
        setPaymentData((prev) => ({ ...prev, currency: newCurrency }));
      }
    }
  }, [roomSelections, paymentData.currency]);

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
            paymentData.currency,
            tenant?.id!,
            selectedLocation!
          );
          total += converted;
        } catch (error) {
          console.error("Currency conversion error:", error);
          total += selection.total_amount; // Fallback to original amount
        }
      }
    }
    return total;
  }, [roomSelections, paymentData.currency, tenant?.id, selectedLocation]);

  // State to store converted total amount
  const [convertedTotal, setConvertedTotal] = useState(0);

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
      const { data, error } = await supabase.rpc(
        "generate_reservation_number",
        {
          p_tenant_id: tenant?.id,
        }
      );

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
          Alert.alert("Validation Error", "Guest name is required");
          return false;
        }
        return true;
      }

      case "rooms": {
        if (roomSelections.length === 0) {
          Alert.alert("Validation Error", "Please select at least one room");
          return false;
        }
        // Validate that all room selections have room_id
        const invalidSelections = roomSelections.filter(
          (selection) => !selection.room_id
        );
        if (invalidSelections.length > 0) {
          Alert.alert(
            "Validation Error",
            "Please select a room for all room selections"
          );
          return false;
        }
        // Validate that all room selections have dates
        const missingDatesSelections = roomSelections.filter(
          (selection) => !selection.check_in_date || !selection.check_out_date
        );
        if (missingDatesSelections.length > 0) {
          Alert.alert(
            "Validation Error",
            "Please select check-in and check-out dates for all room selections"
          );
          return false;
        }
        // Validate room availability for all selections
        const unavailableSelections = roomSelections.filter((selection) => {
          const checkIn = new Date(selection.check_in_date);
          const checkOut = new Date(selection.check_out_date);
          return !isRangeAvailable(checkIn, checkOut, selection.room_id);
        });
        if (unavailableSelections.length > 0) {
          Alert.alert(
            "Room Unavailable",
            "One or more selected rooms are not available for the chosen dates. Please adjust your selection."
          );
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

        // Convert room amount to payment currency
        let convertedRoomAmount = selection.total_amount;
        let convertedAdvanceAmount = paymentData.advance_amount;

        if (selection.currency !== paymentData.currency) {
          try {
            convertedRoomAmount = await convertCurrency(
              selection.total_amount,
              selection.currency as any,
              paymentData.currency,
              tenant.id,
              selectedLocation
            );
          } catch (error) {
            console.error("Currency conversion error:", error);
          }
        }

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
          total_amount: convertedRoomAmount,
          advance_amount: convertedAdvanceAmount || 0,
          paid_amount: convertedAdvanceAmount || 0,
          balance_amount: convertedRoomAmount - (convertedAdvanceAmount || 0),
          currency: paymentData.currency,
          status: "tentative",
          special_requests: guestData.special_requests || null,
          booking_source: guestData.booking_source,
          created_by: user.id,
          booking_group_id: roomSelections.length > 1 ? bookingGroupId : null,
        };

        reservations.push(reservationData);
      }

      // Insert all reservations in a single transaction
      const { error } = await supabase
        .from("reservations")
        .insert(reservations);

      if (error) throw error;

      const reservationNumbers = reservations
        .map((r) => r.reservation_number)
        .join(", ");

      Alert.alert(
        "Success",
        `Reservation(s) ${reservationNumbers} created successfully`
      );

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
    setConvertedTotal(0);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "guest":
        return (
          <GuestInformationStep
            key={currentStep}
            guestData={guestData}
            onGuestDataChange={handleGuestDataChange}
          />
        );
      case "rooms":
        return (
          <RoomSelectionStep
            key={currentStep}
            rooms={rooms}
            roomSelections={roomSelections}
            onRoomSelectionsChange={setRoomSelections}
            defaultCurrency={paymentData.currency}
          />
        );
      case "pricing":
        return (
          <PricingStep
            key={currentStep}
            roomSelections={roomSelections}
            convertedTotal={convertedTotal}
            paymentCurrency={paymentData.currency}
          />
        );
      case "payment":
        return (
          <PaymentStep
            key={currentStep}
            paymentData={paymentData}
            onPaymentDataChange={handlePaymentDataChange}
            roomSelections={roomSelections}
            convertedTotal={convertedTotal}
          />
        );
      case "confirmation":
        return (
          <ConfirmationStep
            key={currentStep}
            guestData={guestData}
            roomSelections={roomSelections}
            paymentData={paymentData}
            convertedTotal={convertedTotal}
          />
        );
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
            <Text className="text-white text-lg font-semibold">
              Create New Reservation
            </Text>
            <Text className="text-blue-100 text-sm">
              Step {currentStepIndex + 1} of {STEPS.length}:{" "}
              {STEPS[currentStepIndex].title}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} className="p-1">
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Progress indicator */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-gray-50">
          {STEPS.map((step, index) => (
            <View key={step.id} className="flex-1 flex-row items-center">
              <View
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  index <= currentStepIndex ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    index <= currentStepIndex ? "text-white" : "text-gray-600"
                  }`}
                >
                  {index + 1}
                </Text>
              </View>
              {index < STEPS.length - 1 && (
                <View
                  className={`flex-1 h-0.5 mx-2 ${
                    index < currentStepIndex ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </View>
          ))}
        </View>

        {/* Step content */}
        <View className="flex-1">
          <ScrollView
            className="flex-1 px-4 py-4"
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View className="flex-1 justify-center items-center py-20">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-4 text-gray-600">Loading rooms...</Text>
              </View>
            ) : (
              renderCurrentStep()
            )}
          </ScrollView>
        </View>

        {/* Navigation buttons */}
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
                    {isLastStep
                      ? `Create Reservation${
                          roomSelections.length > 1 ? "s" : ""
                        }`
                      : "Next"}
                  </Text>
                  {!isLastStep && (
                    <Ionicons name="chevron-forward" size={16} color="white" />
                  )}
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
