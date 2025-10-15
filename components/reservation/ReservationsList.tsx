import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

export interface Reservation {
  id: string;
  guestName: string;
  roomNumber: string;
  status: string;
  checkIn: string;
  checkOut: string;
}

export function ReservationsList({
  reservations,
  onView,
  onEdit,
  onPayment,
}: {
  reservations: Reservation[];
  onView: (id: string) => void;
  onEdit: (reservation: Reservation) => void;
  onPayment: (reservation: Reservation) => void;
}) {
  return (
    <FlatList
      data={reservations}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View className="mb-4 bg-white rounded-lg shadow p-4">
          <Text className="text-lg font-semibold text-gray-800">
            {item.guestName}
          </Text>
          <Text className="text-sm text-gray-500">
            Room: {item.roomNumber} | Status: {item.status}
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            {item.checkIn} - {item.checkOut}
          </Text>
          <View className="flex-row gap-2 mt-2">
            <TouchableOpacity
              onPress={() => onView(item.id)}
              className="px-3 py-1 bg-blue-100 rounded"
            >
              <Text className="text-blue-700 text-xs">View</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onEdit(item)}
              className="px-3 py-1 bg-green-100 rounded"
            >
              <Text className="text-green-700 text-xs">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onPayment(item)}
              className="px-3 py-1 bg-yellow-100 rounded"
            >
              <Text className="text-yellow-700 text-xs">Payment</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <Text className="text-center text-gray-400 mt-8">
          No reservations found.
        </Text>
      }
    />
  );
}
