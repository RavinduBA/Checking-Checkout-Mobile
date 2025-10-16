import { useCallback, useState } from "react";
import { supabase } from "../lib/supabase";
import { convertCurrency } from "../utils/currency";
import { useAuth } from "./useAuth";
import { useLocationContext } from "./useLocationContext";
import { useTenant } from "./useTenant";

interface ReservationFinancials {
  roomAmount: number;
  expensesAmount: number;
  paidAmount: number;
  balanceAmount: number;
}

interface ReservationWithFinancials {
  id: string;
  reservation_number: string;
  guest_name: string;
  guest_email?: string;
  guest_phone?: string;
  guest_nationality?: string;
  adults: number;
  children: number;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  room_rate: number;
  total_amount: number;
  paid_amount?: number;
  balance_amount?: number;
  currency: string;
  status: string;
  special_requests?: string;
  arrival_time?: string;
  booking_source?: string;
  created_at: string;
  updated_at?: string;
  locations?: {
    id: string;
    name: string;
    address?: string;
  };
  rooms?: {
    id: string;
    room_number: string;
    room_type: string;
  };
  guides?: {
    id: string;
    name: string;
  };
  agents?: {
    id: string;
    name: string;
  };
  convertedAmounts?: ReservationFinancials;
}

export function useReservationFinancials() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { selectedLocation } = useLocationContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateFinancials = useCallback(async (
    reservations: any[],
    targetCurrency: "USD" | "LKR" = "USD"
  ): Promise<ReservationWithFinancials[]> => {
    if (!reservations || reservations.length === 0) {
      return [];
    }

    const enhancedReservations: ReservationWithFinancials[] = [];

    for (const reservation of reservations) {
      try {
        // Fetch income records for this reservation
        const { data: incomeRecords, error: incomeError } = await supabase
          .from("income")
          .select("amount, currency, payment_method")
          .eq("booking_id", reservation.id);

        if (incomeError) {
          console.error("Error fetching income records:", incomeError);
        }

        // Fetch expense records for this reservation
        const { data: expenseRecords, error: expenseError } = await supabase
          .from("expenses")
          .select("amount, currency")
          .eq("booking_id", reservation.id);

        if (expenseError) {
          console.error("Error fetching expense records:", expenseError);
        }

        // Calculate room amount (convert if needed)
        let roomAmount = reservation.total_amount || 0;
        if (reservation.currency !== targetCurrency) {
          roomAmount = await convertCurrency(
            roomAmount,
            reservation.currency as "USD" | "LKR",
            targetCurrency
          );
        }

        // Calculate total expenses (convert if needed)
        let expensesAmount = 0;
        if (expenseRecords && expenseRecords.length > 0) {
          for (const expense of expenseRecords) {
            let convertedAmount = expense.amount;
            if (expense.currency !== targetCurrency) {
              convertedAmount = await convertCurrency(
                expense.amount,
                expense.currency as "USD" | "LKR",
                targetCurrency
              );
            }
            expensesAmount += convertedAmount;
          }
        }

        // Calculate total paid amount (convert if needed)
        let paidAmount = 0;
        if (incomeRecords && incomeRecords.length > 0) {
          for (const income of incomeRecords) {
            let convertedAmount = income.amount;
            if (income.currency !== targetCurrency) {
              convertedAmount = await convertCurrency(
                income.amount,
                income.currency as "USD" | "LKR",
                targetCurrency
              );
            }
            paidAmount += convertedAmount;
          }
        }

        // Calculate balance
        const totalAmount = roomAmount + expensesAmount;
        const balanceAmount = totalAmount - paidAmount;

        const convertedAmounts: ReservationFinancials = {
          roomAmount: Math.round(roomAmount * 100) / 100,
          expensesAmount: Math.round(expensesAmount * 100) / 100,
          paidAmount: Math.round(paidAmount * 100) / 100,
          balanceAmount: Math.round(balanceAmount * 100) / 100,
        };

        enhancedReservations.push({
          ...reservation,
          convertedAmounts,
        });
      } catch (error) {
        console.error("Error calculating financials for reservation:", reservation.id, error);
        // Add reservation without financial calculations on error
        enhancedReservations.push({
          ...reservation,
          convertedAmounts: {
            roomAmount: reservation.total_amount || 0,
            expensesAmount: 0,
            paidAmount: reservation.paid_amount || 0,
            balanceAmount: (reservation.total_amount || 0) - (reservation.paid_amount || 0),
          },
        });
      }
    }

    return enhancedReservations;
  }, []);

  const refetch = useCallback(async () => {
    if (!tenant?.id || !selectedLocation) {
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch basic reservations data
      const { data: reservations, error: reservationsError } = await supabase
        .from("reservations")
        .select(`
          *,
          locations (
            id,
            name,
            address
          ),
          rooms (
            id,
            room_number,
            room_type
          ),
          guides (
            id,
            name
          ),
          agents (
            id,
            name
          )
        `)
        .eq("tenant_id", tenant.id)
        .eq("location_id", selectedLocation)
        .order("check_in_date", { ascending: false });

      if (reservationsError) throw reservationsError;

      // Calculate financial data for all reservations
      const enhancedReservations = await calculateFinancials(reservations || []);
      
      return enhancedReservations;
    } catch (error) {
      console.error("Error fetching reservation financials:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch reservation financials");
      return [];
    } finally {
      setLoading(false);
    }
  }, [tenant?.id, selectedLocation, calculateFinancials]);

  return {
    calculateFinancials,
    refetch,
    loading,
    error,
  };
}
