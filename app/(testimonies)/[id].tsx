import { getInitial } from "@/components/testimonies/testimonyCard"
import { useTestimonyById } from "@/hooks/tanstack-query-hooks"
import { formatRecordingDate } from "@/lib/formatters"
import { Image } from "expo-image"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ArrowLeft } from "lucide-react-native"
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

const TestimonyDetailScreen = () => {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: testimony, isLoading } = useTestimonyById(id ?? "")

  const fullName = testimony?.profiles?.full_name ?? "User"
  const avatarUrl = testimony?.profiles?.avatar_url ?? null
  const images = testimony?.testimony_images ?? []

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-menorah-bg">
        <ActivityIndicator size="large" color="#C6FF00" />
      </SafeAreaView>
    )
  }

  if (!testimony) {
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
            Testimony not found
          </Text>
          <Text className="mt-2 text-center text-sm text-menorah-muted">
            It may have been removed by its author.
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-10 pt-2"
      >
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
        >
          <ArrowLeft size={22} color="white" />
        </Pressable>

        <View className="mt-8 items-center">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 128, height: 128, borderRadius: 64 }}
              contentFit="cover"
            />
          ) : (
            <View
              style={{ width: 128, height: 128, borderRadius: 64 }}
              className="items-center justify-center border-4 border-menorah-primary/60 bg-menorah-darkGreen"
            >
              <Text className="text-5xl font-bold text-menorah-primary">
                {getInitial(fullName)}
              </Text>
            </View>
          )}

          <Text className="mt-4 text-xl font-bold text-white">{fullName}</Text>
          <Text className="mt-1 text-xs text-menorah-gray">
            {formatRecordingDate(testimony.created_at)}
          </Text>
        </View>

        <View className="mt-8 rounded-2xl bg-menorah-darkGreen p-5">
          <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-menorah-primary">
            Testimony
          </Text>
          <Text className="mt-3 text-[15px] leading-6 text-white/90">
            {testimony.content}
          </Text>
        </View>

        {images.length > 0 && (
          <View className="mt-6 gap-3">
            <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-menorah-goldDark">
              Photos ({images.length})
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {images.map((image) => (
                <Image
                  key={image.id}
                  source={{ uri: image.image_url }}
                  style={{ width: 104, height: 104, borderRadius: 16 }}
                  contentFit="cover"
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default TestimonyDetailScreen