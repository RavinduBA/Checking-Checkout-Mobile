import { useEffect, useState } from "react";
import { useLocationContext } from "../contexts/LocationContext";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

export interface IncomeRecord {
  id: string;
  booking_id: string | null;
  amount: number;
  payment_method: string;
  currency: string;
  created_at: string;
  date: string;
  note?: string | null;
}

export function useIncomeData() {
  const { user } = useAuth();
  const { selectedLocation } = useLocationContext();
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncomeRecords = async () => {
    if (!selectedLocation || !user) {
      setIncomeRecords([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: incomeData, error: incomeError } = await supabase
        .from("income")
        .select(
          "id, booking_id, amount, payment_method, currency, created_at, date, note"
        )
        .eq("location_id", selectedLocation)
        .order("created_at", { ascending: false });

      if (incomeError) {
        console.error("Error fetching income records:", incomeError);
        setError(incomeError.message);
        return;
      }

      setIncomeRecords(incomeData || []);
    } catch (err) {
      console.error("Error in fetchIncomeRecords:", err);
      setError("Failed to fetch income records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomeRecords();
  }, [selectedLocation, user]);

  return {
    incomeRecords,
    loading,
    error,
    refetch: fetchIncomeRecords,
  };
}
