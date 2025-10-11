import { useLocations } from "../hooks/useLocations";

export function useLocationContext() {
  const { locations, loading, error } = useLocations();
  // For mobile, select the first location as selectedLocation
  const selectedLocation = locations && locations.length > 0 ? locations[0].id : null;
  return { selectedLocation };
}
