import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Feather from "@expo/vector-icons/Feather";
import { router, useLocalSearchParams } from "expo-router";
import { API_BASE_URL } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import PlaceCategoryImage from "@/components/places/PlaceCategoryImage";
import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";

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
    profilePic?: string | null;
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
    profilePic?: string | null;
    rating: string;
    body: string;
    createdAt: string;
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

const formatReviewDate = (dateString?: string) => {
  if (!dateString) return "";

  return new Date(dateString).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
  });
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
            profilePic: review.user?.profilePic ?? null,
            rating: `${review.rating}`,
            body: review.body ?? "",
            createdAt: formatReviewDate(review.createdAt),
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
        <Text style={styles.errorText}>{error}</Text>
      </ScreenWrapper>
    );
  }

  if (!location) {
    return (
      <ScreenWrapper style={styles.container}>
        <Text style={styles.emptyText}>No location data found.</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="share" size={20} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <Feather name="bookmark" size={20} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <Feather
              name="more-horizontal"
              size={20}
              color={theme.colors.text}
            />
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
          <View style={styles.placeRatingGroup}>
            <Ionicons name="star" size={18} color={theme.colors.accent} />
            <Text style={styles.ratingText}>{location.rating}</Text>
          </View>
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
            location.reviews.map((review, index) => (
              <View
                key={review.id}
                style={[
                  styles.reviewItem,
                  index === location.reviews.length - 1 &&
                    styles.lastReviewItem,
                ]}
              >
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Image
                      source={
                        review.profilePic
                          ? { uri: review.profilePic }
                          : require("@/assets/images/default-avatar.png")
                      }
                      style={styles.fullImg}
                    />
                  </View>

                  <View style={styles.reviewAuthorText}>
                    <Text style={styles.reviewUser} numberOfLines={1}>
                      {review.user}
                    </Text>

                    <View style={styles.reviewMeta}>
                      <View style={styles.reviewRating}>
                        <Ionicons
                          name="star"
                          size={14}
                          color={theme.colors.accent}
                        />
                        <Text style={styles.reviewRatingText}>
                          {review.rating}
                        </Text>
                      </View>

                      {review.createdAt ? (
                        <Text style={styles.reviewDate}>
                          {review.createdAt}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>

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
    backgroundColor: theme.colors.surface,
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
    gap: 13,
  },

  title: {
    fontSize: 20,
    fontWeight: "900",
    color: theme.colors.text,
  },

  heroImage: {
    width: "100%",
    height: 220,
    borderRadius: 24,
    marginBottom: 24,
    backgroundColor: theme.colors.surfaceMuted,
    overflow: "hidden",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  placeRatingGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  ratingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.accent,
  },

  reviewCount: {
    fontSize: 16,
    color: theme.colors.textSubtle,
  },

  friendText: {
    fontSize: 12,
    color: "#B85F05",
    fontWeight: "600",
  },

  infoCard: {
    borderRadius: theme.radius.lg,
    backgroundColor: "rgba(244, 245, 243, 0.72)",
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 14,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },

  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSubtle,
  },

  infoValue: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: "500",
    textAlign: "right",
  },

  reviewSection: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.colors.text,
    marginTop: 8,
  },

  reviewsCard: {
    borderRadius: theme.radius.lg,
    backgroundColor: "rgba(244, 245, 243, 0.68)",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  reviewItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17, 24, 39, 0.055)",
  },

  fullImg: {
    width: "100%",
    height: "100%",
  },

  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 9,
  },

  reviewAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  reviewAuthorText: {
    flex: 1,
    minWidth: 0,
  },

  reviewUser: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 2,
  },

  reviewMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  reviewRatingText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.accent,
  },

  reviewDate: {
    fontSize: 12,
    color: theme.colors.textSubtle,
  },

  reviewBody: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
    marginBottom: 10,
  },

  emptyReviewText: {
    padding: 10,
    fontSize: 14,
    color: theme.colors.textMuted,
  },

  friendBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255, 243, 214, 0.78)",
  },

  reviewImage: {
    width: "100%",
    height: 170,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.border,
  },

  errorText: {
    color: theme.colors.danger,
  },

  emptyText: {
    color: theme.colors.textMuted,
  },

  lastReviewItem: {
    borderBottomWidth: 0,
  },
});
