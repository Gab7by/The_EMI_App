import { useRouter } from "expo-router"
import { hapticMedium } from "@/lib/haptics"
import { useAuthStore } from "@/store/authStore"

/**
 * Shared "Join Menorah" action for guests.
 * For guests: uses push() so they can go back after signup.
 * For signed-in users (edge case): uses replace().
 */
export const useJoinMenorah = () => {
  const router = useRouter()
  const authStatus = useAuthStore(state => state.authStatus)

  return () => {
    hapticMedium()
    // Guests: push so they can go back after signup
    // Signed-in: replace (edge case, shouldn't normally happen)
    if (authStatus === 'guest') {
      router.push("/(auth)/signup")
    } else {
      router.replace("/(auth)/signup")
    }
  }
}