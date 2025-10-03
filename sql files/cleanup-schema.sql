-- Database Cleanup Script
-- ⚠️ WARNING: This will DELETE ALL your data and tables!
-- Make sure you have a backup before running this script

-- Disable RLS first to avoid dependency issues
ALTER TABLE IF EXISTS public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.guides DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.account_transfers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.additional_services DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.beds24_property_mappings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.booking_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.booking_sync_urls DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.channel_property_mappings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.currency_rates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.form_field_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expense_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.external_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.income DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.income_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.monthly_rent_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.room_pricing DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tenant_limits DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_permissions DISABLE ROW LEVEL SECURITY;

-- Drop all policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Drop tables in reverse dependency order (most dependent first)
DROP TABLE IF EXISTS public.user_permissions CASCADE;
DROP TABLE IF EXISTS public.user_invitations CASCADE;
DROP TABLE IF EXISTS public.tenant_limits CASCADE;
DROP TABLE IF EXISTS public.room_pricing CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.monthly_rent_payments CASCADE;
DROP TABLE IF EXISTS public.income_types CASCADE;
DROP TABLE IF EXISTS public.income CASCADE;
DROP TABLE IF EXISTS public.external_bookings CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.expense_types CASCADE;
DROP TABLE IF EXISTS public.form_field_preferences CASCADE;
DROP TABLE IF EXISTS public.currency_rates CASCADE;
DROP TABLE IF EXISTS public.channel_property_mappings CASCADE;
DROP TABLE IF EXISTS public.booking_sync_urls CASCADE;
DROP TABLE IF EXISTS public.booking_payments CASCADE;
DROP TABLE IF EXISTS public.beds24_property_mappings CASCADE;
DROP TABLE IF EXISTS public.additional_services CASCADE;
DROP TABLE IF EXISTS public.account_transfers CASCADE;
DROP TABLE IF EXISTS public.reservations CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.agents CASCADE;
DROP TABLE IF EXISTS public.guides CASCADE;
DROP TABLE IF EXISTS public.accounts CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;
DROP TABLE IF EXISTS public.locations CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS reservation_status CASCADE;
DROP TYPE IF EXISTS tenant_role CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS income_type CASCADE;
DROP TYPE IF EXISTS booking_source CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS currency_type CASCADE;

SELECT 'All tables and types dropped successfully!' as message;
