import { PodcastBottomSheet } from "@/components/podcast/livePodcastShared"
import { hapticLight } from "@/lib/haptics"
import { BACKGROUND_MUSIC_VOLUME_STEP } from "@/lib/livekit-audio"
import type { MusicTrack } from "@/types/podcast-types"
import {
  AlertCircle,
  CheckCircle2,
  FileAudio,
  Minus,
  Music2,
  Pause,
  Play,
  Plus,
  Square,
  Trash2,
  Upload,
} from "lucide-react-native"
import { memo, useEffect, useRef, useState } from "react"
import { ActivityIndicator, Animated, PanResponder, Pressable, ScrollView, Text, View } from "react-native"

type MusicSheetProps = {
  visible: boolean
  onClose: () => void

  // Upload
  selectedAssetName: string | null
  isUploading: boolean
  uploadedName: string | null
  onPickFile: () => void
  onClearPickedFile: () => void
  onUpload: () => void

  // Library
  tracks: MusicTrack[]
  isLoadingTracks: boolean
  selectedTrack: MusicTrack | null
  onSelectTrack: (track: MusicTrack) => void
  deletingTrackId: string | null
  onDeleteTrack: (track: MusicTrack) => void

  // Playback
  playingTrack: MusicTrack | null
  isPaused: boolean
  isActionLoading: boolean
  onPlay: () => void
  onStop: () => void
  onTogglePause: () => void

  // Volume
  volume: number
  onSetVolume: (volume: number) => void

  // Feedback
  statusMessage: string | null
  errorMessage: string | null
}

