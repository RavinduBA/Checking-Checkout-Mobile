import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ScrollView,
	ActivityIndicator,
} from "react-native";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLocationContext } from "@/contexts/LocationContext";
import { getAvailableCurrencies } from "@/utils/currency";

interface ReportFiltersProps {
	dateFrom: string;
	setDateFrom: (date: string) => void;
	dateTo: string;
	setDateTo: (date: string) => void;
	baseCurrency: string;
	setBaseCurrency: (currency: string) => void;
	onRefresh: () => void;
	onExport: () => void;
}

export function ReportFilters({
	dateFrom,
	setDateFrom,
	dateTo,
	setDateTo,
	baseCurrency,
	setBaseCurrency,
	onRefresh,
	onExport,
}: ReportFiltersProps) {
	const { profile } = useUserProfile();
	const { getSelectedLocationData } = useLocationContext();
	const selectedLocationData = getSelectedLocationData();
	const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchAvailableCurrencies = useCallback(async () => {
		if (!profile?.tenant_id || !selectedLocationData?.id) {
			setAvailableCurrencies(["LKR", "USD", "EUR", "GBP"]);
			setLoading(false);
			return;
		}

		setLoading(true);
		try {
			const currencies = await getAvailableCurrencies(
				profile.tenant_id,
				selectedLocationData.id,
			);
			setAvailableCurrencies(currencies.length > 0 ? currencies : ["LKR", "USD", "EUR", "GBP"]);
			
			// Set default currency to LKR if available, otherwise use the first available currency
			if (currencies.length > 0 && !currencies.includes(baseCurrency)) {
				setBaseCurrency(currencies.includes("LKR") ? "LKR" : currencies[0]);
			}
		} catch (error) {
			console.error("Error fetching available currencies:", error);
			setAvailableCurrencies(["LKR", "USD", "EUR", "GBP"]); // Fallback currencies
		} finally {
			setLoading(false);
		}
	}, [profile?.tenant_id, selectedLocationData?.id, baseCurrency, setBaseCurrency]);

	useEffect(() => {
		fetchAvailableCurrencies();
	}, [fetchAvailableCurrencies]);

	return (
		<View className="bg-white rounded-lg p-4 mx-4 mb-4 border border-gray-200">
			<View className="flex-row items-center mb-3">
				<Ionicons name="calendar-outline" size={18} color="#1f2937" />
				<Text className="text-sm font-semibold text-gray-900 ml-2">
					Report Filters
				</Text>
			</View>

			{/* Currency Selector */}
			<View className="mb-3">
				<Text className="text-xs text-gray-600 mb-2">Base Currency</Text>
				{loading ? (
					<View className="py-2">
						<ActivityIndicator size="small" color="#3b82f6" />
					</View>
				) : (
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						<View className="flex-row gap-2">
							{availableCurrencies.map((currency) => (
								<TouchableOpacity
									key={currency}
									onPress={() => setBaseCurrency(currency)}
									className={`px-4 py-2 rounded-full ${
										baseCurrency === currency ? "bg-blue-500" : "bg-gray-200"
									}`}
								>
									<Text
										className={`text-sm font-medium ${
											baseCurrency === currency ? "text-white" : "text-gray-700"
										}`}
									>
										{currency}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</ScrollView>
				)}
			</View>

			{/* Date Range */}
			<View className="gap-3 mb-3">
				<View>
					<Text className="text-xs text-gray-600 mb-1">From Date</Text>
					<TextInput
						value={dateFrom}
						onChangeText={setDateFrom}
						placeholder="YYYY-MM-DD"
						className="bg-gray-50 rounded-lg px-3 py-2 text-sm border border-gray-200"
						placeholderTextColor="#999"
					/>
				</View>
				<View>
					<Text className="text-xs text-gray-600 mb-1">To Date</Text>
					<TextInput
						value={dateTo}
						onChangeText={setDateTo}
						placeholder="YYYY-MM-DD"
						className="bg-gray-50 rounded-lg px-3 py-2 text-sm border border-gray-200"
						placeholderTextColor="#999"
					/>
				</View>
			</View>

			{/* Action Buttons */}
			<View className="flex-row gap-2">
				<TouchableOpacity
					onPress={onRefresh}
					className="flex-1 bg-gray-200 rounded-lg py-2 flex-row items-center justify-center gap-1"
				>
					<Ionicons name="refresh" size={16} color="#374151" />
					<Text className="text-sm font-medium text-gray-700">Refresh</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={onExport}
					className="flex-1 bg-blue-500 rounded-lg py-2 flex-row items-center justify-center gap-1"
				>
					<Ionicons name="download-outline" size={16} color="#fff" />
					<Text className="text-sm font-medium text-white">Export</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}
