import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import Feather from "@expo/vector-icons/Feather";
import { theme } from "@/theme";

type ProfileTabProps = {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  active: boolean;
  onPress: () => void;
};

const profileTab = ({ label, icon, active, onPress }: ProfileTabProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.tabButton}>
      <View style={styles.tabContentRow}>
        <Feather
          name={icon}
          size={18}
          color={active ? theme.colors.text : theme.colors.textMuted}
        />
        <View style={styles.textWithIndicator}>
          <Text style={active ? styles.activeTab : styles.inactiveTab}>
            {label}
          </Text>

          {active && <View style={styles.activeTabIndicator} />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default profileTab;

const styles = StyleSheet.create({
  tabButton: {
    alignItems: "center",
  },

  tabContentRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },

  textWithIndicator: {
    alignItems: "center",
    justifyContent: "center",
  },

  activeTab: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.text,
  },

  inactiveTab: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },

  activeTabIndicator: {
    width: 24,
    height: 2,
    borderRadius: 1,
    backgroundColor: theme.colors.primary,
    position: "absolute",
    bottom: -12,
  },
});
