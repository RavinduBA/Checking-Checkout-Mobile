import AccessDenied from "@/components/AccessDenied";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useGuides } from "../../hooks/useGuides";
import { usePermissions } from "../../hooks/usePermissions";
import { useUserProfile } from "../../hooks/useUserProfile";

export default function TourGuidesScreen() {
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const { guides, loading, error, createGuide, updateGuide, deleteGuide } =
    useGuides();
  const { profile } = useUserProfile();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGuide, setEditingGuide] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    license_number: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    commission_rate: 10,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      license_number: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
      commission_rate: 10,
      is_active: true,
    });
  };

  const handleAddGuide = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Guide name is required");
      return;
    }

    if (!profile?.tenant_id) {
      Alert.alert("Error", "User profile not loaded. Please try again.");
      return;
    }

    try {
      await createGuide({
        name: formData.name.trim(),
        license_number: formData.license_number.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        commission_rate: formData.commission_rate,
        is_active: formData.is_active,
      });

      setShowAddModal(false);
      resetForm();
      Alert.alert("Success", "Tour guide added successfully");
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error occurred";
      Alert.alert("Error", `Failed to add tour guide: ${errorMessage}`);
      console.error("Error adding tour guide:", error);
    }
  };

  const handleEditGuide = (guide: any) => {
    setEditingGuide(guide);
    setFormData({
      name: guide.name,
      license_number: guide.license_number || "",
      phone: guide.phone || "",
      email: guide.email || "",
      address: guide.address || "",
      notes: guide.notes || "",
      commission_rate: guide.commission_rate,
      is_active: guide.is_active,
    });
    setShowEditModal(true);
  };

  const handleUpdateGuide = async () => {
    if (!editingGuide || !formData.name.trim()) {
      Alert.alert("Error", "Guide name is required");
      return;
    }

    try {
      await updateGuide(editingGuide.id, {
        name: formData.name.trim(),
        license_number: formData.license_number.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        commission_rate: formData.commission_rate,
        is_active: formData.is_active,
      });

      setShowEditModal(false);
      setEditingGuide(null);
      resetForm();
      Alert.alert("Success", "Tour guide updated successfully");
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error occurred";
      Alert.alert("Error", `Failed to update tour guide: ${errorMessage}`);
      console.error("Error updating tour guide:", error);
    }
  };

  const handleDeleteGuide = (guideId: string) => {
    Alert.alert(
      "Delete Tour Guide",
      "Are you sure you want to delete this tour guide?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGuide(guideId);
              Alert.alert("Success", "Tour guide deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete tour guide");
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
      animationType="slide"
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <View className="bg-white rounded-t-3xl p-6 max-h-5/6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">
              {isEdit ? "Edit Guide" : "Add New Guide"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (isEdit) {
                  setShowEditModal(false);
                  setEditingGuide(null);
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
            Enter the details for the new guide.
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Name */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Name
              </Text>
              <TextInput
                value={formData.name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, name: text }))
                }
                placeholder="Guide's name"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
              />
            </View>

            {/* License Number */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                License Number
              </Text>
              <TextInput
                value={formData.license_number}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, license_number: text }))
                }
                placeholder="Tour guide license number"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
              />
            </View>

            {/* Phone */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Phone
              </Text>
              <TextInput
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, phone: text }))
                }
                placeholder="+"
                keyboardType="phone-pad"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
              />
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email
              </Text>
              <TextInput
                value={formData.email}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, email: text }))
                }
                placeholder="Email address"
                keyboardType="email-address"
                autoCapitalize="none"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
              />
            </View>

            {/* Address */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Address
              </Text>
              <TextInput
                value={formData.address}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, address: text }))
                }
                placeholder="Full address"
                multiline
                numberOfLines={3}
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
                style={{ textAlignVertical: "top" }}
              />
            </View>

            {/* Notes */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Notes
              </Text>
              <TextInput
                value={formData.notes}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, notes: text }))
                }
                placeholder="Additional notes about the guide"
                multiline
                numberOfLines={3}
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
                style={{ textAlignVertical: "top" }}
              />
            </View>

            {/* Commission Rate */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Commission Rate (%)
              </Text>
              <TextInput
                value={formData.commission_rate.toString()}
                onChangeText={(text) => {
                  const rate = parseFloat(text) || 0;
                  setFormData((prev) => ({ ...prev, commission_rate: rate }));
                }}
                placeholder="10"
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
              />
            </View>

            {/* Status */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Status
              </Text>
              <View className="flex-row" style={{ gap: 12 }}>
                <TouchableOpacity
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, is_active: true }))
                  }
                  className={`flex-1 py-3 rounded-lg border ${
                    formData.is_active
                      ? "bg-green-50 border-green-500"
                      : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
                      formData.is_active ? "text-green-700" : "text-gray-600"
                    }`}
                  >
                    Active
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, is_active: false }))
                  }
                  className={`flex-1 py-3 rounded-lg border ${
                    !formData.is_active
                      ? "bg-red-50 border-red-500"
                      : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
                      !formData.is_active ? "text-red-700" : "text-gray-600"
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
                    setEditingGuide(null);
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
                onPress={isEdit ? handleUpdateGuide : handleAddGuide}
                className="flex-1 py-3 bg-blue-600 rounded-lg"
              >
                <Text className="text-center font-medium text-white">
                  {isEdit ? "Update Guide" : "Create Guide"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Permission check - AFTER all hooks are declared
  if (permissionsLoading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#0066cc" />
        <Text className="mt-2 text-gray-600">Loading...</Text>
      </View>
    );
  }

  if (!hasPermission("access_master_files")) {
    return (
      <AccessDenied message="You don't have permission to access Tour Guides." />
    );
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="mb-6 flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Tour Guides
          </Text>
          <Text className="text-gray-600">
            Manage tour guides and their commission rates
          </Text>
        </View>

        {/* Add Guide Button */}
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          className="bg-blue-600 rounded-lg px-4 py-3 flex-row items-center"
          style={{ gap: 8 }}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text className="text-white font-medium">Add Guide</Text>
        </TouchableOpacity>
      </View>

      {/* Guides Table */}
      <View className="flex-1 bg-white rounded-xl">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="min-w-full">
            {/* Header */}
            <View className="flex-row bg-gray-50 p-4 border-b border-gray-200">
              <Text className="w-40 font-semibold text-gray-700">Name</Text>
              <Text className="w-24 font-semibold text-gray-700">License</Text>
              <Text className="w-32 font-semibold text-gray-700">Phone</Text>
              <Text className="w-48 font-semibold text-gray-700">Email</Text>
              <Text className="w-24 font-semibold text-gray-700">
                Commission %
              </Text>
              <Text className="w-20 font-semibold text-gray-700">Status</Text>
              <Text className="w-24 font-semibold text-gray-700">Actions</Text>
            </View>

            {/* Data Rows */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {guides.map((guide) => (
                <View
                  key={guide.id}
                  className="flex-row p-4 border-b border-gray-100"
                >
                  <Text className="w-40 text-gray-800" numberOfLines={2}>
                    {guide.name}
                  </Text>
                  <Text className="w-24 text-gray-800">
                    {guide.license_number || "N/A"}
                  </Text>
                  <Text className="w-32 text-gray-800">
                    {guide.phone || "N/A"}
                  </Text>
                  <Text className="w-48 text-gray-800" numberOfLines={2}>
                    {guide.email || "N/A"}
                  </Text>
                  <Text className="w-24 text-gray-800">
                    {guide.commission_rate}%
                  </Text>
                  <View className="w-20">
                    <View
                      className={`px-2 py-1 rounded-full ${
                        guide.is_active ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium text-center ${
                          guide.is_active ? "text-green-800" : "text-red-800"
                        }`}
                      >
                        {guide.is_active ? "Active" : "Inactive"}
                      </Text>
                    </View>
                  </View>
                  <View className="w-24 flex-row" style={{ gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => handleEditGuide(guide)}
                      className="bg-blue-100 p-2 rounded"
                    >
                      <Ionicons name="pencil" size={14} color="#1d4ed8" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteGuide(guide.id)}
                      className="bg-red-100 p-2 rounded"
                    >
                      <Ionicons name="trash" size={14} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        {guides.length === 0 && (
          <View className="flex-1 justify-center items-center p-8">
            <Ionicons name="people-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 text-lg font-medium mt-4">
              No Tour Guides
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Add your first tour guide to get started
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
