import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Text, View } from "react-native";
import { VictoryPie, VictoryLegend } from "victory-native";
import { useAuth } from "../../contexts/AuthContext";
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
	const { tenant } = useAuth();
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
					0,
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
				<Text className="text-gray-500 text-center py-8">No booking data available</Text>
			</View>
		);
	}

	// Prepare data for Victory chart
	const chartData = sourceData.map((entry, index) => ({
		x: SOURCE_DISPLAY_NAMES[entry.source] || entry.source,
		y: entry.count,
		label: `${entry.percentage.toFixed(1)}%`,
		fill: SOURCE_COLORS[entry.source] || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
	}));

	return (
		<View className="bg-white rounded-xl p-4 border border-gray-200">
			<View className="flex-row items-center gap-2 mb-4">
				<Ionicons name="pie-chart-outline" size={20} color="#3b82f6" />
				<Text className="text-lg font-semibold text-gray-900">
					Booking Sources
				</Text>
			</View>
			<View className="items-center">
				<VictoryPie
					data={chartData}
					width={screenWidth - 64}
					height={220}
					innerRadius={50}
					colorScale={chartData.map(d => d.fill)}
					style={{
						labels: { fontSize: 12, fill: "white", fontWeight: "bold" }
					}}
				/>
			</View>

			{/* Legend */}
			<View className="mt-4 gap-2">
				{sourceData.map((entry, index) => (
					<View key={entry.source} className="flex-row items-center gap-2">
						<View
							style={{
								width: 12,
								height: 12,
								borderRadius: 6,
								backgroundColor: SOURCE_COLORS[entry.source] || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
							}}
						/>
						<Text className="text-sm text-gray-700 flex-1">
							{SOURCE_DISPLAY_NAMES[entry.source] || entry.source}: {entry.count} ({entry.percentage.toFixed(1)}%)
						</Text>
					</View>
				))}
				<Text className="text-xs text-gray-500 mt-2">
					{totalBookings} total bookings
				</Text>
			</View>
		</View>
	);
}
