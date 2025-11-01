import { useLocationContext } from "@/contexts/LocationContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CommissionData {
  reservation_id: string;
  reservation_number: string;
  guest_name: string;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  guide_id?: string;
  guide_name?: string;
  guide_commission: number;
  agent_id?: string;
  agent_name?: string;
  agent_commission: number;
  status: string;
}

interface Guide {
  id: string;
  name: string;
}

interface Agent {
  id: string;
  name: string;
}

interface CommissionCardProps {
  commission: CommissionData;
  onPress: () => void;
}

const CommissionCard: React.FC<CommissionCardProps> = ({
  commission,
  onPress,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100";
      case "checked_out":
        return "bg-gray-100";
      case "cancelled":
        return "bg-red-100";
      default:
        return "bg-yellow-100";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-blue-600";
      case "checked_out":
        return "text-gray-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-lg p-4 border border-gray-200 mb-3"
    >
      {/* Header */}
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 mb-1">
            {commission.guest_name}
          </Text>
          <Text className="text-xs text-gray-600">
            {new Date(commission.check_in_date).toLocaleDateString()} →{" "}
            {new Date(commission.check_out_date).toLocaleDateString()}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">
            Res# {commission.reservation_number}
          </Text>
        </View>
        <View
          className={`px-2 py-1 rounded-md ${getStatusColor(
            commission.status
          )}`}
        >
          <Text
            className={`text-xs font-medium ${getStatusTextColor(
              commission.status
            )}`}
          >
            {commission.status}
          </Text>
        </View>
      </View>

      {/* Total Amount */}
      <View className="bg-gray-50 rounded-lg p-3 mb-3">
        <Text className="text-xs text-gray-600 mb-1">Total Amount</Text>
        <Text className="text-lg font-bold text-gray-900">
          {formatCurrency(commission.total_amount)}
        </Text>
      </View>

      {/* Commissions Grid */}
      <View className="flex-row gap-3">
        {commission.guide_name && (
          <View className="flex-1 bg-green-50 rounded-lg p-3">
            <Text className="text-xs text-gray-600 mb-1">Guide</Text>
            <Text className="text-xs font-medium text-gray-900 mb-1">
              {commission.guide_name}
            </Text>
            <Text className="text-sm font-bold text-green-600">
              {formatCurrency(commission.guide_commission)}
            </Text>
          </View>
        )}
        {commission.agent_name && (
          <View className="flex-1 bg-blue-50 rounded-lg p-3">
            <Text className="text-xs text-gray-600 mb-1">Agent</Text>
            <Text className="text-xs font-medium text-gray-900 mb-1">
              {commission.agent_name}
            </Text>
            <Text className="text-sm font-bold text-blue-600">
              {formatCurrency(commission.agent_commission)}
            </Text>
          </View>
        )}
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
    <View className="flex-1 bg-white rounded-lg p-3 border border-gray-200">
      <View
        className="w-8 h-8 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: `${color}20` }}
      >
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text className="text-xs text-gray-600 mb-1">{title}</Text>
      <Text className="text-base font-bold text-gray-900">{value}</Text>
    </View>
  );
};

type FilterType = "all" | "guide" | "agent";

