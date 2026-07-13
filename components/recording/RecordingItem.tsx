// components/RecordingItem.tsx
import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { Play, Pause, Square, Globe, GlobeOff } from 'lucide-react-native'
import { formatRecordingDate, formatDuration } from '@/lib/formatters'
import {type Recording } from '@/types/podcast-types'
import AudioProgressBar from './AudioProgressBar'

interface RecordingItemProps {
    recording: Recording
    isActive: boolean
    // isActive = this is the recording currently loaded in the player
    isPlaying: boolean
    isLoading: boolean
    currentTime: number
    duration: number
    isAdmin: boolean
    onPlay: () => void
    onToggle: () => void
    onStop: () => void
    onSeek: (seconds: number) => void
    onPublishToggle?: () => void
}

export default function RecordingItem({
    recording,
    isActive,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    isAdmin,
    onPlay,
    onToggle,
    onStop,
    onSeek,
    onPublishToggle,
}: RecordingItemProps) {
    return (
        <View className={`rounded-2xl px-4 py-4 mb-3 ${
            isActive ? 'bg-[#1a3a10]' : 'bg-[#143703]'
            // slightly different background when this item is active
            // gives visual feedback on which recording is loaded
        }`}>

            {/* Recording info */}
            <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1 mr-3">
                    <Text className="text-[14px] font-semibold text-[#F2F5EE]" numberOfLines={1}>
                        {recording.podcast_title || formatRecordingDate(recording.started_at)}
                    </Text>
                    <Text className="text-[12px] text-[#B7C0BC] mt-0.5">
                        {recording.podcast_title ? formatRecordingDate(recording.started_at) : null}
                        {recording.duration_seconds ? `${recording.podcast_title ? ' · ' : ''}${formatDuration(recording.duration_seconds)}` : ''}
                    </Text>
                </View>

                <View className="flex-row items-center gap-2">
                    {/* Admin publish/unpublish button */}
                    {isAdmin && onPublishToggle && (
                        <Pressable
                            onPress={onPublishToggle}
                            className="w-10 h-10 rounded-full bg-[#184832] items-center justify-center"
                        >
                            {recording.publish ? (
                                <GlobeOff size={16} color="#D7FF00" />
                            ) : (
                                <Globe size={16} color="#B7C0BC" />
                            )}
                        </Pressable>
                    )}

                    {/* Play/Pause button */}
                    <Pressable
                        onPress={isActive ? onToggle : onPlay}
                        // if this item is already loaded, toggle play/pause
                        // if it is not loaded, start playing it
                        disabled={isLoading}
                        className="w-10 h-10 rounded-full bg-[#D7FF00] items-center justify-center"
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#143703" />
                        ) : isActive && isPlaying ? (
                            <Pause size={16} color="#143703" />
                        ) : (
                            <Play size={16} color="#143703" />
                        )}
                    </Pressable>
                </View>
            </View>

            {/* Progress bar — only show when this recording is active */}
            {isActive && (
                <>
                    <AudioProgressBar
                        currentTime={currentTime}
                        duration={duration}
                        onSeek={onSeek}
                    />

                    {/* Stop button */}
                    <Pressable
                        onPress={onStop}
                        className="mt-3 flex-row items-center justify-center gap-2 py-2 rounded-xl bg-[#184832]"
                    >
                        <Square size={13} color="#B7C0BC" />
                        <Text className="text-[12px] text-[#B7C0BC]">Stop</Text>
                    </Pressable>
                </>
            )}
        </View>
    )
}