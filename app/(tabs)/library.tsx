import { View, Text, ScrollView, RefreshControl, Modal, Pressable, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRecordingPlayer } from '@/hooks/useRecordingPlayer'
import { LinearGradient } from 'expo-linear-gradient'
import { getRecordings, toggleRecordingPublish } from '@/lib/recording'
import { useAuthStore } from '@/store/authStore'
import { useState, useCallback, useMemo } from 'react'
import RecordingItem from '@/components/recording/RecordingItem'
import RecordingPlayerScreen from '@/components/recording/RecordingPlayerScreen'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { PLAYLISTS } from '@/types/podcast-types'
import { hapticMedium } from '@/lib/haptics'

export default function LibraryScreen() {
    const profile = useAuthStore((state) => state.profile)
    const isAdmin = profile?.role === 'admin'
    const queryClient = useQueryClient()
    const [showDisclaimer, setShowDisclaimer] = useState(!isAdmin)
    const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
    const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null)
    const [playerVisible, setPlayerVisible] = useState(false)
    const [activeRecording, setActiveRecording] = useState<any>(null)

    const { data: recordings = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['recordings', isAdmin ? 'admin' : 'member'],
        queryFn: () => getRecordings(isAdmin),
        staleTime: 5 * 60 * 1000,
    })

    const {
        playRecording,
        loadRecording,
        togglePlayPause,
        seekTo,
        stop,
        setPlaybackRate,
        playNext,
        playPrevious,
        isPlaying,
        currentTime,
        duration,
        isLoaded,
        loadingId,
        playbackRate,
        currentIndex,
        setRecordings,
    } = useRecordingPlayer()

    // Filter recordings by selected playlist
    const filteredRecordings = useMemo(() => {
        if (!selectedPlaylist) return recordings
        return recordings.filter(r => r.playlist === selectedPlaylist)
    }, [recordings, selectedPlaylist])

    // Update the player's recordings list when filtered recordings change
    const handlePlay = useCallback(async (recording: any, index: number) => {
        setActiveRecording(recording)
        setPlayerVisible(true)
        setRecordings(filteredRecordings)
        await loadRecording(recording, index)
    }, [filteredRecordings, loadRecording])

    const handleToggle = useCallback(() => {
        togglePlayPause()
    }, [togglePlayPause])

    const handleStop = useCallback(() => {
        stop()
        setPlayerVisible(false)
        setActiveRecording(null)
    }, [stop])

    const handleClosePlayer = useCallback(() => {
        setPlayerVisible(false)
        setActiveRecording(null)
    }, [])

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

    const handlePlaylistSelect = useCallback((playlist: string | null) => {
        hapticMedium()
        setSelectedPlaylist(playlist)
    }, [])

    const visibleRecordings = showDisclaimer ? [] : filteredRecordings

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
                    <View className="mb-6 flex-row items-center justify-between">
                        <Text className="text-[22px] font-bold text-[#D7FF00]">
                            Recordings
                        </Text>
                        {selectedPlaylist && (
                            <Pressable
                                onPress={() => handlePlaylistSelect(null)}
                                className="rounded-full bg-white/10 px-3 py-1.5"
                                hitSlop={8}
                            >
                                <Text className="text-[11px] font-semibold text-[#B7C0BC]">
                                    Clear Filter
                                </Text>
                            </Pressable>
                        )}
                    </View>

                    {/* Playlist Filter Chips */}
                    <View className="mb-5 flex-row flex-wrap gap-2">
                        <TouchableOpacity
                            onPress={() => handlePlaylistSelect(null)}
                            className={`rounded-full px-4 py-2 ${
                                !selectedPlaylist ? 'bg-[#D7FF00]/20' : 'bg-white/5'
                            }`}
                            activeOpacity={0.7}
                        >
                            <Text className={`text-[12px] font-medium ${
                                !selectedPlaylist ? 'text-[#D7FF00]' : 'text-[#B7C0BC]'
                            }`}>
                                All
                            </Text>
                        </TouchableOpacity>
                        {PLAYLISTS.map((playlist) => {
                            const isSelected = selectedPlaylist === playlist
                            return (
                                <TouchableOpacity
                                    key={playlist}
                                    onPress={() => handlePlaylistSelect(playlist)}
                                    className={`rounded-full px-4 py-2 ${
                                        isSelected ? 'bg-[#D7FF00]/20' : 'bg-white/5'
                                    }`}
                                    activeOpacity={0.7}
                                >
                                    <Text className={`text-[12px] font-medium ${
                                        isSelected ? 'text-[#D7FF00]' : 'text-[#B7C0BC]'
                                    }`}>
                                        {playlist}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>

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
                                />
                            }
                        >
                            {visibleRecordings.map((recording, index) => (
                                <RecordingItem
                                    key={recording.id}
                                    recording={recording}
                                    isActive={currentIndex === index}
                                    isPlaying={currentIndex === index && isPlaying}
                                    isLoading={loadingId === recording.id}
                                    isAdmin={isAdmin}
                                    onPlay={() => handlePlay(recording, index)}
                                    onToggle={handleToggle}
                                    onPublishToggle={isAdmin ? () => handlePublishToggle(recording.id, recording.publish) : undefined}
                                />
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Full-Screen Player */}
                {activeRecording && (
                    <RecordingPlayerScreen
                        visible={playerVisible}
                        recording={activeRecording}
                        recordings={filteredRecordings}
                        currentIndex={currentIndex ?? 0}
                        isPlaying={isPlaying}
                        currentTime={currentTime}
                        duration={duration}
                        isLoaded={isLoaded}
                        playbackRate={playbackRate}
                        onClose={handleClosePlayer}
                        onToggle={handleToggle}
                        onSeek={seekTo}
                        onSetPlaybackRate={setPlaybackRate}
                        onNext={playNext}
                        onPrevious={playPrevious}
                        onStop={handleStop}
                    />
                )}
            </SafeAreaView>
        </LinearGradient>
    )
}
