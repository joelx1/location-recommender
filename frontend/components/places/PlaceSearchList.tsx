import React from "react";
import { Text, View, StyleSheet } from "react-native";
import type { PlaceResult } from "@/types/place";
import SearchBar from "@/components/search/SearchBar";
import Card from "@/components/ui/Card";
import { theme } from "@/theme";

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
      <SearchBar
        value={value}
        onChangeText={onChangeText}
        placeholder="Search location"
        onClear={onClear}
        style={styles.searchBar}
      />

      <View style={styles.suggestionsList}>
        {loading ? (
          <Text style={styles.helperText}>Loading locations...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : results.length === 0 ? (
          <Text style={styles.helperText}>{emptyText}</Text>
        ) : (
          results.map((place) => (
            <Card
              key={`${place.source}-${place.id}`}
              style={styles.suggestionItem}
              onPress={() => onSelectPlace(place)}
            >
              <Text style={styles.suggestionTitle}>{place.name}</Text>
              <Text style={styles.suggestionMeta}>
                {place.category} · {place.address}
              </Text>
            </Card>
          ))
        )}
      </View>
    </View>
  );
};

export default PlaceSearchList;

const styles = StyleSheet.create({
  searchBar: {
    marginBottom: 16,
  },
  suggestionsList: {
    gap: 10,
  },
  helperText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.danger,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  suggestionItem: {
    padding: 14,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  suggestionMeta: {
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
});