export default function CommissionReportsMobile() {
  const { profile } = useUserProfile();
  const { selectedLocation, getSelectedLocationData } = useLocationContext();
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedPerson, setSelectedPerson] = useState("");
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showPersonModal, setShowPersonModal] = useState(false);

  const selectedLocationData = getSelectedLocationData();

  useEffect(() => {
    fetchData();
    fetchGuides();
    fetchAgents();
  }, [profile?.tenant_id, selectedLocation]);

  const fetchData = async () => {
    if (!profile?.tenant_id || !selectedLocationData?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reservations")
        .select(
          `
          id,
          reservation_number,
          guest_name,
          check_in_date,
          check_out_date,
          total_amount,
          guide_id,
          guide_commission,
          agent_id,
          agent_commission,
          status,
          guides!guide_id(name),
          agents!agent_id(name)
        `
        )
        .eq("tenant_id", profile.tenant_id)
        .eq("location_id", selectedLocationData.id)
        .or("guide_id.not.is.null,agent_id.not.is.null")
        .order("check_in_date", { ascending: false });

      if (error) throw error;

      const formattedData =
        data?.map((item: any) => ({
          reservation_id: item.id,
          reservation_number: item.reservation_number,
          guest_name: item.guest_name,
          check_in_date: item.check_in_date,
          check_out_date: item.check_out_date,
          total_amount: item.total_amount,
          guide_id: item.guide_id,
          guide_name: item.guides?.name,
          guide_commission: item.guide_commission || 0,
          agent_id: item.agent_id,
          agent_name: item.agents?.name,
          agent_commission: item.agent_commission || 0,
          status: item.status,
        })) || [];

      setCommissions(formattedData);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch commission data");
      console.error("Error fetching commissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGuides = async () => {
    if (!profile?.tenant_id || !selectedLocationData?.id) return;

    try {
      const { data } = await supabase
        .from("guides")
        .select("id, name")
        .eq("tenant_id", profile.tenant_id)
        .eq("location_id", selectedLocationData.id)
        .eq("is_active", true)
        .order("name");

      setGuides(data || []);
    } catch (error) {
      console.error("Error fetching guides:", error);
    }
  };

  const fetchAgents = async () => {
    if (!profile?.tenant_id || !selectedLocationData?.id) return;

    try {
      const { data } = await supabase
        .from("agents")
        .select("id, name")
        .eq("tenant_id", profile.tenant_id)
        .eq("location_id", selectedLocationData.id)
        .eq("is_active", true)
        .order("name");

      setAgents(data || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...commissions];

    // Date filter
    if (dateFrom) {
      const fromDateStr = dateFrom.toISOString().split("T")[0];
      filtered = filtered.filter((item) => item.check_in_date >= fromDateStr);
    }
    if (dateTo) {
      const toDateStr = dateTo.toISOString().split("T")[0];
      filtered = filtered.filter((item) => item.check_in_date <= toDateStr);
    }

    // Type and person filter
    if (filterType === "guide" && selectedPerson) {
      filtered = filtered.filter((item) => item.guide_id === selectedPerson);
    } else if (filterType === "agent" && selectedPerson) {
      filtered = filtered.filter((item) => item.agent_id === selectedPerson);
    } else if (filterType === "guide") {
      filtered = filtered.filter((item) => item.guide_id);
    } else if (filterType === "agent") {
      filtered = filtered.filter((item) => item.agent_id);
    }

    return filtered;
  };

  const filteredCommissions = applyFilters();

  const calculateTotals = () => {
    const totals = filteredCommissions.reduce(
      (acc, item) => {
        acc.totalGuideCommission += item.guide_commission;
        acc.totalAgentCommission += item.agent_commission;
        acc.totalReservationValue += item.total_amount;
        return acc;
      },
      {
        totalGuideCommission: 0,
        totalAgentCommission: 0,
        totalReservationValue: 0,
      }
    );

    return totals;
  };

  const totals = calculateTotals();

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  const handleExport = async () => {
    try {
      const csvContent = [
        [
          "Reservation",
          "Guest",
          "Check In",
          "Check Out",
          "Total Amount",
          "Guide",
          "Guide Commission",
          "Agent",
          "Agent Commission",
          "Status",
        ],
        ...filteredCommissions.map((item) => [
          item.reservation_number,
          item.guest_name,
          item.check_in_date,
          item.check_out_date,
          item.total_amount,
          item.guide_name || "",
          item.guide_commission,
          item.agent_name || "",
          item.agent_commission,
          item.status,
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      await Share.share({
        message: csvContent,
        title: `Commission Report - ${
          new Date().toISOString().split("T")[0]
        }.csv`,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to export data");
      console.error("Export error:", error);
    }
  };

  const clearFilters = () => {
    setDateFrom(null);
    setDateTo(null);
    setFilterType("all");
    setSelectedPerson("");
  };

  const handleCommissionPress = (reservationId: string) => {
    console.log("View reservation:", reservationId);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-sm text-gray-600 mt-4">
          Loading commissions...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-lg font-bold text-gray-900">
            Commission Reports
          </Text>
          <Text className="text-xs text-gray-600">
            View guide and agent commissions
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleExport}
          className="flex-row items-center gap-1 bg-blue-500 px-3 py-2 rounded-lg"
        >
          <Ionicons name="download-outline" size={16} color="#fff" />
          <Text className="text-white text-xs font-medium">Export</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Stats - 2 rows on mobile */}
      <View className="gap-3 mb-4">
        <View className="flex-row gap-3">
          <StatCard
            title="Guide Commissions"
            value={formatCurrency(totals.totalGuideCommission)}
            icon="person"
            color="#10b981"
          />
          <StatCard
            title="Agent Commissions"
            value={formatCurrency(totals.totalAgentCommission)}
            icon="people"
            color="#3b82f6"
          />
        </View>
        <View className="flex-row gap-3">
          <StatCard
            title="Total Commissions"
            value={formatCurrency(
              totals.totalGuideCommission + totals.totalAgentCommission
            )}
            icon="cash"
            color="#f59e0b"
          />
          <StatCard
            title="Reservation Value"
            value={formatCurrency(totals.totalReservationValue)}
            icon="card"
            color="#8b5cf6"
          />
        </View>
      </View>

      {/* Filters - All in One Row */}
      <View className="bg-white rounded-lg p-3 border border-gray-200 mb-4">
        <Text className="text-sm font-semibold text-gray-900 mb-3">
          Filters
        </Text>

        {/* First Row: Date From, Date To, Type */}
        <View className="flex-row gap-2 mb-3">
          {/* From Date */}
          <TouchableOpacity
            onPress={() => setShowFromDatePicker(true)}
            className="flex-1 border border-gray-300 rounded-lg px-2 py-2.5 bg-white"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-gray-900">
                {dateFrom ? dateFrom.toLocaleDateString() : "From Date"}
              </Text>
              <Ionicons name="calendar-outline" size={16} color="#666" />
            </View>
          </TouchableOpacity>

          {/* To Date */}
          <TouchableOpacity
            onPress={() => setShowToDatePicker(true)}
            className="flex-1 border border-gray-300 rounded-lg px-2 py-2.5 bg-white"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-gray-900">
                {dateTo ? dateTo.toLocaleDateString() : "To Date"}
              </Text>
              <Ionicons name="calendar-outline" size={16} color="#666" />
            </View>
          </TouchableOpacity>

          {/* Type Filter */}
          <TouchableOpacity
            onPress={() => setShowTypeModal(true)}
            className="flex-1 border border-gray-300 rounded-lg px-2 py-2.5 bg-white"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-gray-900">
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Second Row: Person Filter */}
        <View className="flex-row gap-2">
          {/* Person Selector */}
          <TouchableOpacity
            onPress={() => filterType !== "all" && setShowPersonModal(true)}
            disabled={filterType === "all"}
            className={`flex-1 border border-gray-300 rounded-lg px-2 py-2.5 ${
              filterType === "all" ? "bg-gray-100" : "bg-white"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <Text
                className={`text-xs ${
                  filterType === "all" ? "text-gray-400" : "text-gray-900"
                }`}
              >
                {selectedPerson
                  ? (filterType === "guide" ? guides : agents).find(
                      (p) => p.id === selectedPerson
                    )?.name || "Select"
                  : filterType === "guide"
                  ? "Select Guide"
                  : filterType === "agent"
                  ? "Select Agent"
                  : "Select Person"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </View>
          </TouchableOpacity>

          {/* Clear Filters Button */}
          {(dateFrom || dateTo || filterType !== "all" || selectedPerson) && (
            <TouchableOpacity
              onPress={clearFilters}
              className="border border-gray-300 rounded-lg px-3 py-2.5 bg-white"
            >
              <View className="flex-row items-center gap-1">
                <Ionicons
                  name="close-circle-outline"
                  size={16}
                  color="#ef4444"
                />
                <Text className="text-xs text-red-500 font-medium">Clear</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Commission List */}
      <View>
        <Text className="text-base font-semibold text-gray-900 mb-3">
          Commissions ({filteredCommissions.length})
        </Text>
        {filteredCommissions.map((commission) => (
          <CommissionCard
            key={commission.reservation_id}
            commission={commission}
            onPress={() => handleCommissionPress(commission.reservation_id)}
          />
        ))}

        {filteredCommissions.length === 0 && (
          <View className="items-center py-10">
            <Ionicons name="receipt-outline" size={48} color="#ccc" />
            <Text className="text-sm text-gray-600 mt-3">
              No commissions found
            </Text>
          </View>
        )}
      </View>

      {/* Date Pickers */}
      <Modal visible={showFromDatePicker} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-xl p-4 m-4 w-[90%]">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold">Select From Date</Text>
              <TouchableOpacity onPress={() => setShowFromDatePicker(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={dateFrom || new Date()}
              mode="date"
              display="inline"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setDateFrom(selectedDate);
                }
                setShowFromDatePicker(false);
              }}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={showToDatePicker} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-xl p-4 m-4 w-[90%]">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold">Select To Date</Text>
              <TouchableOpacity onPress={() => setShowToDatePicker(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={dateTo || new Date()}
              mode="date"
              display="inline"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setDateTo(selectedDate);
                }
                setShowToDatePicker(false);
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Type Filter Modal */}
      <Modal visible={showTypeModal} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-xl p-4 m-4 w-[80%]">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold">Filter Type</Text>
              <TouchableOpacity onPress={() => setShowTypeModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {(["all", "guide", "agent"] as FilterType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    setFilterType(type);
                    setSelectedPerson("");
                    setShowTypeModal(false);
                  }}
                  className="py-3 border-b border-gray-200"
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="text-base text-gray-900">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                    {filterType === type && (
                      <Ionicons name="checkmark" size={20} color="#3b82f6" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Person Filter Modal */}
      <Modal visible={showPersonModal} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-xl p-4 m-4 w-[80%] max-h-[70%]">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold">
                Select {filterType === "guide" ? "Guide" : "Agent"}
              </Text>
              <TouchableOpacity onPress={() => setShowPersonModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TouchableOpacity
                onPress={() => {
                  setSelectedPerson("");
                  setShowPersonModal(false);
                }}
                className="py-3 border-b border-gray-200"
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-base text-gray-900">
                    All {filterType}s
                  </Text>
                  {selectedPerson === "" && (
                    <Ionicons name="checkmark" size={20} color="#3b82f6" />
                  )}
                </View>
              </TouchableOpacity>
              {(filterType === "guide" ? guides : agents).map((person) => (
                <TouchableOpacity
                  key={person.id}
                  onPress={() => {
                    setSelectedPerson(person.id);
                    setShowPersonModal(false);
                  }}
                  className="py-3 border-b border-gray-200"
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="text-base text-gray-900">
                      {person.name}
                    </Text>
                    {selectedPerson === person.id && (
                      <Ionicons name="checkmark" size={20} color="#3b82f6" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
