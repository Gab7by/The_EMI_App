import { AudioPickerAsset, MusicTrack } from "@/types/podcast-types"
import { supabase } from "./supabase"
import { uploadAudioFile } from "./storage"

const getFunctionErrorDetail = async (error: unknown) => {
    const context = (error as { context?: Response })?.context

    if (!context) return null

    try {
        return await context.clone().text()
    } catch {
        return null
    }
}

export type MusicBotStatus = {
    success: boolean
    status: 'playing' | 'stopped' | 'error' | string
    identity: string | null
    trackName: string | null
    startedAt: string | null
    sampleRate: number | null
    channels: number | null
    frameMs: number | null
    pcmSamples: number | null
    durationSeconds: number | null
    maxBitrate: number | null
    framesSent: number
    samplesSent: number
    lastFrameAt: string | null
    error: string | null
    volume: number | null
    paused: boolean
}

type MusicBotFunctionResponse<T> = {
    ok?: boolean
    bot?: T
} & T

const unwrapBotResponse = <T>(data: MusicBotFunctionResponse<T> | null): T | null => {
    if (!data) return null
    return (data.bot ?? data) as T
}

export const getMusicTracks = async (): Promise<MusicTrack[]> => {
    const {data, error} = await supabase.from("music_tracks")
        .select("*")
        .order("created_at", {ascending: true})

    if (error) {
        console.error("Error fetching music tracks:", error)
        return []
    }

    return data as MusicTrack[]
}

export const uploadMusicTrack = async (
    asset: AudioPickerAsset
): Promise<MusicTrack | null> => {

    const fileExt = asset.name.split('.').pop()?.toLowerCase() ?? 'mp3'
    const baseName = asset.name.replace(/\.[^/.]+$/, '')
    const safeName = baseName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    const path = `${Date.now()}-${safeName || 'track'}.${fileExt}`

    const uploadResult = await uploadAudioFile(asset, 'music', path)
    if (!uploadResult) return null

    const displayName = baseName
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())

    const {data, error} = await supabase.from("music_tracks")
        .insert({
            name: displayName,
            url: uploadResult.url,
            path: uploadResult.path
        })
        .select("*")
        .single()
    
    if (error) {
        console.error("Error inserting music track into database:", error)
        return null
    }

    return {
        ...(data as MusicTrack),
        path: uploadResult.path,
    }

}

const getMusicStoragePath = (url: string) => {
    return url.split('/storage/v1/object/public/music/')[1]?.split('?')[0] ?? null
}

export const deleteMusicTrack = async (
    track: Pick<MusicTrack, 'id' | 'url' | 'path'>
): Promise<boolean> => {

    const storagePath = track.path ?? getMusicStoragePath(track.url)

    if (storagePath) {
        const { error: storageError } = await supabase.storage
            .from('music')
            .remove([storagePath])

        if (storageError) {
            console.error('Storage delete error:', storageError.message)
            return false
        }
    }

    const { error: dbError } = await supabase
        .from('music_tracks')
        .delete()
        .eq('id', track.id)

    if (dbError) {
        console.error('Database delete error:', dbError.message)
        return false
    }

    return true
}

export const playMusicTrack = async (
    roomName: string,
    track: Pick<MusicTrack, 'name' | 'url'>,
    volume = 0.35
): Promise<boolean> => {
    const {error} = await supabase.functions.invoke('music-bot-play', {
        body: {
            roomName,
            trackUrl: track.url,
            trackName: track.name,
            volume,
        },
    })

    if (error) {
        const detail = await getFunctionErrorDetail(error)
        console.error('Error starting music track:', error, detail)
        return false
    }

    return true
}

export const stopMusicTrack = async (roomName: string): Promise<boolean> => {
    const {error} = await supabase.functions.invoke('music-bot-stop', {
        body: { roomName },
    })

    if (error) {
        const detail = await getFunctionErrorDetail(error)
        console.error('Error stopping music track:', error, detail)
        return false
    }

    return true
}

export const pauseMusicTrack = async (roomName: string): Promise<boolean> => {
    return controlMusicBot(roomName, 'pause')
}

export const resumeMusicTrack = async (roomName: string): Promise<boolean> => {
    return controlMusicBot(roomName, 'resume')
}

export const setMusicTrackVolume = async (
    roomName: string,
    volume: number
): Promise<boolean> => {
    return controlMusicBot(roomName, 'volume', { volume })
}

const controlMusicBot = async (
    roomName: string,
    action: 'pause' | 'resume' | 'volume',
    extraBody: Record<string, unknown> = {}
): Promise<boolean> => {
    const {error} = await supabase.functions.invoke('music-bot-play', {
        body: {
            action,
            roomName,
            ...extraBody,
        },
    })

    if (error) {
        const detail = await getFunctionErrorDetail(error)
        console.error(`Error sending music bot ${action}:`, error, detail)
        return false
    }

    return true
}

export const getMusicBotStatus = async (roomName: string): Promise<MusicBotStatus | null> => {
    const {data, error} = await supabase.functions.invoke('music-bot-play', {
        body: {
            action: 'status',
            roomName,
        },
    })

    if (error) {
        const detail = await getFunctionErrorDetail(error)
        console.error('Error checking music bot status:', error, detail)
        return null
    }

    return unwrapBotResponse(data as MusicBotFunctionResponse<MusicBotStatus>)
}
