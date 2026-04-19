import type { BackendLocation, PlaceResult } from "@/types/place";

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
