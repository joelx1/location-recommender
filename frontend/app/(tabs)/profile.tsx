import { View, Text, Button } from "react-native";
import React from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useAuth } from "@/context/AuthContext";

const profile = () => {
  const { logout } = useAuth();

  return (
    <ScreenWrapper>
      <View>
        <Text>profile</Text>
        {/* Temporary logout button for integration testing — Task 18 */}
        <Button title="Logout" onPress={logout} />
      </View>
    </ScreenWrapper>
  );
};

export default profile;
