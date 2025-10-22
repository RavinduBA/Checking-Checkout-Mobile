import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
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
import { useLocationContext } from "../../contexts/LocationContext";
import { useAuth } from "../../hooks/useAuth";
import { useTenant } from "../../hooks/useTenant";
import { useToast } from "../../hooks/useToast";
import { Database } from "../../integrations/supabase/types";
import { supabase } from "../../lib/supabase";
import { convertCurrency } from "../../utils/currency";

type Reservation = Database["public"]["Tables"]["reservations"]["Row"] & {
  locations?: Database["public"]["Tables"]["locations"]["Row"];
  rooms?: Database["public"]["Tables"]["rooms"]["Row"];
};
type Account = Database["public"]["Tables"]["accounts"]["Row"];

interface PaymentDialogProps {
  visible: boolean;
  reservation: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentDialog({
  visible,
  reservation: initialReservation,
  onClose,
  onSuccess,
}: PaymentDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { selectedLocation } = useLocationContext();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [location, setLocation] = useState<any>(null);
  const [incomeRecords, setIncomeRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Get initial values from the passed reservation
  const initialAmount = initialReservation?.balance_amount || 0;
  const initialCurrency = initialReservation?.currency || "LKR";

  const [formData, setFormData] = useState({
    payment_type: "room_payment",
    payment_method: "cash",
    amount: Math.abs(initialAmount),
    account_id: "",
    notes: "",
    currency: initialCurrency as any,
    reference_number: "",
    markAsComplete: false,
  });

  // State for display amounts (converted for consistency with reservation list)
  const [displayAmounts, setDisplayAmounts] = useState({
    totalAmount: 0,
    paidAmount: 0,
    balanceAmount: Math.abs(initialAmount),
    currency: initialCurrency,
  });

  const fetchLocation = useCallback(
    async (locationId: string) => {
      if (!tenant?.id) return;

      try {
        const { data } = await supabase
          .from("locations")
          .select("id, name, phone, email")
          .eq("id", locationId)
          .eq("tenant_id", tenant.id)
          .single();

        setLocation(data);
      } catch (error) {
        console.error("Failed to fetch location:", error);
      }
    },
    [tenant?.id]
  );

  const fetchReservationAndAccounts = useCallback(async () => {
    if (!tenant?.id || !initialReservation?.id) {
      return;
    }

    setLoading(true);
    try {
      const [reservationRes, accountsRes, incomeRes] = await Promise.all([
        supabase
          .from("reservations")
          .select(
            `
            *,
            locations (*),
            rooms (*)
          `
          )
          .eq("id", initialReservation.id)
          .eq("tenant_id", tenant.id)
          .single(),

        supabase
          .from("accounts")
          .select("*")
          .eq("tenant_id", tenant.id)
          .order("name"),

        supabase
          .from("income")
          .select("*")
          .eq("booking_id", initialReservation.id)
          .eq("tenant_id", tenant.id)
          .order("created_at", { ascending: false }),
      ]);

      if (reservationRes.error) {
        Alert.alert("Error", "Failed to fetch reservation details");
        return;
      }

      setReservation(reservationRes.data);
      setAccounts(accountsRes.data || []);
      setIncomeRecords(incomeRes.data || []);

      if (reservationRes.data?.location_id) {
        await fetchLocation(reservationRes.data.location_id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load payment form");
    } finally {
      setLoading(false);
    }
  }, [tenant?.id, initialReservation?.id, fetchLocation]);

  useEffect(() => {
    if (visible && initialReservation?.id) {
      fetchReservationAndAccounts();
    }
  }, [visible, initialReservation?.id, fetchReservationAndAccounts]);

  useEffect(() => {
    if (initialReservation) {
      const amount = Math.abs(initialReservation.balance_amount || 0);
      const currency = initialReservation.currency || "LKR";

      setFormData((prev) => ({
        ...prev,
        amount: amount,
        currency: currency as any,
      }));

      // Update display amounts to match the currency shown in reservation list
      setDisplayAmounts({
        balanceAmount: amount,
        currency: currency,
        totalAmount: 0, // Will be updated when reservation loads
        paidAmount: 0, // Will be updated when reservation loads
      });
    }
  }, [initialReservation]);

  // Convert reservation amounts to display currency when reservation loads
  useEffect(() => {
    if (reservation && initialCurrency) {
      const convertAmounts = async () => {
        try {
          const convertedTotal = await convertCurrency(
            reservation.total_amount,
            reservation.currency,
            initialCurrency,
            tenant?.id!,
            reservation.location_id
          );
          const convertedPaid = await convertCurrency(
            reservation.paid_amount || 0,
            reservation.currency,
            initialCurrency,
            tenant?.id!,
            reservation.location_id
          );

          setDisplayAmounts({
            totalAmount: Math.round(convertedTotal * 100) / 100,
            paidAmount: Math.round(convertedPaid * 100) / 100,
            balanceAmount: initialAmount, // Use the amount passed from reservation list
            currency: initialCurrency,
          });
        } catch (error) {
          console.error("Error converting currency for display:", error);
        }
      };

      convertAmounts();
    }
  }, [reservation, initialCurrency, initialAmount, tenant?.id]);

  // Set default account when accounts are loaded
  useEffect(() => {
    if (
      accounts.length > 0 &&
      formData.currency &&
      (!formData.account_id || formData.account_id === "")
    ) {
      const compatibleAccountsForCurrency = accounts.filter(
        (account) => account.currency === formData.currency
      );
      if (compatibleAccountsForCurrency.length > 0) {
        setFormData((prev) => ({
          ...prev,
          account_id: compatibleAccountsForCurrency[0].id,
        }));
      }
    }
  }, [accounts, formData.currency, formData.account_id]);

  // Handle currency change with automatic amount conversion
  const handleCurrencyChange = async (newCurrency: string) => {
    try {
      // Convert current amount from current currency to new currency
      const convertedAmount = await convertCurrency(
        formData.amount,
        formData.currency,
        newCurrency,
        tenant?.id!,
        reservation?.location_id!
      );

      setFormData({
        ...formData,
        currency: newCurrency as any,
        amount: Math.round(convertedAmount * 100) / 100, // Round to 2 decimal places
      });
    } catch (error) {
      console.error("Error converting currency:", error);
      // If conversion fails, just change currency without changing amount
      setFormData({
        ...formData,
        currency: newCurrency as any,
      });
    }
  };

  const handleSubmit = async () => {
    if (!reservation || !tenant?.id) return;

    // Validation
    if (!formData.payment_method) {
      Alert.alert("Validation Error", "Please select a payment method");
      return;
    }

    if (!formData.account_id) {
      Alert.alert("Validation Error", "Please select an account");
      return;
    }

    if (formData.amount <= 0) {
      Alert.alert("Validation Error", "Amount must be greater than 0");
      return;
    }

    // Prevent overpayment - check remaining balance
    const totalAmount = reservation.total_amount || 0;
    const paidAmount = reservation.paid_amount || 0;
    const remainingBalance = totalAmount - paidAmount;

    // Convert payment amount to reservation currency for comparison
    let paymentAmountInReservationCurrency = formData.amount;
    if (formData.currency !== reservation.currency) {
      try {
        paymentAmountInReservationCurrency = await convertCurrency(
          formData.amount,
          formData.currency,
          reservation.currency,
          tenant?.id!,
          reservation.location_id
        );
      } catch (error) {
        console.error("Error converting currency for validation:", error);
      }
    }

    if (paymentAmountInReservationCurrency > remainingBalance) {
      Alert.alert(
        "Payment Amount Exceeds Balance",
        `Payment amount (${formData.currency} ${
          formData.amount
        }) exceeds remaining balance (${
          reservation.currency
        } ${remainingBalance.toFixed(2)}). Please adjust the amount.`
      );
      return;
    }

    setSubmitting(true);
    try {
      // Convert amount to the RESERVATION currency (not account currency!)
      // This is critical because the database trigger compares payment amount against reservation balance
      // and both must be in the same currency for accurate validation
      const convertedAmount = await convertCurrency(
        formData.amount,
        formData.currency,
        reservation.currency, // Convert to reservation currency, NOT account currency
        tenant?.id!,
        reservation.location_id
      );

      // Create payment record (database trigger will automatically update reservation)
      const { error: paymentError } = await supabase.from("payments").insert({
        reservation_id: reservation.id,
        tenant_id: tenant?.id!,
        amount: convertedAmount,
        currency: reservation.currency as "LKR" | "USD" | "EUR" | "GBP", // Use reservation currency
        payment_method: formData.payment_method,
        payment_type: formData.payment_type,
        payment_number: `PAY-${Date.now()}`, // Generate unique payment number
        account_id: formData.account_id,
        notes: formData.notes,
        reference_number: formData.reference_number || null,
        created_by: user?.id || null,
      });

      if (paymentError) throw paymentError;

      // If marked as complete, update reservation status to checked_out
      if (formData.markAsComplete) {
        const { error: statusError } = await supabase
          .from("reservations")
          .update({ status: "checked_out" })
          .eq("id", reservation.id);

        if (statusError) {
          console.error("Error updating reservation status:", statusError);
          // Don't throw error - payment was successful, just status update failed
        }
      }

      toast({
        title: "Payment Recorded",
        description: formData.markAsComplete
          ? "Payment recorded and reservation marked as completed!"
          : `Payment of ${formData.currency} ${formData.amount} has been recorded successfully.`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Payment error:", error);
      // If server returned a hint (Postgres RAISE), show it to the user
      const hint = error?.hint || error?.message || null;
      if (hint) {
        Alert.alert("Payment Error", String(hint));
      } else {
        Alert.alert(
          "Payment Error",
          "Failed to record payment. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      payment_type: "room_payment",
      payment_method: "cash",
      amount: initialAmount,
      account_id: "",
      notes: "",
      currency: initialCurrency as any,
      reference_number: "",
      markAsComplete: false,
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (loading) {
    return (
      <Modal visible={visible} transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-8">
            <ActivityIndicator size="large" color="#0000ff" />
            <Text className="mt-4 text-gray-600">
              Loading payment details...
            </Text>
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
              <Ionicons name="card-outline" size={20} color="#000" />
              <Text className="text-lg font-semibold">Record Payment</Text>
            </View>
            <Text className="text-gray-600 mt-1">
              Record a payment for reservation{" "}
              {initialReservation?.reservation_number}
            </Text>
          </View>

          <ScrollView
            className="px-4 py-4"
            showsVerticalScrollIndicator={false}
          >
            {initialReservation && (
              <View className="gap-4">
                {/* Reservation Details */}
                <View className="border border-gray-200 rounded-lg p-3">
                  <Text className="text-base font-semibold mb-3">
                    Reservation Details
                  </Text>
                  <View className="space-y-3">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-gray-600">Guest:</Text>
                      <Text className="text-sm font-medium">
                        {reservation?.guest_name}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-gray-600">Room:</Text>
                      <Text className="text-sm font-medium">
                        {reservation?.rooms?.room_number}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-gray-600">Check-in:</Text>
                      <Text className="text-sm font-medium">
                        {reservation?.check_in_date &&
                          new Date(
                            reservation.check_in_date
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-gray-600">Check-out:</Text>
                      <Text className="text-sm font-medium">
                        {reservation?.check_out_date &&
                          new Date(
                            reservation.check_out_date
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-gray-600">
                        Total Amount:
                      </Text>
                      <Text className="text-sm font-medium">
                        {displayAmounts.currency}{" "}
                        {displayAmounts.totalAmount.toLocaleString()}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-gray-600">
                        Paid Amount:
                      </Text>
                      <Text className="text-sm font-medium">
                        {displayAmounts.currency}{" "}
                        {displayAmounts.paidAmount.toLocaleString()}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center pt-2 border-t border-gray-200">
                      <Text className="text-sm font-semibold">
                        Balance Amount:
                      </Text>
                      <Text className="text-sm font-semibold text-red-600">
                        {displayAmounts.currency}{" "}
                        {displayAmounts.balanceAmount.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Payment Form */}
                <View className="border border-gray-200 rounded-lg p-3">
                  <Text className="text-base font-semibold mb-3">
                    Payment Information
                  </Text>
                  <View className="space-y-4">
                    {/* Payment Type */}
                    <View>
                      <Text className="text-sm font-medium text-gray-700 mb-2">
                        Payment Type
                      </Text>
                      <View className="border border-gray-300 rounded-lg">
                        <Picker
                          selectedValue={formData.payment_type}
                          onValueChange={(value) =>
                            setFormData({ ...formData, payment_type: value })
                          }
                        >
                          <Picker.Item
                            label="Room Payment"
                            value="room_payment"
                          />
                          <Picker.Item
                            label="Advance Payment"
                            value="advance_payment"
                          />
                          <Picker.Item
                            label="Partial Payment"
                            value="partial_payment"
                          />
                          <Picker.Item
                            label="Full Payment"
                            value="full_payment"
                          />
                        </Picker>
                      </View>
                    </View>

                    {/* Payment Method */}
                    <View>
                      <Text className="text-sm font-medium text-gray-700 mb-2">
                        Payment Method *
                      </Text>
                      <View className="border border-gray-300 rounded-lg">
                        <Picker
                          selectedValue={formData.payment_method || undefined}
                          onValueChange={(value) =>
                            setFormData({ ...formData, payment_method: value })
                          }
                        >
                          <Picker.Item label="Select payment method" value="" />
                          <Picker.Item label="Cash" value="cash" />
                          <Picker.Item label="Credit/Debit Card" value="card" />
                          <Picker.Item
                            label="Bank Transfer"
                            value="bank_transfer"
                          />
                          <Picker.Item
                            label="Mobile Payment"
                            value="mobile_payment"
                          />
                          <Picker.Item label="Cheque" value="cheque" />
                        </Picker>
                      </View>
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
                          onValueChange={handleCurrencyChange}
                        >
                          <Picker.Item
                            label="LKR - Sri Lankan Rupee"
                            value="LKR"
                          />
                          <Picker.Item label="USD - US Dollar" value="USD" />
                          <Picker.Item label="EUR - Euro" value="EUR" />
                          <Picker.Item
                            label="GBP - British Pound"
                            value="GBP"
                          />
                        </Picker>
                      </View>
                    </View>

                    {/* Account */}
                    <View>
                      <Text className="text-sm font-medium text-gray-700 mb-2">
                        Account *
                      </Text>
                      <View className="border border-gray-300 rounded-lg">
                        <Picker
                          selectedValue={formData.account_id || undefined}
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

                    {/* Reference Number */}
                    <View>
                      <Text className="text-sm font-medium text-gray-700 mb-2">
                        Reference Number (Optional)
                      </Text>
                      <TextInput
                        value={formData.reference_number}
                        onChangeText={(text) =>
                          setFormData({
                            ...formData,
                            reference_number: text,
                          })
                        }
                        placeholder="Transaction ID, Cheque number, etc."
                        className="border border-gray-300 rounded-lg px-3 py-3 text-base"
                      />
                    </View>

                    {/* Notes */}
                    <View>
                      <Text className="text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </Text>
                      <TextInput
                        value={formData.notes}
                        onChangeText={(text) =>
                          setFormData({ ...formData, notes: text })
                        }
                        placeholder="Any additional notes about this payment"
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        className="border border-gray-300 rounded-lg px-3 py-3 text-base"
                      />
                    </View>

                    {/* Mark as Complete */}
                    <View className="pt-4 border-t border-gray-200">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1 mr-3">
                          <Text className="text-sm font-medium mb-1">
                            Mark reservation as completed (check out)
                          </Text>
                          <Text className="text-xs text-gray-600">
                            Check this if the guest is checking out and the
                            reservation should be marked as completed
                          </Text>
                        </View>
                        <Switch
                          value={formData.markAsComplete}
                          onValueChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              markAsComplete: checked,
                            }))
                          }
                          trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
                          thumbColor={
                            formData.markAsComplete ? "#ffffff" : "#f3f4f6"
                          }
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Submit Buttons */}
          <View className="flex-row gap-3 justify-end px-4 py-3 border-t border-gray-200">
            <TouchableOpacity
              onPress={handleClose}
              className="flex-1 bg-gray-600 py-3 rounded-lg"
              disabled={submitting}
            >
              <Text className="text-white text-center font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={
                submitting || !formData.payment_method || !formData.account_id
              }
              className={`flex-1 bg-blue-600 py-3 rounded-lg ${
                submitting || !formData.payment_method || !formData.account_id
                  ? "opacity-50"
                  : ""
              }`}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Ionicons name="save-outline" size={16} color="white" />
                <Text className="text-white font-semibold">
                  {submitting ? "Recording..." : "Record Payment"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
