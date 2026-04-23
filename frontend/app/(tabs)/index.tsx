import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import ScreenWrapper from "@/components/ScreenWrapper";
import * as Location from "expo-location";
import { API_BASE_URL } from "@/services/api";
import { router } from "expo-router";

type BackendCoordinates = {
  type: string;
  coordinates: [number, number];
};

type BackendLocation = {
  id: string;
  name: string;
  category: string;
  address: string;
  coordinates: BackendCoordinates | null;
  image?: string;
};

type Location = {
  id: string;
  title: string;
  category: string;
  address: string;
  image?: string;
};

const index = () => {
  const [location, setLocation] = useState<string>("Loading...");
  const [searchText, setSearchText] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [isFocused, setFocused] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocation("Permission denied");
          return;
        }
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        const coordsText = `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`;
        setLocation(coordsText);
        try {
          const address = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
          if (address.length > 0) {
            setLocation(address[0].city || address[0].region || coordsText);
          }
        } catch (reverseError) {
          console.log("Reverse geocode failed, showing coords:", reverseError);
        }
      } catch (error) {
        console.log("Location error:", error);
        setLocation("Location unavailable");
      }
    })();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/locations`);
        if (!response.ok) console.warn(`Status ${response.status}`);

        const data: BackendLocation[] = await response.json();

        const mapped: Location[] = data.map((loc) => ({
          id: loc.id,
          title: loc.name,
          category: loc.category,
          address: loc.address ?? "No address provided",
          image: loc.image,
        }));

        setLocations(mapped);
      } catch (err) {
        console.log("Failed to fetch locations:", err);
      }
    };

    fetchLocations();
  }, []);

  const filteredLocations = locations.filter((loc) =>
    loc.title.toLowerCase().includes(searchText.toLowerCase()),
  );
  const showSuggestions =
    isFocused && searchText.trim().length > 0 && filteredLocations.length > 0;

  const handleSelectLocation = (location: Location) => {
    setSearchText("");
    setFocused(false);
    router.push({
      pathname: "/placeDetails",
      params: { id: location.id },
    });
  };
  const handleClear = () => {
    setSearchText("");
    setFocused(false);
  };

  const popularPlaces = locations.slice(0, 3);
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.locationCont}>
          <Ionicons name="location-outline" size={50} />
          <Text style={styles.locationText}>{location}</Text>
        </View>

        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search location"
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setTimeout(() => setFocused(false), 150);
            }}
            onSubmitEditing={() => {
              if (filteredLocations.length > 0) {
                handleSelectLocation(filteredLocations[0]);
              }
            }}
            returnKeyType="search"
          />
          {searchText.trim().length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <Feather name="x" size={18} color="#888" />
            </TouchableOpacity>
          )}
        </View>
        {showSuggestions && (
          <View style={styles.suggestionsList}>
            {filteredLocations.slice(0, 5).map((location) => (
              <TouchableOpacity
                key={location.id}
                style={styles.suggestionItem}
                onPress={() => handleSelectLocation(location)}
              >
                <Text style={styles.suggestionTitle}>{location.title}</Text>
                <Text style={styles.suggestionMeta}>
                  {location.category} · {location.address}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Popular Places</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {popularPlaces.map((place) => (
            <TouchableOpacity
              key={place.id}
              style={styles.largeCard}
              onPress={() =>
                router.push({
                  pathname: "/placeDetails",
                  params: { id: place.id },
                })
              }
            >
              {place.image ? (
                <Image
                  source={{ uri: place.image }}
                  style={StyleSheet.absoluteFillObject}
                  borderRadius={20}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[StyleSheet.absoluteFillObject, styles.placeholderBg]}
                />
              )}
              <View style={styles.cardLabel}>
                <Text style={styles.cardTitle}>{place.title}</Text>
                <Text style={styles.cardCategory}>{place.category}</Text>
              </View>
              <Feather name="arrow-right" size={20} style={styles.arrowIcon} />
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.sectionTitle}>Friends Posts</Text>
        <View style={styles.row}>
          <View style={styles.smallCard} />
          <View style={styles.smallCard} />
        </View>
      </View>
    </ScreenWrapper>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingTop: 0,
    padding: 30,
  },

  locationCont: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  locationText: {
    fontSize: 16,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 5,
    gap: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111",
  },

  suggestionsList: {
    backgroundColor: "white",
    borderRadius: 16,
    marginTop: 6,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  suggestionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },

  suggestionMeta: {
    marginTop: 2,
    fontSize: 12,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    marginTop: 10,
  },

  largeCard: {
    height: 200,
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 15,
    marginBottom: 30,
  },

  arrowIcon: {
    opacity: 0.6,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  smallCard: {
    width: "48%",
    height: 200,
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
  },
  placeholderBg: {
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
  },
  cardLabel: {
    position: "absolute",
    bottom: 12,
    left: 14,
  },
  cardTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardCategory: {
    color: "#eee",
    fontSize: 12,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});

export default index;
