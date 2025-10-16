// Database types for mobile app - matching Supabase schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Database enums
export type CurrencyType = "LKR" | "USD" | "EUR" | "GBP";
export type ReservationStatus = 
  | "tentative" 
  | "confirmed" 
  | "checked_in" 
  | "checked_out" 
  | "cancelled";

export type BookingSource = 
  | "direct" 
  | "airbnb" 
  | "booking_com" 
  | "beds24" 
  | "manual";

export type TenantRole = 
  | "tenant_admin" 
  | "tenant_billing" 
  | "tenant_manager" 
  | "tenant_staff";

// Database structure (simplified for mobile)
export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          hotel_name?: string;
          hotel_address?: string;
          hotel_phone?: string;
          hotel_email?: string;
          hotel_website?: string;
          logo_url?: string;
          owner_profile_id: string;
          trial_ends_at?: string;
          onboarding_completed: boolean;
          created_at: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          tenant_id?: string;
          tenant_role?: TenantRole;
          is_tenant_admin: boolean;
          first_login_completed: boolean;
          phone?: string;
          created_at: string;
          updated_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          name: string;
          address?: string;
          phone?: string;
          email?: string;
          property_type?: string;
          is_active: boolean;
          tenant_id: string;
          created_at: string;
          updated_at?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          room_number: string;
          room_type: string;
          bed_type?: string;
          description?: string;
          base_rate: number;
          currency: CurrencyType;
          is_active: boolean;
          location_id: string;
          tenant_id: string;
          created_at: string;
          updated_at?: string;
        };
      };
      reservations: {
        Row: {
          id: string;
          reservation_number: string;
          guest_name: string;
          guest_email?: string;
          guest_phone?: string;
          guest_nationality?: string;
          adults: number;
          children: number;
          check_in_date: string;
          check_out_date: string;
          nights: number;
          room_id: string;
          room_rate: number;
          total_amount: number;
          paid_amount?: number;
          balance_amount?: number;
          currency: CurrencyType;
          status: ReservationStatus;
          special_requests?: string;
          arrival_time?: string;
          booking_source?: BookingSource;
          guide_id?: string;
          agent_id?: string;
          location_id: string;
          tenant_id: string;
          created_by: string;
          updated_by?: string;
          created_at: string;
          updated_at?: string;
        };
      };
      accounts: {
        Row: {
          id: string;
          name: string;
          account_type: string;
          currency: CurrencyType;
          balance: number;
          description?: string;
          is_active: boolean;
          location_id: string;
          tenant_id: string;
          created_at: string;
          updated_at?: string;
        };
      };
      income: {
        Row: {
          id: string;
          booking_id?: string;
          amount: number;
          currency: CurrencyType;
          payment_method: string;
          account_id: string;
          date: string;
          note?: string;
          type?: string;
          description?: string;
          location_id: string;
          tenant_id: string;
          created_by: string;
          created_at: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          booking_id?: string;
          amount: number;
          currency: CurrencyType;
          account_id: string;
          date: string;
          note?: string;
          type?: string;
          description?: string;
          location_id: string;
          tenant_id: string;
          created_by: string;
          created_at: string;
          updated_at?: string;
        };
      };
      guides: {
        Row: {
          id: string;
          name: string;
          phone?: string;
          email?: string;
          commission_rate?: number;
          is_active: boolean;
          location_id: string;
          tenant_id: string;
          created_at: string;
          updated_at?: string;
        };
      };
      agents: {
        Row: {
          id: string;
          name: string;
          phone?: string;
          email?: string;
          commission_rate?: number;
          is_active: boolean;
          location_id: string;
          tenant_id: string;
          created_at: string;
          updated_at?: string;
        };
      };
    };
    Enums: {
      currency_type: CurrencyType;
      reservation_status: ReservationStatus;
      booking_source: BookingSource;
      tenant_role: TenantRole;
    };
  };
}

// Export the currency type for compatibility
export type Currency = Database["public"]["Enums"]["currency_type"];
