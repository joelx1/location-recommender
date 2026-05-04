import { useCallback, useEffect, useState } from "react";
import * as ExpoLocation from "expo-location";

export const DEFAULT_COORDS = {
  latitude: 53.3498,
  longitude: -6.2603,
};

export const useCurrentLocation = () => {
  const [locationLabel, setLocationLabel] = useState("Loading...");
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const refreshLocation = useCallback(async () => {
    try {
      setLoadingLocation(true);

      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationLabel("Permission denied");
        setCoords(DEFAULT_COORDS);
        return;
      }

      const loc = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Highest,
      });

      const nextCoords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      setCoords(nextCoords);

      const coordsText = `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`;
      setLocationLabel(coordsText);

      try {
        const address = await ExpoLocation.reverseGeocodeAsync(nextCoords);

        if (address.length > 0) {
          setLocationLabel(address[0].city || address[0].region || coordsText);
        }
      } catch (reverseError) {
        console.log("Reverse geocode failed:", reverseError);
      }
    } catch (error) {
      console.log("Location error:", error);
      setLocationLabel("Location unavailable");
      setCoords(DEFAULT_COORDS);
    } finally {
      setLoadingLocation(false);
    }
  }, []);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  return {
    locationLabel,
    coords,
    loadingLocation,
    refreshLocation,
  };
};
