-- Hotel Management System Database Schema
-- Run this in your Supabase SQL Editor

-- First, let's create the custom types that are referenced in the tables
DO $$ 
BEGIN
    -- Create currency_type enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'currency_type') THEN
        CREATE TYPE currency_type AS ENUM ('USD', 'EUR', 'GBP', 'LKR', 'INR', 'AUD', 'CAD', 'JPY', 'SGD');
    END IF;

    -- Create booking_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show');
    END IF;

    -- Create booking_source enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_source') THEN
        CREATE TYPE booking_source AS ENUM ('direct', 'airbnb', 'booking_com', 'expedia', 'agoda', 'beds24', 'manual', 'online', 'phone', 'email', 'walk_in', 'ical');
    END IF;

    -- Create income_type enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'income_type') THEN
        CREATE TYPE income_type AS ENUM ('booking', 'extra_service', 'deposit', 'other');
    END IF;

    -- Create user_role enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'manager', 'staff');
    END IF;

    -- Create tenant_role enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tenant_role') THEN
        CREATE TYPE tenant_role AS ENUM ('tenant_owner', 'tenant_admin', 'tenant_manager', 'tenant_staff');
    END IF;

    -- Create reservation_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status') THEN
        CREATE TYPE reservation_status AS ENUM ('tentative', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show');
    END IF;
END $$;

-- Now create the tables in the correct order (respecting foreign key dependencies)

-- 1. Create tenants table first (no dependencies)
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  owner_profile_id uuid,
  hotel_name text,
  hotel_address text,
  hotel_phone text,
  hotel_email text,
  hotel_website text,
  hotel_timezone text DEFAULT 'UTC'::text,
  logo_url text,
  onboarding_completed boolean DEFAULT false,
  subscription_status text DEFAULT 'trial'::text CHECK (subscription_status = ANY (ARRAY['trial'::text, 'active'::text, 'past_due'::text, 'cancelled'::text])),
  trial_ends_at timestamp with time zone DEFAULT (now() + '14 days'::interval),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tenants_pkey PRIMARY KEY (id)
);

-- 2. Create profiles table (references auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  name text NOT NULL,
  role user_role NOT NULL DEFAULT 'staff'::user_role,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  tenant_id uuid,
  tenant_role tenant_role DEFAULT 'tenant_staff'::tenant_role,
  is_tenant_admin boolean DEFAULT false,
  first_login_completed boolean NOT NULL DEFAULT false,
  phone character varying,
  is_phone_verified boolean NOT NULL DEFAULT false,
  verification_code character varying DEFAULT NULL::character varying,
  verification_code_expires timestamp with time zone,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT profiles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);

-- Add foreign key constraint to tenants table now that profiles exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tenants_owner_profile_id_fkey' 
        AND table_name = 'tenants'
    ) THEN
        ALTER TABLE public.tenants 
        ADD CONSTRAINT tenants_owner_profile_id_fkey 
        FOREIGN KEY (owner_profile_id) REFERENCES public.profiles(id);
    END IF;
END $$;

-- 3. Create plans table (no dependencies)
CREATE TABLE IF NOT EXISTS public.plans (
  id text NOT NULL,
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD'::text,
  billing_interval text NOT NULL DEFAULT 'month'::text CHECK (billing_interval = ANY (ARRAY['month'::text, 'year'::text])),
  max_locations integer,
  max_rooms integer,
  features jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  product_id text,
  feature_list text[] DEFAULT ARRAY[]::text[],
  CONSTRAINT plans_pkey PRIMARY KEY (id)
);

-- 4. Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid,
  plan_id text,
  status text NOT NULL DEFAULT 'trialing'::text CHECK (status = ANY (ARRAY['trialing'::text, 'active'::text, 'past_due'::text, 'cancelled'::text, 'unpaid'::text])),
  creem_customer_id text,
  creem_subscription_id text,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  trial_end timestamp with time zone,
  cancelled_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  trial_start_date timestamp with time zone,
  trial_end_date timestamp with time zone,
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
  CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id)
);

-- 5. Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid,
  subscription_id uuid,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD'::text,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'open'::text, 'paid'::text, 'void'::text, 'uncollectible'::text])),
  due_date timestamp with time zone,
  paid_at timestamp with time zone,
  creem_invoice_id text,
  invoice_number text UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT invoices_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
  CONSTRAINT invoices_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id)
);

-- 6. Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  tenant_id uuid NOT NULL,
  property_type text,
  address character varying,
  phone character varying,
  email character varying,
  CONSTRAINT locations_pkey PRIMARY KEY (id),
  CONSTRAINT locations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);

