import { RoomSignal } from "@/types/livekit-types"
import type {Room} from "livekit-client"
import { useEffect, useState } from "react"

export const useRoomSignals = (
    room: Room | null,
    currentUserId: string
) => {
    const [raisedHands, setRaisedHands] = useState<RoomSignal[]>([])

    const [isApprovedToSpeak, setIsApprovedToSpeak] = useState<boolean>(false)

    const [sessionEnded, setSessionEnded] = useState<boolean>(false)

    useEffect(() => {
        if (!room) return

        const handleData = async (payload: Uint8Array) => {
            const {RoomEvent} = await import('livekit-client')

            const decoder = new TextDecoder()
            const text = decoder.decode(payload)

            try{
                const signal: RoomSignal = JSON.parse(text)

                if (signal.type === 'RAISE_HAND') {
                    setRaisedHands(prev => {
                        const alreadyRaised = prev.some(s => s.fromId === signal.fromId)
                        if (alreadyRaised) return prev

                        return [...prev, signal]
                    })
                }

                if (signal.type === 'HAND_APPROVED') {
                    setRaisedHands(prev => 
                        prev.filter(s => s.fromId !== signal.toId)
                    )

                    if (signal.toId === currentUserId) {
                        setIsApprovedToSpeak(true)
                    }
                }
            } catch {

            }

            let cleanup: (() => void) | null = null

            import('livekit-client').then(({RoomEvent}) => {
                room.on(RoomEvent.DataReceived, handleData)
                cleanup = () => room.off(RoomEvent.DataReceived, handleData)
            })

            return () => {
                cleanup?.()
            }
        }
    }, [room, currentUserId])

    return {raisedHands, isApprovedToSpeak, sessionEnded}
}