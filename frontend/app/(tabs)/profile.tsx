import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React, { useCallback, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import ProfileTab from "@/components/profile/ProfileTab";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { router, useFocusEffect } from "expo-router";
import { API_BASE_URL } from "@/services/api";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";

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

const mockSaved = [
  { id: "1", locationName: "Cafe", rating: 5, createdAt: "01/04/2026" },
  { id: "2", locationName: "Bar", rating: 5, createdAt: "01/04/2026" },
  { id: "3", locationName: "Restaurant", rating: 5, createdAt: "01/04/2026" },
];

const Profile = () => {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"posts" | "save">("posts");
  const [postsData, setPostsData] = useState<PostItem[]>([]);
  const [savedData, setSavedData] = useState(mockSaved);
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
          fetch(`${API_BASE_URL}/users/${user.id}/reviews`, { headers: authHeaders }),
          fetch(`${API_BASE_URL}/users/${user.id}/friends`, { headers: authHeaders }),
        ]);

      if (!userResponse.ok) {
        throw new Error(`User request failed with status ${userResponse.status}`);
      }
      if (!reviewsResponse.ok) {
        throw new Error(`Reviews request failed with status ${reviewsResponse.status}`);
      }
      if (!friendsResponse.ok) {
        throw new Error(`Friends request failed with status ${friendsResponse.status}`);
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

      setPostsData(
        reviewsData.map((review) => ({
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
      setError(err instanceof Error ? err.message : "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [user?.id, token]),
  );

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <ProfileHeader
        username={profileData.username}
        bio={profileData.bio}
        followingCount={profileData.followingCount}
        followersCount={profileData.followersCount}
        onPressEdit={() => router.push("/(screens)/editProfile")}
        onPressSettings={() => {}}
      />

      <View style={styles.tabRow}>
        <ProfileTab
          label="Posts"
          icon="grid"
          active={activeTab === "posts"}
          onPress={() => setActiveTab("posts")}
        />
        <ProfileTab
          label="Save"
          icon="bookmark"
          active={activeTab === "save"}
          onPress={() => setActiveTab("save")}
        />
      </View>

      {loading ? (
        <Text style={styles.stateText}>Loading profile...</Text>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : activeTab === "posts" ? (
        postsData.length === 0 ? (
          <Text style={styles.stateText}>No posts yet.</Text>
        ) : (
          <View style={styles.gridPlaceHolder}>
            <View style={styles.leftColumn}>
              {leftColumnData.map((item) => (
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
                    <View style={styles.cardMetaRow}>
                      <View style={styles.cardRatingRow}>
                        <Feather name="star" size={12} color="#f59e0b" />
                        <Text style={styles.cardRating}>{item.rating}</Text>
                        {item.category ? (
                          <Text style={styles.cardCategoryInline}>{item.category}</Text>
                        ) : null}
                      </View>
                    </View>
                    <Text style={styles.cardBody} numberOfLines={2}>
                      {item.body || "No written review."}
                    </Text>
                    <Text style={styles.cardDate}>{item.createdAt}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.rightColumn}>
              {rightColumnData.map((item) => (
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
                    <View style={styles.cardMetaRow}>
                      <View style={styles.cardRatingRow}>
                        <Feather name="star" size={12} color="#f59e0b" />
                        <Text style={styles.cardRating}>{item.rating}</Text>
                        {item.category ? (
                          <Text style={styles.cardCategoryInline}>{item.category}</Text>
                        ) : null}
                      </View>
                    </View>
                    <Text style={styles.cardBody} numberOfLines={2}>
                      {item.body}
                    </Text>
                    <Text style={styles.cardDate}>{item.createdAt}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )
      ) : (
        <View style={styles.savedPlaceHolder}>
          {savedData.map((item) => (
            <View key={item.id} style={styles.savedCard}>
              <Text style={{ padding: 4, fontWeight: "bold" }}>{item.locationName}</Text>
              <Text style={{ fontSize: 12, padding: 4 }}>{item.rating} star</Text>
              <Text style={{ fontSize: 10, padding: 4, textAlign: "right" }}>
                {item.createdAt}
              </Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    padding: 12,
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

  savedPlaceHolder: {
    gap: 8,
  },

  savedCard: {
    height: 120,
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
  },

  gridCard: {
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
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

  cardMetaRow: {
    marginBottom: 6,
  },

  cardCategoryInline: {
    fontSize: 12,
    color: "#8a8a8a",
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
    color: "#444",
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

  logoutButton: {
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    alignItems: "center",
  },

  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#c62828",
  },
});
