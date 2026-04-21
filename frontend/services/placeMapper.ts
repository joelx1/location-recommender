import type { BackendLocation, PlaceResult } from "@/types/place";

// Converts backend Location JSON into the shared PlaceResult shape used by place search UI.

export const mapBackendLocationToPlaceResult = (
  location: BackendLocation,
): PlaceResult => ({
  id: location.id,
  name: location.name,
  address: location.address ?? "No address provided",
  category: location.category,
  latitude: location.coordinates?.coordinates?.[1],
  longitude: location.coordinates?.coordinates?.[0],
  source: "db",
});

// Shared keyword filter for saved places; matches name, address, or category.

export const filterPlacesByKeyword = (
  places: PlaceResult[],
  rawKeyword: string,
) => {
  const keyword = rawKeyword.trim().toLowerCase();

  if (!keyword) return places;

  return places.filter((place) => {
    return (
      place.name.toLowerCase().includes(keyword) ||
      place.address.toLowerCase().includes(keyword) ||
      place.category.toLowerCase().includes(keyword)
    );
  });
};
