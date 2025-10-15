import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import { useLocationContext } from "./useLocationContext";
import { useTenant } from "./useTenant";

export interface Reservation {
  id: string;
  reservation_number: string;
  guest_name: string;
  guest_email?: string;
  guest_phone?: string;
  guest_nationality?: string;
  room_id: string;
  location_id: string;
  tenant_id: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  nights: number;
  room_rate: number;
  currency: "LKR" | "USD";
  total_amount: number;
  paid_amount: number;
  status: "tentative" | "confirmed" | "checked_in" | "checked_out" | "cancelled";
  booking_source: string;
  special_requests?: string;
  created_at: string;
  updated_at: string;
  // Relations
  rooms?: {
    room_number: string;
    room_type: string;
    bed_type?: string;
    description?: string;
    amenities?: string[];
  };
  locations?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

export function useReservationsData() {
  const { user } = useAuth();
  const { selectedLocation } = useLocationContext();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = async () => {
    if (!user || !selectedLocation) {
      setReservations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("reservations")
        .select(`
          *,
          rooms (
            room_number,
            room_type,
            bed_type,
            description,
            amenities
          ),
          locations (
            name,
            address,
            phone,
            email
          )
        `)
        .eq("location_id", selectedLocation)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Error fetching reservations:", fetchError);
        setError(fetchError.message);
        return;
      }

      setReservations(data as Reservation[]);
    } catch (err) {
      console.error("Error in fetchReservations:", err);
      setError("Failed to fetch reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [user, selectedLocation]);

  return {
    reservations,
    loading,
    error,
    refetch: fetchReservations,
  };
}

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
  const { user } = useAuth();
  const { selectedLocation } = useLocationContext();
  const { tenant } = useTenant();
  const [financials, setFinancials] = useState<ReservationFinancial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancials = async () => {
    if (!user || !selectedLocation || !tenant?.id) {
      setFinancials([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

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

      // Get income records for expense calculations
      const { data: incomeRecords, error: incomeError } = await supabase
        .from("income")
        .select("*")
        .eq("tenant_id", tenant.id)
        .in("booking_id", reservations?.map((r) => r.id) || []);

      if (incomeError) throw incomeError;

      // Calculate financial data with USD conversion using simple conversion
      const financialData: ReservationFinancial[] = reservations?.map((reservation) => {
        // Convert reservation amounts to USD (simplified conversion)
        const roomAmountOriginal = reservation.room_rate * reservation.nights;
        const roomAmountUsd = reservation.currency === "USD" 
          ? roomAmountOriginal 
          : roomAmountOriginal / 300; // Simple LKR to USD conversion
        
        const paidAmountUsd = reservation.currency === "USD" 
          ? (reservation.paid_amount || 0) 
          : (reservation.paid_amount || 0) / 300;

        // Calculate expenses from income records with currency conversion
        const reservationIncomeRecords = incomeRecords?.filter((inc) => inc.booking_id === reservation.id) || [];
        
        const expensesUsd = reservationIncomeRecords.reduce((sum, inc) => {
          const amount = inc.currency === "USD" ? Number(inc.amount) : Number(inc.amount) / 300;
          return sum + amount;
        }, 0);

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
      }) || [];

      setFinancials(financialData);
    } catch (err) {
      console.error("Error in fetchFinancials:", err);
      setError("Failed to fetch financials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, [user, selectedLocation, tenant?.id]);

  return {
    financials,
    loading,
    error,
    refetch: fetchFinancials,
  };
}
