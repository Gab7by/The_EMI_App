import { AudioPickerAsset, MusicTrack } from "@/types/podcast-types"
import { supabase } from "./supabase"
import { uploadAudioFile } from "./storage"

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

    const publicUrl = await uploadAudioFile(asset, 'music', path)
    if (!publicUrl) return null

    const displayName = baseName
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())

    const {data, error} = await supabase.from("music_tracks")
        .insert({
            name: displayName,
            url: publicUrl,
        })
        .select("*")
        .single()
    
    if (error) {
        console.error("Error inserting music track into database:", error)
        return null
    }

    return data as MusicTrack

}
