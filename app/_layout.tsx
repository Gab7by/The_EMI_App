import "../global.css"
import { Stack, useRouter } from 'expo-router';
import 'react-native-reanimated';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PortalHost } from "@rn-primitives/portal";

export default function RootLayout() {

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Protected guard={false}>
          <Stack.Screen
            name="(tabs)"
          />
        </Stack.Protected>
        <Stack.Protected guard={true}>
          <Stack.Screen
            name="(auth)"
          />
        </Stack.Protected>
     </Stack>
     <PortalHost />
    </SafeAreaProvider>
  );
}