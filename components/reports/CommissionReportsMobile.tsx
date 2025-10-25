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

interface Commission {
  id: string;
  agentName: string;
  bookings: number;
  totalSales: string;
  commissionRate: string;
  commissionAmount: string;
  status: "paid" | "pending" | "overdue";
  dueDate: string;
}

interface CommissionCardProps extends Commission {
  onPress: () => void;
}

const CommissionCard: React.FC<CommissionCardProps> = ({
  agentName,
  bookings,
  totalSales,
  commissionRate,
  commissionAmount,
  status,
  dueDate,
  onPress,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100";
      case "pending":
        return "bg-yellow-100";
      case "overdue":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "overdue":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-card rounded-lg p-4 border border-border mb-3"
    >
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground mb-1">
            {agentName}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {bookings} bookings • {commissionRate} commission
          </Text>
        </View>
        <View className={`px-2 py-1 rounded-md ${getStatusColor(status)}`}>
          <Text className={`text-xs font-medium ${getStatusTextColor(status)}`}>
            {status}
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View className="flex-row gap-3 mb-3">
        <View className="flex-1 bg-muted rounded-lg p-3">
          <Text className="text-xs text-muted-foreground mb-1">
            Total Sales
          </Text>
          <Text className="text-sm font-bold text-foreground">
            {totalSales}
          </Text>
        </View>
        <View className="flex-1 bg-primary/10 rounded-lg p-3">
          <Text className="text-xs text-muted-foreground mb-1">Commission</Text>
          <Text className="text-sm font-bold text-primary">
            {commissionAmount}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View className="flex-row justify-between items-center pt-2 border-t border-border">
        <View className="flex-row items-center gap-1">
          <Ionicons name="calendar-outline" size={12} color="#666" />
          <Text className="text-xs text-muted-foreground">Due: {dueDate}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text className="text-xs text-primary font-medium">Details</Text>
          <Ionicons name="chevron-forward" size={14} color="#3b82f6" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor,
}) => {
  return (
    <View className="bg-card rounded-lg p-4 border border-border">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-xs text-muted-foreground mb-1">{title}</Text>
          <Text className="text-2xl font-bold text-foreground mb-1">
            {value}
          </Text>
          {subtitle && (
            <Text className="text-xs text-muted-foreground">{subtitle}</Text>
          )}
        </View>
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
      </View>
    </View>
  );
};

export default function CommissionReportsMobile() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "paid" | "pending" | "overdue"
  >("all");

  const commissions: Commission[] = [
    {
      id: "1",
      agentName: "John Smith",
      bookings: 12,
      totalSales: "$8,450",
      commissionRate: "8%",
      commissionAmount: "$676",
      status: "paid",
      dueDate: "Jan 15, 2024",
    },
    {
      id: "2",
      agentName: "Sarah Johnson",
      bookings: 18,
      totalSales: "$12,300",
      commissionRate: "10%",
      commissionAmount: "$1,230",
      status: "pending",
      dueDate: "Feb 1, 2024",
    },
    {
      id: "3",
      agentName: "Michael Chen",
      bookings: 8,
      totalSales: "$5,200",
      commissionRate: "7%",
      commissionAmount: "$364",
      status: "pending",
      dueDate: "Feb 5, 2024",
    },
    {
      id: "4",
      agentName: "Emily Davis",
      bookings: 15,
      totalSales: "$9,800",
      commissionRate: "9%",
      commissionAmount: "$882",
      status: "overdue",
      dueDate: "Dec 20, 2023",
    },
    {
      id: "5",
      agentName: "Robert Wilson",
      bookings: 10,
      totalSales: "$6,500",
      commissionRate: "8%",
      commissionAmount: "$520",
      status: "paid",
      dueDate: "Jan 10, 2024",
    },
  ];

  const filteredCommissions = commissions.filter((commission) => {
    const matchesSearch = commission.agentName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || commission.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalCommissions = commissions.reduce(
    (sum, c) => sum + parseFloat(c.commissionAmount.replace(/[$,]/g, "")),
    0
  );
  const pendingCommissions = commissions.filter((c) => c.status === "pending");
  const overdueCommissions = commissions.filter((c) => c.status === "overdue");

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const handleCommissionPress = (commissionId: string) => {
    console.log("View commission:", commissionId);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-sm text-muted-foreground mt-4">
          Loading commissions...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      {/* Summary Cards */}
      <View className="gap-3 mb-4">
        <SummaryCard
          title="Total Commissions"
          value={`$${totalCommissions.toFixed(2)}`}
          subtitle="All time"
          icon="cash"
          iconColor="#10b981"
        />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <SummaryCard
              title="Pending"
              value={pendingCommissions.length.toString()}
              icon="time"
              iconColor="#f59e0b"
            />
          </View>
          <View className="flex-1">
            <SummaryCard
              title="Overdue"
              value={overdueCommissions.length.toString()}
              icon="alert-circle"
              iconColor="#ef4444"
            />
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View className="bg-muted rounded-lg px-3 py-2 mb-3 flex-row items-center">
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          placeholder="Search agents..."
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
          {["all", "paid", "pending", "overdue"].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setFilterStatus(filter as any)}
              className={`px-4 py-2 rounded-full ${
                filterStatus === filter ? "bg-primary" : "bg-muted"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  filterStatus === filter
                    ? "text-white"
                    : "text-muted-foreground"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Commissions List */}
      <View>
        <Text className="text-base font-semibold text-foreground mb-3">
          Commission Records ({filteredCommissions.length})
        </Text>
        {filteredCommissions.map((commission) => (
          <CommissionCard
            key={commission.id}
            {...commission}
            onPress={() => handleCommissionPress(commission.id)}
          />
        ))}

        {filteredCommissions.length === 0 && (
          <View className="items-center py-10">
            <Ionicons name="document-outline" size={48} color="#ccc" />
            <Text className="text-sm text-muted-foreground mt-3">
              No commission records found
            </Text>
          </View>
        )}
      </View>

      {/* Export Button */}
      <TouchableOpacity className="bg-primary rounded-lg p-4 flex-row items-center justify-center gap-2 mt-4">
        <Ionicons name="download-outline" size={20} color="#fff" />
        <Text className="text-white font-semibold">Export Report</Text>
      </TouchableOpacity>
    </View>
  );
}
