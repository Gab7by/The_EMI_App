import { supabase } from "./supabase"

export const getLiveKitToken = async (roomName: string, isHost: boolean): Promise<string | null> => {

    const {data, error} = await supabase.functions.invoke(
        "livekit-token", {
            body: {roomName, isHost}
        }
    )
        if (error) {
            console.error("Live Kit token generation error: ", error.message)
            return null
        }

        return data.token
}