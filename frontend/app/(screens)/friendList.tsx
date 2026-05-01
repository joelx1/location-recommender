import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { router, useFocusEffect } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import ScreenWrapper from "@/components/ScreenWrapper";
import { API_BASE_URL } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/theme";

type Friend = {
  id: string;
  username: string;
  bio?: string | null;
  profilePic?: string | null;
};

export default function FriendList() {
  const { token, user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFriends = async () => {
    if (!user?.id || !token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/users/${user.id}/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(
          `Friends request failed with status ${response.status}`,
        );
      }

      const data: Friend[] = await response.json();
      setFriends(data);
    } catch (err) {
      console.log("fetch friends error:", err);
      setError(err instanceof Error ? err.message : "Failed to load friends");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFriends();
    }, [user?.id, token]),
  );

  return (
    <ScreenWrapper style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Friends</Text>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>Loading friends...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : friends.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Feather name="users" size={30} color={theme.colors.textMuted} />
            </View>

            <Text style={styles.emptyTitle}>No friends yet</Text>
            <Text style={styles.emptyText}>
              People you add will appear here.
            </Text>
          </View>
        ) : (
          friends.map((friend) => (
            <TouchableOpacity
              key={friend.id}
              style={styles.friendRow}
              onPress={() =>
                router.push({
                  pathname: "/friendProfile",
                  params: { id: friend.id },
                })
              }
            >
              {friend.profilePic ? (
                <Image
                  source={{ uri: friend.profilePic }}
                  style={styles.avatar}
                />
              ) : (
                <Image
                  source={require("@/assets/images/default-avatar.png")}
                  style={styles.avatar}
                />
              )}

              <View style={styles.friendInfo}>
                <Text style={styles.username}>{friend.username}</Text>
                <Text style={styles.bio} numberOfLines={1}>
                  {friend.bio || "No bio yet"}
                </Text>
              </View>

              <Feather
                name="chevron-right"
                size={20}
                color={theme.colors.textSubtle}
              />
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: theme.colors.background,
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
    fontWeight: "900",
    color: theme.colors.text,
    textAlign: "center",
  },

  headerSpacer: {
    width: 32,
    height: 32,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },

  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    marginBottom: 10,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.surfaceMuted,
    marginRight: 12,
  },

  friendInfo: {
    flex: 1,
  },

  username: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },

  bio: {
    marginTop: 4,
    fontSize: 13,
    color: theme.colors.textMuted,
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 120,
  },

  emptyIcon: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 10,
  },

  emptyText: {
    fontSize: 15,
    color: theme.colors.textMuted,
    textAlign: "center",
  },

  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 120,
  },

  stateText: {
    fontSize: 15,
    color: theme.colors.textMuted,
    textAlign: "center",
  },

  errorText: {
    fontSize: 15,
    color: theme.colors.danger,
    textAlign: "center",
  },
});
