import { HostAvatar, PodcastBottomSheet } from "@/components/podcast/livePodcastShared"
import type { LivePodcastParticipant } from "@/types/podcast-types"
import { FlashList } from "@shopify/flash-list"
import { RefreshCw } from "lucide-react-native"
import { memo, useCallback } from "react"
import { ActivityIndicator, Pressable, Text, View } from "react-native"

type ParticipantsSheetProps = {
  visible: boolean
  onClose: () => void
  participants: LivePodcastParticipant[]
  participantCount: number
  isLoading: boolean
  isRefreshing: boolean
  onRefresh: () => void
  listHeight: number
}

function ParticipantsSheet({
  visible,
  onClose,
  participants,
  participantCount,
  isLoading,
  isRefreshing,
  onRefresh,
  listHeight,
}: ParticipantsSheetProps) {
  const renderRow = useCallback(({ item }: { item: LivePodcastParticipant }) => (
    <ParticipantRow participant={item} />
  ), [])

  return (
    <PodcastBottomSheet visible={visible} onClose={onClose}>
      <View className="items-center">
        <View className="h-[4px] w-[112px] rounded-full bg-[#D7FF00]" />
      </View>

      <View className="mt-5 flex-row items-center justify-between">
        <View className="min-w-0 flex-1">
          <Text className="text-[18px] font-bold text-[#D7FF00]">Live Participants</Text>
          <Text className="mt-1 text-[12px] text-[#B7C0BC]">
            {participants.length} visible, {participantCount} live now
          </Text>
        </View>
        <Pressable
          onPress={onRefresh}
          disabled={isRefreshing}
          className="ml-3 h-10 w-10 items-center justify-center rounded-[14px] bg-[#143703]"
          accessibilityRole="button"
          accessibilityLabel="Refresh live participants"
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color="#D7FF00" />
          ) : (
            <RefreshCw size={18} color="#D7FF00" />
          )}
        </Pressable>
      </View>

      <View className="mt-4 overflow-hidden rounded-[20px]" style={{ height: listHeight }}>
        <FlashList
          data={participants}
          keyExtractor={(item) => item.id}
          renderItem={renderRow}
          ItemSeparatorComponent={() => <View className="h-2" />}
          ListEmptyComponent={() => (
            <View className="items-center rounded-[18px] bg-[#143703] px-4 py-8">
              {isLoading ? (
                <ActivityIndicator size="small" color="#D7FF00" />
              ) : (
                <Text className="text-center text-[13px] text-[#B7C0BC]">
                  No live participants yet.
                </Text>
              )}
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 8 }}
          showsVerticalScrollIndicator
          refreshing={isRefreshing}
          onRefresh={onRefresh}
        />
      </View>
    </PodcastBottomSheet>
  )
}

export default memo(ParticipantsSheet)

const ParticipantRow = memo(({ participant }: { participant: LivePodcastParticipant }) => {
  const participantProfile = participant.profile
  const participantName = participantProfile?.full_name?.trim() || "Unnamed participant"
  const joinedAt = participant.joined_at
    ? new Date(participant.joined_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : null

  return (
    <View className="flex-row items-center rounded-[18px] bg-[#143703] px-4 py-3">
      <HostAvatar
        hostName={participantName}
        hostPictureUrl={participantProfile?.avatar_url ?? null}
        size={40}
        textClassName="text-sm font-bold text-menorah-primary"
      />
      <View className="ml-3 min-w-0 flex-1">
        <Text className="text-[14px] font-semibold text-[#F4F5F0]" numberOfLines={1}>
          {participantName}
        </Text>
        <Text className="mt-1 text-[11px] text-[#B7C0BC]" numberOfLines={1}>
          {joinedAt ? `Joined ${joinedAt}` : "Joined stream"}
        </Text>
      </View>
      <View className={`ml-3 rounded-full px-2.5 py-1 ${participant.is_called_in ? "bg-[#D7FF00]" : "bg-[#D7FF00]/15"}`}>
        <Text className={`text-[10px] font-semibold ${participant.is_called_in ? "text-[#143703]" : "text-[#D7FF00]"}`}>
          {participant.is_called_in ? "Speaker" : "Live"}
        </Text>
      </View>
    </View>
  )
})
ParticipantRow.displayName = "ParticipantRow"
