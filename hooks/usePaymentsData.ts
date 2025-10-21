import { useEffect, useState } from "react";
import { useLocationContext } from "../contexts/LocationContext";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import { useTenant } from "./useTenant";

export interface Payment {
	id: string;
	date: string;
	amount: number;
	currency: string;
	type: string;
	payment_method: string;
	is_advance: boolean;
	account_name?: string;
	reservation_number?: string | null;
	guest_name?: string | null;
	room_number?: string | null;
	check_in_date?: string | null;
	check_out_date?: string | null;
	note?: string | null;
	booking_id?: string | null;
}

export function usePaymentsData() {
	const { user } = useAuth();
	const { selectedLocation } = useLocationContext();
	const { tenant } = useTenant();
	const [payments, setPayments] = useState<Payment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchPayments = async () => {
		if (!selectedLocation || !user || !tenant?.id) {
			setPayments([]);
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			setError(null);

			// Fetch income records with reservation details
			const { data: incomeData, error: incomeError } = await supabase
				.from("income")
				.select(`
          id,
          date,
          amount,
          currency,
          type,
          payment_method,
          is_advance,
          note,
          booking_id,
          account_id,
          accounts!inner(name),
          reservations(
            reservation_number,
            guest_name,
            check_in_date,
            check_out_date,
            rooms(room_number)
          )
        `)
				.eq("tenant_id", tenant.id)
				.eq("location_id", selectedLocation)
				.order("date", { ascending: false });

			if (incomeError) {
				console.error("Error fetching payments:", incomeError);
				setError(incomeError.message);
				return;
			}

			// Transform data to match Payment interface
			const transformedPayments: Payment[] =
				incomeData?.map((income: any) => ({
					id: income.id,
					date: income.date,
					amount: income.amount,
					currency: income.currency,
					type: income.type || "other",
					payment_method: income.payment_method,
					is_advance: income.is_advance || false,
					account_name: income.accounts?.name,
					reservation_number: income.reservations?.reservation_number,
					guest_name: income.reservations?.guest_name,
					room_number: income.reservations?.rooms?.room_number,
					check_in_date: income.reservations?.check_in_date,
					check_out_date: income.reservations?.check_out_date,
					note: income.note,
					booking_id: income.booking_id,
				})) || [];

			setPayments(transformedPayments);
		} catch (err) {
			console.error("Error in fetchPayments:", err);
			setError("Failed to fetch payments");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPayments();
	}, [user, selectedLocation, tenant?.id]);

	return {
		payments,
		loading,
		error,
		refetch: fetchPayments,
	};
}
