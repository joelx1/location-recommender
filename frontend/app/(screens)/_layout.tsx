import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="editProfile" />
      <Stack.Screen name="placeDetails" />
      <Stack.Screen name="addReview" />
      <Stack.Screen name="friendList" />
      <Stack.Screen name="friendProfile" />
    </Stack>
  );
}
