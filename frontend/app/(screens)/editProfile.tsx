import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { API_BASE_URL } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import * as ImagePicker from "expo-image-picker";

type BackendUser = {
  id: string;
  username: string;
  email: string;
  bio?: string | null;
  profilePic?: string | null;
};

const EditProfile = () => {
  const { token, user } = useAuth();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_BASE_URL}/users/${user!.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`User request failed with status ${response.status}`);
        }

        const userData: BackendUser = await response.json();

        setUsername(userData.username ?? "");
        setBio(userData.bio ?? "");
        setEmail(userData.email ?? "");
        setProfilePic(userData.profilePic ?? null);
      } catch (error) {
        console.log("fetch user error:", error);
        Alert.alert("Error", "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      const response = await fetch(`${API_BASE_URL}/users/${user!.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          bio,
          email,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Request failed with ${response.status}`);
      }

      await response.json();

      Alert.alert("Success", "Profile updated successfully.");
      router.back();
    } catch (error) {
      console.log("save profile error:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const uploadProfilePicture = async (imageUri: string) => {
    const fileName = imageUri.split("/").pop() ?? "profile-photo.jpg";
    const fileType = fileName.split(".").pop()?.toLowerCase() ?? "jpg";

    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      name: fileName,
      type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
    } as any);

    const response = await fetch(
      `${API_BASE_URL}/users/${user!.id}/profile-picture`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Profile picture upload failed");
    }

    return response.json() as Promise<{ url: string }>;
  };

  const handlePickProfileImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission needed",
          "Please allow photo library access to upload a profile picture.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const selectedUri = result.assets[0].uri;
      const uploadResult = await uploadProfilePicture(selectedUri);

      setProfilePic(uploadResult.url);

      Alert.alert("Success", "Profile picture updated.");
    } catch (error) {
      console.log("upload profile picture error:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to upload profile picture.",
      );
    }
  };

  if (loading) {
    return (
      <ScreenWrapper style={styles.container}>
        <Text>Loading profile...</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.buttonActions}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSaveProfile} disabled={saving}>
          <Text style={styles.saveText}>{saving ? "Saving..." : "Save"}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          <Image
            source={
              profilePic
                ? { uri: profilePic }
                : require("@/assets/images/default-avatar.png")
            }
            style={styles.avatar}
          />

          <TouchableOpacity
            style={styles.uploadIconButton}
            onPress={handlePickProfileImage}
          >
            <Feather name="camera" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>BIO</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="Tell people a little about yourself"
            multiline
            value={bio}
            onChangeText={setBio}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="E-mail address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },

  avatarSection: {
    alignItems: "center",
    marginTop: 36,
    marginBottom: 36,
  },

  avatarWrapper: {
    position: "relative",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff",
    backgroundColor: "#fff",
  },

  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    resizeMode: "cover",
  },

  uploadIconButton: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },

  form: {
    gap: 24,
    marginBottom: 40,
  },

  inputGroup: {
    gap: 10,
  },

  label: {
    fontSize: 14,
    color: "black",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    backgroundColor: "#f3f3f3",
  },

  bioInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  buttonActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  cancelText: {
    fontSize: 16,
    color: "black",
  },

  saveText: {
    fontSize: 16,
    color: "black",
    fontWeight: "500",
  },
});
