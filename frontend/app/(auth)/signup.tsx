import { View, Text, Button } from "react-native";
import React from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { router } from "expo-router";

const signup = () => {
  return (
    <ScreenWrapper>
      <View>
        <Text>signup</Text>
        <Button title="Go to Login" onPress={() => router.push("/login")} />
      </View>
    </ScreenWrapper>
  );
};

export default signup;
