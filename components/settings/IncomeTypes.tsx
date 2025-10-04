import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
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
import { useUserProfile } from "../../hooks/useUserProfile";
import { supabase } from "../../lib/supabase";

interface IncomeType {
  id: string;
  type_name: string;
  tenant_id: string;
  created_at: string;
}

export default function IncomeTypes() {
  const [incomeTypes, setIncomeTypes] = useState<IncomeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [saving, setSaving] = useState(false);
  const { profile } = useUserProfile();

  // Fetch income types with tenant filtering
  const fetchIncomeTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!profile?.tenant_id) {
        setError("No tenant context available");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("income_types")
        .select("*")
        .eq("tenant_id", profile.tenant_id)
        .order("type_name", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setIncomeTypes(data || []);
    } catch (err: any) {
      console.error("Error fetching income types:", err);
      setError(err.message || "Failed to fetch income types");
    } finally {
      setLoading(false);
    }
  }, [profile?.tenant_id]);

  // Create new income type with tenant_id
  const createIncomeType = useCallback(
    async (typeName: string) => {
      try {
        if (!profile?.tenant_id) {
          throw new Error("No tenant context available");
        }

        const { error: createError } = await supabase
          .from("income_types")
          .insert({
            type_name: typeName.trim(),
            tenant_id: profile.tenant_id,
          });

        if (createError) {
          throw createError;
        }

        // Refresh the data
        await fetchIncomeTypes();
      } catch (err: any) {
        console.error("Error creating income type:", err);
        throw err;
      }
    },
    [profile?.tenant_id, fetchIncomeTypes]
  );

  // Delete income type
  const deleteIncomeType = useCallback(
    async (id: string) => {
      try {
        const { error: deleteError } = await supabase
          .from("income_types")
          .delete()
          .eq("id", id);

        if (deleteError) {
          throw deleteError;
        }

        // Refresh the data
        await fetchIncomeTypes();
      } catch (err: any) {
        console.error("Error deleting income type:", err);
        throw err;
      }
    },
    [fetchIncomeTypes]
  );

  const refetch = useCallback(async () => {
    await fetchIncomeTypes();
  }, [fetchIncomeTypes]);

  useEffect(() => {
    if (profile?.tenant_id) {
      fetchIncomeTypes();
    }
  }, [fetchIncomeTypes, profile?.tenant_id]);

  const handleAdd = () => {
    setNewTypeName("");
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (!newTypeName.trim()) {
        Alert.alert("Error", "Please enter an income type name");
        return;
      }

      setSaving(true);
      await createIncomeType(newTypeName);
      Alert.alert("Success", "Income type added successfully");
      setShowModal(false);
      setNewTypeName("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add income type");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (incomeType: any) => {
    Alert.alert(
      "Delete Income Type",
      `Are you sure you want to delete "${incomeType.type_name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteIncomeType(incomeType.id);
              Alert.alert("Success", "Income type deleted successfully");
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "Failed to delete income type"
              );
            }
          },
        },
      ]
    );
  };

  const renderIncomeType = ({ item }: { item: any }) => (
    <View className="bg-white mx-4 mb-3 rounded-xl shadow-sm overflow-hidden">
      <View className="p-4 flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 capitalize">
            {item.type_name}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            Created {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          className="p-2 bg-red-50 rounded-lg"
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="p-5 bg-white border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-900 mb-2">
            Income Types
          </Text>
          <Text className="text-sm text-gray-600">
            Configure different types of income sources and categories
          </Text>
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="text-gray-600 mt-4">Loading income types...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="p-5 bg-white border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-900 mb-2">
            Income Types
          </Text>
          <Text className="text-sm text-gray-600">
            Configure different types of income sources and categories
          </Text>
        </View>
        <View className="flex-1 justify-center items-center p-5">
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text className="text-lg font-semibold text-red-600 mt-4 text-center">
            Error Loading Income Types
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
              Income Types
            </Text>
            <Text className="text-sm text-gray-600">
              Add and manage income type categories
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

      {/* Income Types List */}
      <FlatList
        data={incomeTypes}
        renderItem={renderIncomeType}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-8 min-h-96">
            <Ionicons name="cash-outline" size={64} color="#9CA3AF" />
            <Text className="text-lg font-semibold text-gray-600 mt-4">
              No Income Types Found
            </Text>
            <Text className="text-sm text-gray-500 text-center mt-2">
              Start by adding your first income type category.
            </Text>
            <TouchableOpacity
              onPress={handleAdd}
              className="bg-blue-500 py-2 px-4 rounded-lg mt-4"
            >
              <Text className="text-white font-semibold">Add Income Type</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Summary Footer */}
      <View className="bg-white border-t border-gray-200 p-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-sm text-gray-600">
            Total Income Types: {incomeTypes.length}
          </Text>
        </View>
      </View>

      {/* Add Income Type Modal - Small Popup Window */}
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
                Add Income Type
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
                  Income Type Name *
                </Text>
                <Text className="text-xs text-gray-500 mb-2">
                  e.g., Booking, Food, Laundry, Tours
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50"
                  placeholder="Enter income type name"
                  value={newTypeName}
                  onChangeText={setNewTypeName}
                  autoCapitalize="words"
                />
              </View>

              {/* Examples Section */}
              <View className="bg-green-50 rounded-lg p-3 mb-4">
                <Text className="text-sm font-semibold text-green-900 mb-2">
                  Examples:
                </Text>
                <Text className="text-xs text-green-800">
                  • Booking Revenue
                </Text>
                <Text className="text-xs text-green-800">
                  • Food & Beverage
                </Text>
                <Text className="text-xs text-green-800">
                  • Laundry Services
                </Text>
                <Text className="text-xs text-green-800">• Tour Services</Text>
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
                        Creating...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-center text-white font-medium">
                      Create
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
