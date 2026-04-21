import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useRef, useState, useEffect } from "react";
// import ScreenWrapper from "@/components/ScreenWrapper";
import MapView, { Marker } from "react-native-maps";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { API_BASE_URL } from "@/services/api";
import type { PlaceResult } from "@/types/place";
import { useAuth } from "@/context/AuthContext";
import { useGooglePlaceSearch } from "@/hooks/useGooglePlaceSearch";
import LocationDetailCard from "@/components/places/LocationDetailCard";
import type { MapLocation } from "@/components/places/LocationDetailCard";
import { useBackendPlaces } from "@/hooks/useBackendPlaces";

type BackendReview = {
  id: string;
  rating: number;
  body: string | null;
  user?: {
    username?: string;
  };
};

// Temporary
const INITIAL_REGION = {
  latitude: 53.3498,
  longitude: -6.2603,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const Search = () => {
  const { token } = useAuth();
  const mapRef = useRef<MapView | null>(null);
  const [searchText, setSearchText] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
    null,
  );
  const { googleResults, loadingGoogle } = useGooglePlaceSearch(searchText, {
    enabled: searchText !== selectedLocation?.title,
  });

  const { places, error } = useBackendPlaces(token);

  const locations: MapLocation[] = places
    .filter((place) => place.latitude != null && place.longitude != null)
    .map((place) => ({
      id: place.id,
      title: place.name,
      latitude: place.latitude!,
      longitude: place.longitude!,
      category: place.category,
      address: place.address,
      reviews: [],
    }));

  const normalizePlaceText = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ");

  const searchKeyword = normalizePlaceText(searchText);

  const filteredLocations = locations.filter((location) =>
    normalizePlaceText(location.title).includes(searchKeyword),
  );

  const googleResultsWithoutExistingLocations = googleResults.filter(
    (googlePlace) =>
      !locations.some((location) => {
        const sameName =
          normalizePlaceText(location.title) ===
          normalizePlaceText(googlePlace.name);

        const sameAddress =
          normalizePlaceText(location.address) ===
          normalizePlaceText(googlePlace.address);

        return sameName && sameAddress;
      }),
  );

  const showSuggestions =
    searchText.trim().length > 0 &&
    searchText !== selectedLocation?.title &&
    (filteredLocations.length > 0 ||
      googleResultsWithoutExistingLocations.length > 0 ||
      loadingGoogle);

  const handleSelectLocation = async (location: MapLocation) => {
    setSelectedLocation({
      ...location,
      reviews: [],
    });

    mapRef.current?.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });

    setSearchText(location.title);

    try {
      const response = await fetch(
        `${API_BASE_URL}/locations/${location.id}/reviews`,
        { headers: { Authorization: `Bearer ${token}` } },
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
    } catch (err) {
      console.log("reviews fetch error:", err);
    }
  };

  const handleSelectGooglePlace = (place: PlaceResult) => {
    router.push({
      pathname: "/addReview",
      params: {
        source: "google",
        id: place.id,
        googlePlaceId: place.googlePlaceId,
        name: place.name,
        address: place.address,
        category: place.category,
        latitude: place.latitude != null ? String(place.latitude) : undefined,
        longitude:
          place.longitude != null ? String(place.longitude) : undefined,
      },
    });
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
            {loadingGoogle ? (
              <View style={styles.suggestionItem}>
                <Text style={styles.suggestionMeta}>Searching places...</Text>
              </View>
            ) : null}

            {googleResultsWithoutExistingLocations.slice(0, 5).map((place) => (
              <TouchableOpacity
                key={`google-${place.id}`}
                style={styles.suggestionItem}
                onPress={() => handleSelectGooglePlace(place)}
              >
                <View style={styles.suggestionTitleRow}>
                  <Text style={styles.suggestionTitle}>{place.name}</Text>
                  <Text style={styles.newPlaceBadge}>New</Text>
                </View>

                <Text style={styles.suggestionMeta}>
                  {place.category} · {place.address}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {selectedLocation && (
        <LocationDetailCard
          location={selectedLocation}
          onClose={handleClearSelection}
          onViewMore={() =>
            router.push({
              pathname: "/placeDetails",
              params: { id: selectedLocation.id },
            })
          }
        />
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

  suggestionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  newPlaceBadge: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2563eb",
    backgroundColor: "#eaf2ff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: "hidden",
  },

  suggestionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    flex: 1,
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
