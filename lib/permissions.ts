import { PermissionsAndroid, Platform } from "react-native"

/**
 * Ensures the Android RECORD_AUDIO runtime permission is granted before we
 * ever call `setMicrophoneEnabled(true)` or ask for a "microphone"-type
 * foreground service.
 *
 * Neither @livekit/react-native-webrtc nor @livekit/react-native request
 * this permission themselves - they assume it's already granted. Since
 * Android 14 (API 34), starting a foreground service that declares the
 * `microphone` type without RECORD_AUDIO already granted throws a
 * SecurityException from inside the service, which is uncatchable from JS
 * and crashes the whole app. This must be called - and awaited - before any
 * of that happens.
 *
 * On iOS, the system prompts automatically the first time audio capture
 * starts, so this is a no-op there.
 */
export const ensureMicrophonePermission = async (): Promise<boolean> => {
  if (Platform.OS !== "android") return true

  try {
    const permission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    const alreadyGranted = await PermissionsAndroid.check(permission)
    if (alreadyGranted) return true

    const result = await PermissionsAndroid.request(permission, {
      title: "Microphone Permission",
      message: "The Menorah needs access to your microphone to speak in live podcasts.",
      buttonPositive: "Allow",
      buttonNegative: "Not now",
    })

    return result === PermissionsAndroid.RESULTS.GRANTED
  } catch (error) {
    console.error("Failed to request microphone permission:", error)
    return false
  }
}
