import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";

type TabIconName = React.ComponentProps<typeof Ionicons>["name"];

type TabIconProps = {
  name: TabIconName;
  color: string;
  focused: boolean;
  isAdd?: boolean;
};

const TabIcon = ({ name, color, focused, isAdd }: TabIconProps) => {
  if (isAdd) {
    return (
      <View style={[styles.addIcon, focused && styles.addIconFocused]}>
        <Ionicons name={name} size={26} color={theme.colors.surface} />
      </View>
    );
  }

  return (
    <View style={[styles.iconShell, focused && styles.iconShellFocused]}>
      <Ionicons name={name} size={26} color={color} />
    </View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSubtle,
        tabBarShowLabel: false,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "home" : "home-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "search" : "search-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="add" color={color} focused={focused} isAdd />
          ),
        }}
      />

      <Tabs.Screen
        name="social"
        options={{
          title: "Social",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "people" : "people-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "person-circle" : "person-circle-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 66,
    borderRadius: 0,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    borderWidth: 0,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 4,
  },

  tabItem: {
    paddingVertical: 2,
  },

  tabLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },

  iconShell: {
    width: 42,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  iconShellFocused: {
    backgroundColor: "transparent",
  },

  addIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },

  addIconFocused: {
    backgroundColor: theme.colors.primary,
  },
});
