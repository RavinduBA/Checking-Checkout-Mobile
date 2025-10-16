import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Database } from "../../integrations/supabase/types";
import { useLocationContext } from "../../hooks/useLocationContext";
import { useTenant } from "../../hooks/useTenant";

type CurrencyType = Database["public"]["Enums"]["currency_type"];

interface CurrencyRate {
  currency_code: string;
  usd_rate: number;
  is_custom: boolean;
}

interface CurrencySelectorProps {
  currency: CurrencyType;
  onCurrencyChange: (currency: CurrencyType) => void;
  label?: string;
  showGoogleSearchLink?: boolean;
}

export const CurrencySelector = ({
  currency,
  onCurrencyChange,
  label = "Currency",
  showGoogleSearchLink = false,
}: CurrencySelectorProps) => {
  const [currencies, setCurrencies] = useState<CurrencyRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const { tenant } = useTenant();
  const { selectedLocation } = useLocationContext();

  useEffect(() => {
    const loadCurrencies = async () => {
      if (!tenant?.id || !selectedLocation) {
        // Default currencies for mobile
        setCurrencies([
          { currency_code: "USD", usd_rate: 1, is_custom: false },
          { currency_code: "LKR", usd_rate: 300, is_custom: false },
          { currency_code: "EUR", usd_rate: 0.85, is_custom: false },
          { currency_code: "GBP", usd_rate: 0.75, is_custom: false },
        ]);
        setLoading(false);
        return;
      }

      try {
        // For now, use default currencies. In future, implement getCurrencyDetails for mobile
        setCurrencies([
          { currency_code: "USD", usd_rate: 1, is_custom: false },
          { currency_code: "LKR", usd_rate: 300, is_custom: false },
          { currency_code: "EUR", usd_rate: 0.85, is_custom: false },
          { currency_code: "GBP", usd_rate: 0.75, is_custom: false },
        ]);
      } catch (error) {
        console.error("Error loading currencies:", error);
        // Fallback to default currencies
        setCurrencies([
          { currency_code: "USD", usd_rate: 1, is_custom: false },
          { currency_code: "LKR", usd_rate: 300, is_custom: false },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadCurrencies();
  }, [tenant?.id, selectedLocation]);

  const selectedCurrency = currencies.find((c) => c.currency_code === currency);

  const handleGoogleSearchClick = () => {
    // TODO: Implement mobile browser opening for currency conversion
    console.log("Opening currency conversion search for:", currency);
  };

  const selectCurrency = (currencyCode: string) => {
    onCurrencyChange(currencyCode as CurrencyType);
    setModalVisible(false);
  };

  if (loading) {
    return (
      <View className="flex-row items-center justify-center py-2">
        <ActivityIndicator size="small" color="#6B7280" />
        <Text className="ml-2 text-sm text-gray-600">
          Loading currencies...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-2">
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 flex-row items-center justify-between"
      >
        <View className="flex-row items-center gap-2">
          <Text className="font-medium text-gray-900">
            {selectedCurrency?.currency_code || currency}
          </Text>
          {selectedCurrency && selectedCurrency.currency_code !== "USD" && (
            <Text className="text-xs text-gray-500">
              (Rate: {selectedCurrency.usd_rate})
            </Text>
          )}
        </View>
        <Ionicons name="chevron-down" size={16} color="#6B7280" />
      </TouchableOpacity>

      {showGoogleSearchLink && currency && currency !== "USD" && (
        <TouchableOpacity
          onPress={handleGoogleSearchClick}
          className="bg-gray-100 border border-gray-300 rounded-lg p-2"
        >
          <Ionicons name="open-outline" size={16} color="#6B7280" />
        </TouchableOpacity>
      )}

      {/* Currency Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-white">
          {/* Header */}
          <View className="bg-gray-50 px-4 py-3 pt-12 flex-row items-center justify-between border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">
              Select Currency
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Currency List */}
          <ScrollView className="flex-1">
            {currencies.map((curr) => (
              <TouchableOpacity
                key={curr.currency_code}
                onPress={() => selectCurrency(curr.currency_code)}
                className={`px-4 py-4 border-b border-gray-100 flex-row items-center justify-between ${
                  currency === curr.currency_code ? "bg-blue-50" : ""
                }`}
              >
                <View className="flex-1">
                  <View className="flex-row items-center gap-3">
                    <Text className="font-medium text-gray-900 min-w-[48px]">
                      {curr.currency_code}
                    </Text>
                    <Text className="text-gray-600 flex-1">
                      {curr.currency_code === "USD"
                        ? "US Dollar"
                        : curr.is_custom
                        ? "Custom Currency"
                        : curr.currency_code === "LKR"
                        ? "Sri Lankan Rupee"
                        : curr.currency_code === "EUR"
                        ? "Euro"
                        : curr.currency_code === "GBP"
                        ? "British Pound"
                        : curr.currency_code}
                    </Text>
                  </View>
                  {curr.currency_code !== "USD" && (
                    <Text className="text-xs text-gray-500 ml-[51px]">
                      Exchange Rate: 1 USD = {curr.usd_rate}{" "}
                      {curr.currency_code}
                    </Text>
                  )}
                </View>
                {currency === curr.currency_code && (
                  <Ionicons name="checkmark" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};
