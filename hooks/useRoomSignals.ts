import { queryClient } from "@/lib/query"
import { LoveBurst, RoomSignal } from "@/types/livekit-types"
import type {Room} from "livekit-client"
import { useCallback, useEffect, useState } from "react"

export const useRoomSignals = (
    room: Room | null,
    currentUserId: string
) => {
    const [raisedHands, setRaisedHands] = useState<RoomSignal[]>([])
    const [isApprovedToSpeak, setIsApprovedToSpeak] = useState<boolean>(false)
    const [sessionEnded, setSessionEnded] = useState<boolean>(false)
    const [isSpeakerRevoked, setIsSpeakerRevoked] = useState<boolean>(false)
    const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null)
    const [loveBursts, setLoveBursts] = useState<LoveBurst[]>([])

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
                        setIsSpeakerRevoked(false)
                        setIsApprovedToSpeak(true)
                    }
                }

                if (signal.type === 'SPEAKER_REVOKED') {
                    if (signal.toId === currentUserId) {
                        setIsApprovedToSpeak(false)
                        setIsSpeakerRevoked(true)
                    }
                }

                if (signal.type === 'SESSION_ENDED') {
                    setSessionEnded(true)
                }

                if (signal.type === 'BACKGROUND_CHANGED') {
                    setBackgroundUrl(signal.fromName)
                    queryClient.invalidateQueries({ queryKey: ['live-podcast-sessions'] })
                }

                if (signal.type === 'LOVE') {
                    setLoveBursts(prev => [
                        ...prev.slice(-14),
                        {
                            id: signal.id ?? `${signal.fromId}-${Date.now()}`,
                            fromId: signal.fromId,
                            fromName: signal.fromName,
                            createdAt: Date.now(),
                        },
                    ])
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

    const dismissRaisedHand = useCallback((participantId: string) => {
        setRaisedHands(prev => prev.filter(signal => signal.fromId !== participantId))
    }, [])

    const dismissLoveBurst = useCallback((loveId: string) => {
        setLoveBursts(prev => prev.filter(love => love.id !== loveId))
    }, [])

    return {
        raisedHands,
        isApprovedToSpeak,
        sessionEnded,
        isSpeakerRevoked,
        backgroundUrl,
        loveBursts,
        dismissRaisedHand,
        dismissLoveBurst,
    }
}
