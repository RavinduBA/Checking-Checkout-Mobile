import React from "react";
import { Text, TouchableOpacity, View, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExternalBookingBlock } from "./ExternalBookingBlock";
import type { Database } from "../../integrations/supabase/types";
import type { ExternalBooking } from "./TimelineView";

type Room = Database["public"]["Tables"]["rooms"]["Row"];
type Reservation = {
  id: string;
  room_id: string;
  guest_name: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  total_amount: number;
  currency: string;
  adults: number;
  children: number | null;
  reservation_number: string;
};

interface BookingSpan {
  startIndex: number;
  spanDays: number;
  isVisible: boolean;
}

interface RoomRowProps {
  room: Room;
  calendarDays: Date[];
  reservations: Reservation[];
  externalBookings: ExternalBooking[];
  onBookingClick: (booking: Reservation | ExternalBooking) => void;
  onQuickBook: (room: Room, date: Date) => void;
  getStatusColor: (status: string) => string;
  getCurrencySymbol: (currency: string) => string;
  calculateBookingSpan: (
    booking: Reservation,
    calendarDays: Date[]
  ) => BookingSpan;
}

export function RoomRow({
  room,
  calendarDays,
  reservations,
  externalBookings,
  onBookingClick,
  onQuickBook,
  getStatusColor,
  getCurrencySymbol,
  calculateBookingSpan,
}: RoomRowProps) {
  const { width } = Dimensions.get("window");
  const isMobile = width < 640;

  // Filter reservations for this room
  const roomBookings = React.useMemo(() => {
    return reservations
      .filter((reservation) => reservation.room_id === room.id)
      .map((booking) => ({
        ...booking,
        span: calculateBookingSpan(booking, calendarDays),
      }))
      .filter((booking) => booking.span.isVisible);
  }, [reservations, room.id, calendarDays, calculateBookingSpan]);

  // Filter external bookings for this room
  const roomExternalBookings = React.useMemo(() => {
    return externalBookings
      .filter((booking) => booking.room_id === room.id)
      .map((booking) => {
        // Convert external booking to match reservation format for span calculation
        const fakeReservation = {
          ...booking,
          room_id: booking.room_id || room.id,
          check_in_date: booking.check_in,
          check_out_date: booking.check_out,
          total_amount: booking.total_amount || 0,
          currency: booking.currency || "USD",
          adults: booking.adults || 0,
          children: booking.children || 0,
          reservation_number: booking.external_id,
        };
        return {
          ...booking,
          span: calculateBookingSpan(fakeReservation as any, calendarDays),
        };
      })
      .filter((booking) => booking.span.isVisible);
  }, [externalBookings, room.id, calendarDays, calculateBookingSpan]);

  return (
    <View className="border-b border-gray-200 last:border-b-0">
      <View className="flex-row w-full">
        {/* Room Info Column - Compact & Responsive */}
        <View className="w-24 sm:w-28 md:w-32 shrink-0 px-1.5 sm:px-2 py-1 border-r flex items-center">
          <Text className="font-medium text-[10px] sm:text-xs" numberOfLines={1}>
            {room.room_number}
          </Text>
        </View>

        {/* Calendar Grid - Full width responsive */}
        <View className="flex-1 flex-row relative">
          {calendarDays.map((day, dayIndex) => {
            // Find booking that starts on this day
            const bookingStartingToday = roomBookings.find(
              (booking) => booking.span.startIndex === dayIndex
            );

            // Find external booking that starts on this day
            const externalBookingStartingToday = roomExternalBookings.find(
              (booking) => booking.span.startIndex === dayIndex
            );

            // Check if this day is occupied by any booking
            const isOccupied =
              roomBookings.some(
                (booking) =>
                  dayIndex >= booking.span.startIndex &&
                  dayIndex < booking.span.startIndex + booking.span.spanDays
              ) ||
              roomExternalBookings.some(
                (booking) =>
                  dayIndex >= booking.span.startIndex &&
                  dayIndex < booking.span.startIndex + booking.span.spanDays
              );

            return (
              <View
                key={dayIndex}
                className={`flex-1 min-w-[32px] sm:min-w-[40px] h-8 sm:h-9 border-r last:border-r-0 relative flex items-center justify-center ${
                  isOccupied && !bookingStartingToday ? "bg-gray-100" : ""
                }`}
              >
                {/* Render external bookings first (below direct bookings) */}
                {externalBookingStartingToday && (
                  <ExternalBookingBlock
                    booking={externalBookingStartingToday}
                    startIndex={externalBookingStartingToday.span.startIndex}
                    spanDays={externalBookingStartingToday.span.spanDays}
                    totalDays={calendarDays.length}
                    getCurrencySymbol={getCurrencySymbol}
                    onClick={onBookingClick}
                  />
                )}

                {/* Render direct bookings on top */}
                {bookingStartingToday && (
                  <View
                    className="absolute inset-y-[2px]"
                    style={{
                      left: `${(bookingStartingToday.span.startIndex / calendarDays.length) * 100}%`,
                      right: `${100 - ((bookingStartingToday.span.startIndex + bookingStartingToday.span.spanDays) / calendarDays.length) * 100}%`,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => onBookingClick(bookingStartingToday)}
                      className={`w-full h-full ${getStatusColor(bookingStartingToday.status)} flex flex-col justify-center px-1 rounded`}
                      activeOpacity={0.8}
                    >
                      {bookingStartingToday.span.spanDays >= 2 ? (
                        <View className="flex-row items-center gap-1 w-full">
                          <Text
                            className="text-white text-[9px] sm:text-[10px] font-semibold flex-1"
                            numberOfLines={1}
                          >
                            {bookingStartingToday.guest_name}
                          </Text>
                          <Text className="text-white text-[9px] sm:text-[10px] font-semibold shrink-0">
                            • ({bookingStartingToday.adults + (bookingStartingToday.children || 0)})
                          </Text>
                        </View>
                      ) : (
                        <View className="flex items-center justify-center">
                          <Text className="text-white text-[9px]">•</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {!isOccupied && (
                  <TouchableOpacity
                    className="w-full h-full flex items-center justify-center"
                    onPress={() => onQuickBook(room, day)}
                    activeOpacity={0.6}
                  >
                    <Ionicons
                      name="add"
                      size={12}
                      color="#d1d5db"
                      style={{ opacity: 0.3 }}
                    />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
