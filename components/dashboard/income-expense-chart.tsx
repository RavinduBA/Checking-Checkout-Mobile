import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View, Dimensions } from "react-native";
import { VictoryBar, VictoryChart, VictoryTheme, VictoryAxis, VictoryLine } from "victory-native";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import type { Database } from "../../integrations/supabase/types";
import {
	convertCurrency,
	formatAmountWithSymbol,
	getCurrencySymbol,
	getDisplayCurrency,
} from "../../utils/currency";

type Location = Database["public"]["Tables"]["locations"]["Row"];

interface ChartData {
	date: string;
	income: number;
	expenses: number;
	net: number;
}

interface IncomeExpenseChartProps {
	selectedLocation: string;
	selectedMonth: string;
	locations: Location[];
}

const chartConfig = {
	income: {
		label: "Income",
		color: "hsl(var(--primary))",
	},
	expenses: {
		label: "Expenses",
		color: "hsl(var(--destructive))",
	},
	net: {
		label: "Net",
		color: "hsl(var(--chart-3))",
	},
} satisfies ChartConfig;

export function IncomeExpenseChart({
	selectedLocation,
	selectedMonth,
	locations,
}: IncomeExpenseChartProps) {
	const [loading, setLoading] = useState(true);
	const [chartData, setChartData] = useState<ChartData[]>([]);
	const [todayIncome, setTodayIncome] = useState(0);
	const [todayExpenses, setTodayExpenses] = useState(0);
	const [weeklyProfit, setWeeklyProfit] = useState(0);
	const [profitMargin, setProfitMargin] = useState(0);
	const { tenant } = useAuth();
	const displayCurrency = getDisplayCurrency();
	const screenWidth = Dimensions.get("window").width;

	useEffect(() => {
		const fetchFinancialData = async () => {
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
					setChartData([]);
					setTodayIncome(0);
					setTodayExpenses(0);
					setWeeklyProfit(0);
					setProfitMargin(0);
					setLoading(false);
					return;
				}

				// Set date range based on selected month or last 30 days
				const endDate = new Date();
				const startDate = selectedMonth
					? new Date(selectedMonth + "-01")
					: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

				if (selectedMonth) {
					const [year, month] = selectedMonth.split("-");
					endDate.setFullYear(parseInt(year), parseInt(month), 0); // Last day of selected month
				}

				const dateRange = [];
				const currentDate = new Date(startDate);
				while (currentDate <= endDate) {
					dateRange.push(currentDate.toISOString().split("T")[0]);
					currentDate.setDate(currentDate.getDate() + 1);
				}

				// Build location filter
				const locationFilter = !selectedLocation
					? {}
					: { location_id: selectedLocation };

				// Fetch income and expenses data
				const [incomeData, expensesData] = await Promise.all([
					supabase
						.from("income")
						.select("date, amount, currency")
						.gte("date", startDate.toISOString().split("T")[0])
						.lte("date", endDate.toISOString().split("T")[0])
						.in("location_id", tenantLocationIds)
						.match(locationFilter),
					supabase
						.from("expenses")
						.select("date, amount, currency")
						.gte("date", startDate.toISOString().split("T")[0])
						.lte("date", endDate.toISOString().split("T")[0])
						.in("location_id", tenantLocationIds)
						.match(locationFilter),
				]);

				// Process data for chart
				const processedData: ChartData[] = await Promise.all(
					dateRange.map(async (date) => {
						const dayIncome =
							incomeData.data?.filter((item) => item.date === date) || [];
						const dayExpenses =
							expensesData.data?.filter((item) => item.date === date) || [];

						// Convert currencies and sum amounts
						let totalIncome = 0;
						let totalExpenses = 0;

						for (const income of dayIncome) {
							const convertedAmount = await convertCurrency(
								income.amount,
								income.currency || "LKR",
								displayCurrency,
								tenant.id,
								selectedLocation,
							);
							totalIncome += convertedAmount;
						}

						for (const expense of dayExpenses) {
							const convertedAmount = await convertCurrency(
								expense.amount,
								expense.currency || "LKR",
								displayCurrency,
								tenant.id,
								selectedLocation,
							);
							totalExpenses += convertedAmount;
						}

						return {
							date,
							income: totalIncome,
							expenses: -totalExpenses, // Negative for chart display
							net: totalIncome - totalExpenses,
						};
					}),
				);

				setChartData(processedData);

				// Calculate today's data
				const today = new Date().toISOString().split("T")[0];
				const todayData = processedData.find((item) => item.date === today);
				setTodayIncome(todayData?.income || 0);
				setTodayExpenses(Math.abs(todayData?.expenses || 0));

				// Calculate weekly profit (last 7 days)
				const last7Days = processedData.slice(-7);
				const weeklyIncomeTotal = last7Days.reduce(
					(sum, day) => sum + day.income,
					0,
				);
				const weeklyExpensesTotal = last7Days.reduce(
					(sum, day) => sum + Math.abs(day.expenses),
					0,
				);
				const profit = weeklyIncomeTotal - weeklyExpensesTotal;
				const margin =
					weeklyIncomeTotal > 0 ? (profit / weeklyIncomeTotal) * 100 : 0;

				setWeeklyProfit(profit);
				setProfitMargin(margin);
			} catch (error) {
				console.error("Error fetching financial data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchFinancialData();
	}, [selectedLocation, selectedMonth, tenant?.id, displayCurrency]);

	if (loading) {
		return (
			<View className="bg-white rounded-xl p-6 border border-gray-200">
				<Text className="text-lg font-semibold text-gray-900 mb-4">
					Income vs Expenses
				</Text>
				<ActivityIndicator size="large" color="#3b82f6" />
			</View>
		);
	}

	const locationName = selectedLocation
		? locations.find((l) => l.id === selectedLocation)?.name || "All Locations"
		: "All Locations";

	return (
		<View className="gap-4">
			{/* Summary Cards */}
			<ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
				<View className="bg-white rounded-xl p-4 border border-gray-200 min-w-[160px]">
					<View className="flex-row items-center justify-between mb-2">
						<Text className="text-sm text-gray-600">
							{selectedMonth ? "Monthly Income" : "Today Income"}
						</Text>
						<Ionicons name="arrow-up-circle" size={20} color="#10b981" />
					</View>
					<Text className="text-2xl font-bold text-green-600">
						{formatAmountWithSymbol(todayIncome, displayCurrency)}
					</Text>
					<Text className="text-xs text-gray-500 mt-1">{locationName}</Text>
				</View>

				<View className="bg-white rounded-xl p-4 border border-gray-200 min-w-[160px]">
					<View className="flex-row items-center justify-between mb-2">
						<Text className="text-sm text-gray-600">
							{selectedMonth ? "Monthly Expenses" : "Today Expenses"}
						</Text>
						<Ionicons name="arrow-down-circle" size={20} color="#ef4444" />
					</View>
					<Text className="text-2xl font-bold text-red-600">
						{formatAmountWithSymbol(todayExpenses, displayCurrency)}
					</Text>
					<Text className="text-xs text-gray-500 mt-1">{locationName}</Text>
				</View>

				<View className="bg-white rounded-xl p-4 border border-gray-200 min-w-[160px]">
					<View className="flex-row items-center justify-between mb-2">
						<Text className="text-sm text-gray-600">Weekly Profit</Text>
						<Ionicons name="trending-up" size={20} color="#3b82f6" />
					</View>
					<Text className="text-2xl font-bold text-blue-600">
						{formatAmountWithSymbol(weeklyProfit, displayCurrency)}
					</Text>
					<Text className="text-xs text-gray-500 mt-1">
						{profitMargin.toFixed(1)}% margin
					</Text>
				</View>
			</ScrollView>

			{/* Chart */}
			<View className="bg-white rounded-xl p-4 border border-gray-200">
				<Text className="text-lg font-semibold text-gray-900 mb-1">
					Income vs Expenses
				</Text>
				<Text className="text-sm text-gray-600 mb-4">
					{selectedMonth ? "Monthly Overview" : "Last 30 Days Overview"}
				</Text>
				<View style={{ height: 250 }}>
					<VictoryChart
						theme={VictoryTheme.material}
						width={screenWidth - 64}
						height={250}
						domainPadding={{ x: 10 }}
					>
						<VictoryAxis
							tickFormat={(date: string) => {
								const d = new Date(date);
								return `${d.getMonth() + 1}/${d.getDate()}`;
							}}
							style={{
								tickLabels: { fontSize: 8, angle: -45, textAnchor: "end" }
							}}
						/>
						<VictoryAxis
							dependentAxis
							tickFormat={(value: number) => `${getCurrencySymbol(displayCurrency)}${Math.abs(value)}`}
							style={{
								tickLabels: { fontSize: 10 }
							}}
						/>
						<VictoryBar
							data={chartData.map(d => ({ x: d.date, y: d.income }))}
							style={{ data: { fill: "#3b82f6" } }}
						/>
						<VictoryBar
							data={chartData.map(d => ({ x: d.date, y: d.expenses }))}
							style={{ data: { fill: "#ef4444" } }}
						/>
						<VictoryLine
							data={chartData.map(d => ({ x: d.date, y: d.net }))}
							style={{ data: { stroke: "#10b981", strokeWidth: 2 } }}
						/>
					</VictoryChart>
				</View>
			</View>
		</View>
	);
}
