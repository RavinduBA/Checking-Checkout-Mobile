import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { getCurrencySymbol } from "../../lib/currencies";
import { useAccountOperations } from "../../hooks/useAccountOperations";
import { Account } from "../../lib/types";

interface AccountCardProps {
  account: Account;
  balance: number;
  onEdit: (account: Account) => void;
  onDelete: (accountId: string) => void;
}

export function AccountCard({
  account,
  balance,
  onEdit,
  onDelete,
}: AccountCardProps) {
  const { deleteAccount } = useAccountOperations();

  const handleDelete = async () => {
    const deleted = await deleteAccount(account.id, account.name);
    if (deleted) {
      onDelete(account.id);
    }
  };

  return (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold text-gray-800 flex-1">
          {account.name}
        </Text>
        <View className="bg-blue-100 px-3 py-1 rounded-full">
          <Text className="text-blue-600 text-xs font-medium">
            {account.currency}
          </Text>
        </View>
      </View>

      {/* Balance */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-sm text-gray-500">Current Balance</Text>
        <Text className="text-xl font-bold text-gray-800">
          {getCurrencySymbol(account.currency)}
          {balance.toLocaleString()}
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => onEdit(account)}
          className="flex-1 bg-gray-100 rounded-lg py-3 flex-row justify-center items-center"
        >
          <Ionicons name="pencil-outline" size={16} color="#6B7280" />
          <Text className="text-gray-600 font-medium ml-2">Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDelete}
          className="flex-1 bg-red-50 rounded-lg py-3 flex-row justify-center items-center"
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
          <Text className="text-red-500 font-medium ml-2">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
