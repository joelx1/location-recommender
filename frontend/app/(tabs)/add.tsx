import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenWrapper from "@/components/ScreenWrapper";
import Feather from "@expo/vector-icons/Feather";
import { API_BASE_URL } from "@/services/api";

type PlaceResult = {
  id: string;
  name: string;
  address: string;
  category: string;
  latitude?: number;
  longitude?: number;
};

type BackendCoordinates = {
  type: string;
  coordinates: [number, number];
};

type BackendLocation = {
  id: string;
  name: string;
  address: string | null;
  category: string;
  coordinates: BackendCoordinates | null;
};

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

const TEST_USER_ID = "e4749887-88df-4867-bce5-545cb331fa92";

const Add = () => {
  const [step, setStep] = useState<"search" | "review">("search");
  const [searchText, setSearchText] = useState("");
  const [locations, setLocations] = useState<PlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [locationsError, setLocationsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoadingLocations(true);
        setLocationsError(null);

        const response = await fetch(`${API_BASE_URL}/locations`);

        if (!response.ok) {
          throw new Error(`Failed to load locations (${response.status})`);
        }

        const data: BackendLocation[] = await response.json();
        const mappedLocations: PlaceResult[] = data.map((location) => ({
          id: location.id,
          name: location.name,
          address: location.address ?? "No address provided",
          category: location.category,
          latitude: location.coordinates?.coordinates?.[1],
          longitude: location.coordinates?.coordinates?.[0],
        }));

        setLocations(mappedLocations);
      } catch (error) {
        console.log("fetch locations error:", error);
        setLocationsError(
          error instanceof Error ? error.message : "Failed to load locations.",
        );
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  const filteredResults = locations.filter((place) => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) return true;

    return (
      place.name.toLowerCase().includes(keyword) ||
      place.address.toLowerCase().includes(keyword) ||
      place.category.toLowerCase().includes(keyword)
    );
  });

  const handleSelectPlace = (place: PlaceResult) => {
    setSelectedPlace(place);
    setStep("review");
  };

  const handleBackToSearch = () => {
    setStep("search");
    setSelectedPlace(null);
    setRating(0);
    setReviewText("");
  };

  const handleClearSearch = () => {
    setSearchText("");
  };

  const handlePostReview = async () => {
    if (!selectedPlace?.id) {
      Alert.alert("Missing location", "Please select a location first.");
      return;
    }

    if (!TEST_USER_ID) {
      Alert.alert("Missing test user", "Please set TEST_USER_ID first.");
      return;
    }

    if (rating < 1 || rating > 5) {
      Alert.alert("Missing rating", "Please select a rating.");
      return;
    }

    const payload: ReviewPayload = {
      user: {
        id: TEST_USER_ID,
      },
      location: {
        id: selectedPlace.id,
      },
      rating,
      body: reviewText.trim(),
    };

    try {
      setSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("post review failed:", response.status, errorText);
        throw new Error(errorText || `Request failed with ${response.status}`);
      }

      await response.json();

      Alert.alert("Success", "Review posted successfully.");

      setStep("search");
      setSearchText("");
      setSelectedPlace(null);
      setRating(0);
      setReviewText("");
    } catch (error) {
      console.log("post review error:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to post review.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper style={styles.screen} edges={["top", "bottom"]}>
      <View style={styles.container}>
        {step === "search" ? (
          <View style={styles.searchStep}>
            <Text style={styles.pageTitle}>Add a Review</Text>

            <View style={styles.searchBar}>
              <Feather name="search" size={18} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search location"
                placeholderTextColor="#888"
                value={searchText}
                onChangeText={setSearchText}
                returnKeyType="search"
              />

              {searchText.trim().length > 0 && (
                <TouchableOpacity
                  onPress={handleClearSearch}
                  style={styles.cancelButton}
                >
                  <Feather name="x" size={18} color="#666" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.suggestionsList}>
              {loadingLocations ? (
                <Text style={styles.helperText}>Loading locations...</Text>
              ) : locationsError ? (
                <Text style={styles.errorText}>{locationsError}</Text>
              ) : filteredResults.length === 0 ? (
                <Text style={styles.helperText}>
                  No matching locations found.
                </Text>
              ) : (
                filteredResults.map((place) => (
                  <TouchableOpacity
                    key={place.id}
                    style={styles.suggestionItem}
                    onPress={() => handleSelectPlace(place)}
                  >
                    <Text style={styles.suggestionTitle}>{place.name}</Text>
                    <Text style={styles.suggestionMeta}>
                      {place.category} · {place.address}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        ) : (
          <View style={styles.reviewStep}>
            <View style={styles.reviewHeader}>
              <TouchableOpacity
                onPress={handleBackToSearch}
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

              <View style={styles.mediaActions}>
                <TouchableOpacity style={styles.mediaButton}>
                  <Feather name="image" size={28} color="#333" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.mediaButton}>
                  <Feather name="camera" size={28} color="#333" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.postButton,
                submitting && styles.postButtonDisabled,
              ]}
              onPress={handlePostReview}
              disabled={submitting}
            >
              <Text style={styles.postButtonText}>
                {submitting ? "Posting..." : "Post"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default Add;

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

  searchStep: {
    flex: 1,
  },

  pageTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 16,
    textAlign: "center",
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 16,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#111",
  },

  cancelButton: {
    padding: 4,
  },

  suggestionsList: {
    gap: 10,
  },

  suggestionItem: {
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    padding: 14,
  },

  suggestionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },

  suggestionMeta: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },

  helperText: {
    fontSize: 14,
    color: "#666",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  errorText: {
    fontSize: 14,
    color: "#c62828",
    paddingVertical: 8,
    paddingHorizontal: 4,
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
    flex: 1,
    backgroundColor: "#f2f2f2",
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    justifyContent: "space-between",
  },

  textInput: {
    flex: 1,
    minHeight: 220,
    fontSize: 16,
    color: "#111",
  },

  mediaActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },

  mediaButton: {
    width: 86,
    height: 86,
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
});
