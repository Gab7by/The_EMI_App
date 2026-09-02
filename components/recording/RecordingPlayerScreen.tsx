import { formatDuration, formatRecordingDate } from '@/lib/formatters'
import { hapticLight, hapticMedium } from '@/lib/haptics'
import { getPlaylistColor } from '@/lib/recording-ui'
import { Recording } from '@/types/podcast-types'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useRef } from 'react'
import { Animated, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AudioProgressBar from './AudioProgressBar'
import DownloadButton from './DownloadButton'

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

    // "Minimize" (the chevron and the hardware back button) should only
    // hide the full-screen player - playback keeps going and the mini
    // player takes over, exactly like every other media app. It was
    // previously calling onStop() first, which fully stopped playback and
    // cleared the active recording - so there was nothing left for the mini
    // player to show, and this button behaved like "stop" wearing a
    // minimize icon. Actually stopping is now only ever the dedicated
    // "Stop playback" button below.
    const handleMinimize = () => {
        hapticMedium()
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
            onRequestClose={handleMinimize}
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
                            onPress={handleMinimize}
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

                        <DownloadButton recording={recording} />
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
                                className="items-center justify-center overflow-hidden rounded-[28px] bg-[#132A19]"
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
                                {recording.coverImageUrl ? (
                                    <Image
                                        source={{ uri: recording.coverImageUrl }}
                                        style={{ height: '100%', width: '100%' }}
                                        contentFit="cover"
                                        transition={200}
                                    />
                                ) : (
                                    <MaterialCommunityIcons name="waveform" size={64} color={playlistColor} />
                                )}
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

                        {/* Main controls - justify-between + no fixed gap so this
                            row can never overflow a narrow screen. It used to be
                            justify-center with a fixed 24px gap between 5 fixed-size
                            buttons, which added up to wider than a typical phone's
                            available width and pushed rewind-15 off the left edge. */}
                        <View className="mt-7 w-full flex-row items-center justify-between px-1">
                            <TouchableOpacity
                                onPress={() => { hapticLight(); onSeek(Math.max(0, currentTime - 15)) }}
                                className="h-11 w-11 items-center justify-center rounded-full bg-white/10"
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons name="rewind-15" size={20} color="#F4F5F0" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={onPrevious}
                                disabled={!hasPrevious}
                                className="h-12 w-12 items-center justify-center rounded-full"
                                style={{ backgroundColor: hasPrevious ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons
                                    name="skip-backward"
                                    size={22}
                                    color={hasPrevious ? '#F4F5F0' : '#4C5A50'}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={onToggle}
                                disabled={!isLoaded}
                                className="h-[72px] w-[72px] items-center justify-center rounded-full bg-[#D7FF00]"
                                activeOpacity={0.85}
                                style={{
                                    shadowColor: '#D7FF00',
                                    shadowOpacity: 0.4,
                                    shadowRadius: 14,
                                    shadowOffset: { width: 0, height: 4 },
                                    elevation: 8,
                                }}
                            >
                                {!isLoaded ? <LoadingDots /> : (
                                    <MaterialCommunityIcons name={isPlaying ? 'pause' : 'play'} size={32} color="#143703" />
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={onNext}
                                disabled={!hasNext}
                                className="h-12 w-12 items-center justify-center rounded-full"
                                style={{ backgroundColor: hasNext ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons
                                    name="skip-forward"
                                    size={22}
                                    color={hasNext ? '#F4F5F0' : '#4C5A50'}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => { hapticLight(); onSeek(Math.min(duration, currentTime + 15)) }}
                                className="h-11 w-11 items-center justify-center rounded-full bg-white/10"
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons name="fast-forward-15" size={20} color="#F4F5F0" />
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

/** A pulsating three-dot indicator for the center button while a recording
 * is still loading - the old static dots-horizontal glyph didn't read as
 * "busy," it just looked like a different icon had been swapped in. */
function LoadingDots() {
    const dots = [
        useRef(new Animated.Value(0.3)).current,
        useRef(new Animated.Value(0.3)).current,
        useRef(new Animated.Value(0.3)).current,
    ]

    useEffect(() => {
        const loops = dots.map((dot, i) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(i * 150),
                    Animated.timing(dot, { toValue: 1, duration: 380, useNativeDriver: true }),
                    Animated.timing(dot, { toValue: 0.3, duration: 380, useNativeDriver: true }),
                    Animated.delay((2 - i) * 150),
                ])
            )
        )
        loops.forEach((loop) => loop.start())
        return () => loops.forEach((loop) => loop.stop())
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <View className="flex-row items-center gap-1.5">
            {dots.map((dot, i) => (
                <Animated.View
                    key={i}
                    className="h-2.5 w-2.5 rounded-full bg-[#143703]"
                    style={{
                        opacity: dot,
                        transform: [{ scale: dot.interpolate({ inputRange: [0.3, 1], outputRange: [0.7, 1] }) }],
                    }}
                />
            ))}
        </View>
    )
}
