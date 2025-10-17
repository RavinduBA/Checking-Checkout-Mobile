import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import { useLocationContext } from "../contexts/LocationContext";
import { useTenant } from "./useTenant";

export interface CalendarReservation {
  id: string;
  reservation_number: string;
  guest_name: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  room_id: string;
  nights: number;
  rooms?: {
    room_number: string;
    room_type: string;
  };
}

export function useCalendarData() {
  const { user } = useAuth();
  const { selectedLocation } = useLocationContext();
  const { tenant } = useTenant();
  const [reservations, setReservations] = useState<CalendarReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendarData = async () => {
    if (!user || !selectedLocation || !tenant?.id) {
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
          id,
          reservation_number,
          guest_name,
          check_in_date,
          check_out_date,
          status,
          room_id,
          nights,
          rooms (
            room_number,
            room_type
          )
        `)
        .eq("tenant_id", tenant.id)
        .eq("location_id", selectedLocation)
        .neq("status", "cancelled")
        .order("check_in_date", { ascending: true });

      if (fetchError) {
        console.error("Error fetching calendar data:", fetchError);
        setError(fetchError.message);
        return;
      }

      setReservations(data?.map(item => ({
        ...item,
        rooms: Array.isArray(item.rooms) && item.rooms.length > 0 ? item.rooms[0] : null
      })) as CalendarReservation[]);
    } catch (err) {
      console.error("Error in fetchCalendarData:", err);
      setError("Failed to fetch calendar data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [user, selectedLocation, tenant?.id]);

  // Get reservations for a specific date
  const getReservationsForDate = (date: Date): CalendarReservation[] => {
    const dateStr = date.toISOString().split('T')[0];
    
    return reservations.filter(reservation => {
      const checkIn = new Date(reservation.check_in_date);
      const checkOut = new Date(reservation.check_out_date);
      const targetDate = new Date(dateStr);
      
      return targetDate >= checkIn && targetDate < checkOut;
    });
  };

  // Get reservations checking in on a specific date
  const getCheckInsForDate = (date: Date): CalendarReservation[] => {
    const dateStr = date.toISOString().split('T')[0];
    return reservations.filter(reservation => reservation.check_in_date === dateStr);
  };

  // Get reservations checking out on a specific date
  const getCheckOutsForDate = (date: Date): CalendarReservation[] => {
    const dateStr = date.toISOString().split('T')[0];
    return reservations.filter(reservation => reservation.check_out_date === dateStr);
  };

  return {
    reservations,
    loading,
    error,
    refetch: fetchCalendarData,
    getReservationsForDate,
    getCheckInsForDate,
    getCheckOutsForDate,
  };
}
