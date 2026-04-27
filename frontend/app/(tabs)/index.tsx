import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import ScreenWrapper from "@/components/ScreenWrapper";
import * as ExpoLocation from "expo-location";
import { API_BASE_URL } from "@/services/api";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import SearchBar from "@/components/search/SearchBar";
import { useGooglePlaceSearch } from "@/hooks/useGooglePlaceSearch";
import type { PlaceResult } from "@/types/place";
import ProximityBannerCard from "@/components/home/ProximityBannerCard";
import PopularPlacesCarousel, {
  type PopularPlace,
} from "@/components/home/PopularPlacesCarousel";
import ReviewActivityCard from "@/components/reviews/ReviewActivityCard";
import HomeSearchSuggestions, {
  type HomeSearchPlace,
  type HomeSearchUser,
} from "@/components/home/HomeSearchSuggestions";

type LocationSummary = {
  id: string;
  name: string;
  category: string;
  address: string | null;
  latitude?: number | null;
  longitude?: number | null;
  reviewCount?: number | null;
  averageRating?: number | null;
  bayesianScore?: number | null;
};

type UserSummary = {
  id: string;
  username: string;
  profilePic?: string | null;
  bio?: string | null;
};

type FeedItem = {
  id: string;
  userId?: string;
  username?: string;
  profilePic?: string | null;
  locationId?: string;
  locationName?: string;
  locationCategory?: string | null;
  locationAddress?: string | null;
  rating: number;
  body?: string | null;
  photoUrl?: string | null;
  createdAt?: string;
  user?: {
    id?: string;
    username?: string;
    profilePic?: string | null;
  };
  location?: {
    id?: string;
    name?: string;
    category?: string | null;
    address?: string | null;
  };
};

type ProximityBanner = {
  locationId: string;
  locationName: string;
  username: string;
  rating?: number | null;
  isNearby: boolean;
};

const DUBLIN_COORDS = {
  latitude: 53.3498,
  longitude: -6.2603,
};

const normalizeText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

