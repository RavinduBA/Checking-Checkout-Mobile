import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useExpenseTypes } from "../../hooks/useExpenseTypes";

export default function ExpenseCategories() {
  const {
    expenseTypes,
    mainTypes,
    loading,
    error,
    refetch,
    getSubTypesByMainType,
    createExpenseType,
    updateExpenseType,
    deleteExpenseType,
  } = useExpenseTypes();

  const [expandedMainTypes, setExpandedMainTypes] = useState<Set<string>>(
    new Set()
  );
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [formData, setFormData] = useState({
    mainType: "",
    subType: "",
  });
  const [saving, setSaving] = useState(false);

  const toggleMainType = (mainType: string) => {
    const newExpanded = new Set(expandedMainTypes);
    if (newExpanded.has(mainType)) {
      newExpanded.delete(mainType);
    } else {
      newExpanded.add(mainType);
    }
    setExpandedMainTypes(newExpanded);
  };

  const resetForm = () => {
    setFormData({
      mainType: "",
      subType: "",
    });
    setEditingType(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (expenseType: any) => {
    setEditingType(expenseType);
    setFormData({
      mainType: expenseType.main_type,
      subType: expenseType.sub_type,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.mainType.trim() || !formData.subType.trim()) {
        Alert.alert("Error", "Both Main Type and Sub Type are required");
        return;
      }

      setSaving(true);

      if (editingType) {
        await updateExpenseType(
          editingType.id,
          formData.mainType,
          formData.subType
        );
        Alert.alert("Success", "Expense type updated successfully");
      } else {
        await createExpenseType(formData.mainType, formData.subType);
        Alert.alert("Success", "Expense type created successfully");
      }

      setShowModal(false);
      resetForm();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save expense type");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (expenseType: any) => {
    Alert.alert(
      "Delete Expense Type",
      `Are you sure you want to delete "${expenseType.main_type} - ${expenseType.sub_type}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExpenseType(expenseType.id);
              Alert.alert("Success", "Expense type deleted successfully");
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "Failed to delete expense type"
              );
            }
          },
        },
      ]
    );
  };

  const renderMainType = ({ item: mainType }: { item: string }) => {
    const isExpanded = expandedMainTypes.has(mainType);
    const subTypes = getSubTypesByMainType(mainType);

    return (
      <View className="bg-white mx-4 mb-3 rounded-xl shadow-sm overflow-hidden">
        <TouchableOpacity
          onPress={() => toggleMainType(mainType)}
          className="p-4 flex-row justify-between items-center border-b border-gray-100"
        >
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 capitalize">
              {mainType.replace(/_/g, " ")}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              {subTypes.length} sub-categories
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>

        {isExpanded && (
          <View className="px-4 pb-4">
            {subTypes.map((subType) => (
              <View
                key={subType.id}
                className="py-2 px-3 mt-2 bg-gray-50 rounded-lg flex-row justify-between items-center"
              >
                <Text className="text-gray-800 capitalize flex-1">
                  {subType.sub_type.replace(/_/g, " ")}
                </Text>
                <View className="flex-row items-center space-x-2">
                  <TouchableOpacity
                    onPress={() => handleEdit(subType)}
                    className="p-1 bg-blue-100 rounded"
                  >
                    <Ionicons name="pencil" size={12} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(subType)}
                    className="p-1 bg-red-100 rounded"
                  >
                    <Ionicons name="trash" size={12} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="mt-3 text-base text-gray-600">
          Loading expense categories...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="p-5 bg-white border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-900 mb-2">
            Expense Categories
          </Text>
        </View>
        <View className="flex-1 justify-center items-center p-5">
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text className="text-lg font-semibold text-red-600 mt-4 text-center">
            Error Loading Categories
          </Text>
          <Text className="text-sm text-gray-600 text-center mt-2 mb-4">
            {error}
          </Text>
          <TouchableOpacity
            onPress={refetch}
            className="bg-blue-500 py-2 px-4 rounded-lg"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="p-5 bg-white border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900 mb-1">
              Expense Categories
            </Text>
            <Text className="text-sm text-gray-600">
              Add and manage expense category types
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleAdd}
            className="bg-blue-500 py-2 px-4 rounded-lg flex-row items-center"
          >
            <Ionicons name="add" size={16} color="white" />
            <Text className="text-white font-semibold ml-1">Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories List */}
      <FlatList
        data={mainTypes}
        renderItem={renderMainType}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-8">
            <Ionicons name="folder-open-outline" size={64} color="#9CA3AF" />
            <Text className="text-lg font-semibold text-gray-600 mt-4">
              No Categories Found
            </Text>
            <Text className="text-sm text-gray-500 text-center mt-2">
              No expense categories have been set up yet.
            </Text>
          </View>
        }
      />

      {/* Summary Footer */}
      <View className="bg-white border-t border-gray-200 p-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-sm text-gray-600">
            Total Categories: {mainTypes.length}
          </Text>
          <Text className="text-sm text-gray-600">
            Total Sub-types: {expenseTypes.length}
          </Text>
        </View>
      </View>

      {/* Add/Edit Modal - Small Popup Window */}
      <Modal
        visible={showModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-xl w-full max-w-md mx-4 shadow-lg">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">
                {editingType ? "Edit Expense Type" : "Add Expense Type"}
              </Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                className="p-1"
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <View className="p-4">
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Main Type *
                </Text>
                <Text className="text-xs text-gray-500 mb-2">
                  e.g., Utilities, Staff, Transportation
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50"
                  placeholder="Enter main category type"
                  value={formData.mainType}
                  onChangeText={(text) =>
                    setFormData({ ...formData, mainType: text })
                  }
                  autoCapitalize="words"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Sub Type *
                </Text>
                <Text className="text-xs text-gray-500 mb-2">
                  e.g., Electricity, Salary, Boss expense
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50"
                  placeholder="Enter sub category type"
                  value={formData.subType}
                  onChangeText={(text) =>
                    setFormData({ ...formData, subType: text })
                  }
                  autoCapitalize="words"
                />
              </View>

              {/* Examples Section */}
              <View className="bg-blue-50 rounded-lg p-3 mb-4">
                <Text className="text-sm font-semibold text-blue-900 mb-2">
                  Examples:
                </Text>
                <Text className="text-xs text-blue-800">• Staff → Salary</Text>
                <Text className="text-xs text-blue-800">
                  • Staff → Boss expense
                </Text>
                <Text className="text-xs text-blue-800">
                  • Utilities → Electricity
                </Text>
              </View>

              {/* Action Buttons */}
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 py-3 rounded-lg"
                  disabled={saving}
                >
                  <Text className="text-center text-gray-700 font-medium">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSave}
                  className="flex-1 bg-blue-500 py-3 rounded-lg"
                  disabled={saving}
                >
                  {saving ? (
                    <View className="flex-row justify-center items-center">
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-center text-white font-medium ml-2">
                        {editingType ? "Updating..." : "Creating..."}
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-center text-white font-medium">
                      {editingType ? "Update" : "Create"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
