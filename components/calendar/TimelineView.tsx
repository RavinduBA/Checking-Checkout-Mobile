import { Ionicons } from "@expo/vector-icons";
import {
  addDays,
  eachDayOfInterval,
  endOfDay,
  format,
  parseISO,
  startOfDay,
} from "date-fns";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocationContext } from "../../contexts/LocationContext";
import { useRooms } from "../../hooks/useRooms";
import { useTenant } from "../../hooks/useTenant";
import type { Database } from "../../integrations/supabase/types";
import { supabase } from "../../lib/supabase";
import { CalendarLegend } from "./CalendarLegend";

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
  const { rooms, loading: roomsLoading } = useRooms(
    selectedLocation || undefined
  );

  // Fetch reservations
  const [reservations, setReservations] = React.useState<Reservation[]>([]);
  const [reservationsLoading, setReservationsLoading] = React.useState(true);

  // Fetch external bookings
  const [externalBookings, setExternalBookings] = React.useState<
    ExternalBooking[]
  >([]);
  const [externalBookingsLoading, setExternalBookingsLoading] =
    React.useState(true);

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
            `check_in_date.lte.${format(
              viewEnd,
              "yyyy-MM-dd"
            )},check_out_date.gte.${format(viewStart, "yyyy-MM-dd")}`
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
            `check_in.lte.${format(
              viewEnd,
              "yyyy-MM-dd"
            )},check_out.gte.${format(viewStart, "yyyy-MM-dd")}`
          )
          .order("check_in", { ascending: true });

        // PGRST205 = table not found (external_bookings may not exist)
        if (error && error.code === "PGRST205") {
          console.warn(
            "External bookings table does not exist (OK for basic setup)"
          );
          setExternalBookings([]);
        } else if (error) {
          console.error("Error fetching external bookings:", error);
          setExternalBookings([]);
        } else {
          setExternalBookings(data || []);
        }
      } catch (error: any) {
        console.warn("External bookings error (may not exist):", error);
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
    const displayStart =
      bookingStart < monthStartDay ? monthStartDay : bookingStart;
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
    return filteredRooms.reduce((acc, room) => {
      const type = room.room_type || "Other";
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(room);
      return acc;
    }, {} as Record<string, typeof filteredRooms>);
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

  // Helper to get bookings for a specific room and date
  const getRoomBookingsForDate = (roomId: string, date: Date) => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const directBooking = filteredReservations.find((res) => {
      const checkIn = parseISO(res.check_in_date);
      const checkOut = parseISO(res.check_out_date);
      return (
        res.room_id === roomId && checkIn <= dayEnd && checkOut >= dayStart
      );
    });

    const externalBooking = filteredExternalBookings.find((booking) => {
      const checkIn = parseISO(booking.check_in);
      const checkOut = parseISO(booking.check_out);
      return (
        booking.room_id === roomId && checkIn <= dayEnd && checkOut >= dayStart
      );
    });

    return { directBooking, externalBooking };
  };

  // Helper to check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Legend */}
      <CalendarLegend className="px-4 py-3 bg-white border-b border-gray-200" />

      {/* Calendar Grid - Days as Rows, Rooms as Columns */}
      <ScrollView
        className="flex-1 pl-4 pr-4 "
        showsVerticalScrollIndicator={true}
      >
        <View className="bg-white">
          {filteredRooms.length === 0 ? (
            <View className="p-8 items-center">
              <Ionicons name="bed-outline" size={48} color="#9ca3af" />
              <Text className="mt-4 text-gray-600 text-center font-semibold">
                No rooms found
              </Text>
              <Text className="mt-2 text-gray-500 text-sm text-center">
                Try adjusting your filters
              </Text>
            </View>
          ) : (
            <View>
              {/* Header Row - Room Numbers */}
              <View className="flex-row border-b-2 border-gray-300 bg-gradient-to-r from-blue-50 to-indigo-50">
                {/* Date Column Header */}
                <View className="w-24 px-2 py-3 border-r-2 border-gray-300 bg-blue-100">
                  <Ionicons
                    name="calendar"
                    size={16}
                    color="#3b82f6"
                    style={{ alignSelf: "center" }}
                  />
                  <Text className="text-[10px] font-bold text-blue-900 text-center mt-1">
                    DATE
                  </Text>
                </View>

                {/* Room Headers - Horizontal Scroll */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row">
                    {filteredRooms.map((room, index) => (
                      <View
                        key={room.id}
                        className={`w-28 px-2 py-3 border-r border-gray-200 ${
                          index % 2 === 0 ? "bg-blue-50" : "bg-indigo-50"
                        }`}
                      >
                        <View className="items-center">
                          <Ionicons name="bed" size={14} color="#6366f1" />
                          <Text
                            className="text-xs font-bold text-gray-900 mt-1"
                            numberOfLines={1}
                          >
                            {room.room_number}
                          </Text>
                          <Text
                            className="text-[9px] text-gray-600"
                            numberOfLines={1}
                          >
                            {room.room_type}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Day Rows */}
              {calendarDays.map((day, dayIndex) => {
                const isTodayDate = isToday(day);
                const isWeekend =
                  format(day, "EEE") === "Sat" || format(day, "EEE") === "Sun";

                return (
                  <View
                    key={dayIndex}
                    className={`flex-row border-b border-gray-200 ${
                      isTodayDate
                        ? "bg-blue-50"
                        : isWeekend
                        ? "bg-gray-50"
                        : "bg-white"
                    }`}
                  >
                    {/* Date Cell */}
                    <View
                      className={`w-24 px-2 py-3 border-r border-gray-300 ${
                        isTodayDate
                          ? "bg-blue-500"
                          : isWeekend
                          ? "bg-indigo-100"
                          : "bg-gray-50"
                      }`}
                    >
                      <View className="items-center justify-center">
                        <Text
                          className={`text-[10px] font-semibold ${
                            isTodayDate ? "text-white" : "text-gray-600"
                          }`}
                        >
                          {format(day, "EEE")}
                        </Text>
                        <Text
                          className={`text-lg font-bold ${
                            isTodayDate ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {format(day, "dd")}
                        </Text>
                        <Text
                          className={`text-[9px] ${
                            isTodayDate ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {format(day, "MMM")}
                        </Text>
                        {isTodayDate && (
                          <View className="mt-1 bg-white px-1 py-0.5 rounded">
                            <Text className="text-[8px] font-bold text-blue-600">
                              TODAY
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Room Cells - Horizontal Scroll */}
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <View className="flex-row">
                        {filteredRooms.map((room, roomIndex) => {
                          const { directBooking, externalBooking } =
                            getRoomBookingsForDate(room.id, day);
                          const hasBooking = directBooking || externalBooking;
                          const booking = directBooking || externalBooking;

                          return (
                            <View
                              key={room.id}
                              className={`w-28 border-r border-gray-200 ${
                                roomIndex % 2 === 0 ? "" : "bg-gray-50/50"
                              }`}
                            >
                              {hasBooking ? (
                                <TouchableOpacity
                                  onPress={() => onBookingClick(booking!)}
                                  activeOpacity={0.7}
                                  className="p-2 min-h-[80px]"
                                >
                                  {directBooking ? (
                                    <View>
                                      <View
                                        className={`px-2 py-1 rounded-md mb-1 ${getStatusColor(
                                          directBooking.status
                                        )}`}
                                      >
                                        <Text className="text-[8px] font-bold text-white text-center">
                                          {directBooking.status.toUpperCase()}
                                        </Text>
                                      </View>
                                      <View className="gap-0.5">
                                        <View className="flex-row items-center gap-1">
                                          <Ionicons
                                            name="person"
                                            size={10}
                                            color="#6b7280"
                                          />
                                          <Text
                                            className="text-[10px] text-gray-900 flex-1 font-medium"
                                            numberOfLines={1}
                                          >
                                            {directBooking.guest_name}
                                          </Text>
                                        </View>
                                        <View className="flex-row items-center gap-1">
                                          <Ionicons
                                            name="cash"
                                            size={10}
                                            color="#6b7280"
                                          />
                                          <Text className="text-[9px] text-gray-700">
                                            {getCurrencySymbol(
                                              directBooking.currency
                                            )}{" "}
                                            {directBooking.total_amount.toLocaleString()}
                                          </Text>
                                        </View>
                                        <View className="flex-row items-center gap-1">
                                          <Ionicons
                                            name="people"
                                            size={10}
                                            color="#6b7280"
                                          />
                                          <Text className="text-[9px] text-gray-600">
                                            {directBooking.adults}
                                            {directBooking.children
                                              ? `+${directBooking.children}`
                                              : ""}{" "}
                                            pax
                                          </Text>
                                        </View>
                                      </View>
                                    </View>
                                  ) : externalBooking ? (
                                    <View>
                                      <View className="px-2 py-1 rounded-md mb-1 bg-purple-500">
                                        <Text className="text-[8px] font-bold text-white text-center">
                                          {externalBooking.source.toUpperCase()}
                                        </Text>
                                      </View>
                                      <View className="gap-0.5">
                                        <View className="flex-row items-center gap-1">
                                          <Ionicons
                                            name="person"
                                            size={10}
                                            color="#6b7280"
                                          />
                                          <Text
                                            className="text-[10px] text-gray-900 flex-1 font-medium"
                                            numberOfLines={1}
                                          >
                                            {externalBooking.guest_name}
                                          </Text>
                                        </View>
                                        {externalBooking.total_amount && (
                                          <View className="flex-row items-center gap-1">
                                            <Ionicons
                                              name="cash"
                                              size={10}
                                              color="#6b7280"
                                            />
                                            <Text className="text-[9px] text-gray-700">
                                              {getCurrencySymbol(
                                                externalBooking.currency ||
                                                  "USD"
                                              )}{" "}
                                              {externalBooking.total_amount.toLocaleString()}
                                            </Text>
                                          </View>
                                        )}
                                        {!externalBooking.room_id && (
                                          <View className="mt-1 px-1 py-0.5 bg-yellow-100 rounded border border-yellow-400">
                                            <Text className="text-[8px] text-yellow-900 text-center font-semibold">
                                              ⚠️ Unmapped
                                            </Text>
                                          </View>
                                        )}
                                      </View>
                                    </View>
                                  ) : null}
                                </TouchableOpacity>
                              ) : (
                                <TouchableOpacity
                                  onPress={() => onQuickBook(room as any, day)}
                                  activeOpacity={0.6}
                                  className="p-2 min-h-[80px] items-center justify-center bg-emerald-50/30"
                                >
                                  <Ionicons
                                    name="add-circle"
                                    size={20}
                                    color="#10b981"
                                  />
                                  <Text className="text-[9px] font-semibold text-emerald-700 mt-1">
                                    Book
                                  </Text>
                                  <Text className="text-[8px] text-emerald-600">
                                    {getCurrencySymbol(room.currency || "LKR")}{" "}
                                    {room.base_price?.toLocaleString() || "N/A"}
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    </ScrollView>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
