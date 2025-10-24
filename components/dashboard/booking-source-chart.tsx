import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Text, View } from "react-native";
import { useTenant } from "../../hooks/useTenant";
import { supabase } from "../../lib/supabase";

interface BookingSourceData {
  source: string;
  count: number;
  percentage: number;
}

interface BookingSourceChartProps {
  selectedLocation: string;
  selectedMonth: string;
}

// Color mapping for specific booking sources
const SOURCE_COLORS: Record<string, string> = {
  direct: "hsl(220, 70%, 50%)", // Blue - Primary booking channel
  airbnb: "hsl(0, 82%, 60%)", // Airbnb red
  booking_com: "hsl(220, 100%, 40%)", // Booking.com blue
  expedia: "hsl(45, 100%, 50%)", // Expedia yellow
  agoda: "hsl(340, 82%, 52%)", // Agoda pink/magenta
  beds24: "hsl(120, 60%, 45%)", // Green
  manual: "hsl(270, 60%, 55%)", // Purple
  online: "hsl(190, 70%, 50%)", // Cyan
  phone: "hsl(30, 80%, 55%)", // Orange
  email: "hsl(280, 60%, 60%)", // Violet
  walk_in: "hsl(160, 60%, 45%)", // Teal
  ical: "hsl(25, 70%, 55%)", // Brown/orange
};

// Fallback colors for any unmapped sources
const FALLBACK_COLORS = [
  "hsl(210, 40%, 70%)",
  "hsl(160, 40%, 70%)",
  "hsl(30, 40%, 70%)",
  "hsl(270, 40%, 70%)",
  "hsl(120, 40%, 70%)",
  "hsl(60, 40%, 70%)",
  "hsl(330, 40%, 70%)",
];

// Mapping for display names
const SOURCE_DISPLAY_NAMES: Record<string, string> = {
  direct: "Direct",
  airbnb: "Airbnb",
  booking_com: "Booking.com",
  expedia: "Expedia",
  agoda: "Agoda",
  beds24: "Beds24",
  manual: "Manual",
  online: "Online",
  phone: "Phone",
  email: "Email",
  walk_in: "Walk-in",
  ical: "iCal",
};

