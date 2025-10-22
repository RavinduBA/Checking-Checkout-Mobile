import React, { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  addDays,
  eachDayOfInterval,
  endOfDay,
  format,
  parseISO,
  startOfDay,
} from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useLocationContext } from "../../contexts/LocationContext";
import { useTenant } from "../../hooks/useTenant";
import { useRooms } from "../../hooks/useRooms";
import { supabase } from "../../lib/supabase";
import { CalendarLegend } from "./CalendarLegend";
import { RoomRow } from "./RoomRow";
import type { Database } from "../../integrations/supabase/types";

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

export type ExternalBooking = {
  id: string;
  room_id: string | null;
  external_id: string;
  property_id: string;
  source: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  status: string;
  total_amount: number | null;
  currency: string | null;
  adults: number | null;
  children: number | null;
  room_name: string | null;
};

interface BookingSpan {
  startIndex: number;
  spanDays: number;
  isVisible: boolean;
}

interface SourceFilters {
  direct: boolean;
  booking_com: boolean;
  airbnb: boolean;
  expedia: boolean;
  beds24: boolean;
  ical: boolean;
  other: boolean;
}

interface TimelineViewProps {
  currentDate: Date;
  searchTerm: string;
  statusFilter: string;
  roomFilter: string;
  sourceFilters?: SourceFilters;
  onBookingClick: (booking: Reservation | ExternalBooking) => void;
  onQuickBook: (room: Room, date: Date) => void;
  getStatusColor: (status: string) => string;
  getCurrencySymbol: (currency: string) => string;
}

