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
