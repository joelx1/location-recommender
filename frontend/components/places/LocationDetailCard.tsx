import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";

// Reusable bottom card for showing a selected map location and its review preview.

export type LocationReviewPreview = {
  id: string;
  user: string;
  rating: number;
  body: string;
};

export type MapLocation = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  category: string;
  address: string;
  reviews: LocationReviewPreview[];
  friendReviewCount?: number;
};

type Props = {
  location: MapLocation;
  onClose: () => void;
  onViewMore: () => void;
  bottomOffset?: number;
};

const LocationDetailCard = ({
  location,
  onClose,
  onViewMore,
  bottomOffset = 20,
}: Props) => {
  const friendReviewCount = location.friendReviewCount ?? 0;

  return (
    <View style={[styles.detailCard, { bottom: bottomOffset }]}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Feather name="x" size={20} color="#666" />
      </TouchableOpacity>

      <Text style={styles.title}>{location.title}</Text>
      <Text style={styles.category}>{location.category}</Text>
      <Text style={styles.address}>{location.address}</Text>

      {friendReviewCount > 0 ? (
        <Text style={styles.friendActivityText}>
          {friendReviewCount === 1
            ? "1 friend review for this place"
            : `${friendReviewCount} friend reviews for this place`}
        </Text>
      ) : null}

      <Text style={styles.reviewSection}>Reviews</Text>

      {location.reviews.length > 0 ? (
        location.reviews.map((review) => (
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

      <TouchableOpacity style={styles.viewMoreButton} onPress={onViewMore}>
        <Text style={styles.viewMoreText}>View more</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LocationDetailCard;

const styles = StyleSheet.create({
  detailCard: {
    position: "absolute",
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
    fontWeight: "800",
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

  friendActivityText: {
    fontSize: 13,
    color: "#a16207",
    fontWeight: "600",
    marginBottom: 2,
  },

  reviewSection: {
    fontSize: 16,
    fontWeight: "800",
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

  viewMoreButton: {
    marginTop: 8,
    alignSelf: "flex-end",
  },

  viewMoreText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2563eb",
  },
});
