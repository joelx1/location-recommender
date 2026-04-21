import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenWrapper from "@/components/ScreenWrapper";
import Feather from "@expo/vector-icons/Feather";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { API_BASE_URL } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import type { PlaceResult, PlaceSource } from "@/types/place";

type ReviewPayload = {
  user: {
    id: string;
  };
  location: {
    id: string;
  };
  rating: number;
  body: string;
};

type CreatedReview = {
  id: string;
};

const AddReview = () => {
  const { token, user } = useAuth();

  const params = useLocalSearchParams<{
    source?: PlaceSource;
    id?: string;
    googlePlaceId?: string;
    name?: string;
    address?: string;
    category?: string;
    latitude?: string;
    longitude?: string;
  }>();

  const selectedPlace = useMemo<PlaceResult | null>(() => {
    if (!params.id || !params.name) return null;

    return {
      id: params.id,
      name: params.name,
      address: params.address ?? "No address provided",
      category: params.category ?? "place",
      latitude: params.latitude ? Number(params.latitude) : undefined,
      longitude: params.longitude ? Number(params.longitude) : undefined,
      source: params.source ?? "db",
      googlePlaceId: params.googlePlaceId || undefined,
    };
  }, [
    params.id,
    params.name,
    params.address,
    params.category,
    params.latitude,
    params.longitude,
    params.source,
    params.googlePlaceId,
  ]);

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  const createLocationFromGooglePlace = async (place: PlaceResult) => {
    const payload = {
      name: place.name,
      address: place.address,
      category: place.category,
      latitude: place.latitude,
      longitude: place.longitude,
      googlePlaceId: place.googlePlaceId,
    };

    const response = await fetch(`${API_BASE_URL}/locations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        errorText || `Failed to create location (${response.status})`,
      );
    }

    return response.json();
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow photo library access to upload an image.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImageUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow camera access to take a photo.",
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.log("camera error:", error);
      Alert.alert(
        "Camera unavailable",
        "Camera is not available on this device. Please choose a photo from your library.",
      );
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageUri(null);
  };

  const uploadReviewPhoto = async (reviewId: string, imageUri: string) => {
    const fileName = imageUri.split("/").pop() ?? "review-photo.jpg";
    const fileType = fileName.split(".").pop()?.toLowerCase() ?? "jpg";

    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      name: fileName,
      type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
    } as any);

    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/photo`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Photo upload failed");
    }

    return response.json();
  };

  const handlePostReview = async () => {
    if (!selectedPlace?.id) {
      Alert.alert("Missing location", "Please select a location first.");
      return;
    }

    if (!user?.id) {
      Alert.alert("Missing user", "Please log in again.");
      return;
    }

    if (rating < 1 || rating > 5) {
      Alert.alert("Missing rating", "Please select a rating.");
      return;
    }

    try {
      setSubmitting(true);

      let locationId = selectedPlace.id;

      if (selectedPlace.source === "google") {
        const createdLocation =
          await createLocationFromGooglePlace(selectedPlace);
        locationId = createdLocation.id;
      }

      const payload: ReviewPayload = {
        user: {
          id: user.id,
        },
        location: {
          id: locationId,
        },
        rating,
        body: reviewText.trim(),
      };

      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("post review failed:", response.status, errorText);
        throw new Error(errorText || `Request failed with ${response.status}`);
      }

      const createdReview: CreatedReview = await response.json();

      if (selectedImageUri) {
        await uploadReviewPhoto(createdReview.id, selectedImageUri);
      }

      Alert.alert("Success", "Review posted successfully.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.log("post review error:", error);

      const message =
        error instanceof Error ? error.message : "Failed to post review.";

      if (message.includes("reviews_user_id_location_id_key")) {
        Alert.alert("You have already reviewed this place.");
        return;
      }

      if (message.toLowerCase().includes("photo upload failed")) {
        Alert.alert("Photo upload failed.");
        return;
      }

      Alert.alert("Failed to post review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper style={styles.screen} edges={["top", "bottom"]} scrollable>
      <View style={styles.container}>
        <View style={styles.reviewStep}>
          <View style={styles.reviewHeader}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Feather name="chevron-left" size={26} color="#111" />
            </TouchableOpacity>

            <Text style={styles.reviewTitle}>
              {selectedPlace?.name ?? "Selected Place"}
            </Text>

            <View style={styles.headerSpacer} />
          </View>

          <Text style={styles.reviewAddress}>
            {selectedPlace?.address ?? ""}
          </Text>

          <View style={styles.starsRow}>
            {Array.from({ length: 5 }, (_, index) => {
              const starValue = index + 1;
              const selected = starValue <= rating;

              return (
                <Pressable
                  key={starValue}
                  onPress={() => setRating(starValue)}
                  style={styles.starButton}
                >
                  <Feather
                    name="star"
                    size={34}
                    color={selected ? "#111" : "#bbb"}
                  />
                </Pressable>
              );
            })}
          </View>

          <View style={styles.editorCard}>
            <TextInput
              style={styles.textInput}
              placeholder="Add review..."
              placeholderTextColor="#777"
              multiline
              textAlignVertical="top"
              value={reviewText}
              onChangeText={setReviewText}
            />
          </View>

          <View style={styles.mediaSection}>
            {selectedImageUri ? (
              <View style={styles.thumbnailWrapper}>
                <Image
                  source={{ uri: selectedImageUri }}
                  style={styles.imagePreview}
                />
                <TouchableOpacity
                  onPress={handleRemoveImage}
                  style={styles.removeImageButton}
                >
                  <Feather name="x" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.mediaButton}
                  onPress={handlePickImage}
                >
                  <Feather name="image" size={28} color="#333" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mediaButton}
                  onPress={handleTakePhoto}
                >
                  <Feather name="camera" size={28} color="#333" />
                </TouchableOpacity>
              </>
            )}
          </View>

          <TouchableOpacity
            style={[styles.postButton, submitting && styles.postButtonDisabled]}
            onPress={handlePostReview}
            disabled={submitting}
          >
            <Text style={styles.postButtonText}>
              {submitting ? "Posting..." : "Post"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default AddReview;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  reviewStep: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backButton: {
    width: 36,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  reviewTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },
  headerSpacer: {
    width: 36,
  },
  reviewAddress: {
    textAlign: "center",
    fontSize: 13,
    color: "#777",
    marginBottom: 28,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    marginBottom: 28,
  },
  starButton: {
    padding: 2,
  },
  editorCard: {
    backgroundColor: "#f2f2f2",
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    marginBottom: 16,
  },
  textInput: {
    minHeight: 150,
    fontSize: 16,
    color: "#111",
  },
  mediaSection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  mediaButton: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: "#dddddd",
    alignItems: "center",
    justifyContent: "center",
  },
  postButton: {
    marginTop: 22,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  thumbnailWrapper: {
    width: 72,
    height: 72,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
});
