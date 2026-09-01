import { PodcastBottomSheet, HostAvatar } from "@/components/podcast/livePodcastShared"
import { Colors } from "@/constants/theme"
import type { RoomSignal } from "@/types/livekit-types"
import { Mic, MicOff } from "lucide-react-native"
import { memo } from "react"
import { ActivityIndicator, Pressable, Text, View } from "react-native"

export type SpeakerRowData = {
  id: string
  name: string
  avatarUrl: string | null
  isMuted: boolean
  isHost: boolean
  isSpeaking: boolean
  audioTrackSid: string | null
}

type SpeakersSheetProps = {
  visible: boolean
  onClose: () => void

  raisedHands: RoomSignal[]
  approvingRequests: Set<string>
  speakerLimitReached: boolean
  onApprove: (participantId: string) => void
  onReject: (participantId: string) => void

  speakers: SpeakerRowData[]
  removingSpeakers: Set<string>
  mutingSpeakers: Set<string>
  onToggleHostMic: () => void
  onMuteSpeaker: (participantId: string, trackSid: string | null) => void
  onRemoveSpeaker: (participantId: string) => void
}

function SpeakersSheet({
  visible,
  onClose,
  raisedHands,
  approvingRequests,
  speakerLimitReached,
  onApprove,
  onReject,
  speakers,
  removingSpeakers,
  mutingSpeakers,
  onToggleHostMic,
  onMuteSpeaker,
  onRemoveSpeaker,
}: SpeakersSheetProps) {
  return (
    <PodcastBottomSheet visible={visible} onClose={onClose}>
      <View className="items-center">
        <View className="h-[4px] w-[112px] rounded-full bg-[#D7FF00]" />
      </View>

      <Text className="mt-8 text-center text-[18px] font-bold text-[#D7FF00]">
        Speakers & Requests
      </Text>

      <Text className="mt-8 text-[13px] font-semibold uppercase tracking-[1px] text-[#B7C0BC]">
        Call-in Requests
      </Text>

      {raisedHands.length ? (
        <View className="mt-4 gap-4">
          {raisedHands.map((request) => (
            <RequestCard
              key={request.fromId}
              name={request.fromName}
              isApproving={approvingRequests.has(request.fromId)}
              limitReached={speakerLimitReached}
              onApprove={() => onApprove(request.fromId)}
              onReject={() => onReject(request.fromId)}
            />
          ))}
        </View>
      ) : (
        <View className="mt-4 rounded-[22px] bg-[#143703] px-4 py-4">
          <Text className="text-[14px] text-[#B7C0BC]">No call-in requests right now.</Text>
        </View>
      )}

      <Text className="mt-8 text-[13px] font-semibold uppercase tracking-[1px] text-[#B7C0BC]">
        Active Speakers
      </Text>

      <View className="mt-4 gap-4">
        {speakers.map((speaker) => (
          <SpeakerRow
            key={speaker.id}
            speaker={speaker}
            isRemoving={removingSpeakers.has(speaker.id)}
            isMuting={mutingSpeakers.has(speaker.id)}
            onToggleHostMic={onToggleHostMic}
            onMute={() => onMuteSpeaker(speaker.id, speaker.audioTrackSid)}
            onRemove={() => onRemoveSpeaker(speaker.id)}
          />
        ))}
      </View>
    </PodcastBottomSheet>
  )
}

export default memo(SpeakersSheet)

