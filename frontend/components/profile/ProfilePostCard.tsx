import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

import Card from "@/components/ui/Card";
import { theme } from "@/theme";

export type ProfilePostItem = {
  id: string;
  locationId: string;
  locationName: string;
  body: string;
  rating: number;
  createdAt: string;
  photoUrl?: string | null;
  category: string;
};

type ProfilePostCardProps = {
  post: ProfilePostItem;
  onPress: () => void;
  onDelete?: () => void;
};

export default function ProfilePostCard({
  post,
  onPress,
  onDelete,
}: ProfilePostCardProps) {
  return (
    <Card style={styles.card} onPress={onPress}>
      {post.photoUrl ? (
        <Image source={{ uri: post.photoUrl }} style={styles.cardImage} />
      ) : null}

      <View
        style={[styles.cardContent, !post.photoUrl && styles.textOnlyContent]}
      >
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {post.locationName}
          </Text>

          {onDelete ? (
            <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
              <Feather
                name="trash-2"
                size={14}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.cardRatingRow}>
          <Ionicons name="star" size={12} color={theme.colors.accent} />
          <Text style={styles.cardRating}>{post.rating}</Text>
          {post.category ? (
            <Text style={styles.cardCategoryInline}>{post.category}</Text>
          ) : null}
        </View>

        <Text style={styles.cardBody} numberOfLines={2}>
          {post.body || "No written review."}
        </Text>

        <Text style={styles.cardDate}>{post.createdAt}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.06)",
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
    // overflow: "hidden",
  },

  cardImage: {
    width: "92%",
    height: 108,
    borderRadius: theme.radius.md,
    marginTop: 8,
    marginBottom: 2,
    alignSelf: "center",
  },

  cardContent: {
    padding: 10,
  },

  cardTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
  },

  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
  },

  cardRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },

  cardRating: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.accent,
  },

  cardCategoryInline: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    marginLeft: 4,
    textTransform: "capitalize",
  },

  cardBody: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textMuted,
    marginBottom: 8,
  },

  cardDate: {
    textAlign: "right",
    fontSize: 11,
    color: theme.colors.textSubtle,
  },

  deleteButton: {
    padding: 2,
    opacity: 0.65,
  },

  textOnlyContent: {
    minHeight: 110,
  },
});
