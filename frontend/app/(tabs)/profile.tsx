import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import ProfileTab from "@/components/profile/ProfileTab";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { router } from "expo-router";

const mockProfile = {
  username: "Joye",
  bio: "Take Life Easy",
  profilePic: "",
  followingCount: 100,
  followersCount: 99,
};

const mockPosts = [
  {
    id: "1",
    locationName: "Cafe_1",
    body: "Body placeholder",
    rating: 5,
    createdAt: "01/04/2026",
  },
  {
    id: "2",
    locationName: "Bar",
    body: "Body placeholder",
    rating: 4,
    createdAt: "01/04/2026",
  },
  {
    id: "3",
    locationName: "Restaurant",
    body: "Body placeholder",
    rating: 4.5,
    createdAt: "01/04/2026",
  },
  {
    id: "4",
    locationName: "Cafe_2",
    body: "Body placeholder",
    rating: 5,
    createdAt: "29/03/2026",
  },
  {
    id: "5",
    locationName: "Cafe_3",
    body: "Body placeholder",
    rating: 5,
    createdAt: "01/04/2026",
  },
  {
    id: "6",
    locationName: "Cafe_4",
    body: "Body placeholder",
    rating: 5,
    createdAt: "01/04/2026",
  },
];

const mockSaved = [
  {
    id: "1",
    locationName: "Cafe",
    rating: 5,
    createdAt: "01/04/2026",
  },
  {
    id: "2",
    locationName: "Bar",
    rating: 5,
    createdAt: "01/04/2026",
  },
  {
    id: "3",
    locationName: "Restaurant",
    rating: 5,
    createdAt: "01/04/2026",
  },
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState<"posts" | "save">("posts");
  const [profileData, setProfileData] = useState(mockProfile);
  const [postsData, setPostsData] = useState(mockPosts);
  const [savedData, setSavedData] = useState(mockSaved);
  const leftColumnData = postsData.filter((_, index) => index % 2 === 0);
  const rightColumnData = postsData.filter((_, index) => index % 2 !== 0);

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

      {activeTab === "posts" ? (
        <View style={styles.gridPlaceHolder}>
          <View style={styles.leftColumn}>
            {leftColumnData.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.gridCard,
                  {
                    height: index % 3 === 0 ? 160 : index % 3 === 1 ? 240 : 200,
                  },
                ]}
              >
                <Text style={{ padding: 4, fontWeight: "bold" }}>
                  {item.locationName}
                </Text>
                <Text style={{ fontSize: 12, padding: 4 }}>
                  {item.rating} star
                </Text>
                <Text style={{ padding: 4, fontSize: 12 }}>{item.body}</Text>
                <Text
                  style={{
                    fontSize: 10,
                    padding: 4,
                    textAlign: "right",
                  }}
                >
                  {item.createdAt}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.rightColumn}>
            {rightColumnData.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.gridCard,
                  {
                    height: index % 3 === 0 ? 240 : index % 3 === 1 ? 240 : 160,
                  },
                ]}
              >
                <Text style={{ padding: 4, fontWeight: "bold" }}>
                  {item.locationName}
                </Text>
                <Text style={{ fontSize: 12, padding: 4 }}>
                  {item.rating} star
                </Text>
                <Text style={{ padding: 4, fontSize: 12 }}>{item.body}</Text>
                <Text
                  style={{
                    fontSize: 10,
                    padding: 4,
                    textAlign: "right",
                  }}
                >
                  {item.createdAt}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.savedPlaceHolder}>
          {savedData.map((item) => (
            <View key={item.id} style={[styles.savedCard]}>
              <Text style={{ padding: 4, fontWeight: "bold" }}>
                {item.locationName}
              </Text>
              <Text style={{ fontSize: 12, padding: 4 }}>
                {item.rating} star
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  padding: 4,
                  textAlign: "right",
                }}
              >
                {item.createdAt}
              </Text>
            </View>
          ))}
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

  savedPlaceHolder: {
    gap: 8,
  },

  savedCard: {
    height: 120,
    borderRadius: 12,
    backgroundColor: "#e7e7e7",
  },

  gridCard: {
    borderRadius: 12,
    backgroundColor: "#e7e7e7",
  },
});
