import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React from "react";
import Feather from "@expo/vector-icons/Feather";

type ProfileHeaderProps = {
  username: string;
  bio: string;
  followingCount: number;
  followersCount: number;
  onPressEdit?: () => void;
  onPressSettings?: () => void;
};

const ProfileHeader = ({
  username,
  bio,
  followingCount,
  followersCount,
  onPressEdit,
  onPressSettings,
}: ProfileHeaderProps) => {
  return (
    <View style={styles.header}>
      <View style={styles.profileTopRow}>
        <View style={styles.avatarRow}>
          <Image
            source={require("@/assets/images/default-avatar.png")}
            style={styles.avatar}
          />

          <View style={styles.userInfo}>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>{username}</Text>
              <TouchableOpacity style={styles.editButton} onPress={onPressEdit}>
                <Feather name="edit" size={18} color="black" />
              </TouchableOpacity>
            </View>

            <Text style={styles.bio}>{bio}</Text>

            <View style={styles.statsRow}>
              <Text style={styles.statText}>Following {followingCount}</Text>
              <Text style={styles.statText}>Followers {followersCount}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={onPressSettings}>
          <Feather name="settings" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileHeader;

const styles = StyleSheet.create({
  header: {
    marginTop: 24,
    marginBottom: 24,
  },

  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  username: {
    fontSize: 24,
    fontWeight: "700",
  },

  bio: {
    fontSize: 14,
    marginBottom: 12,
    color: "#666",
  },

  statsRow: {
    flexDirection: "row",
    gap: 24,
  },

  statText: {
    fontSize: 14,
  },

  profileTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 16,
    backgroundColor: "#ddd",
  },

  userInfo: {
    flex: 1,
  },

  editButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
