import { useRouter } from "expo-router"
import { hapticMedium } from "@/lib/haptics"

/**
 * Shared "Join Menorah" action for guests.
 * Routes to the sign up page.
 * Callers are responsible for styling; this only provides the navigation behavior.
 */
export const useJoinMenorah = () => {
  const router = useRouter()

  return () => {
    hapticMedium()
    router.replace("/(auth)/signup")
  }
}