import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";

export default function Layout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="calendar" options={{ title: "Calendar" }} />
    </Tabs>
  );
}