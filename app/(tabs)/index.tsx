import Sparkling from "@/assets/svgs/sparkling.svg"
import ImageSlider from "@/components/commons/image-slider"
import ContactRow from "@/components/home/contactRow"
import HomeProfileBar from "@/components/profile/homePofileBar"
import HomeProfileModal from "@/components/profile/homeProfileModal"
import TestimonyCard from "@/components/testimonies/testimonyCard"
import { CONTACT_ITEMS } from "@/constants/contact"
import { imageItems } from "@/constants/podcast"
import { useFeaturedTeaching, useRecentTestimonies } from "@/hooks/tanstack-query-hooks"
import { useAuthStore } from "@/store/authStore"
import { FEATURED_TEACHING_HOME_PREVIEW_LINES } from "@/types/featured-teaching-types"
import { useRouter } from "expo-router"
import { Pencil } from "lucide-react-native"
import { useCallback } from "react"
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"




const Home = () => {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const profile = useAuthStore((state) => state.profile)
  const isAdmin = profile?.role === "admin"
  const { data: recentTestimonies } = useRecentTestimonies()
  const { data: featuredTeaching, isLoading: isFeaturedTeachingLoading } = useFeaturedTeaching()
  const handleOpenTestimony = useCallback(
    (testimonyId: string) => router.push(`/(testimonies)/${testimonyId}`),
    [router]
  )

  return (
    <SafeAreaView className="flex-1 gap-6 px-4 py-5 bg-menorah-bg" style={{ paddingBottom: insets.bottom + 16 }}>
      <HomeProfileBar />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      >
        <ImageSlider items={imageItems} height={196} />
        <View className="gap-4">
          <View><Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-menorah-primary">Welcome home</Text><Text className="mt-1 text-2xl font-bold text-white">The Menorah</Text></View>
          <LinearGradient
            colors={["#D8FF37", "#B7EC00"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ overflow: 'hidden', borderRadius: 28, padding: 24, alignItems: 'flex-start' }}
          >
            <View className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20" />

            {isAdmin && (
              <Pressable
                onPress={() => router.push("/(teaching)/edit-featured-teaching")}
                hitSlop={8}
                className="absolute right-4 top-4 h-9 w-9 items-center justify-center rounded-full bg-black/10"
              >
                <Pencil size={16} color="#0B1F0E" />
              </Pressable>
            )}

            <View className="mb-6 self-start">
              <Sparkling width={25} height={25} />
            </View>
            <Text className="mb-2 text-[11px] font-bold uppercase tracking-[1px] text-[#0B1F0E]/70">Featured teaching</Text>

            {isFeaturedTeachingLoading ? (
              <ActivityIndicator size="small" color="#0B1F0E" />
            ) : featuredTeaching ? (
              <>
                <Text className="text-left text-xl font-bold text-[#0B1F0E]">{featuredTeaching.title}</Text>
                <Text numberOfLines={FEATURED_TEACHING_HOME_PREVIEW_LINES} className="mt-2 text-left text-sm leading-5 text-[#0B1F0E]/80">
                  {featuredTeaching.content}
                </Text>
                <Pressable
                  onPress={() => router.push("/(teaching)/featured-teaching")}
                  hitSlop={8}
                  className="mt-3 self-start"
                >
                  <Text className="text-xs font-bold text-[#0B1F0E]">Read more →</Text>
                </Pressable>
              </>
            ) : (
              <Text className="text-left text-sm leading-5 text-[#0B1F0E]/80">
                Check back soon for today&apos;s teaching.
              </Text>
            )}
          </LinearGradient>

          <View className="mt-2 gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-menorah-primary">Testimonies</Text>
              <Pressable onPress={() => router.push("/(testimonies)/testimonies")}>
                <Text className="text-xs font-bold text-menorah-goldDark">Read all →</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => router.push("/(testimonies)/add")}
              className="rounded-2xl border border-menorah-primary/40 bg-menorah-darkGreen px-4 py-4">
              <Text className="text-sm font-bold text-white">✨ Has God been faithful to you?</Text>
              <Text className="mt-1 text-xs leading-4 text-menorah-muted">Share your testimony — your story could spark someone&apos;s faith today. Tap to add yours.</Text>
            </Pressable>

            {recentTestimonies && recentTestimonies.length > 0 && (
              recentTestimonies.map((testimony) => (
                <TestimonyCard
                  key={testimony.id}
                  id={testimony.id}
                  fullName={testimony.profiles?.full_name ?? "User"}
                  avatarUrl={testimony.profiles?.avatar_url ?? null}
                  content={testimony.content}
                  createdAt={testimony.created_at}
                  onPress={handleOpenTestimony}
                />
              ))
            )}
          </View>

          <View className="mt-2 gap-3">
            <View>
              <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-menorah-primary">Get in touch</Text>
              <Text className="mt-1 text-xs text-menorah-muted">We&apos;d love to hear from you</Text>
            </View>

            <View className="gap-2.5">
              {CONTACT_ITEMS.map((item) => (
                <ContactRow
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                  url={item.url}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      <HomeProfileModal />
    </SafeAreaView>
  )
}

export default Home
