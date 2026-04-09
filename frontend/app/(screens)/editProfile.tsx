import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";

const mockUser = {
  username: "Joye",
  bio: "Take Life Easy.",
  email: "ye.zhang.2024@mumail.ie",
};

const EditProfile = () => {
  const [username, setUsername] = useState(mockUser.username);
  const [bio, setBio] = useState(mockUser.bio);
  const [email, setEmail] = useState(mockUser.email);

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.buttonActions}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            (console.log({ username, bio, email }), router.back());
          }}
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          <Image
            source={require("@/assets/images/default-avatar.png")}
            style={styles.avatar}
          />

          <TouchableOpacity style={styles.uploadIconButton}>
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
