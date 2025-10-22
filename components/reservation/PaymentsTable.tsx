import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePaymentsData } from "../../hooks";

export function PaymentsTable() {
  const { payments, loading, refetch } = usePaymentsData();

  // Utility functions
  const getCurrencySymbol = (currency: string): string => {
    const symbols: Record<string, string> = {
      LKR: "Rs.",
      USD: "$",
      EUR: "€",
      GBP: "£",
    };
    return symbols[currency] || currency;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${getCurrencySymbol(currency)} ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateRange = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn || !checkOut) return "-";
    const checkInDate = new Date(checkIn).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const checkOutDate = new Date(checkOut).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return `${checkInDate} - ${checkOutDate}`;
  };

  const getPaymentMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      cash: "bg-green-100",
      card: "bg-blue-100",
      bank_transfer: "bg-purple-100",
      online: "bg-orange-100",
      cheque: "bg-gray-100",
    };
    return colors[method] || "bg-gray-100";
  };

  const getPaymentMethodTextColor = (method: string) => {
    const colors: Record<string, string> = {
      cash: "text-green-800",
      card: "text-blue-800",
      bank_transfer: "text-purple-800",
      online: "text-orange-800",
      cheque: "text-gray-800",
    };
    return colors[method] || "text-gray-800";
  };

  const getPaymentTypeColor = (type: string, isAdvance: boolean) => {
    if (isAdvance) {
      return "bg-yellow-100";
    }
    const colors: Record<string, string> = {
      room_charge: "bg-blue-100",
      additional_service: "bg-purple-100",
      commission: "bg-green-100",
      other: "bg-gray-100",
    };
    return colors[type] || "bg-gray-100";
  };

  const getPaymentTypeTextColor = (type: string, isAdvance: boolean) => {
    if (isAdvance) {
      return "text-yellow-800";
    }
    const colors: Record<string, string> = {
      room_charge: "text-blue-800",
      additional_service: "text-purple-800",
      commission: "text-green-800",
      other: "text-gray-800",
    };
    return colors[type] || "text-gray-800";
  };

  const renderPaymentCard = ({ item }: { item: any }) => {
    return (
      <View className="mb-4 bg-white rounded-lg shadow-md p-4">
        {/* Header: Date and Amount */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-2">
              {formatDate(item.date)}
            </Text>
          </View>
          <View>
            <Text className="text-base font-semibold text-green-600 text-right">
              {formatCurrency(item.amount, item.currency)}
            </Text>
            {item.is_advance && (
              <Text className="text-xs text-yellow-600 mt-1">
                Advance Payment
              </Text>
            )}
          </View>
        </View>

        {/* Type and Method Badges */}
        <View className="flex-row flex-wrap gap-2 mb-3">
          <View
            className={`px-3 py-1 rounded-full ${getPaymentTypeColor(
              item.type,
              item.is_advance
            )}`}
          >
            <Text
              className={`text-xs font-medium ${getPaymentTypeTextColor(
                item.type,
                item.is_advance
              )}`}
            >
              {item.type.replace("_", " ").toUpperCase()}
            </Text>
          </View>
          <View
            className={`px-3 py-1 rounded-full ${getPaymentMethodColor(
              item.payment_method
            )}`}
          >
            <Text
              className={`text-xs font-medium ${getPaymentMethodTextColor(
                item.payment_method
              )}`}
            >
              {item.payment_method.replace("_", " ").toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Details Section */}
        <View className="space-y-2">
          {/* Account */}
          <View className="flex-row items-center">
            <Ionicons name="business-outline" size={14} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-2">
              {item.account_name || "N/A"}
            </Text>
          </View>

          {/* Reservation Info */}
          {item.reservation_number && (
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-600">
                Reservation: {item.reservation_number}
              </Text>
            </View>
          )}

          {/* Guest Name */}
          {item.guest_name && (
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-600">
                Guest: {item.guest_name}
              </Text>
            </View>
          )}

          {/* Room */}
          {item.room_number && (
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-2">
                Room: {item.room_number}
              </Text>
            </View>
          )}

          {/* Stay Period */}
          {item.check_in_date && item.check_out_date && (
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-600">
                Stay: {formatDateRange(item.check_in_date, item.check_out_date)}
              </Text>
            </View>
          )}

          {/* Note */}
          {item.note && (
            <View className="mt-2 p-2 bg-gray-50 rounded">
              <Text className="text-xs text-gray-600">{item.note}</Text>
            </View>
          )}
        </View>

        {/* Action Button */}
        {item.booking_id && (
          <View className="mt-3 pt-3 border-t border-gray-100">
            <TouchableOpacity
              className="flex-row items-center justify-center px-4 py-2 bg-blue-100 rounded-lg"
              onPress={() => {
                // Navigation logic here
                console.log("View reservation:", item.booking_id);
              }}
            >
              <Ionicons name="eye-outline" size={16} color="#1E40AF" />
              <Text className="text-blue-700 text-sm font-medium ml-2">
                View Reservation
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-2">Loading payments...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-5 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="card-outline" size={24} color="#3B82F6" />
            <Text className="text-lg font-semibold text-gray-900 ml-3">
              Payments & Income
            </Text>
          </View>
          <View className="px-3 py-1 bg-gray-100 rounded-full">
            <Text className="text-sm font-medium text-gray-700">
              {payments.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      {payments.length === 0 ? (
        <View className="flex-1 justify-center items-center p-8">
          <Ionicons name="card-outline" size={48} color="#9CA3AF" />
          <Text className="text-center text-gray-900 font-medium text-base mt-4">
            No payments found
          </Text>
          <Text className="text-center text-gray-500 text-sm mt-2">
            Payments will appear here when income is recorded for reservations.
          </Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={renderPaymentCard}
          refreshing={loading}
          onRefresh={refetch}
        />
      )}
    </View>
  );
}
