import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useUserProfile } from "../../hooks/useUserProfile";
import {
  createLocation,
  deleteLocation,
  getLocations,
  updateLocation,
  type Location,
} from "../../lib/database/locations";

interface LocationDisplay {
  id: string;
  name: string;
  status: "Active" | "Inactive";
  createdDate: string;
  address?: string;
  phone?: string;
  email?: string;
  property_type?: string;
}

export default function HotelLocationsScreen() {
  // Temporarily disable profile loading for simplified flow
  // const { profile, tenantId, loading: profileLoading } = useUserProfile();
  const profile = null;
  const tenantId = null;
  const profileLoading = false;
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationAddress, setNewLocationAddress] = useState("");
  const [newLocationPhone, setNewLocationPhone] = useState("");
  const [newLocationEmail, setNewLocationEmail] = useState("");
  const [newLocationPropertyType, setNewLocationPropertyType] = useState("");
  const [newLocationStatus, setNewLocationStatus] = useState<
    "Active" | "Inactive"
  >("Active");

  // Load locations when component mounts
  useEffect(() => {
    if (tenantId) {
      loadLocations();
    }
  }, [tenantId]);

  const loadLocations = async () => {
    if (!tenantId) return;

    setLoading(true);
    try {
      const result = await getLocations(tenantId);
      if (result.success) {
        setLocations(result.data);
      } else {
        Alert.alert("Error", result.error || "Failed to load locations");
      }
    } catch (error) {
      console.error("Error loading locations:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = async () => {
    if (!newLocationName.trim() || !tenantId) return;

    try {
      const locationData = {
        name: newLocationName.trim(),
        is_active: newLocationStatus === "Active",
        tenant_id: tenantId,
        address: newLocationAddress.trim() || undefined,
        phone: newLocationPhone.trim() || undefined,
        email: newLocationEmail.trim() || undefined,
        property_type: newLocationPropertyType.trim() || undefined,
      };

      const result = await createLocation(locationData);

      if (result.success) {
        // Refresh the locations list
        await loadLocations();

        // Reset form
        setNewLocationName("");
        setNewLocationAddress("");
        setNewLocationPhone("");
        setNewLocationEmail("");
        setNewLocationPropertyType("");
        setNewLocationStatus("Active");
        setShowAddModal(false);

        Alert.alert("Success", "Location added successfully!");
      } else {
        Alert.alert("Error", result.error || "Failed to add location");
      }
    } catch (error) {
      console.error("Error adding location:", error);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setNewLocationName(location.name);
    setNewLocationAddress(location.address || "");
    setNewLocationPhone(location.phone || "");
    setNewLocationEmail(location.email || "");
    setNewLocationPropertyType(location.property_type || "");
    setNewLocationStatus(location.is_active ? "Active" : "Inactive");
    setShowEditModal(true);
  };

  const handleUpdateLocation = async () => {
    if (!editingLocation || !newLocationName.trim()) return;

    try {
      const updateData = {
        name: newLocationName.trim(),
        is_active: newLocationStatus === "Active",
        address: newLocationAddress.trim() || undefined,
        phone: newLocationPhone.trim() || undefined,
        email: newLocationEmail.trim() || undefined,
        property_type: newLocationPropertyType.trim() || undefined,
      };

      const result = await updateLocation(editingLocation.id, updateData);

      if (result.success) {
        // Refresh the locations list
        await loadLocations();

        // Reset form
        setShowEditModal(false);
        setEditingLocation(null);
        setNewLocationName("");
        setNewLocationAddress("");
        setNewLocationPhone("");
        setNewLocationEmail("");
        setNewLocationPropertyType("");
        setNewLocationStatus("Active");

        Alert.alert("Success", "Location updated successfully!");
      } else {
        Alert.alert("Error", result.error || "Failed to update location");
      }
    } catch (error) {
      console.error("Error updating location:", error);
      Alert.alert("Error", "An unexpected error occurred");
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
          onPress: async () => {
            try {
              const result = await deleteLocation(locationId);
              if (result.success) {
                await loadLocations();
                Alert.alert("Success", "Location deleted successfully!");
              } else {
                Alert.alert(
                  "Error",
                  result.error || "Failed to delete location"
                );
              }
            } catch (error) {
              console.error("Error deleting location:", error);
              Alert.alert("Error", "An unexpected error occurred");
            }
          },
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

          <ScrollView className="max-h-96">
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Location Name*
              </Text>
              <TextInput
                value={newLocationName}
                onChangeText={setNewLocationName}
                placeholder="e.g., Main Building, Annex, Pool Villa"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
                style={{ fontSize: 16 }}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Property Type
              </Text>
              <TextInput
                value={newLocationPropertyType}
                onChangeText={setNewLocationPropertyType}
                placeholder="e.g., Hotel, Villa, Resort"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
                style={{ fontSize: 16 }}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Address
              </Text>
              <TextInput
                value={newLocationAddress}
                onChangeText={setNewLocationAddress}
                placeholder="Enter location address"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
                style={{ fontSize: 16 }}
                multiline
                numberOfLines={2}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Phone
              </Text>
              <TextInput
                value={newLocationPhone}
                onChangeText={setNewLocationPhone}
                placeholder="Enter phone number"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
                style={{ fontSize: 16 }}
                keyboardType="phone-pad"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email
              </Text>
              <TextInput
                value={newLocationEmail}
                onChangeText={setNewLocationEmail}
                placeholder="Enter email address"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
                style={{ fontSize: 16 }}
                keyboardType="email-address"
                autoCapitalize="none"
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
          </ScrollView>

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
                setNewLocationAddress("");
                setNewLocationPhone("");
                setNewLocationEmail("");
                setNewLocationPropertyType("");
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
                      location.is_active
                        ? "px-2 py-1 rounded-full bg-green-100"
                        : "px-2 py-1 rounded-full bg-red-100"
                    }
                  >
                    <Text
                      className={
                        location.is_active
                          ? "text-xs font-medium text-green-700"
                          : "text-xs font-medium text-red-700"
                      }
                    >
                      {location.is_active ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </View>
                <Text className="w-24 text-sm text-gray-600 text-center">
                  {new Date(location.created_at).toLocaleDateString()}
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
