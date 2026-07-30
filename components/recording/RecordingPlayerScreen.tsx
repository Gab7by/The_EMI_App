import { View, Text, Pressable, Modal, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { formatDuration, formatRecordingDate } from '@/lib/formatters'
import { Recording, Playlist, PLAYLISTS } from '@/types/podcast-types'
import AudioProgressBar from './AudioProgressBar'
import { hapticMedium } from '@/lib/haptics'

interface RecordingPlayerScreenProps {
    visible: boolean
    recording: Recording
    recordings: Recording[]
    currentIndex: number
    isPlaying: boolean
    currentTime: number
    duration: number
    isLoaded: boolean
    playbackRate: number
    onClose: () => void
    onToggle: () => void
    onSeek: (seconds: number) => void
    onSetPlaybackRate: (rate: number) => void
    onNext: () => void
    onPrevious: () => void
    onStop: () => void
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2]

const PLAYLIST_COLORS: Record<string, string> = {
    'Lunch Prayer Fire': '#FF6B35',
    'Priesthood Time': '#4D96FF',
    'School of the Prophets': '#9B51E0',
    'School of Spiritual Mysteries': '#00C9A6',
    'Mega One Word From the Lord': '#FFD700',
    '45 minutes in Tongues': '#FF4B5F',
}

export default function RecordingPlayerScreen({
    visible,
    recording,
    recordings,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    isLoaded,
    playbackRate,
    onClose,
    onToggle,
    onSeek,
    onSetPlaybackRate,
    onNext,
    onPrevious,
    onStop,
}: RecordingPlayerScreenProps) {
    const hasPrevious = currentIndex > 0
    const hasNext = currentIndex < recordings.length - 1

    const playlistColor = recording.playlist
        ? (PLAYLIST_COLORS[recording.playlist] ?? '#D7FF00')
        : '#D7FF00'

    const handleSpeedPress = () => {
        hapticMedium()
        const currentIndex = SPEED_OPTIONS.indexOf(playbackRate)
        const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length
        onSetPlaybackRate(SPEED_OPTIONS[nextIndex])
    }

    const handleClose = () => {
        hapticMedium()
        onStop()
        onClose()
    }

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="fade"
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <LinearGradient
                colors={["#0B1F0E", "#143703", "#0B1F0E"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{ flex: 1 }}
            >
                <SafeAreaView className="flex-1">
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-4 pt-2 pb-4">
                        <Pressable
                            onPress={handleClose}
                            className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
                            hitSlop={12}
                        >
                            <MaterialCommunityIcons
                                name="chevron-down"
                                size={24}
                                color="#D7FF00"
                            />
                        </Pressable>

                        <View className="flex-1 items-center">
                            <Text className="text-[16px] font-bold text-[#F4F5F0]" numberOfLines={1}>
                                Now Playing
                            </Text>
                        </View>

                        <View className="h-10 w-10" />
                    </View>

                    {/* Cover Art Area */}
                    <View className="items-center px-6 py-8">
                        <View
                            className="items-center justify-center rounded-[28px] bg-[#1a3a10] px-8 py-10"
                            style={{
                                width: 200,
                                height: 200,
                                shadowColor: playlistColor,
                                shadowOpacity: 0.3,
                                shadowRadius: 20,
                                shadowOffset: { width: 0, height: 0 },
                                elevation: 15,
                            }}
                        >
                            <MaterialCommunityIcons
                                name="music-note"
                                size={72}
                                color={playlistColor}
                            />
                        </View>

                        {/* Playlist tag */}
                        {recording.playlist ? (
                            <View
                                className="mt-4 rounded-full px-4 py-1.5"
                                style={{ backgroundColor: `${playlistColor}20` }}
                            >
                                <Text
                                    className="text-[11px] font-semibold"
                                    style={{ color: playlistColor }}
                                >
                                    {recording.playlist}
                                </Text>
                            </View>
                        ) : null}

                        {/* Title */}
                        <Text className="mt-3 text-center text-[18px] font-bold text-[#F4F5F0]" numberOfLines={2}>
                            {recording.podcast_title || 'Untitled Recording'}
                        </Text>

                        {/* Date */}
                        <Text className="mt-1 text-[13px] text-[#B7C0BC]">
                            {formatRecordingDate(recording.started_at)}
                        </Text>

                        {/* Duration */}
                        {recording.duration_seconds ? (
                            <Text className="mt-1 text-[12px] text-[#B7C0BC]">
                                {formatDuration(recording.duration_seconds)}
                            </Text>
                        ) : null}
                    </View>

                    {/* Progress Bar */}
                    <View className="px-6">
                        <AudioProgressBar
                            currentTime={currentTime}
                            duration={duration}
                            onSeek={onSeek}
                        />
                    </View>

                    {/* Playback Controls */}
                    <View className="mt-6 items-center">
                        {/* Speed indicator */}
                        <TouchableOpacity
                            onPress={handleSpeedPress}
                            className="mb-4 rounded-full bg-white/10 px-4 py-1.5"
                            activeOpacity={0.7}
                        >
                            <Text className="text-[12px] font-semibold text-[#D7FF00]">
                                {playbackRate.toFixed(2)}x
                            </Text>
                        </TouchableOpacity>

                        {/* Main controls */}
                        <View className="flex-row items-center justify-center gap-8">
                            {/* Previous */}
                            <TouchableOpacity
                                onPress={onPrevious}
                                disabled={!hasPrevious}
                                className={`h-14 w-14 items-center justify-center rounded-full ${
                                    hasPrevious ? 'bg-[#D7FF00]' : 'bg-white/10'
                                }`}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons
                                    name="skip-backward"
                                    size={22}
                                    color={hasPrevious ? "#143703" : "#6F7C73"}
                                />
                            </TouchableOpacity>

                            {/* Play/Pause */}
                            <TouchableOpacity
                                onPress={onToggle}
                                disabled={!isLoaded}
                                className="h-18 w-18 items-center justify-center rounded-full bg-[#D7FF00]"
                                activeOpacity={0.8}
                            >
                                {isPlaying ? (
                                    <MaterialCommunityIcons
                                        name="pause"
                                        size={32}
                                        color="#143703"
                                    />
                                ) : (
                                    <MaterialCommunityIcons
                                        name="play"
                                        size={32}
                                        color="#143703"
                                    />
                                )}
                            </TouchableOpacity>

                            {/* Next */}
                            <TouchableOpacity
                                onPress={onNext}
                                disabled={!hasNext}
                                className={`h-14 w-14 items-center justify-center rounded-full ${
                                    hasNext ? 'bg-[#D7FF00]' : 'bg-white/10'
                                }`}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons
                                    name="skip-forward"
                                    size={22}
                                    color={hasNext ? "#143703" : "#6F7C73"}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Stop button */}
                        <TouchableOpacity
                            onPress={onStop}
                            className="mt-6 flex-row items-center gap-2 rounded-full bg-[#184832] px-6 py-2.5"
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name="stop"
                                size={16}
                                color="#B7C0BC"
                            />
                            <Text className="text-[13px] font-semibold text-[#B7C0BC]">
                                Stop
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Playlist Tags at bottom */}
                    <View className="mt-auto px-4 pb-6">
                        <Text className="mb-3 text-[11px] font-semibold uppercase tracking-[1px] text-[#B7C0BC]">
                            All Playlists
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {PLAYLISTS.map((playlist) => {
                                const color = PLAYLIST_COLORS[playlist] ?? '#D7FF00'
                                const isCurrent = recording.playlist === playlist
                                return (
                                    <View
                                        key={playlist}
                                        className={`rounded-full px-3.5 py-1.5 ${
                                            isCurrent ? 'bg-[#D7FF00]/20' : 'bg-white/5'
                                        }`}
                                    >
                                        <Text
                                            className={`text-[11px] font-medium ${
                                                isCurrent ? 'text-[#D7FF00]' : 'text-[#B7C0BC]'
                                            }`}
                                            style={isCurrent ? { color: color } : undefined}
                                        >
                                            {playlist}
                                        </Text>
                                    </View>
                                )
                            })}
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        </Modal>
    )
}
