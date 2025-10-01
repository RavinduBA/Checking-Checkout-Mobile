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

interface Location {
  id: string;
  name: string;
  status: "Active" | "Inactive";
  createdDate: string;
}

export default function HotelLocationsScreen() {
  const [locations, setLocations] = useState<Location[]>([
    {
      id: "1",
      name: "Ocean View",
      status: "Active",
      createdDate: "9/30/2025",
    },
    {
      id: "2",
      name: "Garden Villa",
      status: "Active",
      createdDate: "9/29/2025",
    },
    {
      id: "3",
      name: "Pool Side",
      status: "Inactive",
      createdDate: "9/28/2025",
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationStatus, setNewLocationStatus] = useState<
    "Active" | "Inactive"
  >("Active");

  const handleAddLocation = () => {
    if (newLocationName.trim()) {
      const newLocation: Location = {
        id: Date.now().toString(),
        name: newLocationName.trim(),
        status: newLocationStatus,
        createdDate: new Date().toLocaleDateString(),
      };
      setLocations([...locations, newLocation]);
      setNewLocationName("");
      setNewLocationStatus("Active");
      setShowAddModal(false);
    }
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setNewLocationName(location.name);
    setNewLocationStatus(location.status);
    setShowEditModal(true);
  };

  const handleUpdateLocation = () => {
    if (editingLocation && newLocationName.trim()) {
      setLocations(
        locations.map((loc) =>
          loc.id === editingLocation.id
            ? {
                ...loc,
                name: newLocationName.trim(),
                status: newLocationStatus,
              }
            : loc
        )
      );
      setShowEditModal(false);
      setEditingLocation(null);
      setNewLocationName("");
      setNewLocationStatus("Active");
    }
  };

  const handleDeleteLocation = (locationId: string) => {
    Alert.alert(
      "Delete Location",
      "Are you sure you want to delete this location?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            setLocations(locations.filter((loc) => loc.id !== locationId)),
        },
      ]
    );
  };

  const renderModal = (isEdit: boolean) => (
    <Modal
      visible={isEdit ? showEditModal : showAddModal}
      transparent
      animationType="fade"
    >
      <View
        className="flex-1 justify-center items-center p-4"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
          <Text className="text-xl font-bold text-gray-800 mb-2">
            {isEdit ? "Edit Location" : "Add New Location"}
          </Text>
          <Text className="text-gray-600 mb-6">
            {isEdit
              ? "Update the location details."
              : "Enter the details for the new hotel location."}
          </Text>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Location Name
            </Text>
            <TextInput
              value={newLocationName}
              onChangeText={setNewLocationName}
              placeholder="e.g., Main Building, Annex, Pool Villa"
              className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
              style={{ fontSize: 16 }}
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Status
            </Text>
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setNewLocationStatus("Active")}
                className={
                  newLocationStatus === "Active"
                    ? "flex-1 py-3 px-4 rounded-l-lg border bg-green-100 border-green-300"
                    : "flex-1 py-3 px-4 rounded-l-lg border bg-gray-100 border-gray-300"
                }
              >
                <Text
                  className={
                    newLocationStatus === "Active"
                      ? "text-center font-medium text-green-700"
                      : "text-center font-medium text-gray-600"
                  }
                >
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setNewLocationStatus("Inactive")}
                className={
                  newLocationStatus === "Inactive"
                    ? "flex-1 py-3 px-4 rounded-r-lg border bg-red-100 border-red-300"
                    : "flex-1 py-3 px-4 rounded-r-lg border bg-gray-100 border-gray-300"
                }
              >
                <Text
                  className={
                    newLocationStatus === "Inactive"
                      ? "text-center font-medium text-red-700"
                      : "text-center font-medium text-gray-600"
                  }
                >
                  Inactive
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row" style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={() => {
                if (isEdit) {
                  setShowEditModal(false);
                  setEditingLocation(null);
                } else {
                  setShowAddModal(false);
                }
                setNewLocationName("");
                setNewLocationStatus("Active");
              }}
              className="flex-1 py-3 bg-gray-100 rounded-lg"
            >
              <Text className="text-center font-medium text-gray-700">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={isEdit ? handleUpdateLocation : handleAddLocation}
              className="flex-1 py-3 bg-blue-600 rounded-lg"
            >
              <Text className="text-center font-medium text-white">
                {isEdit ? "Update Location" : "Create Location"}
              </Text>
            </TouchableOpacity>
          </View>
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
            Hotel Locations
          </Text>
          <Text className="text-gray-600">
            Manage hotel locations and properties
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center ml-4"
        >
          <Ionicons name="add" size={20} color="white" />
          <Text className="text-white font-medium ml-1">Add Location</Text>
        </TouchableOpacity>
      </View>
      {/* Locations Table */}
      <View className="flex-1 bg-white rounded-xl overflow-hidden">
        {/* Table Header */}
        <View className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <View className="flex-row">
            <Text className="flex-1 text-sm font-semibold text-gray-700">
              Location Name
            </Text>
            <Text className="w-20 text-sm font-semibold text-gray-700 text-center">
              Status
            </Text>
            <Text className="w-24 text-sm font-semibold text-gray-700 text-center">
              Created Date
            </Text>
            <Text className="w-20 text-sm font-semibold text-gray-700 text-center">
              Actions
            </Text>
          </View>
        </View>

        {/* Table Content */}
        <ScrollView className="flex-1">
          {locations.map((location, index) => (
            <View
              key={location.id}
              className={
                index % 2 === 0
                  ? "px-4 py-4 border-b border-gray-100 bg-white"
                  : "px-4 py-4 border-b border-gray-100 bg-gray-50"
              }
            >
              <View className="flex-row items-center">
                <Text className="flex-1 text-gray-800 font-medium">
                  {location.name}
                </Text>
                <View className="w-20 items-center">
                  <View
                    className={
                      location.status === "Active"
                        ? "px-2 py-1 rounded-full bg-green-100"
                        : "px-2 py-1 rounded-full bg-red-100"
                    }
                  >
                    <Text
                      className={
                        location.status === "Active"
                          ? "text-xs font-medium text-green-700"
                          : "text-xs font-medium text-red-700"
                      }
                    >
                      {location.status}
                    </Text>
                  </View>
                </View>
                <Text className="w-24 text-sm text-gray-600 text-center">
                  {location.createdDate}
                </Text>
                <View
                  className="w-20 flex-row justify-center"
                  style={{ gap: 8 }}
                >
                  <TouchableOpacity
                    onPress={() => handleEditLocation(location)}
                    className="p-1"
                  >
                    <Ionicons name="pencil" size={16} color="#3b82f6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteLocation(location.id)}
                    className="p-1"
                  >
                    <Ionicons name="trash" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Empty State */}
        {locations.length === 0 && (
          <View className="flex-1 justify-center items-center py-12">
            <Ionicons name="location-outline" size={48} color="#9ca3af" />
            <Text className="text-lg font-medium text-gray-500 mt-4">
              No locations found
            </Text>
            <Text className="text-gray-400 mt-1">
              Add your first hotel location to get started
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
