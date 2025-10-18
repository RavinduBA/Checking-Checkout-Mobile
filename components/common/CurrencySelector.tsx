import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Linking,
  Modal,
  ScrollView,
  Text,
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
  updated_at: string;
  created_at: string;
}

interface CurrencySelectorProps {
  currency: string;
  onCurrencyChange: (currency: string) => void;
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
  const [currencies, setCurrencies] = useState<CurrencyRate[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useUserProfile();
  const { selectedLocation } = useLocationContext();

  // Load currencies from database
  useEffect(() => {
    const loadCurrencies = async () => {
      if (!profile?.tenant_id || !selectedLocation) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("currency_rates")
          .select("*")
          .eq("tenant_id", profile.tenant_id)
          .eq("location_id", selectedLocation)
          .order("currency_code", { ascending: true });

        if (error) {
          console.error("Error loading currencies:", error);
        } else {
          setCurrencies(data || []);
        }
      } catch (error) {
        console.error("Error loading currencies:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCurrencies();
  }, [profile?.tenant_id, selectedLocation]);

  const selectedCurrencyRate = currencies.find(
    (c) => c.currency_code === currency
  );

  const handleGoogleSearchClick = () => {
    if (currency && currency !== "USD") {
      const searchUrl = `https://www.google.com/search?q=usd+to+${currency.toLowerCase()}`;
      Linking.openURL(searchUrl).catch(() => {
        console.log("Could not open URL:", searchUrl);
      });
    }
  };

  const selectCurrency = (currencyCode: string) => {
    onCurrencyChange(currencyCode);
    setModalVisible(false);
  };

  return (
    <View className="flex-row items-center gap-2">
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 flex-row items-center justify-between"
        disabled={loading}
      >
        <View className="flex-row items-center gap-2">
          <Text className="font-medium text-gray-900">
            {selectedCurrencyRate
              ? selectedCurrencyRate.currency_code
              : currency}
          </Text>
          <Text className="text-sm text-gray-500">
            {selectedCurrencyRate
              ? selectedCurrencyRate.currency_code === "USD"
                ? "US Dollar"
                : selectedCurrencyRate.is_custom
                ? "Custom Currency"
                : selectedCurrencyRate.currency_code
              : loading
              ? "Loading..."
              : currency}
          </Text>
          {selectedCurrencyRate &&
            selectedCurrencyRate.currency_code !== "USD" && (
              <Text className="text-xs text-gray-500">
                (Rate: {selectedCurrencyRate.usd_rate})
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
            {loading ? (
              <View className="p-8 items-center">
                <Text className="text-gray-500">Loading currencies...</Text>
              </View>
            ) : currencies.length === 0 ? (
              <View className="p-8 items-center">
                <Text className="text-gray-500">No currencies available</Text>
              </View>
            ) : (
              currencies.map((curr) => (
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
                          : curr.currency_code}
                      </Text>
                      {curr.currency_code !== "USD" && (
                        <Text className="text-sm text-gray-500">
                          Rate: {curr.usd_rate}
                        </Text>
                      )}
                    </View>
                  </View>
                  {currency === curr.currency_code && (
                    <Ionicons name="checkmark" size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};
