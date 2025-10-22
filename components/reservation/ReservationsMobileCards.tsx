import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useLocationContext, useTenant } from "../../hooks";
import { useReservationsData } from "../../hooks/useReservationsData";
import type { Database } from "../../integrations/supabase/types";
import { convertCurrency, getCurrencySymbol } from "../../utils/currency";
import { ReservationActions } from "./ReservationActions";
import { ReservationExpensesDisplay } from "./ReservationExpensesDisplay";

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
  const { reservations, loading } = useReservationsData();
  const { tenant } = useTenant();
  const { selectedLocation } = useLocationContext();

  // State for converted amounts
  const [convertedAmounts, setConvertedAmounts] = useState<
    Record<string, number>
  >({});

  // Effect to convert amounts when currency or reservations change
  useEffect(() => {
    if (!tenant?.id || !selectedLocation) {
      return;
    }

    const convertAmounts = async () => {
      if (!reservations.length) return;

      const newConvertedAmounts: Record<string, number> = {};

      for (const reservation of reservations) {
        const roomAmount = reservation.room_rate * reservation.nights;
        try {
          const convertedAmount = await convertCurrency(
            roomAmount,
            reservation.currency,
            selectedCurrency,
            tenant.id,
            selectedLocation
          );
          newConvertedAmounts[reservation.id] = convertedAmount;
        } catch (error) {
          console.error(
            `Failed to convert currency for reservation ${reservation.id}:`,
            error
          );
          newConvertedAmounts[reservation.id] = roomAmount; // Fallback to original amount
        }
      }

      setConvertedAmounts(newConvertedAmounts);
    };

    convertAmounts();
  }, [reservations, selectedCurrency, tenant?.id, selectedLocation]);

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

  const getTotalPayableAmount = (reservation: any): number => {
    // Use database-calculated total that includes room amount and pending services
    // The trigger already calculates: balance_amount = (total_amount + pending_income) - paid_amount
    // So total payable = total_amount + pending services = paid_amount + balance_amount
    return (reservation.paid_amount || 0) + (reservation.balance_amount || 0);
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
              Room: {getCurrencySymbol(selectedCurrency)}{" "}
              {(convertedAmounts[reservation.id] || 0).toLocaleString()}
            </Text>
          </View>

          {/* Additional Services */}
          <View className="flex-row items-center">
            <Ionicons name="cash-outline" size={12} color="#6B7280" />
            <View className="ml-2">
              <ReservationExpensesDisplay
                reservationId={reservation.id}
                currency={selectedCurrency}
                isCompact={true}
              />
            </View>
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
