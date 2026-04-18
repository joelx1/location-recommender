import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Feather from "@expo/vector-icons/Feather";
import { router, useLocalSearchParams } from "expo-router";
import { API_BASE_URL } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

type BackendLocation = {
  id: string;
  name: string;
  category: string;
  address: string | null;
};

type BackendReview = {
  id: string;
  rating: number;
  body: string | null;
  user?: {
    username?: string;
  };
};

type PlaceDetailsData = {
  title: string;
  rating: number;
  reviewCount: number;
  category: string;
  address: string;
  reviews: {
    user: string;
    rating: string;
    body: string;
  }[];
};

const PlaceDetails = () => {
  const { token } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  console.log("placeDetails id:", id);

  const [location, setLocation] = useState<PlaceDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      if (!id) {
        setError("Missing location id");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const authHeaders = { Authorization: `Bearer ${token}` };
        const [locationResponse, reviewsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/locations/${id}`, { headers: authHeaders }),
          fetch(`${API_BASE_URL}/locations/${id}/reviews`, { headers: authHeaders }),
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

        const locationData: BackendLocation = await locationResponse.json();
        const reviewsData: BackendReview[] = await reviewsResponse.json();

        const reviewCount = reviewsData.length;
        const averageRating =
          reviewCount > 0
            ? reviewsData.reduce((sum, review) => sum + review.rating, 0) /
              reviewCount
            : 0;

        setLocation({
          title: locationData.name,
          rating: Number(averageRating.toFixed(2)),
          reviewCount,
          category: locationData.category,
          address: locationData.address ?? "No address provided",
          reviews: reviewsData.map((review) => ({
            user: review.user?.username ?? "Anonymous",
            rating: `${review.rating}/5`,
            body: review.body ?? "",
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
  }, [id]);

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

      <View style={styles.imagePlaceholder}>
        <Feather name="image" size={32} color="#444" />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{location.title}</Text>
        <View style={styles.ratingRow}>
          <Feather name="star" size={18} color="#111" />
          <Text style={styles.ratingText}>{location.rating}</Text>
          <Text style={styles.reviewCount}>{location.reviewCount} reviews</Text>
        </View>
        <View style={styles.friendRow}>
          <View style={styles.friendAvatars}>
            <View style={styles.avatarCircle} />
            <View style={[styles.avatarCircle, styles.avatarOverlap]} />
            <View style={[styles.avatarCircle, styles.avatarOverlap]} />
          </View>
          <Text style={styles.friendText}>reviewed this place</Text>
        </View>

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
          {location.reviews.map((review) => (
            <View key={review.user} style={styles.reviewItem}>
              <Text style={styles.reviewUser}>
                {review.user} · {review.rating}
              </Text>
              <Text style={styles.reviewBody}>{review.body}</Text>
            </View>
          ))}
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
    fontWeight: "500",
    color: "#111",
  },

  imagePlaceholder: {
    height: 220,
    borderRadius: 24,
    backgroundColor: "#ececec",
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 14,
    color: "#8b8b8b",
  },

  infoCard: {
    borderRadius: 24,
    backgroundColor: "#ececec",
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
  },

  reviewSection: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    marginTop: 8,
  },

  reviewsCard: {
    borderRadius: 24,
    backgroundColor: "#ececec",
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

  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  friendAvatars: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#d8d8d8",
    borderWidth: 2,
    borderColor: "#fff",
  },

  avatarOverlap: {
    marginLeft: -8,
  },
});
