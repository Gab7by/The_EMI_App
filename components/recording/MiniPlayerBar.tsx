import { getPlaylistColor } from '@/lib/recording-ui'
import { Recording } from '@/types/podcast-types'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { Pause, Play, X } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

interface MiniPlayerBarProps {
    recording: Recording
    isPlaying: boolean
    progress: number
    bottom: number
    onExpand: () => void
    onToggle: () => void
    onStop: () => void
}

/**
 * A persistent, Spotify/Podbean-style mini player. Without this, closing the
 * full "Now Playing" screen (the chevron-down button) left no way back to it
 * short of tapping a different recording - the currently-open one's row only
 * toggled play/pause inline. This bar stays pinned above the floating tab
 * bar for as long as something is loaded, and tapping it (anywhere but the
 * controls) reopens the full player.
 */
export default function MiniPlayerBar({
    recording,
    isPlaying,
    progress,
    bottom,
    onExpand,
    onToggle,
    onStop,
}: MiniPlayerBarProps) {
    const playlistColor = getPlaylistColor(recording.playlist)

    return (
        <View className="absolute left-4 right-4 overflow-hidden rounded-[20px] bg-[#123018]" style={{ bottom }}>
            <View className="h-[2px] w-full bg-black/25">
                <View className="h-full bg-[#D7FF00]" style={{ width: `${Math.min(1, Math.max(0, progress)) * 100}%` }} />
            </View>

            <Pressable onPress={onExpand} className="flex-row items-center px-3 py-2.5">
                <View className="mr-3 h-9 w-9 overflow-hidden rounded-xl" style={{ backgroundColor: `${playlistColor}25` }}>
                    {recording.coverImageUrl ? (
                        <Image
                            source={{ uri: recording.coverImageUrl }}
                            style={{ height: '100%', width: '100%' }}
                            contentFit="cover"
                        />
                    ) : (
                        <View className="h-full w-full items-center justify-center">
                            <MaterialCommunityIcons name="waveform" size={18} color={playlistColor} />
                        </View>
                    )}
                </View>

                <View className="mr-2 min-w-0 flex-1">
                    <Text className="text-[13px] font-semibold text-[#F2F5EE]" numberOfLines={1}>
                        {recording.podcast_title || 'Sermon recording'}
                    </Text>
                    {recording.playlist ? (
                        <Text className="mt-0.5 text-[10px] text-[#8FA396]" numberOfLines={1}>
                            {recording.playlist}
                        </Text>
                    ) : null}
                </View>

                <Pressable
                    onPress={onToggle}
                    hitSlop={8}
                    className="mr-1.5 h-9 w-9 items-center justify-center rounded-full bg-[#D7FF00]"
                >
                    {isPlaying ? (
                        <Pause size={15} color="#143703" fill="#143703" />
                    ) : (
                        <Play size={15} color="#143703" fill="#143703" />
                    )}
                </Pressable>

                <Pressable onPress={onStop} hitSlop={8} className="h-9 w-9 items-center justify-center rounded-full bg-white/10">
                    <X size={15} color="#B7C0BC" />
                </Pressable>
            </Pressable>
        </View>
    )
}
