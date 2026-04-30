import { supabase } from "@/lib/supabase";
import { LiveMessage } from "@/types/podcast-types";
import type { Room } from "livekit-client";
import { useCallback, useEffect, useState } from "react";

export const useRoomChat = (
    room: Room | null,
    podcastId: string,
    currentUserId: string
) => {
    const [messages, setMessages] = useState<LiveMessage[]>([])

    useEffect(() => {
        const loadHistory = async () => {
            const {data} = await supabase
                .from('live_podcast_messages')
                .select('*')
                .eq('podcast_id', podcastId)
                .order("created_at", {ascending: true})

            if (data) setMessages(data)
        }

        loadHistory()
    }, [podcastId])

    useEffect(() => {
        if (!room) return

        let cleanup: (() => void) | null = null

        import("livekit-client").then(({RoomEvent}) => {
            const handleData = (payload: Uint8Array) => {
                const decoder = new TextDecoder()

                const text = decoder.decode(payload)

                try {
                    const parsed = JSON.parse(text)

                    if (parsed.type !== 'CHAT') return

                    if (parsed.sender_id === currentUserId) return

                    setMessages(prev => [...prev, {
                        id: parsed.id,
                        podcast_id: parsed.podcast_id,
                        sender_id: parsed.sender_id,
                        sender_name: parsed.sender_name,
                        sender_avartar_url: parsed.sender_avartar_url ?? null,
                        content: parsed.content,
                        created_at: parsed.created_at,
                        isLocal: false
                    }])
                } catch {

                }
            }

            room.on(RoomEvent.DataReceived, handleData)
            cleanup = () => room.off(RoomEvent.DataReceived, handleData)
        })

        return () => cleanup?.()
    }, [room, currentUserId])

    const sendMessage = useCallback(async (
        content: string,
        senderName: string,
        senderAvatarUrl: string | null
        ) => {
            if (!room || !content.trim()) return

            const id = `${Date.now()}-${currentUserId}`
            const created_at = new Date().toISOString()

            setMessages(prev => [
                ...prev, {
                    id,
                    podcast_id: podcastId,
                    sender_id: currentUserId,
                    sender_name: senderName,
                    sender_avartar_url: senderAvatarUrl,
                    content: content.trim(),
                    created_at,
                    isLocal: true
                }
            ])

            const messageData = {
                type: 'CHAT',
                id,
                podcast_id: podcastId,
                sender_id: currentUserId,
                sender_name: senderName,
                sender_avartar_url: senderAvatarUrl,
                content: content.trim(),
                created_at
            }

            import('livekit-client').then(() => {
                const encoder = new TextEncoder()
                room.localParticipant.publishData(
                    encoder.encode(JSON.stringify(messageData)),
                    {reliable: true}
                )
            })

            supabase.from('live_podcast_messages').insert({
                podcast_id: podcastId,
                sender_id: currentUserId,
                sender_name: senderName,
                content: content.trim()
            })
        }, [room, podcastId, currentUserId])

        return {messages, sendMessage}
}

