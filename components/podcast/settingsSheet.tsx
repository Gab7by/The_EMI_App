import { PodcastBottomSheet } from "@/components/podcast/livePodcastShared"
import { ChevronRight } from "lucide-react-native"
import { memo } from "react"
import { ActivityIndicator, Pressable, Text, View } from "react-native"

type SettingsSheetProps = {
  visible: boolean
  onClose: () => void
  isRecording: boolean
  isRecordingActionLoading: boolean
  onToggleRecording: () => void
  isUploadingBackground: boolean
  onSetBackground: () => void
}

function SettingsSheet({
  visible,
  onClose,
  isRecording,
  isRecordingActionLoading,
  onToggleRecording,
  isUploadingBackground,
  onSetBackground,
}: SettingsSheetProps) {
  return (
    <PodcastBottomSheet visible={visible} onClose={onClose}>
      <View className="items-center">
        <View className="h-[4px] w-[112px] rounded-full bg-[#D7FF00]" />
      </View>

      <Pressable
        onPress={onToggleRecording}
        disabled={isRecordingActionLoading}
        className="mt-8 flex-row items-center justify-between"
      >
        <Text className="text-[16px] font-medium text-[#F2F5EE]">
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Text>
        {isRecordingActionLoading ? (
          <ActivityIndicator size="small" color="#D7FF00" />
        ) : (
          <ChevronRight size={24} color="#D7FF00" strokeWidth={2.4} />
        )}
      </Pressable>

      <Pressable
        onPress={onSetBackground}
        className="mt-10 flex-row items-center justify-between"
      >
        <Text className="text-[16px] font-medium text-[#F2F5EE]">Set Background</Text>
        {isUploadingBackground ? (
          <ActivityIndicator size="small" color="#D7FF00" />
        ) : (
          <ChevronRight size={24} color="#D7FF00" strokeWidth={2.4} />
        )}
      </Pressable>
    </PodcastBottomSheet>
  )
}

export default memo(SettingsSheet)
