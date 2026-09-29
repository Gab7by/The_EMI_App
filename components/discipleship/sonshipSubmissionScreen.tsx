import type { LearningPath } from "@/constants/discipleship"
import { SSF_BYLINE } from "@/constants/schoolOfSpiritualFoundation"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { ArrowLeft } from "lucide-react-native"
import { Pressable, ScrollView, Text, View } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

const SonshipSubmissionScreen = ({ path }: { path: LearningPath }) => {
  const insets = useSafeAreaInsets()
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-menorah-bg px-4" style={{ paddingBottom: insets.bottom + 16 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="flex-grow pb-14 pt-2">
        <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white/10">
          <ArrowLeft size={22} color="white" />
        </Pressable>

        <View className="mt-8 items-center px-4">
          <View className="h-20 w-20 items-center justify-center rounded-3xl border border-menorah-primary/25 bg-menorah-primary/10">
            <MaterialCommunityIcons name={path.icon} size={36} color="#C6FF00" />
          </View>
          <Text className="mt-6 text-center text-2xl font-bold text-white">{path.title}</Text>
          <Text className="mt-1 text-center text-[13px] text-menorah-muted">{SSF_BYLINE}</Text>
        </View>

        <View className="flex-1 items-center justify-center px-4" style={{ minHeight: 390 }}>
          <View className="w-full items-center rounded-[28px] border border-menorah-primary/20 bg-menorah-darkGreen px-7 py-11">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-menorah-primary/15">
              <MaterialCommunityIcons name="calendar-clock-outline" size={31} color="#C6FF00" />
            </View>
            <Text className="mt-6 text-center text-2xl font-bold text-menorah-primary">Enrollment{`\n`}starting soon</Text>
            <Text className="mt-4 text-center text-[14px] leading-6 text-menorah-muted">Check back later.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SonshipSubmissionScreen
