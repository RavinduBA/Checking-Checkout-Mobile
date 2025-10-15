import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Reservation } from "./ReservationsList";

export function ReservationEditDialog({
  visible,
  reservation,
  onClose,
}: {
  visible: boolean;
  reservation: Reservation | null;
  onClose: () => void;
}) {
  if (!reservation) return null;
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white p-6">
        <Text className="text-xl font-bold mb-2">Edit Reservation</Text>
        <Text className="mb-1">Guest: {reservation.guestName}</Text>
        <Text className="mb-1">Room: {reservation.roomNumber}</Text>
        {/* TODO: Add edit form logic */}
        <TouchableOpacity
          onPress={onClose}
          className="mt-6 px-4 py-2 bg-gray-200 rounded"
        >
          <Text className="text-gray-700 text-center">Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
