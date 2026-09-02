import { formatDuration } from '@/lib/formatters'
import { hapticLight } from '@/lib/haptics'
import { useEffect, useRef, useState } from 'react'
import { Animated, PanResponder, Text, View } from 'react-native'

interface AudioProgressBarProps {
    currentTime: number
    duration: number
    onSeek: (seconds: number) => void
}

/**
 * A tap-AND-drag scrubber. The previous version only supported tap-to-seek
 * (a Pressable's onPress fires once, on release, with no live feedback while
 * dragging) - which is most of what read as "seeking doesn't work properly"
 * on a component that visually looks like a draggable thumb.
 *
 * While actively dragging, the displayed position is fully decoupled from
 * the live `currentTime` prop (which keeps arriving from the player on its
 * own ~500ms cadence) - otherwise the thumb fights the user's finger,
 * snapping back toward the real playback position on every status update.
 * `onSeek` is only called once, on release.
 */
export default function AudioProgressBar({
    currentTime,
    duration,
    onSeek,
}: AudioProgressBarProps) {
    const [isScrubbing, setIsScrubbing] = useState(false)
    const [scrubProgress, setScrubProgress] = useState(0)

    const trackWidthRef = useRef(0)
    const startProgressRef = useRef(0)
    const scrubProgressRef = useRef(0)
    const durationRef = useRef(duration)
    const onSeekRef = useRef(onSeek)
    const thumbScale = useRef(new Animated.Value(1)).current

    useEffect(() => { durationRef.current = duration }, [duration])
    useEffect(() => { onSeekRef.current = onSeek }, [onSeek])

    const liveProgress = duration > 0 ? Math.min(1, currentTime / duration) : 0
    const displayedProgress = isScrubbing ? scrubProgress : liveProgress
    const displayedTime = isScrubbing ? scrubProgress * duration : currentTime

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_evt, gestureState) => Math.abs(gestureState.dx) > 2,
            onPanResponderGrant: () => {
                hapticLight()
                startProgressRef.current = liveProgress
                scrubProgressRef.current = liveProgress
                setScrubProgress(liveProgress)
                setIsScrubbing(true)
                Animated.spring(thumbScale, { toValue: 1.5, useNativeDriver: true, friction: 6 }).start()
            },
            onPanResponderMove: (_evt, gestureState) => {
                if (trackWidthRef.current === 0) return
                const next = clamp01(startProgressRef.current + gestureState.dx / trackWidthRef.current)
                scrubProgressRef.current = next
                setScrubProgress(next)
            },
            onPanResponderRelease: () => finishScrub(),
            onPanResponderTerminate: () => finishScrub(),
        })
    ).current

    const finishScrub = () => {
        Animated.spring(thumbScale, { toValue: 1, useNativeDriver: true, friction: 6 }).start()
        setIsScrubbing(false)
        if (durationRef.current > 0) {
            onSeekRef.current(scrubProgressRef.current * durationRef.current)
        }
    }

    return (
        <View>
            <View
                {...panResponder.panHandlers}
                className="justify-center py-4"
                onLayout={(e) => { trackWidthRef.current = e.nativeEvent.layout.width }}
            >
                <View className="h-[3px] w-full overflow-hidden rounded-full bg-white/15">
                    <View
                        className="h-full rounded-full bg-[#D7FF00]"
                        style={{ width: `${displayedProgress * 100}%` }}
                    />
                </View>

                {/* Thumb - a larger invisible touch target around a small visible dot,
                    so scrubbing is comfortable without the track itself looking heavy. */}
                <Animated.View
                    pointerEvents="none"
                    className="absolute h-5 w-5 items-center justify-center rounded-full"
                    style={{
                        left: `${displayedProgress * 100}%`,
                        marginLeft: -10,
                        transform: [{ scale: thumbScale }],
                    }}
                >
                    <View
                        className="h-3 w-3 rounded-full bg-[#D7FF00]"
                        style={{
                            shadowColor: '#D7FF00',
                            shadowOpacity: isScrubbing ? 0.8 : 0,
                            shadowRadius: 6,
                            shadowOffset: { width: 0, height: 0 },
                        }}
                    />
                </Animated.View>
            </View>

            {/* Time display - while scrubbing, the left label previews where
                release would land, so dragging gives real-time feedback. */}
            <View className="flex-row justify-between">
                <Text className={`text-[11px] ${isScrubbing ? 'font-semibold text-[#D7FF00]' : 'text-[#B7C0BC]'}`}>
                    {formatDuration(displayedTime)}
                </Text>
                <Text className="text-[11px] text-[#B7C0BC]">
                    {formatDuration(duration)}
                </Text>
            </View>
        </View>
    )
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
