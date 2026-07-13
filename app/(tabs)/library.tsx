// app/(tabs)/library/index.tsx (or wherever your library screen lives)
import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { useRecordingPlayer } from '@/hooks/useRecordingPlayer'
import { LinearGradient } from 'expo-linear-gradient'
import { getRecordings } from '@/lib/recording'
import { useState } from 'react'
import RecordingItem from '@/components/recording/RecordingItem'

export default function LibraryScreen() {
    const { data: recordings = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['recordings'],
        queryFn: getRecordings,
        staleTime: 5 * 60 * 1000,
        // cache for 5 minutes — recordings do not change frequently
        // user can pull to refresh to force a new fetch
    })

    const {
        playRecording,
        togglePlayPause,
        seekTo,
        stop,
        isPlaying,
        currentTime,
        duration,
        loadingId,
        currentUrl,
        isLoaded,
    } = useRecordingPlayer()

    // Track which recording is currently active by matching the URL
    // We cannot match by ID directly since the player only knows about URLs
    // So we track which recording's URL is currently loaded
    const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null)

    async function handlePlay(recording: typeof recordings[0]) {
        setActiveRecordingId(recording.id)
        await playRecording(recording.id, recording.file_path)
    }

    function handleStop() {
        stop()
        setActiveRecordingId(null)
    }

    return (
        <LinearGradient
            colors={["#0d1f12", "#143703", "#0d1f12"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
        >
            <SafeAreaView className="flex-1">
                <View className="flex-1 px-4 pt-4">

                    {/* Header */}
                    <Text className="text-[22px] font-bold text-[#D7FF00] mb-6">
                        Recordings
                    </Text>

                    {isLoading ? (
                        <View className="flex-1 items-center justify-center">
                            <Text className="text-[#B7C0BC]">Loading recordings...</Text>
                        </View>
                    ) : recordings.length === 0 ? (
                        <View className="flex-1 items-center justify-center">
                            <Text className="text-[#B7C0BC] text-center">
                                No recordings yet.{'\n'}
                                Sessions will appear here after they are recorded.
                            </Text>
                        </View>
                    ) : (
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 100 }}
                            refreshControl={
                                <RefreshControl
                                    refreshing={isRefetching}
                                    onRefresh={refetch}
                                    tintColor="#D7FF00"
                                    // pull down to refresh the recordings list
                                />
                            }
                        >
                            {recordings.map((recording) => (
                                <RecordingItem
                                    key={recording.id}
                                    recording={recording}
                                    isActive={activeRecordingId === recording.id}
                                    isPlaying={activeRecordingId === recording.id && isPlaying}
                                    isLoading={loadingId === recording.id}
                                    currentTime={activeRecordingId === recording.id ? currentTime : 0}
                                    duration={activeRecordingId === recording.id ? duration : 0}
                                    onPlay={() => handlePlay(recording)}
                                    onToggle={togglePlayPause}
                                    onStop={handleStop}
                                    onSeek={seekTo}
                                />
                            ))}
                        </ScrollView>
                    )}
                </View>
            </SafeAreaView>
        </LinearGradient>
    )
}