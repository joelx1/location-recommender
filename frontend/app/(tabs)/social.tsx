import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import ScreenWrapper from "@/components/ScreenWrapper";
import Feather from "@expo/vector-icons/Feather";
import { router, useFocusEffect } from "expo-router";
import { API_BASE_URL } from "@/services/api";

const CURRENT_USER_ID = "e4749887-88df-4867-bce5-545cb331fa92";

type FeedReview = {
  id: string;
  rating: number;
  body: string | null;
  photoUrl?: string | null;
  createdAt?: string;
  user?: {
    id: string;
    username?: string;
    profilePic?: string | null;
  };
  location?: {
    id: string;
    name?: string;
    category?: string;
    address?: string | null;
  };
};

const formatFeedDate = (dateString: string) => {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
  });
};

const Social = () => {
  const [feed, setFeed] = useState<FeedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/users/${CURRENT_USER_ID}/feed`,
      );

      if (!response.ok) {
        throw new Error(`Feed request failed with status ${response.status}`);
      }

      const data: FeedReview[] = await response.json();
      console.log("feed data:", data);
      console.log(
        "feed photo urls:",
        data.map((item) => ({
          id: item.id,
          photoUrl: item.photoUrl,
        })),
      );

      setFeed(data);
    } catch (err) {
      console.log("fetch feed error:", err);
      setError(err instanceof Error ? err.message : "Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFeed();
    }, []),
  );

  return (
    <ScreenWrapper style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Feed</Text>
      </View>

      {loading ? (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>Loading feed...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : feed.length === 0 ? (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>No friend reviews yet.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >
          {feed.map((review) => {
            const username = review.user?.username ?? "Anonymous";
            const placeName = review.location?.name ?? "Unknown place";
            const body = review.body?.trim();
            const hasImage = Boolean(review.photoUrl);

            return (
              <View key={review.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.userRow}>
                    {review.user?.profilePic ? (
                      <Image
                        source={{ uri: review.user.profilePic }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={styles.avatar} />
                    )}

                    <View style={styles.headerTextGroup}>
                      <Text style={styles.username}>{username}</Text>

                      <View style={styles.actionRow}>
                        <Text style={styles.actionText}>reviewed </Text>

                        <TouchableOpacity
                          onPress={() => {
                            if (review.location?.id) {
                              router.push({
                                pathname: "/placeDetails",
                                params: { id: review.location.id },
                              });
                            }
                          }}
                        >
                          <Text style={styles.placeLink}>{placeName}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity>
                    <Feather name="bookmark" size={22} color="#222" />
                  </TouchableOpacity>
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.ratingRow}>
                    <Feather name="star" size={14} color="#f59e0b" />
                    <Text style={styles.ratingText}>{review.rating}</Text>
                  </View>

                  {review.createdAt ? (
                    <Text style={styles.metaText}>
                      on {formatFeedDate(review.createdAt)}
                    </Text>
                  ) : null}
                </View>

                {body ? <Text style={styles.reviewText}>{body}</Text> : null}

                {hasImage ? (
                  <Image
                    source={{ uri: review.photoUrl! }}
                    style={styles.feedImage}
                    resizeMode="cover"
                  />
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      )}
    </ScreenWrapper>
  );
};

export default Social;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
  },

  container: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  stateText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },

  errorText: {
    fontSize: 15,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#f7f7f7",
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 12,
  },

  headerTextGroup: {
    flex: 1,
    justifyContent: "center",
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 2,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#d9d9d9",
  },

  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },

  actionText: {
    fontSize: 12,
    color: "#7a7a7a",
  },

  placeLink: {
    fontSize: 12,
    color: "#111",
    fontWeight: "500",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  ratingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginLeft: 4,
  },

  metaText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 8,
  },

  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
    marginBottom: 12,
  },

  feedImage: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    backgroundColor: "#ececec",
  },
});
