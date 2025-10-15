import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ReservationsFiltersProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  selectedCurrency: "LKR" | "USD";
  setSelectedCurrency: (currency: "LKR" | "USD") => void;
  onNewReservation: () => void;
  onNewCompactReservation: () => void;
}

export function ReservationsFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  selectedCurrency,
  setSelectedCurrency,
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
            onChangeText={setSearchQuery}
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
          onPress={() => setStatusFilter("all")}
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
          onPress={() => setStatusFilter("tentative")}
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
          onPress={() => setStatusFilter("confirmed")}
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
          onPress={() => setStatusFilter("checked_in")}
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
          onPress={() => setStatusFilter("checked_out")}
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
          onPress={() => setStatusFilter("cancelled")}
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

      {/* Currency Selector */}
      <View className="px-4 pb-3 flex-row items-center gap-2">
        <Text className="text-sm text-gray-600">Currency:</Text>
        <TouchableOpacity
          className={`px-3 py-1 rounded border ${
            selectedCurrency === "LKR"
              ? "bg-blue-100 border-blue-300"
              : "bg-white border-gray-200"
          }`}
          onPress={() => setSelectedCurrency("LKR")}
        >
          <Text
            className={`text-xs font-medium ${
              selectedCurrency === "LKR" ? "text-blue-700" : "text-gray-600"
            }`}
          >
            LKR
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`px-3 py-1 rounded border ${
            selectedCurrency === "USD"
              ? "bg-blue-100 border-blue-300"
              : "bg-white border-gray-200"
          }`}
          onPress={() => setSelectedCurrency("USD")}
        >
          <Text
            className={`text-xs font-medium ${
              selectedCurrency === "USD" ? "text-blue-700" : "text-gray-600"
            }`}
          >
            USD
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNewCompactReservation}
          className="ml-auto bg-gray-100 rounded px-3 py-1"
        >
          <Text className="text-gray-700 text-xs font-medium">Quick Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
