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
  onPress,
}) => {
  const isPositive = !balance.startsWith("-");

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-card rounded-lg p-4 border border-border mb-3"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground mb-1">
            {name}
          </Text>
          <Text className="text-xs text-muted-foreground">{type}</Text>
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

      <View className="border-t border-border pt-3 mt-2">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-xs text-muted-foreground mb-1">Balance</Text>
            <Text
              className={`text-xl font-bold ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {balance}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-muted-foreground mb-1">
              Last Transaction
            </Text>
            <Text className="text-xs text-foreground">{lastTransaction}</Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-end gap-1 mt-3">
        <Text className="text-xs text-primary font-medium">View Details</Text>
        <Ionicons name="chevron-forward" size={14} color="#3b82f6" />
      </View>
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
    <View className="flex-1 bg-card rounded-lg p-3 border border-border">
      <View
        className="w-8 h-8 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: `${color}20` }}
      >
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text className="text-xs text-muted-foreground mb-1">{title}</Text>
      <Text className="text-lg font-bold text-foreground">{value}</Text>
    </View>
  );
};

export default function AccountsReportsMobile() {
  const [loading, setLoading] = useState(true);
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
    },
    {
      id: "2",
      name: "Payroll Account",
      type: "Checking",
      balance: "$12,500.00",
      status: "active",
      lastTransaction: "1 day ago",
    },
    {
      id: "3",
      name: "Savings Reserve",
      type: "Savings",
      balance: "$85,000.00",
      status: "active",
      lastTransaction: "5 days ago",
    },
    {
      id: "4",
      name: "Petty Cash",
      type: "Cash",
      balance: "$1,250.00",
      status: "active",
      lastTransaction: "3 hours ago",
    },
    {
      id: "5",
      name: "Old Operations Account",
      type: "Checking",
      balance: "$0.00",
      status: "inactive",
      lastTransaction: "45 days ago",
    },
  ];

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch = account.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || account.status === filterType;
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const handleAccountPress = (accountId: string) => {
    // Navigate to account details
    console.log("View account:", accountId);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-sm text-muted-foreground mt-4">
          Loading accounts...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
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
      <View className="bg-muted rounded-lg px-3 py-2 mb-3 flex-row items-center">
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          placeholder="Search accounts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 ml-2 text-sm text-foreground"
          placeholderTextColor="#999"
        />
        {searchQuery !== "" && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
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
                filterType === filter ? "bg-primary" : "bg-muted"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  filterType === filter ? "text-white" : "text-muted-foreground"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Accounts List */}
      <View>
        <Text className="text-base font-semibold text-foreground mb-3">
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
            <Text className="text-sm text-muted-foreground mt-3">
              No accounts found
            </Text>
          </View>
        )}
      </View>

      {/* Add Account Button */}
      <TouchableOpacity className="bg-primary rounded-lg p-4 flex-row items-center justify-center gap-2 mt-4">
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text className="text-white font-semibold">Add New Account</Text>
      </TouchableOpacity>
    </View>
  );
}