function MusicSheet({
  visible,
  onClose,
  selectedAssetName,
  isUploading,
  uploadedName,
  onPickFile,
  onClearPickedFile,
  onUpload,
  tracks,
  isLoadingTracks,
  selectedTrack,
  onSelectTrack,
  deletingTrackId,
  onDeleteTrack,
  playingTrack,
  isPaused,
  isActionLoading,
  onPlay,
  onStop,
  onTogglePause,
  volume,
  onSetVolume,
  statusMessage,
  errorMessage,
}: MusicSheetProps) {
  return (
    <PodcastBottomSheet visible={visible} onClose={onClose}>
      <View className="items-center">
        <View className="h-1 w-28 rounded-full bg-[#D7FF00]" />
      </View>

      <Text className="mt-3 text-center text-[16px] font-bold text-[#D7FF00]">
        Background Music
      </Text>

      {/* Now Playing - only takes space once something is actually loaded,
          so it doesn't compete with the library for attention otherwise. */}
      {playingTrack ? (
        <NowPlayingCard
          track={playingTrack}
          isPaused={isPaused}
          isBusy={isActionLoading}
          onTogglePause={onTogglePause}
          onStop={onStop}
        />
      ) : null}

      {(errorMessage || statusMessage) && (
        <View
          className="mt-3 flex-row items-center rounded-[14px] px-3 py-2.5"
          style={{ backgroundColor: errorMessage ? "rgba(243,82,60,0.12)" : "rgba(215,255,0,0.12)" }}
        >
          {errorMessage ? (
            <AlertCircle size={16} color="#FF8A7A" />
          ) : (
            <CheckCircle2 size={16} color="#D7FF00" />
          )}
          <Text
            className="ml-2 flex-1 text-[12px]"
            style={{ color: errorMessage ? "#FF8A7A" : "#D7FF00" }}
            numberOfLines={2}
          >
            {errorMessage || statusMessage}
          </Text>
        </View>
      )}

      {/* Volume - draggable, not just tap-to-position, matching the scrubber
          pattern used for recording playback elsewhere in the app. */}
      <View className="mt-4 rounded-[14px] bg-[#143703] px-3 py-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-[12px] font-semibold text-[#F2F5EE]">Music volume</Text>
          <Text className="text-[12px] font-semibold text-[#D7FF00]">{Math.round(volume * 100)}%</Text>
        </View>
        <View className="mt-3 flex-row items-center gap-3">
          <Pressable
            onPress={() => onSetVolume(Math.max(0.05, volume - BACKGROUND_MUSIC_VOLUME_STEP))}
            disabled={isActionLoading || volume <= 0.05}
            className={`h-9 w-9 items-center justify-center rounded-[12px] ${
              isActionLoading || volume <= 0.05 ? "bg-white/5" : "bg-white/10"
            }`}
          >
            <Minus size={18} color={volume <= 0.05 ? "#6F7C73" : "#D7FF00"} />
          </Pressable>

          <VolumeSlider value={volume} disabled={isActionLoading} onChange={onSetVolume} />

          <Pressable
            onPress={() => onSetVolume(Math.min(1, volume + BACKGROUND_MUSIC_VOLUME_STEP))}
            disabled={isActionLoading || volume >= 1}
            className={`h-9 w-9 items-center justify-center rounded-[12px] ${
              isActionLoading || volume >= 1 ? "bg-white/5" : "bg-white/10"
            }`}
          >
            <Plus size={18} color={volume >= 1 ? "#6F7C73" : "#D7FF00"} />
          </Pressable>
        </View>
      </View>

      {/* Library */}
      <View className="mb-2 mt-4 flex-row items-center justify-between">
        <Text className="text-[13px] font-semibold uppercase tracking-[1px] text-[#B7C0BC]">
          Tracks
        </Text>
        <Text className="text-[12px] text-[#D7FF00]">{tracks.length}</Text>
      </View>

      <ScrollView
        className="max-h-[220px]"
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 4 }}
      >
        {isLoadingTracks ? (
          <View className="items-center rounded-[18px] bg-[#143703] px-4 py-5">
            <ActivityIndicator size="small" color="#D7FF00" />
          </View>
        ) : tracks.length ? (
          tracks.map((track) => (
            <TrackRow
              key={track.id}
              track={track}
              isSelected={selectedTrack?.id === track.id}
              isPlaying={playingTrack?.id === track.id}
              isDeleting={deletingTrackId === track.id}
              canDelete={playingTrack?.id !== track.id && deletingTrackId === null && !isActionLoading}
              onSelect={() => onSelectTrack(track)}
              onDelete={() => onDeleteTrack(track)}
            />
          ))
        ) : (
          <View className="rounded-[18px] bg-[#143703] px-4 py-5">
            <Text className="text-center text-[13px] text-[#B7C0BC]">No tracks yet.</Text>
          </View>
        )}
      </ScrollView>

      <View className="mt-3 flex-row gap-3">
        <Pressable
          onPress={onPlay}
          disabled={!selectedTrack || isActionLoading}
          className={`flex-1 flex-row items-center justify-center rounded-[14px] px-4 py-3 ${
            selectedTrack && !isActionLoading ? "bg-[#D7FF00]" : "bg-[#184832]"
          }`}
        >
          {isActionLoading ? (
            <>
              <ActivityIndicator size="small" color="#143703" />
              <Text className="ml-2 text-[13px] font-semibold text-[#143703]">Starting...</Text>
            </>
          ) : (
            <>
              <Play size={17} color={selectedTrack ? "#143703" : "#8A9A90"} />
              <Text className={`ml-2 text-[13px] font-semibold ${selectedTrack ? "text-[#143703]" : "text-[#8A9A90]"}`}>
                Play
              </Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Upload - tucked below the library since it's an occasional action,
          not the primary thing this sheet is opened for. */}
      <View className="mt-4 gap-2 border-t border-white/10 pt-4">
        <Pressable
          onPress={onPickFile}
          disabled={isUploading}
          className="flex-row items-center rounded-[14px] border border-dashed border-[#D7FF00]/45 bg-[#143703] px-3 py-3"
        >
          <View className="h-[34px] w-[34px] items-center justify-center rounded-full bg-[#D7FF00]">
            <FileAudio size={17} color="#143703" strokeWidth={2.3} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-[13px] font-semibold text-[#F2F5EE]" numberOfLines={1}>
              {selectedAssetName ?? "Choose audio to add"}
            </Text>
          </View>
        </Pressable>

        {selectedAssetName ? (
          <View className="flex-row items-center justify-end gap-2">
            <Pressable onPress={onClearPickedFile} disabled={isUploading} className="rounded-full bg-white/10 px-3 py-1.5">
              <Text className="text-[12px] font-semibold text-[#F2F5EE]">Clear</Text>
            </Pressable>
            <Pressable
              onPress={onUpload}
              disabled={isUploading}
              className={`flex-row items-center justify-center rounded-full px-4 py-1.5 ${isUploading ? "bg-[#184832]" : "bg-[#D7FF00]"}`}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#143703" />
              ) : (
                <>
                  <Upload size={13} color="#143703" />
                  <Text className="ml-1.5 text-[12px] font-semibold text-[#143703]">Upload</Text>
                </>
              )}
            </Pressable>
          </View>
        ) : null}

        {uploadedName ? (
          <View className="flex-row items-center rounded-[14px] bg-[#D7FF00]/12 px-3 py-2.5">
            <CheckCircle2 size={16} color="#D7FF00" />
            <Text className="ml-2 flex-1 text-[12px] text-[#D7FF00]" numberOfLines={1}>
              Uploaded {uploadedName}
            </Text>
          </View>
        ) : null}
      </View>
    </PodcastBottomSheet>
  )
}

