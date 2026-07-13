import { Recording } from "@/types/podcast-types"
import { supabase } from "./supabase"

export const startRecording = async (
    roomName: string,
    podcastId: string): Promise<string | null> => {

        const {data, error} = await supabase.functions.invoke("livekit-start-recording", {
            body: {roomName, podcastId}
        })

        if (error) {
            console.error("Error starting recording:", error)
            return null
        }

        return data?.egressId
    }

export const stopRecording = async (
    egressId: string | null,
    podcastId: string
): Promise<boolean> => {

    const {data, error} = await supabase.functions.invoke("livekit-stop-recording", {
        body: {egressId, podcastId}
    })

    if (error) {
        console.error("Error stopping recording:", error)
        return false
    }

    return true

}

export const getRecordings = async (isAdmin: boolean = false): Promise<Recording[]> => {
    let query = supabase
        .from("podcast_recordings")
        .select(`
            *,
            live_podcasts!inner(title)
        `)
        .eq("status", "completed")

    // Members only see published recordings; admins see all
    if (!isAdmin) {
        query = query.eq("publish", true)
    }

    const {data, error} = await query
        .order("started_at", { ascending: false })

    if (error) {
        console.error("Error fetching recordings:", error)
        return []
    }

    // Map the joined data into our Recording type
    return (data as any[]).map((item) => ({
        id: item.id,
        podcast_id: item.podcast_id,
        file_path: item.file_path,
        status: item.status,
        publish: item.publish,
        started_at: item.started_at,
        duration_seconds: item.duration_seconds,
        podcast_title: item.live_podcasts?.title ?? null,
    })) as Recording[]
}

export const toggleRecordingPublish = async (
    recordingId: string,
    currentPublishStatus: boolean
): Promise<boolean> => {
    const { error } = await supabase
        .from("podcast_recordings")
        .update({ publish: !currentPublishStatus })
        .eq("id", recordingId)

    if (error) {
        console.error("Error toggling recording publish status:", error)
        return false
    }

    return true
}

export const getRecordingSignedUrl = async (filePath: string): Promise<string | null> => {
    const { data, error } = await supabase.storage.from("recordings")
        .createSignedUrl(
            filePath,
            60 * 60 * 24
        )

    if (error) {
        console.error("Error generating signed URL:", error)
        return null
    }

    return data.signedUrl
}