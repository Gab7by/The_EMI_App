import "../global.css"
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { PortalHost } from "@rn-primitives/portal";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { AppState, PermissionsAndroid, Platform } from "react-native";
import { supabase } from "@/lib/supabase";
import ForgotPasswordModal from "@/components/auth/forgot-password-modal";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query";
import { AndroidAudioTypePresets, AudioSession, useIOSAudioManagement }  from "@livekit/react-native"
import * as SplashScreen from "expo-splash-screen"
import { useForegroundService } from "@/hooks/useForegroundService";
import { useLiveKitStore } from "@/store/livekit-store";
import type { Room } from "livekit-client";

SplashScreen.preventAutoHideAsync()

const LiveKitForegroundService = () => {
  const room = useLiveKitStore(state => state.room)
  const connectionState = useLiveKitStore(state => state.connectionState)
  const foregroundServiceType = useLiveKitStore(state => state.foregroundServiceType)

  useForegroundService(!!room && connectionState !== "disconnected", foregroundServiceType)

  return null
}

const IOSRoomAudioManager = ({ room }: { room: Room }) => {
  useIOSAudioManagement(room)

  return null
}

const LiveKitAudioManager = () => {
  const room = useLiveKitStore(state => state.room)
  const connectionState = useLiveKitStore(state => state.connectionState)

  useEffect(() => {
    if (!room || connectionState !== "connected" || Platform.OS !== "android") return

    let cancelled = false

    const selectPreferredOutput = async () => {
      if (cancelled) return
      await preferAndroidBluetoothOutput()
    }

    selectPreferredOutput()

    const interval = setInterval(selectPreferredOutput, 3000)
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        selectPreferredOutput()
      }
    })

    return () => {
      cancelled = true
      clearInterval(interval)
      subscription.remove()
    }
  }, [connectionState, room])

  return room ? <IOSRoomAudioManager room={room} /> : null
}

const requestAndroidBluetoothAudioPermission = async () => {
  if (Platform.OS !== "android" || Number(Platform.Version) < 31) return

  try {
    const permission = PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
    const hasPermission = await PermissionsAndroid.check(permission)

    if (!hasPermission) {
      await PermissionsAndroid.request(permission)
    }
  } catch (error) {
    console.error("Failed to request Bluetooth audio permission:", error)
  }
}

const preferAndroidBluetoothOutput = async () => {
  if (Platform.OS !== "android") return

  try {
    const outputs = await AudioSession.getAudioOutputs()

    if (outputs.includes("bluetooth")) {
      await AudioSession.selectAudioOutput("bluetooth")
    }
  } catch (error) {
    console.error("Failed to select Bluetooth audio output:", error)
  }
}

export default function RootLayout() {

  const session = useAuthStore(state => state.session)
  const isAuthLoading = useAuthStore(state => state.isAuthLoading)
  const setIsAuthLoading = useAuthStore(state => state.setIsAuthLoading)
  const setSession = useAuthStore(state => state.setSession)

  useEffect(() => {
    const startAudio = async () => {
      await requestAndroidBluetoothAudioPermission()

      await AudioSession.configureAudio({
        android: {
          preferredOutputList: ['bluetooth', 'headset', 'speaker', 'earpiece'],
          audioTypeOptions: {
            ...AndroidAudioTypePresets.communication,
            forceHandleAudioRouting: true
          }
        }, 
        ios: {
          defaultOutput: 'speaker'
        }
      })

      await AudioSession.startAudioSession()
      await preferAndroidBluetoothOutput()
      setTimeout(preferAndroidBluetoothOutput, 1000)
    }

    startAudio().catch((error) => {
      console.error("Failed to start LiveKit audio session:", error)
    })

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
       <LiveKitAudioManager />
       <LiveKitForegroundService />
       <PortalHost />
       <ForgotPasswordModal />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
