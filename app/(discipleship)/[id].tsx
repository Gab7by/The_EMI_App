import { getLearningPath } from "@/constants/discipleship"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ArrowLeft } from "lucide-react-native"
import { Pressable, ScrollView, Text, View } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

const LearningPathDetailScreen = () => {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const path = id ? getLearningPath(id) : undefined

  if (!path) {
    return (
      <SafeAreaView className="flex-1 bg-menorah-bg px-4">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
        >
          <ArrowLeft size={22} color="white" />
        </Pressable>
        <View className="mt-16 items-center px-8">
          <Text className="text-center text-base font-bold text-white">
            Not found
          </Text>
          <Text className="mt-2 text-center text-sm text-menorah-muted">
            This learning path doesn&apos;t exist.
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView
      className="flex-1 bg-menorah-bg px-4"
      style={{ paddingBottom: insets.bottom + 16 }}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10 pt-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
        >
          <ArrowLeft size={22} color="white" />
        </Pressable>

        <View className="mt-10 items-center px-4">
          <View className="h-20 w-20 items-center justify-center rounded-3xl border border-menorah-primary/25 bg-menorah-primary/10">
            <MaterialCommunityIcons name={path.icon} size={36} color="#C6FF00" />
          </View>

          <Text className="mt-6 text-center text-2xl font-bold text-white">
            {path.title}
          </Text>
          <Text className="mt-2 text-center text-sm leading-5 text-menorah-muted">
            {path.description}
          </Text>
          <Text className="mt-3 text-center text-[11px] font-semibold uppercase tracking-[1px] text-menorah-primary/80">
            {path.moduleCount} modules
          </Text>

          <View className="mt-8 w-full items-center rounded-2xl border border-menorah-primary/25 bg-menorah-darkGreen px-6 py-9">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-menorah-primary/15">
              <MaterialCommunityIcons name="calendar-clock" size={24} color="#C6FF00" />
            </View>
            <Text className="mt-4 text-center text-lg font-bold text-menorah-primary">
              First Cohort Starting Soon
            </Text>
            <Text className="mt-2 text-center text-sm leading-5 text-menorah-muted">
              Check back later for enrollment.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default LearningPathDetailScreen
