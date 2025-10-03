-- Migration script to create profile records for existing users
-- Run this if you have existing users without profile records

-- Insert profile records for users who don't have them
INSERT INTO public.profiles (id, email, name, tenant_role, is_tenant_admin, first_login_completed)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)) as name,
  'tenant_admin' as tenant_role,
  false as is_tenant_admin,
  false as first_login_completed
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
AND u.email IS NOT NULL;

-- Optional: Update existing profiles to ensure consistent structure
UPDATE public.profiles 
SET 
  tenant_role = COALESCE(tenant_role, 'tenant_admin'),
  is_tenant_admin = COALESCE(is_tenant_admin, false),
  first_login_completed = COALESCE(first_login_completed, false)
WHERE tenant_role IS NULL 
   OR is_tenant_admin IS NULL 
   OR first_login_completed IS NULL;