-- 7. Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL,
  room_number text NOT NULL,
  room_type text NOT NULL,
  bed_type text NOT NULL,
  max_occupancy integer NOT NULL DEFAULT 2,
  base_price numeric NOT NULL DEFAULT 0,
  currency currency_type NOT NULL DEFAULT 'LKR'::currency_type,
  description text,
  amenities text[],
  property_type text NOT NULL DEFAULT 'Room'::text CHECK (property_type = ANY (ARRAY['Room'::text, 'Villa'::text])),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  tenant_id uuid NOT NULL,
  CONSTRAINT rooms_pkey PRIMARY KEY (id),
  CONSTRAINT rooms_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id),
  CONSTRAINT rooms_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);

-- 8. Create accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  currency currency_type NOT NULL DEFAULT 'LKR'::currency_type,
  initial_balance numeric NOT NULL DEFAULT 0,
  location_access text[] NOT NULL DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  tenant_id uuid NOT NULL,
  CONSTRAINT accounts_pkey PRIMARY KEY (id),
  CONSTRAINT accounts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);

-- 9. Create guides table
CREATE TABLE IF NOT EXISTS public.guides (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  commission_rate numeric NOT NULL DEFAULT 10.0,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  tenant_id uuid NOT NULL,
  address character varying,
  license_number character varying,
  CONSTRAINT guides_pkey PRIMARY KEY (id),
  CONSTRAINT guides_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);

-- 10. Create agents table
CREATE TABLE IF NOT EXISTS public.agents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  agency_name text,
  commission_rate numeric NOT NULL DEFAULT 15.0,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  tenant_id uuid NOT NULL,
  CONSTRAINT agents_pkey PRIMARY KEY (id),
  CONSTRAINT agents_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);

-- 11. Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL,
  room_id uuid,
  source booking_source NOT NULL,
  guest_name text NOT NULL,
  check_in timestamp with time zone NOT NULL,
  check_out timestamp with time zone NOT NULL,
  total_amount numeric NOT NULL,
  advance_amount numeric NOT NULL DEFAULT 0,
  paid_amount numeric NOT NULL DEFAULT 0,
  status booking_status NOT NULL DEFAULT 'pending'::booking_status,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id),
  CONSTRAINT bookings_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id)
);

-- 12. Create reservations table
CREATE TABLE IF NOT EXISTS public.reservations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reservation_number text NOT NULL UNIQUE,
  location_id uuid NOT NULL,
  room_id uuid NOT NULL,
  guest_name text NOT NULL,
  guest_email text,
  guest_phone text,
  guest_address text,
  guest_id_number text,
  guest_nationality text,
  adults integer NOT NULL DEFAULT 1,
  children integer NOT NULL DEFAULT 0,
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  nights integer NOT NULL,
  room_rate numeric NOT NULL,
  total_amount numeric NOT NULL,
  advance_amount numeric DEFAULT 0,
  paid_amount numeric DEFAULT 0,
  balance_amount numeric DEFAULT 0,
  currency currency_type NOT NULL DEFAULT 'LKR'::currency_type,
  status reservation_status NOT NULL DEFAULT 'tentative'::reservation_status,
  special_requests text,
  arrival_time time without time zone,
  guide_id uuid,
  agent_id uuid,
  guide_commission numeric DEFAULT 0,
  agent_commission numeric DEFAULT 0,
  booking_source text CHECK ((booking_source = ANY (ARRAY['direct'::text, 'airbnb'::text, 'booking_com'::text, 'expedia'::text, 'agoda'::text, 'beds24'::text, 'manual'::text, 'online'::text, 'phone'::text, 'email'::text, 'walk_in'::text, 'ical'::text])) OR booking_source IS NULL),
  created_by uuid,
  grc_approved boolean DEFAULT false,
  grc_approved_by uuid,
  grc_approved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  tenant_id uuid,
  guest_passport_number text,
  CONSTRAINT reservations_pkey PRIMARY KEY (id),
  CONSTRAINT reservations_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id),
  CONSTRAINT reservations_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id),
  CONSTRAINT reservations_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES public.guides(id),
  CONSTRAINT reservations_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id),
  CONSTRAINT reservations_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT reservations_grc_approved_by_fkey FOREIGN KEY (grc_approved_by) REFERENCES auth.users(id),
  CONSTRAINT reservations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);

-- 13. Create remaining tables
CREATE TABLE IF NOT EXISTS public.account_transfers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  from_account_id uuid NOT NULL,
  to_account_id uuid NOT NULL,
  amount numeric NOT NULL,
  conversion_rate numeric NOT NULL DEFAULT 1,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT account_transfers_pkey PRIMARY KEY (id),
  CONSTRAINT account_transfers_from_account_id_fkey FOREIGN KEY (from_account_id) REFERENCES public.accounts(id),
  CONSTRAINT account_transfers_to_account_id_fkey FOREIGN KEY (to_account_id) REFERENCES public.accounts(id)
);

