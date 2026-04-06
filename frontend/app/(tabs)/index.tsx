import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
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
    const mapsWork = await fetch(url);
    if (!mapsWork.ok) {
      const errorText = await mapsWork.text();
      console.error("Azure Maps API error response:", errorText);
      return `API error: ${mapsWork.status} (Have you entered your Azure Maps key?)`;
    }

    const data = await mapsWork.json();

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
  const [MapView, setMapView] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS !== "web") {
      import("react-native-maps")
        .then((module) => {
          setMapView(() => module.default);
        })
        .catch((e) => {
          console.error("Failed to load react-native-maps:", e);
        });
    }
  }, []);

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
  let mapOrMessage = null;
  if (location) {
    if (Platform.OS !== "web") {
      const initialRegion = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      mapOrMessage = (
        <MapView style={styles.map} initialRegion={initialRegion} />
      );
    } else {
      mapOrMessage = <Text>Map is not supported on web in Expo Go.</Text>;
    }
  }
  return (
    <View style={styles.container}>
      <Text>{locationTest}</Text>
      {mapOrMessage}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: "90%",
  },
});

export default index;
