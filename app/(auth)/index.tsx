import MenorahLogo from "@/assets/svgs/menorah-logo.svg"
import { hapticMedium } from "@/lib/haptics"
import { useRouter } from "expo-router"
import { Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuthStore } from "@/store/authStore"


const WelcomeScreen = () => {

  const router = useRouter()
  const enterGuestMode = useAuthStore(state => state.enterGuestMode)

  const routeToLogin = () => {
    hapticMedium()
    router.push("/(auth)/login")
  }

  const routeToSignUp = () => {
    hapticMedium()
    router.push("/(auth)/signup")
  }

  const handleSkip = async () => {
    hapticMedium()
    await enterGuestMode()
    // Navigation to tabs is handled by the route guard in _layout.tsx
    // based on authStatus changing to 'guest'
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0B1F0E] px-6">
      <View className="flex-1">
        <View className="flex-1 items-center justify-center gap-8">
          <MenorahLogo />
        </View>

        <View className="w-full max-w-sm self-center gap-4 pb-10">
          <Pressable onPress={routeToLogin} className="items-center rounded-3xl bg-white px-6 py-6">
            <Text className="text-lg font-semibold text-black">Login</Text>
          </Pressable>

          <Pressable onPress={routeToSignUp} className="items-center rounded-3xl bg-[#C6FF00] px-6 py-6">
            <Text className="text-lg font-semibold text-black">Sign Up</Text>
          </Pressable>

          <Pressable onPress={handleSkip} className="items-center rounded-3xl border border-white/30 px-6 py-4">
            <Text className="text-lg font-medium text-white/80">Skip for now</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default WelcomeScreen
