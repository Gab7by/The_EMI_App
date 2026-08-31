import { MAX_TESTIMONY_IMAGES } from "@/types/testimony-types"
import { createTestimony } from "@/lib/testimonies"
import { pickImage } from "@/lib/storage"
import { hapticMedium, hapticLight } from "@/lib/haptics"
import { useQueryClient } from "@tanstack/react-query"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { ArrowLeft, Plus, X } from "lucide-react-native"
import { useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const MIN_CONTENT_LENGTH = 10

const AddTestimonyScreen = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [content, setContent] = useState("")
  const [images, setImages] = useState<NonNullable<Awaited<ReturnType<typeof pickImage>>>[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = useMemo(
    () => content.trim().length >= MIN_CONTENT_LENGTH && !isSubmitting,
    [content, isSubmitting]
  )

  const handlePickImage = async () => {
    if (images.length >= MAX_TESTIMONY_IMAGES) return

    hapticLight()
    // No forced crop - the photo is uploaded as picked. The 88x88 preview
    // below fills its box with contentFit="cover" for display only; that
    // never touches the actual stored file.
    const asset = await pickImage({ allowsEditing: false })
    if (!asset) return

    setImages((prev) => [...prev, asset])
  }

  const handleRemoveImage = (index: number) => {
    hapticLight()
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!canSubmit) return

    hapticMedium()
    setIsSubmitting(true)

    const result = await createTestimony(content, images)

    if (!result) {
      setIsSubmitting(false)
      Alert.alert(
        "Could not share testimony",
        "Something went wrong. Please check your connection and try again."
      )
      return
    }

    await queryClient.invalidateQueries({ queryKey: ["recent-testimonies"] })
    await queryClient.invalidateQueries({ queryKey: ["testimonies"] })

    router.replace("/(testimonies)/testimonies")
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
              <Text className="text-xl font-bold text-white">Share Your Testimony</Text>
              <Text className="text-xs text-menorah-muted">
                Let the world know what the Lord has done
              </Text>
            </View>
          </View>

          <View className="mt-8 rounded-2xl bg-menorah-darkGreen p-4">
            <Text className="text-sm font-semibold text-white">Your testimony</Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={8}
              maxLength={3000}
              placeholder="He saved me, He healed me, He provided…"
              placeholderTextColor="#8A9A90"
              className="mt-3 min-h-[180px] text-[15px] leading-6 text-white"
              textAlignVertical="top"
            />
            <Text className="mt-2 self-end text-[11px] text-menorah-gray">
              {content.length}/3000 · min {MIN_CONTENT_LENGTH} characters
            </Text>
          </View>

          <View className="mt-5 gap-3">
            <Text className="text-sm font-semibold text-white">
              Add photos (optional, up to {MAX_TESTIMONY_IMAGES})
            </Text>

            <View className="flex-row flex-wrap gap-3">
              {images.map((asset, index) => (
                <View key={`${asset.uri}-${index}`}>
                  <Image
                    source={{ uri: asset.uri }}
                    style={{ width: 88, height: 88, borderRadius: 16 }}
                    contentFit="cover"
                  />
                  <Pressable
                    onPress={() => handleRemoveImage(index)}
                    className="absolute -right-2 -top-2 h-6 w-6 items-center justify-center rounded-full bg-menorah-error"
                  >
                    <X size={14} color="white" />
                  </Pressable>
                </View>
              ))}

              {images.length < MAX_TESTIMONY_IMAGES && (
                <Pressable
                  onPress={handlePickImage}
                  style={{ width: 88, height: 88 }}
                  className="items-center justify-center rounded-2xl border border-dashed border-menorah-primary/50 bg-menorah-darkGreen/60"
                >
                  <Plus size={26} color="#C6FF00" />
                </Pressable>
              )}
            </View>
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            className={`mt-8 items-center rounded-full py-6 ${canSubmit ? "bg-menorah-primary" : "bg-menorah-darkGreen opacity-60"}`}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#0B1F0E" />
            ) : (
              <Text className={`font-bold text-base ${canSubmit ? "text-menorah-bg" : "text-white/60"}`}>
                Share Testimony
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default AddTestimonyScreen