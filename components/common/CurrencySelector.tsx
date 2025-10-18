import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CurrencyType, SUPPORTED_CURRENCIES } from "../../lib/currencies";

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
  const [modalVisible, setModalVisible] = useState(false);

  const selectedCurrencyOption = SUPPORTED_CURRENCIES.find((c) => c.value === currency);

  const handleGoogleSearchClick = () => {
    if (currency && currency !== "USD") {
      const searchUrl = `https://www.google.com/search?q=usd+to+${currency.toLowerCase()}`;
      // In React Native, you could use Linking.openURL(searchUrl) to open the browser
      console.log("Opening currency conversion search URL:", searchUrl);
    }
  };

  const selectCurrency = (currencyCode: CurrencyType) => {
    onCurrencyChange(currencyCode);
    setModalVisible(false);
  };

  return (
    <View className="flex-row items-center gap-2">
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 flex-row items-center justify-between"
      >
        <View className="flex-row items-center gap-2">
          <Text className="font-medium text-gray-900">
            {selectedCurrencyOption?.value || currency}
          </Text>
          <Text className="text-sm text-gray-500">
            {selectedCurrencyOption?.label || currency}
          </Text>
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
            {SUPPORTED_CURRENCIES.map((curr) => (
              <TouchableOpacity
                key={curr.value}
                onPress={() => selectCurrency(curr.value)}
                className={`px-4 py-4 border-b border-gray-100 flex-row items-center justify-between ${
                  currency === curr.value ? "bg-blue-50" : ""
                }`}
              >
                <View className="flex-1">
                  <View className="flex-row items-center gap-3">
                    <Text className="font-medium text-gray-900 min-w-[48px]">
                      {curr.value}
                    </Text>
                    <Text className="text-gray-600 flex-1">
                      {curr.label}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {curr.symbol}
                    </Text>
                  </View>
                </View>
                {currency === curr.value && (
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
