import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useUserProfile } from "./useUserProfile";

export interface IncomeType {
  id: string;
  type_name: string;
  created_at: string;
}

interface UseIncomeTypesReturn {
  incomeTypes: IncomeType[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createIncomeType: (typeName: string) => Promise<void>;
  deleteIncomeType: (id: string) => Promise<void>;
}

export const useIncomeTypes = (): UseIncomeTypesReturn => {
  const [incomeTypes, setIncomeTypes] = useState<IncomeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useUserProfile();

  const fetchIncomeTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("income_types")
        .select("*")
        .order("type_name", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setIncomeTypes(data || []);
    } catch (err: any) {
      console.error("Error fetching income types:", err);
      setError(err.message || "Failed to fetch income types");
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new income type
  const createIncomeType = useCallback(async (typeName: string) => {
    try {
      const { error: createError } = await supabase
        .from("income_types")
        .insert({
          type_name: typeName.trim(),
        });

      if (createError) {
        throw createError;
      }

      // Refresh the data
      await fetchIncomeTypes();
    } catch (err: any) {
      console.error("Error creating income type:", err);
      throw err;
    }
  }, [fetchIncomeTypes]);

  // Delete income type
  const deleteIncomeType = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("income_types")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      // Refresh the data
      await fetchIncomeTypes();
    } catch (err: any) {
      console.error("Error deleting income type:", err);
      throw err;
    }
  }, [fetchIncomeTypes]);

  const refetch = useCallback(async () => {
    await fetchIncomeTypes();
  }, [fetchIncomeTypes]);

  useEffect(() => {
    fetchIncomeTypes();
  }, [fetchIncomeTypes]);

  return {
    incomeTypes,
    loading,
    error,
    refetch,
    createIncomeType,
    deleteIncomeType,
  };
};
