import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/lib/supabase";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
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
  const [refreshKey, setRefreshKey] = useState(0);

  const exportToCSV = async () => {
    if (!profile?.tenant_id) return;

    try {
      Alert.alert("Exporting", "Generating report data...");

      // Fetch accounts data for export
      const { data: accountsData, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("tenant_id", profile.tenant_id)
        .order("name");

      if (error) throw error;

      // Generate CSV content
      const csvContent = [
        [
          "Account",
          "Currency",
          "Initial Balance",
          "Current Balance",
          "Total Expenses",
          "Total Payments",
          "Net Change",
        ],
        ...accountsData.map((acc: any) => [
          acc.name,
          acc.currency,
          acc.initial_balance,
          acc.current_balance,
          0, // Will be calculated in real implementation
          0, // Will be calculated in real implementation
          acc.current_balance - acc.initial_balance,
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      // Share the CSV content as text
      const fileName = `comprehensive-financial-report-${
        new Date().toISOString().split("T")[0]
      }.csv`;

      await Share.share({
        message: csvContent,
        title: fileName,
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      Alert.alert("Error", "Failed to export report. Please try again.");
    }
  };

  const handleRefresh = () => {
    // Force re-render of child components by updating refresh key
    setRefreshKey((prev) => prev + 1);
    Alert.alert("Success", "Data refreshed successfully");
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
        onExport={exportToCSV}
      />

      {/* Financial Summary */}
      <FinancialSummaryCards
        key={`summary-${refreshKey}`}
        baseCurrency={baseCurrency}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />

      {/* Account Details */}
      <AccountDetails
        key={`details-${refreshKey}`}
        baseCurrency={baseCurrency}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />
    </ScrollView>
  );
}
