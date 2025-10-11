import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SUPPORTED_CURRENCIES, CurrencyType } from "../../lib/currencies";
import { supabase } from "../../lib/supabase";

interface Account {
  id: string;
  name: string;
  currency: "LKR" | "USD"; // Restricted to only LKR and USD
  current_balance: number;
  initial_balance: number;
  location_access: string[];
  tenant_id: string;
  created_at: string;
}

interface Location {
  id: string;
  name: string;
  tenant_id: string;
  is_active: boolean;
}

interface AccountFormProps {
  visible: boolean;
  onClose: () => void;
  account: Account | null;
  locations: Location[];
  onSaved: () => void;
  tenantId: string;
}

export function AccountForm({
  visible,
  onClose,
  account: editingAccount,
  locations,
  onSaved,
  tenantId,
}: AccountFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    currency: "LKR" as CurrencyType,
    initial_balance: 0,
    location_access: [] as string[],
  });

  useEffect(() => {
    if (editingAccount) {
      setFormData({
        name: editingAccount.name,
        currency: editingAccount.currency,
        initial_balance: editingAccount.initial_balance,
        location_access: editingAccount.location_access,
      });
    } else {
      resetForm();
    }
  }, [editingAccount, visible]);

  const resetForm = () => {
    setFormData({
      name: "",
      currency: "LKR",
      initial_balance: 0,
      location_access: [],
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert("Error", "Account name is required");
      return;
    }

    if (formData.name.trim().length < 2) {
      Alert.alert("Error", "Account name must be at least 2 characters long");
      return;
    }

    if (formData.initial_balance < 0) {
      Alert.alert("Error", "Initial balance cannot be negative");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (editingAccount) {
        // Update existing account
        const initialBalanceDifference =
          formData.initial_balance - editingAccount.initial_balance;
        const newCurrentBalance =
          editingAccount.current_balance + initialBalanceDifference;

        const { error } = await supabase
          .from("accounts")
          .update({
            name: formData.name,
            currency: formData.currency,
            initial_balance: formData.initial_balance,
            current_balance: newCurrentBalance,
            location_access: formData.location_access,
          })
          .eq("id", editingAccount.id);

        if (error) throw error;

        Alert.alert("Success", "Account updated successfully");
      } else {
        // Create new account
        const { error } = await supabase.from("accounts").insert({
          name: formData.name,
          currency: formData.currency,
          initial_balance: formData.initial_balance,
          current_balance: formData.initial_balance,
          location_access: formData.location_access,
          tenant_id: tenantId,
        });

        if (error) throw error;

        Alert.alert("Success", "Account created successfully");
      }

      onSaved();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error saving account:", error);
      Alert.alert("Error", "Failed to save account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationToggle = (locationId: string) => {
    setFormData((prev) => ({
      ...prev,
      location_access: prev.location_access.includes(locationId)
        ? prev.location_access.filter((id) => id !== locationId)
        : [...prev.location_access, locationId],
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-6 py-4 flex-row justify-between items-center">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">
            {editingAccount ? "Edit Account" : "Add Account"}
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg ${
              isSubmitting ? "bg-gray-300" : "bg-blue-500"
            }`}
          >
            <Text
              className={`font-medium ${
                isSubmitting ? "text-gray-500" : "text-white"
              }`}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6 py-6">
          {/* Account Name */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Account Name *
            </Text>
            <TextInput
              value={formData.name}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, name: text }))
              }
              placeholder="Enter account name"
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
            />
          </View>

          {/* Currency Selection */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Currency *
            </Text>
            <TouchableOpacity
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex-row items-center justify-between"
              onPress={() => {
                Alert.alert(
                  "Select Currency",
                  "Choose your account currency",
                  [
                    { text: "Cancel", style: "cancel" },
                    ...SUPPORTED_CURRENCIES.map((currency) => ({
                      text: `${currency.symbol} ${currency.value} - ${currency.label}`,
                      onPress: () => {
                        setFormData((prev) => ({
                          ...prev,
                          currency: currency.value,
                        }));
                      },
                    })),
                  ]
                );
              }}
            >
              <View className="flex-1">
                <Text className="font-medium text-gray-800">
                  {SUPPORTED_CURRENCIES.find(c => c.value === formData.currency)?.symbol} {formData.currency}
                </Text>
                <Text className="text-sm text-gray-500">
                  {SUPPORTED_CURRENCIES.find(c => c.value === formData.currency)?.label}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Initial Balance */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Initial Balance
            </Text>
            <TextInput
              value={formData.initial_balance.toString()}
              onChangeText={(text) => {
                const value = parseFloat(text) || 0;
                setFormData((prev) => ({ ...prev, initial_balance: value }));
              }}
              placeholder="0.00"
              keyboardType="numeric"
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
            />
          </View>

          {/* Location Access */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-3">
              Location Access
            </Text>
            <View className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {locations.map((location, index) => (
                <View
                  key={location.id}
                  className={`px-4 py-3 flex-row items-center justify-between ${
                    index < locations.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <Text className="text-gray-800 flex-1">{location.name}</Text>
                  <Switch
                    value={formData.location_access.includes(location.id)}
                    onValueChange={() => handleLocationToggle(location.id)}
                    trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
                    thumbColor={
                      formData.location_access.includes(location.id)
                        ? "#FFFFFF"
                        : "#FFFFFF"
                    }
                  />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
