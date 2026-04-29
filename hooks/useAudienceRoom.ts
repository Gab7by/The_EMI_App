// hooks/useAudienceRoom.ts
import { getLiveKitToken } from "@/lib/livekit"
import { useLiveKitStore } from "@/store/livekit-store"
import { useEffect } from "react"

export const useAudienceRoom = (liveKitRoomName: string) => {
    const { setRoom, setConnectionState, clearRoom } = useLiveKitStore()

    useEffect(() => {
        let cancelled = false

        const connect = async () => {
            const { Room, RoomEvent } = await import('livekit-client')

            const room = new Room({
                adaptiveStream: true,
                dynacast: true,
            })

            room.on(RoomEvent.ConnectionStateChanged, (state) => {
                if (!cancelled) setConnectionState(state)
            })

            const token = await getLiveKitToken(liveKitRoomName, false)
            if (!token || cancelled) return

            const wsUrl = process.env.EXPO_PUBLIC_LIVEKIT_URL!

            await room.connect(wsUrl, token)

            if (cancelled) {
                room.disconnect()
                return
            }

            setRoom(room)
        }

        connect()

        return () => {
            cancelled = true
            clearRoom()
        }
    }, [liveKitRoomName])
}