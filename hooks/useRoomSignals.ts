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

        const handleData = (payload: Uint8Array) => {
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

                if (signal.type === 'LOWER_HAND') {
                    setRaisedHands(prev =>
                        prev.filter(s => s.fromId !== signal.fromId)
                    )
                }

                if (signal.type === 'HAND_APPROVED') {
                    setRaisedHands(prev => 
                        prev.filter(s => s.fromId !== signal.toId)
                    )

                    if (signal.toId === currentUserId) {
                        setIsApprovedToSpeak(true)
                    }
                }

                if (signal.type === 'SESSION_ENDED') {
                    setSessionEnded(true)
                }
            } catch {

            }
        }

        import('livekit-client').then(({RoomEvent}) => {
            room.on(RoomEvent.DataReceived, handleData)
        })

        return () => {
            import('livekit-client').then(({RoomEvent}) => {
                room.off(RoomEvent.DataReceived, handleData)
            })
        }
    }, [room, currentUserId])

    const dismissRaisedHand = (participantId: string) => {
        setRaisedHands(prev => prev.filter(signal => signal.fromId !== participantId))
    }

    return {raisedHands, isApprovedToSpeak, sessionEnded, dismissRaisedHand}
}
