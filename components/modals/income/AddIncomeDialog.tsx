import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../../hooks/useAuth";
import { useTenant } from "../../../hooks/useTenant";
import { useLocationContext } from "../../../contexts/LocationContext";
import { supabase } from "../../../lib/supabase";
import { AddToBillForm } from "./AddToBillForm";
import { ImmediatePaymentForm } from "./ImmediatePaymentForm";
import type { Database } from "../../../integrations/supabase/types";

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
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { selectedLocation } = useLocationContext();

  const [incomeTypes, setIncomeTypes] = useState<IncomeType[]>([]);
  const [isAddToBill, setIsAddToBill] = useState(false);
  const [loading, setLoading] = useState(false);

  // Store the base amount and currency for conversion reference
  const [baseAmount, setBaseAmount] = useState<number>(0);
  const [baseCurrency, setBaseCurrency] = useState<string>("LKR");
  const [displayedReservationAmount, setDisplayedReservationAmount] =
    useState<number>(0);

  // Fetch income types
  useEffect(() => {
    const fetchIncomeTypes = async () => {
      if (!tenant?.id || !visible) return;

      try {
        console.log("Fetching income types for tenant:", tenant.id);
        const { data, error } = await supabase
          .from("income_types")
          .select("*")
          .eq("tenant_id", tenant.id)
          .order("type_name", { ascending: true });

        if (error) throw error;
        console.log("Fetched income types:", data);
        setIncomeTypes(data || []);
      } catch (error) {
        console.error("Error fetching income types:", error);
      }
    };

    fetchIncomeTypes();
  }, [tenant?.id, visible]);

  useEffect(() => {
    if (selectedReservation) {
      const reservationCurrency = selectedReservation.currency || "LKR";
      const reservationAmount = selectedReservation.total_amount || 0;

      // Set the base amount and currency from the reservation
      setBaseAmount(reservationAmount);
      setBaseCurrency(reservationCurrency);
      setDisplayedReservationAmount(reservationAmount);
    }
  }, [selectedReservation]);

  const handleClose = () => {
    onClose();
    setIsAddToBill(false);
  };

  const handleSuccess = () => {
    onSuccess();
    handleClose();
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
              Record income for reservation{" "}
              {selectedReservation.reservation_number}
            </Text>
          </View>

          <ScrollView
            className="px-4 py-4"
            showsVerticalScrollIndicator={false}
          >
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

              {/* Render appropriate form based on toggle */}
              {isAddToBill ? (
                <AddToBillForm
                  reservation={selectedReservation}
                  incomeTypes={incomeTypes}
                  onSuccess={handleSuccess}
                  onCancel={handleClose}
                  profileId={user?.id || ""}
                  tenantId={tenant.id}
                  locationId={selectedLocation}
                  baseAmount={baseAmount}
                  baseCurrency={baseCurrency}
                  displayedReservationAmount={displayedReservationAmount}
                  onDisplayedReservationAmountChange={
                    setDisplayedReservationAmount
                  }
                />
              ) : (
                <ImmediatePaymentForm
                  reservation={selectedReservation}
                  accounts={accounts}
                  incomeTypes={incomeTypes}
                  onSuccess={handleSuccess}
                  onCancel={handleClose}
                  profileId={user?.id || ""}
                  tenantId={tenant.id}
                  locationId={selectedLocation}
                  baseAmount={baseAmount}
                  baseCurrency={baseCurrency}
                  displayedReservationAmount={displayedReservationAmount}
                  onDisplayedReservationAmountChange={
                    setDisplayedReservationAmount
                  }
                />
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
