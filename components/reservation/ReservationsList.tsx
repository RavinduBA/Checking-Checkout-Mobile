import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ReservationExpensesDisplay } from "./ReservationExpensesDisplay";
import { useAuth, useTenant, useLocationContext } from "../../hooks";
import type { Database } from "../../integrations/supabase/types";

type Currency = Database["public"]["Enums"]["currency_type"];

export interface Reservation {
	id: string;
	reservation_number: string;
	guest_name: string;
	guest_email?: string;
	guest_phone?: string;
	room_id: string;
	location_id: string;
	tenant_id: string;
	check_in_date: string;
	check_out_date: string;
	adults: number;
	children: number;
	nights: number;
	room_rate: number;
	currency: Currency;
	total_amount: number;
	paid_amount: number | null;
	balance_amount: number | null;
	status:
		| "tentative"
		| "confirmed"
		| "checked_in"
		| "checked_out"
		| "cancelled";
	booking_source: string;
	special_requests?: string;
	created_at: string;
	updated_at: string;
	// Relations
	rooms?: {
		room_number: string;
		room_type: string;
		bed_type?: string;
		description?: string;
		amenities?: string[];
	};
	locations?: {
		name: string;
		address?: string;
		phone?: string;
		email?: string;
	};
}

interface ReservationsListProps {
	reservations: Reservation[];
	onView: (id: string) => void;
	onEdit: (reservation: Reservation) => void;
	onPayment: (reservation: Reservation) => void;
	onAddIncome?: (reservation: Reservation) => void;
	onPrint?: (reservation: Reservation) => void;
	selectedCurrency: Currency;
}