CREATE TABLE IF NOT EXISTS public.additional_services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL,
  service_type text NOT NULL,
  service_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  total_amount numeric NOT NULL,
  currency currency_type NOT NULL DEFAULT 'LKR'::currency_type,
  service_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  tenant_id uuid,
  CONSTRAINT additional_services_pkey PRIMARY KEY (id),
  CONSTRAINT additional_services_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations(id),
  CONSTRAINT additional_services_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT additional_services_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);

CREATE TABLE IF NOT EXISTS public.channel_property_mappings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL,
  channel_property_name text NOT NULL,
  channel_type text NOT NULL DEFAULT 'generic'::text,
  mapping_type text NOT NULL DEFAULT 'property'::text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT channel_property_mappings_pkey PRIMARY KEY (id),
  CONSTRAINT channel_property_mappings_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id)
);

CREATE TABLE IF NOT EXISTS public.beds24_property_mappings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL,
  room_id uuid,
  beds24_property_id text NOT NULL,
  beds24_property_name text NOT NULL,
  mapping_type text NOT NULL CHECK (mapping_type = ANY (ARRAY['villa'::text, 'room'::text])),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT beds24_property_mappings_pkey PRIMARY KEY (id),
  CONSTRAINT beds24_property_mappings_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id),
  CONSTRAINT beds24_property_mappings_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id)
);

CREATE TABLE IF NOT EXISTS public.booking_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL,
  amount numeric NOT NULL,
  currency currency_type NOT NULL DEFAULT 'LKR'::currency_type,
  payment_method text NOT NULL,
  account_id uuid NOT NULL,
  is_advance boolean NOT NULL DEFAULT false,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT booking_payments_pkey PRIMARY KEY (id),
  CONSTRAINT booking_payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id),
  CONSTRAINT booking_payments_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id)
);

CREATE TABLE IF NOT EXISTS public.booking_sync_urls (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL,
  source text NOT NULL,
  ical_url text NOT NULL,
  last_synced_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT booking_sync_urls_pkey PRIMARY KEY (id),
  CONSTRAINT booking_sync_urls_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id)
);

CREATE TABLE IF NOT EXISTS public.currency_rates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  from_currency currency_type,
  to_currency currency_type,
  rate numeric,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  currency_code character varying UNIQUE,
  usd_rate numeric,
  is_custom boolean DEFAULT true,
  CONSTRAINT currency_rates_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.expense_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  main_type text NOT NULL,
  sub_type text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT expense_types_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL,
  main_type text NOT NULL,
  sub_type text NOT NULL,
  amount numeric NOT NULL,
  currency currency_type NOT NULL DEFAULT 'LKR'::currency_type,
  account_id uuid NOT NULL,
  note text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT expenses_pkey PRIMARY KEY (id),
  CONSTRAINT expenses_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id),
  CONSTRAINT expenses_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id)
);

CREATE TABLE IF NOT EXISTS public.external_bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  external_id text NOT NULL,
  property_id text NOT NULL,
  source text NOT NULL,
  guest_name text NOT NULL,
  check_in timestamp with time zone NOT NULL,
  check_out timestamp with time zone NOT NULL,
  status text NOT NULL,
  total_amount numeric,
  currency text DEFAULT 'USD'::text,
  location_id uuid,
  room_name text,
  adults integer DEFAULT 1,
  children integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_synced_at timestamp with time zone DEFAULT now(),
  raw_data jsonb,
  CONSTRAINT external_bookings_pkey PRIMARY KEY (id),
  CONSTRAINT external_bookings_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id)
);

CREATE TABLE IF NOT EXISTS public.form_field_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL UNIQUE,
  show_guest_email boolean DEFAULT true,
  show_guest_phone boolean DEFAULT true,
  show_guest_address boolean DEFAULT true,
  show_guest_nationality boolean DEFAULT true,
  show_guest_passport_number boolean DEFAULT true,
  show_guest_id_number boolean DEFAULT false,
  show_adults boolean DEFAULT true,
  show_children boolean DEFAULT true,
  show_arrival_time boolean DEFAULT false,
  show_special_requests boolean DEFAULT true,
  show_advance_amount boolean DEFAULT true,
  show_paid_amount boolean DEFAULT true,
  show_guide boolean DEFAULT true,
  show_agent boolean DEFAULT true,
  show_booking_source boolean DEFAULT false,
  show_id_photos boolean DEFAULT false,
  show_guest_signature boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT form_field_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT form_field_preferences_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);

CREATE TABLE IF NOT EXISTS public.income_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  tenant_id uuid,
  CONSTRAINT income_types_pkey PRIMARY KEY (id),
  CONSTRAINT income_types_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);

