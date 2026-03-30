import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Feather from "@expo/vector-icons/Feather";
import ProfileTab from "@/components/profile/ProfileTab";
import ProfileHeader from "@/components/profile/ProfileHeader";

const Profile = () => {
  const [activeTab, setActiveTab] = useState<"posts" | "save">("posts");

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <ProfileHeader
        username="Username"
        bio="BIO"
        followingCount={0}
        followersCount={0}
        onPressEdit={() => {}}
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

      {activeTab === "posts" ? (
        <View style={styles.gridPlaceHolder}>
          <View style={styles.leftColumn}>
            <View style={styles.largeCard} />
            <View style={styles.smallCard} />
            <View style={styles.mediumCard} />
          </View>

          <View style={styles.rightColumn}>
            <View style={styles.mediumCard} />
            <View style={styles.largeCard} />
            <View style={styles.mediumCard} />
          </View>
        </View>
      ) : (
        <View style={styles.savedPlaceHolder}>
          <View style={styles.savedCard} />
          <View style={styles.savedCard} />
          <View style={styles.savedCard} />
          <View style={styles.savedCard} />
          <View style={styles.savedCard} />
        </View>
      )}
    </ScreenWrapper>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    padding: 12,
  },

  tabRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 20,
  },

  gridPlaceHolder: {
    // flex: 1,
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

  largeCard: {
    height: 240,
    borderRadius: 12,
    backgroundColor: "#e7e7e7",
  },

  mediumCard: {
    height: 200,
    borderRadius: 12,
    backgroundColor: "#e7e7e7",
  },

  smallCard: {
    height: 160,
    borderRadius: 12,
    backgroundColor: "#e7e7e7",
  },

  // editButton: {
  //   width: 24,
  //   height: 24,
  //   borderRadius: 12,
  //   justifyContent: "center",
  //   alignItems: "center",
  // },

  savedPlaceHolder: {
    gap: 8,
  },

  savedCard: {
    height: 120,
    borderRadius: 12,
    backgroundColor: "#e7e7e7",
  },
});
