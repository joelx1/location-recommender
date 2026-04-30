import { Image, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PlaceCategoryImage from "@/components/places/PlaceCategoryImage";
import Card from "@/components/ui/Card";
import { theme } from "@/theme";

export type ReviewActivityItem = {
  id: string;
  userId?: string;
  username?: string;
  profilePic?: string | null;

  locationId?: string;
  locationName?: string;
  locationCategory?: string | null;
  locationAddress?: string | null;

  rating: number;
  body?: string | null;
  photoUrl?: string | null;
  createdAt?: string;

  user?: {
    id?: string;
    username?: string;
    profilePic?: string | null;
  };

  location?: {
    id?: string;
    name?: string;
    category?: string | null;
    address?: string | null;
  };
};

type Props = {
  post: ReviewActivityItem;
  onPress?: () => void;
};

const formatPostDate = (dateString?: string) => {
  if (!dateString) return "";

  return new Date(dateString).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
  });
};

const getPostUsername = (post: ReviewActivityItem) =>
  post.username || post.user?.username || "Friend";

const getPostProfilePic = (post: ReviewActivityItem) =>
  post.profilePic || post.user?.profilePic || null;

const getPostLocationName = (post: ReviewActivityItem) =>
  post.locationName || post.location?.name || "Unknown place";

const getPostLocationCategory = (post: ReviewActivityItem) =>
  post.locationCategory || post.location?.category || "place";

const ReviewActivityCard = ({ post, onPress }: Props) => {
  const profilePic = getPostProfilePic(post);
  const category = getPostLocationCategory(post);

  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.imageWrapper}>
        {post.photoUrl ? (
          <Image
            source={{ uri: post.photoUrl }}
            style={styles.fullImg}
            resizeMode="cover"
          />
        ) : (
          <PlaceCategoryImage category={category} style={styles.fullImg} />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Image
                source={
                  profilePic
                    ? { uri: profilePic }
                    : require("@/assets/images/default-avatar.png")
                }
                style={styles.fullImg}
              />
            </View>

            <Text style={styles.username} numberOfLines={1}>
              {getPostUsername(post)}
            </Text>
          </View>

          <Text style={styles.date}>{formatPostDate(post.createdAt)}</Text>
        </View>

        <Text style={styles.placeTitle} numberOfLines={1}>
          {getPostLocationName(post)}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="star" size={13} color={theme.colors.accent} />
          <Text style={styles.ratingText}>{post.rating}</Text>
          <Text style={styles.categoryText} numberOfLines={1}>
            {category}
          </Text>
        </View>

        {post.body ? (
          <Text style={styles.body} numberOfLines={1}>
            {post.body}
          </Text>
        ) : null}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 12,
  },

  imageWrapper: {
    width: 92,
    height: 92,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 7,
  },

  userRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },

  username: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.textMuted,
  },

  date: {
    fontSize: 12,
    color: theme.colors.textSubtle,
  },

  placeTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.text,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 5,
  },

  ratingText: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.accent,
  },

  categoryText: {
    flex: 1,
    marginLeft: 4,
    fontSize: 13,
    color: theme.colors.textSubtle,
  },

  body: {
    marginTop: 6,
    fontSize: 13,
    color: theme.colors.textMuted,
  },

  fullImg: {
    width: "100%",
    height: "100%",
  },
});

export default ReviewActivityCard;
