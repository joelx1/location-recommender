import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useRef, useState, useEffect } from "react";
// import ScreenWrapper from "@/components/ScreenWrapper";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { API_BASE_URL } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

type BackendCoordinates = {
  type: string;
  coordinates: [number, number];
};

type BackendLocation = {
  id: string;
  name: string;
  category: string;
  address: string;
  coordinates: BackendCoordinates | null;
};

type BackendReview = {
  id: string;
  rating: number;
  body: string | null;
  user?: {
    username?: string;
  };
};

type Review = {
  id: string;
  user: string;
  rating: number;
  body: string;
};

type Location = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  category: string;
  address: string;
  reviews: Review[];
};

const INITIAL_REGION = {
  latitude: 53.381,
  longitude: -6.592,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const Search = () => {
  const { token } = useAuth();
  const mapRef = useRef<MapView | null>(null);
  const [searchText, setSearchText] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/locations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data: BackendLocation[] = await response.json();

        const mappedLocations: Location[] = data
          .filter((location) => location.coordinates?.coordinates?.length === 2)
          .map((location) => ({
            id: location.id,
            title: location.name,
            latitude: location.coordinates!.coordinates[1],
            longitude: location.coordinates!.coordinates[0],
            category: location.category,
            address: location.address ?? "No address provided",
            reviews: [],
          }));

        setLocations(mappedLocations);
      } catch (err) {
        console.log("fetch error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load locations",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const filteredLocations = locations.filter((location) =>
    location.title.toLowerCase().includes(searchText.toLowerCase()),
  );

  const showSuggestions =
    searchText.trim().length > 0 &&
    filteredLocations.length > 0 &&
    searchText !== selectedLocation?.title;

  const handleSelectLocation = async (location: Location) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/locations/${location.id}/reviews`,
      );

      if (!response.ok) {
        throw new Error(
          `Reviews request failed with status ${response.status}`,
        );
      }

      const reviewsData: BackendReview[] = await response.json();

      const enrichedLocation = {
        ...location,
        reviews: reviewsData.map((review) => ({
          id: review.id,
          user: review.user?.username ?? "Anonymous",
          rating: review.rating,
          body: review.body ?? "",
        })),
      };

      setSelectedLocation(enrichedLocation);

      mapRef.current?.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      setSearchText(location.title);
    } catch (err) {
      setSelectedLocation({
        ...location,
        reviews: [],
      });
    }
  };

  const handleClearSelection = () => {
    setSelectedLocation(null);
    setSearchText("");
    mapRef.current?.animateToRegion(INITIAL_REGION);
  };

  return (
    // <ScreenWrapper>

    <View style={styles.container}>
      {error ? (
        <Text style={{ color: "red", padding: 16 }}>{error}</Text>
      ) : null}

      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton
        ref={mapRef}
      >
        {locations.map((location, id) => (
          <Marker
            key={location.id}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            onPress={() => handleSelectLocation(location)}
          />
        ))}
      </MapView>

      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search location"
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={() => {
              if (filteredLocations.length > 0) {
                handleSelectLocation(filteredLocations[0]);
              }
            }}
          />

          {searchText.trim().length > 0 && (
            <TouchableOpacity
              onPress={handleClearSelection}
              style={styles.cancelButton}
            >
              <Feather name="x" size={18} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {showSuggestions && (
          <View style={styles.suggestionsList}>
            {filteredLocations.slice(0, 5).map((location) => (
              <TouchableOpacity
                key={location.id}
                style={styles.suggestionItem}
                onPress={() => handleSelectLocation(location)}
              >
                <Text style={styles.suggestionTitle}>{location.title}</Text>
                <Text style={styles.suggestionMeta}>
                  {location.category} · {location.address}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {selectedLocation && (
        <View style={styles.detailCard}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClearSelection}
          >
            <Feather name="x" size={20} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>{selectedLocation.title}</Text>
          <Text style={styles.category}>{selectedLocation.category}</Text>
          <Text style={styles.address}>{selectedLocation.address}</Text>

          <Text style={styles.reviewSection}>Reviews</Text>
          {selectedLocation.reviews.length > 0 ? (
            selectedLocation.reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <Text style={styles.reviewUser}>
                  {review.user} · {review.rating}/5
                </Text>
                <Text style={styles.reviewBody}>{review.body}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noReviewsText}>No reviews yet.</Text>
          )}

          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={() =>
              router.push({
                pathname: "/placeDetails",
                params: { id: selectedLocation.id },
              })
            }
          >
            <Text style={styles.viewMoreText}>View more</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
    // </ScreenWrapper>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  detailCard: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
  },

  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 4,
  },

  category: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: "#444",
    marginBottom: 10,
  },
  reviewSection: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 8,
  },
  reviewCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  reviewUser: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 4,
  },
  reviewBody: {
    fontSize: 13,
    color: "#333",
  },
  noReviewsText: {
    fontSize: 13,
    color: "#777",
  },

  searchWrapper: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 14,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#111",
  },

  viewMoreButton: {
    marginTop: 8,
    alignSelf: "flex-end",
  },

  viewMoreText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2563eb",
  },

  suggestionsList: {
    marginTop: 8,
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  suggestionItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  suggestionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },

  suggestionMeta: {
    marginTop: 2,
    fontSize: 12,
    color: "#666",
  },

  cancelButton: {
    marginLeft: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
