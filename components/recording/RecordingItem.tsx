import { useRecordingDownload } from '@/hooks/useRecordingDownload'
import { formatDuration, formatRecordingDate } from '@/lib/formatters'
import { getPlaylistColor } from '@/lib/recording-ui'
import { type Recording } from '@/types/podcast-types'
import { Image } from 'expo-image'
import { Check, Globe, GlobeOff, Pause, Play, Trash2 } from 'lucide-react-native'
import { memo, useEffect, useRef } from 'react'
import { Animated, Easing, ActivityIndicator, Pressable, Text, View } from 'react-native'

interface RecordingItemProps {
    recording: Recording
    index: number
    isActive: boolean
    isPlaying: boolean
    isLoading: boolean
    isAdmin: boolean
    /** 0..1, only meaningful (and passed) for the active row - keeps every
     * other row's props stable so they don't re-render on every playback tick. */
    progress?: number
    onPlay: (recording: Recording, index: number) => void
    onToggle: () => void
    onPublishToggle?: (recording: Recording) => void
    onDelete?: (recording: Recording) => void
}

function RecordingItem({
    recording,
    index,
    isActive,
    isPlaying,
    isLoading,
    isAdmin,
    progress,
    onPlay,
    onToggle,
    onPublishToggle,
    onDelete,
}: RecordingItemProps) {
    const playlistColor = getPlaylistColor(recording.playlist)
    const handlePress = () => (isActive ? onToggle() : onPlay(recording, index))
    // Visual-only here - a quiet reminder of what's already offline. The
    // actual download/share/remove controls live in the full player screen,
    // so this dense list doesn't get another tap target per row.
    const { status: downloadStatus } = useRecordingDownload(recording)

    return (
        <Pressable
            onPress={handlePress}
            disabled={isLoading}
            className="mb-3 overflow-hidden rounded-[20px]"
            style={{ backgroundColor: isActive ? '#1a3a10' : '#122a16' }}
        >
            <View className="flex-row items-center px-3.5 py-3.5">
                {/* Leading artwork - the live session's background image when
                    the host set one, falling back to a tinted note glyph for
                    older sessions that never had a cover. */}
                <View className="mr-3 h-12 w-12 overflow-hidden rounded-2xl" style={{ backgroundColor: `${playlistColor}1f` }}>
                    {recording.coverImageUrl ? (
                        <Image
                            source={{ uri: recording.coverImageUrl }}
                            style={{ height: '100%', width: '100%' }}
                            contentFit="cover"
                            transition={150}
                        />
                    ) : (
                        <View className="h-full w-full items-center justify-center">
                            <Text style={{ color: playlistColor }} className="text-[20px]">
                                ♪
                            </Text>
                        </View>
                    )}

                    {isActive && isPlaying ? (
                        <View className="absolute inset-0 items-center justify-center bg-black/40">
                            <PlayingBars color="#D7FF00" />
                        </View>
                    ) : null}

                    {downloadStatus === 'downloaded' ? (
                        <View className="absolute bottom-0.5 right-0.5 h-4 w-4 items-center justify-center rounded-full bg-[#0B1F0E]">
                            <Check size={10} color="#D7FF00" />
                        </View>
                    ) : null}
                </View>

                <View className="mr-3 min-w-0 flex-1">
                    <Text
                        className={`text-[14px] font-semibold ${isActive ? 'text-[#D7FF00]' : 'text-[#F2F5EE]'}`}
                        numberOfLines={1}
                    >
                        {recording.podcast_title || formatRecordingDate(recording.started_at)}
                    </Text>

                    <View className="mt-1 flex-row items-center gap-2">
                        <Text className="shrink text-[11px] text-[#8FA396]" numberOfLines={1}>
                            {recording.podcast_title ? formatRecordingDate(recording.started_at) : 'Sermon recording'}
                        </Text>
                        {recording.duration_seconds ? (
                            <>
                                <View className="h-[3px] w-[3px] rounded-full bg-[#8FA396]" />
                                <Text className="text-[11px] text-[#8FA396]">
                                    {formatDuration(recording.duration_seconds)}
                                </Text>
                            </>
                        ) : null}
                    </View>

                    {recording.playlist ? (
                        <View
                            className="mt-1.5 self-start rounded-full px-2 py-[3px]"
                            style={{ backgroundColor: `${playlistColor}20` }}
                        >
                            <Text className="text-[9px] font-semibold" style={{ color: playlistColor }}>
                                {recording.playlist}
                            </Text>
                        </View>
                    ) : null}
                </View>

                <View className="flex-row items-center gap-2">
                    {isAdmin && onPublishToggle && (
                        <Pressable
                            onPress={() => onPublishToggle(recording)}
                            className="h-9 w-9 items-center justify-center rounded-full bg-[#184832]"
                            hitSlop={8}
                        >
                            {recording.publish ? (
                                <GlobeOff size={15} color="#D7FF00" />
                            ) : (
                                <Globe size={15} color="#8FA396" />
                            )}
                        </Pressable>
                    )}
                    {isAdmin && onDelete && (
                        <Pressable
                            onPress={() => onDelete(recording)}
                            className="h-9 w-9 items-center justify-center rounded-full bg-[#5A2020]"
                            hitSlop={8}
                        >
                            <Trash2 size={15} color="#FFB4A9" />
                        </Pressable>
                    )}

                    <Pressable
                        onPress={handlePress}
                        disabled={isLoading}
                        className="h-10 w-10 items-center justify-center rounded-full bg-[#D7FF00]"
                        hitSlop={8}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#143703" />
                        ) : isActive && isPlaying ? (
                            <Pause size={16} color="#143703" fill="#143703" />
                        ) : (
                            <Play size={16} color="#143703" fill="#143703" />
                        )}
                    </Pressable>
                </View>
            </View>

            {/* Mini progress line - a quiet, always-visible reminder of where
                the currently-open recording is, even while browsing the rest
                of the list. */}
            {isActive && typeof progress === 'number' ? (
                <View className="h-[3px] w-full bg-black/20">
                    <View
                        className="h-full bg-[#D7FF00]"
                        style={{ width: `${Math.min(1, Math.max(0, progress)) * 100}%` }}
                    />
                </View>
            ) : null}
        </Pressable>
    )
}

/** A tiny animated "now playing" equalizer, replacing the pause icon in the
 * leading slot for the active-and-playing row - a common, quickly-recognized
 * cue (Spotify, Apple Music) that something in the list is live right now. */
function PlayingBars({ color }: { color: string }) {
    const bars = [
        useRef(new Animated.Value(0.4)).current,
        useRef(new Animated.Value(0.9)).current,
        useRef(new Animated.Value(0.6)).current,
    ]

    useEffect(() => {
        const loops = bars.map((bar, i) =>
            Animated.loop(
                Animated.sequence([
                    Animated.timing(bar, {
                        toValue: 1,
                        duration: 420 + i * 90,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: false,
                    }),
                    Animated.timing(bar, {
                        toValue: 0.25,
                        duration: 420 + i * 90,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: false,
                    }),
                ])
            )
        )
        loops.forEach((loop) => loop.start())
        return () => loops.forEach((loop) => loop.stop())
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <View className="h-4 flex-row items-end gap-[2px]">
            {bars.map((bar, i) => (
                <Animated.View
                    key={i}
                    className="w-[3px] rounded-full"
                    style={{
                        height: bar.interpolate({ inputRange: [0, 1], outputRange: ['20%', '100%'] }),
                        backgroundColor: color,
                    }}
                />
            ))}
        </View>
    )
}

export default memo(RecordingItem)
