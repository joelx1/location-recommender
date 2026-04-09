import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import ScreenWrapper from "@/components/ScreenWrapper";

const index = () => {
  return (
    <ScreenWrapper>
      <SafeAreaView style={styles.container}>
        {/* Location */}
        <View style={styles.locationCont}>
          <Ionicons name="location-outline" size={50} />
          <Text style={styles.locationText}>Dublin</Text>
          {/*Hardcoded Dublin for now */}
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchText}>Search Bar</Text>
          <Feather name="search" size={25} />
        </View>

        {/* Popular Places */}
        <Text style={styles.sectionTitle}>Popular Places</Text>
        <View style={styles.largeCard}>
          <Feather name="arrow-right" size={20} style={styles.arrowIcon} />
        </View>

        {/* Friends Posts */}
        <Text style={styles.sectionTitle}>Friends Posts</Text>
        <View style={styles.row}>
          <View style={styles.smallCard} />
          <View style={styles.smallCard} />
        </View>
      </SafeAreaView>
    </ScreenWrapper>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 16,
    marginTop: 80,
  },

  locationCont: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  locationText: {
    fontSize: 16,
  },

  searchBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 30,
  },

  searchText: {
    color: "#777",
  },

  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    marginTop: 10,
  },

  largeCard: {
    height: 200,
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 15,
    marginBottom: 30,
  },

  arrowIcon: {
    opacity: 0.6,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  smallCard: {
    width: "48%",
    height: 200,
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
  },
});

export default index;
