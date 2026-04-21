import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useAuth } from "@/context/AuthContext";
import type { PlaceResult } from "@/types/place";
import { filterPlacesByKeyword } from "@/services/placeMapper";
import PlaceSearchList from "@/components/places/PlaceSearchList";
import { router } from "expo-router";
import { useGooglePlaceSearch } from "@/hooks/useGooglePlaceSearch";
import { useBackendPlaces } from "@/hooks/useBackendPlaces";

const Add = () => {
  const { token } = useAuth();

  const [searchText, setSearchText] = useState("");
  const {
    places: locations,
    loading: loadingLocations,
    error: locationsError,
  } = useBackendPlaces(token);

  const { googleResults } = useGooglePlaceSearch(searchText);

  const filteredDbResults = filterPlacesByKeyword(locations, searchText);

  const combinedResults = [
    ...filteredDbResults,
    ...googleResults.filter(
      (googlePlace) =>
        !filteredDbResults.some(
          (dbPlace) =>
            dbPlace.googlePlaceId &&
            dbPlace.googlePlaceId === googlePlace.googlePlaceId,
        ),
    ),
  ];

  const handleSelectPlace = (place: PlaceResult) => {
    router.push({
      pathname: "/addReview",
      params: {
        source: place.source,
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

  const handleClearSearch = () => {
    setSearchText("");
  };
  return (
    <ScreenWrapper style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.searchStep}>
          <Text style={styles.pageTitle}>Add a Review</Text>
          <PlaceSearchList
            value={searchText}
            onChangeText={setSearchText}
            onClear={handleClearSearch}
            results={combinedResults}
            loading={loadingLocations}
            error={locationsError}
            onSelectPlace={handleSelectPlace}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default Add;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },

  searchStep: {
    flexGrow: 1,
  },

  pageTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 16,
    textAlign: "center",
  },
});
