import { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenWrapperProps = {
  children: ReactNode;
};

export default function ScreenWrapper({ children }: ScreenWrapperProps) {
  return <SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>;
}