const Index = () => {
  const { token, user } = useAuth();

  const [location, setLocation] = useState("Loading...");
  const [coords, setCoords] = useState(DUBLIN_COORDS);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [placeResults, setPlaceResults] = useState<HomeSearchPlace[]>([]);
  const [userResults, setUserResults] = useState<HomeSearchUser[]>([]);

  const [popularPlaces, setPopularPlaces] = useState<PopularPlace[]>([]);
  const [popularMode, setPopularMode] = useState<"popular" | "nearby">(
    "popular",
  );

  const [friendPosts, setFriendPosts] = useState<FeedItem[]>([]);
  const [proximityBanner, setProximityBanner] =
    useState<ProximityBanner | null>(null);
  const [isProximityBannerDismissed, setProximityBannerDismissed] =
    useState(false);

  const { googleResults, loadingGoogle } = useGooglePlaceSearch(searchText, {
    enabled: searchText.trim().length >= 2,
  });

  const refreshLocation = useCallback(async () => {
    try {
      setLoadingLocation(true);

      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocation("Permission denied");
        setCoords(DUBLIN_COORDS);
        return;
      }

      const loc = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Highest,
      });

      const nextCoords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      setCoords(nextCoords);

      const coordsText = `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`;
      setLocation(coordsText);

      try {
        const address = await ExpoLocation.reverseGeocodeAsync(nextCoords);

        if (address.length > 0) {
          setLocation(address[0].city || address[0].region || coordsText);
        }
      } catch (reverseError) {
        console.log("Reverse geocode failed:", reverseError);
      }
    } catch (error) {
      console.log("Location error:", error);
      setLocation("Location unavailable");
      setCoords(DUBLIN_COORDS);
    } finally {
      setLoadingLocation(false);
    }
  }, []);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  useEffect(() => {
    const fetchHomeData = async () => {
      if (!token || !user?.id) return;

      const authHeaders = { Authorization: `Bearer ${token}` };

      try {
        const [feedResponse, nearbyResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/users/${user.id}/feed`, {
            headers: authHeaders,
          }),
          fetch(
            `${API_BASE_URL}/locations/nearby/ranked?lat=${coords.latitude}&lng=${coords.longitude}&km=10`,
            { headers: authHeaders },
          ),
        ]);

        if (!feedResponse.ok) {
          throw new Error(`Feed request failed: ${feedResponse.status}`);
        }

        if (!nearbyResponse.ok) {
          throw new Error(`Nearby request failed: ${nearbyResponse.status}`);
        }

        const feedData: FeedItem[] = await feedResponse.json();
        const nearbyData: LocationSummary[] = await nearbyResponse.json();

        setFriendPosts(feedData);

        const nearbyLocationIds = new Set(nearbyData.map((place) => place.id));

        const nearbyFriendPost = feedData.find((post) => {
          const postLocationId = post.locationId || post.location?.id;

          return (
            postLocationId &&
            nearbyLocationIds.has(postLocationId) &&
            post.rating >= 4
          );
        });

        // Prefer a true nearby friend recommendation. If none exists, fall back to a high-rated friend review so the demo still shows the proximity entry point.
        const fallbackFriendPost = feedData.find((post) => post.rating >= 4);
        const bannerPost = nearbyFriendPost || fallbackFriendPost;

        if (!isProximityBannerDismissed && bannerPost) {
          const bannerLocationId =
            bannerPost.locationId || bannerPost.location?.id;
          const bannerLocationName =
            bannerPost.locationName ||
            bannerPost.location?.name ||
            "a place nearby";
          const bannerUsername =
            bannerPost.username || bannerPost.user?.username || "A friend";

          if (bannerLocationId) {
            setProximityBanner({
              locationId: bannerLocationId,
              locationName: bannerLocationName,
              username: bannerUsername,
              rating: bannerPost.rating,
              isNearby: Boolean(nearbyFriendPost),
            });
          } else {
            setProximityBanner(null);
          }
        } else if (!isProximityBannerDismissed) {
          setProximityBanner(null);
        }

        const reviewedPlaces = nearbyData.filter(
          (place) => (place.reviewCount ?? 0) > 0,
        );

        const sourcePlaces =
          reviewedPlaces.length > 0 ? reviewedPlaces : nearbyData;

        setPopularMode(reviewedPlaces.length > 0 ? "popular" : "nearby");

        setPopularPlaces(
          sourcePlaces.slice(0, 5).map((place) => {
            const hasReviews = (place.reviewCount ?? 0) > 0;

            return {
              id: place.id,
              title: place.name,
              category: place.category,
              address: place.address ?? "No address",
              meta: hasReviews
                ? `${place.averageRating?.toFixed(1) ?? "0.0"} star`
                : place.category,
              hasReviews,
            };
          }),
        );
      } catch (err) {
        console.log("Failed to fetch home data:", err);
      }
    };

    fetchHomeData();
  }, [
    token,
    user?.id,
    coords.latitude,
    coords.longitude,
    isProximityBannerDismissed,
  ]);

  useEffect(() => {
    const search = async () => {
      if (!token) return;

      const keyword = searchText.trim();

      if (keyword.length < 2) {
        setPlaceResults([]);
        setUserResults([]);
        return;
      }

      const authHeaders = { Authorization: `Bearer ${token}` };

      const [placesResult, usersResult] = await Promise.allSettled([
        fetch(
          `${API_BASE_URL}/locations/search?q=${encodeURIComponent(keyword)}`,
          { headers: authHeaders },
        ).then(async (response) => {
          if (!response.ok) {
            throw new Error(`Place search failed: ${response.status}`);
          }

          return (await response.json()) as LocationSummary[];
        }),

        // Temporary workaround: the deployed Azure backend currently returns 400 for /users/search?q=, so Home fetches all users and filters by username locally.

        fetch(`${API_BASE_URL}/users`, { headers: authHeaders }).then(
          async (response) => {
            if (!response.ok) {
              throw new Error(`User list failed: ${response.status}`);
            }

            const users = (await response.json()) as UserSummary[];

            return users
              .filter(
                (resultUser) =>
                  resultUser.id !== user?.id &&
                  resultUser.username
                    .toLowerCase()
                    .includes(keyword.toLowerCase()),
              )
              .slice(0, 20);
          },
        ),
      ]);

      if (placesResult.status === "fulfilled") {
        setPlaceResults(
          placesResult.value.map((place) => ({
            type: "place",
            id: place.id,
            title: place.name,
            category: place.category,
            address: place.address ?? "No address",
          })),
        );
      } else {
        console.log("Place search error:", placesResult.reason);
        setPlaceResults([]);
      }

      if (usersResult.status === "fulfilled") {
        setUserResults(
          usersResult.value.map((resultUser) => ({
            type: "user",
            id: resultUser.id,
            username: resultUser.username,
            bio: resultUser.bio,
            profilePic: resultUser.profilePic,
          })),
        );
      } else {
        console.log("User search error:", usersResult.reason);
        setUserResults([]);
      }
    };

    const timeout = setTimeout(search, 300);
    return () => clearTimeout(timeout);
  }, [searchText, token, user?.id]);

  const googleResultsWithoutExistingPlaces = googleResults.filter(
    (googlePlace) =>
      !placeResults.some(
        (dbPlace) =>
          normalizeText(dbPlace.title) === normalizeText(googlePlace.name),
      ),
  );

  const showSuggestions =
    searchText.trim().length >= 2 &&
    (userResults.length > 0 ||
      placeResults.length > 0 ||
      googleResultsWithoutExistingPlaces.length > 0 ||
      loadingGoogle);

  const showProximityBanner = !isProximityBannerDismissed
    ? proximityBanner
    : null;

  const visiblePosts = friendPosts.slice(0, 2);

  const getPostLocationId = (post: FeedItem) =>
    post.locationId || post.location?.id;

  const handleClear = () => {
    setSearchText("");
    setPlaceResults([]);
    setUserResults([]);
  };

  const handleSelectLocation = (place: { id: string }) => {
    handleClear();

    router.push({
      pathname: "/placeDetails",
      params: { id: place.id },
    });
  };

  const handleSelectUser = (resultUser: HomeSearchUser) => {
    handleClear();

    router.push({
      pathname: "/friendProfile",
      params: { id: resultUser.id },
    });
  };

  const handleSelectGooglePlace = (place: PlaceResult) => {
    handleClear();

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

  return (
    <ScreenWrapper style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.brandTitle}>PlaceMark</Text>

          <TouchableOpacity
            style={styles.locationSelector}
            onPress={refreshLocation}
            activeOpacity={0.7}
          >
            <Feather name="map-pin" size={14} color="#666" />
            <Text style={styles.locationLabel} numberOfLines={1}>
              {loadingLocation ? "Locating..." : location}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchArea}>
          <SearchBar
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search places, friends..."
            onClear={handleClear}
            style={styles.homeSearchBar}
          />

          <HomeSearchSuggestions
            visible={showSuggestions}
            users={userResults}
            places={placeResults}
            googlePlaces={googleResultsWithoutExistingPlaces}
            loadingGoogle={loadingGoogle}
            onSelectUser={handleSelectUser}
            onSelectPlace={handleSelectLocation}
            onSelectGooglePlace={handleSelectGooglePlace}
          />
        </View>

        {showProximityBanner ? (
          <ProximityBannerCard
            banner={showProximityBanner}
            onPress={() =>
              router.push({
                pathname: "/placeDetails",
                params: { id: showProximityBanner.locationId },
              })
            }
            onDismiss={() => {
              setProximityBannerDismissed(true);
              setProximityBanner(null);
            }}
          />
        ) : null}

        <PopularPlacesCarousel
          mode={popularMode}
          places={popularPlaces}
          onSelectPlace={handleSelectLocation}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Friends Posts</Text>

          {friendPosts.length > 2 && (
            <TouchableOpacity
              style={styles.sectionArrowButton}
              onPress={() => router.push("/social")}
              activeOpacity={0.7}
            >
              <Feather name="chevron-right" size={24} color="#111" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.postList}>
          {visiblePosts.length > 0 ? (
            visiblePosts.map((post) => {
              const locationId = getPostLocationId(post);

              return (
                <ReviewActivityCard
                  key={post.id}
                  post={post}
                  onPress={() => {
                    if (!locationId) return;

                    router.push({
                      pathname: "/placeDetails",
                      params: { id: locationId },
                    });
                  }}
                />
              );
            })
          ) : (
            <TouchableOpacity
              style={styles.emptyCard}
              onPress={() => router.push("/social")}
              activeOpacity={0.8}
            >
              <View style={styles.emptyIcon}>
                <Feather name="users" size={20} color="#777" />
              </View>

              <View style={styles.emptyTextGroup}>
                <Text style={styles.emptyTitle}>No friend activity yet</Text>
                <Text style={styles.emptyText}>
                  Add friends to see their latest reviews here.
                </Text>
              </View>

              <Feather name="chevron-right" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 34,
  },

  header: {
    marginBottom: 18,
  },

  brandTitle: {
    fontSize: 27,
    fontWeight: "900",
    color: "#111",
  },

  locationSelector: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 3,
  },

  locationLabel: {
    maxWidth: 180,
    fontSize: 14,
    fontWeight: "700",
    color: "#666",
  },

  searchArea: {
    zIndex: 100,
    marginBottom: 24,
  },

  homeSearchBar: {
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    borderWidth: 0,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111",
  },

  sectionArrowButton: {
    width: 32,
    height: 32,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  postList: {
    gap: 12,
  },

  emptyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
  },

  emptyIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTextGroup: {
    flex: 1,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111",
  },

  emptyText: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: "#777",
  },
});

export default Index;
