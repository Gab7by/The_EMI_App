import { useCallback, useEffect, useRef, useState } from "react"
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio"
import { getRecordingSignedUrl } from "@/lib/recording"
import { Recording } from "@/types/podcast-types"

export const useRecordingPlayer = () => {
    const [currentUrl, setCurrentUrl] = useState<string | null>(null)
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [recordings, setRecordings] = useState<Recording[]>([])
    const [currentIndex, setCurrentIndex] = useState<number | null>(null)

    const player = useAudioPlayer(currentUrl ? { uri: currentUrl } : null)
    const status = useAudioPlayerStatus(player)

    const playRecording = useCallback(async (recordingId: string, filePath: string) => {
        setLoadingId(recordingId)

        const signedUrl = await getRecordingSignedUrl(filePath)
        if (!signedUrl) {
            setLoadingId(null)
            return
        }

        await setAudioModeAsync({
            playsInSilentMode: true,
            shouldPlayInBackground: true
        })

        setCurrentUrl(signedUrl)
        setLoadingId(null)
        player.play()
    }, [player])

    const loadRecording = useCallback(async (recording: Recording, index: number) => {
        setLoadingId(recording.id)

        const signedUrl = await getRecordingSignedUrl(recording.file_path)
        if (!signedUrl) {
            setLoadingId(null)
            return false
        }

        await setAudioModeAsync({
            playsInSilentMode: true,
            shouldPlayInBackground: true
        })

        setCurrentUrl(signedUrl)
        setCurrentIndex(index)
        setLoadingId(null)

        // Use replace to change the source on the existing player
        player.replace({ uri: signedUrl })
        player.play()
        return true
    }, [player])

    const togglePlayPause = useCallback(() => {
        if (status.playing) {
            player.pause()
        } else {
            player.play()
        }
    }, [player, status.playing])

    const seekTo = useCallback((seconds: number) => {
        // expo-audio's iOS backend defaults toleranceBefore/After to
        // CMTime.positiveInfinity when they're omitted, which tells AVPlayer
        // "snap to whatever sync sample is cheapest to reach" - on audio with
        // sparse sync points that can land many seconds away from the
        // requested time. That's the "seeking jumps forward on its own"
        // behavior reported on iOS. A tight (but non-zero, for performance)
        // tolerance keeps the seek within ~100ms of the requested position.
        // Android's ExoPlayer-backed implementation ignores these params
        // entirely, so this is a no-op cost there.
        player.seekTo(seconds, 100, 100)
    }, [player])

    const setPlaybackRate = useCallback((rate: number) => {
        player.setPlaybackRate(rate)
    }, [player])

    const playNext = useCallback(async () => {
        if (currentIndex === null || recordings.length === 0) return

        const nextIndex = currentIndex + 1
        if (nextIndex >= recordings.length) return

        const nextRecording = recordings[nextIndex]
        await loadRecording(nextRecording, nextIndex)
    }, [currentIndex, recordings, loadRecording])

    const playPrevious = useCallback(async () => {
        if (currentIndex === null || recordings.length === 0) return

        const prevIndex = currentIndex - 1
        if (prevIndex < 0) return

        const prevRecording = recordings[prevIndex]
        await loadRecording(prevRecording, prevIndex)
    }, [currentIndex, recordings, loadRecording])

    const stop = useCallback(() => {
        player.pause()
        player.seekTo(0)
        setCurrentUrl(null)
        setCurrentIndex(null)
    }, [player])

    // Auto-advance to the next recording when the current one finishes,
    // matching how any podcast/media app behaves with a loaded queue.
    // `didJustFinish` stays true across several status ticks until the next
    // load resets it, so a ref guards against calling playNext() repeatedly
    // for what is really a single completion event.
    const hasHandledFinishRef = useRef(false)
    useEffect(() => {
        if (status.didJustFinish) {
            if (!hasHandledFinishRef.current) {
                hasHandledFinishRef.current = true
                playNext()
            }
        } else {
            hasHandledFinishRef.current = false
        }
    }, [status.didJustFinish, playNext])

    return {
        playRecording,
        loadRecording,
        togglePlayPause,
        seekTo,
        stop,
        setPlaybackRate,
        playNext,
        playPrevious,
        isPlaying: status.playing,
        currentTime: status.currentTime ?? 0,
        duration: status.duration ?? 0,
        isLoaded: status.isLoaded,
        loadingId,
        currentUrl,
        playbackRate: status.playbackRate ?? 1,
        currentIndex,
        recordings,
        setRecordings,
    }
}
