const PLACE_IMAGES = {
  cafe: require("@/assets/images/place-cafe.jpg"),
  restaurant: require("@/assets/images/place-restaurant.jpg"),
  bar: require("@/assets/images/place-bar.jpg"),
  default: require("@/assets/images/place-bar.jpg"),
};

export const getPlaceImage = (category: string) => {
  const normalized = category.trim().toLowerCase();

  if (
    normalized.includes("cafe") ||
    normalized.includes("coffee") ||
    normalized.includes("bakery")
  ) {
    return PLACE_IMAGES.cafe;
  }

  if (
    normalized.includes("restaurant") ||
    normalized.includes("food") ||
    normalized.includes("meal")
  ) {
    return PLACE_IMAGES.restaurant;
  }

  if (
    normalized.includes("bar") ||
    normalized.includes("pub") ||
    normalized.includes("night_club")
  ) {
    return PLACE_IMAGES.bar;
  }

  return PLACE_IMAGES.default;
};
