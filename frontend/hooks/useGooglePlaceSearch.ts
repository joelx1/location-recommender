import { useEffect, useState } from "react";
import type { PlaceResult } from "@/types/place";
import { searchGooglePlaces } from "@/services/googlePlaces";

// Shared hook for Google Places text search.
// Pass the search text and optionally disable it when a screen should not query Google.

export const useGooglePlaceSearch = (
  searchText: string,
  options?: {
    enabled?: boolean;
    minLength?: number;
  },
) => {
  const enabled = options?.enabled ?? true;
  const minLength = options?.minLength ?? 2;

  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const runSearch = async () => {
      const keyword = searchText.trim();

      if (!enabled || keyword.length < minLength) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const places = await searchGooglePlaces(keyword);

        if (active) {
          setResults(places);
        }
      } catch (error) {
        console.log("google places search error:", error);

        if (active) {
          setResults([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    runSearch();

    return () => {
      active = false;
    };
  }, [searchText, enabled, minLength]);

  return {
    googleResults: results,
    loadingGoogle: loading,
  };
};