CREATE TABLE IF NOT EXISTS public.income (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL,
  type income_type NOT NULL,
  booking_id uuid,
  amount numeric NOT NULL,
  currency currency_type NOT NULL DEFAULT 'LKR'::currency_type,
  is_advance boolean NOT NULL DEFAULT false,
  payment_method text NOT NULL,
  account_id uuid,
  note text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  booking_source text CHECK ((booking_source = ANY (ARRAY['direct'::text, 'airbnb'::text, 'booking_com'::text, 'expedia'::text, 'agoda'::text, 'beds24'::text, 'manual'::text, 'online'::text, 'phone'::text, 'email'::text, 'walk_in'::text, 'ical'::text])) OR booking_source IS NULL),
  check_in_date date,
  check_out_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  tenant_id uuid,
  additional_service_id uuid,
  income_type_id uuid,
  CONSTRAINT income_pkey PRIMARY KEY (id),
  CONSTRAINT income_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id),
  CONSTRAINT income_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id),
  CONSTRAINT income_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
  CONSTRAINT income_additional_service_id_fkey FOREIGN KEY (additional_service_id) REFERENCES public.additional_services(id),
  CONSTRAINT income_income_type_id_fkey FOREIGN KEY (income_type_id) REFERENCES public.income_types(id),
  CONSTRAINT income_reservation_id_fkey FOREIGN KEY (booking_id) REFERENCES public.reservations(id)
);

CREATE TABLE IF NOT EXISTS public.monthly_rent_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL,
  amount numeric NOT NULL,
  account_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT monthly_rent_payments_pkey PRIMARY KEY (id),
  CONSTRAINT monthly_rent_payments_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id),
  CONSTRAINT monthly_rent_payments_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id)
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  payment_number text NOT NULL UNIQUE,
  reservation_id uuid NOT NULL,
  amount numeric NOT NULL,
  currency currency_type NOT NULL DEFAULT 'LKR'::currency_type,
  payment_method text NOT NULL,
  account_id uuid NOT NULL,
  payment_type text NOT NULL,
  reference_number text,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations(id),
  CONSTRAINT payments_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id),
  CONSTRAINT payments_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.room_pricing (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  date date NOT NULL,
  price numeric NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT room_pricing_pkey PRIMARY KEY (id),
  CONSTRAINT room_pricing_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id)
);

CREATE TABLE IF NOT EXISTS public.tenant_limits (
  tenant_id uuid NOT NULL,
  max_locations integer,
  max_rooms integer,
  custom_features jsonb DEFAULT '{}'::jsonb,
  notes text,
  updated_by uuid,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tenant_limits_pkey PRIMARY KEY (tenant_id),
  CONSTRAINT tenant_limits_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
  CONSTRAINT tenant_limits_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.user_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid,
  email text NOT NULL,
  invited_by uuid,
  role text NOT NULL DEFAULT 'staff'::text CHECK (role = ANY (ARRAY['admin'::text, 'manager'::text, 'staff'::text])),
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + '7 days'::interval),
  accepted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  permissions jsonb DEFAULT '{}'::jsonb,
  location_id uuid,
  accepted_by uuid,
  CONSTRAINT user_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT user_invitations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
  CONSTRAINT user_invitations_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.profiles(id),
  CONSTRAINT user_invitations_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id),
  CONSTRAINT user_invitations_accepted_by_fkey FOREIGN KEY (accepted_by) REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.user_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  location_id uuid NOT NULL,
  access_dashboard boolean NOT NULL DEFAULT true,
  access_income boolean NOT NULL DEFAULT true,
  access_expenses boolean NOT NULL DEFAULT true,
  access_reports boolean NOT NULL DEFAULT false,
  access_calendar boolean NOT NULL DEFAULT true,
  access_bookings boolean NOT NULL DEFAULT true,
  access_rooms boolean NOT NULL DEFAULT false,
  access_master_files boolean NOT NULL DEFAULT false,
  access_accounts boolean NOT NULL DEFAULT false,
  access_users boolean NOT NULL DEFAULT false,
  access_settings boolean NOT NULL DEFAULT false,
  access_booking_channels boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  tenant_id uuid,
  tenant_role tenant_role DEFAULT 'tenant_staff'::tenant_role,
  is_tenant_admin boolean DEFAULT false,
  CONSTRAINT user_permissions_pkey PRIMARY KEY (id),
  CONSTRAINT user_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT user_permissions_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id),
  CONSTRAINT user_permissions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.additional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beds24_property_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_sync_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_property_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currency_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_field_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_rent_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you may need to customize these based on your specific requirements)
-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- You'll need to create more specific policies for each table based on your business logic
-- This is just a starting point

-- ========================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ========================================

-- Function to handle new user registration
-- This automatically creates a profile record when a user signs up
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger that fires after a new user is inserted in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

SELECT 'Database schema with profile trigger created successfully!' as message;
