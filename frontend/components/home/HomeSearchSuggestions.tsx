import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { PlaceResult } from "@/types/place";

export type HomeSearchPlace = {
  type: "place";
  id: string;
  title: string;
  category: string;
  address: string;
};

export type HomeSearchUser = {
  type: "user";
  id: string;
  username: string;
  bio?: string | null;
  profilePic?: string | null;
};

type Props = {
  visible: boolean;
  users: HomeSearchUser[];
  places: HomeSearchPlace[];
  googlePlaces: PlaceResult[];
  loadingGoogle: boolean;
  onSelectUser: (user: HomeSearchUser) => void;
  onSelectPlace: (place: HomeSearchPlace) => void;
  onSelectGooglePlace: (place: PlaceResult) => void;
};

const HomeSearchSuggestions = ({
  visible,
  users,
  places,
  googlePlaces,
  loadingGoogle,
  onSelectUser,
  onSelectPlace,
  onSelectGooglePlace,
}: Props) => {
  if (!visible) return null;

  return (
    <View style={styles.list}>
      {users.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>People</Text>

          {users.slice(0, 3).map((user) => (
            <TouchableOpacity
              key={`user-${user.id}`}
              style={styles.userItem}
              onPress={() => onSelectUser(user)}
            >
              <View style={styles.avatar}>
                {user.profilePic ? (
                  <Image
                    source={{ uri: user.profilePic }}
                    style={styles.fullImg}
                  />
                ) : (
                  <Feather name="user" size={14} color="#999" />
                )}
              </View>

              <View style={styles.textGroup}>
                <Text style={styles.title} numberOfLines={1}>
                  {user.username}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {user.bio || "View profile"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}

      {(places.length > 0 || googlePlaces.length > 0 || loadingGoogle) && (
        <>
          <Text style={styles.sectionLabel}>Places</Text>

          {places.slice(0, 3).map((place) => (
            <TouchableOpacity
              key={`place-${place.id}`}
              style={styles.item}
              onPress={() => onSelectPlace(place)}
            >
              <Text style={styles.title} numberOfLines={1}>
                {place.title}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                {place.category} · {place.address}
              </Text>
            </TouchableOpacity>
          ))}

          {loadingGoogle ? (
            <View style={styles.item}>
              <Text style={styles.meta}>Searching Google Places...</Text>
            </View>
          ) : null}

          {googlePlaces.slice(0, 3).map((place) => (
            <TouchableOpacity
              key={`google-${place.id}`}
              style={styles.item}
              onPress={() => onSelectGooglePlace(place)}
            >
              <View style={styles.titleRow}>
                <Text style={styles.googleTitle} numberOfLines={1}>
                  {place.name}
                </Text>
                <Text style={styles.newBadge}>New</Text>
              </View>

              <Text style={styles.meta} numberOfLines={1}>
                {place.category} · {place.address}
              </Text>
            </TouchableOpacity>
          ))}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    position: "absolute",
    top: 58,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  sectionLabel: {
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 6,
    fontSize: 11,
    fontWeight: "800",
    color: "#999",
    textTransform: "uppercase",
  },

  item: {
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  userItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  textGroup: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },

  meta: {
    marginTop: 2,
    fontSize: 12,
    color: "#777",
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  googleTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },

  newBadge: {
    flexShrink: 0,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#EAF2FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },

  fullImg: {
    width: "100%",
    height: "100%",
  },
});

export default HomeSearchSuggestions;
