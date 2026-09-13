import { useFeaturedTeaching } from "@/hooks/tanstack-query-hooks"
import { hapticMedium, hapticSuccess } from "@/lib/haptics"
import { updateFeaturedTeaching } from "@/lib/featuredTeaching"
import { queryClient } from "@/lib/query"
import { MAX_FEATURED_TEACHING_CONTENT_LENGTH, MAX_FEATURED_TEACHING_TITLE_LENGTH } from "@/types/featured-teaching-types"
import { useRouter } from "expo-router"
import { ArrowLeft } from "lucide-react-native"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const EditFeaturedTeachingScreen = () => {
  const router = useRouter()
  const { data: featuredTeaching, isLoading } = useFeaturedTeaching()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Seeds the form once the current teaching loads - a ref-guarded effect
  // would be overkill here since this screen is only ever mounted fresh
  // (there's nothing else that could re-trigger it after the first load).
  useEffect(() => {
    if (featuredTeaching) {
      setTitle(featuredTeaching.title)
      setContent(featuredTeaching.content)
    }
  }, [featuredTeaching])

  const canSave = useMemo(
    () => title.trim().length > 0 && content.trim().length > 0 && !isSaving,
    [title, content, isSaving]
  )

  const handleSave = async () => {
    if (!featuredTeaching || !canSave) return

    hapticMedium()
    setIsSaving(true)
    const updated = await updateFeaturedTeaching(featuredTeaching.id, title, content)
    setIsSaving(false)

    if (!updated) {
      console.error("EditFeaturedTeachingScreen: failed to update featured teaching")
      Alert.alert(
        "Could not publish",
        "Something went wrong. Please check your connection and try again."
      )
      return
    }

    hapticSuccess()
    queryClient.invalidateQueries({ queryKey: ["featured-teaching"] })
    router.back()
  }

  if (isLoading || !featuredTeaching) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-menorah-bg">
        <ActivityIndicator size="large" color="#C6FF00" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-menorah-bg px-4">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow pb-10 pt-2"
        >
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
            >
              <ArrowLeft size={22} color="white" />
            </Pressable>
            <View>
              <Text className="text-xl font-bold text-white">Edit Featured Teaching</Text>
              <Text className="text-xs text-menorah-muted">
                Shared on the home screen until you change it again
              </Text>
            </View>
          </View>

          <View className="mt-8 rounded-2xl bg-menorah-darkGreen p-4">
            <Text className="text-sm font-semibold text-white">Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              maxLength={MAX_FEATURED_TEACHING_TITLE_LENGTH}
              placeholder="Today's devotion title"
              placeholderTextColor="#8A9A90"
              className="mt-3 text-[15px] text-white"
            />
          </View>

          <View className="mt-5 rounded-2xl bg-menorah-darkGreen p-4">
            <Text className="text-sm font-semibold text-white">Devotion</Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={10}
              maxLength={MAX_FEATURED_TEACHING_CONTENT_LENGTH}
              placeholder="Share today's word..."
              placeholderTextColor="#8A9A90"
              className="mt-3 min-h-[220px] text-[15px] leading-6 text-white"
              textAlignVertical="top"
            />
            <Text className="mt-2 self-end text-[11px] text-menorah-gray">
              {content.length}/{MAX_FEATURED_TEACHING_CONTENT_LENGTH}
            </Text>
          </View>

          <Pressable
            onPress={handleSave}
            disabled={!canSave}
            className={`mt-8 items-center rounded-full py-6 ${canSave ? "bg-menorah-primary" : "bg-menorah-darkGreen opacity-60"}`}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#0B1F0E" />
            ) : (
              <Text className={`text-base font-bold ${canSave ? "text-menorah-bg" : "text-white/60"}`}>
                Publish
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default EditFeaturedTeachingScreen
