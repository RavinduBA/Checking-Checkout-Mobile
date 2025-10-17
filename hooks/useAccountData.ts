import { useCallback, useState } from "react";
import { Database } from "../integrations/supabase/types";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import { useLocationContext } from "../contexts/LocationContext";
import { useTenant } from "./useTenant";

type CurrencyType = Database["public"]["Enums"]["currency_type"];

interface Account {
  id: string;
  name: string;
  account_type: string;
  currency: string;
  balance: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

interface AccountData {
  accounts: Account[];
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
}

export function useAccountData(currency: CurrencyType = "USD") {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { selectedLocation } = useLocationContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccountDetails = useCallback(async (): Promise<AccountData | null> => {
    if (!tenant?.id || !selectedLocation) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch accounts for the current tenant and location
      const { data: accounts, error: accountsError } = await supabase
        .from("accounts")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("location_id", selectedLocation)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (accountsError) throw accountsError;

      // Calculate totals
      const totalBalance = accounts?.reduce((sum, account) => {
        // Convert balance to target currency if needed
        let balance = account.balance || 0;
        if (account.currency !== currency) {
          // Simple conversion for mobile (replace with real conversion logic)
          if (account.currency === "LKR" && currency === "USD") {
            balance = balance / 300;
          } else if (account.currency === "USD" && currency === "LKR") {
            balance = balance * 300;
          }
        }
        return sum + balance;
      }, 0) || 0;

      // Fetch income totals for this location
      const { data: incomeData, error: incomeError } = await supabase
        .from("income")
        .select("amount, currency")
        .eq("tenant_id", tenant.id)
        .eq("location_id", selectedLocation);

      if (incomeError) throw incomeError;

      const totalIncome = incomeData?.reduce((sum, income) => {
        let amount = income.amount || 0;
        if (income.currency !== currency) {
          if (income.currency === "LKR" && currency === "USD") {
            amount = amount / 300;
          } else if (income.currency === "USD" && currency === "LKR") {
            amount = amount * 300;
          }
        }
        return sum + amount;
      }, 0) || 0;

      // Fetch expense totals for this location
      const { data: expenseData, error: expenseError } = await supabase
        .from("expenses")
        .select("amount, currency")
        .eq("tenant_id", tenant.id)
        .eq("location_id", selectedLocation);

      if (expenseError) throw expenseError;

      const totalExpenses = expenseData?.reduce((sum, expense) => {
        let amount = expense.amount || 0;
        if (expense.currency !== currency) {
          if (expense.currency === "LKR" && currency === "USD") {
            amount = amount / 300;
          } else if (expense.currency === "USD" && currency === "LKR") {
            amount = amount * 300;
          }
        }
        return sum + amount;
      }, 0) || 0;

      return {
        accounts: accounts || [],
        totalBalance: Math.round(totalBalance * 100) / 100,
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
      };
    } catch (error) {
      console.error("Error fetching account data:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch account data");
      return null;
    } finally {
      setLoading(false);
    }
  }, [tenant?.id, selectedLocation, currency]);

  return {
    fetchAccountDetails,
    loading,
    error,
  };
}
