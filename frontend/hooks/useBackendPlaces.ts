import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "@/services/api";
import type { BackendLocation, PlaceResult } from "@/types/place";
import { mapBackendLocationToPlaceResult } from "@/services/placeMapper";

// Shared hook for screens that need saved database places

export const useBackendPlaces = (token: string | null) => {
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPlaces = useCallback(async () => {
    if (!token) {
      setPlaces([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/locations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to load locations (${response.status})`);
      }

      const data: BackendLocation[] = await response.json();

      setPlaces(data.map(mapBackendLocationToPlaceResult));
    } catch (error) {
      console.log("fetch locations error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load locations.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshPlaces();
  }, [refreshPlaces]);

  return {
    places,
    loading,
    error,
    refreshPlaces,
  };
};
