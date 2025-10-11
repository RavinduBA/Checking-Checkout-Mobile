// Database types for the mobile app
// These should match the Supabase schema

export interface Account {
  id: string;
  name: string;
  currency: 'LKR' | 'USD'; // Restricted to only LKR and USD
  current_balance: number;
  initial_balance: number;
  location_access: string[];
  tenant_id: string;
  created_at: string;
  updated_at?: string | null;
}

export interface Location {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  tenant_id: string;
  property_type?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface Tenant {
  id: string;
  name: string;
  owner_profile_id: string;
  trial_ends_at: string | null;
  onboarding_completed: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  tenant_id: string | null;
  tenant_role: string;
  is_tenant_admin: boolean;
  first_login_completed: boolean;
  phone?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  currency: string;
  account_id: string;
  account_name: string;
}

// Helper types
export type AccountWithBalance = Account & { currentBalance: number };
export type CurrencyType = 'LKR' | 'USD' | 'EUR' | 'GBP';