export function TimelineView({
  currentDate,
  searchTerm,
  statusFilter,
  roomFilter,
  sourceFilters,
  onBookingClick,
  onQuickBook,
  getStatusColor,
  getCurrencySymbol,
}: TimelineViewProps) {
  const { selectedLocation } = useLocationContext();
  const { tenant } = useTenant();

  // Fetch rooms using existing hook
  const { rooms, loading: roomsLoading } = useRooms(selectedLocation || undefined);

  // Fetch reservations
  const [reservations, setReservations] = React.useState<Reservation[]>([]);
  const [reservationsLoading, setReservationsLoading] = React.useState(true);

  // Fetch external bookings
  const [externalBookings, setExternalBookings] = React.useState<ExternalBooking[]>([]);
  const [externalBookingsLoading, setExternalBookingsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchReservations = async () => {
      if (!selectedLocation || !tenant?.id) {
        setReservations([]);
        setReservationsLoading(false);
        return;
      }

      try {
        setReservationsLoading(true);
        const viewStart = startOfDay(currentDate);
        const viewEnd = addDays(viewStart, 29);

        const { data, error } = await supabase
          .from("reservations")
          .select(
            "id, room_id, guest_name, check_in_date, check_out_date, status, total_amount, currency, adults, children, reservation_number"
          )
          .eq("tenant_id", tenant.id)
          .eq("location_id", selectedLocation)
          .or(
            `check_in_date.lte.${format(viewEnd, "yyyy-MM-dd")},check_out_date.gte.${format(viewStart, "yyyy-MM-dd")}`
          )
          .order("check_in_date", { ascending: true });

        if (error) throw error;
        setReservations(data || []);
      } catch (error) {
        console.error("Error fetching reservations:", error);
        setReservations([]);
      } finally {
        setReservationsLoading(false);
      }
    };

    fetchReservations();
  }, [selectedLocation, tenant?.id, currentDate]);

  React.useEffect(() => {
    const fetchExternalBookings = async () => {
      if (!selectedLocation || !tenant?.id) {
        setExternalBookings([]);
        setExternalBookingsLoading(false);
        return;
      }

      try {
        setExternalBookingsLoading(true);
        const viewStart = startOfDay(currentDate);
        const viewEnd = addDays(viewStart, 29);

        const { data, error } = await supabase
          .from("external_bookings")
          .select(
            "id, room_id, external_id, property_id, source, guest_name, check_in, check_out, status, total_amount, currency, adults, children, room_name"
          )
          .eq("tenant_id", tenant.id)
          .eq("location_id", selectedLocation)
          .or(
            `check_in.lte.${format(viewEnd, "yyyy-MM-dd")},check_out.gte.${format(viewStart, "yyyy-MM-dd")}`
          )
          .order("check_in", { ascending: true });

        if (error) throw error;
        setExternalBookings(data || []);
      } catch (error) {
        console.error("Error fetching external bookings:", error);
        setExternalBookings([]);
      } finally {
        setExternalBookingsLoading(false);
      }
    };

    fetchExternalBookings();
  }, [selectedLocation, tenant?.id, currentDate]);

  // Generate calendar days - 30 days from current date
  const calendarDays = useMemo(() => {
    const startDate = startOfDay(currentDate);
    const endDate = addDays(startDate, 29); // 30 days total (0-29)
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  // Calculate booking span
  const calculateBookingSpan = (
    booking: Reservation,
    calendarDays: Date[]
  ): BookingSpan => {
    const checkIn = parseISO(booking.check_in_date);
    const checkOut = parseISO(booking.check_out_date);

    const monthStart = calendarDays[0];
    const monthEnd = calendarDays[calendarDays.length - 1];

    // Check if booking overlaps with the month
    const bookingStart = startOfDay(checkIn);
    const bookingEnd = endOfDay(checkOut);
    const monthStartDay = startOfDay(monthStart);
    const monthEndDay = endOfDay(monthEnd);

    // If booking doesn't overlap, don't show it
    if (bookingEnd < monthStartDay || bookingStart > monthEndDay) {
      return { startIndex: 0, spanDays: 0, isVisible: false };
    }

    // Calculate where the booking starts in the calendar
    const displayStart = bookingStart < monthStartDay ? monthStartDay : bookingStart;
    const displayEnd = bookingEnd > monthEndDay ? monthEndDay : bookingEnd;

    // Find the index of the start day
    const startIndex = calendarDays.findIndex(
      (day) => startOfDay(day).getTime() === displayStart.getTime()
    );

    if (startIndex === -1) {
      return { startIndex: 0, spanDays: 0, isVisible: false };
    }

    // Calculate number of days to span
    const daysDiff = Math.ceil(
      (displayEnd.getTime() - displayStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    const spanDays = Math.max(1, daysDiff);

    return { startIndex, spanDays, isVisible: true };
  };

  // Apply filters to rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // Room filter
      if (roomFilter !== "all" && room.id !== roomFilter) return false;

      // Search filter
      if (
        searchTerm &&
        !room.room_number.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [rooms, roomFilter, searchTerm]);

  // Group rooms by room_type
  const groupedRooms = useMemo(() => {
    return filteredRooms.reduce(
      (acc, room) => {
        const type = room.room_type || "Other";
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(room);
        return acc;
      },
      {} as Record<string, typeof filteredRooms>
    );
  }, [filteredRooms]);

  // Apply filters to reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      // Status filter
      if (statusFilter !== "all" && reservation.status !== statusFilter) {
        return false;
      }

      // Source filter - direct bookings
      if (sourceFilters && !sourceFilters.direct) {
        return false;
      }

      return true;
    });
  }, [reservations, statusFilter, sourceFilters]);

  // Apply filters to external bookings
  const filteredExternalBookings = useMemo(() => {
    return externalBookings.filter((booking) => {
      if (!sourceFilters) return true;

      const source = booking.source.toLowerCase();
      if (source === "booking_com" || source === "booking.com") {
        return sourceFilters.booking_com;
      }
      if (source === "airbnb") return sourceFilters.airbnb;
      if (source === "expedia") return sourceFilters.expedia;
      if (source === "beds24") return sourceFilters.beds24;
      if (source === "ical") return sourceFilters.ical;
      return sourceFilters.other;
    });
  }, [externalBookings, sourceFilters]);

  if (roomsLoading || reservationsLoading || externalBookingsLoading) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <ActivityIndicator size="large" color="#0066cc" />
        <Text className="mt-4 text-gray-600">Loading calendar...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Legend */}
      <CalendarLegend className="px-4 py-3 bg-white border-b border-gray-200" />

      {/* Calendar Grid */}
      <ScrollView className="flex-1">
        <View className="flex-1">
          {/* Header Row */}
          <View className="flex-row bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            {/* Room Column Header */}
            <View className="w-24 sm:w-28 md:w-32 shrink-0 px-2 py-2 border-r">
              <Text className="font-semibold text-[10px] sm:text-xs">Room</Text>
            </View>

            {/* Date Headers */}
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View className="flex-row">
                {calendarDays.map((day, index) => (
                  <View
                    key={index}
                    className="min-w-[32px] sm:min-w-[40px] px-1 py-2 border-r last:border-r-0"
                  >
                    <Text className="text-[8px] sm:text-[9px] text-center font-medium">
                      {format(day, "EEE")}
                    </Text>
                    <Text className="text-[10px] sm:text-xs text-center font-semibold">
                      {format(day, "dd")}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Room Rows Grouped by Type */}
          {Object.entries(groupedRooms).map(([roomType, roomsInType]) => (
            <View key={roomType}>
              {/* Room Type Header */}
              <View className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                <Text className="font-semibold text-xs text-gray-700">
                  {roomType} ({roomsInType.length})
                </Text>
              </View>

              {/* Rooms of this type */}
              {roomsInType.map((room) => (
                <RoomRow
                  key={room.id}
                  room={room}
                  calendarDays={calendarDays}
                  reservations={filteredReservations}
                  externalBookings={filteredExternalBookings}
                  onBookingClick={onBookingClick}
                  onQuickBook={onQuickBook}
                  getStatusColor={getStatusColor}
                  getCurrencySymbol={getCurrencySymbol}
                  calculateBookingSpan={calculateBookingSpan}
                />
              ))}
            </View>
          ))}

          {filteredRooms.length === 0 && (
            <View className="p-8 items-center">
              <Ionicons name="bed-outline" size={48} color="#9ca3af" />
              <Text className="mt-4 text-gray-600 text-center">
                No rooms found
              </Text>
              <Text className="mt-2 text-gray-500 text-sm text-center">
                Try adjusting your filters
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
