import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import ScreenWrapper from "@/components/ScreenWrapper";
import ProfileTab from "@/components/profile/ProfileTab";
import { API_BASE_URL } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

type BackendUser = {
  id: string;
  username: string;
  bio?: string | null;
  profilePic?: string | null;
};

type BackendReview = {
  id: string;
  rating: number;
  body: string | null;
  photoUrl?: string | null;
  createdAt?: string;
  location?: {
    id: string;
    name?: string;
    category?: string;
  };
};

type FriendshipStatus = "NONE" | "PENDING" | "ACCEPTED";

type PostItem = {
  id: string;
  locationId: string;
  locationName: string;
  body: string;
  rating: number;
  createdAt: string;
  photoUrl?: string | null;
  category: string;
};

const formatProfileDate = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
  });
};

export default function FriendProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, user } = useAuth();

  const [activeTab, setActiveTab] = useState<"posts">("posts");
  const [profileData, setProfileData] = useState<BackendUser | null>(null);
  const [postsData, setPostsData] = useState<PostItem[]>([]);
  const [friendsCount, setFriendsCount] = useState(0);
  const [status, setStatus] = useState<FriendshipStatus>("NONE");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leftColumnData = postsData.filter((_, index) => index % 2 === 0);
  const rightColumnData = postsData.filter((_, index) => index % 2 !== 0);

  const loadFriendProfile = async () => {
    if (!id || !user?.id || !token) return;

    const authHeaders = { Authorization: `Bearer ${token}` };

    try {
      setLoading(true);
      setError(null);

      const [userResponse, reviewsResponse, friendsResponse, statusResponse] =
        await Promise.all([
          fetch(`${API_BASE_URL}/users/${id}`, { headers: authHeaders }),
          fetch(`${API_BASE_URL}/users/${id}/reviews`, {
            headers: authHeaders,
          }),
          fetch(`${API_BASE_URL}/users/${id}/friends`, {
            headers: authHeaders,
          }),
          fetch(
            `${API_BASE_URL}/users/${user.id}/friendship-status?with=${id}`,
            {
              headers: authHeaders,
            },
          ),
        ]);

      if (!userResponse.ok) throw new Error("Failed to load user");
      if (!reviewsResponse.ok) throw new Error("Failed to load reviews");
      if (!friendsResponse.ok) throw new Error("Failed to load friends");
      if (!statusResponse.ok)
        throw new Error("Failed to load friendship status");

      const userData: BackendUser = await userResponse.json();
      const reviewsData: BackendReview[] = await reviewsResponse.json();
      const friendsData: BackendUser[] = await friendsResponse.json();
      const statusData: { status: FriendshipStatus } =
        await statusResponse.json();

      setProfileData(userData);
      setFriendsCount(friendsData.length);
      setStatus(statusData.status);

      const sortedReviews = [...reviewsData].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      setPostsData(
        sortedReviews.map((review) => ({
          id: review.id,
          locationId: review.location?.id ?? "",
          locationName: review.location?.name ?? "Unknown place",
          body: review.body ?? "",
          rating: review.rating,
          createdAt: formatProfileDate(review.createdAt),
          photoUrl: review.photoUrl ?? null,
          category: review.location?.category ?? "",
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const addFriend = async () => {
    if (!id || !token) return;

    try {
      setAdding(true);

      const response = await fetch(`${API_BASE_URL}/friends`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiverId: id }),
      });

      if (!response.ok && response.status !== 409) {
        throw new Error("Failed to add friend");
      }

      await loadFriendProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add friend");
    } finally {
      setAdding(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFriendProfile();
    }, [id, user?.id, token]),
  );

  const renderPostCard = (item: PostItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.gridCard}
      onPress={() => {
        if (item.locationId) {
          router.push({
            pathname: "/placeDetails",
            params: { id: item.locationId },
          });
        }
      }}
    >
      {item.photoUrl ? (
        <Image source={{ uri: item.photoUrl }} style={styles.cardImage} />
      ) : null}

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.locationName}
        </Text>

        <View style={styles.cardRatingRow}>
          <Feather name="star" size={12} color="#f59e0b" />
          <Text style={styles.cardRating}>{item.rating}</Text>
          {item.category ? (
            <Text style={styles.cardCategoryInline}>{item.category}</Text>
          ) : null}
        </View>

        <Text style={styles.cardBody} numberOfLines={2}>
          {item.body || "No written review."}
        </Text>

        <Text style={styles.cardDate}>{item.createdAt}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ScreenWrapper style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={22} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>Loading profile...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (error || !profileData) {
    return (
      <ScreenWrapper style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={22} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.stateContainer}>
          <Text style={styles.errorText}>{error || "User not found"}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      scrollable
      style={styles.screen}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={22} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Profile</Text>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.profileHeader}>
        {profileData.profilePic ? (
          <Image
            source={{ uri: profileData.profilePic }}
            style={styles.avatar}
          />
        ) : (
          <Image
            source={require("@/assets/images/default-avatar.png")}
            style={styles.avatar}
          />
        )}

        <View style={styles.profileInfo}>
          <Text style={styles.username}>{profileData.username}</Text>
          <Text style={styles.bio}>{profileData.bio ?? "No bio yet"}</Text>
          <Text style={styles.friendCount}>Friends {friendsCount}</Text>
        </View>
      </View>

      {status === "ACCEPTED" ? (
        <View style={styles.friendButton}>
          <Feather name="check" size={16} color="#111" />
          <Text style={styles.friendButtonText}>Friends</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addButton}
          onPress={addFriend}
          disabled={adding}
        >
          <Feather name="user-plus" size={16} color="#fff" />
          <Text style={styles.addButtonText}>
            {adding ? "Adding..." : "Add Friend"}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.tabRow}>
        <ProfileTab
          label="Posts"
          icon="grid"
          active={activeTab === "posts"}
          onPress={() => setActiveTab("posts")}
        />
      </View>

      {postsData.length === 0 ? (
        <View style={styles.emptyPosts}>
          <Text style={styles.stateText}>No posts yet.</Text>
        </View>
      ) : (
        <View style={styles.gridPlaceHolder}>
          <View style={styles.leftColumn}>
            {leftColumnData.map(renderPostCard)}
          </View>

          <View style={styles.rightColumn}>
            {rightColumnData.map(renderPostCard)}
          </View>
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },

  container: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: "#fff",
  },

  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
  },

  headerSpacer: {
    width: 32,
    height: 32,
  },

  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 18,
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#ddd",
    marginRight: 16,
  },

  profileInfo: {
    flex: 1,
  },

  username: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
  },

  bio: {
    fontSize: 15,
    color: "#777",
    marginBottom: 10,
  },

  friendCount: {
    fontSize: 15,
    color: "#111",
  },

  addButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 26,
  },

  addButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  friendButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 26,
  },

  friendButtonText: {
    color: "#111",
    fontSize: 15,
    fontWeight: "700",
  },

  tabRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 20,
  },

  gridPlaceHolder: {
    flexDirection: "row",
    gap: 8,
  },

  leftColumn: {
    flex: 1,
    gap: 8,
  },

  rightColumn: {
    flex: 1,
    gap: 8,
  },

  gridCard: {
    borderRadius: 16,
    backgroundColor: "#f7f7f7",
    overflow: "hidden",
  },

  cardImage: {
    width: "90%",
    height: 96,
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 6,
    alignSelf: "center",
  },

  cardContent: {
    padding: 12,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
  },

  cardRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },

  cardRating: {
    fontSize: 12,
    fontWeight: "600",
    color: "#444",
  },

  cardCategoryInline: {
    fontSize: 12,
    color: "#8a8a8a",
    marginLeft: 4,
    textTransform: "capitalize",
  },

  cardBody: {
    fontSize: 13,
    lineHeight: 18,
    color: "#333",
    marginBottom: 8,
  },

  cardDate: {
    textAlign: "right",
    fontSize: 11,
    color: "#777",
  },

  emptyPosts: {
    paddingVertical: 40,
    alignItems: "center",
  },

  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 120,
  },

  stateText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },

  errorText: {
    fontSize: 15,
    color: "#c62828",
    textAlign: "center",
  },
});