// ─────────────────────────────────────────────────────────────────────
const RequestCard = memo(({
  name,
  isApproving,
  limitReached,
  onApprove,
  onReject,
}: {
  name: string
  isApproving: boolean
  limitReached: boolean
  onApprove: () => void
  onReject: () => void
}) => (
  <View className="rounded-[22px] bg-[#143703] px-4 py-4">
    <Text className="text-[16px] font-semibold text-[#F4F5F0]">{name}</Text>
    <Text className="mt-1 text-[12px] text-[#B7C0BC]">
      Wants to call in and join as a speaker.
    </Text>
    <View className="mt-4 flex-row gap-3">
      <Pressable
        onPress={onApprove}
        disabled={isApproving || limitReached}
        className={`flex-1 items-center rounded-[16px] px-4 py-3 ${
          isApproving ? "bg-[#D7FF00]/70" : limitReached ? "bg-[#184832]" : "bg-[#D7FF00]"
        }`}
      >
        {isApproving ? (
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color="#143703" />
            <Text className="ml-2 text-[14px] font-semibold text-[#143703]">Approving...</Text>
          </View>
        ) : (
          <Text className={`text-[14px] font-semibold ${limitReached ? "text-[#8A9A90]" : "text-[#143703]"}`}>
            Accept
          </Text>
        )}
      </Pressable>
      <Pressable
        onPress={onReject}
        disabled={isApproving}
        className="flex-1 items-center rounded-[16px] bg-white/10 px-4 py-3"
      >
        <Text className="text-[14px] font-semibold text-[#F4F5F0]">Reject</Text>
      </Pressable>
    </View>
    {limitReached ? (
      <Text className="mt-3 text-[11px] text-[#D7FF00]">Speaker slots are full.</Text>
    ) : null}
  </View>
))
RequestCard.displayName = "RequestCard"

// ─────────────────────────────────────────────────────────────────────
const SpeakerRow = memo(({
  speaker,
  isRemoving,
  isMuting,
  onToggleHostMic,
  onMute,
  onRemove,
}: {
  speaker: SpeakerRowData
  isRemoving: boolean
  isMuting: boolean
  onToggleHostMic: () => void
  onMute: () => void
  onRemove: () => void
}) => (
  <View className="flex-row items-center rounded-[22px] bg-[#143703] px-4 py-4">
    <HostAvatar
      hostName={speaker.name}
      hostPictureUrl={speaker.avatarUrl}
      size={42}
      textClassName="text-base font-bold text-menorah-primary"
    />
    <View className="ml-3 flex-1">
      <View className="flex-row items-center">
        <Text className="text-[15px] font-semibold text-[#F4F5F0]">{speaker.name}</Text>
        {speaker.isSpeaking ? (
          <View className="ml-2 h-2 w-2 rounded-full bg-[#D7FF00]" />
        ) : null}
      </View>
      <Text className="mt-1 text-[12px] text-[#B7C0BC]">
        {speaker.isHost ? "Host" : "Speaker"}
      </Text>
    </View>
    {speaker.isHost ? (
      <Pressable
        onPress={onToggleHostMic}
        className="flex-row items-center rounded-full bg-menorah-darkGreen px-3 py-2"
      >
        {speaker.isMuted ? (
          <MicOff size={18} color={Colors.menorah.primary} />
        ) : (
          <Mic size={18} color={Colors.menorah.primary} />
        )}
        <Text className="ml-2 text-[12px] font-semibold text-[#F4F5F0]">
          {speaker.isMuted ? "Muted" : "Live"}
        </Text>
      </Pressable>
    ) : (
      <View className="items-end gap-2">
        <Pressable
          onPress={onMute}
          disabled={speaker.isMuted || isMuting || !speaker.audioTrackSid}
          className={`flex-row items-center rounded-full px-3 py-2 ${
            speaker.isMuted || !speaker.audioTrackSid ? "bg-white/10" : "bg-[#D7FF00]/15"
          }`}
        >
          {isMuting ? (
            <ActivityIndicator size="small" color="#D7FF00" />
          ) : speaker.isMuted ? (
            <MicOff size={18} color="#F3F6E7" />
          ) : (
            <Mic size={18} color="#D7FF00" />
          )}
          <Text className="ml-2 text-[12px] font-semibold text-[#F4F5F0]">
            {isMuting ? "Muting" : speaker.isMuted ? "Muted" : "Mute"}
          </Text>
        </Pressable>
        <Pressable
          onPress={onRemove}
          disabled={isRemoving}
          className="rounded-full bg-[#F3523C]/15 px-3 py-2"
        >
          {isRemoving ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#FF8A7A" />
              <Text className="ml-2 text-[11px] font-semibold text-[#FF8A7A]">Removing</Text>
            </View>
          ) : (
            <Text className="text-[11px] font-semibold text-[#FF8A7A]">Remove</Text>
          )}
        </Pressable>
      </View>
    )}
  </View>
))
SpeakerRow.displayName = "SpeakerRow"
