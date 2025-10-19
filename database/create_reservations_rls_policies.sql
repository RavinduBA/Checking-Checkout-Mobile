-- Create RLS Policies for Reservations Table
-- This fixes the "new row violates row-level security policy" error

-- Drop existing policies if any (cleanup)
DROP POLICY IF EXISTS "Users can view reservations in their tenant" ON reservations;
DROP POLICY IF EXISTS "Users can create reservations in their tenant" ON reservations;
DROP POLICY IF EXISTS "Users can update reservations in their tenant" ON reservations;
DROP POLICY IF EXISTS "Users can delete reservations in their tenant" ON reservations;

-- Enable RLS (if not already enabled)
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow users to SELECT reservations in their tenant
CREATE POLICY "Users can view reservations in their tenant"
ON reservations
FOR SELECT
TO public
USING (
  tenant_id IN (
    SELECT p.tenant_id
    FROM profiles p
    WHERE p.id = auth.uid()
  )
);

-- Policy 2: Allow users to INSERT reservations in their tenant
CREATE POLICY "Users can create reservations in their tenant"
ON reservations
FOR INSERT
TO public
WITH CHECK (
  tenant_id IN (
    SELECT p.tenant_id
    FROM profiles p
    WHERE p.id = auth.uid()
  )
);

-- Policy 3: Allow users to UPDATE reservations in their tenant
CREATE POLICY "Users can update reservations in their tenant"
ON reservations
FOR UPDATE
TO public
USING (
  tenant_id IN (
    SELECT p.tenant_id
    FROM profiles p
    WHERE p.id = auth.uid()
  )
)
WITH CHECK (
  tenant_id IN (
    SELECT p.tenant_id
    FROM profiles p
    WHERE p.id = auth.uid()
  )
);

-- Policy 4: Allow users to DELETE reservations in their tenant
CREATE POLICY "Users can delete reservations in their tenant"
ON reservations
FOR DELETE
TO public
USING (
  tenant_id IN (
    SELECT p.tenant_id
    FROM profiles p
    WHERE p.id = auth.uid()
  )
);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'reservations'
ORDER BY policyname;
