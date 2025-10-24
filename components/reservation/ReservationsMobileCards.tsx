import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useLocationContext, useTenant } from "../../hooks";
import {
  type ReservationFinancial,
  useReservationFinancials,
} from "../../hooks/useReservationFinancials";
import type { Database } from "../../integrations/supabase/types";
import { getCurrencySymbol } from "../../utils/currency";
import { ReservationActions } from "./ReservationActions";

type Currency = Database["public"]["Enums"]["currency_type"];

interface ReservationsMobileCardsProps {
  searchQuery: string;
  statusFilter: string;
  selectedCurrency: Currency;
  onViewReservation: (id: string) => void;
  onEditReservation: (reservation: any) => void;
  onPayment: (reservationId: string, amount: number, currency: string) => void;
  onAddIncome: (reservation: any) => void;
}

export function ReservationsMobileCards({
  searchQuery,
  statusFilter,
  selectedCurrency,
  onViewReservation,
  onEditReservation,
  onPayment,
  onAddIncome,
}: ReservationsMobileCardsProps) {
  const { data: reservations, isLoading: loading } = useReservationFinancials();
  const { tenant } = useTenant();
  const { selectedLocation } = useLocationContext();

  // Note: Currency conversion is now handled by useReservationFinancials hook
  // All financial amounts are in USD from the hook

  // Utility functions
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      confirmed: "bg-green-100",
      pending: "bg-yellow-100",
      cancelled: "bg-red-100",
      checked_in: "bg-blue-100",
      checked_out: "bg-gray-100",
      tentative: "bg-orange-100",
    };
    return colors[status] || "bg-gray-100";
  };

  const getStatusTextColor = (status: string): string => {
    const colors: Record<string, string> = {
      confirmed: "text-green-800",
      pending: "text-yellow-800",
      cancelled: "text-red-800",
      checked_in: "text-blue-800",
      checked_out: "text-gray-800",
      tentative: "text-orange-800",
    };
    return colors[status] || "text-gray-800";
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      confirmed: "Confirmed",
      checked_in: "Checked In",
      checked_out: "Checked Out",
      cancelled: "Cancelled",
      tentative: "Tentative",
    };
    return statusMap[status?.toLowerCase()] || status;
  };

  const canShowPaymentButton = (reservation: any): boolean => {
    return (
      reservation.status !== "cancelled" && reservation.status !== "checked_out"
    );
  };

  const getTotalPayableAmount = (reservation: ReservationFinancial): number => {
    // Total payable in USD = room amount + expenses (from hook's USD calculations)
    return reservation.room_amount_usd + reservation.expenses_usd;
  };

  // Transform reservation data for printing (matching web app structure)
  const transformToPrintableData = (reservation: any) => {
    return {
      ...reservation,
      // Enhanced hotel/tenant information from context
      tenant_name: (tenant as any)?.hotel_name || tenant?.name,
      hotel_name: (tenant as any)?.hotel_name || tenant?.name,
      hotel_address: (tenant as any)?.hotel_address,
      hotel_phone: (tenant as any)?.hotel_phone,
      hotel_email: (tenant as any)?.hotel_email,
      hotel_website: (tenant as any)?.hotel_website,
      logo_url: (tenant as any)?.logo_url,

      // Enhanced location information
      location_name: reservation.locations?.name || "Unknown Location",
      location_address: reservation.locations?.address || null,
      location_phone: reservation.locations?.phone || null,
      location_email: reservation.locations?.email || null,

      // Room details
      room_number: reservation.rooms?.room_number || "Unknown Room",
      room_type: reservation.rooms?.room_type || "Unknown Type",
      bed_type: reservation.rooms?.bed_type || null,
      room_description: reservation.rooms?.description || null,
      amenities: reservation.rooms?.amenities || [],
    };
  };

  const handlePrintReservation = (reservation: any) => {
    const printableData = transformToPrintableData(reservation);
    // TODO: Implement mobile print functionality
    console.log("Print reservation:", printableData);
  };

  // Filter reservations
  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      searchQuery === "" ||
      reservation.reservation_number
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      reservation.guest_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || reservation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const renderReservationCard = ({ item: reservation }: { item: any }) => {
    return (
      <View className="mb-4 bg-white rounded-lg shadow-md p-4">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View>
            <Text className="font-semibold text-sm text-gray-800">
              {reservation.reservation_number}
            </Text>
            <Text className="text-xs text-gray-500">
              {reservation.guest_name}
            </Text>
          </View>
          <View
            className={`px-3 py-1 rounded-full ${getStatusColor(
              reservation.status
            )}`}
          >
            <Text
              className={`text-xs font-medium ${getStatusTextColor(
                reservation.status
              )}`}
            >
              {getStatusText(reservation.status)}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View className="space-y-2">
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={12} color="#6B7280" />
            <Text className="text-xs text-gray-600 ml-2">
              {reservation.rooms?.room_number} - {reservation.rooms?.room_type}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={12} color="#6B7280" />
            <Text className="text-xs text-gray-600 ml-2">
              {new Date(reservation.check_in_date).toLocaleDateString()} -{" "}
              {new Date(reservation.check_out_date).toLocaleDateString()}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="cash-outline" size={12} color="#6B7280" />
            <Text className="text-xs text-gray-600 ml-2">
              Room: {getCurrencySymbol("USD")}{" "}
              {reservation.room_amount_usd.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>

          {/* Additional Services / Expenses */}
          <View className="flex-row items-center">
            <Ionicons name="restaurant-outline" size={12} color="#6B7280" />
            <Text className="text-xs text-gray-600 ml-2">
              Expenses: {getCurrencySymbol("USD")}{" "}
              {reservation.expenses_usd.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>

          {/* Paid Amount */}
          <View className="flex-row items-center">
            <Ionicons
              name="checkmark-circle-outline"
              size={12}
              color="#10B981"
            />
            <Text className="text-xs text-green-600 ml-2">
              Paid: {getCurrencySymbol("USD")}{" "}
              {reservation.user_paid_amount_usd.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>

          {/* Balance / Needs to Pay */}
          <View className="flex-row items-center">
            <Ionicons
              name="alert-circle-outline"
              size={12}
              color={reservation.needs_to_pay_usd > 0 ? "#EF4444" : "#6B7280"}
            />
            <Text
              className={`text-xs ml-2 ${
                reservation.needs_to_pay_usd > 0
                  ? "text-red-600 font-semibold"
                  : "text-gray-600"
              }`}
            >
              Balance: {getCurrencySymbol("USD")}{" "}
              {reservation.needs_to_pay_usd.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <ReservationActions
          reservation={reservation}
          onView={() => onViewReservation(reservation.id)}
          onEdit={() => onEditReservation(reservation)}
          onPayment={() =>
            onPayment(
              reservation.id,
              getTotalPayableAmount(reservation),
              reservation.currency
            )
          }
          onAddIncome={() => onAddIncome(reservation)}
          onPrint={() => handlePrintReservation(reservation)}
          canShowPayment={canShowPaymentButton(reservation)}
          isMobile={true}
          showPaymentAndIncome={true}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-2">Loading reservations...</Text>
      </View>
    );
  }

  return (
    <View className="lg:hidden">
      <FlatList
        data={filteredReservations}
        keyExtractor={(item) => item.id}
        renderItem={renderReservationCard}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-8">
            <Text className="text-center text-gray-400 text-base">
              No reservations found.
            </Text>
          </View>
        }
      />
    </View>
  );
}
