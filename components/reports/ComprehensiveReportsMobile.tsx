import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend = "neutral",
  icon,
  iconColor = "#3b82f6",
}) => {
  return (
    <View className="bg-white rounded-lg p-4 border border-gray-200">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-xs text-gray-600 mb-1">{title}</Text>
          <Text className="text-2xl font-bold text-gray-900">{value}</Text>
        </View>
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
      </View>
      {change && (
        <View className="flex-row items-center gap-1">
          <Ionicons
            name={
              trend === "up"
                ? "trending-up"
                : trend === "down"
                ? "trending-down"
                : "remove"
            }
            size={14}
            color={
              trend === "up"
                ? "#10b981"
                : trend === "down"
                ? "#ef4444"
                : "#6b7280"
            }
          />
          <Text
            className={`text-xs ${
              trend === "up"
                ? "text-green-600"
                : trend === "down"
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            {change}
          </Text>
        </View>
      )}
    </View>
  );
};

interface RecentTransactionProps {
  title: string;
  date: string;
  amount: string;
  type: "income" | "expense";
}

const RecentTransaction: React.FC<RecentTransactionProps> = ({
  title,
  date,
  amount,
  type,
}) => {
  return (
    <View className="bg-white rounded-lg p-4 border border-gray-200 mb-2">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-2">
          <Text className="text-sm font-medium text-gray-900 mb-1">
            {title}
          </Text>
          <Text className="text-xs text-gray-600">{date}</Text>
        </View>
        <Text
          className={`text-sm font-semibold ${
            type === "income" ? "text-green-600" : "text-red-600"
          }`}
        >
          {type === "income" ? "+" : "-"}
          {amount}
        </Text>
      </View>
    </View>
  );
};

export default function ComprehensiveReportsMobile() {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "year"
  >("month");

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 500);
  }, [selectedPeriod]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-sm text-gray-600 mt-4">Loading reports...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-gray-50">
      {/* Period Selector */}
      <View className="flex-row gap-2 mb-4">
        {["week", "month", "year"].map((period) => (
          <TouchableOpacity
            key={period}
            onPress={() => setSelectedPeriod(period as any)}
            className={`flex-1 py-2 px-4 rounded-lg ${
              selectedPeriod === period ? "bg-blue-500" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-sm font-medium text-center ${
                selectedPeriod === period ? "text-white" : "text-gray-700"
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Metrics Grid */}
      <View className="gap-3 mb-4">
        <MetricCard
          title="Total Revenue"
          value="$48,250"
          change="+12.5% from last month"
          trend="up"
          icon="cash"
          iconColor="#10b981"
        />
        <MetricCard
          title="Total Expenses"
          value="$18,750"
          change="+5.2% from last month"
          trend="up"
          icon="card"
          iconColor="#ef4444"
        />
        <MetricCard
          title="Net Profit"
          value="$29,500"
          change="+18.3% from last month"
          trend="up"
          icon="trending-up"
          iconColor="#3b82f6"
        />
        <MetricCard
          title="Occupancy Rate"
          value="87%"
          change="-3% from last month"
          trend="down"
          icon="home"
          iconColor="#f59e0b"
        />
      </View>

      {/* Recent Transactions */}
      <View className="mb-4">
        <Text className="text-base font-semibold text-gray-900 mb-3">
          Recent Transactions
        </Text>
        <RecentTransaction
          title="Room Booking - #12345"
          date="2 hours ago"
          amount="$450.00"
          type="income"
        />
        <RecentTransaction
          title="Maintenance Fee"
          date="5 hours ago"
          amount="$120.50"
          type="expense"
        />
        <RecentTransaction
          title="Room Booking - #12344"
          date="1 day ago"
          amount="$380.00"
          type="income"
        />
        <RecentTransaction
          title="Utility Payment"
          date="2 days ago"
          amount="$250.00"
          type="expense"
        />
      </View>

      {/* Export Button */}
      <TouchableOpacity className="bg-blue-500 rounded-lg p-4 flex-row items-center justify-center gap-2 mb-4">
        <Ionicons name="download-outline" size={20} color="#fff" />
        <Text className="text-white font-semibold">Export Report</Text>
      </TouchableOpacity>
    </View>
  );
}