export default memo(MusicSheet)

// ─────────────────────────────────────────────────────────────────────
// NowPlayingCard
// ─────────────────────────────────────────────────────────────────────
function NowPlayingCard({
  track,
  isPaused,
  isBusy,
  onTogglePause,
  onStop,
}: {
  track: MusicTrack
  isPaused: boolean
  isBusy: boolean
  onTogglePause: () => void
  onStop: () => void
}) {
  return (
    <View className="mt-4 flex-row items-center rounded-[16px] bg-[#0F2A08] px-4 py-3.5">
      <View className="h-11 w-11 items-center justify-center rounded-full bg-[#D7FF00]/15">
        {isPaused ? <Music2 size={18} color="#D7FF00" /> : <EqualizerBars color="#D7FF00" />}
      </View>
      <View className="ml-3 min-w-0 flex-1">
        <Text className="text-[10px] font-semibold uppercase tracking-[1px] text-[#8FA396]">
          {isPaused ? "Paused" : "Now playing"}
        </Text>
        <Text className="mt-0.5 text-[14px] font-semibold text-[#F2F5EE]" numberOfLines={1}>
          {track.name}
        </Text>
      </View>
      <Pressable
        onPress={onTogglePause}
        disabled={isBusy}
        hitSlop={8}
        className="ml-2 h-9 w-9 items-center justify-center rounded-full bg-white/10"
      >
        {isPaused ? <Play size={15} color="#D7FF00" fill="#D7FF00" /> : <Pause size={15} color="#D7FF00" fill="#D7FF00" />}
      </Pressable>
      <Pressable
        onPress={onStop}
        disabled={isBusy}
        hitSlop={8}
        className="ml-2 h-9 w-9 items-center justify-center rounded-full bg-white/10"
      >
        <Square size={14} color="#FF8A7A" />
      </Pressable>
    </View>
  )
}

/** Same animated equalizer used for "now playing" in the recordings list -
 * reused here for a consistent visual language across the app. */
function EqualizerBars({ color }: { color: string }) {
  const bars = [
    useRef(new Animated.Value(0.4)).current,
    useRef(new Animated.Value(0.9)).current,
    useRef(new Animated.Value(0.6)).current,
  ]

  useEffect(() => {
    const loops = bars.map((bar, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(bar, { toValue: 1, duration: 420 + i * 90, useNativeDriver: false }),
          Animated.timing(bar, { toValue: 0.25, duration: 420 + i * 90, useNativeDriver: false }),
        ])
      )
    )
    loops.forEach((loop) => loop.start())
    return () => loops.forEach((loop) => loop.stop())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <View className="h-4 flex-row items-end gap-[2px]">
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          className="w-[3px] rounded-full"
          style={{ height: bar.interpolate({ inputRange: [0, 1], outputRange: ["20%", "100%"] }), backgroundColor: color }}
        />
      ))}
    </View>
  )
}

