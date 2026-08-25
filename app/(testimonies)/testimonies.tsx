import TestimonyCard from "@/components/testimonies/testimonyCard"
import { useTestimonies } from "@/hooks/tanstack-query-hooks"
import { FlashList } from "@shopify/flash-list"
import { ArrowLeft, Plus } from "lucide-react-native"
import { useRouter } from "expo-router"
import { ActivityIndicator, Pressable, Text, View } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

const TestimoniesScreen = () => {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { data: testimonies, isLoading } = useTestimonies()

  return (
    <SafeAreaView
      className="flex-1 bg-menorah-bg px-4"
      style={{ paddingBottom: insets.bottom + 16 }}
    >
      <View className="flex-row items-center gap-3 pt-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
        >
          <ArrowLeft size={22} color="white" />
        </Pressable>
        <View className="gap-1">
          <Text className="text-3xl font-bold text-menorah-primary">Testimonies</Text>
          <Text className="text-menorah-muted text-base">
            Real stories of God&apos;s faithfulness
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => router.push("/(testimonies)/add")}
        className="mt-5 flex-row items-center gap-3 rounded-2xl border border-menorah-primary/40 bg-menorah-darkGreen px-4 py-4"
      >
        <View className="h-10 w-10 items-center justify-center rounded-full bg-menorah-primary">
          <Plus size={22} color="#0B1F0E" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-white">Share your testimony</Text>
          <Text className="mt-0.5 text-xs text-menorah-muted">
            Your story could spark someone&apos;s faith today
          </Text>
        </View>
      </Pressable>

      {isLoading ? (
        <ActivityIndicator className="mt-10" size="large" color="#C6FF00" />
      ) : !testimonies || testimonies.length === 0 ? (
        <View className="mt-16 items-center px-8">
          <Text className="text-center text-base font-bold text-white">
            No testimonies yet
          </Text>
          <Text className="mt-2 text-center text-sm text-menorah-muted">
            Be the first to share what the Lord has done for you.
          </Text>
        </View>
      ) : (
        <FlashList
          data={testimonies}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: insets.bottom + 120 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <TestimonyCard
              id={item.id}
              fullName={item.profiles?.full_name ?? "User"}
              avatarUrl={item.profiles?.avatar_url ?? null}
              content={item.content}
              createdAt={item.created_at}
              onPressContent={() => router.push(`/(testimonies)/${item.id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  )
}

export default TestimoniesScreen