import { useCallback, useState } from "react"
import {setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus} from "expo-audio"
import { getRecordingSignedUrl } from "@/lib/recording"

export const useRecordingPlayer = () => {
    const [currentUrl, setCurrentUrl] = useState<string | null>(null)
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const player = useAudioPlayer(currentUrl ? {uri: currentUrl} : null)

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

    const stop = useCallback(() => {
        player.pause()
        player.seekTo(0)
        setCurrentUrl(null)
    }, [player])

    return {
        playRecording,
        togglePlayPause,
        seekTo,
        stop,
        isPlaying: status.playing,
        currentTime: status.currentTime ?? 0,
        duration: status.duration ?? 0,
        isLoaded: status.isLoaded,
        loadingId,
        currentUrl
    }

}