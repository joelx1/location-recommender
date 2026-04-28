import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Feather from "@expo/vector-icons/Feather";
import { router, useLocalSearchParams } from "expo-router";
import { API_BASE_URL } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import PlaceCategoryImage from "@/components/places/PlaceCategoryImage";

type BackendLocationSummary = {
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

type BackendReview = {
  id: string;
  rating: number;
  body: string | null;
  photoUrl?: string | null;
  createdAt?: string;
  user?: {
    id?: string;
    username?: string;
  };
};

type PlaceDetailsData = {
  title: string;
  rating: number;
  reviewCount: number;
  category: string;
  address: string;
  friendReviewCount: number;
  friendReviewerNames: string[];
  reviews: {
    id: string;
    user: string;
    rating: string;
    body: string;
    photoUrl?: string | null;
  }[];
};

type FeedReview = {
  id: string;
  username?: string;
  locationId?: string;
  user?: {
    username?: string;
  };
  location?: {
    id?: string;
  };
};

const PlaceDetails = () => {
  const { token, user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [location, setLocation] = useState<PlaceDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      if (!id || !token || !user?.id) {
        setError("Missing location or user data");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const authHeaders = { Authorization: `Bearer ${token}` };
        const [locationResponse, reviewsResponse, feedResponse] =
          await Promise.all([
            fetch(`${API_BASE_URL}/locations/${id}/summary`, {
              headers: authHeaders,
            }),
            fetch(`${API_BASE_URL}/locations/${id}/reviews`, {
              headers: authHeaders,
            }),
            fetch(`${API_BASE_URL}/users/${user.id}/feed`, {
              headers: authHeaders,
            }),
          ]);

        if (!locationResponse.ok) {
          throw new Error(
            `Location request failed with status ${locationResponse.status}`,
          );
        }

        if (!reviewsResponse.ok) {
          throw new Error(
            `Reviews request failed with status ${reviewsResponse.status}`,
          );
        }

        if (!feedResponse.ok) {
          throw new Error(
            `Feed request failed with status ${feedResponse.status}`,
          );
        }

        const locationData: BackendLocationSummary =
          await locationResponse.json();
        const reviewsData: BackendReview[] = await reviewsResponse.json();
        const feedData: FeedReview[] = await feedResponse.json();

        const friendReviewsForPlace = feedData.filter(
          (review) => (review.locationId || review.location?.id) === id,
        );
        const friendReviewCount = friendReviewsForPlace.length;

        const friendReviewerNames = Array.from(
          new Set(
            friendReviewsForPlace
              .map((review) => review.username || review.user?.username)
              .filter((name): name is string => Boolean(name)),
          ),
        );

        const reviewCount = locationData.reviewCount ?? reviewsData.length;
        const averageRating = locationData.averageRating ?? 0;
        const sortedReviews = [...reviewsData].sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

          return timeB - timeA;
        });

        setLocation({
          title: locationData.name,
          rating: Number(averageRating.toFixed(2)),
          reviewCount,
          category: locationData.category,
          address: locationData.address ?? "No address provided",
          friendReviewCount,
          friendReviewerNames,
          reviews: sortedReviews.map((review) => ({
            id: review.id,
            user: review.user?.username ?? "Anonymous",
            rating: `${review.rating}/5`,
            body: review.body ?? "",
            photoUrl: review.photoUrl ?? null,
          })),
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load place details",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceDetails();
  }, [id, token, user?.id]);

  if (loading) {
    return (
      <ScreenWrapper style={styles.container}>
        <Text>Loading...</Text>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper style={styles.container}>
        <Text>{error}</Text>
      </ScreenWrapper>
    );
  }

  if (!location) {
    return (
      <ScreenWrapper style={styles.container}>
        <Text>No location data found.</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color="#111" />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="share" size={20} color="#111" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <Feather name="bookmark" size={20} color="#111" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <Feather name="more-horizontal" size={20} color="#111" />
          </TouchableOpacity>
        </View>
      </View>

      <PlaceCategoryImage
        category={location.category}
        style={styles.heroImage}
      />

      <View style={styles.content}>
        <Text style={styles.title}>{location.title}</Text>
        <View style={styles.ratingRow}>
          <Feather name="star" size={18} color="#111" />
          <Text style={styles.ratingText}>{location.rating}</Text>
          <Text style={styles.reviewCount}>{location.reviewCount} reviews</Text>
        </View>
        {location.friendReviewerNames.length > 0 ? (
          <View style={styles.friendBadge}>
            <Text style={styles.friendText}>
              Reviewed by{" "}
              {location.friendReviewerNames.slice(0, 2).join(" and ")}
              {location.friendReviewerNames.length > 2
                ? ` +${location.friendReviewerNames.length - 2} more`
                : ""}
            </Text>
          </View>
        ) : null}

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>{location.category}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{location.address}</Text>
          </View>
        </View>

        <Text style={styles.reviewSection}>Reviews</Text>
        <View style={styles.reviewsCard}>
          {location.reviews.length > 0 ? (
            location.reviews.map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <Text style={styles.reviewUser}>
                  {review.user} · {review.rating}
                </Text>

                {review.body ? (
                  <Text style={styles.reviewBody}>{review.body}</Text>
                ) : null}

                {review.photoUrl ? (
                  <Image
                    source={{ uri: review.photoUrl }}
                    style={styles.reviewImage}
                    resizeMode="cover"
                  />
                ) : null}
              </View>
            ))
          ) : (
            <Text style={styles.emptyReviewText}>No reviews yet.</Text>
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default PlaceDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  iconButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    gap: 14,
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },

  heroImage: {
    width: "100%",
    height: 220,
    borderRadius: 24,
    marginBottom: 24,
    backgroundColor: "#ececec",
    overflow: "hidden",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  ratingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
  },

  reviewCount: {
    fontSize: 16,
    color: "#9b9bb0",
  },

  friendText: {
    fontSize: 12,
    color: "#a16207",
    fontWeight: "600",
  },

  infoCard: {
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    marginTop: 4,
    padding: 20,
    gap: 16,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  infoLabel: {
    fontSize: 14,
    color: "#8b8b8b",
  },

  infoValue: {
    fontSize: 14,
    color: "#111",
    fontWeight: "500",
    maxWidth: "80%",
    textAlign: "right",
  },

  reviewSection: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    marginTop: 8,
  },

  reviewsCard: {
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    paddingTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 12,
  },

  reviewItem: {
    borderRadius: 16,
    padding: 10,
  },

  reviewUser: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    marginBottom: 6,
  },

  reviewBody: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },

  emptyReviewText: {
    padding: 10,
    fontSize: 14,
    color: "#777",
  },

  friendBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#fef3c7",
  },
  reviewImage: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    marginTop: 10,
    backgroundColor: "#ddd",
  },
});
