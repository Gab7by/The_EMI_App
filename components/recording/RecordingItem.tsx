import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { Play, Pause, Globe, GlobeOff } from 'lucide-react-native'
import { formatRecordingDate, formatDuration } from '@/lib/formatters'
import { type Recording } from '@/types/podcast-types'

interface RecordingItemProps {
    recording: Recording
    isActive: boolean
    isPlaying: boolean
    isLoading: boolean
    isAdmin: boolean
    onPlay: () => void
    onToggle: () => void
    onPublishToggle?: () => void
}

export default function RecordingItem({
    recording,
    isActive,
    isPlaying,
    isLoading,
    isAdmin,
    onPlay,
    onToggle,
    onPublishToggle,
}: RecordingItemProps) {
    const playlistColor = recording.playlist ? getPlaylistColor(recording.playlist) : '#D7FF00'

    return (
        <Pressable
            onPress={isActive ? onToggle : onPlay}
            disabled={isLoading}
            className={`mb-3 rounded-[20px] px-4 py-4 ${
                isActive ? 'bg-[#1a3a10]' : 'bg-[#143703]'
            }`}
        >
            <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-3 min-w-0">
                    <Text className="text-[14px] font-semibold text-[#F2F5EE]" numberOfLines={1}>
                        {recording.podcast_title || formatRecordingDate(recording.started_at)}
                    </Text>
                    <Text className="text-[12px] text-[#B7C0BC] mt-0.5" numberOfLines={1}>
                        {recording.podcast_title ? formatRecordingDate(recording.started_at) : null}
                    </Text>

                    {/* Playlist tag */}
                    {recording.playlist ? (
                        <View
                            className="mt-1.5 self-start rounded-full px-2.5 py-1"
                            style={{ backgroundColor: `${playlistColor}20` }}
                        >
                            <Text
                                className="text-[10px] font-semibold"
                                style={{ color: playlistColor }}
                            >
                                {recording.playlist}
                            </Text>
                        </View>
                    ) : null}

                    {/* Duration */}
                    {recording.duration_seconds ? (
                        <Text className="mt-1 text-[11px] text-[#B7C0BC]">
                            {formatDuration(recording.duration_seconds)}
                        </Text>
                    ) : null}
                </View>

                <View className="flex-row items-center gap-2">
                    {/* Admin publish/unpublish button */}
                    {isAdmin && onPublishToggle && (
                        <Pressable
                            onPress={onPublishToggle}
                            className="w-10 h-10 rounded-full bg-[#184832] items-center justify-center"
                            hitSlop={8}
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
                        disabled={isLoading}
                        className="w-10 h-10 rounded-full bg-[#D7FF00] items-center justify-center"
                        hitSlop={8}
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
        </Pressable>
    )
}

const PLAYLIST_COLORS: Record<string, string> = {
    'Lunch Prayer Fire': '#FF6B35',
    'Priesthood Time': '#4D96FF',
    'School of the Prophets': '#9B51E0',
    'School of Spiritual Mysteries': '#00C9A6',
    'Mega One Word From the Lord': '#FFD700',
    '45 minutes in Tongues': '#FF4B5F',
}

function getPlaylistColor(playlist: string): string {
    return PLAYLIST_COLORS[playlist] ?? '#D7FF00'
}
