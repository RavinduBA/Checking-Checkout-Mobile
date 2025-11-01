import { useUserProfile } from "@/hooks/useUserProfile";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  View,
} from "react-native";
import { AccountDetails } from "./comprehensive/AccountDetails";
import { FinancialSummaryCards } from "./comprehensive/FinancialSummaryCards";
import { ReportFilters } from "./comprehensive/ReportFilters";

export default function ComprehensiveReportsMobile() {
  const { profile } = useUserProfile();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [baseCurrency, setBaseCurrency] = useState<string>("LKR");
  const handleExport = () => {
    Alert.alert("Export", "Export functionality will be implemented soon");
  };
  const handleRefresh = () => {
    Alert.alert("Refresh", "Data refreshed successfully");
  };
  if (!profile?.tenant_id) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-sm text-gray-600 mt-4">
          Loading comprehensive reports...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Filters */}
      <ReportFilters
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        baseCurrency={baseCurrency}
        setBaseCurrency={setBaseCurrency}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      {/* Financial Summary */}
      <FinancialSummaryCards
        baseCurrency={baseCurrency}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />

      {/* Account Details */}
      <AccountDetails
        baseCurrency={baseCurrency}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />
    </ScrollView>
  );
}
