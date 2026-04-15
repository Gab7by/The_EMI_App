import "../global.css"
import { Stack, useRouter } from 'expo-router';
import 'react-native-reanimated';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PortalHost } from "@rn-primitives/portal";
import { useAuthStore } from "@/store/authStore";

export default function RootLayout() {

  const token = useAuthStore(state => state.token)

  const isLoggedIn = token !== null

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Protected guard={!!isLoggedIn}>
          <Stack.Screen
            name="(tabs)"
          />
        </Stack.Protected>
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen
            name="(auth)"
          />
        </Stack.Protected>
     </Stack>
     <PortalHost />
    </SafeAreaProvider>
  );
}