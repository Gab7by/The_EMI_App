import { BUNDLED_SLIDER_IMAGE_SOURCES } from "@/constants/podcast"
import { useHomeSliderSlots } from "@/hooks/tanstack-query-hooks"
import { hapticMedium, hapticSuccess } from "@/lib/haptics"
import { resetHomeSliderSlot, updateHomeSliderSlot } from "@/lib/homeSlider"
import { queryClient } from "@/lib/query"
import { pickImage } from "@/lib/storage"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { ArrowLeft, Pencil } from "lucide-react-native"
import { useState } from "react"
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th"]
const THUMB_SIZE = 104

const SliderImagesScreen = () => {
  const router = useRouter()
  const { data: slots, isLoading } = useHomeSliderSlots()
  const [busyPosition, setBusyPosition] = useState<number | null>(null)

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["home-slider-slots"] })

  const handleChange = async (position: number, previousStoragePath: string | null) => {
    if (busyPosition) return

    // Cropped to match the slider's own aspect ratio, same as the bundled
    // images it's replacing - keeps every slide framed consistently.
    const asset = await pickImage({ allowsEditing: true, aspect: [16, 9] })
    if (!asset) return

    hapticMedium()
    setBusyPosition(position)
    const updated = await updateHomeSliderSlot(position, asset, previousStoragePath)
    setBusyPosition(null)

    if (!updated) {
      console.error("SliderImagesScreen: failed to update slot", position)
      Alert.alert("Upload failed", "Please check your connection and try again.")
      return
    }

    hapticSuccess()
    invalidate()
  }

  const handleReset = async (position: number, previousStoragePath: string | null) => {
    if (busyPosition) return

    hapticMedium()
    setBusyPosition(position)
    const success = await resetHomeSliderSlot(position, previousStoragePath)
    setBusyPosition(null)

    if (!success) {
      console.error("SliderImagesScreen: failed to reset slot", position)
      return
    }

    invalidate()
  }

  const handlePressSlot = (position: number, imageUrl: string | null, storagePath: string | null) => {
    if (busyPosition) return

    const options: NonNullable<Parameters<typeof Alert.alert>[2]> = [
      { text: "Change Image", onPress: () => handleChange(position, storagePath) },
    ]

    if (imageUrl) {
      options.push({
        text: "Reset to Default",
        style: "destructive",
        onPress: () => handleReset(position, storagePath),
      })
    }

    options.push({ text: "Cancel", style: "cancel" })

    Alert.alert(`${ORDINALS[position - 1]} slide`, "What would you like to do?", options)
  }

  return (
    <SafeAreaView className="flex-1 bg-menorah-bg px-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10 pt-2">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
          >
            <ArrowLeft size={22} color="white" />
          </Pressable>
          <View>
            <Text className="text-xl font-bold text-white">Home Slider Images</Text>
            <Text className="text-xs text-menorah-muted">Tap a slide to change it</Text>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator className="mt-8" size="large" color="#C6FF00" />
        ) : (
          <View className="mt-6 flex-row flex-wrap gap-3">
            {BUNDLED_SLIDER_IMAGE_SOURCES.map((fallbackSource, index) => {
              const position = index + 1
              const slot = slots?.find((candidate) => candidate.position === position)
              const imageUrl = slot?.image_url ?? null
              const isBusy = busyPosition === position

              return (
                <Pressable
                  key={position}
                  onPress={() => handlePressSlot(position, imageUrl, slot?.storage_path ?? null)}
                  disabled={!!busyPosition}
                  style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
                >
                  <Image
                    source={imageUrl ? { uri: imageUrl } : fallbackSource}
                    style={{ width: "100%", height: "100%", borderRadius: 16 }}
                    contentFit="cover"
                  />

                  <View className="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5">
                    <Text className="text-[10px] font-bold text-white">{ORDINALS[index]}</Text>
                  </View>

                  {!imageUrl && (
                    <View className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-1.5 py-0.5">
                      <Text className="text-[8px] font-semibold text-white/80">Default</Text>
                    </View>
                  )}

                  <View className="absolute bottom-1.5 right-1.5 h-7 w-7 items-center justify-center rounded-full bg-black/60">
                    {isBusy ? (
                      <ActivityIndicator size="small" color="#C6FF00" />
                    ) : (
                      <Pencil size={13} color="white" />
                    )}
                  </View>
                </Pressable>
              )
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default SliderImagesScreen
