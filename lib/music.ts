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

    const fileExt = asset.uri.split('.').pop()?.toLowerCase() ?? 'mp3'
    const path = `${Date.now()}-${asset.name}.${fileExt}`

    const publicUrl = await uploadAudioFile(asset, 'music', path)
    if (!publicUrl) return null

    const displayName = asset.name
        .replace(/\.[^/.]+$/, '')
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