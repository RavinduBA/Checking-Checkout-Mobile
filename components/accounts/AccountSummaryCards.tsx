import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

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

interface AccountSummaryCardsProps {
  accounts: AccountWithBalance[];
}

export function AccountSummaryCards({ accounts }: AccountSummaryCardsProps) {
  const totalLKRBalance = accounts
    .filter((account) => account.currency === "LKR")
    .reduce((sum, account) => sum + account.currentBalance, 0);

  const totalUSDBalance = accounts
    .filter((account) => account.currency === "USD")
    .reduce((sum, account) => sum + account.currentBalance, 0);

  const totalEURBalance = accounts
    .filter((account) => account.currency === "EUR")
    .reduce((sum, account) => sum + account.currentBalance, 0);

  const totalGBPBalance = accounts
    .filter((account) => account.currency === "GBP")
    .reduce((sum, account) => sum + account.currentBalance, 0);

  const summaryCards = [
    {
      title: "Total Accounts",
      value: accounts.length.toString(),
      icon: "wallet-outline" as const,
      color: "bg-blue-500",
    },
    {
      title: "LKR Balance",
      value: `Rs. ${totalLKRBalance.toLocaleString()}`,
      icon: "cash-outline" as const,
      color: "bg-green-500",
    },
    {
      title: "USD Balance",
      value: `$ ${totalUSDBalance.toLocaleString()}`,
      icon: "card-outline" as const,
      color: "bg-purple-500",
    },
  ];

  // Add EUR and GBP cards if there are balances
  if (totalEURBalance > 0) {
    summaryCards.push({
      title: "EUR Balance",
      value: `€ ${totalEURBalance.toLocaleString()}`,
      icon: "card-outline" as const,
      color: "bg-orange-500",
    });
  }

  if (totalGBPBalance > 0) {
    summaryCards.push({
      title: "GBP Balance",
      value: `£ ${totalGBPBalance.toLocaleString()}`,
      icon: "card-outline" as const,
      color: "bg-indigo-500",
    });
  }

  return (
    <View className="mb-6">
      {/* First row - always show these 3 */}
      <View className="flex-row gap-3 mb-3">
        {summaryCards.slice(0, 3).map((card, index) => (
          <View
            key={index}
            className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <View className="flex-row items-center justify-between mb-2">
              <View
                className={`w-8 h-8 ${card.color} rounded-lg flex items-center justify-center`}
              >
                <Ionicons name={card.icon} size={18} color="white" />
              </View>
            </View>
            <Text className="text-xs text-gray-500 mb-1">{card.title}</Text>
            <Text className="text-sm font-bold text-gray-800" numberOfLines={1}>
              {card.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Second row - EUR and GBP if they exist */}
      {summaryCards.length > 3 && (
        <View className="flex-row gap-3">
          {summaryCards.slice(3).map((card, index) => (
            <View
              key={index + 3}
              className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View
                  className={`w-8 h-8 ${card.color} rounded-lg flex items-center justify-center`}
                >
                  <Ionicons name={card.icon} size={18} color="white" />
                </View>
              </View>
              <Text className="text-xs text-gray-500 mb-1">{card.title}</Text>
              <Text
                className="text-sm font-bold text-gray-800"
                numberOfLines={1}
              >
                {card.value}
              </Text>
            </View>
          ))}
          {/* Add empty spacer if only one additional card */}
          {summaryCards.length === 4 && <View className="flex-1" />}
        </View>
      )}
    </View>
  );
}
