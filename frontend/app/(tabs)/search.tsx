import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useRef, useState, useEffect, useCallback } from "react";
// import ScreenWrapper from "@/components/ScreenWrapper";
import MapView, { Marker } from "react-native-maps";
import { router, useFocusEffect } from "expo-router";
import { API_BASE_URL } from "@/services/api";
import type { PlaceResult } from "@/types/place";
import { useAuth } from "@/context/AuthContext";
import { useGooglePlaceSearch } from "@/hooks/useGooglePlaceSearch";
import LocationDetailCard from "@/components/places/LocationDetailCard";
import type { MapLocation } from "@/components/places/LocationDetailCard";
import { useBackendPlaces } from "@/hooks/useBackendPlaces";
import SearchBar from "@/components/search/SearchBar";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  isSamePlaceByNameAndAddress,
  normalizePlaceText,
} from "@/services/placeMapper";
import { theme } from "@/theme";

type BackendReview = {
  id: string;
  rating: number;
  body: string | null;
  createdAt?: string;
  user?: {
    username?: string;
    profilePic?: string | null;
  };
};

type FeedReview = {
  id: string;
  locationId?: string;
  location?: {
    id?: string;
  };
};

const Search = () => {
  const { token, user } = useAuth();
  const mapRef = useRef<MapView | null>(null);
  const { coords } = useCurrentLocation();
  const insets = useSafeAreaInsets();

  const [searchText, setSearchText] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
    null,
  );
  const [markerResetKey, setMarkerResetKey] = useState(0);

  const [friendReviewCountByLocation, setFriendReviewCountByLocation] =
    useState<Map<string, number>>(new Map());
  const { googleResults, loadingGoogle } = useGooglePlaceSearch(searchText, {
    enabled: searchText !== selectedLocation?.title,
  });

  const { places, error, refreshPlaces } = useBackendPlaces(token);

  const fetchFriendFeed = useCallback(async () => {
    if (!token || !user?.id) {
      setFriendReviewCountByLocation(new Map());
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}/feed`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Feed request failed with status ${response.status}`);
      }

      const data: FeedReview[] = await response.json();
      const counts = new Map<string, number>();

      data.forEach((item) => {
        const locationId = item.locationId || item.location?.id;
        if (!locationId) return;

        counts.set(locationId, (counts.get(locationId) ?? 0) + 1);
      });

      setFriendReviewCountByLocation(counts);
    } catch (err) {
      console.log("fetch friend feed error:", err);
      setFriendReviewCountByLocation(new Map());
    }
  }, [token, user?.id]);

  const mapRegion = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  useFocusEffect(
    useCallback(() => {
      setSelectedLocation(null);
      setSearchText("");
      setMarkerResetKey((key) => key + 1);
      refreshPlaces();
      fetchFriendFeed();
      mapRef.current?.animateToRegion(mapRegion);
    }, [refreshPlaces, fetchFriendFeed, coords.latitude, coords.longitude]),
  );

  useEffect(() => {
    mapRef.current?.animateToRegion(mapRegion);
  }, [coords.latitude, coords.longitude]);

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
      friendReviewCount: friendReviewCountByLocation.get(place.id) ?? 0,
    }));

  const searchKeyword = normalizePlaceText(searchText);

  const filteredLocations = locations.filter((location) =>
    normalizePlaceText(location.title).includes(searchKeyword),
  );

  const googleResultsWithoutExistingLocations = googleResults.filter(
    (googlePlace) =>
      !locations.some((location) =>
        isSamePlaceByNameAndAddress(
          { name: location.title, address: location.address },
          googlePlace,
        ),
      ),
  );

  const showSuggestions =
    searchText.trim().length > 0 &&
    searchText !== selectedLocation?.title &&
    (filteredLocations.length > 0 ||
      googleResultsWithoutExistingLocations.length > 0 ||
      loadingGoogle);

  const handleSelectLocation = async (location: MapLocation) => {
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

      const sortedReviews = [...reviewsData].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

        return timeB - timeA;
      });

      const enrichedLocation = {
        ...location,
        reviews: sortedReviews.slice(0, 2).map((review) => ({
          id: review.id,
          user: review.user?.username ?? "Anonymous",
          rating: review.rating,
          body: review.body ?? "",
          profilePic: review.user?.profilePic ?? null,
        })),
      };

      setSelectedLocation(enrichedLocation);
    } catch (err) {
      console.log("reviews fetch error:", err);

      setSelectedLocation({
        ...location,
        reviews: [],
      });
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
    setMarkerResetKey((key) => key + 1);
    mapRef.current?.animateToRegion(mapRegion);
  };

  return (
    // <ScreenWrapper>

    <View style={styles.container}>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={mapRegion}
        showsUserLocation
        showsMyLocationButton
        ref={mapRef}
      >
        {locations.map((location, id) => (
          <Marker
            key={`${location.id}-${markerResetKey}`}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            pinColor={
              location.friendReviewCount && location.friendReviewCount > 0
                ? theme.colors.accent
                : undefined
            }
            onPress={() => handleSelectLocation(location)}
          />
        ))}
      </MapView>

      <View style={[styles.searchWrapper, { top: insets.top + 12 }]}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search location"
          onSubmitEditing={() => {
            if (filteredLocations.length > 0) {
              handleSelectLocation(filteredLocations[0]);
            }
          }}
          onClear={handleClearSelection}
          variant="floating"
        />

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
          bottomOffset={16}
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
    left: 16,
    right: 16,
  },

  suggestionsList: {
    marginTop: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    paddingVertical: 6,
    shadowColor: theme.colors.shadow,
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
    color: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: "hidden",
  },

  suggestionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    flex: 1,
  },

  suggestionMeta: {
    marginTop: 2,
    fontSize: 12,
    color: theme.colors.textMuted,
  },

  errorText: {
    color: theme.colors.danger,
    padding: 16,
  },
});
