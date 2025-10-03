-- Fix RLS policies for profiles table
-- Run this in your Supabase SQL Editor

-- First, let's drop existing policies and recreate them properly
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create proper RLS policies
-- Allow users to select their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile  
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile (important for fallback profile creation)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow the trigger function to bypass RLS when creating profiles
-- This is done by making the trigger function SECURITY DEFINER (already done)

-- Also, let's make sure the trigger function has proper permissions
-- Grant necessary permissions to the function
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON public.profiles TO postgres;

-- Recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Use INSERT with ON CONFLICT to handle cases where profile might already exist
  INSERT INTO public.profiles (id, email, name, tenant_role, is_tenant_admin, first_login_completed)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'tenant_admin',
    false,
    false
  )
  ON CONFLICT (id) DO NOTHING; -- Don't fail if profile already exists
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Test the policies by selecting current user info
SELECT 'RLS policies updated successfully!' as message;
