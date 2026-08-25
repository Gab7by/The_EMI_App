import { ProfileViewer } from "@/components/podcast/livePodcastShared"
import { formatRecordingDate } from "@/lib/formatters"
import { hapticLight } from "@/lib/haptics"
import { Image } from "expo-image"
import { memo, useState } from "react"
import { Pressable, Text, View } from "react-native"

type TestimonyCardProps = {
  id: string
  fullName: string
  avatarUrl: string | null
  content: string
  createdAt?: string
  onPressContent?: () => void
}

export const getInitial = (name: string) => name.trim().charAt(0).toUpperCase() || "?"

const TestimonyCard = memo(({ fullName, avatarUrl, content, createdAt, onPressContent }: TestimonyCardProps) => {
  const [viewerVisible, setViewerVisible] = useState(false)

  return (
    <View className="rounded-2xl bg-menorah-darkGreen p-4">
      <View className="flex-row items-center">
        <Pressable
          onPress={() => {
            if (!avatarUrl) return
            hapticLight()
            setViewerVisible(true)
          }}
          disabled={!avatarUrl}
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 44, height: 44, borderRadius: 22 }}
              contentFit="cover"
            />
          ) : (
            <View
              style={{ width: 44, height: 44, borderRadius: 22 }}
              className="items-center justify-center bg-menorah-primary"
            >
              <Text className="text-lg font-bold text-menorah-bg">{getInitial(fullName)}</Text>
            </View>
          )}
        </Pressable>

        <View className="ml-3 flex-1">
          <Text className="text-sm font-bold text-white" numberOfLines={1}>
            {fullName}
          </Text>
          {createdAt && (
            <Text className="mt-0.5 text-[11px] text-menorah-gray">
              {formatRecordingDate(createdAt)}
            </Text>
          )}
        </View>
      </View>

      <Pressable onPress={onPressContent} className="mt-3" disabled={!onPressContent}>
        <Text className="text-sm leading-5 text-white/85" numberOfLines={5}>
          {content}
        </Text>
        {onPressContent && (
          <Text className="mt-2 text-xs font-bold text-menorah-goldDark">
            Read full testimony →
          </Text>
        )}
      </Pressable>

      <ProfileViewer
        visible={viewerVisible}
        imageUrl={avatarUrl}
        userName={fullName}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  )
})

TestimonyCard.displayName = "TestimonyCard"

export default TestimonyCard