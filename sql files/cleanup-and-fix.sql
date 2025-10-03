-- Cleanup script to fix existing data issues
-- Run this BEFORE testing the new onboarding flow

-- First, let's clean up any profiles with invalid tenant_role values
DELETE FROM public.profiles WHERE tenant_role NOT IN ('tenant_owner', 'tenant_admin', 'tenant_manager', 'tenant_staff');

-- Optional: If you want to start fresh with onboarding, remove all profiles and tenants
-- (UNCOMMENT the lines below if you want to reset everything)

-- DELETE FROM public.user_permissions;
-- DELETE FROM public.subscriptions;
-- DELETE FROM public.locations; 
-- DELETE FROM public.profiles;
-- DELETE FROM public.tenants;

-- Recreate the trigger to ensure it's up to date
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, tenant_role, is_tenant_admin, first_login_completed)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'tenant_admin',
    false, -- Will be set to true during onboarding
    false  -- Will be set to true during onboarding
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

SELECT 'Cleanup completed!' as message;
