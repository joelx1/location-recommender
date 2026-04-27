import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PlaceCategoryImage from "@/components/places/PlaceCategoryImage";

export type PopularPlace = {
  id: string;
  title: string;
  category: string;
  address: string;
  meta: string;
  hasReviews: boolean;
};

type Props = {
  mode: "popular" | "nearby";
  places: PopularPlace[];
  onSelectPlace: (place: PopularPlace) => void;
};

const PopularPlacesCarousel = ({ mode, places, onSelectPlace }: Props) => {
  if (places.length === 0) return null;

  return (
    <>
      <Text style={styles.sectionTitle}>
        {mode === "popular" ? "Popular Nearby" : "Nearby Places"}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.popularScroll}
        contentContainerStyle={styles.popularScrollContent}
      >
        {places.map((place) => (
          <TouchableOpacity
            key={place.id}
            style={styles.popularCard}
            onPress={() => onSelectPlace(place)}
            activeOpacity={0.85}
          >
            <PlaceCategoryImage
              category={place.category}
              style={styles.popularCardImage}
            />

            <View style={styles.popularCardOverlay} />

            <View style={styles.popularCardContent}>
              <Text style={styles.popularCardTitle} numberOfLines={1}>
                {place.title}
              </Text>

              <Text style={styles.popularCardMeta} numberOfLines={1}>
                {place.hasReviews
                  ? `${place.category} · ${place.meta}`
                  : place.category}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111",
  },

  popularScroll: {
    marginHorizontal: -20,
    marginTop: 14,
    marginBottom: 24,
  },

  popularScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 2,
  },

  popularCard: {
    width: 236,
    height: 152,
    marginRight: 14,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#EEEEEE",
  },

  popularCardImage: {
    width: "100%",
    height: "100%",
  },

  popularCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },

  popularCardContent: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
  },

  popularCardTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
  },

  popularCardMeta: {
    marginTop: 3,
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "700",
  },
});

export default PopularPlacesCarousel;
