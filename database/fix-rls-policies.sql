-- Fix RLS policies for rooms table

-- First, let's check if RLS is enabled on the rooms table
-- RLS should be enabled for security

-- Enable RLS on rooms table (if not already enabled)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view rooms from their tenant" ON rooms;
DROP POLICY IF EXISTS "Users can insert rooms for their tenant" ON rooms;
DROP POLICY IF EXISTS "Users can update rooms from their tenant" ON rooms;
DROP POLICY IF EXISTS "Users can delete rooms from their tenant" ON rooms;

-- Create SELECT policy
CREATE POLICY "Users can view rooms from their tenant" ON rooms
FOR SELECT USING (
  tenant_id = (
    SELECT tenant_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

-- Create INSERT policy
CREATE POLICY "Users can insert rooms for their tenant" ON rooms
FOR INSERT WITH CHECK (
  tenant_id = (
    SELECT tenant_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

-- Create UPDATE policy
CREATE POLICY "Users can update rooms from their tenant" ON rooms
FOR UPDATE USING (
  tenant_id = (
    SELECT tenant_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
) WITH CHECK (
  tenant_id = (
    SELECT tenant_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

-- Create DELETE policy
CREATE POLICY "Users can delete rooms from their tenant" ON rooms
FOR DELETE USING (
  tenant_id = (
    SELECT tenant_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

-- Also ensure locations table has proper RLS policies
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Drop existing location policies
DROP POLICY IF EXISTS "Users can view locations from their tenant" ON locations;
DROP POLICY IF EXISTS "Users can insert locations for their tenant" ON locations;
DROP POLICY IF EXISTS "Users can update locations from their tenant" ON locations;
DROP POLICY IF EXISTS "Users can delete locations from their tenant" ON locations;

-- Create location policies
CREATE POLICY "Users can view locations from their tenant" ON locations
FOR SELECT USING (
  tenant_id = (
    SELECT tenant_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can insert locations for their tenant" ON locations
FOR INSERT WITH CHECK (
  tenant_id = (
    SELECT tenant_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update locations from their tenant" ON locations
FOR UPDATE USING (
  tenant_id = (
    SELECT tenant_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
) WITH CHECK (
  tenant_id = (
    SELECT tenant_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can delete locations from their tenant" ON locations
FOR DELETE USING (
  tenant_id = (
    SELECT tenant_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);