export function ReservationsList({
	reservations,
	onView,
	onEdit,
	onPayment,
	onAddIncome,
	onPrint,
	selectedCurrency,
}: ReservationsListProps) {
	const { tenant } = useTenant();
	const { selectedLocation } = useLocationContext();
	const [convertedAmounts, setConvertedAmounts] = useState<
		Record<string, number>
	>({});
	const [loading, setLoading] = useState(false);

	// Utility functions
	const getStatusColor = (status: string): string => {
		const colors: Record<string, string> = {
			confirmed: "bg-green-100",
			pending: "bg-yellow-100",
			cancelled: "bg-red-100",
			checked_in: "bg-blue-100",
			checked_out: "bg-gray-100",
			tentative: "bg-orange-100",
		};
		return colors[status] || "bg-gray-100";
	};

	const getStatusTextColor = (status: string): string => {
		const colors: Record<string, string> = {
			confirmed: "text-green-800",
			pending: "text-yellow-800",
			cancelled: "text-red-800",
			checked_in: "text-blue-800",
			checked_out: "text-gray-800",
			tentative: "text-orange-800",
		};
		return colors[status] || "text-gray-800";
	};

	const getStatusText = (status: string) => {
		const statusMap: Record<string, string> = {
			confirmed: "Confirmed",
			checked_in: "Checked In",
			checked_out: "Checked Out",
			cancelled: "Cancelled",
			tentative: "Tentative",
		};
		return statusMap[status?.toLowerCase()] || status;
	};

	const getCurrencySymbol = (currency: string): string => {
		const symbols: Record<string, string> = {
			LKR: "Rs.",
			USD: "$",
			EUR: "€",
			GBP: "£",
		};
		return symbols[currency] || currency;
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const canShowPaymentButton = (reservation: Reservation): boolean => {
		return (
			reservation.status !== "cancelled" &&
			reservation.status !== "checked_out"
		);
	};

	const getTotalPayableAmount = (reservation: Reservation): number => {
		// Total payable = total_amount + pending services (calculated via balance_amount)
		return (
			(reservation.paid_amount || 0) + (reservation.balance_amount || 0)
		);
	};

	// Effect to convert amounts when currency or reservations change
	useEffect(() => {
		if (!tenant?.id || !selectedLocation) {
			return;
		}

		const convertAmounts = async () => {
			if (!reservations.length) return;

			setLoading(true);
			const newConvertedAmounts: Record<string, number> = {};

			for (const reservation of reservations) {
				const roomAmount = reservation.room_rate * reservation.nights;
				try {
					// For now, use simple conversion - you can implement convertCurrency utility
					// const convertedAmount = await convertCurrency(
					//   roomAmount,
					//   reservation.currency,
					//   selectedCurrency,
					//   tenant.id,
					//   selectedLocation,
					// );
					// Simple fallback conversion
					const convertedAmount =
						reservation.currency === selectedCurrency
							? roomAmount
							: roomAmount; // Add your conversion logic here

					newConvertedAmounts[reservation.id] = convertedAmount;
				} catch (error) {
					console.error(
						`Failed to convert currency for reservation ${reservation.id}:`,
						error,
					);
					newConvertedAmounts[reservation.id] = roomAmount;
				}
			}

			setConvertedAmounts(newConvertedAmounts);
			setLoading(false);
		};

		convertAmounts();
	}, [reservations, selectedCurrency, tenant?.id, selectedLocation]);

	const renderReservationCard = ({ item }: { item: Reservation }) => {
		return (
			<View className="mb-4 bg-white rounded-lg shadow-md p-4">
				{/* Header: Guest Name and Status */}
				<View className="flex-row justify-between items-start mb-3">
					<View className="flex-1">
						<Text className="font-semibold text-base text-gray-800">
							{item.guest_name}
						</Text>
						<Text className="text-xs text-gray-500 mt-1">
							{item.reservation_number}
						</Text>
					</View>
					<View
						className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}
					>
						<Text
							className={`text-xs font-medium ${getStatusTextColor(item.status)}`}
						>
							{getStatusText(item.status)}
						</Text>
					</View>
				</View>

				{/* Details Section */}
				<View className="space-y-2">
					{/* Location and Room */}
					<View className="flex-row items-center">
						<Ionicons name="location-outline" size={14} color="#6B7280" />
						<Text className="text-sm text-gray-600 ml-2">
							{item.locations?.name || "Unknown"} - Room{" "}
							{item.rooms?.room_number || "N/A"}
						</Text>
					</View>

					{/* Check-in/Check-out Dates */}
					<View className="flex-row items-center">
						<Ionicons name="calendar-outline" size={14} color="#6B7280" />
						<Text className="text-sm text-gray-600 ml-2">
							{formatDate(item.check_in_date)} -{" "}
							{formatDate(item.check_out_date)}
						</Text>
					</View>

					{/* Room Amount */}
					<View className="flex-row items-center">
						<Ionicons name="cash-outline" size={14} color="#6B7280" />
						<Text className="text-sm text-gray-600 ml-2">
							Room: {getCurrencySymbol(item.currency)}{" "}
							{(item.room_rate * item.nights).toLocaleString()}
						</Text>
					</View>

					{/* Additional Services */}
					<View className="flex-row items-start">
						<Ionicons name="cash-outline" size={14} color="#6B7280" />
						<View className="ml-2 flex-1">
							<Text className="text-sm text-gray-600">Services: </Text>
							<ReservationExpensesDisplay
								reservationId={item.id}
								currency={selectedCurrency}
								isCompact={true}
							/>
						</View>
					</View>

					{/* Financial Summary */}
					<View className="mt-2 pt-2 border-t border-gray-200">
						<View className="flex-row justify-between">
							<Text className="text-xs text-gray-500">Paid:</Text>
							<Text className="text-xs font-medium text-blue-600">
								{getCurrencySymbol(item.currency)}{" "}
								{(item.paid_amount || 0).toLocaleString()}
							</Text>
						</View>
						<View className="flex-row justify-between mt-1">
							<Text className="text-xs text-gray-500">Balance:</Text>
							<Text
								className={`text-xs font-medium ${
									(item.balance_amount || 0) > 0
										? "text-red-600"
										: "text-green-600"
								}`}
							>
								{getCurrencySymbol(item.currency)}{" "}
								{(item.balance_amount || 0).toLocaleString()}
							</Text>
						</View>
					</View>
				</View>

				{/* Action Buttons */}
				<View className="flex-row flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
					<TouchableOpacity
						onPress={() => onView(item.id)}
						className="px-4 py-2 bg-blue-100 rounded-lg flex-row items-center"
					>
						<Text className="text-blue-700 text-xs font-medium">View</Text>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={() => onEdit(item)}
						className="px-4 py-2 bg-green-100 rounded-lg flex-row items-center"
					>
						<Text className="text-green-700 text-xs font-medium">Edit</Text>
					</TouchableOpacity>

					{canShowPaymentButton(item) && (
						<TouchableOpacity
							onPress={() => onPayment(item)}
							className="px-4 py-2 bg-yellow-100 rounded-lg flex-row items-center"
						>
							<Text className="text-yellow-700 text-xs font-medium">
								Payment
							</Text>
						</TouchableOpacity>
					)}

					{onAddIncome && canShowPaymentButton(item) && (
						<TouchableOpacity
							onPress={() => onAddIncome(item)}
							className="px-4 py-2 bg-purple-100 rounded-lg flex-row items-center"
						>
							<Text className="text-purple-700 text-xs font-medium">
								Add Service
							</Text>
						</TouchableOpacity>
					)}

					{onPrint && (
						<TouchableOpacity
							onPress={() => onPrint(item)}
							className="px-4 py-2 bg-gray-100 rounded-lg flex-row items-center"
						>
							<Text className="text-gray-700 text-xs font-medium">Print</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>
		);
	};

	if (loading) {
		return (
			<View className="flex-1 justify-center items-center p-8">
				<ActivityIndicator size="large" color="#3B82F6" />
				<Text className="text-gray-500 mt-2">Converting amounts...</Text>
			</View>
		);
	}

	return (
		<FlatList
			data={reservations}
			keyExtractor={(item) => item.id}
			contentContainerStyle={{ padding: 16 }}
			renderItem={renderReservationCard}
			ListEmptyComponent={
				<View className="flex-1 justify-center items-center p-8">
					<Text className="text-center text-gray-400 text-base">
						No reservations found.
					</Text>
					<Text className="text-center text-gray-400 text-sm mt-2">
						Create your first reservation to get started.
					</Text>
				</View>
			}
		/>
	);
}
