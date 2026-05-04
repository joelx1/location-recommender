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
  const keyword = normalizePlaceText(rawKeyword);

  if (!keyword) return places;

  return places.filter((place) => {
    return (
      normalizePlaceText(place.name).includes(keyword) ||
      normalizePlaceText(place.address).includes(keyword) ||
      normalizePlaceText(place.category).includes(keyword)
    );
  });
};

export const normalizePlaceText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

export const isSamePlaceByNameAndAddress = (
  first: { name: string; address: string },
  second: { name: string; address: string },
) => {
  return (
    normalizePlaceText(first.name) === normalizePlaceText(second.name) &&
    normalizePlaceText(first.address) === normalizePlaceText(second.address)
  );
};
