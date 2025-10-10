import React from "react";
import { FlatList, Text, View, RefreshControl } from "react-native";
import { AccountCard } from "./AccountCard";

interface Account {
  id: string;
  name: string;
  currency: "LKR" | "USD" | "EUR" | "GBP";
  current_balance: number;
  initial_balance: number;
  location_access: string[];
  tenant_id: string;
  created_at: string;
}

type AccountWithBalance = Account & { currentBalance: number };

interface AccountGridProps {
  accounts: AccountWithBalance[];
  onEdit: (account: Account) => void;
  onDelete: (accountId: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function AccountGrid({ accounts, onEdit, onDelete, onRefresh, refreshing }: AccountGridProps) {
  if (accounts.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
          <Text className="text-3xl">💰</Text>
        </View>
        <Text className="text-gray-500 text-center text-lg font-medium mb-2">
          No accounts yet
        </Text>
        <Text className="text-gray-400 text-center text-sm max-w-xs">
          Create your first account to start managing your finances
        </Text>
      </View>
    );
  }

  const renderAccount = ({ item }: { item: AccountWithBalance }) => (
    <AccountCard
      account={item}
      balance={item.currentBalance}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );

  return (
    <FlatList
      data={accounts}
      renderItem={renderAccount}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing || false}
            onRefresh={onRefresh}
            colors={["#3b82f6"]} // Android
            tintColor="#3b82f6" // iOS
          />
        ) : undefined
      }
    />
  );
}
