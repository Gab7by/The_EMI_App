import { formatDuration, formatRecordingDate } from '@/lib/formatters'
import { hapticLight, hapticMedium } from '@/lib/haptics'
import { getPlaylistColor } from '@/lib/recording-ui'
import { Recording } from '@/types/podcast-types'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useRef } from 'react'
import { Animated, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AudioProgressBar from './AudioProgressBar'

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
    const playlistColor = getPlaylistColor(recording.playlist)

    // A slow breathing glow behind the artwork while playing - the same
    // "this is live audio" cue used on the live-podcast speaker bubbles,
    // reused here for a consistent, quieter version of the same idea.
    const breathe = useRef(new Animated.Value(0)).current
    useEffect(() => {
        if (!isPlaying) {
            breathe.stopAnimation()
            breathe.setValue(0)
            return
        }
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(breathe, { toValue: 1, duration: 1400, useNativeDriver: true }),
                Animated.timing(breathe, { toValue: 0, duration: 1400, useNativeDriver: true }),
            ])
        )
        loop.start()
        return () => loop.stop()
    }, [isPlaying, breathe])

    const handleClose = () => {
        hapticMedium()
        onStop()
        onClose()
    }

    const handleSpeedSelect = (rate: number) => {
        if (rate === playbackRate) return
        hapticLight()
        onSetPlaybackRate(rate)
    }

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <LinearGradient
                colors={["#0B1F0E", "#143703", "#0B1F0E"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{ flex: 1 }}
            >
                <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-4 pt-2 pb-2">
                        <Pressable
                            onPress={handleClose}
                            className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
                            hitSlop={12}
                        >
                            <MaterialCommunityIcons name="chevron-down" size={24} color="#D7FF00" />
                        </Pressable>

                        <View className="flex-1 items-center">
                            <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8FA396]">
                                Now Playing
                            </Text>
                        </View>

                        <View className="h-10 w-10" />
                    </View>

                    <View className="flex-1 items-center justify-center px-6">
                        {/* Artwork */}
                        <View className="items-center justify-center" style={{ height: 232, width: 232 }}>
                            <Animated.View
                                pointerEvents="none"
                                className="absolute rounded-[36px]"
                                style={{
                                    height: 232,
                                    width: 232,
                                    backgroundColor: playlistColor,
                                    opacity: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.24] }),
                                    transform: [{ scale: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.04] }) }],
                                }}
                            />
                            <View
                                className="items-center justify-center rounded-[28px] bg-[#132A19]"
                                style={{
                                    height: 208,
                                    width: 208,
                                    shadowColor: '#000',
                                    shadowOpacity: 0.35,
                                    shadowRadius: 16,
                                    shadowOffset: { width: 0, height: 8 },
                                    elevation: 10,
                                }}
                            >
                                <MaterialCommunityIcons name="waveform" size={64} color={playlistColor} />
                            </View>
                        </View>

                        {/* Playlist tag */}
                        {recording.playlist ? (
                            <View
                                className="mt-5 self-center rounded-full px-3.5 py-1.5"
                                style={{ backgroundColor: `${playlistColor}22` }}
                            >
                                <Text className="text-[11px] font-semibold" style={{ color: playlistColor }}>
                                    {recording.playlist}
                                </Text>
                            </View>
                        ) : null}

                        {/* Title */}
                        <Text className="mt-3 text-center text-[19px] font-bold text-[#F4F5F0]" numberOfLines={2}>
                            {recording.podcast_title || 'Untitled Recording'}
                        </Text>

                        {/* Date + duration */}
                        <Text className="mt-1.5 text-[12px] text-[#8FA396]">
                            {formatRecordingDate(recording.started_at)}
                            {recording.duration_seconds ? `  ·  ${formatDuration(recording.duration_seconds)}` : ''}
                        </Text>

                        {/* Progress */}
                        <View className="mt-8 w-full">
                            <AudioProgressBar currentTime={currentTime} duration={duration} onSeek={onSeek} />
                        </View>

                        {/* Speed picker - a persistent, always-visible segmented row
                            instead of a single badge you had to blind-tap-cycle
                            through six values to discover. */}
                        <View className="mt-5 flex-row items-center justify-center gap-1.5 rounded-full bg-black/20 p-1">
                            {SPEED_OPTIONS.map((rate) => {
                                const isActive = rate === playbackRate
                                return (
                                    <Pressable
                                        key={rate}
                                        onPress={() => handleSpeedSelect(rate)}
                                        className="rounded-full px-2.5 py-1.5"
                                        style={{ backgroundColor: isActive ? '#D7FF00' : 'transparent' }}
                                    >
                                        <Text
                                            className="text-[11px] font-semibold"
                                            style={{ color: isActive ? '#143703' : '#B7C0BC' }}
                                        >
                                            {rate}x
                                        </Text>
                                    </Pressable>
                                )
                            })}
                        </View>

                        {/* Main controls */}
                        <View className="mt-7 flex-row items-center justify-center gap-6">
                            <TouchableOpacity
                                onPress={() => { hapticLight(); onSeek(Math.max(0, currentTime - 15)) }}
                                className="h-11 w-11 items-center justify-center rounded-full bg-white/10"
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons name="rewind-15" size={22} color="#F4F5F0" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={onPrevious}
                                disabled={!hasPrevious}
                                className="h-14 w-14 items-center justify-center rounded-full"
                                style={{ backgroundColor: hasPrevious ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons
                                    name="skip-backward"
                                    size={24}
                                    color={hasPrevious ? '#F4F5F0' : '#4C5A50'}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={onToggle}
                                disabled={!isLoaded}
                                className="h-20 w-20 items-center justify-center rounded-full bg-[#D7FF00]"
                                activeOpacity={0.85}
                                style={{
                                    shadowColor: '#D7FF00',
                                    shadowOpacity: 0.4,
                                    shadowRadius: 14,
                                    shadowOffset: { width: 0, height: 4 },
                                    elevation: 8,
                                }}
                            >
                                {!isLoaded ? (
                                    <MaterialCommunityIcons name="dots-horizontal" size={30} color="#143703" />
                                ) : (
                                    <MaterialCommunityIcons name={isPlaying ? 'pause' : 'play'} size={34} color="#143703" />
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={onNext}
                                disabled={!hasNext}
                                className="h-14 w-14 items-center justify-center rounded-full"
                                style={{ backgroundColor: hasNext ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons
                                    name="skip-forward"
                                    size={24}
                                    color={hasNext ? '#F4F5F0' : '#4C5A50'}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => { hapticLight(); onSeek(Math.min(duration, currentTime + 15)) }}
                                className="h-11 w-11 items-center justify-center rounded-full bg-white/10"
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons name="fast-forward-15" size={22} color="#F4F5F0" />
                            </TouchableOpacity>
                        </View>

                        {/* Stop */}
                        <TouchableOpacity
                            onPress={() => { hapticLight(); onStop() }}
                            className="mt-8 flex-row items-center gap-2 rounded-full bg-white/[0.06] px-5 py-2.5"
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons name="stop" size={14} color="#8FA396" />
                            <Text className="text-[12px] font-semibold text-[#8FA396]">
                                Stop playback
                            </Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        </Modal>
    )
}
