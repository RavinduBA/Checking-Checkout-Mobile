import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocationContext } from "../../contexts/LocationContext";
import { useRoomAvailability } from "../../hooks/useRoomAvailability";
import { useToast } from "../../hooks/useToast";
import { Database } from "../../integrations/supabase/types";
import { convertCurrency } from "../../utils/currency";
import { CurrencySelector } from "../common/CurrencySelector";

type Room = Database["public"]["Tables"]["rooms"]["Row"];

export interface RoomSelection {
  id: string; // Unique identifier for this room selection
  room_id: string;
  room_rate: number;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  currency: string;
  arrival_time: string;
  nights: number;
  total_amount: number;
  showRoomDropdown?: boolean;
}

interface MultiRoomSelectorProps {
  rooms: Room[];
  roomSelections: RoomSelection[];
  onRoomSelectionsChange: (selections: RoomSelection[]) => void;
  defaultCurrency?: string;
}

export function MultiRoomSelector({
  rooms,
  roomSelections,
  onRoomSelectionsChange,
  defaultCurrency = "LKR",
}: MultiRoomSelectorProps) {
  const [showCheckInPicker, setShowCheckInPicker] = useState<string | null>(
    null
  );
  const [showCheckOutPicker, setShowCheckOutPicker] = useState<string | null>(
    null
  );

  const { toast } = useToast();
  const { isRangeAvailable } = useRoomAvailability();
  const { selectedLocation } = useLocationContext();

  const generateId = useCallback(
    () => `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  const addRoomSelection = useCallback(() => {
    const newSelection: RoomSelection = {
      id: generateId(),
      room_id: "",
      room_rate: 0,
      check_in_date: "", // Start with empty dates so user can select room first
      check_out_date: "", // Then pick available dates
      adults: 1,
      children: 0,
      currency: defaultCurrency,
      arrival_time: "",
      nights: 1,
      total_amount: 0,
    };
    onRoomSelectionsChange([...roomSelections, newSelection]);
  }, [generateId, roomSelections, onRoomSelectionsChange, defaultCurrency]);

  // Add first room if none exist
  useEffect(() => {
    if (roomSelections.length === 0) {
      addRoomSelection();
    }
  }, [roomSelections.length, addRoomSelection]);

  const removeRoomSelection = (id: string) => {
    if (roomSelections.length === 1) {
      toast({
        title: "Cannot Remove",
        description: "At least one room must be selected",
        variant: "destructive",
      });
      return;
    }

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
              roomSelections.filter((selection) => selection.id !== id)
            );
          },
        },
      ]
    );
  };

  const updateRoomSelection = (id: string, updates: Partial<RoomSelection>) => {
    onRoomSelectionsChange(
      roomSelections.map((selection) =>
        selection.id === id ? { ...selection, ...updates } : selection
      )
    );
  };

  const calculateNights = (checkIn: string, checkOut: string): number => {
    return Math.max(
      1,
      Math.ceil(
        checkIn && checkOut
          ? (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
              (1000 * 60 * 60 * 24)
          : 1
      )
    );
  };

  const handleRoomChange = async (selectionId: string, roomId: string) => {
    const selectedRoom = rooms.find((room) => room.id === roomId);
    const selection = roomSelections.find((s) => s.id === selectionId);

    if (!selectedRoom || !selection) return;

    const roomCurrency = selectedRoom.currency || "LKR";
    let roomRate = selectedRoom.base_rate || 0;
    const tenantId = selectedRoom.tenant_id;

    // Convert room price to selection currency if they differ
    if (roomCurrency !== selection.currency) {
      try {
        roomRate = await convertCurrency(
          selectedRoom.base_rate || 0,
          roomCurrency,
          selection.currency,
          tenantId,
          selectedLocation || ""
        );
      } catch (error) {
        console.error("Currency conversion error:", error);
        toast({
          title: "Currency Conversion Error",
          description: "Using original room price",
          variant: "destructive",
        });
      }
    }

    const nights = calculateNights(
      selection.check_in_date,
      selection.check_out_date
    );
    const total = Math.round(roomRate * nights * 100) / 100;

    updateRoomSelection(selectionId, {
      room_id: roomId,
      room_rate: Math.round(roomRate * 100) / 100,
      nights,
      total_amount: total,
    });
  };

  const handleCurrencyChange = async (
    selectionId: string,
    newCurrency: string
  ) => {
    const selection = roomSelections.find((s) => s.id === selectionId);
    const selectedRoom = rooms.find((room) => room.id === selection?.room_id);

    if (!selection || !selectedRoom) {
      updateRoomSelection(selectionId, { currency: newCurrency });
      return;
    }

    const roomCurrency = selectedRoom.currency || "LKR";
    let newRoomRate = selectedRoom.base_rate || 0;

    // Convert room price to new currency if they differ
    if (roomCurrency !== newCurrency) {
      try {
        newRoomRate = await convertCurrency(
          selectedRoom.base_rate || 0,
          roomCurrency,
          newCurrency,
          selectedRoom.tenant_id,
          selectedLocation || ""
        );
      } catch (error) {
        console.error("Currency conversion error:", error);
        toast({
          title: "Currency Conversion Error",
          description: "Using original room price",
          variant: "destructive",
        });
      }
    }

    const total = Math.round(newRoomRate * selection.nights * 100) / 100;

    updateRoomSelection(selectionId, {
      currency: newCurrency,
      room_rate: Math.round(newRoomRate * 100) / 100,
      total_amount: total,
    });
  };

  const handleDateChange = (
    event: any,
    selectedDate: Date | undefined,
    selectionId: string,
    field: "check_in_date" | "check_out_date"
  ) => {
    if (field === "check_in_date") {
      setShowCheckInPicker(null);
    } else {
      setShowCheckOutPicker(null);
    }

    if (!selectedDate) return;

    const dateString = selectedDate.toISOString().split("T")[0];
    const selection = roomSelections.find((s) => s.id === selectionId);
    if (!selection) return;

    let checkIn = selection.check_in_date;
    let checkOut = selection.check_out_date;

    if (field === "check_in_date") {
      checkIn = dateString;
    } else {
      checkOut = dateString;
    }

    const nights = calculateNights(checkIn, checkOut);
    const total = Math.round(selection.room_rate * nights * 100) / 100;

    // Check if the currently selected room is still available for the new dates
    if (
      selection.room_id &&
      !isRoomAvailableForSelection(selection.room_id, {
        ...selection,
        check_in_date: checkIn,
        check_out_date: checkOut,
      })
    ) {
      toast({
        title: "Room Unavailable",
        description:
          "The selected room is not available for these dates. Please select a different room.",
        variant: "destructive",
      });
    }

    updateRoomSelection(selectionId, {
      [field]: dateString,
      nights,
      total_amount: total,
    });
  };

  // Web app compatible date handler
  const handleDateChangeWeb = (
    selectionId: string,
    checkIn: string,
    checkOut: string,
  ) => {
    const selection = roomSelections.find((s) => s.id === selectionId);
    if (!selection) return;

    const nights = calculateNights(checkIn, checkOut);
    const total = Math.round(selection.room_rate * nights * 100) / 100;

    // Check if the currently selected room is still available for the new dates
    if (
      selection.room_id &&
      !isRoomAvailableForSelection(selection.room_id, {
        ...selection,
        check_in_date: checkIn,
        check_out_date: checkOut,
      })
    ) {
      toast({
        title: "Room Unavailable",
        description:
          "The selected room is not available for these dates. Please select a different room.",
        variant: "destructive",
      });
    }

    updateRoomSelection(selectionId, {
      check_in_date: checkIn,
      check_out_date: checkOut,
      nights,
      total_amount: total,
    });
  };

  const handleFieldChange = (
    selectionId: string,
    field: keyof RoomSelection,
    value: any
  ) => {
    updateRoomSelection(selectionId, { [field]: value });
  };

  // Get currency symbol helper
  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "LKR":
        return "Rs.";
      default:
        return "";
    }
  };

  // Check if a room is available for the given selection
  const isRoomAvailableForSelection = (
    roomId: string,
    selection: RoomSelection
  ): boolean => {
    if (!selection.check_in_date || !selection.check_out_date) return true; // No dates selected yet

    const checkIn = new Date(selection.check_in_date);
    const checkOut = new Date(selection.check_out_date);

    // Check if dates are valid
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return true;

    return isRangeAvailable(checkIn, checkOut, roomId);
  };

  // Calculate total across all rooms
  const grandTotal = roomSelections.reduce(
    (sum, selection) => sum + selection.total_amount,
    0
  );

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="space-y-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Ionicons name="bed" size={24} color="#3B82F6" />
            <Text className="text-lg font-semibold ml-2 text-gray-900">
              Room Selections
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
            key={selection.id}
            className="bg-white border border-gray-300 rounded-lg p-4 space-y-4"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-gray-900">
                Room {index + 1}
              </Text>
              {roomSelections.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeRoomSelection(selection.id)}
                  className="bg-red-100 rounded-full p-2"
                >
                  <Ionicons name="trash" size={16} color="#DC2626" />
                </TouchableOpacity>
              )}
            </View>

            {/* Room Selection */}
            <View className="space-y-2">
              <Text className="text-sm font-medium text-gray-700">
                Select Room *
              </Text>
              <View className="relative">
                {/* Dropdown toggle button */}
                <TouchableOpacity
                  className="bg-white border border-gray-300 rounded-lg px-4 py-3 flex-row items-center justify-between"
                  onPress={() => {
                    if (selection.showRoomDropdown) {
                      updateRoomSelection(selection.id, {
                        showRoomDropdown: false,
                      });
                    } else {
                      // Close all others before opening this
                      onRoomSelectionsChange(
                        roomSelections.map((s) => ({
                          ...s,
                          showRoomDropdown: s.id === selection.id,
                        }))
                      );
                    }
                  }}
                >
                  <Text
                    className={
                      selection.room_id
                        ? "text-gray-800 font-medium"
                        : "text-gray-500"
                    }
                  >
                    {selection.room_id
                      ? (() => {
                          const selectedRoom = rooms.find(
                            (room) => room.id === selection.room_id
                          );
                          if (!selectedRoom) return "Select a room";
                          return `${selectedRoom.room_number} - ${
                            selectedRoom.room_type
                          } (${getCurrencySymbol(
                            selectedRoom.currency || "LKR"
                          )}${selectedRoom.base_rate})`;
                        })()
                      : "Select a room"}
                  </Text>
                  <Ionicons
                    name={
                      selection.showRoomDropdown ? "chevron-up" : "chevron-down"
                    }
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>

                {/* Dropdown list */}
                {selection.showRoomDropdown && (
                  <View className="absolute top-14 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-56">
                    <ScrollView>
                      {rooms.map((room) => {
                        const isAvailable = isRoomAvailableForSelection(
                          room.id,
                          selection
                        );
                        return (
                          <TouchableOpacity
                            key={room.id}
                            className={`px-4 py-3 border-b border-gray-200 ${
                              !isAvailable ? "opacity-50" : "opacity-100"
                            }`}
                            disabled={!isAvailable}
                            onPress={() => {
                              handleRoomChange(selection.id, room.id);
                              updateRoomSelection(selection.id, {
                                showRoomDropdown: false,
                              });
                            }}
                          >
                            <Text className="text-gray-800">
                              {`${room.room_number} - ${
                                room.room_type
                              } (${getCurrencySymbol(room.currency || "LKR")}${
                                room.base_rate
                              }${!isAvailable ? " - Unavailable" : ""})`}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}
              </View>

              {selection.room_id &&
                !isRoomAvailableForSelection(selection.room_id, selection) && (
                  <Text className="text-xs text-red-500 mt-1">
                    ⚠️ This room is not available for the selected dates
                  </Text>
                )}
            </View>

            {/* Currency Selection */}
            <View className="space-y-2">
              <Text className="text-sm font-medium text-gray-700">
                Currency
              </Text>
              <CurrencySelector
                currency={selection.currency as any}
                onCurrencyChange={(value) =>
                  handleCurrencyChange(selection.id, value)
                }
              />
            </View>

            {/* Check-in Date */}
            <View className="space-y-2">
              <Text className="text-sm font-medium text-gray-700">
                Check-in Date *
              </Text>
              <TouchableOpacity
                onPress={() => setShowCheckInPicker(selection.id)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-3 flex-row items-center justify-between"
              >
                <Text className="text-gray-900">
                  {selection.check_in_date
                    ? new Date(selection.check_in_date).toLocaleDateString()
                    : "Select date"}
                </Text>
                <Ionicons name="calendar" size={20} color="#6B7280" />
              </TouchableOpacity>
              {showCheckInPicker === selection.id && (
                <DateTimePicker
                  value={
                    selection.check_in_date
                      ? new Date(selection.check_in_date)
                      : new Date()
                  }
                  mode="date"
                  onChange={(event, date) =>
                    handleDateChange(event, date, selection.id, "check_in_date")
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
                onPress={() => setShowCheckOutPicker(selection.id)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-3 flex-row items-center justify-between"
              >
                <Text className="text-gray-900">
                  {selection.check_out_date
                    ? new Date(selection.check_out_date).toLocaleDateString()
                    : "Select date"}
                </Text>
                <Ionicons name="calendar" size={20} color="#6B7280" />
              </TouchableOpacity>
              {showCheckOutPicker === selection.id && (
                <DateTimePicker
                  value={
                    selection.check_out_date
                      ? new Date(selection.check_out_date)
                      : new Date(Date.now() + 24 * 60 * 60 * 1000)
                  }
                  mode="date"
                  onChange={(event, date) =>
                    handleDateChange(
                      event,
                      date,
                      selection.id,
                      "check_out_date"
                    )
                  }
                />
              )}
            </View>

            {/* Adults, Children, Room Rate, Arrival Time */}
            <View className="space-y-4">
              <View className="flex-row space-x-4">
                <View className="flex-1 space-y-2">
                  <Text className="text-sm font-medium text-gray-700">
                    Adults *
                  </Text>
                  <TextInput
                    className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
                    value={selection.adults.toString()}
                    onChangeText={(value) =>
                      handleFieldChange(
                        selection.id,
                        "adults",
                        parseInt(value) || 1
                      )
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
                      handleFieldChange(
                        selection.id,
                        "children",
                        parseInt(value) || 0
                      )
                    }
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View className="flex-row space-x-4">
                <View className="flex-1 space-y-2">
                  <Text className="text-sm font-medium text-gray-700">
                    Room Rate per Night
                  </Text>
                  <TextInput
                    className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
                    value={selection.room_rate.toString()}
                    onChangeText={(value) => {
                      const rate = parseFloat(value) || 0;
                      const total =
                        Math.round(rate * selection.nights * 100) / 100;
                      updateRoomSelection(selection.id, {
                        room_rate: rate,
                        total_amount: total,
                      });
                    }}
                    placeholder="0.00"
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1 space-y-2">
                  <Text className="text-sm font-medium text-gray-700">
                    Arrival Time
                  </Text>
                  <TextInput
                    className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
                    value={selection.arrival_time}
                    onChangeText={(value) =>
                      handleFieldChange(selection.id, "arrival_time", value)
                    }
                    placeholder="HH:MM"
                  />
                </View>
              </View>
            </View>

            {/* Room Summary */}
            {selection.room_id && (
              <View className="bg-blue-50 p-3 rounded-lg">
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-700">
                    Nights: {selection.nights}
                  </Text>
                  <Text className="text-base font-semibold text-blue-700">
                    Total: {getCurrencySymbol(selection.currency)}
                    {selection.total_amount.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        ))}

        {/* Grand Total */}
        {roomSelections.length > 1 && (
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold">
                Grand Total ({roomSelections.length} rooms):
              </Text>
              <Text className="text-xl font-bold text-blue-700">
                {getCurrencySymbol(defaultCurrency)}
                {grandTotal.toFixed(2)}
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
