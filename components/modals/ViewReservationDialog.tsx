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
import { convertCurrency, getCurrencySymbol } from "../../utils/currency";

interface Reservation {
  id: string;
  reservation_number: string;
  guest_name: string;
  guest_email?: string;
  guest_phone?: string;
  guest_address?: string;
  guest_nationality?: string;
  guest_passport_number?: string;
  guest_id_number?: string;
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
  booking_source?: string;
  created_at: string;
  tenant_id?: string;
  location_id: string;
  guide_commission?: number;
  agent_commission?: number;
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
    amenities?: string[];
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
    agency_name?: string;
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
            // Use proper currency conversion from utils
            const convertedAmount = await convertCurrency(
              Number(income.amount),
              income.currency,
              reservation.currency,
              reservation.tenant_id!,
              reservation.location_id
            );

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

  const getSymbol = (currency: string) => {
    return getCurrencySymbol(currency);
  };

  const getPendingExpenses = () => {
    return convertedAmounts.pendingExpenses;
  };

  const getTotalExpenses = () => {
    return convertedAmounts.totalExpenses;
  };

  const getPaidExpenses = () => {
    return convertedAmounts.paidExpenses;
  };

  const getTotalBalance = () => {
    // Balance = Room balance + Pending expenses
    // Room balance already accounts for paid room amount and paid additional services
    // We only need to add pending expenses that haven't been paid yet
    const roomBalance = reservation?.balance_amount || 0;
    const pendingExpenses = getPendingExpenses();
    return roomBalance + pendingExpenses;
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
                <View className="mb-2">
                  <Text className="text-xs font-medium text-gray-500 mb-1">
                    Name
                  </Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    {reservation.guest_name}
                  </Text>
                </View>

                {reservation.guest_email && (
                  <View className="mb-2">
                    <Text className="text-xs font-medium text-gray-500 mb-1">
                      Email
                    </Text>
                    <Text className="text-sm text-gray-900">
                      {reservation.guest_email}
                    </Text>
                  </View>
                )}

                {reservation.guest_phone && (
                  <View className="mb-2">
                    <Text className="text-xs font-medium text-gray-500 mb-1">
                      Phone
                    </Text>
                    <Text className="text-sm text-gray-900">
                      {reservation.guest_phone}
                    </Text>
                  </View>
                )}

                {reservation.guest_address && (
                  <View className="mb-2">
                    <Text className="text-xs font-medium text-gray-500 mb-1">
                      Address
                    </Text>
                    <Text className="text-sm text-gray-900">
                      {reservation.guest_address}
                    </Text>
                  </View>
                )}

                {reservation.guest_nationality && (
                  <View className="mb-2">
                    <Text className="text-xs font-medium text-gray-500 mb-1">
                      Nationality
                    </Text>
                    <Text className="text-sm text-gray-900">
                      {reservation.guest_nationality}
                    </Text>
                  </View>
                )}

                {reservation.guest_passport_number && (
                  <View className="mb-2">
                    <Text className="text-xs font-medium text-gray-500 mb-1">
                      Passport Number
                    </Text>
                    <Text className="text-sm text-gray-900">
                      {reservation.guest_passport_number}
                    </Text>
                  </View>
                )}

                {reservation.guest_id_number && (
                  <View className="mb-2">
                    <Text className="text-xs font-medium text-gray-500 mb-1">
                      ID Number
                    </Text>
                    <Text className="text-sm text-gray-900">
                      {reservation.guest_id_number}
                    </Text>
                  </View>
                )}

                <View className="flex-row gap-6 mt-2">
                  <View>
                    <Text className="text-xs font-medium text-gray-500 mb-1">
                      Adults
                    </Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {reservation.adults}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-xs font-medium text-gray-500 mb-1">
                      Children
                    </Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {reservation.children}
                    </Text>
                  </View>
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
                <View className="flex-row gap-4 mb-2">
                  <View className="flex-1">
                    <Text className="text-xs font-medium text-gray-500 mb-1">
                      Check-in
                    </Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {new Date(reservation.check_in_date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-medium text-gray-500 mb-1">
                      Check-out
                    </Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {new Date(reservation.check_out_date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <View className="mb-2">
                  <Text className="text-xs font-medium text-gray-500 mb-1">
                    Nights
                  </Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    {reservation.nights}
                  </Text>
                </View>

                {reservation.arrival_time && (
                  <View className="mb-2">
                    <Text className="text-xs font-medium text-gray-500 mb-1">
                      Arrival Time
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons name="time" size={14} color="#6B7280" />
                      <Text className="text-sm text-gray-900 ml-1">
                        {reservation.arrival_time}
                      </Text>
                    </View>
                  </View>
                )}

                {reservation.special_requests && (
                  <View className="mb-2">
                    <Text className="text-xs font-medium text-gray-500 mb-1">
                      Special Requests
                    </Text>
                    <Text className="text-sm text-gray-900">
                      {reservation.special_requests}
                    </Text>
                  </View>
                )}

                <View className="mb-2">
                  <Text className="text-xs font-medium text-gray-500 mb-1">
                    Booking Source
                  </Text>
                  <Text className="text-sm text-gray-900 capitalize">
                    {reservation.booking_source || "Direct"}
                  </Text>
                </View>
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

              {reservation.rooms ? (
                <View className="space-y-2">
                  <View className="mb-2">
                    <Text className="text-xs font-medium text-gray-500 mb-1">
                      Room Number
                    </Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {reservation.rooms.room_number}
                    </Text>
                  </View>

                  <View className="mb-2">
                    <Text className="text-xs font-medium text-gray-500 mb-1">
                      Room Type
                    </Text>
                    <Text className="text-sm text-gray-900">
                      {reservation.rooms.room_type}
                    </Text>
                  </View>

                  <View className="mb-2">
                    <Text className="text-xs font-medium text-gray-500 mb-1">
                      Bed Type
                    </Text>
                    <Text className="text-sm text-gray-900">
                      {reservation.rooms.bed_type}
                    </Text>
                  </View>

                  {reservation.rooms.description && (
                    <View className="mb-2">
                      <Text className="text-xs font-medium text-gray-500 mb-1">
                        Description
                      </Text>
                      <Text className="text-sm text-gray-900">
                        {reservation.rooms.description}
                      </Text>
                    </View>
                  )}

                  {reservation.rooms.amenities &&
                    reservation.rooms.amenities.length > 0 && (
                      <View className="mb-2">
                        <Text className="text-xs font-medium text-gray-500 mb-1">
                          Amenities
                        </Text>
                        <Text className="text-sm text-gray-900">
                          {reservation.rooms.amenities.join(", ")}
                        </Text>
                      </View>
                    )}
                </View>
              ) : (
                <Text className="text-sm text-gray-500">
                  Room information not available
                </Text>
              )}
            </View>

            {/* Pricing & Payment */}
            <View className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="cash" size={20} color="#374151" />
                <Text className="text-lg font-semibold ml-2">
                  Financial Details
                </Text>
              </View>

              <View className="space-y-2">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-xs font-medium text-gray-500">
                    Room Rate (per night)
                  </Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    {getSymbol(reservation.currency)}{" "}
                    {reservation.room_rate.toLocaleString()}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-xs font-medium text-gray-500">
                    Nights
                  </Text>
                  <Text className="text-sm text-gray-900">
                    × {reservation.nights}
                  </Text>
                </View>

                <View className="border-t border-gray-200 my-2" />

                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-xs font-medium text-gray-500">
                    Total Amount
                  </Text>
                  <Text className="text-sm font-bold text-gray-900">
                    {getSymbol(reservation.currency)}{" "}
                    {reservation.total_amount.toLocaleString()}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-xs font-medium text-gray-500">
                    Paid Amount
                  </Text>
                  <Text className="text-sm font-semibold text-emerald-600">
                    {getSymbol(reservation.currency)}{" "}
                    {(reservation.paid_amount || 0).toLocaleString()}
                  </Text>
                </View>

                {getPaidExpenses() > 0 && (
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-xs font-medium text-gray-500">
                      Paid Additional Services
                    </Text>
                    <Text className="text-sm text-emerald-600">
                      {getSymbol(reservation.currency)}{" "}
                      {getPaidExpenses().toLocaleString()}
                    </Text>
                  </View>
                )}

                {getPendingExpenses() > 0 && (
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-xs font-medium text-gray-500">
                      Pending Additional Services
                    </Text>
                    <Text className="text-sm text-orange-600">
                      {getSymbol(reservation.currency)}{" "}
                      {getPendingExpenses().toLocaleString()}
                    </Text>
                  </View>
                )}

                <View className="border-t border-gray-200 my-2" />

                <View className="flex-row justify-between items-center">
                  <Text className="text-sm font-semibold text-gray-900">
                    Balance Due
                  </Text>
                  <Text
                    className={`text-base font-bold ${
                      getTotalBalance() > 0 ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {getSymbol(reservation.currency)}{" "}
                    {getTotalBalance().toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Commission Details (if applicable) */}
            {(reservation.guides || reservation.agents) && (
              <View className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="people" size={20} color="#374151" />
                  <Text className="text-lg font-semibold ml-2">
                    Commission Details
                  </Text>
                </View>

                <View className="flex-row flex-wrap gap-4">
                  {reservation.guides && (
                    <View className="flex-1 min-w-[140px]">
                      <Text className="text-xs font-medium text-gray-500 mb-1">
                        Guide
                      </Text>
                      <Text className="text-sm font-semibold text-gray-900">
                        {reservation.guides.name}
                      </Text>
                      {reservation.guide_commission && (
                        <Text className="text-sm text-gray-600 mt-1">
                          Commission: {getSymbol(reservation.currency)}{" "}
                          {reservation.guide_commission.toLocaleString()}
                        </Text>
                      )}
                    </View>
                  )}

                  {reservation.agents && (
                    <View className="flex-1 min-w-[140px]">
                      <Text className="text-xs font-medium text-gray-500 mb-1">
                        Agent
                      </Text>
                      <Text className="text-sm font-semibold text-gray-900">
                        {reservation.agents.name}
                      </Text>
                      {reservation.agents.agency_name && (
                        <Text className="text-xs text-gray-500">
                          {reservation.agents.agency_name}
                        </Text>
                      )}
                      {reservation.agent_commission && (
                        <Text className="text-sm text-gray-600 mt-1">
                          Commission: {getSymbol(reservation.currency)}{" "}
                          {reservation.agent_commission.toLocaleString()}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
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
