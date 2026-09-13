import { useFeaturedTeaching } from "@/hooks/tanstack-query-hooks"
import { formatRecordingDate } from "@/lib/formatters"
import { useRouter } from "expo-router"
import { ArrowLeft } from "lucide-react-native"
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

const FeaturedTeachingScreen = () => {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { data: featuredTeaching, isLoading } = useFeaturedTeaching()

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-menorah-bg">
        <ActivityIndicator size="large" color="#C6FF00" />
      </SafeAreaView>
    )
  }

  if (!featuredTeaching) {
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
            Nothing here yet
          </Text>
          <Text className="mt-2 text-center text-sm text-menorah-muted">
            Check back soon for today&apos;s teaching.
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

        <View className="mt-6 gap-1.5">
          <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-menorah-primary">
            Featured teaching
          </Text>
          <Text className="text-2xl font-bold text-white">{featuredTeaching.title}</Text>
          <Text className="text-xs text-menorah-gray">
            {formatRecordingDate(featuredTeaching.updated_at)}
          </Text>
        </View>

        <View className="mt-6 rounded-2xl bg-menorah-darkGreen p-5">
          <Text className="text-[15px] leading-6 text-white/90">
            {featuredTeaching.content}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default FeaturedTeachingScreen
