import { useCallback, useState } from "react"
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
        player.seekTo(seconds)
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
