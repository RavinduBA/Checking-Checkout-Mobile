import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Reservation } from "../../hooks/useReservationsData";
import { getCurrencySymbol } from "../../lib/currencies";

interface ReservationsMobileCardsProps {
  reservations: Reservation[];
  loading: boolean;
  searchQuery: string;
  statusFilter: string;
  selectedCurrency: "LKR" | "USD";
  onRefresh: () => void;
  refreshing: boolean;
  onViewReservation: (id: string) => void;
  onEditReservation: (reservation: Reservation) => void;
  onPayment: (reservationId: string, amount: number, currency: string) => void;
  onAddIncome: (reservation: Reservation) => void;
  onPrint?: (reservation: Reservation) => void;
}

export function ReservationsMobileCards({
  reservations,
  loading,
  searchQuery,
  statusFilter,
  selectedCurrency,
  onRefresh,
  refreshing,
  onViewReservation,
  onEditReservation,
  onPayment,
  onAddIncome,
  onPrint,
}: ReservationsMobileCardsProps) {
  // Filter reservations based on search and status
  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.guest_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      reservation.reservation_number
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      reservation.rooms?.room_number
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || reservation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "checked_in":
        return "bg-blue-100 text-blue-800";
      case "checked_out":
        return "bg-gray-100 text-gray-800";
      case "tentative":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateBalance = (reservation: Reservation) => {
    return reservation.total_amount - reservation.paid_amount;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderReservationCard = ({
    item: reservation,
  }: {
    item: Reservation;
  }) => {
    const balance = calculateBalance(reservation);
    const currencySymbol = getCurrencySymbol(
      reservation.currency as "LKR" | "USD"
    );

    return (
      <View className="mx-4 mb-4 bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <View className="p-4 border-b border-gray-100">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">
                {reservation.guest_name}
              </Text>
              <Text className="text-sm text-gray-500">
                #{reservation.reservation_number}
              </Text>
            </View>
            <View
              className={`px-2 py-1 rounded-full ${getStatusColor(
                reservation.status
              )}`}
            >
              <Text className="text-xs font-medium capitalize">
                {reservation.status.replace("_", " ")}
              </Text>
            </View>
          </View>
        </View>

        {/* Details */}
        <View className="p-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="bed-outline" size={16} color="#6B7280" />
            <Text className="ml-2 text-sm text-gray-600">
              Room {reservation.rooms?.room_number} -{" "}
              {reservation.rooms?.room_type}
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text className="ml-2 text-sm text-gray-600">
              {formatDate(reservation.check_in_date)} -{" "}
              {formatDate(reservation.check_out_date)}
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Ionicons name="people-outline" size={16} color="#6B7280" />
            <Text className="ml-2 text-sm text-gray-600">
              {reservation.adults} Adults
              {reservation.children > 0
                ? `, ${reservation.children} Children`
                : ""}
            </Text>
          </View>

          <View className="flex-row items-center mb-3">
            <Ionicons name="card-outline" size={16} color="#6B7280" />
            <Text className="ml-2 text-sm text-gray-600">
              Total: {currencySymbol}
              {reservation.total_amount.toLocaleString()} | Paid:{" "}
              {currencySymbol}
              {reservation.paid_amount.toLocaleString()} |{" "}
              <Text
                className={
                  balance > 0
                    ? "text-red-600 font-medium"
                    : "text-green-600 font-medium"
                }
              >
                Balance: {currencySymbol}
                {Math.abs(balance).toLocaleString()}
              </Text>
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row flex-wrap gap-2">
            <TouchableOpacity
              onPress={() => onViewReservation(reservation.id)}
              className="flex-1 min-w-[80px] bg-blue-50 border border-blue-200 rounded-lg py-2 px-3"
            >
              <Text className="text-blue-700 text-xs font-medium text-center">
                View
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onEditReservation(reservation)}
              className="flex-1 min-w-[80px] bg-green-50 border border-green-200 rounded-lg py-2 px-3"
            >
              <Text className="text-green-700 text-xs font-medium text-center">
                Edit
              </Text>
            </TouchableOpacity>

            {balance > 0 && (
              <TouchableOpacity
                onPress={() =>
                  onPayment(reservation.id, balance, reservation.currency)
                }
                className="flex-1 min-w-[80px] bg-yellow-50 border border-yellow-200 rounded-lg py-2 px-3"
              >
                <Text className="text-yellow-700 text-xs font-medium text-center">
                  Payment
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => onAddIncome(reservation)}
              className="flex-1 min-w-[80px] bg-purple-50 border border-purple-200 rounded-lg py-2 px-3"
            >
              <Text className="text-purple-700 text-xs font-medium text-center">
                Add Income
              </Text>
            </TouchableOpacity>

            {onPrint && (
              <TouchableOpacity
                onPress={() => onPrint(reservation)}
                className="flex-1 min-w-[80px] bg-gray-50 border border-gray-200 rounded-lg py-2 px-3"
              >
                <Text className="text-gray-700 text-xs font-medium text-center">
                  Print
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">Loading reservations...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={filteredReservations}
      renderItem={renderReservationCard}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View className="flex-1 justify-center items-center p-8">
          <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
          <Text className="text-gray-500 text-lg font-medium mt-4">
            No reservations found
          </Text>
          <Text className="text-gray-400 text-center mt-2">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Reservations will appear here once created"}
          </Text>
        </View>
      }
    />
  );
}
