import { useLocationContext } from "@/contexts/LocationContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/lib/supabase";
import {
  convertCurrency,
  formatCurrency,
  getAvailableCurrencies,
} from "@/utils/currency";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type FinancialSummary = {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  incomeTransactions: number;
  expenseTransactions: number;
};

type IncomeCategory = {
  type: string;
  amount: number;
  percentage: number;
  transactions: Array<{
    id: string;
    date: string;
    amount: number;
    description: string;
    account: string;
    currency: string;
  }>;
};

type ExpenseCategory = {
  type: string;
  subType?: string;
  amount: number;
  percentage: number;
  transactions: Array<{
    id: string;
    date: string;
    amount: number;
    description: string;
    account: string;
    currency: string;
  }>;
};

export default function EnhancedFinancialReportsMobile() {
  const { profile } = useUserProfile();
  const { getSelectedLocationData } = useLocationContext();
  const selectedLocationData = getSelectedLocationData?.();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    incomeTransactions: 0,
    expenseTransactions: 0,
  });
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>(
    []
  );
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(
    []
  );
  const [expandedIncome, setExpandedIncome] = useState<Set<string>>(new Set());
  const [expandedExpenses, setExpandedExpenses] = useState<Set<string>>(
    new Set()
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [baseCurrency, setBaseCurrency] = useState<string>("LKR");
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  useEffect(() => {
    if (profile?.tenant_id) {
      const loadInitialData = async () => {
        await Promise.all([fetchAvailableCurrencies(), fetchData()]);
      };
      loadInitialData();
    }
  }, [profile?.tenant_id]);

  useEffect(() => {
    if (profile?.tenant_id && selectedLocationData?.id) {
      fetchData();
    }
  }, [selectedLocationData?.id, profile?.tenant_id]);

  const fetchAvailableCurrencies = async () => {
    if (!profile?.tenant_id || !selectedLocationData?.id) return;

    try {
      const currencies = await getAvailableCurrencies(
        profile.tenant_id,
        selectedLocationData.id
      );
      setAvailableCurrencies(currencies);
      if (currencies.length > 0 && !currencies.includes(baseCurrency)) {
        setBaseCurrency(currencies.includes("LKR") ? "LKR" : currencies[0]);
      }
    } catch (error) {
      console.error("Error fetching available currencies:", error);
      setAvailableCurrencies(["LKR", "USD"]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchFinancialSummary(),
        fetchIncomeBreakdown(),
        fetchExpenseBreakdown(),
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialSummary = async () => {
    if (!profile?.tenant_id) return;

    try {
      let paymentsQuery = supabase
        .from("payments")
        .select("amount, currency, reservations!inner(tenant_id, location_id)")
        .eq("reservations.tenant_id", profile.tenant_id);

      let expenseQuery = supabase
        .from("expenses")
        .select("amount, currency, accounts(currency)")
        .eq("tenant_id", profile.tenant_id);

      if (selectedLocationData?.id) {
        paymentsQuery = paymentsQuery.eq(
          "reservations.location_id",
          selectedLocationData.id
        );
        expenseQuery = expenseQuery.eq("location_id", selectedLocationData.id);
      }

      if (dateFrom) {
        paymentsQuery = paymentsQuery.gte("created_at", dateFrom);
        expenseQuery = expenseQuery.gte("date", dateFrom);
      }
      if (dateTo) {
        paymentsQuery = paymentsQuery.lte("created_at", dateTo);
        expenseQuery = expenseQuery.lte("date", dateTo);
      }

      const [paymentsResult, expenseResult] = await Promise.all([
        paymentsQuery,
        expenseQuery,
      ]);

      let totalIncome = 0;
      let totalExpenses = 0;

      for (const payment of paymentsResult.data || []) {
        const convertedAmount = await convertCurrency(
          parseFloat(payment.amount.toString()),
          payment.currency as any,
          baseCurrency,
          profile.tenant_id,
          selectedLocationData?.id || ""
        );
        totalIncome += convertedAmount;
      }

      for (const expense of expenseResult.data || []) {
        const accountCurrency =
          (expense as any).accounts?.currency || expense.currency;
        const convertedAmount = await convertCurrency(
          parseFloat(expense.amount.toString()),
          accountCurrency as any,
          baseCurrency,
          profile.tenant_id,
          selectedLocationData?.id || ""
        );
        totalExpenses += convertedAmount;
      }

      const netProfit = totalIncome - totalExpenses;
      const profitMargin =
        totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

      setSummary({
        totalIncome,
        totalExpenses,
        netProfit,
        profitMargin,
        incomeTransactions: paymentsResult.data?.length || 0,
        expenseTransactions: expenseResult.data?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching financial summary:", error);
    }
  };

  const fetchIncomeBreakdown = async () => {
    if (!profile?.tenant_id) return;

    try {
      const basePaymentsSelect = `
        id, created_at, amount, currency, payment_type, notes,
        accounts(name),
        reservations!inner(guest_name, reservation_number, location_id, tenant_id)
      `;

      let paymentsQuery = supabase
        .from("payments")
        .select(basePaymentsSelect)
        .eq("reservations.tenant_id", profile.tenant_id);

      if (selectedLocationData?.id) {
        paymentsQuery = paymentsQuery.eq(
          "reservations.location_id",
          selectedLocationData.id
        );
      }

      if (dateFrom) paymentsQuery = paymentsQuery.gte("created_at", dateFrom);
      if (dateTo) paymentsQuery = paymentsQuery.lte("created_at", dateTo);

      const { data, error } = await paymentsQuery.order("created_at", {
        ascending: false,
      });
      if (error) throw error;

      const incomeMap = new Map<string, IncomeCategory>();
      let totalIncomeForPercentage = 0;

      for (const payment of data || []) {
        const convertedAmount = await convertCurrency(
          parseFloat(payment.amount.toString()),
          payment.currency as any,
          baseCurrency,
          profile.tenant_id,
          selectedLocationData?.id || ""
        );
        totalIncomeForPercentage += convertedAmount;

        const type = "Reservation Payments";
        if (!incomeMap.has(type)) {
          incomeMap.set(type, {
            type,
            amount: 0,
            percentage: 0,
            transactions: [],
          });
        }

        const category = incomeMap.get(type)!;
        category.amount += convertedAmount;
        category.transactions.push({
          id: payment.id,
          date: payment.created_at,
          amount: convertedAmount,
          description: `${payment.payment_type} - ${
            (payment as any).reservations?.guest_name
          } (${(payment as any).reservations?.reservation_number})${
            payment.notes ? ` - ${payment.notes}` : ""
          }`,
          account: (payment as any).accounts?.name || "Unknown",
          currency: baseCurrency,
        });
      }

      const categories = Array.from(incomeMap.values())
        .map((cat) => ({
          ...cat,
          percentage:
            totalIncomeForPercentage > 0
              ? (cat.amount / totalIncomeForPercentage) * 100
              : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      setIncomeCategories(categories);
    } catch (error) {
      console.error("Error fetching income breakdown:", error);
    }
  };

  const fetchExpenseBreakdown = async () => {
    if (!profile?.tenant_id) return;

    try {
      let query = supabase
        .from("expenses")
        .select(
          `
          id, date, amount, main_type, sub_type, note, currency,
          accounts!inner(name, currency, tenant_id)
        `
        )
        .eq("accounts.tenant_id", profile.tenant_id);

      if (selectedLocationData?.id) {
        query = query.eq("location_id", selectedLocationData.id);
      }
      if (dateFrom) query = query.gte("date", dateFrom);
      if (dateTo) query = query.lte("date", dateTo);

      const { data, error } = await query.order("date", { ascending: false });
      if (error) throw error;

      const expenseMap = new Map<string, ExpenseCategory>();
      let totalExpenseForPercentage = 0;

      for (const expense of data || []) {
        const accountCurrency =
          (expense as any).accounts?.currency || expense.currency;
        const convertedAmount = await convertCurrency(
          parseFloat(expense.amount.toString()),
          accountCurrency as any,
          baseCurrency,
          profile.tenant_id,
          selectedLocationData?.id || ""
        );
        totalExpenseForPercentage += convertedAmount;

        const type = expense.main_type || "Other";
        if (!expenseMap.has(type)) {
          expenseMap.set(type, {
            type,
            amount: 0,
            percentage: 0,
            transactions: [],
          });
        }

        const category = expenseMap.get(type)!;
        category.amount += convertedAmount;
        category.transactions.push({
          id: expense.id,
          date: expense.date,
          amount: convertedAmount,
          description: `${expense.main_type} - ${expense.sub_type}${
            expense.note ? ` (${expense.note})` : ""
          }`,
          account: (expense as any).accounts?.name || "Unknown",
          currency: baseCurrency,
        });
      }

      const categories = Array.from(expenseMap.values())
        .map((cat) => ({
          ...cat,
          percentage:
            totalExpenseForPercentage > 0
              ? (cat.amount / totalExpenseForPercentage) * 100
              : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      setExpenseCategories(categories);
    } catch (error) {
      console.error("Error fetching expense breakdown:", error);
    }
  };

  const toggleIncomeExpansion = (type: string) => {
    const newExpanded = new Set(expandedIncome);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedIncome(newExpanded);
  };

  const toggleExpenseExpansion = (type: string) => {
    const newExpanded = new Set(expandedExpenses);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedExpenses(newExpanded);
  };

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
    <ScrollView className="flex-1 bg-gray-50">
      {/* Filters: Currency and Date Range */}
      <View className="bg-white p-3 mx-4 mt-3 rounded-lg border border-gray-200">
        <View className="flex-row items-center gap-2 mb-2">
          {/* Currency Selector */}
          <View className="flex-1">
            <Text className="text-xs text-gray-600 mb-1">Currency</Text>
            <TouchableOpacity
              onPress={() => setShowCurrencyDropdown(true)}
              className="border border-gray-300 rounded-lg bg-gray-50 px-3 py-2 flex-row items-center justify-between"
            >
              <Text className="text-sm">{baseCurrency}</Text>
              <Ionicons name="chevron-down" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* From Date */}
          <View className="flex-1">
            <Text className="text-xs text-gray-600 mb-1">From</Text>
            <TouchableOpacity
              onPress={() => setShowFromDatePicker(true)}
              className="border border-gray-300 rounded-lg bg-gray-50 px-3 py-2 flex-row items-center justify-between"
            >
              <Text className="text-sm">
                {dateFrom
                  ? new Date(dateFrom).toLocaleDateString()
                  : "Select"}
              </Text>
              <Ionicons name="calendar" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* To Date */}
          <View className="flex-1">
            <Text className="text-xs text-gray-600 mb-1">To</Text>
            <TouchableOpacity
              onPress={() => setShowToDatePicker(true)}
              className="border border-gray-300 rounded-lg bg-gray-50 px-3 py-2 flex-row items-center justify-between"
            >
              <Text className="text-sm">
                {dateTo ? new Date(dateTo).toLocaleDateString() : "Select"}
              </Text>
              <Ionicons name="calendar" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Summary Cards - New Layout */}
      <View className="px-4 py-3 flex-row gap-3">
        {/* Left Column: Total Income + Total Expenses */}
        <View className="flex-1 gap-3">
          {/* Total Income */}
          <View className="bg-green-50 border border-green-200 rounded-lg p-4">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-xs font-medium text-green-600">
                  Total Income
                </Text>
                <Text className="text-xl font-bold text-green-900 mt-1">
                  {formatCurrency(summary.totalIncome, baseCurrency)}
                </Text>
                <Text className="text-xs text-green-600 mt-1">
                  {summary.incomeTransactions} transactions
                </Text>
              </View>
              <Ionicons name="trending-up" size={32} color="#10b981" />
            </View>
          </View>

          {/* Total Expenses */}
          <View className="bg-red-50 border border-red-200 rounded-lg p-4">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-xs font-medium text-red-600">
                  Total Expenses
                </Text>
                <Text className="text-xl font-bold text-red-900 mt-1">
                  {formatCurrency(summary.totalExpenses, baseCurrency)}
                </Text>
                <Text className="text-xs text-red-600 mt-1">
                  {summary.expenseTransactions} transactions
                </Text>
              </View>
              <Ionicons name="trending-down" size={32} color="#ef4444" />
            </View>
          </View>
        </View>

        {/* Right Column: Net Profit (Full Height) */}
        <View className="flex-1">
          <View
            className={`${
              summary.netProfit >= 0
                ? "bg-blue-50 border-blue-200"
                : "bg-red-50 border-red-200"
            } border rounded-lg p-4 h-full justify-center`}
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text
                  className={`text-xs font-medium ${
                    summary.netProfit >= 0 ? "text-blue-600" : "text-red-600"
                  }`}
                >
                  Net Profit
                </Text>
                <Text
                  className={`text-xl font-bold mt-1 ${
                    summary.netProfit >= 0 ? "text-blue-900" : "text-red-900"
                  }`}
                >
                  {formatCurrency(summary.netProfit, baseCurrency)}
                </Text>
                <Text
                  className={`text-xs mt-1 ${
                    summary.netProfit >= 0 ? "text-blue-600" : "text-red-600"
                  }`}
                >
                  {summary.profitMargin.toFixed(1)}% profit margin
                </Text>
              </View>
              <Ionicons
                name="cash"
                size={32}
                color={summary.netProfit >= 0 ? "#3b82f6" : "#ef4444"}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Income Breakdown */}
      <View className="bg-white mx-4 mb-3 rounded-lg border border-gray-200 p-3">
        <View className="flex-row items-center mb-3">
          <Ionicons name="trending-up" size={20} color="#10b981" />
          <Text className="text-base font-semibold text-green-600 ml-2">
            Income Breakdown
          </Text>
          <Text className="text-sm font-bold text-green-600 ml-auto">
            {formatCurrency(summary.totalIncome, baseCurrency)}
          </Text>
        </View>
        {incomeCategories.length === 0 ? (
          <Text className="text-center text-gray-500 py-8">No income data</Text>
        ) : (
          incomeCategories.map((category) => (
            <View key={category.type} className="mb-2">
              <TouchableOpacity
                onPress={() => toggleIncomeExpansion(category.type)}
                className="border border-gray-200 rounded-lg p-3"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <Ionicons
                      name={
                        expandedIncome.has(category.type)
                          ? "chevron-down"
                          : "chevron-forward"
                      }
                      size={16}
                      color="#6b7280"
                    />
                    <View className="ml-2 flex-1">
                      <Text className="text-sm font-semibold">
                        {category.type}
                      </Text>
                      <Text className="text-xs text-gray-600">
                        {category.percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm font-bold">
                    {formatCurrency(category.amount, baseCurrency)}
                  </Text>
                </View>
              </TouchableOpacity>
              {expandedIncome.has(category.type) && (
                <View className="ml-6 mt-2">
                  {category.transactions.slice(0, 10).map((txn) => (
                    <View
                      key={txn.id}
                      className="bg-gray-50 p-2 mb-1 rounded border-l-2 border-l-green-200"
                    >
                      <View className="flex-row justify-between">
                        <View className="flex-1">
                          <Text className="text-xs font-medium">
                            {new Date(txn.date).toLocaleDateString()} -{" "}
                            {txn.account}
                          </Text>
                          <Text
                            className="text-xs text-gray-600"
                            numberOfLines={2}
                          >
                            {txn.description}
                          </Text>
                        </View>
                        <Text className="text-xs font-semibold text-green-600 ml-2">
                          {formatCurrency(txn.amount, baseCurrency)}
                        </Text>
                      </View>
                    </View>
                  ))}
                  {category.transactions.length > 10 && (
                    <Text className="text-xs text-gray-500 text-center py-2">
                      +{category.transactions.length - 10} more transactions
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </View>

      {/* Expense Breakdown */}
      <View className="bg-white mx-4 mb-3 rounded-lg border border-gray-200 p-3">
        <View className="flex-row items-center mb-3">
          <Ionicons name="trending-down" size={20} color="#ef4444" />
          <Text className="text-base font-semibold text-red-600 ml-2">
            Expense Breakdown
          </Text>
          <Text className="text-sm font-bold text-red-600 ml-auto">
            {formatCurrency(summary.totalExpenses, baseCurrency)}
          </Text>
        </View>
        {expenseCategories.length === 0 ? (
          <Text className="text-center text-gray-500 py-8">
            No expense data
          </Text>
        ) : (
          expenseCategories.map((category) => (
            <View key={category.type} className="mb-2">
              <TouchableOpacity
                onPress={() => toggleExpenseExpansion(category.type)}
                className="border border-gray-200 rounded-lg p-3"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <Ionicons
                      name={
                        expandedExpenses.has(category.type)
                          ? "chevron-down"
                          : "chevron-forward"
                      }
                      size={16}
                      color="#6b7280"
                    />
                    <View className="ml-2 flex-1">
                      <Text className="text-sm font-semibold">
                        {category.type}
                      </Text>
                      <Text className="text-xs text-gray-600">
                        {category.percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm font-bold">
                    {formatCurrency(category.amount, baseCurrency)}
                  </Text>
                </View>
              </TouchableOpacity>
              {expandedExpenses.has(category.type) && (
                <View className="ml-6 mt-2">
                  {category.transactions.slice(0, 10).map((txn) => (
                    <View
                      key={txn.id}
                      className="bg-gray-50 p-2 mb-1 rounded border-l-2 border-l-red-200"
                    >
                      <View className="flex-row justify-between">
                        <View className="flex-1">
                          <Text className="text-xs font-medium">
                            {new Date(txn.date).toLocaleDateString()} -{" "}
                            {txn.account}
                          </Text>
                          <Text
                            className="text-xs text-gray-600"
                            numberOfLines={2}
                          >
                            {txn.description}
                          </Text>
                        </View>
                        <Text className="text-xs font-semibold text-red-600 ml-2">
                          {formatCurrency(txn.amount, baseCurrency)}
                        </Text>
                      </View>
                    </View>
                  ))}
                  {category.transactions.length > 10 && (
                    <Text className="text-xs text-gray-500 text-center py-2">
                      +{category.transactions.length - 10} more transactions
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </View>

      {/* Currency Dropdown Modal */}
      <Modal
        visible={showCurrencyDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCurrencyDropdown(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowCurrencyDropdown(false)}
          className="flex-1 bg-black/50 justify-center items-center"
        >
          <View className="bg-white rounded-lg mx-8 max-h-96 w-64">
            <View className="border-b border-gray-200 p-3">
              <Text className="text-sm font-semibold">Select Currency</Text>
            </View>
            <ScrollView className="max-h-80">
              {availableCurrencies.map((currency) => (
                <TouchableOpacity
                  key={currency}
                  onPress={() => {
                    setBaseCurrency(currency);
                    setShowCurrencyDropdown(false);
                    fetchData();
                  }}
                  className={`p-3 border-b border-gray-100 flex-row items-center justify-between ${
                    baseCurrency === currency ? "bg-blue-50" : ""
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      baseCurrency === currency
                        ? "font-semibold text-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    {currency}
                  </Text>
                  {baseCurrency === currency && (
                    <Ionicons name="checkmark" size={20} color="#2563eb" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* From Date Picker */}
      {showFromDatePicker && (
        <Modal
          visible={showFromDatePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowFromDatePicker(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center">
            <View className="bg-white rounded-lg p-4 mx-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-base font-semibold">Select From Date</Text>
                <TouchableOpacity onPress={() => setShowFromDatePicker(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={dateFrom ? new Date(dateFrom) : new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "calendar"}
                onChange={(event, selectedDate) => {
                  if (event.type === "set" && selectedDate) {
                    setDateFrom(selectedDate.toISOString().split("T")[0]);
                    setShowFromDatePicker(false);
                    fetchData();
                  } else if (event.type === "dismissed") {
                    setShowFromDatePicker(false);
                  }
                }}
              />
              {dateFrom && (
                <TouchableOpacity
                  onPress={() => {
                    setDateFrom("");
                    setShowFromDatePicker(false);
                    fetchData();
                  }}
                  className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 flex-row items-center justify-center"
                >
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                  <Text className="text-sm font-medium text-red-600 ml-2">
                    Clear Date
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}

      {/* To Date Picker */}
      {showToDatePicker && (
        <Modal
          visible={showToDatePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowToDatePicker(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center">
            <View className="bg-white rounded-lg p-4 mx-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-base font-semibold">Select To Date</Text>
                <TouchableOpacity onPress={() => setShowToDatePicker(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={dateTo ? new Date(dateTo) : new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "calendar"}
                onChange={(event, selectedDate) => {
                  if (event.type === "set" && selectedDate) {
                    setDateTo(selectedDate.toISOString().split("T")[0]);
                    setShowToDatePicker(false);
                    fetchData();
                  } else if (event.type === "dismissed") {
                    setShowToDatePicker(false);
                  }
                }}
              />
              {dateTo && (
                <TouchableOpacity
                  onPress={() => {
                    setDateTo("");
                    setShowToDatePicker(false);
                    fetchData();
                  }}
                  className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 flex-row items-center justify-center"
                >
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                  <Text className="text-sm font-medium text-red-600 ml-2">
                    Clear Date
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}
