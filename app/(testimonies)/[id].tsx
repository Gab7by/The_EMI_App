import { getInitial } from "@/components/testimonies/testimonyCard"
import ImageViewerModal from "@/components/testimonies/imageViewerModal"
import { useTestimonyById } from "@/hooks/tanstack-query-hooks"
import { formatRecordingDate } from "@/lib/formatters"
import { hapticLight, hapticMedium } from "@/lib/haptics"
import { queryClient } from "@/lib/query"
import { deleteTestimony } from "@/lib/testimonies"
import { useAuthStore } from "@/store/authStore"
import { Image } from "expo-image"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ArrowLeft, Trash2 } from "lucide-react-native"
import { useState } from "react"
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

const GRID_GAP = 8

/** 1 photo reads as a hero image; 2-3 share a row evenly. Matches
 * MAX_TESTIMONY_IMAGES (3), so this never needs to handle more. */
const getImageLayout = (count: number, availableWidth: number) => {
  if (count <= 1) {
    return { width: availableWidth, height: availableWidth * 0.72 }
  }
  const size = (availableWidth - GRID_GAP * (count - 1)) / count
  return { width: size, height: size }
}

const TestimonyDetailScreen = () => {
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: testimony, isLoading } = useTestimonyById(id ?? "")
  const profile = useAuthStore((state) => state.profile)
  const [isDeleting, setIsDeleting] = useState(false)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  const fullName = testimony?.profiles?.full_name ?? "User"
  const avatarUrl = testimony?.profiles?.avatar_url ?? null
  const images = testimony?.testimony_images ?? []
  const imageUrls = images.map((image) => image.image_url)
  const canDelete = !!profile && !!testimony && (profile.id === testimony.user_id || profile.role === 'admin')
  const availableGridWidth = width - 32 // matches the screen's px-4 on both sides
  const imageLayout = getImageLayout(images.length, availableGridWidth)

  const handleDelete = () => {
    if (!testimony) return

    Alert.alert(
      'Delete testimony?',
      'This removes the testimony and its photos. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true)
            const success = await deleteTestimony(testimony.id, imageUrls)
            setIsDeleting(false)

            if (!success) {
              Alert.alert('Could not delete testimony', 'You may not have permission to delete this, or it was already removed.')
              return
            }

            // This screen's own useTestimonyById(testimony.id) is still
            // mounted and actively observing right up until router.back()
            // finishes - removeQueries() on that same key here would evict
            // the cache entry while that observer is still active, which
            // makes it immediately refetch a row that's now gone, and
            // .single() on zero rows is exactly the
            // "Cannot coerce the result to a single JSON object" error.
            // The list screens are all that need refreshing now; there's no
            // live observer left on those once we've navigated back.
            queryClient.invalidateQueries({ queryKey: ['testimonies'] })
            queryClient.invalidateQueries({ queryKey: ['recent-testimonies'] })
            router.back()
          },
        },
      ]
    )
  }

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
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
          >
            <ArrowLeft size={22} color="white" />
          </Pressable>

          {canDelete ? (
            <Pressable
              onPress={() => { hapticMedium(); handleDelete() }}
              disabled={isDeleting}
              className="h-10 w-10 items-center justify-center rounded-full bg-[#5A2020]"
              hitSlop={8}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FFB4A9" />
              ) : (
                <Trash2 size={18} color="#FFB4A9" />
              )}
            </Pressable>
          ) : null}
        </View>

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
            <View className="flex-row gap-2">
              {images.map((image, index) => (
                <Pressable
                  key={image.id}
                  onPress={() => { hapticLight(); setViewerIndex(index) }}
                  style={{ width: imageLayout.width, height: imageLayout.height }}
                >
                  <Image
                    source={{ uri: image.image_url }}
                    style={{ width: "100%", height: "100%", borderRadius: 16 }}
                    contentFit="cover"
                  />
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <ImageViewerModal
        visible={viewerIndex !== null}
        images={imageUrls}
        initialIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
      />
    </SafeAreaView>
  )
}

export default TestimonyDetailScreen