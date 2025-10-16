import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CurrencySelector } from "../common/CurrencySelector";
import type { Database } from "../../integrations/supabase/types";

type Currency = Database["public"]["Enums"]["currency_type"];

interface Location {
  id: string;
  name: string;
}

interface ReservationsFiltersProps {
  locations?: Location[];
  selectedLocation?: string;
  onLocationChange?: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  onNewReservation: () => void;
  onNewCompactReservation?: () => void;
}

export function ReservationsFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  selectedCurrency,
  onCurrencyChange,
  onNewReservation,
  onNewCompactReservation,
}: ReservationsFiltersProps) {
  return (
    <View className="bg-white border-b border-gray-200">
      {/* Search and Action Buttons */}
      <View className="px-4 py-3 flex-row items-center gap-3">
        <View className="flex-1 relative">
          <Ionicons
            name="search-outline"
            size={20}
            color="#6B7280"
            style={{ position: "absolute", left: 12, top: 10, zIndex: 1 }}
          />
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-gray-700"
            placeholder="Search by guest name, room, or confirmation #"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>

        <TouchableOpacity
          onPress={onNewReservation}
          className="bg-blue-600 rounded-lg px-4 py-2 flex-row items-center"
        >
          <Ionicons name="add" size={16} color="white" />
          <Text className="text-white font-medium ml-1">New</Text>
        </TouchableOpacity>
      </View>

      {/* Status Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 pb-3"
        contentContainerStyle={{ gap: 8 }}
      >
        <TouchableOpacity
          className={`px-3 py-2 rounded-full border ${
            statusFilter === "all"
              ? "bg-blue-100 border-blue-300"
              : "bg-white border-gray-200"
          }`}
          onPress={() => onStatusFilterChange("all")}
        >
          <Text
            className={`text-sm font-medium ${
              statusFilter === "all" ? "text-blue-700" : "text-gray-600"
            }`}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`px-3 py-2 rounded-full border ${
            statusFilter === "tentative"
              ? "bg-yellow-100 border-yellow-300"
              : "bg-white border-gray-200"
          }`}
          onPress={() => onStatusFilterChange("tentative")}
        >
          <Text
            className={`text-sm font-medium ${
              statusFilter === "tentative" ? "text-yellow-700" : "text-gray-600"
            }`}
          >
            Tentative
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`px-3 py-2 rounded-full border ${
            statusFilter === "confirmed"
              ? "bg-green-100 border-green-300"
              : "bg-white border-gray-200"
          }`}
          onPress={() => onStatusFilterChange("confirmed")}
        >
          <Text
            className={`text-sm font-medium ${
              statusFilter === "confirmed" ? "text-green-700" : "text-gray-600"
            }`}
          >
            Confirmed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`px-3 py-2 rounded-full border ${
            statusFilter === "checked_in"
              ? "bg-blue-100 border-blue-300"
              : "bg-white border-gray-200"
          }`}
          onPress={() => onStatusFilterChange("checked_in")}
        >
          <Text
            className={`text-sm font-medium ${
              statusFilter === "checked_in" ? "text-blue-700" : "text-gray-600"
            }`}
          >
            Checked In
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`px-3 py-2 rounded-full border ${
            statusFilter === "checked_out"
              ? "bg-gray-100 border-gray-300"
              : "bg-white border-gray-200"
          }`}
          onPress={() => onStatusFilterChange("checked_out")}
        >
          <Text
            className={`text-sm font-medium ${
              statusFilter === "checked_out" ? "text-gray-700" : "text-gray-600"
            }`}
          >
            Checked Out
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`px-3 py-2 rounded-full border ${
            statusFilter === "cancelled"
              ? "bg-red-100 border-red-300"
              : "bg-white border-gray-200"
          }`}
          onPress={() => onStatusFilterChange("cancelled")}
        >
          <Text
            className={`text-sm font-medium ${
              statusFilter === "cancelled" ? "text-red-700" : "text-gray-600"
            }`}
          >
            Cancelled
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Currency Selector and Quick Add */}
      <View className="px-4 pb-3 flex-row items-center gap-3">
        <View className="flex-1">
          <CurrencySelector
            currency={selectedCurrency}
            onCurrencyChange={onCurrencyChange}
            label="Currency"
            showGoogleSearchLink={false}
          />
        </View>

        {onNewCompactReservation && (
          <TouchableOpacity
            onPress={onNewCompactReservation}
            className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-2"
          >
            <Text className="text-gray-700 text-sm font-medium">Quick Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
