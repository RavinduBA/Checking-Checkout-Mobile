import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Reservation } from "../../hooks/useReservationsData";
import { formatCurrency } from "../../utils/currency";

interface ViewDialogProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (reservation: Reservation) => void;
  onCheckIn: (reservation: Reservation) => void;
  onCheckOut: (reservation: Reservation) => void;
  onCancel: (reservation: Reservation) => void;
  onAddPayment: (reservation: Reservation) => void;
  selectedCurrency: "LKR" | "USD";
}

export function ViewDialog({
  reservation,
  isOpen,
  onClose,
  onEdit,
  onCheckIn,
  onCheckOut,
  onCancel,
  onAddPayment,
  selectedCurrency,
}: ViewDialogProps) {
  if (!reservation) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "tentative":
        return "text-yellow-600 bg-yellow-100";
      case "confirmed":
        return "text-green-600 bg-green-100";
      case "checked_in":
        return "text-blue-600 bg-blue-100";
      case "checked_out":
        return "text-gray-600 bg-gray-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalAmount = reservation.total_amount || 0;
  const paidAmount = reservation.paid_amount || 0;
  const remainingAmount = totalAmount - paidAmount;

  const handleAction = (action: () => void, actionName: string) => {
    Alert.alert(
      `${actionName} Reservation`,
      `Are you sure you want to ${actionName.toLowerCase()} this reservation?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: actionName, onPress: action },
      ]
    );
  };

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
          <View className="flex-1">
            <Text className="text-white text-lg font-semibold">
              Reservation Details
            </Text>
            <Text className="text-blue-100 text-sm">
              {reservation.reservation_number}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} className="p-1">
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1">
          {/* Status */}
          <View className="px-4 py-3 border-b border-gray-200">
            <View
              className={`self-start px-3 py-1 rounded-full ${getStatusColor(
                reservation.status
              )}`}
            >
              <Text className="text-sm font-medium capitalize">
                {reservation.status.replace("_", " ")}
              </Text>
            </View>
          </View>

          {/* Guest Information */}
          <View className="px-4 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Guest Information
            </Text>
            <View className="space-y-2">
              <View className="flex-row items-center">
                <Ionicons name="person" size={16} color="#6B7280" />
                <Text className="ml-2 text-gray-700">
                  {reservation.guest_name}
                </Text>
              </View>
              {reservation.guest_email && (
                <View className="flex-row items-center">
                  <Ionicons name="mail" size={16} color="#6B7280" />
                  <Text className="ml-2 text-gray-700">
                    {reservation.guest_email}
                  </Text>
                </View>
              )}
              {reservation.guest_phone && (
                <View className="flex-row items-center">
                  <Ionicons name="call" size={16} color="#6B7280" />
                  <Text className="ml-2 text-gray-700">
                    {reservation.guest_phone}
                  </Text>
                </View>
              )}
              <View className="flex-row items-center">
                <Ionicons name="people" size={16} color="#6B7280" />
                <Text className="ml-2 text-gray-700">
                  {reservation.adults} adults
                  {reservation.children > 0 &&
                    `, ${reservation.children} children`}
                </Text>
              </View>
            </View>
          </View>

          {/* Reservation Details */}
          <View className="px-4 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Reservation Details
            </Text>
            <View className="space-y-2">
              <View className="flex-row items-center">
                <Ionicons name="bed" size={16} color="#6B7280" />
                <Text className="ml-2 text-gray-700">
                  {reservation.rooms?.room_number || "Room not assigned"}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={16} color="#6B7280" />
                <Text className="ml-2 text-gray-700">
                  {formatDate(reservation.check_in_date)} -{" "}
                  {formatDate(reservation.check_out_date)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="time" size={16} color="#6B7280" />
                <Text className="ml-2 text-gray-700">
                  {reservation.nights} nights
                </Text>
              </View>
              {reservation.created_at && (
                <View className="flex-row items-center">
                  <Ionicons name="create" size={16} color="#6B7280" />
                  <Text className="ml-2 text-gray-700">
                    Created: {formatDateTime(reservation.created_at)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Financial Information */}
          <View className="px-4 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Financial Details
            </Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Total Amount:</Text>
                <Text className="font-semibold text-gray-900">
                  {formatCurrency(totalAmount, selectedCurrency)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Paid Amount:</Text>
                <Text className="font-semibold text-green-600">
                  {formatCurrency(paidAmount, selectedCurrency)}
                </Text>
              </View>
              <View className="flex-row justify-between border-t border-gray-200 pt-2">
                <Text className="text-gray-600">Remaining:</Text>
                <Text
                  className={`font-semibold ${
                    remainingAmount > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatCurrency(remainingAmount, selectedCurrency)}
                </Text>
              </View>
            </View>
          </View>

          {/* Notes */}
          {reservation.special_requests && (
            <View className="px-4 py-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Special Requests
              </Text>
              <Text className="text-gray-700 leading-5">
                {reservation.special_requests}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View className="px-4 py-4 border-t border-gray-200 bg-gray-50">
          <View className="flex-row gap-2 mb-3">
            <TouchableOpacity
              onPress={() => onEdit(reservation)}
              className="flex-1 bg-blue-600 py-3 rounded-lg flex-row items-center justify-center"
            >
              <Ionicons name="create" size={16} color="white" />
              <Text className="text-white font-medium ml-2">Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onAddPayment(reservation)}
              className="flex-1 bg-green-600 py-3 rounded-lg flex-row items-center justify-center"
            >
              <Ionicons name="card" size={16} color="white" />
              <Text className="text-white font-medium ml-2">Payment</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-2">
            {reservation.status === "confirmed" && (
              <TouchableOpacity
                onPress={() =>
                  handleAction(() => onCheckIn(reservation), "Check In")
                }
                className="flex-1 bg-yellow-600 py-3 rounded-lg flex-row items-center justify-center"
              >
                <Ionicons name="log-in" size={16} color="white" />
                <Text className="text-white font-medium ml-2">Check In</Text>
              </TouchableOpacity>
            )}

            {reservation.status === "checked_in" && (
              <TouchableOpacity
                onPress={() =>
                  handleAction(() => onCheckOut(reservation), "Check Out")
                }
                className="flex-1 bg-gray-600 py-3 rounded-lg flex-row items-center justify-center"
              >
                <Ionicons name="log-out" size={16} color="white" />
                <Text className="text-white font-medium ml-2">Check Out</Text>
              </TouchableOpacity>
            )}

            {!["cancelled", "checked_out"].includes(reservation.status) && (
              <TouchableOpacity
                onPress={() =>
                  handleAction(() => onCancel(reservation), "Cancel")
                }
                className="flex-1 bg-red-600 py-3 rounded-lg flex-row items-center justify-center"
              >
                <Ionicons name="close-circle" size={16} color="white" />
                <Text className="text-white font-medium ml-2">Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
