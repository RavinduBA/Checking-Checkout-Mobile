import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTenant } from "../../hooks/useTenant";
import type { Database } from "../../integrations/supabase/types";
import { supabase } from "../../lib/supabase";

type Reservation = Database["public"]["Tables"]["reservations"]["Row"] & {
  locations: Database["public"]["Tables"]["locations"]["Row"];
  rooms: Database["public"]["Tables"]["rooms"]["Row"];
};

interface UpcomingBookingsProps {
  selectedLocation: string;
  hasCalendarPermission: boolean;
  onViewAllPress?: () => void;
}

export function UpcomingBookings({
  selectedLocation,
  hasCalendarPermission,
  onViewAllPress,
}: UpcomingBookingsProps) {
  const [loading, setLoading] = useState(true);
  const [upcomingReservations, setUpcomingReservations] = useState<
    Reservation[]
  >([]);
  const { tenant } = useTenant();

  useEffect(() => {
    const fetchReservationsData = async () => {
      if (!tenant?.id) {
        setLoading(false);
        return;
      }

      try {
        // Get locations for the tenant first to filter by tenant
        const { data: tenantLocations } = await supabase
          .from("locations")
          .select("id")
          .eq("tenant_id", tenant.id)
          .eq("is_active", true);

        const tenantLocationIds = tenantLocations?.map((loc) => loc.id) || [];

        if (tenantLocationIds.length === 0) {
          setUpcomingReservations([]);
          setLoading(false);
          return;
        }

        const { data: reservationsData } = await supabase
          .from("reservations")
          .select("*, locations(*), rooms(*)")
          .in("location_id", tenantLocationIds)
          .match(!selectedLocation ? {} : { location_id: selectedLocation })
          .gte("check_in_date", new Date().toISOString().split("T")[0]) // Only future/today check-ins
          .neq("status", "cancelled") // Exclude cancelled reservations
          .order("check_in_date", { ascending: true })
          .limit(5);

        setUpcomingReservations(reservationsData || []);
      } catch (error) {
        console.error("Error fetching reservations data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservationsData();
  }, [selectedLocation, tenant?.id]);

  if (loading) {
    return (
      <View className="bg-white rounded-xl p-6 border border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <Ionicons name="calendar-outline" size={20} color="#3b82f6" />
            <Text className="text-lg font-semibold text-gray-900">
              Upcoming Bookings
            </Text>
          </View>
        </View>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-900";
      case "tentative":
        return "bg-yellow-100 text-yellow-900";
      case "checked_in":
        return "bg-blue-100 text-blue-900";
      default:
        return "bg-gray-100 text-gray-900";
    }
  };

  return (
    <View className="bg-white rounded-xl p-6 border border-gray-200">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <Ionicons name="calendar-outline" size={20} color="#3b82f6" />
          <Text className="text-lg font-semibold text-gray-900">
            Upcoming Bookings
          </Text>
        </View>
        {hasCalendarPermission && onViewAllPress && (
          <TouchableOpacity
            onPress={onViewAllPress}
            className="flex-row items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg"
          >
            <Ionicons name="eye-outline" size={16} color="#3b82f6" />
            <Text className="text-sm font-medium text-blue-600">View All</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView className="gap-3">
        {upcomingReservations.length > 0 ? (
          upcomingReservations.map((reservation) => (
            <View
              key={reservation.id}
              className="p-4 rounded-lg bg-gray-50 border border-gray-100"
            >
              <View className="gap-2">
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1 min-w-0">
                    <Text
                      className="font-semibold text-gray-900"
                      numberOfLines={1}
                    >
                      {reservation.guest_name}
                    </Text>
                    <Text className="text-sm text-gray-600 mt-1">
                      {new Date(reservation.check_in_date).toLocaleDateString()}{" "}
                      to{" "}
                      {new Date(
                        reservation.check_out_date
                      ).toLocaleDateString()}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-0.5">
                      {reservation.locations?.name} • Room{" "}
                      {reservation.rooms?.room_number}
                    </Text>
                  </View>
                  <View className="gap-2">
                    <View
                      className={`px-2 py-1 rounded ${getStatusColor(
                        reservation.status
                      )}`}
                    >
                      <Text className="text-xs font-medium capitalize">
                        {reservation.status}
                      </Text>
                    </View>
                    {reservation.booking_source && (
                      <View className="px-2 py-1 bg-purple-100 rounded border border-purple-200">
                        <Text className="text-xs font-medium text-purple-900">
                          {reservation.booking_source.replace("_", ".")}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View className="flex-row justify-between items-center mt-2">
                  <Text className="text-xs text-gray-500">
                    {reservation.reservation_number}
                  </Text>
                  <Text className="font-bold text-green-600">
                    {reservation.currency}{" "}
                    {reservation.total_amount.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className="py-8 items-center">
            <Text className="text-gray-500">No upcoming bookings</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
