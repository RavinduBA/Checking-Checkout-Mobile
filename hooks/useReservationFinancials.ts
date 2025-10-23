import { useCallback, useEffect, useState } from "react";
import { useLocationContext } from "../contexts/LocationContext";
import { supabase } from "../lib/supabase";
import { convertCurrency } from "../utils/currency";
import { useTenant } from "./useTenant";

// Type for the simplified financial view
export interface ReservationFinancial {
  id: string;
  reservation_number: string;
  guest_name: string;
  status: string;
  currency: string;
  room_amount_usd: number;
  expenses_usd: number;
  user_paid_amount_usd: number;
  needs_to_pay_usd: number;
  // Additional fields for compatibility
  rooms?: { room_number: string; room_type: string } | null;
  locations?: { name: string } | null;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  room_rate: number;
  total_amount: number;
  paid_amount: number | null;
  balance_amount: number | null;
}

export function useReservationFinancials() {
  const { tenant } = useTenant();
  const { selectedLocation } = useLocationContext();
  const [data, setData] = useState<ReservationFinancial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!tenant?.id || !selectedLocation) {
      setData([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get basic reservation data with related tables
      const { data: reservations, error: reservationsError } = await supabase
        .from("reservations")
        .select(`
          *,
          rooms(room_number, room_type),
          locations(name)
        `)
        .eq("tenant_id", tenant.id)
        .eq("location_id", selectedLocation)
        .order("created_at", { ascending: false });

      if (reservationsError) throw reservationsError;

      // Get external bookings (channel manager bookings)
      const { data: externalBookings, error: externalError } = await supabase
        .from("external_bookings")
        .select(`
          *,
          rooms(room_number, room_type),
          locations(name)
        `)
        .eq("tenant_id", tenant.id)
        .eq("location_id", selectedLocation)
        .order("last_synced_at", { ascending: false });

      if (externalError) {
        console.warn("External bookings error (may not exist):", externalError);
      }

      // Transform external bookings to match reservation format
      const transformedExternalBookings = (externalBookings || []).map((booking) => ({
        id: booking.id,
        reservation_number: `${booking.source.toUpperCase()}-${booking.external_id}`,
        guest_name: booking.guest_name,
        status: booking.status,
        currency: booking.currency || "USD",
        check_in_date: booking.check_in,
        check_out_date: booking.check_out,
        nights: Math.ceil(
          (new Date(booking.check_out).getTime() -
            new Date(booking.check_in).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
        room_rate: booking.total_amount
          ? Number(booking.total_amount) /
            Math.ceil(
              (new Date(booking.check_out).getTime() -
                new Date(booking.check_in).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0,
        total_amount: Number(booking.total_amount) || 0,
        paid_amount: Number(booking.total_amount) || 0, // Channel bookings are typically pre-paid
        balance_amount: 0,
        rooms: booking.rooms,
        locations: booking.locations,
        tenant_id: booking.tenant_id,
        location_id: booking.location_id,
      }));

      // Combine both reservation types
      const allReservations = [
        ...(reservations || []),
        ...transformedExternalBookings,
      ];

      // Get income records for expense calculations
      const { data: incomeRecords, error: incomeError } = await supabase
        .from("income")
        .select("*")
        .eq("tenant_id", tenant.id)
        .in(
          "booking_id",
          allReservations?.map((r) => r.id) || []
        );

      if (incomeError) {
        console.warn("Income records error:", incomeError);
      }

      // Calculate financial data with USD conversion using proper currency conversion
      const financialData: ReservationFinancial[] = await Promise.all(
        allReservations?.map(async (reservation) => {
          try {
            // Convert reservation amounts to USD
            const roomAmountOriginal = reservation.room_rate * reservation.nights;
            const roomAmountUsd = await convertCurrency(
              roomAmountOriginal,
              reservation.currency,
              "USD",
              tenant.id,
              reservation.location_id
            );
            const paidAmountUsd = await convertCurrency(
              reservation.paid_amount || 0,
              reservation.currency,
              "USD",
              tenant.id,
              reservation.location_id
            );

            // Calculate expenses from income records with proper currency conversion
            const reservationIncomeRecords =
              incomeRecords?.filter((inc) => inc.booking_id === reservation.id) ||
              [];

            // Convert each income record to USD individually
            const expensesUsdPromises = reservationIncomeRecords.map(
              async (inc) => {
                return await convertCurrency(
                  Number(inc.amount),
                  inc.currency,
                  "USD",
                  tenant.id,
                  reservation.location_id
                );
              }
            );
            const expensesUsdArray = await Promise.all(expensesUsdPromises);
            const expensesUsd = expensesUsdArray.reduce(
              (sum, amount) => sum + amount,
              0
            );
            const needsToPayUsd = roomAmountUsd + expensesUsd - paidAmountUsd;

            return {
              id: reservation.id,
              reservation_number: reservation.reservation_number,
              guest_name: reservation.guest_name,
              status: reservation.status,
              currency: reservation.currency,
              room_amount_usd: Math.round(roomAmountUsd * 100) / 100,
              expenses_usd: Math.round(expensesUsd * 100) / 100,
              user_paid_amount_usd: Math.round(paidAmountUsd * 100) / 100,
              needs_to_pay_usd: Math.round(needsToPayUsd * 100) / 100,
              rooms: reservation.rooms,
              locations: reservation.locations,
              check_in_date: reservation.check_in_date,
              check_out_date: reservation.check_out_date,
              nights: reservation.nights,
              room_rate: reservation.room_rate,
              total_amount: reservation.total_amount,
              paid_amount: reservation.paid_amount,
              balance_amount: reservation.balance_amount,
            };
          } catch (error) {
            console.error(
              `Error processing reservation ${reservation.id}:`,
              error
            );
            // Return with basic data if conversion fails
            return {
              id: reservation.id,
              reservation_number: reservation.reservation_number,
              guest_name: reservation.guest_name,
              status: reservation.status,
              currency: reservation.currency,
              room_amount_usd: reservation.room_rate * reservation.nights,
              expenses_usd: 0,
              user_paid_amount_usd: reservation.paid_amount || 0,
              needs_to_pay_usd:
                reservation.room_rate * reservation.nights -
                (reservation.paid_amount || 0),
              rooms: reservation.rooms,
              locations: reservation.locations,
              check_in_date: reservation.check_in_date,
              check_out_date: reservation.check_out_date,
              nights: reservation.nights,
              room_rate: reservation.room_rate,
              total_amount: reservation.total_amount,
              paid_amount: reservation.paid_amount,
              balance_amount: reservation.balance_amount,
            };
          }
        }) || []
      );

      setData(financialData);
    } catch (error) {
      console.error("Error fetching reservation financials:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch reservation financials"
      );
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [tenant?.id, selectedLocation]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
