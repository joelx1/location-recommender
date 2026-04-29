import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useCallback, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import ProfileTab from "@/components/profile/ProfileTab";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { router, useFocusEffect } from "expo-router";
import { API_BASE_URL } from "@/services/api";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import { theme } from "@/theme";

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
        bio: userData.bio ?? "No bio yet",
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
            {leftColumnData.map((item) => (
              <Card
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
                  <Image
                    source={{ uri: item.photoUrl }}
                    style={styles.cardImage}
                  />
                ) : null}
                <View
                  style={[
                    styles.cardContent,
                    !item.photoUrl && styles.textOnlyContent,
                  ]}
                >
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.locationName}
                    </Text>

                    <TouchableOpacity
                      onPress={() =>
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
                      style={styles.deleteButton}
                    >
                      <Feather name="trash-2" size={14} color="#444" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardMetaRow}>
                    <View style={styles.cardRatingRow}>
                      <Feather name="star" size={12} color="#f59e0b" />
                      <Text style={styles.cardRating}>{item.rating}</Text>
                      {item.category ? (
                        <Text style={styles.cardCategoryInline}>
                          {item.category}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <Text style={styles.cardBody} numberOfLines={2}>
                    {item.body || "No written review."}
                  </Text>
                  <Text style={styles.cardDate}>{item.createdAt}</Text>
                </View>
              </Card>
            ))}
          </View>

          <View style={styles.rightColumn}>
            {rightColumnData.map((item) => (
              <Card
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
                  <Image
                    source={{ uri: item.photoUrl }}
                    style={styles.cardImage}
                  />
                ) : null}
                <View style={styles.cardContent}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.locationName}
                    </Text>

                    <TouchableOpacity
                      onPress={() =>
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
                      style={styles.deleteButton}
                    >
                      <Feather name="trash-2" size={14} color="#444" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardMetaRow}>
                    <View style={styles.cardRatingRow}>
                      <Feather name="star" size={12} color="#f59e0b" />
                      <Text style={styles.cardRating}>{item.rating}</Text>
                      {item.category ? (
                        <Text style={styles.cardCategoryInline}>
                          {item.category}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <Text style={styles.cardBody} numberOfLines={2}>
                    {item.body}
                  </Text>
                  <Text style={styles.cardDate}>{item.createdAt}</Text>
                </View>
              </Card>
            ))}
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
    backgroundColor: "#fff",
  },

  container: {
    padding: 12,
    backgroundColor: "#fff",
  },

  tabRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 20,
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
    backgroundColor: "#f7f7f7",
  },

  gridCard: {
    overflow: "hidden",
  },

  stateText: {
    fontSize: 14,
    color: "#666",
    paddingVertical: 8,
  },

  errorText: {
    fontSize: 14,
    color: "#c62828",
    paddingVertical: 8,
  },

  cardImage: {
    width: "92%",
    height: 108,
    borderRadius: theme.radius.md,
    marginTop: 8,
    marginBottom: 2,
    alignSelf: "center",
  },

  cardContent: {
    padding: 10,
  },

  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },

  cardMetaRow: {
    marginBottom: 6,
  },

  cardCategoryInline: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    marginLeft: 4,
    textTransform: "capitalize",
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
    color: theme.colors.textMuted,
  },

  cardBody: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textMuted,
    marginBottom: 8,
  },

  cardDate: {
    textAlign: "right",
    fontSize: 11,
    color: theme.colors.textSubtle,
  },

  friendsListButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#eeeeee",
    marginBottom: 22,
  },

  friendsListButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },

  cardTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
  },

  deleteButton: {
    padding: 2,
    opacity: 0.65,
  },

  textOnlyContent: {
    minHeight: 110,
  },
});
