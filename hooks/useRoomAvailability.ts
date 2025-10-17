import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useLocationContext } from "../contexts/LocationContext";
import { useTenant } from "./useTenant";

interface UseRoomAvailabilityOptions {
  roomId?: string;
  startDate?: Date;
  endDate?: Date;
  excludeReservationId?: string;
}

interface ReservationBooking {
  id: string;
  check_in_date: string;
  check_out_date: string;
  room_id: string;
  status: string;
}

export function useRoomAvailability({
  roomId,
  startDate,
  endDate,
  excludeReservationId,
}: UseRoomAvailabilityOptions = {}) {
  const { selectedLocation } = useLocationContext();
  const { tenant } = useTenant();
  const [reservations, setReservations] = useState<ReservationBooking[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReservations = async () => {
    if (!selectedLocation || !tenant?.id) {
      setReservations([]);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from("reservations")
        .select("id, check_in_date, check_out_date, room_id, status")
        .eq("tenant_id", tenant.id)
        .eq("location_id", selectedLocation)
        .neq("status", "cancelled"); // Exclude cancelled reservations

      // Filter by room if specified
      if (roomId) {
        query = query.eq("room_id", roomId);
      }

      // Filter by date range if specified
      if (startDate && endDate) {
        const start = startDate.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];
        query = query.or(
          `check_in_date.lte.${end},check_out_date.gte.${start}`,
        );
      }

      // Exclude specific reservation if editing
      if (excludeReservationId) {
        query = query.neq("id", excludeReservationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error("Error fetching reservations for availability:", error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [selectedLocation, tenant?.id, roomId, startDate, endDate, excludeReservationId]);

  /**
   * Check if a specific date is available for a room
   */
  const isDateAvailable = (date: Date, roomIdToCheck?: string): boolean => {
    const targetRoomId = roomIdToCheck || roomId;
    if (!targetRoomId) return true; // If no room specified, assume available

    const dateStr = date.toISOString().split('T')[0];

    // Check if date falls within any existing reservation
    return !reservations.some((reservation) => {
      // Only check reservations for the target room
      if (reservation.room_id !== targetRoomId) return false;

      const checkIn = new Date(reservation.check_in_date);
      const checkOut = new Date(reservation.check_out_date);

      // Date is unavailable if it's between check-in (inclusive) and check-out (exclusive)
      return (
        date >= checkIn && 
        date < checkOut
      );
    });
  };

  /**
   * Check if a date range is available for a room
   */
  const isRangeAvailable = (
    checkInDate: Date,
    checkOutDate: Date,
    roomIdToCheck?: string,
  ): boolean => {
    const targetRoomId = roomIdToCheck || roomId;
    if (!targetRoomId) return true;

    // Check if there's any overlap with existing reservations
    return !reservations.some((reservation) => {
      if (reservation.room_id !== targetRoomId) return false;

      const existingCheckIn = new Date(reservation.check_in_date);
      const existingCheckOut = new Date(reservation.check_out_date);

      // Check for any overlap
      // Overlap exists if: (newCheckIn < existingCheckOut) AND (newCheckOut > existingCheckIn)
      return checkInDate < existingCheckOut && checkOutDate > existingCheckIn;
    });
  };

  /**
   * Get all unavailable dates for a room in a date range
   */
  const getUnavailableDates = (
    startRange: Date,
    endRange: Date,
    roomIdToCheck?: string,
  ): Date[] => {
    const targetRoomId = roomIdToCheck || roomId;
    if (!targetRoomId) return [];

    const unavailableDates: Date[] = [];
    const currentDate = new Date(startRange);

    while (currentDate <= endRange) {
      if (!isDateAvailable(currentDate, targetRoomId)) {
        unavailableDates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return unavailableDates;
  };

  /**
   * Get reservations for a specific room
   */
  const getRoomReservations = (roomIdToCheck: string) => {
    return reservations.filter((r) => r.room_id === roomIdToCheck);
  };

  return {
    reservations,
    isLoading: loading,
    isDateAvailable,
    isRangeAvailable,
    getUnavailableDates,
    getRoomReservations,
    refetch: fetchReservations,
  };
}
