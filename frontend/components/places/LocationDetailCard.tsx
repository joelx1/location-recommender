import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import Card from "@/components/ui/Card";
import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";

// Reusable bottom card for showing a selected map location and its review preview.

export type LocationReviewPreview = {
  id: string;
  user: string;
  rating: number;
  body: string;
  profilePic?: string | null;
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
    <Card style={[styles.detailCard, { bottom: bottomOffset }]}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Feather name="x" size={20} color={theme.colors.textMuted} />
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
            <View style={styles.reviewHeader}>
              <Image
                source={
                  review.profilePic
                    ? { uri: review.profilePic }
                    : require("@/assets/images/default-avatar.png")
                }
                style={styles.reviewAvatar}
              />

              <View style={styles.reviewTextGroup}>
                <View style={styles.reviewMetaRow}>
                  <Text style={styles.reviewUser} numberOfLines={1}>
                    {review.user}
                  </Text>

                  <View style={styles.reviewRatingRow}>
                    <Ionicons
                      name="star"
                      size={13}
                      color={theme.colors.accent}
                    />
                    <Text style={styles.reviewRatingText}>{review.rating}</Text>
                  </View>
                </View>

                <Text style={styles.reviewBody} numberOfLines={2}>
                  {review.body}
                </Text>
              </View>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noReviewsText}>No reviews yet.</Text>
      )}

      <TouchableOpacity style={styles.viewMoreButton} onPress={onViewMore}>
        <Text style={styles.viewMoreText}>View more</Text>
      </TouchableOpacity>
    </Card>
  );
};

export default LocationDetailCard;

const styles = StyleSheet.create({
  detailCard: {
    position: "absolute",
    left: 16,
    right: 16,
    padding: 16,
  },

  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
  },

  title: {
    fontWeight: "900",
    fontSize: 18,
    marginBottom: 4,
    color: theme.colors.text,
  },

  category: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },

  address: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 10,
  },

  friendActivityText: {
    fontSize: 13,
    color: theme.colors.accent,
    fontWeight: "600",
    marginBottom: 2,
  },

  reviewSection: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 7,
    marginBottom: 7,
    color: theme.colors.text,
  },

  reviewCard: {
    backgroundColor: "rgba(244, 245, 243, 0.78)",
    borderRadius: theme.radius.md,
    paddingHorizontal: 11,
    paddingVertical: 10,
    marginBottom: 8,
  },

  reviewTextGroup: {
    flex: 1,
    minWidth: 0,
  },

  reviewMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
    marginBottom: 4,
  },

  reviewUser: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.text,
  },

  reviewBody: {
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.textMuted,
  },

  noReviewsText: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },

  viewMoreButton: {
    marginTop: 8,
    alignSelf: "flex-end",
  },

  viewMoreText: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.primary,
  },

  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  reviewAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
  },

  reviewRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  reviewRatingText: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.accent,
  },
});
