import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePermissions } from "../../hooks/usePermissions";
import { TimelineView } from "../calendar";
import { NewReservationDialog } from "../modals";
import type { Database } from "../../integrations/supabase/types";

type Room = Database["public"]["Tables"]["rooms"]["Row"];

// Helper to add/subtract months
const addMonths = (date: Date, months: number): Date => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

const subMonths = (date: Date, months: number): Date => {
  return addMonths(date, -months);
};

// Helper to format month/year
const formatMonthYear = (date: Date): string => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

// Helper to get currency symbol
const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    LKR: "Rs",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  return symbols[currency] || currency;
};

export default function CalendarScreen() {
  const { hasAnyPermission } = usePermissions();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDirectBookings, setShowDirectBookings] = useState(true);
  const [showBookingCom, setShowBookingCom] = useState(true);
  const [showAirbnb, setShowAirbnb] = useState(true);
  const [showExpedia, setShowExpedia] = useState(true);
  const [showBeds24, setShowBeds24] = useState(true);
  const [showIcal, setShowIcal] = useState(true);
  const [showOther, setShowOther] = useState(true);
  const [isNewReservationDialogOpen, setIsNewReservationDialogOpen] =
    useState(false);

  // Check permissions
  const hasCalendarPermission = hasAnyPermission("access_calendar");

  // Status color helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-500";
      case "tentative":
        return "bg-amber-500";
      case "pending":
        return "bg-sky-500";
      case "checked_in":
        return "bg-violet-500";
      case "checked_out":
        return "bg-slate-400";
      case "cancelled":
        return "bg-rose-500";
      default:
        return "bg-slate-400";
    }
  };

  // Event handlers
  const handleBookingClick = (booking: any) => {
    // TODO: Show booking details in modal
    console.log("Booking clicked:", booking);
    Alert.alert(
      "Booking Details",
      `Guest: ${booking.guest_name}\nReservation: ${booking.reservation_number || booking.external_id}`,
      [{ text: "OK" }]
    );
  };

  const handleQuickBook = (room: Room, date: Date) => {
    // TODO: Open quick booking modal with pre-filled room and date
    console.log("Quick book:", room, date);
    setIsNewReservationDialogOpen(true);
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  if (!hasCalendarPermission) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <Ionicons name="lock-closed-outline" size={48} color="#9ca3af" />
        <Text className="mt-4 text-gray-600 text-center font-semibold">
          Access Denied
        </Text>
        <Text className="mt-2 text-gray-500 text-sm text-center">
          You don't have permission to access the calendar. Please contact your
          administrator.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2 flex-1">
            <TouchableOpacity
              onPress={handleToday}
              className="bg-gray-100 px-3 py-2 rounded-lg flex-row items-center gap-1"
            >
              <Ionicons name="calendar-outline" size={16} color="#374151" />
              <Text className="text-sm font-medium text-gray-700">Today</Text>
            </TouchableOpacity>

            <View className="flex-row items-center gap-1">
              <TouchableOpacity
                onPress={handlePreviousMonth}
                className="p-2 rounded-lg bg-gray-100"
              >
                <Ionicons name="chevron-back" size={20} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNextMonth}
                className="p-2 rounded-lg bg-gray-100"
              >
                <Ionicons name="chevron-forward" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
              {formatMonthYear(currentDate)}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setIsNewReservationDialogOpen(true)}
            className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center gap-1 ml-2"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold text-sm">
              New
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setShowDirectBookings(!showDirectBookings)}
              className={`px-3 py-1.5 rounded-full flex-row items-center gap-1 ${
                showDirectBookings ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              <View
                className={`w-2 h-2 rounded-full ${showDirectBookings ? "bg-blue-600" : "bg-gray-400"}`}
              />
              <Text
                className={`text-xs font-medium ${showDirectBookings ? "text-blue-900" : "text-gray-600"}`}
              >
                Direct
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowBookingCom(!showBookingCom)}
              className={`px-3 py-1.5 rounded-full flex-row items-center gap-1 ${
                showBookingCom ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              <View
                className={`w-2 h-2 rounded-full ${showBookingCom ? "bg-blue-600" : "bg-gray-400"}`}
              />
              <Text
                className={`text-xs font-medium ${showBookingCom ? "text-blue-900" : "text-gray-600"}`}
              >
                Booking.com
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowAirbnb(!showAirbnb)}
              className={`px-3 py-1.5 rounded-full flex-row items-center gap-1 ${
                showAirbnb ? "bg-pink-100" : "bg-gray-100"
              }`}
            >
              <View
                className={`w-2 h-2 rounded-full ${showAirbnb ? "bg-pink-600" : "bg-gray-400"}`}
              />
              <Text
                className={`text-xs font-medium ${showAirbnb ? "text-pink-900" : "text-gray-600"}`}
              >
                Airbnb
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowExpedia(!showExpedia)}
              className={`px-3 py-1.5 rounded-full flex-row items-center gap-1 ${
                showExpedia ? "bg-yellow-100" : "bg-gray-100"
              }`}
            >
              <View
                className={`w-2 h-2 rounded-full ${showExpedia ? "bg-yellow-600" : "bg-gray-400"}`}
              />
              <Text
                className={`text-xs font-medium ${showExpedia ? "text-yellow-900" : "text-gray-600"}`}
              >
                Expedia
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowBeds24(!showBeds24)}
              className={`px-3 py-1.5 rounded-full flex-row items-center gap-1 ${
                showBeds24 ? "bg-purple-100" : "bg-gray-100"
              }`}
            >
              <View
                className={`w-2 h-2 rounded-full ${showBeds24 ? "bg-purple-600" : "bg-gray-400"}`}
              />
              <Text
                className={`text-xs font-medium ${showBeds24 ? "text-purple-900" : "text-gray-600"}`}
              >
                Beds24
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowIcal(!showIcal)}
              className={`px-3 py-1.5 rounded-full flex-row items-center gap-1 ${
                showIcal ? "bg-teal-100" : "bg-gray-100"
              }`}
            >
              <View
                className={`w-2 h-2 rounded-full ${showIcal ? "bg-teal-600" : "bg-gray-400"}`}
              />
              <Text
                className={`text-xs font-medium ${showIcal ? "text-teal-900" : "text-gray-600"}`}
              >
                iCal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowOther(!showOther)}
              className={`px-3 py-1.5 rounded-full flex-row items-center gap-1 ${
                showOther ? "bg-gray-200" : "bg-gray-100"
              }`}
            >
              <View
                className={`w-2 h-2 rounded-full ${showOther ? "bg-gray-700" : "bg-gray-400"}`}
              />
              <Text
                className={`text-xs font-medium ${showOther ? "text-gray-900" : "text-gray-600"}`}
              >
                Other
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Calendar Timeline View */}
      <TimelineView
        currentDate={currentDate}
        searchTerm=""
        statusFilter="all"
        roomFilter="all"
        sourceFilters={{
          direct: showDirectBookings,
          booking_com: showBookingCom,
          airbnb: showAirbnb,
          expedia: showExpedia,
          beds24: showBeds24,
          ical: showIcal,
          other: showOther,
        }}
        onBookingClick={handleBookingClick}
        onQuickBook={handleQuickBook}
        getStatusColor={getStatusColor}
        getCurrencySymbol={getCurrencySymbol}
      />

      {/* New Reservation Dialog */}
      <NewReservationDialog
        isOpen={isNewReservationDialogOpen}
        onClose={() => setIsNewReservationDialogOpen(false)}
        onReservationCreated={() => {
          setIsNewReservationDialogOpen(false);
          // Refresh calendar data if needed
        }}
      />
    </View>
  );
}