export function BookingSourceChart({
  selectedLocation,
  selectedMonth,
}: BookingSourceChartProps) {
  const { tenant } = useTenant();
  const [sourceData, setSourceData] = useState<BookingSourceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalBookings, setTotalBookings] = useState(0);
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    const fetchBookingSourceData = async () => {
      if (!tenant?.id) return;

      setLoading(true);
      try {
        let query = supabase
          .from("reservations")
          .select("booking_source")
          .eq("tenant_id", tenant.id)
          .not("booking_source", "is", null); // Filter by location if selected
        if (selectedLocation) {
          query = query.eq("location_id", selectedLocation);
        }

        // Filter by month if selected
        if (selectedMonth) {
          const startDate = `${selectedMonth}-01`;
          const year = parseInt(selectedMonth.split("-")[0]);
          const month = parseInt(selectedMonth.split("-")[1]);
          const endDate = new Date(year, month, 0).toISOString().split("T")[0];
          query = query
            .gte("check_in_date", startDate)
            .lte("check_in_date", endDate);
        } else {
          // Default to current month if no month selected
          const now = new Date();
          const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString()
            .split("T")[0];
          const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
            .toISOString()
            .split("T")[0];
          query = query
            .gte("check_in_date", startDate)
            .lte("check_in_date", endDate);
        }

        const { data: reservations, error } = await query;

        if (error) throw error;

        // Process the data to count booking sources
        const sourceCounts: Record<string, number> = {};
        reservations?.forEach((reservation) => {
          const source = reservation.booking_source || "direct";
          sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        });

        const total = Object.values(sourceCounts).reduce(
          (sum, count) => sum + count,
          0
        );
        setTotalBookings(total);

        // Convert to chart data format
        const chartData: BookingSourceData[] = Object.entries(sourceCounts)
          .map(([source, count]) => ({
            source: SOURCE_DISPLAY_NAMES[source] || source,
            count,
            percentage: total > 0 ? (count / total) * 100 : 0,
          }))
          .sort((a, b) => b.count - a.count); // Sort by count descending

        setSourceData(chartData);
      } catch (error) {
        console.error("Error fetching booking source data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingSourceData();
  }, [selectedLocation, selectedMonth, tenant?.id]);

  if (loading) {
    return (
      <View className="bg-white rounded-xl p-6 border border-gray-200">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Booking Sources
        </Text>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (sourceData.length === 0) {
    return (
      <View className="bg-white rounded-xl p-6 border border-gray-200">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Booking Sources
        </Text>
        <Text className="text-gray-500 text-center py-8">
          No booking data available
        </Text>
      </View>
    );
  }

  // Prepare data for Pie chart
  const chartData = sourceData.map((entry, index) => ({
    value: entry.count,
    color:
      SOURCE_COLORS[entry.source] ||
      FALLBACK_COLORS[index % FALLBACK_COLORS.length],
    label: SOURCE_DISPLAY_NAMES[entry.source] || entry.source,
  }));

  return (
    <View className="bg-white rounded-xl p-4 border border-gray-200">
      <View className="flex-row items-center gap-2 mb-4">
        <Ionicons name="pie-chart" size={20} color="#3b82f6" />
        <Text className="text-lg font-semibold text-gray-900">
          Booking Sources
        </Text>
      </View>

      {/* Donut Chart like the image */}
      <View className="items-center mb-6">
        <View
          style={{
            width: 180,
            height: 180,
            borderRadius: 90,
            backgroundColor: "#f3f4f6",
            position: "relative",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Donut ring segments */}
          {(() => {
            let cumulativePercentage = 0;
            return sourceData.map((entry, index) => {
              const percentage = entry.percentage;
              const color =
                SOURCE_COLORS[entry.source] ||
                FALLBACK_COLORS[index % FALLBACK_COLORS.length];

              // Calculate segment for donut
              const startAngle = (cumulativePercentage / 100) * 360;
              const endAngle =
                ((cumulativePercentage + percentage) / 100) * 360;
              cumulativePercentage += percentage;

              // Create segments around the circle
              const segmentWidth = 30; // Width of the donut ring
              const radius = 90;
              const innerRadius = radius - segmentWidth;

              return (
                <View
                  key={entry.source}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* Simplified segment representation */}
                  <View
                    style={{
                      position: "absolute",
                      width: segmentWidth,
                      height: percentage > 50 ? 160 : (percentage / 100) * 160,
                      backgroundColor: color,
                      borderRadius: segmentWidth / 2,
                      transform: [{ rotate: `${startAngle}deg` }],
                      top:
                        percentage > 50
                          ? 10
                          : 90 - ((percentage / 100) * 160) / 2,
                    }}
                  />
                </View>
              );
            });
          })()}

          {/* Center white circle (donut hole) */}
          <View
            className="bg-white rounded-full items-center justify-center shadow-sm"
            style={{
              width: 120,
              height: 120,
              borderWidth: 2,
              borderColor: "#e5e7eb",
            }}
          >
            <Text className="text-3xl font-bold text-gray-900">
              {totalBookings}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">Bookings</Text>
          </View>
        </View>
      </View>

      {/* Legend - Compact List */}
      <View className="gap-2">
        {sourceData.map((entry, index) => {
          const color =
            SOURCE_COLORS[entry.source] ||
            FALLBACK_COLORS[index % FALLBACK_COLORS.length];

          return (
            <View
              key={entry.source}
              className="flex-row items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg"
            >
              <View className="flex-row items-center gap-2.5 flex-1">
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: color,
                    borderWidth: 2,
                    borderColor: "white",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                  }}
                />
                <Text
                  className="text-sm text-gray-700 flex-1"
                  numberOfLines={1}
                >
                  {SOURCE_DISPLAY_NAMES[entry.source] || entry.source}
                </Text>
              </View>
              <Text className="text-sm font-bold text-gray-900 ml-2">
                {entry.count}{" "}
                <Text className="text-xs font-normal text-gray-500">
                  ({entry.percentage.toFixed(0)}%)
                </Text>
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
