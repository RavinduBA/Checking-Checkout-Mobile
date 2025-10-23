import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Account } from "../../hooks/useExpenseData";
import { CurrencyType, getCurrencySymbol } from "../../lib/currencies";

interface ExpenseFormData {
  mainCategory: string;
  subCategory: string;
  amount: string;
  accountId: string;
  date: string;
  note: string;
  currency: CurrencyType;
}

interface ExpenseDetailsProps {
  formData: ExpenseFormData;
  accounts: Account[];
  selectedLocation: string | null;
  onFormDataChange: (data: Partial<ExpenseFormData>) => void;
  showAccountDropdown: boolean;
  showCurrencyDropdown: boolean;
  setShowAccountDropdown: (show: boolean) => void;
  setShowCurrencyDropdown: (show: boolean) => void;
}

export function ExpenseDetails({
  formData,
  accounts,
  selectedLocation,
  onFormDataChange,
  showAccountDropdown,
  showCurrencyDropdown,
  setShowAccountDropdown,
  setShowCurrencyDropdown,
}: ExpenseDetailsProps) {
  const currencySymbol = getCurrencySymbol(formData.currency);
  const selectedAccount = accounts.find((acc) => acc.id === formData.accountId);

  // Filter accounts based on location access
  const availableAccounts = accounts.filter((account) => {
    // If account has no location restrictions, it's available for all locations
    if (!account.location_access || account.location_access.length === 0) {
      return true;
    }
    // If account has location restrictions, check if current location is included
    return (
      selectedLocation && account.location_access.includes(selectedLocation)
    );
  });

  return (
    <View className="gap-4">
      {/* Amount and Currency Row */}
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Text className="text-xs font-bold text-gray-500 uppercase mb-2">
            Amount *
          </Text>
          <View className="relative">
            <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-rose-50 rounded-lg px-2 py-1">
              <Text className="text-sm font-bold text-rose-600">
                {currencySymbol}
              </Text>
            </View>
            <TextInput
              value={formData.amount}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9.]/g, "");
                onFormDataChange({ amount: cleaned });
              }}
              placeholder="0.00"
              keyboardType="decimal-pad"
              className="bg-gray-50 border border-gray-200 rounded-xl pl-14 pr-4 py-3.5 text-gray-900 font-semibold text-base"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View className="w-28">
          <Text className="text-xs font-bold text-gray-500 uppercase mb-2">
            Currency *
          </Text>
          <View>
            <TouchableOpacity
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3.5 flex-row items-center justify-between"
              onPress={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
            >
              <Text className="text-gray-900 font-bold">
                {formData.currency}
              </Text>
              <Ionicons
                name={showCurrencyDropdown ? "chevron-up" : "chevron-down"}
                size={16}
                color="#9ca3af"
              />
            </TouchableOpacity>

            {showCurrencyDropdown && (
              <View className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10">
                {(["LKR", "USD"] as CurrencyType[]).map((currency, index) => (
                  <TouchableOpacity
                    key={currency}
                    className={`px-3 py-3 ${
                      index === 0 ? "border-b border-gray-100" : ""
                    }`}
                    onPress={() => {
                      onFormDataChange({ currency });
                      setShowCurrencyDropdown(false);
                    }}
                  >
                    <Text className="font-bold text-gray-900 mb-0.5">
                      {currency}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {currency === "LKR" ? "Sri Lankan Rupee" : "US Dollar"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Account Selection */}
      <View>
        <Text className="text-xs font-bold text-gray-500 uppercase mb-2">
          Account *
        </Text>
        <View>
          <TouchableOpacity
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
            onPress={() => setShowAccountDropdown(!showAccountDropdown)}
          >
            <View className="flex-row items-center gap-2 flex-1">
              <Ionicons 
                name="wallet-outline" 
                size={18} 
                color={selectedAccount ? "#ef4444" : "#9ca3af"} 
              />
              {selectedAccount ? (
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900" numberOfLines={1}>
                    {selectedAccount.name}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {getCurrencySymbol(selectedAccount.currency)}
                    {selectedAccount.current_balance.toLocaleString()}
                  </Text>
                </View>
              ) : (
                <Text className="text-gray-400">Choose account</Text>
              )}
            </View>
            <Ionicons
              name={showAccountDropdown ? "chevron-up" : "chevron-down"}
              size={18}
              color="#9ca3af"
            />
          </TouchableOpacity>

          {showAccountDropdown && (
            <View className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {availableAccounts.map((account, index) => (
                <TouchableOpacity
                  key={account.id}
                  className={`px-4 py-3 flex-row items-center gap-3 ${
                    index < availableAccounts.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                  onPress={() => {
                    onFormDataChange({ accountId: account.id });
                    setShowAccountDropdown(false);
                  }}
                >
                  <View className="bg-blue-50 rounded-lg p-2">
                    <Ionicons name="wallet" size={16} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900" numberOfLines={1}>
                      {account.name}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {getCurrencySymbol(account.currency)}
                      {account.current_balance.toLocaleString()}
                    </Text>
                  </View>
                  <View className="bg-blue-500 px-2 py-1 rounded-full">
                    <Text className="text-[10px] font-bold text-white">
                      {account.currency}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Date Field */}
      <View>
        <Text className="text-xs font-bold text-gray-500 uppercase mb-2">
          Date *
        </Text>
        <View className="relative">
          <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <Ionicons name="calendar" size={18} color="#ef4444" />
          </View>
          <TextInput
            value={formData.date}
            onChangeText={(text) => onFormDataChange({ date: text })}
            placeholder="YYYY-MM-DD"
            className="bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-gray-900 font-semibold"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {/* Notes Field */}
      <View>
        <Text className="text-xs font-bold text-gray-500 uppercase mb-2">
          Notes (Optional)
        </Text>
        <View className="relative">
          <View className="absolute left-3 top-3 z-10">
            <Ionicons name="document-text" size={18} color="#9ca3af" />
          </View>
          <TextInput
            value={formData.note}
            onChangeText={(text) => onFormDataChange({ note: text })}
            placeholder="Add any notes about this expense..."
            multiline
            numberOfLines={3}
            className="bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-gray-900"
            textAlignVertical="top"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>
    </View>
  );
}
