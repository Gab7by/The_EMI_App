// app/(tabs)/library/index.tsx (or wherever your library screen lives)
import { View, Text, ScrollView, RefreshControl, Modal, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRecordingPlayer } from '@/hooks/useRecordingPlayer'
import { LinearGradient } from 'expo-linear-gradient'
import { getRecordings, toggleRecordingPublish } from '@/lib/recording'
import { useAuthStore } from '@/store/authStore'
import { useState, useCallback } from 'react'
import RecordingItem from '@/components/recording/RecordingItem'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function LibraryScreen() {
    const profile = useAuthStore((state) => state.profile)
    const isAdmin = profile?.role === 'admin'
    const queryClient = useQueryClient()
    const [showDisclaimer, setShowDisclaimer] = useState(!isAdmin)
    const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)

    const { data: recordings = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['recordings', isAdmin ? 'admin' : 'member'],
        queryFn: () => getRecordings(isAdmin),
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

    const handlePublishToggle = useCallback(async (recordingId: string, currentPublish: boolean) => {
        const success = await toggleRecordingPublish(recordingId, currentPublish)
        if (success) {
            queryClient.invalidateQueries({ queryKey: ['recordings'] })
        }
    }, [queryClient])

    const handleAcceptDisclaimer = useCallback(() => {
        setShowDisclaimer(false)
        setDisclaimerAccepted(true)
    }, [])

    const visibleRecordings = showDisclaimer ? [] : recordings

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

                    {/* Disclaimer Modal for members */}
                    <Modal
                        visible={showDisclaimer}
                        transparent
                        animationType="fade"
                        onRequestClose={handleAcceptDisclaimer}
                        statusBarTranslucent
                    >
                        <View className="flex-1 items-center justify-center px-6">
                            <View className="w-full max-w-[340px] rounded-[24px] border border-[#D7FF00]/20 bg-[#0E2B08] px-6 py-8">
                                <View className="h-[64px] w-[64px] items-center justify-center rounded-full bg-[#D7FF00]/15 mx-auto mb-5">
                                    <MaterialCommunityIcons
                                        name="information-outline"
                                        size={32}
                                        color="#D7FF00"
                                    />
                                </View>

                                <Text className="text-[18px] font-bold text-[#F4F5F0] text-center mb-3">
                                    Feature In Progress
                                </Text>

                                <Text className="text-[13px] leading-6 text-[#B7C0BC] text-center mb-6">
                                    The recordings feature is still under development. Some recordings may not play correctly or may have limited functionality. If you'd like to test it out, feel free to proceed.
                                </Text>

                                <Pressable
                                    onPress={handleAcceptDisclaimer}
                                    className="items-center rounded-[16px] bg-[#D7FF00] px-4 py-3.5"
                                >
                                    <Text className="text-[14px] font-semibold text-[#143703]">
                                        Continue to Test
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </Modal>

                    {isLoading ? (
                        <View className="flex-1 items-center justify-center">
                            <Text className="text-[#B7C0BC]">Loading recordings...</Text>
                        </View>
                    ) : visibleRecordings.length === 0 ? (
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
                            {visibleRecordings.map((recording) => (
                                <RecordingItem
                                    key={recording.id}
                                    recording={recording}
                                    isActive={activeRecordingId === recording.id}
                                    isPlaying={activeRecordingId === recording.id && isPlaying}
                                    isLoading={loadingId === recording.id}
                                    currentTime={activeRecordingId === recording.id ? currentTime : 0}
                                    duration={activeRecordingId === recording.id ? duration : 0}
                                    isAdmin={isAdmin}
                                    onPlay={() => handlePlay(recording)}
                                    onToggle={togglePlayPause}
                                    onStop={handleStop}
                                    onSeek={seekTo}
                                    onPublishToggle={isAdmin ? () => handlePublishToggle(recording.id, recording.publish) : undefined}
                                />
                            ))}
                        </ScrollView>
                    )}
                </View>
            </SafeAreaView>
        </LinearGradient>
    )
}