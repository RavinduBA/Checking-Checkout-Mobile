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
    <View className="space-y-4">
      {/* Amount and Currency Row */}
      <View className="flex-row gap-4 mb-6">
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Amount *
          </Text>
          <View className="relative">
            <Text className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 z-10">
              {currencySymbol}
            </Text>
            <TextInput
              value={formData.amount}
              onChangeText={(text) => {
                // Only allow numbers and decimal point
                const cleaned = text.replace(/[^0-9.]/g, "");
                onFormDataChange({ amount: cleaned });
              }}
              placeholder="0.00"
              keyboardType="decimal-pad"
              className="bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-800"
            />
          </View>
        </View>

        <View className="w-32">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Currency *
          </Text>
          <View>
            <TouchableOpacity
              className="bg-white border border-gray-200 rounded-lg px-3 py-3 flex-row items-center justify-between"
              onPress={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
            >
              <Text className="text-gray-800 font-medium">
                {formData.currency}
              </Text>
              <Ionicons
                name={showCurrencyDropdown ? "chevron-up" : "chevron-down"}
                size={16}
                color="#6B7280"
              />
            </TouchableOpacity>

            {showCurrencyDropdown && (
              <View className="absolute top-full left-0 right-0 bg-white border border-gray-200 border-t-0 rounded-b-lg shadow-sm z-10">
                {(["LKR", "USD"] as CurrencyType[]).map((currency) => (
                  <TouchableOpacity
                    key={currency}
                    className="px-3 py-3 border-b border-gray-100 last:border-b-0"
                    onPress={() => {
                      onFormDataChange({ currency });
                      setShowCurrencyDropdown(false);
                    }}
                  >
                    <Text className="font-medium text-gray-800">
                      {currency} -{" "}
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
      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Account *
        </Text>
        <View>
          <TouchableOpacity
            className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex-row items-center justify-between"
            onPress={() => setShowAccountDropdown(!showAccountDropdown)}
          >
            <View className="flex-1">
              {selectedAccount ? (
                <>
                  <Text className="font-medium text-gray-800">
                    {selectedAccount.name}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Balance: {getCurrencySymbol(selectedAccount.currency)}
                    {selectedAccount.current_balance.toLocaleString()}
                  </Text>
                </>
              ) : (
                <Text className="text-gray-500">Select account</Text>
              )}
            </View>
            <View className="flex-row items-center">
              {selectedAccount && (
                <View className="px-2 py-1 bg-gray-100 rounded mr-2">
                  <Text className="text-xs text-gray-600">
                    {selectedAccount.currency}
                  </Text>
                </View>
              )}
              <Ionicons
                name={showAccountDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color="#6B7280"
              />
            </View>
          </TouchableOpacity>

          {showAccountDropdown && (
            <View className="bg-white border border-gray-200 border-t-0 rounded-b-lg shadow-sm">
              {availableAccounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                  onPress={() => {
                    onFormDataChange({ accountId: account.id });
                    setShowAccountDropdown(false);
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="font-medium text-gray-800">
                        {account.name}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        Balance: {getCurrencySymbol(account.currency)}
                        {account.current_balance.toLocaleString()}
                      </Text>
                    </View>
                    <View className="px-2 py-1 bg-gray-100 rounded">
                      <Text className="text-xs text-gray-600">
                        {account.currency}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Date Field */}
      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 mb-2">Date *</Text>
        <View className="relative">
          <Ionicons
            name="calendar-outline"
            size={16}
            color="#6B7280"
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
          />
          <TextInput
            value={formData.date}
            onChangeText={(text) => onFormDataChange({ date: text })}
            placeholder="YYYY-MM-DD"
            className="bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-800"
          />
        </View>
      </View>

      {/* Notes Field */}
      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Notes (Optional)
        </Text>
        <TextInput
          value={formData.note}
          onChangeText={(text) => onFormDataChange({ note: text })}
          placeholder="Add any notes about this expense"
          multiline
          numberOfLines={3}
          className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
          textAlignVertical="top"
        />
      </View>
    </View>
  );
}
