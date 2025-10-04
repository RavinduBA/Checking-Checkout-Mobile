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
  updated_at: string;
}

export interface Account {
  id: string;
  tenant_id: string;
  name: string;
  type: string;
  balance?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpenseType {
  id: string;
  main_type: string;
  sub_type: string;
  created_at: string;
}

export interface Expense {
  id: string;
  tenant_id: string;
  location_id?: string;
  account_id?: string;
  expense_type_id?: string;
  amount: number;
  description?: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
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

  const { profile } = useUserProfile();

  const fetchData = useCallback(async () => {
    if (!profile?.tenant_id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch locations for this tenant
      const locationsQuery = supabase
        .from("locations")
        .select("*")
        .eq("tenant_id", profile.tenant_id)
        .eq("is_active", true)
        .order("name");

      // Fetch accounts for this tenant
      const accountsQuery = supabase
        .from("accounts")
        .select("*")
        .eq("tenant_id", profile.tenant_id)
        .order("name");

      // Fetch expense types (global reference)
      const expenseTypesQuery = supabase
        .from("expense_types")
        .select("*")
        .order("main_type")
        .order("sub_type");

      // Fetch recent expenses for this tenant
      const expensesQuery = supabase
        .from("expenses")
        .select(`
          *,
          locations(name),
          accounts(name),
          expense_types(main_type, sub_type)
        `)
        .eq("tenant_id", profile.tenant_id)
        .order("created_at", { ascending: false })
        .limit(10);

      const [locationsRes, accountsRes, expenseTypesRes, expensesRes] =
        await Promise.all([
          locationsQuery,
          accountsQuery,
          expenseTypesQuery,
          expensesQuery,
        ]);

      // Handle errors
      if (locationsRes.error) throw locationsRes.error;
      if (accountsRes.error) throw accountsRes.error;
      if (expenseTypesRes.error) throw expenseTypesRes.error;
      if (expensesRes.error) throw expensesRes.error;

      setLocations(locationsRes.data || []);
      setAccounts(accountsRes.data || []);
      setExpenseTypes(expenseTypesRes.data || []);
      setRecentExpenses(expensesRes.data || []);
    } catch (err: any) {
      console.error("Error fetching expense data:", err);
      setError(err.message || "Failed to fetch expense data");
    } finally {
      setLoading(false);
    }
  }, [profile?.tenant_id]);

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
