-- Test script to verify user authentication and RLS setup
-- Run this in Supabase SQL Editor to debug the RLS issue

-- 1. Check if the current user has a profile with tenant_id
SELECT 
  auth.uid() as current_user_id,
  p.id as profile_id,
  p.tenant_id,
  p.email,
  p.name
FROM profiles p 
WHERE p.id = auth.uid();

-- 2. Check if there are any locations for this tenant
SELECT 
  l.id,
  l.name,
  l.tenant_id,
  l.is_active
FROM locations l
JOIN profiles p ON p.tenant_id = l.tenant_id
WHERE p.id = auth.uid();

-- 3. Check existing RLS policies on rooms table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'rooms';

-- 4. Check existing RLS policies on locations table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'locations';

-- 5. Test if we can manually insert a room (this should work if RLS is configured correctly)
-- DON'T RUN THIS - JUST FOR REFERENCE
/*
INSERT INTO rooms (
  room_number,
  room_type,
  property_type,
  bed_type,
  max_occupancy,
  base_price,
  currency,
  description,
  location_id,
  is_active,
  amenities,
  tenant_id
) VALUES (
  'TEST-001',
  'Standard',
  'Room',
  'Double',
  2,
  100.00,
  'USD',
  'Test room',
  (SELECT id FROM locations WHERE tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()) LIMIT 1),
  true,
  ARRAY['WiFi', 'AC'],
  (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);
*/
