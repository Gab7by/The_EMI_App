import { useLiveKitStore } from "@/store/livekit-store"
import { useEffect } from "react"

export const useHostRooom = (liveKitRoomName: string) => {
    const connectRoom = useLiveKitStore(state => state.connectRoom)

    useEffect(() => {
        let cancelled = false

        const connect = () => {
            connectRoom(liveKitRoomName, "host").catch((error) => {
                if (!cancelled) console.error("Failed to connect host room", error)
            })
        }

        connect()

        return () => {
            cancelled = true
        }
    }, [connectRoom, liveKitRoomName])
}
