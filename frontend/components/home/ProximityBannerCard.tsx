import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import Card from "@/components/ui/Card";

export type ProximityBannerData = {
  locationId: string;
  locationName: string;
  username: string;
  rating?: number | null;
  isNearby: boolean;
};

type Props = {
  banner: ProximityBannerData;
  onPress: () => void;
  onDismiss: () => void;
};

const ProximityBannerCard = ({ banner, onPress, onDismiss }: Props) => {
  return (
    <Card style={styles.card}>
      <TouchableOpacity
        style={styles.main}
        activeOpacity={0.85}
        onPress={onPress}
      >
        <View style={styles.icon}>
          <Feather name="map-pin" size={17} color="#2563EB" />
        </View>

        <View style={styles.textGroup}>
          <Text style={styles.label}>
            {banner.isNearby ? "Near you" : "From your friends"}
          </Text>

          <Text style={styles.title} numberOfLines={1}>
            {banner.username} recommends this place
          </Text>

          <Text style={styles.text} numberOfLines={1}>
            {banner.locationName}
            {banner.rating ? ` · ${banner.rating}/5` : ""}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.closeButton}
        hitSlop={12}
        onPress={onDismiss}
      >
        <Feather name="x" size={20} color="#777" />
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingRight: 10,
  },
  main: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  textGroup: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    marginBottom: 3,
    fontSize: 11,
    fontWeight: "800",
    color: "#2563EB",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111",
  },
  text: {
    marginTop: 3,
    fontSize: 12,
    color: "#777",
  },
  closeButton: {
    width: 36,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ProximityBannerCard;
