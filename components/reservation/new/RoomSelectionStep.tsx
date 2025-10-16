import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Database } from "../../../integrations/supabase/types";

type Room = Database["public"]["Tables"]["rooms"]["Row"];

export interface RoomSelection {
  room_id: string;
  room_number: string;
  room_type: string;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  adults: number;
  children: number;
  room_rate: number;
  total_amount: number;
  currency: string;
}

interface RoomSelectionStepProps {
  rooms: Room[];
  roomSelections: RoomSelection[];
  onRoomSelectionsChange: (selections: RoomSelection[]) => void;
  defaultCurrency: string;
}

export function RoomSelectionStep({
  rooms,
  roomSelections,
  onRoomSelectionsChange,
  defaultCurrency,
}: RoomSelectionStepProps) {
  const [showCheckInPicker, setShowCheckInPicker] = useState<number | null>(
    null
  );
  const [showCheckOutPicker, setShowCheckOutPicker] = useState<number | null>(
    null
  );

  const addRoomSelection = () => {
    const newSelection: RoomSelection = {
      room_id: "",
      room_number: "",
      room_type: "",
      check_in_date: new Date().toISOString().split("T")[0],
      check_out_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      nights: 1,
      adults: 1,
      children: 0,
      room_rate: 0,
      total_amount: 0,
      currency: defaultCurrency,
    };
    onRoomSelectionsChange([...roomSelections, newSelection]);
  };

  const updateRoomSelection = (
    index: number,
    field: keyof RoomSelection,
    value: any
  ) => {
    const updated = [...roomSelections];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-calculate nights and total when dates or rate change
    if (
      field === "check_in_date" ||
      field === "check_out_date" ||
      field === "room_rate"
    ) {
      const checkIn = new Date(updated[index].check_in_date);
      const checkOut = new Date(updated[index].check_out_date);
      const nights = Math.max(
        1,
        Math.ceil(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
        )
      );
      updated[index].nights = nights;
      updated[index].total_amount = updated[index].room_rate * nights;
    }

    // Update room details when room is selected
    if (field === "room_id" && value) {
      const selectedRoom = rooms.find((room) => room.id === value);
      if (selectedRoom) {
        updated[index].room_number = selectedRoom.room_number || "";
        updated[index].room_type = selectedRoom.room_type || "";
        updated[index].room_rate = selectedRoom.base_rate || 0;
        updated[index].currency = selectedRoom.currency || defaultCurrency;
        updated[index].total_amount =
          (selectedRoom.base_rate || 0) * updated[index].nights;
      }
    }

    onRoomSelectionsChange(updated);
  };

  const removeRoomSelection = (index: number) => {
    Alert.alert(
      "Remove Room",
      "Are you sure you want to remove this room selection?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            onRoomSelectionsChange(
              roomSelections.filter((_, i) => i !== index)
            );
          },
        },
      ]
    );
  };

  const handleDateChange = (
    event: any,
    selectedDate: Date | undefined,
    index: number,
    field: "check_in_date" | "check_out_date"
  ) => {
    if (field === "check_in_date") {
      setShowCheckInPicker(null);
    } else {
      setShowCheckOutPicker(null);
    }

    if (selectedDate) {
      updateRoomSelection(
        index,
        field,
        selectedDate.toISOString().split("T")[0]
      );
    }
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="space-y-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Ionicons name="bed" size={24} color="#3B82F6" />
            <Text className="text-lg font-semibold ml-2 text-gray-900">
              Room Selection
            </Text>
          </View>
          <TouchableOpacity
            onPress={addRoomSelection}
            className="bg-blue-600 rounded-lg px-3 py-2 flex-row items-center"
          >
            <Ionicons name="add" size={16} color="white" />
            <Text className="text-white font-medium ml-1">Add Room</Text>
          </TouchableOpacity>
        </View>

        {roomSelections.length === 0 && (
          <View className="bg-gray-50 border border-gray-200 rounded-lg p-6 items-center">
            <Ionicons name="bed-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 text-center mt-2">
              No rooms selected yet. Click "Add Room" to get started.
            </Text>
          </View>
        )}

        {roomSelections.map((selection, index) => (
          <View
            key={index}
            className="bg-white border border-gray-300 rounded-lg p-4 space-y-4"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-gray-900">
                Room Selection {index + 1}
              </Text>
              <TouchableOpacity
                onPress={() => removeRoomSelection(index)}
                className="bg-red-100 rounded-full p-2"
              >
                <Ionicons name="trash" size={16} color="#DC2626" />
              </TouchableOpacity>
            </View>

            {/* Room Selection */}
            <View className="space-y-2">
              <Text className="text-sm font-medium text-gray-700">
                Select Room *
              </Text>
              <View className="bg-gray-50 border border-gray-300 rounded-lg">
                <Picker
                  selectedValue={selection.room_id}
                  onValueChange={(value) =>
                    updateRoomSelection(index, "room_id", value)
                  }
                  style={{ height: 50 }}
                >
                  <Picker.Item label="Select a room" value="" />
                  {rooms.map((room) => (
                    <Picker.Item
                      key={room.id}
                      label={`${room.room_number} - ${room.room_type} (${room.currency} ${room.base_rate}/night)`}
                      value={room.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Check-in Date */}
            <View className="space-y-2">
              <Text className="text-sm font-medium text-gray-700">
                Check-in Date *
              </Text>
              <TouchableOpacity
                onPress={() => setShowCheckInPicker(index)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-3 flex-row items-center justify-between"
              >
                <Text className="text-gray-900">
                  {new Date(selection.check_in_date).toLocaleDateString()}
                </Text>
                <Ionicons name="calendar" size={20} color="#6B7280" />
              </TouchableOpacity>
              {showCheckInPicker === index && (
                <DateTimePicker
                  value={new Date(selection.check_in_date)}
                  mode="date"
                  onChange={(event, date) =>
                    handleDateChange(event, date, index, "check_in_date")
                  }
                />
              )}
            </View>

            {/* Check-out Date */}
            <View className="space-y-2">
              <Text className="text-sm font-medium text-gray-700">
                Check-out Date *
              </Text>
              <TouchableOpacity
                onPress={() => setShowCheckOutPicker(index)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-3 flex-row items-center justify-between"
              >
                <Text className="text-gray-900">
                  {new Date(selection.check_out_date).toLocaleDateString()}
                </Text>
                <Ionicons name="calendar" size={20} color="#6B7280" />
              </TouchableOpacity>
              {showCheckOutPicker === index && (
                <DateTimePicker
                  value={new Date(selection.check_out_date)}
                  mode="date"
                  onChange={(event, date) =>
                    handleDateChange(event, date, index, "check_out_date")
                  }
                />
              )}
            </View>

            {/* Adults and Children */}
            <View className="flex-row space-x-4">
              <View className="flex-1 space-y-2">
                <Text className="text-sm font-medium text-gray-700">
                  Adults *
                </Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
                  value={selection.adults.toString()}
                  onChangeText={(value) =>
                    updateRoomSelection(index, "adults", parseInt(value) || 1)
                  }
                  placeholder="1"
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1 space-y-2">
                <Text className="text-sm font-medium text-gray-700">
                  Children
                </Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
                  value={selection.children.toString()}
                  onChangeText={(value) =>
                    updateRoomSelection(index, "children", parseInt(value) || 0)
                  }
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Room Rate */}
            <View className="space-y-2">
              <Text className="text-sm font-medium text-gray-700">
                Room Rate per Night
              </Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
                value={selection.room_rate.toString()}
                onChangeText={(value) =>
                  updateRoomSelection(
                    index,
                    "room_rate",
                    parseFloat(value) || 0
                  )
                }
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>

            {/* Summary */}
            {selection.room_id && (
              <View className="bg-blue-50 p-3 rounded-lg">
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-700">
                    {selection.nights} night{selection.nights > 1 ? "s" : ""} ×{" "}
                    {selection.currency} {selection.room_rate}
                  </Text>
                  <Text className="text-base font-semibold text-blue-700">
                    {selection.currency} {selection.total_amount.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
