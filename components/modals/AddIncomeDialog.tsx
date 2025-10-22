import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../../hooks/useAuth";
import { useTenant } from "../../hooks/useTenant";
import { useLocationContext } from "../../contexts/LocationContext";
import { useToast } from "../../hooks/useToast";
import { supabase } from "../../lib/supabase";
import { convertCurrency } from "../../utils/currency";
import type { Database } from "../../integrations/supabase/types";

type Reservation = Database["public"]["Tables"]["reservations"]["Row"];
type Account = Database["public"]["Tables"]["accounts"]["Row"];
type IncomeType = {
  id: string;
  type_name: string;
  created_at: string;
  tenant_id: string;
};

interface AddIncomeDialogProps {
  visible: boolean;
  onClose: () => void;
  selectedReservation: Reservation | null;
  accounts: Account[];
  onSuccess: () => void;
}

export function AddIncomeDialog({
  visible,
  onClose,
  selectedReservation,
  accounts,
  onSuccess,
}: AddIncomeDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { selectedLocation } = useLocationContext();

  const [incomeTypes, setIncomeTypes] = useState<IncomeType[]>([]);
  const [isAddToBill, setIsAddToBill] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    amount: 0,
    currency: "LKR" as "LKR" | "USD" | "EUR" | "GBP",
    note: "",
    account_id: "",
    income_type_id: "",
    payment_method: "cash",
  });

  // Fetch income types
  useEffect(() => {
    const fetchIncomeTypes = async () => {
      if (!tenant?.id || !visible) return;

      try {
        const { data, error } = await supabase
          .from("income_types")
          .select("*")
          .eq("tenant_id", tenant.id)
          .order("type_name", { ascending: true });

        if (error) throw error;
        setIncomeTypes(data || []);

        // Set default income type if available
        if (data && data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            income_type_id: data[0].id,
          }));
        }
      } catch (error) {
        console.error("Error fetching income types:", error);
      }
    };

    fetchIncomeTypes();
  }, [tenant?.id, visible]);

  // Initialize form data when reservation changes
  useEffect(() => {
    if (selectedReservation) {
      const reservationBalance = Math.max(
        0,
        (selectedReservation.total_amount || 0) -
          (selectedReservation.paid_amount || 0)
      );

      const initialAccount = accounts && accounts.length > 0 ? accounts[0] : null;

      setFormData({
        amount: reservationBalance,
        currency: (initialAccount?.currency || "LKR") as
          | "LKR"
          | "USD"
          | "EUR"
          | "GBP",
        note: `Reservation ${selectedReservation.reservation_number}`,
        account_id: initialAccount?.id || "",
        income_type_id:
          incomeTypes && incomeTypes.length > 0 ? incomeTypes[0].id : "",
        payment_method: "cash",
      });
    }
  }, [selectedReservation, accounts, incomeTypes]);

  const handleSubmit = async () => {
    if (!selectedReservation || !tenant?.id || !selectedLocation) return;

    // Validation
    if (!formData.amount || formData.amount <= 0) {
      Alert.alert("Validation Error", "Please enter a valid amount");
      return;
    }

    if (!isAddToBill && !formData.account_id) {
      Alert.alert(
        "Validation Error",
        "Please select an account for the payment"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      if (isAddToBill) {
        // Add to bill: create income record with pending status
        const { error: incomeError } = await supabase.from("income").insert({
          booking_id: selectedReservation.id,
          amount: formData.amount,
          currency: formData.currency,
          note:
            formData.note ||
            `Additional service for reservation ${selectedReservation.reservation_number}`,
          income_type_id: formData.income_type_id || null,
          tenant_id: tenant.id,
          location_id: selectedLocation,
          account_id: null, // No account for pending items
          payment_method: "pending",
          type: "booking",
        });

        if (incomeError) throw incomeError;

        toast({
          title: "Success",
          description: "Item added to guest bill successfully",
        });
      } else {
        // Immediate payment
        const selectedAccount = accounts.find(
          (acc) => acc.id === formData.account_id
        );
        const accountCurrency = selectedAccount?.currency || "LKR";

        // Convert amount to account currency if needed
        let convertedAmount = formData.amount;
        if (formData.currency !== accountCurrency) {
          convertedAmount = await convertCurrency(
            formData.amount,
            formData.currency,
            accountCurrency,
            tenant.id,
            selectedLocation
          );
        }

        const { error: incomeError } = await supabase.from("income").insert({
          booking_id: selectedReservation.id,
          amount: convertedAmount,
          currency: accountCurrency as "LKR" | "USD" | "EUR" | "GBP",
          payment_method: formData.payment_method,
          account_id: formData.account_id,
          income_type_id: formData.income_type_id || null,
          type: "booking",
          note:
            formData.note ||
            `General income for reservation ${selectedReservation.reservation_number}`,
          date: new Date().toISOString().split("T")[0],
          is_advance: false,
          additional_service_id: null,
          tenant_id: tenant.id,
          location_id: selectedLocation,
        });

        if (incomeError) throw incomeError;

        toast({
          title: "Success",
          description: "Income recorded successfully",
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error recording income:", error);
      Alert.alert(
        "Error",
        error?.message || "Failed to record income. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setIsAddToBill(false);
  };

  if (!selectedReservation || !tenant?.id || !selectedLocation) {
    return null;
  }

  if (loading) {
    return (
      <Modal visible={visible} transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-8">
            <ActivityIndicator size="large" color="#0000ff" />
            <Text className="mt-4 text-gray-600">Loading...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-lg w-[90%] max-h-[85%]">
          {/* Header */}
          <View className="border-b border-gray-200 px-4 py-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="cash-outline" size={20} color="#000" />
              <Text className="text-lg font-semibold">Add Income</Text>
            </View>
            <Text className="text-gray-600 mt-1">
              Record income for reservation {selectedReservation.reservation_number}
            </Text>
          </View>

          <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
            <View className="gap-4">
              {/* Add to Bill Toggle */}
              <View className="bg-blue-50 rounded-lg p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-1 mr-3">
                    <Text className="text-sm font-medium mb-1">
                      Add to Guest Bill
                    </Text>
                    <Text className="text-xs text-gray-600">
                      {isAddToBill
                        ? "This item will be added to the guest's total bill to pay at checkout"
                        : "This will be recorded as an immediate payment"}
                    </Text>
                  </View>
                  <Switch
                    value={isAddToBill}
                    onValueChange={setIsAddToBill}
                    trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
                    thumbColor={isAddToBill ? "#ffffff" : "#f3f4f6"}
                  />
                </View>
              </View>

              {/* Reservation Info */}
              <View className="bg-gray-50 rounded-lg p-3">
                <View className="gap-2">
                  <View className="flex-row">
                    <Text className="font-semibold">Reservation: </Text>
                    <Text>{selectedReservation.reservation_number}</Text>
                  </View>
                  <View className="flex-row">
                    <Text className="font-semibold">Guest: </Text>
                    <Text>{selectedReservation.guest_name}</Text>
                  </View>
                  <View className="flex-row">
                    <Text className="font-semibold">Balance: </Text>
                    <Text>
                      {selectedReservation.currency}{" "}
                      {Math.max(
                        0,
                        (selectedReservation.total_amount || 0) -
                          (selectedReservation.paid_amount || 0)
                      ).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Income Type */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Income Type
                </Text>
                {incomeTypes.length > 0 ? (
                  <View className="border border-gray-300 rounded-lg">
                    <Picker
                      selectedValue={formData.income_type_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, income_type_id: value })
                      }
                    >
                      {incomeTypes.map((type) => (
                        <Picker.Item
                          key={type.id}
                          label={type.type_name}
                          value={type.id}
                        />
                      ))}
                    </Picker>
                  </View>
                ) : (
                  <View className="border border-yellow-300 bg-yellow-50 rounded-lg p-3">
                    <Text className="text-sm text-yellow-800">
                      Add income types in settings
                    </Text>
                  </View>
                )}
              </View>

              {/* Amount */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </Text>
                <TextInput
                  value={formData.amount.toString()}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(text) || 0,
                    })
                  }
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  className="border border-gray-300 rounded-lg px-3 py-3 text-base"
                />
              </View>

              {/* Currency */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Currency *
                </Text>
                <View className="border border-gray-300 rounded-lg">
                  <Picker
                    selectedValue={formData.currency}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        currency: value as "LKR" | "USD" | "EUR" | "GBP",
                      })
                    }
                  >
                    <Picker.Item label="LKR - Sri Lankan Rupee" value="LKR" />
                    <Picker.Item label="USD - US Dollar" value="USD" />
                    <Picker.Item label="EUR - Euro" value="EUR" />
                    <Picker.Item label="GBP - British Pound" value="GBP" />
                  </Picker>
                </View>
              </View>

              {/* Account (only for immediate payment) */}
              {!isAddToBill && (
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Account *
                  </Text>
                  <View className="border border-gray-300 rounded-lg">
                    <Picker
                      selectedValue={formData.account_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, account_id: value })
                      }
                    >
                      <Picker.Item label="Select account" value="" />
                      {accounts.map((account) => (
                        <Picker.Item
                          key={account.id}
                          label={`${account.name} (${account.currency})`}
                          value={account.id}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              )}

              {/* Payment Method (only for immediate payment) */}
              {!isAddToBill && (
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </Text>
                  <View className="border border-gray-300 rounded-lg">
                    <Picker
                      selectedValue={formData.payment_method}
                      onValueChange={(value) =>
                        setFormData({ ...formData, payment_method: value })
                      }
                    >
                      <Picker.Item label="Cash" value="cash" />
                      <Picker.Item label="Credit/Debit Card" value="card" />
                      <Picker.Item label="Bank Transfer" value="bank_transfer" />
                      <Picker.Item label="Mobile Payment" value="mobile_payment" />
                      <Picker.Item label="Cheque" value="cheque" />
                    </Picker>
                  </View>
                </View>
              )}

              {/* Note */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Note
                </Text>
                <TextInput
                  value={formData.note}
                  onChangeText={(text) =>
                    setFormData({ ...formData, note: text })
                  }
                  placeholder="Add a note..."
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className="border border-gray-300 rounded-lg px-3 py-3 text-base"
                />
              </View>

              {/* Info Box */}
              <View
                className={`rounded-lg p-3 ${
                  isAddToBill ? "bg-blue-50" : "bg-green-50"
                }`}
              >
                <Text className="text-sm font-medium mb-1">
                  {isAddToBill ? "Add to Guest Bill" : "Immediate Payment"}
                </Text>
                <Text className="text-xs text-gray-600">
                  {isAddToBill
                    ? "This item will be added to the guest's total bill to pay at checkout"
                    : "This will be recorded as an immediate payment"}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View className="flex-row gap-3 justify-end px-4 py-3 border-t border-gray-200">
            <TouchableOpacity
              onPress={handleClose}
              className="flex-1 bg-gray-600 py-3 rounded-lg"
              disabled={isSubmitting}
            >
              <Text className="text-white text-center font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={
                isSubmitting ||
                !formData.amount ||
                (!isAddToBill && !formData.account_id)
              }
              className={`flex-1 bg-blue-600 py-3 rounded-lg ${
                isSubmitting ||
                !formData.amount ||
                (!isAddToBill && !formData.account_id)
                  ? "opacity-50"
                  : ""
              }`}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Ionicons name="checkmark-outline" size={16} color="white" />
                <Text className="text-white font-semibold">
                  {isSubmitting
                    ? "Recording..."
                    : isAddToBill
                      ? "Add to Bill"
                      : "Record Payment"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
