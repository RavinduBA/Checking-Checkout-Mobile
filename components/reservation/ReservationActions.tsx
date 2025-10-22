import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { OTPVerification } from "../auth/OTPVerification";

type ReservationForActions = {
  id: string;
  reservation_number: string;
  location_id: string;
  room_id: string;
  guest_name: string;
  guest_email?: string | null;
  guest_phone?: string | null;
  guest_address?: string | null;
  guest_id_number?: string | null;
  guest_nationality?: string | null;
  adults: number;
  children: number;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  room_rate: number;
  total_amount: number;
  advance_amount?: number | null;
  paid_amount?: number | null;
  balance_amount?: number | null;
  currency: "LKR" | "USD" | "EUR" | "GBP";
  status:
    | "pending"
    | "confirmed"
    | "checked_in"
    | "checked_out"
    | "cancelled"
    | "tentative";
  special_requests?: string | null;
  arrival_time?: string | null;
  created_by?: string | null;
  grc_approved: boolean;
  grc_approved_by?: string | null;
  grc_approved_at?: string | null;
  created_at: string;
  updated_at: string;
  tenant_id?: string | null;
  guide_id?: string | null;
  agent_id?: string | null;
  guide_commission?: number | null;
  agent_commission?: number | null;
  booking_source: string;
};

interface ReservationActionsProps {
  reservation: ReservationForActions;
  onView: () => void;
  onEdit: () => void;
  onPayment?: () => void;
  onAddIncome?: () => void;
  onPrint?: () => void;
  canShowPayment: boolean;
  isMobile?: boolean;
  showPaymentAndIncome?: boolean;
}

export function ReservationActions({
  reservation,
  onView,
  onEdit,
  onPayment,
  onAddIncome,
  onPrint,
  canShowPayment,
  isMobile = false,
  showPaymentAndIncome = true,
}: ReservationActionsProps) {
  // Disable income and payment actions when reservation is checked out (complete)
  const isReservationComplete =
    reservation.status === "checked_out" || reservation.status === "confirmed";

  if (isMobile) {
    return (
      <View className="flex-row gap-2 mt-4">
        <TouchableOpacity
          onPress={onView}
          className="flex-1 flex-row items-center justify-center border border-gray-300 rounded-md py-2 px-3 bg-white"
        >
          <Ionicons name="eye-outline" size={16} color="#374151" />
          <Text className="text-sm text-gray-700 ml-1">View</Text>
        </TouchableOpacity>

        {onPrint && (
          <TouchableOpacity
            onPress={onPrint}
            className="border border-gray-300 rounded-md py-2 px-3 bg-white"
          >
            <Ionicons name="print-outline" size={16} color="#374151" />
          </TouchableOpacity>
        )}

        {showPaymentAndIncome &&
          (isReservationComplete ? (
            <View className="border border-gray-300 rounded-md py-2 px-3 bg-gray-100 flex-row items-center">
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="#10B981"
              />
              <Text className="text-xs text-green-600 ml-1 hidden sm:flex">
                Reservation Completed
              </Text>
            </View>
          ) : (
            <>
              {onAddIncome && (
                <TouchableOpacity
                  onPress={onAddIncome}
                  className="border border-gray-300 rounded-md py-2 px-3 bg-white"
                >
                  <Ionicons name="cash-outline" size={16} color="#3B82F6" />
                </TouchableOpacity>
              )}
              {canShowPayment && onPayment && (
                <TouchableOpacity
                  onPress={onPayment}
                  className="border border-gray-300 rounded-md py-2 px-3 bg-white"
                >
                  <Ionicons name="card-outline" size={16} color="#10B981" />
                </TouchableOpacity>
              )}
            </>
          ))}

        <OTPVerification
          onVerified={onEdit}
          phoneNumber={reservation.guest_phone || ""}
          locationId={reservation.location_id}
          triggerComponent={
            <TouchableOpacity className="border border-gray-300 rounded-md py-2 px-3 bg-white">
              <Ionicons name="create-outline" size={16} color="#374151" />
            </TouchableOpacity>
          }
        />
      </View>
    );
  }

  // Desktop version - would use a menu component if needed
  return (
    <View className="flex-row gap-2">
      <TouchableOpacity
        onPress={onView}
        className="border border-gray-300 rounded-md py-2 px-3 bg-white"
      >
        <Ionicons name="eye-outline" size={16} color="#374151" />
      </TouchableOpacity>

      {onPrint && (
        <TouchableOpacity
          onPress={onPrint}
          className="border border-gray-300 rounded-md py-2 px-3 bg-white"
        >
          <Ionicons name="print-outline" size={16} color="#374151" />
        </TouchableOpacity>
      )}

      {showPaymentAndIncome && !isReservationComplete && (
        <>
          {onAddIncome && (
            <TouchableOpacity
              onPress={onAddIncome}
              className="border border-gray-300 rounded-md py-2 px-3 bg-white"
            >
              <Ionicons name="cash-outline" size={16} color="#3B82F6" />
            </TouchableOpacity>
          )}
          {canShowPayment && onPayment && (
            <TouchableOpacity
              onPress={onPayment}
              className="border border-gray-300 rounded-md py-2 px-3 bg-white"
            >
              <Ionicons name="card-outline" size={16} color="#10B981" />
            </TouchableOpacity>
          )}
        </>
      )}

      <OTPVerification
        onVerified={onEdit}
        phoneNumber={reservation.guest_phone || ""}
        locationId={reservation.location_id}
        triggerComponent={
          <TouchableOpacity className="border border-gray-300 rounded-md py-2 px-3 bg-white">
            <Ionicons name="create-outline" size={16} color="#374151" />
          </TouchableOpacity>
        }
      />
    </View>
  );
}
