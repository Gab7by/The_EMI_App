import "../global.css"
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { PortalHost } from "@rn-primitives/portal";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ForgotPasswordModal from "@/components/auth/forgot-password-modal";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query";
import {AudioSession}  from "@livekit/react-native"
import * as SplashScreen from "expo-splash-screen"

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {

  const session = useAuthStore(state => state.session)
  const isAuthLoading = useAuthStore(state => state.isAuthLoading)
  const setIsAuthLoading = useAuthStore(state => state.setIsAuthLoading)
  const setSession = useAuthStore(state => state.setSession)

  useEffect(() => {
    const startAudio = async () => {
      await AudioSession.configureAudio({
        android: {
          preferredOutputList: ['bluetooth', 'speaker', 'earpiece'],
          audioTypeOptions: {
            manageAudioFocus: true,
            audioMode: 'normal',
            audioFocusMode: 'gain',
            audioStreamType: 'music',
            audioAttributesUsageType: 'media',
            audioAttributesContentType: 'unknown'
          }
        }, 
        ios: {
          defaultOutput: 'speaker'
        }
      })

      await AudioSession.startAudioSession()
    }

    startAudio()

    return () => {
      AudioSession.stopAudioSession()
    }
  }, [])

  useEffect(() => {
    const bootstrapAuth = async () => {
      setIsAuthLoading(true)

      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)

        if (session) {
          await useAuthStore.getState().fetchProfile(session.user.id)
        }
      } finally {
        setIsAuthLoading(false)
        SplashScreen.hideAsync()
      }
    }

    bootstrapAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        useAuthStore.getState().setSession(session);

        if (session) {
          useAuthStore.getState().fetchProfile(session.user.id);
        } else {
          useAuthStore.getState().clearAuth();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const isLoggedIn = session !== null

  if (isAuthLoading) return (
    <SafeAreaView className="bg-menorah-bg">

    </SafeAreaView>
  )

  return (
    <QueryClientProvider client={queryClient}>
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
       <ForgotPasswordModal />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
