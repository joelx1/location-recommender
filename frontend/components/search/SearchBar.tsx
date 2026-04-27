import React from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  variant?: "filled" | "floating";
  style?: StyleProp<ViewStyle>;
};

const SearchBar = ({
  value,
  onChangeText,
  placeholder = "Search",
  onClear,
  onFocus,
  onBlur,
  onSubmitEditing,
  variant,
  style,
}: Props) => {
  return (
    <View
      style={[
        styles.searchBar,
        variant === "floating" && styles.floatingSearchBar,
        style,
      ]}
    >
      <Feather name="search" size={18} color="#666" />

      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="#888"
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
      />

      {value.trim().length > 0 && onClear ? (
        <TouchableOpacity onPress={onClear} style={styles.cancelButton}>
          <Feather name="x" size={18} color="#666" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 14,
  },

  floatingSearchBar: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#111",
  },

  cancelButton: {
    marginLeft: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
