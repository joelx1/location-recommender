import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import Card from "@/components/ui/Card";
import { theme } from "@/theme";

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
          <Feather name="map-pin" size={17} color={theme.colors.primary} />
        </View>

        <View style={styles.textGroup}>
          <Text style={styles.label}>
            {banner.isNearby ? "Near you" : "From your friends"}
          </Text>

          <Text style={styles.title} numberOfLines={1}>
            {banner.username} recommends this place
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.text} numberOfLines={1}>
              {banner.locationName}
            </Text>

            {banner.rating ? (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color={theme.colors.accent} />
                <Text style={styles.ratingText}>{banner.rating}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.closeButton}
        hitSlop={12}
        onPress={onDismiss}
      >
        <Feather name="x" size={20} color={theme.colors.textMuted} />
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
    backgroundColor: theme.colors.primarySoft,
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
    color: theme.colors.primary,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.text,
  },
  text: {
    flexShrink: 1,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 3,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "800",
    color: theme.colors.accent,
  },
  closeButton: {
    width: 36,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ProximityBannerCard;
