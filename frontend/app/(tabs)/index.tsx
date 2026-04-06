import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Location from "expo-location";

interface LocationData {
  latitude: number;
  longitude: number;
}

const getAddress = async (
  latitude: number,
  longitude: number,
): Promise<string> => {
  const subscriptionKey = ""; // Replace with your Azure Maps key
  const url = `https://atlas.microsoft.com/search/address/reverse/json?api-version=1.0&query=${latitude},${longitude}&subscription-key=${subscriptionKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Azure Maps API error response:", errorText);
      return `API error: ${response.status}`;
    }

    const data = await response.json();

    if (data.addresses && data.addresses.length > 0) {
      const address = data.addresses[0].address;

      if (address && typeof address.freeformAddress === "string") {
        return address.freeformAddress;
      }
    }

    return "No address found";
  } catch (error) {
    console.error("Azure Maps reverse geocode error:", error);
    return "Error fetching address";
  }
};

const index: React.FC = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [place, setPlace] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };
      setLocation(coords);

      const placeName = await getAddress(coords.latitude, coords.longitude);
      setPlace(placeName);
    })();
  }, []);

  let locationTest = "Waiting for location...";
  if (errorMsg) {
    locationTest = errorMsg;
  } else if (place) {
    locationTest = `Location: ${place}`;
  } else if (location) {
    locationTest = `Latitude: ${location.latitude}, Longitude: ${location.longitude}`;
  }

  return (
    <View style={styles.container}>
      <Text>{locationTest}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default index;
