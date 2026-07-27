import { pickImage, uploadChatImage } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { LiveMessage, MessageType, ReplyPreview } from "@/types/podcast-types";
import type { Room } from "livekit-client";
import { useCallback, useEffect, useState } from "react";

export const useRoomChat = (
    room: Room | null,
    podcastId: string,
    currentUserId: string,
    currentUserRole?: string
) => {
    const [messages, setMessages] = useState<LiveMessage[]>([])

    const fetchReplyPreview = useCallback(async (replyToId: string): Promise<ReplyPreview | null> => {
        const { data, error } = await supabase
            .from('live_podcast_messages')
            .select('sender_name, content, message_type')
            .eq('id', replyToId)
            .maybeSingle()

        if (error || !data) {
            console.error("Failed to fetch reply preview", error)
            return null
        }

        return {
            sender_name: data.sender_name,
            content: data.content,
            message_type: data.message_type as MessageType,
        }
    }, [])

    useEffect(() => {
        const loadHistory = async () => {
            const {data, error} = await supabase
                .from('live_podcast_messages')
                .select('*')
                .eq('podcast_id', podcastId)
                .order("created_at", {ascending: true})

            if (error) {
                console.error("Failed to load live podcast messages", error)
                return
            }

            if (data) {
                setMessages(
                    data.map((message) => ({
                        ...message,
                        reply_preview: null,
                        isLocal: message.sender_id === currentUserId,
                    }))
                )
            }
        }

        loadHistory()
    }, [podcastId, currentUserId])

    useEffect(() => {
        if (!room) return

        let cleanup: (() => void) | null = null

        import("livekit-client").then(({RoomEvent}) => {
            const handleData = (payload: Uint8Array) => {
                const decoder = new TextDecoder()

                const text = decoder.decode(payload)

                try {
                    const parsed = JSON.parse(text)

                    if (parsed.type === 'CHAT') {
                        setMessages(prev => {
                            if (prev.some((message) => message.id === parsed.id)) {
                                return prev
                            }

                            return [...prev, {
                                id: parsed.id,
                                podcast_id: parsed.podcast_id,
                                sender_id: parsed.sender_id,
                                sender_name: parsed.sender_name,
                                sender_avartar_url: parsed.sender_avartar_url ?? null,
                                content: parsed.content,
                                message_type: parsed.message_type,
                                created_at: parsed.created_at,
                                reply_to_id: parsed.reply_to_id ?? null,
                                reply_preview: parsed.reply_preview ?? null,
                                edited_at: parsed.edited_at ?? null,
                                isLocal: parsed.sender_id === currentUserId
                            }]
                        })
                        return
                    }

                    if (parsed.type === 'EDIT_MESSAGE') {
                        setMessages(prev => prev.map(msg => 
                            msg.id === parsed.messageId
                                ? { ...msg, content: parsed.newContent, edited_at: parsed.editedAt }
                                : msg
                        ))
                        return
                    }

                    if (parsed.type === 'DELETE_MESSAGE') {
                        setMessages(prev => prev.filter(msg => msg.id !== parsed.messageId))
                        return
                    }
                } catch {

                }
            }

            room.on(RoomEvent.DataReceived, handleData)
            cleanup = () => room.off(RoomEvent.DataReceived, handleData)
        })

        return () => cleanup?.()
    }, [room, currentUserId])

    const sendImage = useCallback(async (senderName: string, senderAvatarUrl: string | null) => {
        if (!room) return

        const asset = await pickImage({allowsEditing: false})
        if (!asset) return

        const imageUrl = await uploadChatImage(asset, podcastId, currentUserId)
        if (!imageUrl) return

        const id = `${Date.now()}-${currentUserId}-img`
        const created_at = new Date().toISOString()

        const newMessage = {
            id,
            podcast_id: podcastId,
            sender_id: currentUserId,
            sender_name: senderName,
            sender_avartar_url: senderAvatarUrl,
            content: imageUrl,
            message_type: 'image' as MessageType,
            created_at,
            reply_to_id: null,
            reply_preview: null,
            edited_at: null,
            isLocal: true
        }

        const { error } = await supabase.from('live_podcast_messages').insert({
            podcast_id: podcastId,
            sender_id: currentUserId,
            sender_name: senderName,
            sender_avartar_url: senderAvatarUrl,
            content: imageUrl,
            message_type: 'image'
        })

        if (error) {
            console.error('Failed to save live podcast image message', error)
            return
        }

        setMessages(prev => [...prev, newMessage])

        const encoder = new TextEncoder()
        room.localParticipant.publishData(
            encoder.encode(JSON.stringify({
                type: 'CHAT',
                ...newMessage
            })),
            {reliable: true}
        )
    }, [room, podcastId, currentUserId])

    const sendMessage = useCallback(async (
        content: string,
        senderName: string,
        senderAvatarUrl: string | null,
        replyToId?: string | null
        ) => {
            if (!room || !content.trim()) return

            const id = `${Date.now()}-${currentUserId}`
            const created_at = new Date().toISOString()

            let replyPreview: ReplyPreview | null = null
            if (replyToId) {
                replyPreview = await fetchReplyPreview(replyToId)
            }

            const messageData = {
                id,
                podcast_id: podcastId,
                sender_id: currentUserId,
                sender_name: senderName,
                sender_avartar_url: senderAvatarUrl,
                content: content.trim(),
                message_type: 'text' as MessageType,
                created_at,
                reply_to_id: replyToId ?? null,
                reply_preview: replyPreview,
                edited_at: null,
                isLocal: true
            }

            setMessages(prev => {
                if (prev.some((message) => message.id === id)) {
                    return prev
                }

                return [...prev, messageData]
            })

            import('livekit-client').then(() => {
                const encoder = new TextEncoder()
                room.localParticipant.publishData(
                    encoder.encode(JSON.stringify({
                        type: 'CHAT',
                        ...messageData
                    })),
                    {reliable: true}
                )
            })

            const insertPayload: Record<string, any> = {
                podcast_id: podcastId,
                sender_id: currentUserId,
                sender_name: senderName,
                sender_avartar_url: senderAvatarUrl,
                content: content.trim(),
                message_type: 'text' as MessageType,
            }

            if (replyToId) {
                insertPayload.reply_to_id = replyToId
            }

            const { error } = await supabase.from('live_podcast_messages').insert(insertPayload)

            if (error) {
                console.error("Failed to save live podcast message", error)
            }
        }, [room, podcastId, currentUserId, fetchReplyPreview])

    const editMessage = useCallback(async (messageId: string, newContent: string) => {
        if (!room || !newContent.trim()) return

        const editedAt = new Date().toISOString()

        const { error } = await supabase
            .from('live_podcast_messages')
            .update({ content: newContent.trim(), edited_at: editedAt })
            .eq('id', messageId)
            .eq('sender_id', currentUserId)

        if (error) {
            console.error("Failed to edit message", error)
            return
        }

        setMessages(prev => prev.map(msg =>
            msg.id === messageId
                ? { ...msg, content: newContent.trim(), edited_at: editedAt }
                : msg
        ))

        const encoder = new TextEncoder()
        room.localParticipant.publishData(
            encoder.encode(JSON.stringify({
                type: 'EDIT_MESSAGE',
                messageId,
                newContent: newContent.trim(),
                editedAt,
                fromId: currentUserId,
            })),
            {reliable: true}
        )
    }, [room, currentUserId])

    const deleteMessage = useCallback(async (messageId: string) => {
        if (!room) return

        const isAdmin = currentUserRole === 'admin'

        let query = supabase
            .from('live_podcast_messages')
            .delete()
            .eq('id', messageId)

        // If not admin, only allow deleting own messages
        if (!isAdmin) {
            query = query.eq('sender_id', currentUserId)
        }

        const { error } = await query

        if (error) {
            console.error("Failed to delete message", error)
            return
        }

        setMessages(prev => prev.filter(msg => msg.id !== messageId))

        const encoder = new TextEncoder()
        room.localParticipant.publishData(
            encoder.encode(JSON.stringify({
                type: 'DELETE_MESSAGE',
                messageId,
                fromId: currentUserId,
            })),
            {reliable: true}
        )
    }, [room, currentUserId, currentUserRole])

    const canDeleteMessage = useCallback((messageSenderId: string) => {
        return currentUserId === messageSenderId || currentUserRole === 'admin'
    }, [currentUserId, currentUserRole])

    const canEditMessage = useCallback((messageSenderId: string) => {
        return currentUserId === messageSenderId
    }, [currentUserId])

    const addSystemMessage = useCallback((content: string) => {
        const id = `sys-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        const created_at = new Date().toISOString()

        const systemMessage: LiveMessage = {
            id,
            podcast_id: podcastId,
            sender_id: 'system',
            sender_name: 'System',
            sender_avartar_url: null,
            content,
            message_type: 'system' as MessageType,
            created_at,
            reply_to_id: null,
            reply_preview: null,
            edited_at: null,
            isLocal: false,
        }

        setMessages(prev => [...prev, systemMessage])
    }, [podcastId])

        return {messages, sendMessage, sendImage, editMessage, deleteMessage, canDeleteMessage, canEditMessage, addSystemMessage}
}
