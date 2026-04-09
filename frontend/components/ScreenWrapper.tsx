import { ReactNode } from "react";
import { ScrollView, StyleProp, ViewStyle } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";

type ScreenWrapperProps = {
  children: ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
};

export default function ScreenWrapper({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  edges = ["top"],
}: ScreenWrapperProps) {
  if (scrollable) {
    return (
      <SafeAreaView style={[styles.safeArea, style]} edges={edges}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={contentContainerStyle}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, style]} edges={edges}>
      {children}
    </SafeAreaView>
  );
}

const styles = {
  safeArea: {
    flex: 1,
  } satisfies ViewStyle,
};
