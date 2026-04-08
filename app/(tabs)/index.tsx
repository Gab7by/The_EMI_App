import { Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"



const Home = () => {
  return (
    <SafeAreaView className="flex-1 bg-[#0B1F0E] px-6">
      <View className="flex-1">
        <View className="flex-1 items-center justify-center">
          <Text className="text-6xl font-bold text-[#C6FF00]">
            The Menorah
          </Text>
        </View>

        <View className="w-full max-w-sm self-center gap-4 pb-10">
          <Pressable className="items-center rounded-3xl bg-white px-6 py-6">
            <Text className="text-lg font-semibold text-black">Login</Text>
          </Pressable>

          <Pressable className="items-center rounded-3xl bg-[#C6FF00] px-6 py-6">
            <Text className="text-lg font-semibold text-black">Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Home
