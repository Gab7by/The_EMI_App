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
import { AndroidAudioTypePresets, AudioSession }  from "@livekit/react-native"
import * as SplashScreen from "expo-splash-screen"
import { useForegroundService } from "@/hooks/useForegroundService";
import { useLiveKitStore } from "@/store/livekit-store";

SplashScreen.preventAutoHideAsync()

// Base routing preference is the same regardless of which audio mode we're in -
// prefer any external device, fall back to the loud-speaker (never the earpiece)
// so this matches how a normal media app behaves.
const ANDROID_PREFERRED_OUTPUT_LIST = ['bluetooth', 'headset', 'speaker', 'earpiece'] as const

// Media volume, MODE_NORMAL, USAGE_MEDIA/STREAM_MUSIC. This is our default:
// it makes LiveKit playback behave like a podcast app, controlled by the
// media volume slider, matching what iOS already does via `videoChat` mode.
const ANDROID_MEDIA_AUDIO_OPTIONS = {
  ...AndroidAudioTypePresets.media,
  // Podcast audio is spoken word, not music - keep the content type as
  // speech so device-side loudness/EQ processing treats it that way even
  // though the stream itself is STREAM_MUSIC.
  audioAttributesContentType: 'speech' as const,
  // Without this, LiveKit only manages routing while in a communication-style
  // audioMode. We're in 'normal' here, so this flag is what keeps
  // preferredOutputList/selectAudioOutput working.
  forceHandleAudioRouting: true,
}

// In-call volume, MODE_IN_COMMUNICATION, USAGE_VOICE_COMMUNICATION/STREAM_VOICE_CALL.
// Only used as a temporary fallback: some Android devices won't route a
// Bluetooth headset's *microphone* (SCO) reliably outside communication mode.
// We switch into this only while the local user is both publishing mic audio
// and has a Bluetooth output connected, and switch back to media mode
// otherwise - see LiveKitAudioManager below.
const ANDROID_COMMUNICATION_AUDIO_OPTIONS = {
  ...AndroidAudioTypePresets.communication,
  forceHandleAudioRouting: true,
}

type AndroidAudioMode = "media" | "communication"

const configureAndroidAudioMode = async (mode: AndroidAudioMode) => {
  if (Platform.OS !== "android") return

  await AudioSession.configureAudio({
    android: {
      preferredOutputList: [...ANDROID_PREFERRED_OUTPUT_LIST],
      audioTypeOptions: mode === "communication"
        ? ANDROID_COMMUNICATION_AUDIO_OPTIONS
        : ANDROID_MEDIA_AUDIO_OPTIONS,
    }
  })
}

const LiveKitForegroundService = () => {
  const room = useLiveKitStore(state => state.room)
  const connectionState = useLiveKitStore(state => state.connectionState)
  const foregroundServiceType = useLiveKitStore(state => state.foregroundServiceType)

  useForegroundService(!!room && connectionState !== "disconnected", foregroundServiceType)

  return null
}

const LiveKitAudioManager = () => {
  const room = useLiveKitStore(state => state.room)
  const connectionState = useLiveKitStore(state => state.connectionState)

  useEffect(() => {
    if (!room || connectionState !== "connected" || Platform.OS !== "android") return

    let cancelled = false
    // Tracks which native audio config is currently applied, so we only call
    // configureAudio (which briefly touches the AudioManager mode) when the
    // desired mode actually changes, instead of on every 3s tick.
    let currentAudioMode: AndroidAudioMode = "media"

    const reconcileAudio = async () => {
      if (cancelled) return

      const bluetoothAvailable = await selectAndroidBluetoothOutputIfAvailable()
      if (cancelled) return

      // isMicrophoneEnabled reflects whether we're actually publishing an
      // unmuted mic track right now - true for a host, or an audience member
      // who has been approved to speak and isn't muted. False for everyone
      // else, including muted speakers.
      const micActive = room.localParticipant.isMicrophoneEnabled
      const desiredMode: AndroidAudioMode = micActive && bluetoothAvailable
        ? "communication"
        : "media"

      if (desiredMode === currentAudioMode) return

      try {
        await configureAndroidAudioMode(desiredMode)
        currentAudioMode = desiredMode
        // Re-apply output selection since reconfiguring the audio session can
        // reset routing.
        await selectAndroidBluetoothOutputIfAvailable()
      } catch (error) {
        console.error("Failed to switch Android audio mode:", error)
      }
    }

    reconcileAudio()

    const interval = setInterval(reconcileAudio, 3000)
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        reconcileAudio()
      }
    })

    return () => {
      cancelled = true
      clearInterval(interval)
      subscription.remove()
      // Room is ending or we're navigating away - always leave the session
      // back on media mode so a listener never gets stuck in call-volume audio.
      if (currentAudioMode !== "media") {
        configureAndroidAudioMode("media").catch((error) => {
          console.error("Failed to restore Android media audio mode:", error)
        })
      }
    }
  }, [connectionState, room])

  return null
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

// Selects the Bluetooth output if one is connected/available, and reports
// back whether it was - callers use that to decide whether the Bluetooth
// communication-mode fallback is even relevant right now.
const selectAndroidBluetoothOutputIfAvailable = async (): Promise<boolean> => {
  if (Platform.OS !== "android") return false

  try {
    const outputs = await AudioSession.getAudioOutputs()
    const bluetoothAvailable = outputs.includes("bluetooth")

    if (bluetoothAvailable) {
      await AudioSession.selectAudioOutput("bluetooth")
    }

    return bluetoothAvailable
  } catch (error) {
    console.error("Failed to select Bluetooth audio output:", error)
    return false
  }
}

export default function RootLayout() {

  const session = useAuthStore(state => state.session)
  const isAuthLoading = useAuthStore(state => state.isAuthLoading)
  const setIsAuthLoading = useAuthStore(state => state.setIsAuthLoading)
  const setSession = useAuthStore(state => state.setSession)

  useEffect(() => {
    const startAudio = async () => {
      if (Platform.OS !== "android") return

      await requestAndroidBluetoothAudioPermission()

      // Always boot on media mode. LiveKitAudioManager (mounted below, only
      // while a room is connected) is what temporarily switches to
      // communication mode, and only for the Bluetooth-mic edge case.
      await configureAndroidAudioMode("media")

      await AudioSession.startAudioSession()
      await selectAndroidBluetoothOutputIfAvailable()
      setTimeout(selectAndroidBluetoothOutputIfAvailable, 1000)
    }

    startAudio().catch((error) => {
      console.error("Failed to start LiveKit audio session:", error)
    })

    return () => {
      if (Platform.OS === "android") {
        AudioSession.stopAudioSession()
      }
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
