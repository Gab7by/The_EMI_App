// hooks/useAudienceRoom.ts
import { useLiveKitStore } from "@/store/livekit-store"
import { useEffect } from "react"

export const useAudienceRoom = (liveKitRoomName: string) => {
    const connectRoom = useLiveKitStore(state => state.connectRoom)

    useEffect(() => {
        let cancelled = false

        const connect = () => {
            connectRoom(liveKitRoomName, "audience").catch((error) => {
                if (!cancelled) console.error("Failed to connect audience room", error)
            })
        }

        connect()

        return () => {
            cancelled = true
        }
    }, [connectRoom, liveKitRoomName])
}
