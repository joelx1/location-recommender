import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React from "react";
import Feather from "@expo/vector-icons/Feather";
import { theme } from "@/theme";

type ProfileHeaderProps = {
  username: string;
  bio: string;
  followingCount: number;
  followersCount: number;
  friendCount?: number;
  showActions?: boolean;
  profilePic?: string;
  onPressFriendCount?: () => void;
  onPressEdit?: () => void;
  onPressLogout?: () => void;
};

const ProfileHeader = ({
  username,
  bio,
  followingCount,
  followersCount,
  friendCount,
  showActions = true,
  profilePic,
  onPressFriendCount,
  onPressEdit,
  onPressLogout,
}: ProfileHeaderProps) => {
  return (
    <View style={styles.header}>
      <View style={styles.profileTopRow}>
        <View style={styles.avatarRow}>
          <Image
            source={
              profilePic
                ? { uri: profilePic }
                : require("@/assets/images/default-avatar.png")
            }
            style={styles.avatar}
          />

          <View style={styles.userInfo}>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>{username}</Text>
              {showActions && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={onPressEdit}
                >
                  <Feather name="edit" size={18} color={theme.colors.text} />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.bio}>{bio}</Text>

            <View style={styles.statsRow}>
              {friendCount !== undefined ? (
                <TouchableOpacity
                  onPress={onPressFriendCount}
                  disabled={!onPressFriendCount}
                  style={styles.statButton}
                >
                  <Text style={styles.statText}>Friends {friendCount}</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <Text style={styles.statText}>
                    Following {followingCount}
                  </Text>
                  <Text style={styles.statText}>
                    Followers {followersCount}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        {showActions && (
          <TouchableOpacity onPress={onPressLogout}>
            <Feather name="log-out" size={22} color={theme.colors.text} />
          </TouchableOpacity>
        )}
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
    fontWeight: "900",
    color: theme.colors.text,
  },

  bio: {
    fontSize: 14,
    marginBottom: 12,
    color: theme.colors.textMuted,
  },

  statsRow: {
    flexDirection: "row",
    gap: 24,
  },

  statText: {
    fontSize: 14,
    color: theme.colors.text,
  },

  profileTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingRight: 8,
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
    backgroundColor: theme.colors.surfaceMuted,
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
  statButton: {
    paddingVertical: 2,
  },
});
