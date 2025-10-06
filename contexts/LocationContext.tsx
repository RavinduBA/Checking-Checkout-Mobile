import React, { createContext, useContext, useEffect, useState } from "react";
import { useUserProfile } from "../hooks/useUserProfile";
import { supabase } from "../lib/supabase";

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

interface LocationContextType {
  selectedLocation: string;
  setSelectedLocation: (locationId: string) => void;
  locations: Location[];
  loading: boolean;
  getSelectedLocationData: () => Location | null;
}

// Create the location context
const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useUserProfile();

  // Fetch locations from Supabase when profile changes
  useEffect(() => {
    const fetchLocations = async () => {
      if (!profile?.tenant_id) {
        setLocations([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("locations")
          .select("*")
          .eq("tenant_id", profile.tenant_id)
          .eq("is_active", true)
          .order("name");

        if (error) throw error;
        setLocations(data || []);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [profile?.tenant_id]);

  // Auto-select first location when locations are loaded
  useEffect(() => {
    if (locations.length > 0 && !selectedLocation) {
      setSelectedLocation(locations[0].id);
    }
  }, [locations, selectedLocation]);

  const getSelectedLocationData = () => {
    if (!selectedLocation) return null;
    return locations.find((loc) => loc.id === selectedLocation) || null;
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation,
        locations,
        loading,
        getSelectedLocationData,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error(
      "useLocationContext must be used within a LocationProvider"
    );
  }
  return context;
}
