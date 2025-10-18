import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocationContext } from "../../contexts/LocationContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import { supabase } from "../../lib/supabase";

interface CurrencyRate {
  id: string;
  currency_code: string;
  usd_rate: number;
  is_custom: boolean;
  tenant_id: string;
  location_id: string;
  from_currency?: string;
  to_currency?: string;
  rate?: number;
  updated_at: string;
  created_at: string;
}

export default function CurrencySettings() {
  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newCurrencyCode, setNewCurrencyCode] = useState("");
  const [newCurrencyRate, setNewCurrencyRate] = useState("1");
  const [editingCurrency, setEditingCurrency] = useState<CurrencyRate | null>(
    null
  );
  const [editRate, setEditRate] = useState("");
  const [saving, setSaving] = useState(false);
  const { profile } = useUserProfile();
  const { selectedLocation } = useLocationContext();

  // Fetch currency rates (filtered by tenant and location)
  const fetchCurrencyRates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we have required data
      if (!profile?.tenant_id || !selectedLocation) {
        setCurrencyRates([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("currency_rates")
        .select("*")
        .eq("tenant_id", profile.tenant_id)
        .eq("location_id", selectedLocation)
        .order("currency_code", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      let rates = data || [];

      // Ensure USD exists as base currency
      const usdExists = rates.some((rate) => rate.currency_code === "USD");
      if (!usdExists) {
        // Add USD as base currency
        const { error: insertError } = await supabase
          .from("currency_rates")
          .insert({
            currency_code: "USD",
            usd_rate: 1,
            is_custom: false,
            tenant_id: profile.tenant_id,
            location_id: selectedLocation,
          });

        if (!insertError) {
          // Refetch to get the USD record
          const { data: refetchData } = await supabase
            .from("currency_rates")
            .select("*")
            .eq("tenant_id", profile.tenant_id)
            .eq("location_id", selectedLocation)
            .order("currency_code", { ascending: true });

          rates = refetchData || [];
        }
      }

      setCurrencyRates(rates);
    } catch (err: any) {
      console.error("Error fetching currency rates:", err);
      setError(err.message || "Failed to fetch currency rates");
    } finally {
      setLoading(false);
    }
  }, [profile?.tenant_id, selectedLocation]);

  // Add new currency
  const addCurrency = useCallback(async () => {
    try {
      if (!newCurrencyCode.trim() || parseFloat(newCurrencyRate) <= 0) {
        Alert.alert("Error", "Please provide a valid currency code and rate");
        return;
      }

      // Check if we have required data
      if (!profile?.tenant_id || !selectedLocation) {
        Alert.alert("Error", "Tenant or location information not available");
        return;
      }

      // Validate currency code (3-5 uppercase letters)
      if (!/^[A-Z]{3,5}$/.test(newCurrencyCode.trim().toUpperCase())) {
        Alert.alert("Error", "Currency code must be 3-5 uppercase letters");
        return;
      }

      const currencyCode = newCurrencyCode.trim().toUpperCase();

      // Check if currency already exists
      const existingCurrency = currencyRates.find(
        (rate) => rate.currency_code === currencyCode
      );

      if (existingCurrency) {
        Alert.alert("Error", `Currency ${currencyCode} already exists`);
        return;
      }

      setSaving(true);

      const { error: createError } = await supabase
        .from("currency_rates")
        .insert({
          currency_code: currencyCode,
          usd_rate: parseFloat(newCurrencyRate),
          is_custom: true,
          tenant_id: profile.tenant_id,
          location_id: selectedLocation,
        });

      if (createError) {
        throw createError;
      }

      Alert.alert("Success", "Currency added successfully");
      setShowAddModal(false);
      setNewCurrencyCode("");
      setNewCurrencyRate("1");
      await fetchCurrencyRates();
    } catch (err: any) {
      console.error("Error adding currency:", err);
      Alert.alert("Error", err.message || "Failed to add currency");
    } finally {
      setSaving(false);
    }
  }, [
    newCurrencyCode,
    newCurrencyRate,
    profile?.tenant_id,
    selectedLocation,
    currencyRates,
    fetchCurrencyRates,
  ]);

  // Update currency rate
  const updateCurrency = useCallback(async () => {
    try {
      if (!editingCurrency || parseFloat(editRate) <= 0) {
        Alert.alert("Error", "Please provide a valid rate");
        return;
      }

      // Check if we have required data
      if (!profile?.tenant_id || !selectedLocation) {
        Alert.alert("Error", "Tenant or location information not available");
        return;
      }

      // Don't allow updating USD rate from 1
      if (
        editingCurrency.currency_code === "USD" &&
        parseFloat(editRate) !== 1
      ) {
        Alert.alert(
          "Error",
          "USD is the base currency and must have a rate of 1"
        );
        return;
      }

      setSaving(true);

      const { error: updateError } = await supabase
        .from("currency_rates")
        .update({
          usd_rate: parseFloat(editRate),
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingCurrency.id)
        .eq("tenant_id", profile.tenant_id)
        .eq("location_id", selectedLocation);

      if (updateError) {
        throw updateError;
      }

      Alert.alert("Success", "Currency rate updated successfully");
      setShowEditModal(false);
      setEditingCurrency(null);
      setEditRate("");
      await fetchCurrencyRates();
    } catch (err: any) {
      console.error("Error updating currency:", err);
      Alert.alert("Error", err.message || "Failed to update currency rate");
    } finally {
      setSaving(false);
    }
  }, [
    editingCurrency,
    editRate,
    profile?.tenant_id,
    selectedLocation,
    fetchCurrencyRates,
  ]);

  // Delete currency
  const deleteCurrency = useCallback(
    async (currency: CurrencyRate) => {
      // Don't allow deleting USD
      if (currency.currency_code === "USD") {
        Alert.alert("Error", "USD is the base currency and cannot be deleted");
        return;
      }

      // Only allow deleting custom currencies
      if (!currency.is_custom) {
        Alert.alert("Error", "Only custom currencies can be deleted");
        return;
      }

      Alert.alert(
        "Delete Currency",
        `Are you sure you want to delete ${currency.currency_code}? This action cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                // Check if we have required data
                if (!profile?.tenant_id || !selectedLocation) {
                  Alert.alert(
                    "Error",
                    "Tenant or location information not available"
                  );
                  return;
                }

                const { error: deleteError } = await supabase
                  .from("currency_rates")
                  .delete()
                  .eq("id", currency.id)
                  .eq("tenant_id", profile.tenant_id)
                  .eq("location_id", selectedLocation);

                if (deleteError) {
                  throw deleteError;
                }

                Alert.alert("Success", "Currency deleted successfully");
                await fetchCurrencyRates();
              } catch (err: any) {
                console.error("Error deleting currency:", err);
                Alert.alert(
                  "Error",
                  err.message || "Failed to delete currency"
                );
              }
            },
          },
        ]
      );
    },
    [profile?.tenant_id, selectedLocation, fetchCurrencyRates]
  );

  // Open search for currency rate
  const searchCurrencyRate = useCallback((currencyCode: string) => {
    const searchUrl = `https://www.google.com/search?q=1+USD+to+${currencyCode}+exchange+rate`;
    Linking.openURL(searchUrl).catch(() => {
      Alert.alert("Error", "Could not open browser");
    });
  }, []);

  // Handle edit
  const handleEdit = useCallback((currency: CurrencyRate) => {
    setEditingCurrency(currency);
    setEditRate(currency.usd_rate.toString());
    setShowEditModal(true);
  }, []);

  useEffect(() => {
    fetchCurrencyRates();
  }, [fetchCurrencyRates]);

  const renderCurrencyItem = ({ item }: { item: CurrencyRate }) => (
    <View className="bg-white mx-4 mb-3 rounded-xl shadow-sm overflow-hidden">
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900">
              {item.currency_code}
            </Text>
            <Text className="text-sm text-gray-600">
              {item.currency_code === "USD"
                ? "US Dollar (Base Currency)"
                : item.is_custom
                ? "Custom Currency"
                : item.currency_code}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              Last updated: {new Date(item.updated_at).toLocaleDateString()}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-lg font-semibold text-gray-900">
              1 USD = {item.usd_rate}
            </Text>
            <Text className="text-sm text-gray-500">{item.currency_code}</Text>
          </View>
        </View>

        {item.currency_code !== "USD" && (
          <View className="flex-row justify-end space-x-2">
            <TouchableOpacity
              onPress={() => handleEdit(item)}
              className="bg-blue-50 p-2 rounded-lg"
            >
              <Ionicons name="create-outline" size={16} color="#3B82F6" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => searchCurrencyRate(item.currency_code)}
              className="bg-green-50 p-2 rounded-lg"
            >
              <Ionicons name="search-outline" size={16} color="#10B981" />
            </TouchableOpacity>

            {item.is_custom && (
              <TouchableOpacity
                onPress={() => deleteCurrency(item)}
                className="bg-red-50 p-2 rounded-lg"
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="p-5 bg-white border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-900 mb-2">
            Currency Settings
          </Text>
          <Text className="text-sm text-gray-600">
            Configure currency preferences and exchange rates
          </Text>
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="text-gray-600 mt-4">
            Loading currency settings...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="p-5 bg-white border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-900 mb-2">
            Currency Settings
          </Text>
          <Text className="text-sm text-gray-600">
            Configure currency preferences and exchange rates
          </Text>
        </View>
        <View className="flex-1 justify-center items-center p-5">
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text className="text-lg font-semibold text-red-600 mt-4 text-center">
            Error Loading Currency Settings
          </Text>
          <Text className="text-sm text-gray-600 text-center mt-2 mb-4">
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchCurrencyRates}
            className="bg-blue-500 py-2 px-4 rounded-lg"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Check if required data is available
  if (!profile?.tenant_id || !selectedLocation) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="p-5 bg-white border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-900 mb-2">
            Currency Settings
          </Text>
          <Text className="text-sm text-gray-600">
            Configure currency preferences and exchange rates
          </Text>
        </View>
        <View className="flex-1 justify-center items-center p-5">
          <Ionicons name="business-outline" size={64} color="#9CA3AF" />
          <Text className="text-lg font-semibold text-gray-600 mt-4 text-center">
            Location Required
          </Text>
          <Text className="text-sm text-gray-500 text-center mt-2">
            Please select a location to manage currency settings.
          </Text>
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
              Currency Settings
            </Text>
            <Text className="text-sm text-gray-600">
              Manage currency rates and preferences
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            className="bg-blue-500 py-2 px-4 rounded-lg flex-row items-center"
          >
            <Ionicons name="add" size={16} color="white" />
            <Text className="text-white font-semibold ml-1">Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View className="bg-blue-50 border border-blue-200 mx-4 mt-4 p-4 rounded-xl">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={20} color="#1D4ED8" />
            <Text className="text-base font-semibold text-blue-800 ml-2">
              USD-Based Currency System
            </Text>
          </View>
          <Text className="text-sm text-blue-700">
            All currency conversions are based on USD exchange rates. Add custom
            currencies with their USD rates for automatic cross-currency
            conversions. Currencies are managed per location.
          </Text>
        </View>

        {/* Currency List */}
        <View className="mt-4">
          <Text className="text-lg font-semibold text-gray-900 mx-4 mb-3">
            Current Currencies
          </Text>

          {currencyRates.length === 0 ? (
            <View className="flex-1 justify-center items-center p-8 min-h-96">
              <Ionicons name="card-outline" size={64} color="#9CA3AF" />
              <Text className="text-lg font-semibold text-gray-600 mt-4">
                No Currencies Found
              </Text>
              <Text className="text-sm text-gray-500 text-center mt-2">
                Add a custom currency to get started.
              </Text>
            </View>
          ) : (
            <FlatList
              data={currencyRates}
              renderItem={renderCurrencyItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Important Notes */}
        <View className="bg-amber-50 border border-amber-200 mx-4 my-4 p-4 rounded-xl">
          <View className="flex-row items-center mb-2">
            <Ionicons name="warning" size={20} color="#D97706" />
            <Text className="text-base font-semibold text-amber-800 ml-2">
              Important Notes
            </Text>
          </View>
          <Text className="text-sm text-amber-700 mb-2">
            • USD is the base currency and cannot be modified or deleted
          </Text>
          <Text className="text-sm text-amber-700 mb-2">
            • All currency conversions are calculated via USD rates
          </Text>
          <Text className="text-sm text-amber-700 mb-2">
            • Use the "Search" button to find current exchange rates
          </Text>
          <Text className="text-sm text-amber-700 mb-2">
            • Custom currencies can be edited or deleted anytime
          </Text>
          <Text className="text-sm text-amber-700">
            • Changes apply to all reports and calculations immediately
          </Text>
        </View>
      </ScrollView>

      {/* Add Currency Modal */}
      <Modal
        visible={showAddModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-xl w-full max-w-md mx-4 shadow-lg">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">
                Add Custom Currency
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                className="p-1"
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="p-4">
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Currency Code *
                </Text>
                <Text className="text-xs text-gray-500 mb-2">
                  3-5 uppercase letters (e.g., LKR, EUR, GBP)
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50 uppercase"
                  placeholder="e.g. LKR"
                  value={newCurrencyCode}
                  onChangeText={(text) =>
                    setNewCurrencyCode(text.toUpperCase())
                  }
                  maxLength={5}
                  autoCapitalize="characters"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  USD Rate *
                </Text>
                <Text className="text-xs text-gray-500 mb-2">
                  1 USD = {newCurrencyRate} {newCurrencyCode || "XXX"}
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50"
                  placeholder="e.g. 300.50"
                  value={newCurrencyRate}
                  onChangeText={setNewCurrencyRate}
                  keyboardType="decimal-pad"
                />
              </View>

              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 py-3 rounded-lg"
                  disabled={saving}
                >
                  <Text className="text-center text-gray-700 font-medium">
                    Cancel
                  </Text>
                </TouchableOpacity>

                {newCurrencyCode && (
                  <TouchableOpacity
                    onPress={() => searchCurrencyRate(newCurrencyCode)}
                    className="bg-green-100 py-3 px-4 rounded-lg"
                    disabled={saving}
                  >
                    <Text className="text-center text-green-700 font-medium">
                      Search Rate
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={addCurrency}
                  className="flex-1 bg-blue-500 py-3 rounded-lg"
                  disabled={
                    saving ||
                    !newCurrencyCode.trim() ||
                    parseFloat(newCurrencyRate) <= 0
                  }
                >
                  {saving ? (
                    <View className="flex-row justify-center items-center">
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-center text-white font-medium ml-2">
                        Adding...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-center text-white font-medium">
                      Add
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Currency Modal */}
      <Modal
        visible={showEditModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-xl w-full max-w-md mx-4 shadow-lg">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">
                Edit {editingCurrency?.currency_code} Rate
              </Text>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                className="p-1"
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="p-4">
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  USD Rate *
                </Text>
                <Text className="text-xs text-gray-500 mb-2">
                  1 USD = {editRate} {editingCurrency?.currency_code}
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50"
                  placeholder="Enter new rate"
                  value={editRate}
                  onChangeText={setEditRate}
                  keyboardType="decimal-pad"
                />
              </View>

              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-100 py-3 rounded-lg"
                  disabled={saving}
                >
                  <Text className="text-center text-gray-700 font-medium">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={updateCurrency}
                  className="flex-1 bg-blue-500 py-3 rounded-lg"
                  disabled={saving || parseFloat(editRate) <= 0}
                >
                  {saving ? (
                    <View className="flex-row justify-center items-center">
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-center text-white font-medium ml-2">
                        Updating...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-center text-white font-medium">
                      Update
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
