import "../global.css"
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { PortalHost } from "@rn-primitives/portal";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

export default function RootLayout() {

  const session = useAuthStore(state => state.session)
  const loadAuth = useAuthStore(state => state.loadAuth)
  const isAuthLoading = useAuthStore(state => state.isAuthLoading)

  const isLoggedIn = session !== null

  useEffect(() => {
    loadAuth()
  }, [])

  if (isAuthLoading) return (
    <SafeAreaView className="bg-menorah-bg">

    </SafeAreaView>
  )

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