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
import { useToast } from "../../hooks/useToast";
import { supabase } from "../../lib/supabase";

interface Reservation {
  id: string;
  reservation_number: string;
  guest_name: string;
  guest_email?: string;
  guest_phone?: string;
  guest_nationality?: string;
  adults: number;
  children: number;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  room_rate: number;
  total_amount: number;
  paid_amount?: number;
  balance_amount?: number;
  currency: string;
  status: string;
  special_requests?: string;
  arrival_time?: string;
  created_at: string;
  locations?: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  rooms?: {
    id: string;
    room_number: string;
    room_type: string;
    bed_type?: string;
    description?: string;
  };
  guides?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  agents?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
}

interface IncomeRecord {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: string;
  currency: string;
  date: string;
  note?: string;
}

interface ViewReservationDialogProps {
  visible: boolean;
  reservation: any; // Simple reservation from list
  onClose: () => void;
}

export function ViewReservationDialog({
  visible,
  reservation: simpleReservation,
  onClose,
}: ViewReservationDialogProps) {
  const { toast } = useToast();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [convertedAmounts, setConvertedAmounts] = useState({
    totalExpenses: 0,
    pendingExpenses: 0,
    paidExpenses: 0,
  });

  const fetchReservation = useCallback(async () => {
    if (!simpleReservation?.id) return;

    setLoading(true);
    try {
      const [reservationRes, incomeRes] = await Promise.all([
        supabase
          .from("reservations")
          .select(
            `
            *,
            locations (
              id,
              name,
              address,
              phone,
              email
            ),
            rooms (
              id,
              room_number,
              room_type,
              bed_type,
              description
            ),
            guides (
              id,
              name,
              phone,
              email
            ),
            agents (
              id,
              name,
              phone,
              email
            )
          `
          )
          .eq("id", simpleReservation.id)
          .single(),
        supabase
          .from("income")
          .select(
            `
            id,
            booking_id,
            amount,
            payment_method,
            currency,
            date,
            note
          `
          )
          .eq("booking_id", simpleReservation.id),
      ]);

      if (reservationRes.error) throw reservationRes.error;
      if (incomeRes.error) throw incomeRes.error;

      setReservation(reservationRes.data);
      setIncomeRecords(incomeRes.data || []);
    } catch (error) {
      console.error("Error fetching reservation:", error);
      Alert.alert("Error", "Failed to load reservation details");
    } finally {
      setLoading(false);
    }
  }, [simpleReservation?.id]);

  useEffect(() => {
    if (visible && simpleReservation?.id) {
      fetchReservation();
    }
  }, [visible, simpleReservation?.id, fetchReservation]);

  // Convert income amounts to reservation currency when data loads
  useEffect(() => {
    if (reservation && incomeRecords.length >= 0) {
      const convertAmounts = async () => {
        try {
          let totalExpenses = 0;
          let pendingExpenses = 0;
          let paidExpenses = 0;

          for (const income of incomeRecords) {
            // Simple conversion for mobile app
            let convertedAmount = Number(income.amount);
            if (income.currency !== reservation.currency) {
              if (income.currency === "LKR" && reservation.currency === "USD") {
                convertedAmount = convertedAmount / 300; // Simple LKR to USD
              } else if (
                income.currency === "USD" &&
                reservation.currency === "LKR"
              ) {
                convertedAmount = convertedAmount * 300; // Simple USD to LKR
              }
            }

            totalExpenses += convertedAmount;

            if (income.payment_method === "pending" || !income.payment_method) {
              pendingExpenses += convertedAmount;
            } else {
              paidExpenses += convertedAmount;
            }
          }

          setConvertedAmounts({
            totalExpenses: Math.round(totalExpenses * 100) / 100,
            pendingExpenses: Math.round(pendingExpenses * 100) / 100,
            paidExpenses: Math.round(paidExpenses * 100) / 100,
          });
        } catch (error) {
          console.error("Error converting income amounts:", error);
        }
      };

      convertAmounts();
    }
  }, [reservation, incomeRecords]);

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      LKR: "Rs.",
      USD: "$",
      EUR: "€",
      GBP: "£",
    };
    return symbols[currency] || currency;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: "bg-green-100 border-green-300 text-green-800",
      tentative: "bg-yellow-100 border-yellow-300 text-yellow-800",
      pending: "bg-orange-100 border-orange-300 text-orange-800",
      checked_in: "bg-blue-100 border-blue-300 text-blue-800",
      checked_out: "bg-gray-100 border-gray-300 text-gray-800",
      cancelled: "bg-red-100 border-red-300 text-red-800",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-gray-100 border-gray-300 text-gray-800"
    );
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      confirmed: "Confirmed",
      tentative: "Tentative",
      pending: "Pending",
      checked_in: "Checked In",
      checked_out: "Checked Out",
      cancelled: "Cancelled",
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getTotalBalance = () => {
    const roomBalance = reservation?.balance_amount || 0;
    const pendingExpenses = convertedAmounts.pendingExpenses;
    return roomBalance + pendingExpenses;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
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
              #{reservation?.reservation_number || simpleReservation?.id}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} className="p-1">
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0066cc" />
            <Text className="mt-2 text-gray-600">
              Loading reservation details...
            </Text>
          </View>
        ) : !reservation ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-600">Reservation not found</Text>
          </View>
        ) : (
          <ScrollView className="flex-1 px-4 py-4">
            {/* Status and Basic Info */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <View
                  className={`px-3 py-1 rounded-full border ${getStatusColor(
                    reservation.status
                  )}`}
                >
                  <Text className="text-xs font-medium">
                    {getStatusText(reservation.status)}
                  </Text>
                </View>
                <Text className="text-sm text-gray-500">
                  Created:{" "}
                  {new Date(reservation.created_at).toLocaleDateString()}
                </Text>
              </View>

              {reservation.locations && (
                <View className="flex-row items-center">
                  <Ionicons name="location" size={16} color="#6B7280" />
                  <Text className="text-sm text-gray-600 ml-1">
                    {reservation.locations.name}
                  </Text>
                </View>
              )}
            </View>

            {/* Guest Information */}
            <View className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="person" size={20} color="#374151" />
                <Text className="text-lg font-semibold ml-2">
                  Guest Information
                </Text>
              </View>

              <View className="space-y-2">
                <View className="flex-row">
                  <Text className="text-sm font-medium text-gray-700 w-20">
                    Name:
                  </Text>
                  <Text className="text-sm text-gray-900 flex-1">
                    {reservation.guest_name}
                  </Text>
                </View>

                {reservation.guest_email && (
                  <View className="flex-row">
                    <Text className="text-sm font-medium text-gray-700 w-20">
                      Email:
                    </Text>
                    <Text className="text-sm text-gray-900 flex-1">
                      {reservation.guest_email}
                    </Text>
                  </View>
                )}

                {reservation.guest_phone && (
                  <View className="flex-row">
                    <Text className="text-sm font-medium text-gray-700 w-20">
                      Phone:
                    </Text>
                    <Text className="text-sm text-gray-900 flex-1">
                      {reservation.guest_phone}
                    </Text>
                  </View>
                )}

                {reservation.guest_nationality && (
                  <View className="flex-row">
                    <Text className="text-sm font-medium text-gray-700 w-20">
                      Nationality:
                    </Text>
                    <Text className="text-sm text-gray-900 flex-1">
                      {reservation.guest_nationality}
                    </Text>
                  </View>
                )}

                <View className="flex-row">
                  <Text className="text-sm font-medium text-gray-700 w-20">
                    Guests:
                  </Text>
                  <Text className="text-sm text-gray-900 flex-1">
                    {reservation.adults} adult
                    {reservation.adults > 1 ? "s" : ""}
                    {reservation.children > 0 &&
                      `, ${reservation.children} child${
                        reservation.children > 1 ? "ren" : ""
                      }`}
                  </Text>
                </View>
              </View>
            </View>

            {/* Stay Details */}
            <View className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="calendar" size={20} color="#374151" />
                <Text className="text-lg font-semibold ml-2">Stay Details</Text>
              </View>

              <View className="space-y-2">
                <View className="flex-row">
                  <Text className="text-sm font-medium text-gray-700 w-24">
                    Check-in:
                  </Text>
                  <Text className="text-sm text-gray-900 flex-1">
                    {new Date(reservation.check_in_date).toLocaleDateString()}
                  </Text>
                </View>

                <View className="flex-row">
                  <Text className="text-sm font-medium text-gray-700 w-24">
                    Check-out:
                  </Text>
                  <Text className="text-sm text-gray-900 flex-1">
                    {new Date(reservation.check_out_date).toLocaleDateString()}
                  </Text>
                </View>

                <View className="flex-row">
                  <Text className="text-sm font-medium text-gray-700 w-24">
                    Nights:
                  </Text>
                  <Text className="text-sm text-gray-900 flex-1">
                    {reservation.nights}
                  </Text>
                </View>

                {reservation.arrival_time && (
                  <View className="flex-row">
                    <Text className="text-sm font-medium text-gray-700 w-24">
                      Arrival:
                    </Text>
                    <Text className="text-sm text-gray-900 flex-1">
                      {reservation.arrival_time}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Room Information */}
            <View className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="bed" size={20} color="#374151" />
                <Text className="text-lg font-semibold ml-2">
                  Room Information
                </Text>
              </View>

              <View className="space-y-2">
                <View className="flex-row">
                  <Text className="text-sm font-medium text-gray-700 w-20">
                    Room:
                  </Text>
                  <Text className="text-sm text-gray-900 flex-1">
                    {reservation.rooms?.room_number || "N/A"}
                  </Text>
                </View>

                <View className="flex-row">
                  <Text className="text-sm font-medium text-gray-700 w-20">
                    Type:
                  </Text>
                  <Text className="text-sm text-gray-900 flex-1">
                    {reservation.rooms?.room_type || "N/A"}
                  </Text>
                </View>

                {reservation.rooms?.bed_type && (
                  <View className="flex-row">
                    <Text className="text-sm font-medium text-gray-700 w-20">
                      Bed:
                    </Text>
                    <Text className="text-sm text-gray-900 flex-1">
                      {reservation.rooms.bed_type}
                    </Text>
                  </View>
                )}

                <View className="flex-row">
                  <Text className="text-sm font-medium text-gray-700 w-20">
                    Rate:
                  </Text>
                  <Text className="text-sm text-gray-900 flex-1">
                    {getCurrencySymbol(reservation.currency)}
                    {reservation.room_rate}/night
                  </Text>
                </View>
              </View>
            </View>

            {/* Payment Information */}
            <View className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="card" size={20} color="#374151" />
                <Text className="text-lg font-semibold ml-2">
                  Payment Information
                </Text>
              </View>

              <View className="space-y-2">
                <View className="flex-row">
                  <Text className="text-sm font-medium text-gray-700 w-24">
                    Total:
                  </Text>
                  <Text className="text-sm text-gray-900 flex-1">
                    {getCurrencySymbol(reservation.currency)}
                    {reservation.total_amount}
                  </Text>
                </View>

                <View className="flex-row">
                  <Text className="text-sm font-medium text-gray-700 w-24">
                    Paid:
                  </Text>
                  <Text className="text-sm text-gray-900 flex-1">
                    {getCurrencySymbol(reservation.currency)}
                    {reservation.paid_amount || 0}
                  </Text>
                </View>

                <View className="flex-row">
                  <Text className="text-sm font-medium text-gray-700 w-24">
                    Expenses:
                  </Text>
                  <Text className="text-sm text-gray-900 flex-1">
                    {getCurrencySymbol(reservation.currency)}
                    {convertedAmounts.totalExpenses}
                  </Text>
                </View>

                <View className="flex-row">
                  <Text className="text-sm font-medium text-gray-700 w-24">
                    Balance:
                  </Text>
                  <Text className="text-sm font-semibold text-red-600 flex-1">
                    {getCurrencySymbol(reservation.currency)}
                    {getTotalBalance().toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Special Requests */}
            {reservation.special_requests && (
              <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <View className="flex-row items-center mb-2">
                  <Ionicons
                    name="chatbubble-ellipses"
                    size={20}
                    color="#D97706"
                  />
                  <Text className="text-lg font-semibold ml-2 text-yellow-800">
                    Special Requests
                  </Text>
                </View>
                <Text className="text-sm text-yellow-700">
                  {reservation.special_requests}
                </Text>
              </View>
            )}

            {/* Income Records */}
            {incomeRecords.length > 0 && (
              <View className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="receipt" size={20} color="#374151" />
                  <Text className="text-lg font-semibold ml-2">
                    Payment History
                  </Text>
                </View>

                {incomeRecords.map((income) => (
                  <View
                    key={income.id}
                    className="flex-row justify-between items-center py-2 border-b border-gray-100"
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-gray-900">
                        {getCurrencySymbol(income.currency)}
                        {income.amount}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {new Date(income.date).toLocaleDateString()} •{" "}
                        {income.payment_method}
                      </Text>
                    </View>
                    {income.note && (
                      <Text
                        className="text-xs text-gray-500 ml-2"
                        numberOfLines={1}
                      >
                        {income.note}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Commission Details */}
            {(reservation.guides || reservation.agents) && (
              <View className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="people" size={20} color="#374151" />
                  <Text className="text-lg font-semibold ml-2">
                    Commission Details
                  </Text>
                </View>

                {reservation.guides && (
                  <View className="mb-2">
                    <Text className="text-sm font-medium text-gray-700">
                      Guide: {reservation.guides.name}
                    </Text>
                    {reservation.guides.phone && (
                      <Text className="text-xs text-gray-500">
                        {reservation.guides.phone}
                      </Text>
                    )}
                  </View>
                )}

                {reservation.agents && (
                  <View>
                    <Text className="text-sm font-medium text-gray-700">
                      Agent: {reservation.agents.name}
                    </Text>
                    {reservation.agents.phone && (
                      <Text className="text-xs text-gray-500">
                        {reservation.agents.phone}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        )}

        {/* Action Buttons */}
        <View className="px-4 py-4 border-t border-gray-200 bg-gray-50">
          <TouchableOpacity
            onPress={onClose}
            className="bg-gray-600 py-3 rounded-lg flex-row items-center justify-center"
          >
            <Ionicons name="close" size={16} color="white" />
            <Text className="text-white font-medium ml-2">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