// ─────────────────────────────────────────────────────────────────────
// TrackRow
// ─────────────────────────────────────────────────────────────────────
function TrackRow({
  track,
  isSelected,
  isPlaying,
  isDeleting,
  canDelete,
  onSelect,
  onDelete,
}: {
  track: MusicTrack
  isSelected: boolean
  isPlaying: boolean
  isDeleting: boolean
  canDelete: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  return (
    <Pressable
      onPress={() => { hapticLight(); onSelect() }}
      className={`mb-2 flex-row items-center rounded-[16px] px-4 py-3 ${isSelected ? "bg-[#D7FF00]" : "bg-[#143703]"}`}
    >
      <View className={`h-[30px] w-[30px] items-center justify-center rounded-[10px] ${isSelected ? "bg-[#143703]/15" : "bg-[#D7FF00]/15"}`}>
        {isPlaying ? (
          <EqualizerBars color={isSelected ? "#143703" : "#D7FF00"} />
        ) : (
          <Music2 size={15} color={isSelected ? "#143703" : "#D7FF00"} />
        )}
      </View>
      <Text className={`ml-3 flex-1 text-[13px] font-medium ${isSelected ? "text-[#143703]" : "text-[#F2F5EE]"}`} numberOfLines={1}>
        {track.name}
      </Text>
      <Pressable
        onPress={onDelete}
        disabled={!canDelete}
        hitSlop={8}
        className={`ml-3 h-9 w-9 items-center justify-center rounded-[12px] ${isSelected ? "bg-[#143703]/10" : "bg-white/10"}`}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color={isSelected ? "#143703" : "#D7FF00"} />
        ) : (
          <Trash2 size={16} color={canDelete ? (isSelected ? "#143703" : "#FF8A7A") : "#6F7C73"} />
        )}
      </Pressable>
    </Pressable>
  )
}

// ─────────────────────────────────────────────────────────────────────
// VolumeSlider - drag-to-adjust, not just tap-to-position.
// ─────────────────────────────────────────────────────────────────────
function VolumeSlider({
  value,
  disabled,
  onChange,
}: {
  value: number
  disabled: boolean
  onChange: (value: number) => void
}) {
  const trackWidthRef = useRef(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragValue, setDragValue] = useState(value)
  const startValueRef = useRef(value)
  const dragValueRef = useRef(value)
  const disabledRef = useRef(disabled)
  const onChangeRef = useRef(onChange)
  const thumbScale = useRef(new Animated.Value(1)).current

  useEffect(() => { disabledRef.current = disabled }, [disabled])
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  const displayedValue = isDragging ? dragValue : value

  // PanResponder is created once via useRef and its callbacks are never
  // recreated, so anything they read must come from refs, not render-scoped
  // state/props - otherwise onPanResponderRelease would close over whatever
  // dragValue/onChange happened to be on the very first render.
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabledRef.current,
      onMoveShouldSetPanResponder: () => !disabledRef.current,
      onPanResponderGrant: () => {
        hapticLight()
        startValueRef.current = dragValueRef.current
        setIsDragging(true)
        Animated.spring(thumbScale, { toValue: 1.3, useNativeDriver: true, friction: 6 }).start()
      },
      onPanResponderMove: (_evt, gestureState) => {
        if (trackWidthRef.current === 0) return
        const next = Math.min(1, Math.max(0, startValueRef.current + gestureState.dx / trackWidthRef.current))
        dragValueRef.current = next
        setDragValue(next)
      },
      onPanResponderRelease: () => {
        Animated.spring(thumbScale, { toValue: 1, useNativeDriver: true, friction: 6 }).start()
        setIsDragging(false)
        onChangeRef.current(Math.round(dragValueRef.current * 100) / 100)
      },
      onPanResponderTerminate: () => {
        Animated.spring(thumbScale, { toValue: 1, useNativeDriver: true, friction: 6 }).start()
        setIsDragging(false)
      },
    })
  ).current

  // Keep the ref in sync whenever the value changes for reasons other than
  // dragging (e.g. the +/- buttons, or a server-confirmed volume echoed
  // back), so the next drag starts from the right place.
  useEffect(() => {
    if (!isDragging) dragValueRef.current = value
  }, [value, isDragging])

  return (
    <View
      {...panResponder.panHandlers}
      className="h-8 flex-1 justify-center"
      onLayout={(event) => { trackWidthRef.current = event.nativeEvent.layout.width }}
      accessibilityRole="adjustable"
      accessibilityLabel="Music volume"
    >
      <View className="h-2 overflow-hidden rounded-full bg-white/10">
        <View className="h-full rounded-full bg-[#D7FF00]" style={{ width: `${displayedValue * 100}%` }} />
      </View>
      <Animated.View
        pointerEvents="none"
        className="absolute h-5 w-5 rounded-full border-2 border-white bg-[#D7FF00]"
        style={{
          left: `${Math.max(0, Math.min(100, displayedValue * 100))}%`,
          marginLeft: -10,
          transform: [{ scale: thumbScale }],
        }}
      />
    </View>
  )
}
