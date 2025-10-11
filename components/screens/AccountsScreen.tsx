import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useAccounts } from "../../hooks/useAccounts";
import { useLocations } from "../../hooks/useLocations";
import { useTenant } from "../../hooks/useTenant";
import { Account } from "../../lib/types";
import {
  AccountForm,
  AccountGrid,
  AccountsSkeleton,
  AccountSummaryCards,
  AccountTransferForm,
  RecentTransactions,
} from "../accounts";

type TabType = "accounts" | "transactions";

export default function AccountsScreen() {
  const { tenant } = useTenant();
  const { accounts, loading, error, refreshAccounts } = useAccounts();
  const { locations } = useLocations();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("accounts");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshAccounts();
    setRefreshing(false);
  };

  const handleAccountSaved = () => {
    refreshAccounts();
    setShowAddDialog(false);
    setEditingAccount(null);
    Alert.alert("Success", "Account saved successfully");
  };

  const handleAccountDeleted = (accountId: string) => {
    // Refresh the accounts list after successful deletion
    refreshAccounts();
  };

  const handleTransferCompleted = () => {
    refreshAccounts();
    setShowTransferDialog(false);
    Alert.alert("Success", "Transfer completed successfully");
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setShowAddDialog(true);
  };

  const handleAddAccount = () => {
    setEditingAccount(null);
    setShowAddDialog(true);
  };

  if (loading) {
    return <AccountsSkeleton />;
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-6 py-4">
          <Text className="text-2xl font-bold text-gray-800">Accounts</Text>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="text-red-500 text-center text-lg font-medium mt-4">
            Error Loading Accounts
          </Text>
          <Text className="text-gray-500 text-center mt-2">{error}</Text>
          <TouchableOpacity
            onPress={refreshAccounts}
            className="bg-blue-500 px-6 py-3 rounded-lg mt-6"
          >
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 py-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-gray-800">Accounts</Text>

          {/* Header Actions */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setShowTransferDialog(true)}
              disabled={accounts.length < 2}
              className={`px-3 py-2 rounded-lg border ${
                accounts.length < 2
                  ? "border-gray-200 bg-gray-100"
                  : "border-blue-500 bg-blue-50"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  accounts.length < 2 ? "text-gray-400" : "text-blue-600"
                }`}
              >
                Transfer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAddAccount}
              className="bg-blue-500 px-3 py-2 rounded-lg flex-row items-center"
            >
              <Ionicons name="add" size={16} color="white" />
              <Text className="text-white font-medium ml-1">Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content Container */}
      <View className="flex-1">
        {/* Fixed Header Content */}
        <View className="px-6 py-6">
          {/* Summary Cards */}
          <AccountSummaryCards accounts={accounts} />

          {/* Tab Navigation */}
          <View className="flex-row bg-white rounded-lg p-1 mb-6 shadow-sm border border-gray-100">
            <TouchableOpacity
              onPress={() => setActiveTab("accounts")}
              className={`flex-1 py-3 rounded-md ${
                activeTab === "accounts" ? "bg-blue-500" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  activeTab === "accounts" ? "text-white" : "text-gray-600"
                }`}
              >
                Accounts
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("transactions")}
              className={`flex-1 py-3 rounded-md ${
                activeTab === "transactions" ? "bg-blue-500" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  activeTab === "transactions" ? "text-white" : "text-gray-600"
                }`}
              >
                Transactions
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Content */}
        <View className="flex-1 px-6">
          {activeTab === "accounts" ? (
            <AccountGrid
              accounts={accounts}
              onEdit={handleEditAccount}
              onDelete={handleAccountDeleted}
              onRefresh={handleRefresh}
              refreshing={refreshing}
            />
          ) : (
            <RecentTransactions
              accounts={accounts}
              onRefresh={handleRefresh}
              refreshing={refreshing}
            />
          )}
        </View>
      </View>

      {/* Account Form Modal */}
      <AccountForm
        visible={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setEditingAccount(null);
        }}
        account={editingAccount}
        locations={locations}
        onSaved={handleAccountSaved}
        tenantId={tenant?.id || ""}
      />

      {/* Transfer Form Modal */}
      <AccountTransferForm
        visible={showTransferDialog}
        onClose={() => setShowTransferDialog(false)}
        accounts={accounts.map(({ currentBalance, ...account }) => account)}
        onTransferCompleted={handleTransferCompleted}
      />
    </View>
  );
}
