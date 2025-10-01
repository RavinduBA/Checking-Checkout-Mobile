import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Room {
  id: string;
  roomNumber: string;
  roomType: string;
  location: string;
  propertyType: string;
  bedType: string;
  maxOccupancy: number;
  basePrice: number;
  currency: string;
  description: string;
  amenities: string[];
  status: "Active" | "Inactive";
  createdDate: string;
}

const PROPERTY_TYPES = ["Room", "Suite", "Villa", "Apartment"];
const ROOM_TYPES = [
  "Standard",
  "Deluxe",
  "Premium",
  "Executive",
  "Presidential",
];
const BED_TYPES = ["Single", "Double", "Queen", "King", "Twin", "Sofa Bed"];
const LOCATIONS = ["Ocean View", "Garden Villa", "Pool Side", "Main Building"];
const CURRENCIES = ["USD", "EUR", "GBP", "LKR"];

const AMENITIES = [
  "Air Conditioning",
  "WiFi",
  "TV",
  "Mini Bar",
  "Safe",
  "Balcony",
  "Sea View",
  "Pool View",
  "Garden View",
  "Room Service",
  "Jacuzzi",
  "Kitchen",
  "Washing Machine",
  "Hair Dryer",
  "Private Pool",
  "BBQ Area",
];

export default function RoomsScreen() {
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "1",
      roomNumber: "101",
      roomType: "Deluxe",
      location: "Ocean View",
      propertyType: "Room",
      bedType: "King",
      maxOccupancy: 2,
      basePrice: 1211,
      currency: "USD",
      description: "Luxurious ocean view room with modern amenities",
      amenities: [
        "Air Conditioning",
        "WiFi",
        "TV",
        "Mini Bar",
        "Sea View",
        "Balcony",
      ],
      status: "Active",
      createdDate: "10/1/2025",
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    roomNumber: "",
    location: LOCATIONS[0],
    propertyType: PROPERTY_TYPES[0],
    roomType: ROOM_TYPES[0],
    bedType: BED_TYPES[0],
    maxOccupancy: 2,
    basePrice: 0,
    currency: CURRENCIES[0],
    description: "",
    amenities: [] as string[],
    status: "Active" as "Active" | "Inactive",
  });

  // Dropdown state
  const [openDropdowns, setOpenDropdowns] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleDropdown = (dropdownKey: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [dropdownKey]: !prev[dropdownKey],
    }));
  };

  const resetForm = () => {
    setFormData({
      roomNumber: "",
      location: LOCATIONS[0],
      propertyType: PROPERTY_TYPES[0],
      roomType: ROOM_TYPES[0],
      bedType: BED_TYPES[0],
      maxOccupancy: 2,
      basePrice: 0,
      currency: CURRENCIES[0],
      description: "",
      amenities: [],
      status: "Active",
    });
    setOpenDropdowns({});
  };

  const handleAddRoom = () => {
    if (formData.roomNumber.trim()) {
      const newRoom: Room = {
        id: Date.now().toString(),
        roomNumber: formData.roomNumber.trim(),
        roomType: formData.roomType,
        location: formData.location,
        propertyType: formData.propertyType,
        bedType: formData.bedType,
        maxOccupancy: formData.maxOccupancy,
        basePrice: formData.basePrice,
        currency: formData.currency,
        description: formData.description,
        amenities: formData.amenities,
        status: formData.status,
        createdDate: new Date().toLocaleDateString(),
      };
      setRooms([...rooms, newRoom]);
      resetForm();
      setShowAddModal(false);
    }
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      location: room.location,
      propertyType: room.propertyType,
      roomType: room.roomType,
      bedType: room.bedType,
      maxOccupancy: room.maxOccupancy,
      basePrice: room.basePrice,
      currency: room.currency,
      description: room.description,
      amenities: room.amenities,
      status: room.status,
    });
    setShowEditModal(true);
  };

  const handleUpdateRoom = () => {
    if (editingRoom && formData.roomNumber.trim()) {
      setRooms(
        rooms.map((room) =>
          room.id === editingRoom.id
            ? { ...room, ...formData, roomNumber: formData.roomNumber.trim() }
            : room
        )
      );
      setShowEditModal(false);
      setEditingRoom(null);
      resetForm();
    }
  };

  const handleDeleteRoom = (roomId: string) => {
    Alert.alert("Delete Room", "Are you sure you want to delete this room?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setRooms(rooms.filter((room) => room.id !== roomId)),
      },
    ]);
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const renderDropdown = (
    label: string,
    value: string,
    options: string[],
    onSelect: (value: string) => void
  ) => {
    const dropdownKey = label.toLowerCase().replace(/\s+/g, "");
    const isOpen = openDropdowns[dropdownKey] || false;

    return (
      <View className="mb-4" style={{ zIndex: isOpen ? 1000 : 1 }}>
        <Text className="text-sm font-medium text-gray-700 mb-2">{label}</Text>
        <View className="relative">
          <TouchableOpacity
            onPress={() => toggleDropdown(dropdownKey)}
            className="border border-gray-300 rounded-lg px-3 py-3 flex-row items-center justify-between bg-white"
          >
            <Text className={value ? "text-gray-800" : "text-gray-500"}>
              {value || `Select ${label}`}
            </Text>
            <Ionicons
              name={isOpen ? "chevron-up" : "chevron-down"}
              size={16}
              color="#6b7280"
            />
          </TouchableOpacity>

          {isOpen && (
            <View
              className="absolute top-full left-0 right-0 border border-gray-300 rounded-lg bg-white mt-1"
              style={{ zIndex: 1001 }}
            >
              {options.map((option, index) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => {
                    onSelect(option);
                    toggleDropdown(dropdownKey);
                  }}
                  className={`px-3 py-3 flex-row items-center justify-between ${
                    index !== options.length - 1
                      ? "border-b border-gray-200"
                      : ""
                  } ${value === option ? "bg-blue-50" : "bg-white"}`}
                >
                  <Text
                    className={
                      value === option
                        ? "text-blue-700 font-medium"
                        : "text-gray-800"
                    }
                  >
                    {option}
                  </Text>
                  {value === option && (
                    <Ionicons name="checkmark" size={16} color="#1d4ed8" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderModal = (isEdit: boolean) => (
    <Modal
      visible={isEdit ? showEditModal : showAddModal}
      transparent
      animationType="slide"
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <View className="bg-white rounded-t-3xl p-6 max-h-5/6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">
              {isEdit ? "Edit Room" : "Add New Room"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (isEdit) {
                  setShowEditModal(false);
                  setEditingRoom(null);
                } else {
                  setShowAddModal(false);
                }
                resetForm();
              }}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <Text className="text-gray-600 mb-6">
            Enter the details for the new room.
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Room Number */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Room Number
              </Text>
              <TextInput
                value={formData.roomNumber}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, roomNumber: text }))
                }
                placeholder="e.g., 101, A-201"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
                style={{ fontSize: 16 }}
              />
            </View>

            {/* Location */}
            {renderDropdown("Location", formData.location, LOCATIONS, (value) =>
              setFormData((prev) => ({ ...prev, location: value }))
            )}

            {/* Property Type */}
            {renderDropdown(
              "Property Type",
              formData.propertyType,
              PROPERTY_TYPES,
              (value) =>
                setFormData((prev) => ({ ...prev, propertyType: value }))
            )}

            {/* Room Type */}
            {renderDropdown(
              "Room/Property Type",
              formData.roomType,
              ROOM_TYPES,
              (value) => setFormData((prev) => ({ ...prev, roomType: value }))
            )}

            {/* Bed Type */}
            {renderDropdown("Bed Type", formData.bedType, BED_TYPES, (value) =>
              setFormData((prev) => ({ ...prev, bedType: value }))
            )}

            {/* Max Occupancy */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Max Occupancy
              </Text>
              <TextInput
                value={formData.maxOccupancy.toString()}
                onChangeText={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxOccupancy: parseInt(text) || 1,
                  }))
                }
                placeholder="2"
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
                style={{ fontSize: 16 }}
              />
            </View>

            {/* Base Price & Currency */}
            <View className="flex-row mb-4" style={{ gap: 12 }}>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Base Price
                </Text>
                <TextInput
                  value={formData.basePrice.toString()}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      basePrice: parseFloat(text) || 0,
                    }))
                  }
                  placeholder="0"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
                  style={{ fontSize: 16 }}
                />
              </View>
              <View className="w-20">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Currency
                </Text>
                <View className="border border-gray-300 rounded-lg px-3 py-3 bg-gray-50">
                  <Text className="text-gray-800 text-center">
                    {formData.currency}
                  </Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Description
              </Text>
              <TextInput
                value={formData.description}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, description: text }))
                }
                placeholder="Room description..."
                multiline
                numberOfLines={3}
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
                style={{ fontSize: 16, textAlignVertical: "top" }}
              />
            </View>

            {/* Amenities */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-3">
                Amenities
              </Text>
              <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                {AMENITIES.map((amenity) => (
                  <TouchableOpacity
                    key={amenity}
                    onPress={() => toggleAmenity(amenity)}
                    className={`px-3 py-2 rounded-full border ${
                      formData.amenities.includes(amenity)
                        ? "bg-blue-100 border-blue-300"
                        : "bg-gray-100 border-gray-300"
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        formData.amenities.includes(amenity)
                          ? "text-blue-700 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      {amenity}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Status
              </Text>
              <View className="flex-row">
                <TouchableOpacity
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, status: "Active" }))
                  }
                  className={`flex-1 py-3 px-4 rounded-l-lg border ${
                    formData.status === "Active"
                      ? "bg-green-100 border-green-300"
                      : "bg-gray-100 border-gray-300"
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
                      formData.status === "Active"
                        ? "text-green-700"
                        : "text-gray-600"
                    }`}
                  >
                    Active
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, status: "Inactive" }))
                  }
                  className={`flex-1 py-3 px-4 rounded-r-lg border ${
                    formData.status === "Inactive"
                      ? "bg-red-100 border-red-300"
                      : "bg-gray-100 border-gray-300"
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
                      formData.status === "Inactive"
                        ? "text-red-700"
                        : "text-gray-600"
                    }`}
                  >
                    Inactive
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row" style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  if (isEdit) {
                    setShowEditModal(false);
                    setEditingRoom(null);
                  } else {
                    setShowAddModal(false);
                  }
                  resetForm();
                }}
                className="flex-1 py-3 bg-gray-100 rounded-lg"
              >
                <Text className="text-center font-medium text-gray-700">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={isEdit ? handleUpdateRoom : handleAddRoom}
                className="flex-1 py-3 bg-blue-600 rounded-lg"
              >
                <Text className="text-center font-medium text-white">
                  {isEdit ? "Update Room" : "Create Room"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View className="flex-1 bg-gray-50 p-4">
      {/* Header with Add Button */}
      <View className="flex-row justify-between items-start mb-6">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Room Management
          </Text>
          <Text className="text-gray-600">
            Manage hotel rooms and their configurations
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center ml-4"
        >
          <Ionicons name="add" size={20} color="white" />
          <Text className="text-white font-medium ml-1">Add Room</Text>
        </TouchableOpacity>
      </View>

      {/* Rooms Table */}
      <View className="flex-1 bg-white rounded-xl overflow-hidden">
        {/* Table Header */}
        <View className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <View className="flex-row">
            <Text className="w-16 text-sm font-semibold text-gray-700">
              Room #
            </Text>
            <Text className="flex-1 text-sm font-semibold text-gray-700">
              Room Type
            </Text>
            <Text className="w-20 text-sm font-semibold text-gray-700">
              Location
            </Text>
            <Text className="w-16 text-sm font-semibold text-gray-700 text-center">
              Occupancy
            </Text>
            <Text className="w-20 text-sm font-semibold text-gray-700 text-center">
              Base Price
            </Text>
            <Text className="w-16 text-sm font-semibold text-gray-700 text-center">
              Status
            </Text>
            <Text className="w-16 text-sm font-semibold text-gray-700 text-center">
              Actions
            </Text>
          </View>
        </View>

        {/* Table Content */}
        <ScrollView className="flex-1">
          {rooms.map((room, index) => {
            const statusColor =
              room.status === "Active" ? "text-green-700" : "text-red-700";
            const statusBg =
              room.status === "Active" ? "bg-green-100" : "bg-red-100";
            const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50";

            return (
              <View
                key={room.id}
                className={`px-4 py-4 border-b border-gray-100 ${rowBg}`}
              >
                <View className="flex-row items-center">
                  <Text className="w-16 text-gray-800 font-medium">
                    {room.roomNumber}
                  </Text>
                  <Text className="flex-1 text-gray-800">{room.roomType}</Text>
                  <Text className="w-20 text-gray-600 text-xs">
                    {room.location}
                  </Text>
                  <Text className="w-16 text-gray-600 text-center">
                    {room.maxOccupancy}
                  </Text>
                  <Text className="w-20 text-gray-800 text-center font-medium">
                    ${room.basePrice}
                  </Text>
                  <View className="w-16 items-center">
                    <View className={`px-2 py-1 rounded-full ${statusBg}`}>
                      <Text className={`text-xs font-medium ${statusColor}`}>
                        {room.status}
                      </Text>
                    </View>
                  </View>
                  <View
                    className="w-16 flex-row justify-center"
                    style={{ gap: 8 }}
                  >
                    <TouchableOpacity
                      onPress={() => handleEditRoom(room)}
                      className="p-1"
                    >
                      <Ionicons name="pencil" size={16} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteRoom(room.id)}
                      className="p-1"
                    >
                      <Ionicons name="trash" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Empty State */}
        {rooms.length === 0 && (
          <View className="flex-1 justify-center items-center py-12">
            <Ionicons name="bed-outline" size={48} color="#9ca3af" />
            <Text className="text-lg font-medium text-gray-500 mt-4">
              No rooms found
            </Text>
            <Text className="text-gray-400 mt-1">
              Add your first room to get started
            </Text>
          </View>
        )}
      </View>

      {/* Modals */}
      {renderModal(false)}
      {renderModal(true)}
    </View>
  );
}
