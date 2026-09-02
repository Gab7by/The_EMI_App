import { useCallback, useEffect, useRef, useState } from "react"
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio"
import { getRecordingSignedUrl } from "@/lib/recording"
import { cacheRecordingInBackground, getLocalPlaybackUri } from "@/lib/recording-downloads"
import { Recording } from "@/types/podcast-types"

export const useRecordingPlayer = () => {
    const [currentUrl, setCurrentUrl] = useState<string | null>(null)
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [recordings, setRecordings] = useState<Recording[]>([])
    const [currentIndex, setCurrentIndex] = useState<number | null>(null)

    // The source argument here must stay referentially the same (`null`) for
    // the lifetime of this hook. Passing `currentUrl` in directly - which is
    // how this used to be written - fed a *new* source into useAudioPlayer
    // on every single track change. Its underlying useReleasingSharedObject
    // reacts to that by constructing a brand new native AudioPlayer and
    // releasing the old one, IN ADDITION to the explicit player.replace()
    // call below that was already handling the source swap. Two competing
    // mechanisms for the same thing meant: the manually .replace()'d and
    // .play()'d instance could get released moments later when the
    // useAudioPlayer-driven recreation kicked in, so the *real* surviving
    // player never actually started playing (the "loading never finishes"
    // and "seek lands on the previous track" reports), and any in-flight
    // seek Promise still holding a reference to the old instance would
    // reject with "Cannot use shared object that was already released" the
    // moment it resolved.
    //
    // The fix is to construct exactly one player for the whole hook's
    // lifetime and use player.replace() as the *only* way to change what's
    // loaded - which is what it's for.
    const player = useAudioPlayer(null)
    const status = useAudioPlayerStatus(player)
    const hasConfiguredAudioModeRef = useRef(false)

    const loadRecording = useCallback(async (recording: Recording, index: number) => {
        setLoadingId(recording.id)

        // A local copy (an explicit download, or a cache left over from a
        // previous play) skips the network entirely - no signed-url round
        // trip, no streaming buffer, works offline. This is what stops the
        // "loading almost every time" experience for anything already played.
        const localUri = await getLocalPlaybackUri(recording)

        let playbackUrl = localUri
        if (!playbackUrl) {
            const signedUrl = await getRecordingSignedUrl(recording.file_path)
            if (!signedUrl) {
                setLoadingId(null)
                return false
            }
            playbackUrl = signedUrl
            // Not blocking playback on this - silently warm the cache in the
            // background so the *next* play of this recording is local too.
            cacheRecordingInBackground(recording, signedUrl)
        }

        // The audio session category/mode only needs setting up once, not
        // re-applied on every track switch - doing it every time added a
        // real native round trip to what should be an instant local replay.
        if (!hasConfiguredAudioModeRef.current) {
            hasConfiguredAudioModeRef.current = true
            await setAudioModeAsync({
                playsInSilentMode: true,
                shouldPlayInBackground: true
            })
        }

        setCurrentUrl(playbackUrl)
        setCurrentIndex(index)
        setLoadingId(null)

        player.replace({ uri: playbackUrl })
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
