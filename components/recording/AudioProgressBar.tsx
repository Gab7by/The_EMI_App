// components/AudioProgressBar.tsx
import { View, Pressable } from 'react-native'
import { Text } from 'react-native'
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
    // progress is a 0-1 value representing how far through the audio we are
    // We guard against division by zero with duration > 0 check

    return (
        <View>
            {/* Progress track — tappable to seek */}
            <Pressable
                onPress={(event) => {
                    if (!duration) return
                    // event.nativeEvent.locationX gives how many pixels
                    // from the left edge the user tapped
                    // We need to know the total width to calculate percentage
                    // Using a layout-based approach below
                }}
                className="py-2"
                // py-2 makes the tap target taller without changing visual size
                // easier to tap precisely on a thin bar
            >
                <View
                    className="h-1 w-full rounded-full bg-[#184832]"
                    // The grey background track
                    onLayout={(e) => {
                        // Store width in a ref for seek calculation
                        // We handle this in the parent to keep this component simple
                    }}
                >
                    {/* Filled portion showing progress */}
                    <View
                        className="h-1 rounded-full bg-[#D7FF00]"
                        style={{ width: `${progress * 100}%` }}
                    />

                    {/* Thumb dot at current position */}
                    <View
                        className="absolute top-1/2 h-3 w-3 -translate-y-1.5 rounded-full bg-[#D7FF00]"
                        style={{
                            left: `${progress * 100}%`,
                            marginLeft: -6,
                            // -6 = half of 12px width — centers the dot on the position
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