import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { WardService } from "@/services/WardService";

export function useWards() {
  return useQuery({
    queryKey: ["wards"],
    queryFn: () => WardService.getAllWards(),
    staleTime: 5 * 60 * 1000, // 5 minutes - wards don't change often
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
}

export function useUserLocation() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const position = await WardService.getCurrentLocation();
      setLocation(position);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get location");
      setLocation(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    location,
    error,
    isLoading,
    getCurrentLocation,
  };
}

export function useNearestWard() {
  const { data: wards = [] } = useWards();
  const { location, getCurrentLocation, isLoading: locationLoading, error: locationError } = useUserLocation();
  const [nearestWard, setNearestWard] = useState<number | null>(null);
  const [hasAttemptedLocation, setHasAttemptedLocation] = useState(false);

  // Automatically request location when wards are available and we haven't tried yet
  useEffect(() => {
    if (wards.length > 0 && !location && !hasAttemptedLocation && !locationLoading) {
      setHasAttemptedLocation(true);
      getCurrentLocation();
    }
  }, [wards.length, location, hasAttemptedLocation, locationLoading, getCurrentLocation]);

  useEffect(() => {
    if (location && wards.length > 0) {
      const nearest = WardService.findNearestWard(
        location.latitude,
        location.longitude,
        wards
      );
      setNearestWard(nearest);
    } else {
      setNearestWard(null);
    }
  }, [location, wards]);

  return {
    nearestWard,
    wards,
    location,
    locationLoading,
    locationError,
    getCurrentLocation,
  };
}
