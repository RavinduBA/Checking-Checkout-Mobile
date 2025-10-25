import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface FinancialItem {
  id: string;
  category: string;
  amount: string;
  percentage: string;
  trend: "up" | "down" | "neutral";
}

interface CategoryCardProps {
  category: string;
  amount: string;
  percentage: string;
  trend: "up" | "down" | "neutral";
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  amount,
  percentage,
  trend,
}) => {
  return (
    <View className="bg-white rounded-lg p-4 border border-gray-200 mb-3">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-900 mb-1">
            {category}
          </Text>
          <Text className="text-xl font-bold text-gray-900">{amount}</Text>
        </View>
        <View
          className={`px-2 py-1 rounded-md ${
            trend === "up"
              ? "bg-green-100"
              : trend === "down"
              ? "bg-red-100"
              : "bg-gray-100"
          }`}
        >
          <View className="flex-row items-center gap-1">
            <Ionicons
              name={
                trend === "up"
                  ? "arrow-up"
                  : trend === "down"
                  ? "arrow-down"
                  : "remove"
              }
              size={12}
              color={
                trend === "up"
                  ? "#10b981"
                  : trend === "down"
                  ? "#ef4444"
                  : "#6b7280"
              }
            />
            <Text
              className={`text-xs font-semibold ${
                trend === "up"
                  ? "text-green-600"
                  : trend === "down"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {percentage}
            </Text>
          </View>
        </View>
      </View>
      {/* Progress Bar */}
      <View className="bg-gray-200 rounded-full h-2 mt-2">
        <View
          className="bg-blue-500 rounded-full h-2"
          style={{ width: `${percentage}` as any }}
        />
      </View>
    </View>
  );
};

interface TimelineItem {
  id: string;
  date: string;
  description: string;
  amount: string;
  type: "income" | "expense";
}

const TimelineCard: React.FC<TimelineItem> = ({
  date,
  description,
  amount,
  type,
}) => {
  return (
    <View className="flex-row items-start mb-4">
      <View className="mr-3 mt-1">
        <View
          className={`w-8 h-8 rounded-full items-center justify-center ${
            type === "income" ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <Ionicons
            name={type === "income" ? "arrow-down" : "arrow-up"}
            size={16}
            color={type === "income" ? "#10b981" : "#ef4444"}
          />
        </View>
      </View>
      <View className="flex-1 bg-white rounded-lg p-3 border border-gray-200">
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-xs text-gray-600">{date}</Text>
          <Text
            className={`text-sm font-semibold ${
              type === "income" ? "text-green-600" : "text-red-600"
            }`}
          >
            {type === "income" ? "+" : "-"}
            {amount}
          </Text>
        </View>
        <Text className="text-sm text-gray-900">{description}</Text>
      </View>
    </View>
  );
};

export default function EnhancedFinancialReportsMobile() {
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<"category" | "timeline">(
    "category"
  );

  const categoryData: FinancialItem[] = [
    {
      id: "1",
      category: "Room Revenue",
      amount: "$32,450",
      percentage: "65%",
      trend: "up",
    },
    {
      id: "2",
      category: "Food & Beverage",
      amount: "$8,750",
      percentage: "18%",
      trend: "up",
    },
    {
      id: "3",
      category: "Additional Services",
      amount: "$5,250",
      percentage: "11%",
      trend: "neutral",
    },
    {
      id: "4",
      category: "Other Income",
      amount: "$2,800",
      percentage: "6%",
      trend: "down",
    },
  ];

  const timelineData: TimelineItem[] = [
    {
      id: "1",
      date: "Today, 10:30 AM",
      description: "Guest Check-in - Room 205",
      amount: "450.00",
      type: "income",
    },
    {
      id: "2",
      date: "Today, 08:15 AM",
      description: "Housekeeping Supplies",
      amount: "85.50",
      type: "expense",
    },
    {
      id: "3",
      date: "Yesterday, 06:45 PM",
      description: "Restaurant Order - Table 12",
      amount: "125.00",
      type: "income",
    },
    {
      id: "4",
      date: "Yesterday, 02:30 PM",
      description: "Maintenance Work - HVAC",
      amount: "320.00",
      type: "expense",
    },
    {
      id: "5",
      date: "Yesterday, 11:00 AM",
      description: "Guest Check-in - Room 310",
      amount: "580.00",
      type: "income",
    },
  ];

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-sm text-gray-600 mt-4">
          Loading detailed reports...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      {/* View Toggle */}
      <View className="flex-row gap-2 mb-4">
        <TouchableOpacity
          onPress={() => setSelectedView("category")}
          className={`flex-1 py-2 px-4 rounded-lg flex-row items-center justify-center gap-2 ${
            selectedView === "category" ? "bg-blue-500" : "bg-gray-200"
          }`}
        >
          <Ionicons
            name="pie-chart"
            size={18}
            color={selectedView === "category" ? "#fff" : "#666"}
          />
          <Text
            className={`text-sm font-medium ${
              selectedView === "category" ? "text-white" : "text-gray-700"
            }`}
          >
            By Category
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedView("timeline")}
          className={`flex-1 py-2 px-4 rounded-lg flex-row items-center justify-center gap-2 ${
            selectedView === "timeline" ? "bg-blue-500" : "bg-gray-200"
          }`}
        >
          <Ionicons
            name="time"
            size={18}
            color={selectedView === "timeline" ? "#fff" : "#666"}
          />
          <Text
            className={`text-sm font-medium ${
              selectedView === "timeline" ? "text-white" : "text-gray-700"
            }`}
          >
            Timeline
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <View className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 mb-4">
        <Text className="text-white text-sm mb-2 opacity-90">
          Total Revenue
        </Text>
        <Text className="text-white text-3xl font-bold mb-3">$49,250</Text>
        <View className="flex-row items-center gap-2">
          <View className="flex-row items-center gap-1 bg-white/20 px-2 py-1 rounded-md">
            <Ionicons name="trending-up" size={14} color="#fff" />
            <Text className="text-white text-xs font-semibold">+15.8%</Text>
          </View>
          <Text className="text-white text-xs opacity-75">vs last period</Text>
        </View>
      </View>

      {/* Content */}
      {selectedView === "category" ? (
        <View>
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Revenue by Category
          </Text>
          {categoryData.map((item) => (
            <CategoryCard key={item.id} {...item} />
          ))}
        </View>
      ) : (
        <View>
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Transaction Timeline
          </Text>
          {timelineData.map((item) => (
            <TimelineCard key={item.id} {...item} />
          ))}
        </View>
      )}

      {/* Filter & Export Buttons */}
      <View className="flex-row gap-2 mt-4">
        <TouchableOpacity className="flex-1 bg-gray-200 rounded-lg p-3 flex-row items-center justify-center gap-2">
          <Ionicons name="funnel-outline" size={18} color="#666" />
          <Text className="text-gray-700 font-medium">Filter</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-blue-500 rounded-lg p-3 flex-row items-center justify-center gap-2">
          <Ionicons name="download-outline" size={18} color="#fff" />
          <Text className="text-white font-medium">Export</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
