import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useUserProfile } from "./useUserProfile";

export interface ExpenseType {
  id: string;
  main_type: string;
  sub_type: string;
  created_at: string;
}

interface UseExpenseTypesReturn {
  expenseTypes: ExpenseType[];
  mainTypes: string[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getSubTypesByMainType: (mainType: string) => ExpenseType[];
  createExpenseType: (mainType: string, subType: string) => Promise<void>;
  updateExpenseType: (id: string, mainType: string, subType: string) => Promise<void>;
  deleteExpenseType: (id: string) => Promise<void>;
}

export const useExpenseTypes = (): UseExpenseTypesReturn => {
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useUserProfile();

  const fetchExpenseTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!profile?.tenant_id) {
        setExpenseTypes([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("expense_types")
        .select("*")
        .eq("tenant_id", profile.tenant_id)
        .order("main_type", { ascending: true })
        .order("sub_type", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setExpenseTypes(data || []);
    } catch (err: any) {
      console.error("Error fetching expense types:", err);
      setError(err.message || "Failed to fetch expense types");
    } finally {
      setLoading(false);
    }
  }, [profile?.tenant_id]);

  // Get unique main types
  const mainTypes = expenseTypes
    .map(type => type.main_type)
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort();

  // Get sub types by main type
  const getSubTypesByMainType = useCallback((mainType: string): ExpenseType[] => {
    return expenseTypes
      .filter(type => type.main_type === mainType)
      .sort((a, b) => a.sub_type.localeCompare(b.sub_type));
  }, [expenseTypes]);

  // Create new expense type
  const createExpenseType = useCallback(async (mainType: string, subType: string) => {
    try {
      if (!profile?.tenant_id) {
        throw new Error('No tenant ID available');
      }

      const { error: createError } = await supabase
        .from("expense_types")
        .insert({
          main_type: mainType.toLowerCase().trim(),
          sub_type: subType.toLowerCase().trim(),
          tenant_id: profile.tenant_id,
        });

      if (createError) {
        throw createError;
      }

      // Refresh the data
      await fetchExpenseTypes();
    } catch (err: any) {
      console.error("Error creating expense type:", err);
      throw err;
    }
  }, [fetchExpenseTypes, profile?.tenant_id]);

  // Update expense type
  const updateExpenseType = useCallback(async (id: string, mainType: string, subType: string) => {
    try {
      const { error: updateError } = await supabase
        .from("expense_types")
        .update({
          main_type: mainType.toLowerCase().trim(),
          sub_type: subType.toLowerCase().trim(),
        })
        .eq("id", id);

      if (updateError) {
        throw updateError;
      }

      // Refresh the data
      await fetchExpenseTypes();
    } catch (err: any) {
      console.error("Error updating expense type:", err);
      throw err;
    }
  }, [fetchExpenseTypes]);

  // Delete expense type
  const deleteExpenseType = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("expense_types")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      // Refresh the data
      await fetchExpenseTypes();
    } catch (err: any) {
      console.error("Error deleting expense type:", err);
      throw err;
    }
  }, [fetchExpenseTypes]);

  useEffect(() => {
    if (profile?.tenant_id) {
      fetchExpenseTypes();
    }
  }, [fetchExpenseTypes, profile?.tenant_id]);

  return {
    expenseTypes,
    mainTypes,
    loading,
    error,
    refetch: fetchExpenseTypes,
    getSubTypesByMainType,
    createExpenseType,
    updateExpenseType,
    deleteExpenseType,
  };
};
