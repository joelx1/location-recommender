import type { PlaceResult } from "@/types/place";

const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

if (!GOOGLE_PLACES_API_KEY) {
  throw new Error("EXPO_PUBLIC_GOOGLE_PLACES_API_KEY is not set");
}

export type GooglePlacesTextSearchResponse = {
  results?: GooglePlaceResult[];
};

export type GooglePlaceResult = {
  place_id: string;
  name: string;
  formatted_address: string;
  types?: string[];
  geometry?: {
    location?: {
      lat: number;
      lng: number;
    };
  };
};

export const mapGooglePlaceToPlaceResult = (
  place: GooglePlaceResult,
): PlaceResult => ({
  id: place.place_id,
  googlePlaceId: place.place_id,
  name: place.name,
  address: place.formatted_address,
  category: place.types?.[0] ?? "place",
  latitude: place.geometry?.location?.lat,
  longitude: place.geometry?.location?.lng,
  source: "google",
});

export const searchGooglePlaces = async (
  query: string,
): Promise<PlaceResult[]> => {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const url =
    `https://maps.googleapis.com/maps/api/place/textsearch/json` +
    `?query=${encodeURIComponent(trimmedQuery)}` +
    `&key=${GOOGLE_PLACES_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Google Places request failed (${response.status})`);
  }

  const data: GooglePlacesTextSearchResponse = await response.json();

  return (data.results ?? []).map(mapGooglePlaceToPlaceResult);
};
