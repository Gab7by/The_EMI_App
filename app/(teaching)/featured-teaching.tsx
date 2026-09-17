import { useFeaturedTeaching } from "@/hooks/tanstack-query-hooks"
import { formatRecordingDate } from "@/lib/formatters"
import { Fonts } from "@/constants/theme"
import { useRouter } from "expo-router"
import { ArrowLeft, BookOpen, Heart, Megaphone } from "lucide-react-native"
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-14 pt-2">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
          >
            <ArrowLeft size={22} color="white" />
          </Pressable>
        </View>

        <View className="mt-4 gap-1.5">
          <Text className="text-[11px] font-bold uppercase tracking-[2px] text-menorah-primary">
            Featured Teaching
          </Text>
          <Text className="text-2xl font-bold text-white">{featuredTeaching.title}</Text>
          <Text className="text-[11px] text-menorah-gray">
            {formatRecordingDate(featuredTeaching.updated_at)}
          </Text>
        </View>

        {/* Scripture - the anchor for the whole page, set apart with a
            left accent bar and italic serif type so it reads like a verse
            callout, not another paragraph of body text. */}
        <View className="mt-7 flex-row overflow-hidden rounded-2xl bg-menorah-darkGreen">
          <View className="w-1 bg-menorah-primary" />
          <View className="flex-1 px-5 py-5">
            <View className="flex-row items-center gap-2">
              <BookOpen size={15} color="#C6FF00" />
              <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-menorah-primary">
                Scripture
              </Text>
            </View>
            <Text
              style={{ fontFamily: Fonts?.serif }}
              className="mt-3 text-[17px] italic leading-7 text-white"
            >
              {featuredTeaching.scripture_reference}
            </Text>
          </View>
        </View>

        {/* Devotional message - the main reading, deliberately the
            plainest section on the page so nothing competes with it. */}
        <View className="mt-5 gap-2 px-1">
          <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-menorah-goldDark">
            Devotional Message
          </Text>
          <Text className="text-[15px] leading-[26px] text-white/90">
            {featuredTeaching.devotional_message}
          </Text>
        </View>

        {/* Prayer - a warm, quieter tone (gold, not lime) since this is
            reflective rather than declarative. */}
        <View className="mt-7 rounded-2xl border border-menorah-gold/25 bg-menorah-gold/[0.08] p-5">
          <View className="flex-row items-center gap-2">
            <View className="h-7 w-7 items-center justify-center rounded-full bg-menorah-gold/20">
              <Heart size={14} color="#D4AF37" />
            </View>
            <Text className="text-[13px] font-bold text-menorah-gold">Let&apos;s Pray</Text>
          </View>
          <Text className="mt-3 text-[15px] italic leading-[26px] text-white/90">
            {featuredTeaching.prayer}
          </Text>
        </View>

        {/* Declaration - the boldest, highest-contrast section on the
            page (lime on dark, centered, larger) since it's meant to be
            spoken out loud, not just read. */}
        <View className="mt-5 items-center rounded-2xl bg-menorah-primary/12 px-6 py-7">
          <View className="flex-row items-center gap-2">
            <Megaphone size={15} color="#C6FF00" />
            <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-menorah-primary">
              Declaration
            </Text>
          </View>
          <Text className="mt-3 text-center text-[18px] font-bold leading-8 text-white">
            {featuredTeaching.declaration}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default FeaturedTeachingScreen
