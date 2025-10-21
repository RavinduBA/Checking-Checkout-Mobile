// Replace this two functions

const generateReservationNumber = async (): Promise<string> => {
  try {
    if (!tenant?.id || !selectedLocation) {
      return `RES${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    }

    // Get location code (first 3 chars of location name)
    const { data: location, error: locationError } = await supabase
      .from("locations")
      .select("name")
      .eq("id", selectedLocation)
      .single();

    if (locationError) throw locationError;

    const locationCode = location?.name?.substring(0, 3).toUpperCase() || "LOC";

    // Get the max existing reservation number for this tenant/location
    const { data: existingReservations, error } = await supabase
      .from("reservations")
      .select("reservation_number")
      .eq("tenant_id", tenant.id)
      .eq("location_id", selectedLocation)
      .like("reservation_number", `${locationCode}-%`)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) throw error;

    // Extract number from last reservation (e.g., "LOC-00001" -> 1)
    let nextNumber = 1;
    if (existingReservations && existingReservations.length > 0) {
      const lastNumber = existingReservations[0].reservation_number;
      const match = lastNumber.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0], 10) + 1;
      }
    }

    // Format: LOC-00001
    return `${locationCode}-${String(nextNumber).padStart(5, "0")}`;
  } catch (error) {
    console.error("Error generating reservation number:", error);
    // Fallback with timestamp + random suffix for uniqueness
    return `RES${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  }
};

const handleSubmit = async () => {
  if (!validateCurrentStep()) return;

  if (!tenant?.id || !profile?.id || !selectedLocation) {
    toast({
      title: "Error",
      description: "Missing required information",
      variant: "destructive",
    });
    return;
  }

  setSubmitting(true);

  try {
    // Generate a group ID for multiple rooms
    const bookingGroupId = generateUUID();
    const reservations = [];

    // Get the starting reservation number
    const { data: location } = await supabase
      .from("locations")
      .select("name")
      .eq("id", selectedLocation)
      .single();

    const locationCode = location?.name?.substring(0, 3).toUpperCase() || "LOC";

    // Get the current max number
    const { data: existingReservations } = await supabase
      .from("reservations")
      .select("reservation_number")
      .eq("tenant_id", tenant.id)
      .eq("location_id", selectedLocation)
      .like("reservation_number", `${locationCode}-%`)
      .order("created_at", { ascending: false })
      .limit(1);

    let nextNumber = 1;
    if (existingReservations && existingReservations.length > 0) {
      const lastNumber = existingReservations[0].reservation_number;
      const match = lastNumber.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0], 10) + 1;
      }
    }

    // Generate sequential reservation numbers for all rooms
    const reservationNumbers: string[] = [];
    for (let i = 0; i < roomSelections.length; i++) {
      const reservationNumber = `${locationCode}-${String(
        nextNumber + i
      ).padStart(5, "0")}`;
      reservationNumbers.push(reservationNumber);
    }

    console.log("Generating reservations with numbers:", reservationNumbers);

    // Create reservation data for each room
    for (let i = 0; i < roomSelections.length; i++) {
      const selection = roomSelections[i];
      const reservationNumber = reservationNumbers[i];

      const reservationData = {
        reservation_number: reservationNumber,
        booking_group_id: roomSelections.length > 1 ? bookingGroupId : null,
        location_id: selectedLocation,
        room_id: selection.room_id,
        guest_name: guestData.guest_name,
        guest_email: guestData.guest_email || null,
        guest_phone: guestData.guest_phone || null,
        guest_address: guestData.guest_address || null,
        guest_nationality: guestData.guest_nationality || null,
        guest_passport_number: guestData.guest_passport_number || null,
        guest_id_number: guestData.guest_id_number || null,
        adults: selection.adults,
        children: selection.children,
        check_in_date: selection.check_in_date,
        check_out_date: selection.check_out_date,
        nights: selection.nights,
        room_rate: selection.room_rate,
        total_amount: selection.total_amount,
        advance_amount: paymentData.advance_amount / roomSelections.length,
        paid_amount: 0,
        balance_amount: selection.total_amount,
        currency: selection.currency as any,
        status: "tentative" as const,
        arrival_time: selection.arrival_time || null,
        special_requests: guestData.special_requests || null,
        booking_source: guestData.booking_source,
        created_by: profile.id,
        tenant_id: tenant.id,
      };

      reservations.push(reservationData);
    }

    console.log("Inserting reservations:", reservations);

    // Insert all reservations in a single transaction
    const { error } = await supabase.from("reservations").insert(reservations);

    if (error) {
      // Handle duplicate key error with retry
      if (error.code === "23505") {
        console.log("Duplicate key detected, retrying with new numbers...");
        // Retry once with incremented numbers
        const retryNumbers = reservationNumbers.map((num) => {
          const match = num.match(/\d+$/);
          if (match) {
            const currentNum = parseInt(match[0], 10);
            return `${locationCode}-${String(
              currentNum + roomSelections.length
            ).padStart(5, "0")}`;
          }
          return `RES${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        });

        // Update reservation numbers and retry
        reservations.forEach((res, index) => {
          res.reservation_number = retryNumbers[index];
        });

        const { error: retryError } = await supabase
          .from("reservations")
          .insert(reservations);

        if (retryError) throw retryError;
      } else {
        throw error;
      }
    }

    const reservationNumbersDisplay = reservations
      .map((r) => r.reservation_number)
      .join(", ");
    toast({
      title: "Success",
      description: `Reservation(s) ${reservationNumbersDisplay} created successfully`,
    });

    // Reset form and close dialog
    resetForm();
    onReservationCreated();
    onClose();
  } catch (error) {
    console.error("Error creating reservation:", error);
    toast({
      title: "Error",
      description: "Failed to create reservation",
      variant: "destructive",
    });
  } finally {
    setSubmitting(false);
  }
};
