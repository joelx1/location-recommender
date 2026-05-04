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
import { theme } from "@/theme";

const searchColors = {
  background: "#F3F4F6",
  floatingBackground: "#FFFFFF",
  icon: "#6B7280",
  placeholder: "#9CA3AF",
  text: "#111827",
};

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
      <Feather name="search" size={18} color={searchColors.icon} />

      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor={searchColors.placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
      />

      {value.trim().length > 0 && onClear ? (
        <TouchableOpacity onPress={onClear} style={styles.cancelButton}>
          <Feather name="x" size={18} color={searchColors.icon} />
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
    backgroundColor: searchColors.background,
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 14,
  },

  floatingSearchBar: {
    backgroundColor: searchColors.floatingBackground,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: searchColors.text,
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
