import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
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
    <View className="bg-white rounded-xl p-4 border border-gray-200">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <Ionicons name="calendar" size={20} color="#3b82f6" />
          <Text className="text-lg font-semibold text-gray-900">
            Upcoming Bookings
          </Text>
        </View>
        {hasCalendarPermission && onViewAllPress && (
          <TouchableOpacity
            onPress={onViewAllPress}
            className="flex-row items-center gap-1 px-3 py-1.5 bg-blue-50 rounded-lg"
          >
            <Text className="text-sm font-semibold text-blue-600">
              View All
            </Text>
            <Ionicons name="arrow-forward" size={14} color="#3b82f6" />
          </TouchableOpacity>
        )}
      </View>
      <View className="gap-3">
        {upcomingReservations.length > 0 ? (
          upcomingReservations.map((reservation) => (
            <TouchableOpacity
              key={reservation.id}
              className="p-3 rounded-lg bg-white border border-gray-200"
              activeOpacity={0.7}
            >
              <View className="flex-row items-start justify-between gap-2 mb-2">
                <View className="flex-1 min-w-0">
                  <Text
                    className="font-bold text-gray-900 text-sm"
                    numberOfLines={1}
                  >
                    {reservation.guest_name}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    #{reservation.reservation_number}
                  </Text>
                </View>
                <View
                  className={`px-2 py-0.5 rounded-full ${getStatusColor(
                    reservation.status
                  )}`}
                >
                  <Text className="text-[10px] font-bold capitalize">
                    {reservation.status.replace("_", " ")}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="calendar-outline" size={13} color="#6b7280" />
                <Text className="text-xs text-gray-600">
                  {new Date(reservation.check_in_date).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                    }
                  )}{" "}
                  -{" "}
                  {new Date(reservation.check_out_date).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </Text>
              </View>

              <View className="flex-row items-center justify-between pt-2 border-t border-gray-100">
                <View className="flex-row items-center gap-1.5">
                  <Ionicons name="location-outline" size={12} color="#6b7280" />
                  <Text className="text-xs text-gray-600" numberOfLines={1}>
                    {reservation.locations?.name}
                  </Text>
                  <Text className="text-xs text-gray-400">•</Text>
                  <Ionicons name="bed-outline" size={12} color="#6b7280" />
                  <Text className="text-xs text-gray-600">
                    Rm {reservation.rooms?.room_number}
                  </Text>
                </View>
                <Text className="font-bold text-emerald-600 text-sm ml-2">
                  {reservation.currency}{" "}
                  {reservation.total_amount.toLocaleString()}
                </Text>
              </View>

              {reservation.booking_source && (
                <View className="mt-2 pt-2 border-t border-gray-100">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="globe-outline" size={11} color="#8b5cf6" />
                    <Text className="text-xs font-medium text-purple-600 capitalize">
                      {reservation.booking_source.replace("_", ".")}
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View className="py-12 items-center">
            <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
            <Text className="text-gray-400 mt-3">No upcoming bookings</Text>
          </View>
        )}
      </View>
    </View>
  );
}
