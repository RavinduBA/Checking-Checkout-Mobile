import { useLocationContext } from "@/contexts/LocationContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/lib/supabase";
import { convertCurrency, formatCurrency } from "@/utils/currency";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

type FinancialSummary = {
  totalExpenses: number;
  totalPayments: number;
  netProfit: number;
  profitMargin: number;
  totalTransactions: number;
};

interface FinancialSummaryCardsProps {
  baseCurrency: string;
  dateFrom?: string;
  dateTo?: string;
}

export function FinancialSummaryCards({
  baseCurrency,
  dateFrom,
  dateTo,
}: FinancialSummaryCardsProps) {
  const { profile } = useUserProfile();
  const { getSelectedLocationData } = useLocationContext();
  const selectedLocationData = getSelectedLocationData();

  const [summary, setSummary] = useState<FinancialSummary>({
    totalExpenses: 0,
    totalPayments: 0,
    netProfit: 0,
    profitMargin: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchFinancialSummary = useCallback(async () => {
    if (!profile?.tenant_id) return;

    setLoading(true);
    try {
      // Fetch all accounts for this tenant
      const { data: accountsData, error: accountsError } = await supabase
        .from("accounts")
        .select("*")
        .eq("tenant_id", profile.tenant_id);

      if (accountsError) throw accountsError;

      let totalExpenses = 0;
      let totalPayments = 0;
      let totalTransactions = 0;

      for (const account of accountsData || []) {
        // Fetch expenses for this account
        let expensesQuery = supabase
          .from("expenses")
          .select("amount, currency")
          .eq("account_id", account.id);

        if (selectedLocationData?.id) {
          expensesQuery = expensesQuery.eq(
            "location_id",
            selectedLocationData.id
          );
        }
        if (dateFrom) {
          expensesQuery = expensesQuery.gte("date", dateFrom);
        }
        if (dateTo) {
          expensesQuery = expensesQuery.lte("date", dateTo);
        }

        // Fetch payments for this account
        let paymentsQuery = supabase
          .from("payments")
          .select("amount, currency, reservations!inner(tenant_id)")
          .eq("account_id", account.id)
          .eq("reservations.tenant_id", profile.tenant_id);

        if (selectedLocationData?.id) {
          paymentsQuery = paymentsQuery.eq(
            "reservations.location_id",
            selectedLocationData.id
          );
        }
        if (dateFrom) {
          paymentsQuery = paymentsQuery.gte("created_at", dateFrom);
        }
        if (dateTo) {
          paymentsQuery = paymentsQuery.lte("created_at", dateTo);
        }

        const [expensesResult, paymentsResult] = await Promise.all([
          expensesQuery,
          paymentsQuery,
        ]);

        if (expensesResult.error) throw expensesResult.error;
        if (paymentsResult.error) throw paymentsResult.error;

        // Convert and sum expenses
        for (const expense of expensesResult.data || []) {
          const convertedAmount = await convertCurrency(
            parseFloat(expense.amount.toString()),
            expense.currency,
            baseCurrency,
            profile.tenant_id,
            selectedLocationData?.id || ""
          );
          totalExpenses += convertedAmount;
          totalTransactions++;
        }

        // Convert and sum payments
        for (const payment of paymentsResult.data || []) {
          const convertedAmount = await convertCurrency(
            parseFloat(payment.amount.toString()),
            payment.currency,
            baseCurrency,
            profile.tenant_id,
            selectedLocationData?.id || ""
          );
          totalPayments += convertedAmount;
          totalTransactions++;
        }
      }

      const netProfit = totalPayments - totalExpenses;
      const profitMargin =
        totalPayments > 0 ? (netProfit / totalPayments) * 100 : 0;

      setSummary({
        totalExpenses,
        totalPayments,
        netProfit,
        profitMargin,
        totalTransactions,
      });
    } catch (error) {
      console.error("Error fetching financial summary:", error);
    } finally {
      setLoading(false);
    }
  }, [profile?.tenant_id, selectedLocationData?.id, dateFrom, dateTo]);

  useEffect(() => {
    if (profile?.tenant_id) {
      fetchFinancialSummary();
    }
  }, [fetchFinancialSummary, profile?.tenant_id]);

  if (loading) {
    return (
      <View className="flex-row flex-wrap justify-between px-4 py-2">
        {[...Array(4)].map((_, i) => (
          <View key={i} className="w-[48%] bg-gray-100 rounded-lg p-4 mb-3">
            <ActivityIndicator size="small" color="#6b7280" />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap justify-between px-4 py-2">
      {/* Total Income Card */}
      <View className="w-[48%] bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xs font-medium text-green-600 mb-1">
              Total Income
            </Text>
            <Text className="text-base font-bold text-green-900">
              {formatCurrency(summary.totalPayments, baseCurrency)}
            </Text>
          </View>
          <Ionicons name="trending-up" size={20} color="#059669" />
        </View>
      </View>

      {/* Reservation Payments Card */}
      <View className="w-[48%] bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xs font-medium text-blue-600 mb-1">
              Payments
            </Text>
            <Text className="text-base font-bold text-blue-900">
              {formatCurrency(summary.totalPayments, baseCurrency)}
            </Text>
          </View>
          <Ionicons name="card" size={20} color="#2563eb" />
        </View>
      </View>

      {/* Total Expenses Card */}
      <View className="w-[48%] bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xs font-medium text-red-600 mb-1">
              Total Expenses
            </Text>
            <Text className="text-base font-bold text-red-900">
              {formatCurrency(summary.totalExpenses, baseCurrency)}
            </Text>
          </View>
          <Ionicons name="trending-down" size={20} color="#dc2626" />
        </View>
      </View>

      {/* Net Profit Card */}
      <View
        className={`w-[48%] rounded-lg p-3 mb-3 border ${
          summary.netProfit >= 0
            ? "bg-emerald-50 border-emerald-200"
            : "bg-red-50 border-red-200"
        }`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text
              className={`text-xs font-medium mb-1 ${
                summary.netProfit >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              Net Profit
            </Text>
            <Text
              className={`text-base font-bold ${
                summary.netProfit >= 0 ? "text-emerald-900" : "text-red-900"
              }`}
            >
              {formatCurrency(summary.netProfit, baseCurrency)}
            </Text>
            <Text
              className={`text-xs ${
                summary.netProfit >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {summary.profitMargin.toFixed(1)}% margin
            </Text>
          </View>
          <Ionicons
            name={summary.netProfit >= 0 ? "analytics" : "alert-circle"}
            size={20}
            color={summary.netProfit >= 0 ? "#059669" : "#dc2626"}
          />
        </View>
      </View>
    </View>
  );
}
