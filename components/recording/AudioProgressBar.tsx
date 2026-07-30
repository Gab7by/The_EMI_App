import { View, Pressable, Text } from 'react-native'
import { useRef } from 'react'
import { formatDuration } from '@/lib/formatters'

interface AudioProgressBarProps {
    currentTime: number
    duration: number
    onSeek: (seconds: number) => void
}

export default function AudioProgressBar({
    currentTime,
    duration,
    onSeek,
}: AudioProgressBarProps) {
    const progress = duration > 0 ? currentTime / duration : 0
    const trackWidthRef = useRef<number>(0)

    return (
        <View>
            {/* Progress track — tappable to seek */}
            <Pressable
                onPress={(event) => {
                    if (!duration || trackWidthRef.current === 0) return
                    const { locationX } = event.nativeEvent
                    const seekSeconds = (locationX / trackWidthRef.current) * duration
                    onSeek(seekSeconds)
                }}
                className="py-3"
            >
                <View
                    className="h-1.5 w-full rounded-full bg-[#184832]"
                    onLayout={(e) => {
                        trackWidthRef.current = e.nativeEvent.layout.width
                    }}
                >
                    {/* Filled portion showing progress */}
                    <View
                        className="h-full rounded-full bg-[#D7FF00]"
                        style={{ width: `${progress * 100}%` }}
                    />

                    {/* Thumb dot at current position */}
                    <View
                        className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#D7FF00]"
                        style={{
                            left: `${progress * 100}%`,
                            marginLeft: -8,
                        }}
                    />
                </View>
            </Pressable>

            {/* Time display */}
            <View className="flex-row justify-between mt-1">
                <Text className="text-[11px] text-[#B7C0BC]">
                    {formatDuration(currentTime)}
                </Text>
                <Text className="text-[11px] text-[#B7C0BC]">
                    {formatDuration(duration)}
                </Text>
            </View>
        </View>
    )
}
