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

export const getRecordings = async (): Promise<Recording[]> => {
    const {data, error} = await supabase.from("podcast_recordings")
        .select("*")
        .eq("status", "completed")
        .order("started_at", { ascending: false })

    if (error) {
        console.error("Error fetching recordings:", error)
        return []
    }

    return data as Recording[]
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