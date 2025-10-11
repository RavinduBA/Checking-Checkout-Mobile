import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useUserProfile } from "./useUserProfile";

export interface Location {
  id: string;
  name: string;
  tenant_id: string;
  is_active: boolean;
  property_type?: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at: string;
}

export interface Account {
  id: string;
  name: string;
  currency: "LKR" | "USD";
  current_balance: number;
  initial_balance: number;
  location_access: string[];
  tenant_id: string;
  created_at: string;
}

export interface ExpenseType {
  id: string;
  main_type: string;
  sub_type: string;
  created_at: string;
}

export interface Expense {
  id: string;
  main_type: string;
  sub_type: string;
  amount: number;
  currency: "LKR" | "USD";
  account_id: string;
  location_id: string;
  date: string;
  note: string | null;
  tenant_id: string;
  created_at: string;
  created_by: string | null;
}

interface UseExpenseDataReturn {
  locations: Location[];
  accounts: Account[];
  expenseTypes: ExpenseType[];
  recentExpenses: Expense[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useExpenseData = (): UseExpenseDataReturn => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { profile, loading: profileLoading } = useUserProfile();

  const fetchData = useCallback(async () => {
    if (profileLoading || !profile?.tenant_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch locations
      const { data: locationsData, error: locationsError } = await supabase
        .from("locations")
        .select("*")
        .eq("tenant_id", profile.tenant_id)
        .eq("is_active", true);

      if (locationsError) throw locationsError;

      // Fetch accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from("accounts")
        .select("*")
        .eq("tenant_id", profile.tenant_id);

      if (accountsError) throw accountsError;

      // Fetch expense types
      const { data: expenseTypesData, error: expenseTypesError } = await supabase
        .from("expense_types")
        .select("*")
        .eq("tenant_id", profile.tenant_id)
        .order("main_type");

      if (expenseTypesError) throw expenseTypesError;

      // Fetch recent expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select("*")
        .eq("tenant_id", profile.tenant_id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (expensesError) throw expensesError;

      setLocations(locationsData || []);
      setAccounts(accountsData || []);
      setExpenseTypes(expenseTypesData || []);
      setRecentExpenses(expensesData || []);
    } catch (err: any) {
      console.error("Error fetching expense data:", err);
      setError(err.message || "Failed to fetch expense data");
    } finally {
      setLoading(false);
    }
  }, [profile?.tenant_id, profileLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    locations,
    accounts,
    expenseTypes,
    recentExpenses,
    loading,
    error,
    refetch: fetchData,
  };
};
