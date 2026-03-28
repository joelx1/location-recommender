import { View, Text, Button } from "react-native";
import React from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { router } from "expo-router";

const login = () => {
  return (
    <ScreenWrapper>
      <View>
        <Text>login</Text>
        <Button title="Go to Signup" onPress={() => router.push("/signup")} />
        <Button title="Go to Home" onPress={() => router.replace("/(tabs)")} />
      </View>
    </ScreenWrapper>
  );
};

export default login;
