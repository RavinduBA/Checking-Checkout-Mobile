import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Text, View } from "react-native";

type Account = {
  id: string;
  name: string;
  currency: string;
};

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccountId: string;
  onAccountChange: (accountId: string) => void;
  required?: boolean;
}

export function AccountSelector({
  accounts,
  selectedAccountId,
  onAccountChange,
  required = false,
}: AccountSelectorProps) {
  return (
    <View>
      <Text className="text-sm font-medium text-gray-700 mb-2">
        Account {required && "*"}
      </Text>
      <View className="border border-gray-300 rounded-lg">
        <Picker
          selectedValue={selectedAccountId || ""}
          onValueChange={onAccountChange}
        >
          <Picker.Item label="Select account" value="" />
          {accounts &&
            accounts.map((account) => (
              <Picker.Item
                key={account.id}
                label={`${account.name} (${account.currency})`}
                value={account.id}
              />
            ))}
        </Picker>
      </View>
      <Text className="text-sm text-gray-600 mt-1">
        The payment will be recorded in this account
      </Text>
    </View>
  );
}
