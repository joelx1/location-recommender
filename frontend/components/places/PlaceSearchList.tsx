import React from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import type { PlaceResult } from "@/types/place";

// Reusable place search UI for screens that show a search box and selectable place results.

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  results: PlaceResult[];
  loading?: boolean;
  error?: string | null;
  emptyText?: string;
  onSelectPlace: (place: PlaceResult) => void;
};

const PlaceSearchList = ({
  value,
  onChangeText,
  onClear,
  results,
  loading = false,
  error = null,
  emptyText = "No matching locations found.",
  onSelectPlace,
}: Props) => {
  return (
    <View>
      <View style={styles.searchBar}>
        <Feather name="search" size={18} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search location"
          placeholderTextColor="#888"
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
        />

        {value.trim().length > 0 && (
          <TouchableOpacity onPress={onClear} style={styles.cancelButton}>
            <Feather name="x" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.suggestionsList}>
        {loading ? (
          <Text style={styles.helperText}>Loading locations...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : results.length === 0 ? (
          <Text style={styles.helperText}>{emptyText}</Text>
        ) : (
          results.map((place) => (
            <TouchableOpacity
              key={`${place.source}-${place.id}`}
              style={styles.suggestionItem}
              onPress={() => onSelectPlace(place)}
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
  );
};

export default PlaceSearchList;

const styles = StyleSheet.create({
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
});
