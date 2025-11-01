import { useLocationContext } from "@/contexts/LocationContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/utils/currency";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type TransactionDetail = {
  id: string;
  date: string;
  type: "expense" | "payment" | "transfer_in" | "transfer_out";
  description: string;
  amount: number;
  running_balance: number;
  currency: string;
  note?: string;
};

type AccountBalance = {
  id: string;
  name: string;
  currency: string;
  initial_balance: number;
  current_balance: number;
  total_expenses: number;
  total_payments: number;
  transaction_count: number;
  transactions: TransactionDetail[];
};

interface AccountDetailsProps {
  baseCurrency: string;
  dateFrom?: string;
  dateTo?: string;
}

export function AccountDetails({
  baseCurrency,
  dateFrom,
  dateTo,
}: AccountDetailsProps) {
  const { profile } = useUserProfile();
  const { getSelectedLocationData } = useLocationContext();
  const selectedLocationData = getSelectedLocationData();

  const [accounts, setAccounts] = useState<AccountBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(
    new Set()
  );

  const calculateAccountBalance = useCallback(
    async (account: any): Promise<AccountBalance> => {
      if (!profile?.tenant_id) {
        throw new Error("Tenant not found");
      }

      try {
        let expenseQuery = supabase
          .from("expenses")
          .select("id, date, amount, main_type, sub_type, note, currency")
          .eq("account_id", account.id);

        let paymentsQuery = supabase
          .from("payments")
          .select(
            "id, created_at, amount, payment_type, notes, currency, reservations!inner(guest_name, reservation_number, tenant_id)"
          )
          .eq("account_id", account.id)
          .eq("reservations.tenant_id", profile.tenant_id);

        let transfersFromQuery = supabase
          .from("account_transfers")
          .select(
            "id, created_at, amount, note, accounts!to_account_id(tenant_id)"
          )
          .eq("from_account_id", account.id)
          .eq("accounts.tenant_id", profile.tenant_id);

        let transfersToQuery = supabase
          .from("account_transfers")
          .select(
            "id, created_at, amount, conversion_rate, note, accounts!from_account_id(tenant_id)"
          )
          .eq("to_account_id", account.id)
          .eq("accounts.tenant_id", profile.tenant_id);

        // Apply location filters
        if (selectedLocationData?.id) {
          expenseQuery = expenseQuery.eq(
            "location_id",
            selectedLocationData.id
          );
          paymentsQuery = paymentsQuery.eq(
            "reservations.location_id",
            selectedLocationData.id
          );
        }

        // Apply date filters
        if (dateFrom) {
          expenseQuery = expenseQuery.gte("date", dateFrom);
          paymentsQuery = paymentsQuery.gte("created_at", dateFrom);
          transfersFromQuery = transfersFromQuery.gte("created_at", dateFrom);
          transfersToQuery = transfersToQuery.gte("created_at", dateFrom);
        }
        if (dateTo) {
          expenseQuery = expenseQuery.lte("date", dateTo);
          paymentsQuery = paymentsQuery.lte("created_at", dateTo);
          transfersFromQuery = transfersFromQuery.lte("created_at", dateTo);
          transfersToQuery = transfersToQuery.lte("created_at", dateTo);
        }

        // Execute all queries
        const [
          expenseResult,
          paymentsResult,
          transfersFromResult,
          transfersToResult,
        ] = await Promise.all([
          expenseQuery.order("date", { ascending: true }),
          paymentsQuery.order("created_at", { ascending: true }),
          transfersFromQuery.order("created_at", { ascending: true }),
          transfersToQuery.order("created_at", { ascending: true }),
        ]);

        // Process transactions and calculate balances
        const transactions: TransactionDetail[] = [];
        let runningBalance = account.initial_balance;
        let totalExpenses = 0;
        let totalPayments = 0;

        // Combine all transactions
        const allTransactions: Array<{
          id: string;
          date: string;
          type: TransactionDetail["type"];
          amount: number;
          description: string;
          currency: string;
          note?: string;
        }> = [];

        // Add expense transactions
        for (const expense of expenseResult.data || []) {
          allTransactions.push({
            id: expense.id,
            date: expense.date,
            type: "expense",
            amount: parseFloat(expense.amount.toString()),
            description: `${expense.main_type} - ${expense.sub_type}`,
            currency: expense.currency,
            note: expense.note,
          });
          totalExpenses += parseFloat(expense.amount.toString());
        }

        // Add payment transactions
        for (const payment of paymentsResult.data || []) {
          allTransactions.push({
            id: payment.id,
            date: payment.created_at,
            type: "payment",
            amount: parseFloat(payment.amount.toString()),
            description: `${payment.payment_type} - ${
              (payment as any).reservations?.guest_name || "Unknown"
            } (${(payment as any).reservations?.reservation_number || "N/A"})`,
            currency: payment.currency,
            note: payment.notes,
          });
          totalPayments += parseFloat(payment.amount.toString());
        }

        // Add transfer transactions
        for (const transfer of transfersFromResult.data || []) {
          allTransactions.push({
            id: transfer.id,
            date: transfer.created_at,
            type: "transfer_out",
            amount: parseFloat(transfer.amount.toString()),
            description: `Transfer Out${
              transfer.note ? ` - ${transfer.note}` : ""
            }`,
            currency: account.currency,
            note: transfer.note,
          });
        }

        for (const transfer of transfersToResult.data || []) {
          const amount =
            parseFloat(transfer.amount.toString()) *
            parseFloat(transfer.conversion_rate.toString());
          allTransactions.push({
            id: transfer.id,
            date: transfer.created_at,
            type: "transfer_in",
            amount: amount,
            description: `Transfer In${
              transfer.note ? ` - ${transfer.note}` : ""
            }`,
            currency: account.currency,
            note: transfer.note,
          });
        }

        // Sort by date and calculate running balances
        allTransactions.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        for (const txn of allTransactions) {
          if (txn.type === "payment" || txn.type === "transfer_in") {
            runningBalance += txn.amount;
          } else {
            runningBalance -= txn.amount;
          }

          transactions.push({
            ...txn,
            running_balance: runningBalance,
          });
        }

        return {
          id: account.id,
          name: account.name,
          currency: account.currency,
          initial_balance: account.initial_balance,
          current_balance: runningBalance,
          total_expenses: totalExpenses,
          total_payments: totalPayments,
          transaction_count: transactions.length,
          transactions: transactions.reverse(), // Show most recent first
        };
      } catch (error) {
        console.error(
          `Error calculating balance for account ${account.name}:`,
          error
        );
        return {
          id: account.id,
          name: account.name,
          currency: account.currency,
          initial_balance: account.initial_balance,
          current_balance: account.current_balance,
          total_expenses: 0,
          total_payments: 0,
          transaction_count: 0,
          transactions: [],
        };
      }
    },
    [profile?.tenant_id, selectedLocationData?.id, dateFrom, dateTo]
  );

  const fetchAccountsData = useCallback(async () => {
    if (!profile?.tenant_id) return;

    setLoading(true);
    try {
      // Fetch all accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from("accounts")
        .select("*")
        .eq("tenant_id", profile.tenant_id)
        .order("name");

      if (accountsError) throw accountsError;

      const accountBalances: AccountBalance[] = [];
      for (const account of accountsData || []) {
        const balance = await calculateAccountBalance(account);
        accountBalances.push(balance);
      }

      setAccounts(accountBalances);
    } catch (error) {
      console.error("Error fetching accounts data:", error);
    } finally {
      setLoading(false);
    }
  }, [profile?.tenant_id, calculateAccountBalance]);

  const toggleAccountExpansion = (accountId: string) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedAccounts(newExpanded);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "income":
      case "payment":
      case "transfer_in":
        return <Ionicons name="arrow-up-circle" size={16} color="#059669" />;
      case "expense":
      case "transfer_out":
        return <Ionicons name="arrow-down-circle" size={16} color="#dc2626" />;
      default:
        return <Ionicons name="cash" size={16} color="#6b7280" />;
    }
  };

  useEffect(() => {
    fetchAccountsData();
  }, [fetchAccountsData]);

  if (loading) {
    return (
      <View className="bg-white rounded-lg p-4 mx-4 mb-4">
        <View className="flex-row items-center mb-3">
          <Ionicons name="business" size={20} color="#1f2937" />
          <Text className="text-base font-semibold ml-2">Account Details</Text>
        </View>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="bg-white rounded-lg p-4 mx-4 mb-4">
      <View className="flex-row items-center mb-3">
        <Ionicons name="business" size={20} color="#1f2937" />
        <Text className="text-base font-semibold ml-2">Account Details</Text>
      </View>
      <Text className="text-xs text-gray-500 mb-4">
        Detailed breakdown of account balances and transactions
      </Text>

      <View className="space-y-3">
        {accounts.map((account) => (
          <View
            key={account.id}
            className="border-l-4 border-l-blue-500 bg-gray-50 rounded-lg overflow-hidden"
          >
            <TouchableOpacity
              onPress={() => toggleAccountExpansion(account.id)}
              className="p-3"
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-sm font-semibold">
                      {account.name}
                    </Text>
                    {expandedAccounts.has(account.id) ? (
                      <Ionicons
                        name="chevron-down"
                        size={16}
                        color="#6b7280"
                        style={{ marginLeft: 4 }}
                      />
                    ) : (
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="#6b7280"
                        style={{ marginLeft: 4 }}
                      />
                    )}
                  </View>
                  <View className="flex-row items-center gap-2">
                    <View className="bg-white px-2 py-1 rounded border border-gray-300">
                      <Text className="text-xs">{account.currency}</Text>
                    </View>
                    <Text className="text-xs text-gray-500">
                      {account.transaction_count} transactions
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-base font-bold">
                    {formatCurrency(account.current_balance, account.currency)}
                  </Text>
                  <View className="flex-row gap-2 mt-1">
                    <Text className="text-xs text-green-600">
                      +
                      {formatCurrency(account.total_payments, account.currency)}
                    </Text>
                    <Text className="text-xs text-red-600">
                      -
                      {formatCurrency(account.total_expenses, account.currency)}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {expandedAccounts.has(account.id) && (
              <View className="bg-white p-2 border-t border-gray-200">
                <ScrollView className="max-h-80">
                  {account.transactions.length === 0 ? (
                    <Text className="text-center text-gray-500 py-6">
                      No transactions found
                    </Text>
                  ) : (
                    account.transactions.map((txn, index) => (
                      <View
                        key={`${txn.id}-${index}`}
                        className="flex-row items-center justify-between p-2 border border-gray-200 rounded-lg mb-2"
                      >
                        <View className="flex-row items-start flex-1">
                          <View className="mr-2 mt-1">
                            {getTransactionIcon(txn.type)}
                          </View>
                          <View className="flex-1">
                            <Text className="text-xs font-medium">
                              {txn.description}
                            </Text>
                            <Text className="text-xs text-gray-500">
                              {new Date(txn.date).toLocaleDateString()}
                              {txn.note && ` • ${txn.note}`}
                            </Text>
                          </View>
                        </View>
                        <View className="items-end ml-2">
                          <Text
                            className={`text-xs font-semibold ${
                              txn.type === "payment" ||
                              txn.type === "transfer_in"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {txn.type === "payment" ||
                            txn.type === "transfer_in"
                              ? "+"
                              : "-"}
                            {formatCurrency(txn.amount, txn.currency)}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            Bal:{" "}
                            {formatCurrency(txn.running_balance, txn.currency)}
                          </Text>
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
