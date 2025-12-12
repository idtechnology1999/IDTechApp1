import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="FirstOnboard" options={{ headerShown: false }} />
      <Stack.Screen name="SecondOnboard" options={{ headerShown: false }} />
      <Stack.Screen name="Login" options={{ headerShown: false }} />
      <Stack.Screen name="SystemTabs" options={{ headerShown: false }} /> 
    </Stack>
  );
}
