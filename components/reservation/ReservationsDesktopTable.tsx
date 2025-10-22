import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useLocationContext, useTenant } from "../../hooks";
import { useReservationsData } from "../../hooks/useReservationsData";
import type { Database } from "../../integrations/supabase/types";
import { convertCurrency, getCurrencySymbol } from "../../utils/currency";
import { ReservationActions } from "./ReservationActions";

type Currency = Database["public"]["Enums"]["currency_type"];

interface ReservationsDesktopTableProps {
  searchQuery: string;
  statusFilter: string;
  selectedCurrency: Currency;
  onViewReservation: (id: string) => void;
  onEditReservation: (reservation: any) => void;
  onPayment: (reservationId: string, amount: number, currency: string) => void;
  onAddIncome: (reservation: any) => void;
  onPrint: (reservation: any) => void;
}

export function ReservationsDesktopTable({
  searchQuery,
  statusFilter,
  selectedCurrency,
  onViewReservation,
  onEditReservation,
  onPayment,
  onAddIncome,
  onPrint,
}: ReservationsDesktopTableProps) {
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
    return (reservation.paid_amount || 0) + (reservation.balance_amount || 0);
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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-2">Loading reservations...</Text>
      </View>
    );
  }

  return (
    <View className="hidden lg:flex">
      <ScrollView horizontal>
        <View className="min-w-full">
          {/* Table Header */}
          <View className="flex-row bg-gray-50 border-b border-gray-200 p-3">
            <Text className="w-32 font-semibold text-xs text-gray-700">
              Reservation #
            </Text>
            <Text className="w-40 font-semibold text-xs text-gray-700">
              Guest
            </Text>
            <Text className="w-32 font-semibold text-xs text-gray-700">
              Room
            </Text>
            <Text className="w-40 font-semibold text-xs text-gray-700">
              Check In - Out
            </Text>
            <Text className="w-24 font-semibold text-xs text-gray-700">
              Status
            </Text>
            <Text className="w-32 font-semibold text-xs text-gray-700">
              Total Amount
            </Text>
            <Text className="w-32 font-semibold text-xs text-gray-700">
              Paid
            </Text>
            <Text className="w-32 font-semibold text-xs text-gray-700">
              Balance
            </Text>
            <Text className="w-40 font-semibold text-xs text-gray-700">
              Actions
            </Text>
          </View>

          {/* Table Body */}
          <ScrollView>
            {filteredReservations.map((reservation) => (
              <View
                key={reservation.id}
                className="flex-row border-b border-gray-200 p-3 bg-white"
              >
                <Text className="w-32 text-sm text-gray-900">
                  {reservation.reservation_number}
                </Text>
                <Text className="w-40 text-sm text-gray-900">
                  {reservation.guest_name}
                </Text>
                <Text className="w-32 text-sm text-gray-600">
                  {reservation.rooms?.room_number}
                </Text>
                <Text className="w-40 text-xs text-gray-600">
                  {new Date(reservation.check_in_date).toLocaleDateString()} -{" "}
                  {new Date(reservation.check_out_date).toLocaleDateString()}
                </Text>
                <View className="w-24">
                  <View
                    className={`px-2 py-1 rounded-full ${getStatusColor(
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
                <Text className="w-32 text-sm text-gray-900">
                  {getCurrencySymbol(selectedCurrency as any)}{" "}
                  {(convertedAmounts[reservation.id] || 0).toLocaleString()}
                </Text>
                <Text className="w-32 text-sm text-green-600">
                  {getCurrencySymbol(selectedCurrency as any)}{" "}
                  {(reservation.paid_amount || 0).toLocaleString()}
                </Text>
                <Text className="w-32 text-sm text-red-600">
                  {getCurrencySymbol(selectedCurrency as any)}{" "}
                  {(reservation.balance_amount || 0).toLocaleString()}
                </Text>
                <View className="w-40">
                  <ReservationActions
                    reservation={reservation as any}
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
                    onPrint={() => onPrint(reservation)}
                    canShowPayment={canShowPaymentButton(reservation)}
                    isMobile={false}
                    showPaymentAndIncome={true}
                  />
                </View>
              </View>
            ))}
          </ScrollView>

          {filteredReservations.length === 0 && (
            <View className="flex-1 justify-center items-center p-8">
              <Text className="text-center text-gray-400 text-base">
                No reservations found.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
