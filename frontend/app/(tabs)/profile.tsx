import { View, Text, StyleSheet, Alert } from "react-native";
import React, { useCallback, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import ProfileTab from "@/components/profile/ProfileTab";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { router, useFocusEffect } from "expo-router";
import { API_BASE_URL } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/theme";
import ProfilePostCard from "@/components/profile/ProfilePostCard";

type BackendUser = {
  id: string;
  username: string;
  email: string;
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

type BackendFriend = {
  id: string;
};

type ProfileData = {
  username: string;
  bio: string;
  profilePic: string;
  followingCount: number;
  followersCount: number;
};

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

const Profile = () => {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"posts">("posts");
  const [postsData, setPostsData] = useState<PostItem[]>([]);
  const leftColumnData = postsData.filter((_, index) => index % 2 === 0);
  const rightColumnData = postsData.filter((_, index) => index % 2 !== 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<ProfileData>({
    username: "",
    bio: "",
    profilePic: "",
    followingCount: 0,
    followersCount: 0,
  });

  const fetchProfileData = async () => {
    if (!user?.id) return;
    const authHeaders = { Authorization: `Bearer ${token}` };
    try {
      setLoading(true);
      setError(null);

      const [userResponse, reviewsResponse, friendsResponse] =
        await Promise.all([
          fetch(`${API_BASE_URL}/users/${user.id}`, { headers: authHeaders }),
          fetch(`${API_BASE_URL}/users/${user.id}/reviews`, {
            headers: authHeaders,
          }),
          fetch(`${API_BASE_URL}/users/${user.id}/friends`, {
            headers: authHeaders,
          }),
        ]);

      if (!userResponse.ok) {
        throw new Error(
          `User request failed with status ${userResponse.status}`,
        );
      }
      if (!reviewsResponse.ok) {
        throw new Error(
          `Reviews request failed with status ${reviewsResponse.status}`,
        );
      }
      if (!friendsResponse.ok) {
        throw new Error(
          `Friends request failed with status ${friendsResponse.status}`,
        );
      }

      const userData: BackendUser = await userResponse.json();
      const reviewsData: BackendReview[] = await reviewsResponse.json();
      const friendsData: BackendFriend[] = await friendsResponse.json();

      setProfileData({
        username: userData.username ?? "User",
        bio: userData.bio?.trim() || "No bio yet",
        profilePic: userData.profilePic ?? "",
        followingCount: friendsData.length,
        followersCount: friendsData.length,
      });

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
      console.log("fetch profile error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load profile data",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Delete failed with status ${response.status}`);
      }

      await fetchProfileData();
    } catch (err) {
      console.log("delete review error:", err);
      Alert.alert("Failed to delete review.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [user?.id, token]),
  );

  const renderPostCard = (item: PostItem) => (
    <ProfilePostCard
      key={item.id}
      post={item}
      onPress={() => {
        if (item.locationId) {
          router.push({
            pathname: "/placeDetails",
            params: { id: item.locationId },
          });
        }
      }}
      onDelete={() =>
        Alert.alert(
          "Delete review",
          "Are you sure you want to delete this review?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => handleDeleteReview(item.id),
            },
          ],
        )
      }
    />
  );

  return (
    <ScreenWrapper
      scrollable
      style={styles.screen}
      contentContainerStyle={styles.container}
    >
      <ProfileHeader
        username={profileData.username}
        bio={profileData.bio}
        followingCount={profileData.followingCount}
        followersCount={profileData.followersCount}
        friendCount={profileData.followingCount}
        showActions
        profilePic={profileData.profilePic}
        onPressFriendCount={() => router.push("/friendList")}
        onPressEdit={() => router.push("/(screens)/editProfile")}
        onPressLogout={logout}
      />

      <View style={styles.tabRow}>
        <ProfileTab
          label="Posts"
          icon="grid"
          active={activeTab === "posts"}
          onPress={() => setActiveTab("posts")}
        />
      </View>

      {loading ? (
        <Text style={styles.stateText}>Loading profile...</Text>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : postsData.length === 0 ? (
        <Text style={styles.stateText}>No posts yet.</Text>
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
};

export default Profile;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },

  container: {
    padding: 12,
    backgroundColor: theme.colors.surface,
  },

  tabRow: {
    flexDirection: "row",
    gap: 24,
    paddingBottom: 12,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17, 24, 39, 0.06)",
  },

  gridPlaceHolder: {
    flexDirection: "row",
    gap: 10,
  },

  leftColumn: {
    flex: 1,
    gap: 10,
  },

  rightColumn: {
    flex: 1,
    gap: 10,
  },

  savedPlaceHolder: {
    gap: 8,
  },

  savedCard: {
    height: 120,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceMuted,
  },

  stateText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    paddingVertical: 8,
  },

  errorText: {
    fontSize: 14,
    color: theme.colors.danger,
    paddingVertical: 8,
  },

  friendsListButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceMuted,
    marginBottom: 22,
  },

  friendsListButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
});
