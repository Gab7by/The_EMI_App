import { MusicTrack } from "@/types/podcast-types";
import { useCallback, useEffect, useState } from "react";
import TrackPlayer, {
    State,
    usePlaybackState,
    RepeatMode
} from "react-native-track-player";


export const useBackgroundMusic = () => {
    const playbackState = usePlaybackState()

    const isPlaying = playbackState.state === State.Playing

    const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null)
    const [volume, setVolume] = useState<number>(0.3)

    const playTrack = useCallback(async (track: MusicTrack) => {
        await TrackPlayer.reset()

        await TrackPlayer.add({
            id: track.id,
            url: track.url,
            title: track.name,
            artist: "The Menorah"
        })

        await TrackPlayer.setRepeatMode(RepeatMode.Track)
        await TrackPlayer.play()

        setCurrentTrack(track)
    }, [])

    const pauseMusic = useCallback(async () => {
        await TrackPlayer.pause()
    }, [])

    const resumeMusic = useCallback(async () => {
        await TrackPlayer.play()
    }, [])

    const stopMusic = useCallback(async () => {
        await TrackPlayer.stop()
        await TrackPlayer.reset()
        setCurrentTrack(null)
    }, [])

    const setMusicVolume = useCallback(async (volume: number) => {
        await TrackPlayer.setVolume(volume)
        setVolume(volume)
    }, [])

    useEffect(() => {
        return () => {
            TrackPlayer.stop()
            TrackPlayer.reset()
        }
    }, [])

    return {
        playTrack,
        pauseMusic,
        resumeMusic,
        stopMusic,
        setMusicVolume,
        isPlaying,
        currentTrack,
        volume
    }
}