-- UNDO: Restore original generate_reservation_number() RPC function
-- WARNING: This restores the version with the bug "FOR UPDATE is not allowed with aggregate functions"
-- Only use this if you need to revert to the original implementation

CREATE OR REPLACE FUNCTION generate_reservation_number(
  p_tenant_id UUID,
  p_location_id UUID
)
RETURNS TEXT AS $$
DECLARE
  v_next_number INTEGER;
  v_location_code TEXT;
  v_reservation_number TEXT;
BEGIN
  -- Get location code (use first 3 chars of name, uppercase)
  SELECT UPPER(SUBSTRING(name FROM 1 FOR 3)) INTO v_location_code
  FROM locations
  WHERE id = p_location_id;

  -- If location not found, use default code
  IF v_location_code IS NULL THEN
    v_location_code := 'LOC';
  END IF;

  -- Get next sequential number for this tenant/location
  -- Use SELECT FOR UPDATE to avoid race conditions
  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(reservation_number FROM '[0-9]+$')
        AS INTEGER
      )
    ),
    0
  ) + 1 INTO v_next_number
  FROM reservations
  WHERE tenant_id = p_tenant_id
    AND location_id = p_location_id
    AND reservation_number LIKE v_location_code || '-%'
  FOR UPDATE SKIP LOCKED;

  -- Generate final reservation number: LOC-00001
  v_reservation_number := v_location_code || '-' || LPAD(v_next_number::TEXT, 5, '0');

  RETURN v_reservation_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION generate_reservation_number(UUID, UUID) IS 'Generates a unique sequential reservation number for a tenant/location combination';
