import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: string;
  status: "active" | "inactive";
  lastTransaction: string;
  totalIncome: string;
  totalExpenses: string;
  transactionCount: number;
}

interface Transaction {
  id: string;
  date: string;
  type: "income" | "expense" | "transfer_in" | "transfer_out";
  description: string;
  amount: string;
  accountName: string;
  currency: string;
  note?: string;
}

interface AccountCardProps extends Account {
  onPress: () => void;
}

const AccountCard: React.FC<AccountCardProps> = ({
  name,
  type,
  balance,
  status,
  lastTransaction,
  totalIncome,
  totalExpenses,
  transactionCount,
  onPress,
}) => {
  const isPositive = !balance.startsWith("-");

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-lg p-4 border border-gray-200 mb-3"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 mb-1">
            {name}
          </Text>
          <Text className="text-xs text-gray-600">{type}</Text>
        </View>
        <View
          className={`px-2 py-1 rounded-md ${
            status === "active" ? "bg-green-100" : "bg-gray-100"
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              status === "active" ? "text-green-600" : "text-gray-600"
            }`}
          >
            {status}
          </Text>
        </View>
      </View>

      <View className="border-t border-gray-200 pt-3 mt-2">
        <View className="flex-row justify-between items-center mb-3">
          <View>
            <Text className="text-xs text-gray-600 mb-1">Current Balance</Text>
            <Text
              className={`text-xl font-bold ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {balance}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-gray-600 mb-1">Transactions</Text>
            <Text className="text-sm font-semibold text-gray-900">
              {transactionCount}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-xs text-gray-600">Income</Text>
            <Text className="text-sm font-semibold text-green-600">
              {totalIncome}
            </Text>
          </View>
          <View className="flex-1 items-end">
            <Text className="text-xs text-gray-600">Expenses</Text>
            <Text className="text-sm font-semibold text-red-600">
              {totalExpenses}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-end gap-1 mt-3">
        <Text className="text-xs text-blue-500 font-medium">View Details</Text>
        <Ionicons name="chevron-forward" size={14} color="#3b82f6" />
      </View>
    </TouchableOpacity>
  );
};

interface TransactionCardProps extends Transaction {
  onPress: () => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  date,
  type,
  description,
  amount,
  accountName,
  currency,
  note,
  onPress,
}) => {
  const getTypeColor = () => {
    switch (type) {
      case "income":
        return "text-green-600";
      case "expense":
        return "text-red-600";
      case "transfer_in":
        return "text-blue-600";
      case "transfer_out":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case "income":
        return "arrow-down-circle";
      case "expense":
        return "arrow-up-circle";
      case "transfer_in":
        return "arrow-forward-circle";
      case "transfer_out":
        return "arrow-back-circle";
      default:
        return "cash";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-lg p-4 border border-gray-200 mb-3"
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-row items-start flex-1">
          <View
            className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
              type === "income"
                ? "bg-green-100"
                : type === "expense"
                ? "bg-red-100"
                : "bg-blue-100"
            }`}
          >
            <Ionicons
              name={getTypeIcon() as any}
              size={18}
              color={
                type === "income"
                  ? "#16a34a"
                  : type === "expense"
                  ? "#dc2626"
                  : "#3b82f6"
              }
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-gray-900 mb-1">
              {description}
            </Text>
            <Text className="text-xs text-gray-600">{accountName}</Text>
            <Text className="text-xs text-gray-500 mt-1">
              {new Date(date).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className={`text-lg font-bold ${getTypeColor()}`}>
            {type === "expense" || type === "transfer_out" ? "-" : "+"}
            {amount}
          </Text>
          <Text className="text-xs text-gray-500">{currency}</Text>
        </View>
      </View>
      {note && (
        <View className="mt-2 p-2 bg-gray-50 rounded">
          <Text className="text-xs text-gray-600">{note}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <View className="flex-1 bg-white rounded-lg p-3 border border-gray-200">
      <View
        className="w-8 h-8 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: `${color}20` }}
      >
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text className="text-xs text-gray-600 mb-1">{title}</Text>
      <Text className="text-lg font-bold text-gray-900">{value}</Text>
    </View>
  );
};

type TabType = "balances" | "transactions";

export default function AccountsReportsMobile() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("balances");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "active" | "inactive">(
    "all"
  );

  const accounts: Account[] = [
    {
      id: "1",
      name: "Main Operating Account",
      type: "Checking",
      balance: "$45,250.00",
      status: "active",
      lastTransaction: "2 hours ago",
      totalIncome: "$12,500.00",
      totalExpenses: "$8,200.00",
      transactionCount: 145,
    },
    {
      id: "2",
      name: "Payroll Account",
      type: "Checking",
      balance: "$12,500.00",
      status: "active",
      lastTransaction: "1 day ago",
      totalIncome: "$25,000.00",
      totalExpenses: "$12,500.00",
      transactionCount: 24,
    },
    {
      id: "3",
      name: "Savings Reserve",
      type: "Savings",
      balance: "$85,000.00",
      status: "active",
      lastTransaction: "5 days ago",
      totalIncome: "$50,000.00",
      totalExpenses: "$5,000.00",
      transactionCount: 12,
    },
    {
      id: "4",
      name: "Petty Cash",
      type: "Cash",
      balance: "$1,250.00",
      status: "active",
      lastTransaction: "3 hours ago",
      totalIncome: "$3,500.00",
      totalExpenses: "$2,250.00",
      transactionCount: 89,
    },
    {
      id: "5",
      name: "Old Operations Account",
      type: "Checking",
      balance: "$0.00",
      status: "inactive",
      lastTransaction: "45 days ago",
      totalIncome: "$0.00",
      totalExpenses: "$0.00",
      transactionCount: 0,
    },
  ];

  const transactions: Transaction[] = [
    {
      id: "1",
      date: "2025-10-31",
      type: "income",
      description: "Room Booking Payment",
      amount: "$450.00",
      accountName: "Main Operating Account",
      currency: "USD",
      note: "Reservation #1234",
    },
    {
      id: "2",
      date: "2025-10-31",
      type: "expense",
      description: "Office Supplies",
      amount: "$85.00",
      accountName: "Main Operating Account",
      currency: "USD",
    },
    {
      id: "3",
      date: "2025-10-30",
      type: "transfer_in",
      description: "Transfer from Savings",
      amount: "$2,000.00",
      accountName: "Main Operating Account",
      currency: "USD",
    },
    {
      id: "4",
      date: "2025-10-30",
      type: "income",
      description: "Guest Services",
      amount: "$120.00",
      accountName: "Petty Cash",
      currency: "USD",
    },
    {
      id: "5",
      date: "2025-10-29",
      type: "expense",
      description: "Utilities - Electricity",
      amount: "$350.00",
      accountName: "Main Operating Account",
      currency: "USD",
    },
  ];

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch = account.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || account.status === filterType;
    return matchesSearch && matchesFilter;
  });

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.accountName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const handleAccountPress = (accountId: string) => {
    console.log("View account:", accountId);
  };

  const handleTransactionPress = (transactionId: string) => {
    console.log("View transaction:", transactionId);
  };

  const handleExport = () => {
    console.log("Export data");
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-sm text-gray-600 mt-4">Loading accounts...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4">
      {/* Header Actions */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-base font-semibold text-gray-900">
          Account Reports
        </Text>
        <TouchableOpacity
          onPress={handleExport}
          className="flex-row items-center gap-1 bg-blue-500 px-3 py-2 rounded-lg"
        >
          <Ionicons name="download-outline" size={16} color="#fff" />
          <Text className="text-white text-xs font-medium">Export</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Stats */}
      <View className="flex-row gap-3 mb-4">
        <StatCard
          title="Total Assets"
          value="$144K"
          icon="wallet"
          color="#10b981"
        />
        <StatCard
          title="Active"
          value="4"
          icon="checkmark-circle"
          color="#3b82f6"
        />
      </View>

      {/* Search Bar */}
      <View className="bg-gray-100 rounded-lg px-3 py-2 mb-3 flex-row items-center">
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 ml-2 text-sm text-gray-900"
          placeholderTextColor="#999"
        />
        {searchQuery !== "" && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Navigation */}
      <View className="flex-row gap-2 mb-4">
        <TouchableOpacity
          onPress={() => setActiveTab("balances")}
          className={`flex-1 flex-row items-center justify-center gap-2 px-4 py-3 rounded-lg ${
            activeTab === "balances" ? "bg-blue-500" : "bg-gray-100"
          }`}
        >
          <Ionicons
            name="wallet-outline"
            size={18}
            color={activeTab === "balances" ? "#ffffff" : "#666666"}
          />
          <Text
            className={`text-sm font-medium ${
              activeTab === "balances" ? "text-white" : "text-gray-600"
            }`}
          >
            Balances
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("transactions")}
          className={`flex-1 flex-row items-center justify-center gap-2 px-4 py-3 rounded-lg ${
            activeTab === "transactions" ? "bg-blue-500" : "bg-gray-100"
          }`}
        >
          <Ionicons
            name="list-outline"
            size={18}
            color={activeTab === "transactions" ? "#ffffff" : "#666666"}
          />
          <Text
            className={`text-sm font-medium ${
              activeTab === "transactions" ? "text-white" : "text-gray-600"
            }`}
          >
            Transactions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips (only for balances tab) */}
      {activeTab === "balances" && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          <View className="flex-row gap-2">
            {["all", "active", "inactive"].map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setFilterType(filter as any)}
                className={`px-4 py-2 rounded-full ${
                  filterType === filter ? "bg-blue-500" : "bg-gray-200"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    filterType === filter ? "text-white" : "text-gray-700"
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Content based on active tab */}
      {activeTab === "balances" ? (
        <View>
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Accounts ({filteredAccounts.length})
          </Text>
          {filteredAccounts.map((account) => (
            <AccountCard
              key={account.id}
              {...account}
              onPress={() => handleAccountPress(account.id)}
            />
          ))}

          {filteredAccounts.length === 0 && (
            <View className="items-center py-10">
              <Ionicons name="folder-open-outline" size={48} color="#ccc" />
              <Text className="text-sm text-gray-600 mt-3">
                No accounts found
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View>
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Recent Transactions ({filteredTransactions.length})
          </Text>
          {filteredTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              {...transaction}
              onPress={() => handleTransactionPress(transaction.id)}
            />
          ))}

          {filteredTransactions.length === 0 && (
            <View className="items-center py-10">
              <Ionicons name="receipt-outline" size={48} color="#ccc" />
              <Text className="text-sm text-gray-600 mt-3">
                No transactions found
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
