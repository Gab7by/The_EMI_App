import RecordingItem from '@/components/recording/RecordingItem'
import RecordingPlayerScreen from '@/components/recording/RecordingPlayerScreen'
import { useRecordingPlayer } from '@/hooks/useRecordingPlayer'
import { deleteRecording, getRecordings, toggleRecordingPublish } from '@/lib/recording'
import { useAuthStore } from '@/store/authStore'
// playlist filters removed per request; search-only
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { LinearGradient } from 'expo-linear-gradient'
import { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, Modal, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

const USER_PAGE_SIZE = 15
const ADMIN_PAGE_SIZE = 20

export default function LibraryScreen() {
    const profile = useAuthStore((state) => state.profile)
    const isAdmin = profile?.role === 'admin'
    const insets = useSafeAreaInsets()
    const queryClient = useQueryClient()
    const [showDisclaimer, setShowDisclaimer] = useState(!isAdmin)
    const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [playerVisible, setPlayerVisible] = useState(false)
    const [activeRecording, setActiveRecording] = useState<any>(null)
    const [visibleCount, setVisibleCount] = useState(isAdmin ? ADMIN_PAGE_SIZE : USER_PAGE_SIZE)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    

    const { data: recordings = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['recordings', isAdmin ? 'admin' : 'member'],
        queryFn: () => getRecordings(isAdmin, visibleCount, 0),
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
        const query = searchQuery.trim().toLowerCase()
        return recordings.filter((recording) => {
            const matchesSearch = !query || [recording.podcast_title, recording.playlist]
                .filter(Boolean)
                .some((value) => value!.toLowerCase().includes(query))
            return matchesSearch
        })
    }, [recordings, searchQuery])

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

    const handleDelete = useCallback((recording: any) => {
        Alert.alert('Delete sermon?', 'This removes the recording from the library. This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: async () => {
                if (await deleteRecording(recording)) {
                    if (activeRecording?.id === recording.id) handleStop()
                    queryClient.invalidateQueries({ queryKey: ['recordings'] })
                } else {
                    Alert.alert('Could not delete sermon', 'Check your Supabase delete policy and try again.')
                }
            } },
        ])
    }, [activeRecording?.id, handleStop, queryClient])

    const handleAcceptDisclaimer = useCallback(() => {
        setShowDisclaimer(false)
        setDisclaimerAccepted(true)
    }, [])

    // playlist filters removed; only search is used

    const handleLoadMore = useCallback(async () => {
        if (isLoadingMore) return
        setIsLoadingMore(true)
        try {
            const pageSize = isAdmin ? ADMIN_PAGE_SIZE : USER_PAGE_SIZE
            const nextCount = visibleCount + pageSize
            const more = await getRecordings(isAdmin, pageSize, visibleCount)
            if (more.length > 0) {
                setVisibleCount(nextCount)
                queryClient.setQueryData(
                    ['recordings', isAdmin ? 'admin' : 'member'],
                    (old: any[] = []) => [...old, ...more]
                )
            }
        } finally {
            setIsLoadingMore(false)
        }
    }, [isAdmin, isLoadingMore, queryClient, visibleCount])

    const visibleRecordings = showDisclaimer ? [] : filteredRecordings
    const hasMore = visibleRecordings.length >= visibleCount

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
                        <View className="gap-1">
                            <Text className="text-[22px] font-bold text-white">
                                Library
                            </Text>
                            <Text className="text-[12px] text-menorah-muted">
                                Sermons, books, and teachings
                            </Text>
                        </View>
                        
                    </View>

                    {/* Sermons primary text */}
                    <Text className="mb-4 text-lg font-bold text-[#D7FF00]">
                        Sermons
                    </Text>

                    <View className="mb-4 flex-row items-center rounded-[16px] border border-white/10 bg-white/5 px-3">
                        <MaterialCommunityIcons name="magnify" size={20} color="#B7C0BC" />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search sermons or playlists"
                            placeholderTextColor="#7E8C83"
                            className="h-11 flex-1 px-3 text-[13px] text-white"
                            returnKeyType="search"
                            accessibilityLabel="Search sermons"
                        />
                        {searchQuery ? (
                            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                                <MaterialCommunityIcons name="close-circle" size={18} color="#B7C0BC" />
                            </Pressable>
                        ) : null}
                    </View>

                                    {/* Playlist filters removed — search-only UI */}

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
                                    The recordings feature is still under development. Some recordings may not play correctly or may have limited functionality. If you would like to test it out, feel free to proceed.
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
                            contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
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
                                    onDelete={isAdmin ? () => handleDelete(recording) : undefined}
                                />
                            ))}

                            {/* Load more indicator */}
                            {hasMore && (
                                <Pressable
                                    onPress={handleLoadMore}
                                    disabled={isLoadingMore}
                                    className="mt-2 items-center rounded-[16px] bg-white/5 px-4 py-3.5"
                                >
                                    {isLoadingMore ? (
                                        <ActivityIndicator size="small" color="#D7FF00" />
                                    ) : (
                                        <View className="flex-row items-center gap-2">
                                            <MaterialCommunityIcons
                                                name="chevron-down"
                                                size={18}
                                                color="#D7FF00"
                                            />
                                            <Text className="text-[12px] font-semibold text-[#D7FF00]">
                                                Load more sermons
                                            </Text>
                                        </View>
                                    )}
                                </Pressable>
                            )}
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
