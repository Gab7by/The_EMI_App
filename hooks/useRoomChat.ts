import { pickImage, uploadChatImage } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { ChatActionResult, LiveMessage, MessageType, ReplyPreview } from "@/types/podcast-types";
import type { Room } from "livekit-client";
import { useCallback, useEffect, useRef, useState } from "react";

/** Users may only edit their own messages within 10 minutes of sending. */
const EDIT_WINDOW_MS = 10 * 60 * 1000;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Guards every value that will be used in a `.eq('id', …)` / FK column.
 * The `live_podcast_messages.id` column is a PostgreSQL `uuid`, so anything
 * that is not a real UUID would crash with
 * `invalid input syntax for type uuid`. The DB is the single source of
 * truth for message IDs — we never fabricate IDs on the client.
 */
const isUuid = (value: string | null | undefined): value is string => {
  return typeof value === "string" && UUID_PATTERN.test(value);
};

export const useRoomChat = (
    room: Room | null,
    podcastId: string,
    currentUserId: string,
    currentUserRole?: string
) => {
    const [messages, setMessages] = useState<LiveMessage[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const recentSystemEventsRef = useRef(new Map<string, number>())

    const fetchReplyPreview = useCallback(async (replyToId: string): Promise<ReplyPreview | null> => {
        if (!isUuid(replyToId)) {
            console.error("fetchReplyPreview: reply_to_id is not a valid UUID", replyToId)
            return null
        }

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
            setIsLoading(true)
            console.log("[useRoomChat] loadHistory started", { podcastId, currentUserId })

            const { data, error } = await supabase
                .from('live_podcast_messages')
                .select('*')
                .eq('podcast_id', podcastId)
                .order("created_at", { ascending: true })

            if (error) {
                console.error("[useRoomChat] loadHistory failed", { error, podcastId })
                setIsLoading(false)
                return
            }

            if (!data) {
                console.warn("[useRoomChat] loadHistory returned no data", { podcastId })
                setIsLoading(false)
                return
            }

            console.log("[useRoomChat] loadHistory fetched messages", { count: data.length })

            // Batch-resolve reply previews for every message that references
            // another message, so the "Replying to …" banner shows even for
            // messages loaded from history (not just LiveKit broadcasts).
            const replyIds = data
                .map((message) => message.reply_to_id)
                .filter((id): id is string => isUuid(id))

            const uniqueReplyIds = [...new Set(replyIds)]

            let previewMap = new Map<string, ReplyPreview>()
            if (uniqueReplyIds.length > 0) {
                const { data: previews, error: previewError } = await supabase
                    .from('live_podcast_messages')
                    .select('id, sender_name, content, message_type')
                    .in('id', uniqueReplyIds)

                if (!previewError && previews) {
                    previewMap = new Map(
                        previews.map((preview) => [
                            preview.id,
                            {
                                sender_name: preview.sender_name,
                                content: preview.content,
                                message_type: preview.message_type as MessageType,
                            },
                        ])
                    )
                }
            }

            setMessages(
                data.map((message) => ({
                    ...message,
                    reply_preview: message.reply_to_id
                        ? (previewMap.get(message.reply_to_id) ?? null)
                        : null,
                    isLocal: message.sender_id === currentUserId,
                }))
            )
            setIsLoading(false)
            console.log("[useRoomChat] loadHistory completed", { messageCount: data.length })
        }

        loadHistory()
    }, [podcastId, currentUserId])

    useEffect(() => {
        if (!room) return

        let cleanup: (() => void) | null = null

        import("livekit-client").then(({ RoomEvent }) => {
            const handleData = (payload: Uint8Array) => {
                const decoder = new TextDecoder()
                const text = decoder.decode(payload)

                try {
                    const parsed = JSON.parse(text)

                    if (parsed.type === 'CHAT') {
                        // LiveKit is only the real-time delivery mechanism;
                        // rows from Supabase are the chat source of truth. An
                        // older client fabricated timestamp-based IDs, which
                        // can never be edited/deleted in PostgreSQL. Do not
                        // let those broadcasts pollute the authoritative UI.
                        if (!isUuid(parsed.id)) {
                            console.warn('[useRoomChat] Ignored non-persisted LiveKit chat payload', {
                                id: parsed.id,
                                senderId: parsed.sender_id,
                                podcastId: parsed.podcast_id,
                            })
                            return
                        }
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
                    // Ignore malformed / non-chat payloads
                }
            }

            room.on(RoomEvent.DataReceived, handleData)
            cleanup = () => room.off(RoomEvent.DataReceived, handleData)
        })

        return () => cleanup?.()
    }, [room, currentUserId])

    /**
     * Sends an image message.
     *
     * The message is first persisted to Supabase WITHOUT a client-supplied id —
     * the database generates the real UUID. We read it back and use that same
     * UUID for local state and the LiveKit broadcast, so every layer agrees on
     * the id (this is what makes reply / edit / delete work).
     */
    const sendImage = useCallback(async (
        senderName: string,
        senderAvatarUrl: string | null,
        replyToId?: string | null
    ): Promise<ChatActionResult> => {
        if (!room) return { ok: false, error: "Not connected to the live room." }

        const asset = await pickImage({ allowsEditing: false })
        if (!asset) return { ok: false, error: "No image selected." }

        const imageUrl = await uploadChatImage(asset, podcastId, currentUserId)
        if (!imageUrl) return { ok: false, error: "Failed to upload image." }

        let replyPreview: ReplyPreview | null = null
        if (replyToId) {
            replyPreview = await fetchReplyPreview(replyToId)
        }

        const insertPayload: Record<string, unknown> = {
            podcast_id: podcastId,
            sender_id: currentUserId,
            sender_name: senderName,
            sender_avartar_url: senderAvatarUrl,
            content: imageUrl,
            message_type: 'image' as MessageType,
        }

        if (replyToId) {
            insertPayload.reply_to_id = replyToId
        }

        const { data: inserted, error } = await supabase
            .from('live_podcast_messages')
            .insert(insertPayload)
            .select('id, created_at')
            .single()

        if (error || !inserted) {
            console.error("Failed to save live podcast image message", error)
            return { ok: false, error: "Failed to send image." }
        }

        const newMessage: LiveMessage = {
            id: inserted.id,
            podcast_id: podcastId,
            sender_id: currentUserId,
            sender_name: senderName,
            sender_avartar_url: senderAvatarUrl,
            content: imageUrl,
            message_type: 'image',
            created_at: inserted.created_at,
            reply_to_id: replyToId ?? null,
            reply_preview: replyPreview,
            edited_at: null,
            isLocal: true,
        }

        setMessages(prev => {
            if (prev.some((message) => message.id === newMessage.id)) return prev
            return [...prev, newMessage]
        })

        const encoder = new TextEncoder()
        room.localParticipant.publishData(
            encoder.encode(JSON.stringify({ type: 'CHAT', ...newMessage })),
            { reliable: true }
        )

        return { ok: true }
    }, [room, podcastId, currentUserId, fetchReplyPreview])

    /**
     * Sends a text message. Same id strategy as `sendImage`: the DB owns the id.
     * `replyToId` is the real UUID of an existing message (already in the DB),
     * so linking it as a foreign key is trivial.
     */
    const sendMessage = useCallback(async (
        content: string,
        senderName: string,
        senderAvatarUrl: string | null,
        replyToId?: string | null
    ): Promise<ChatActionResult> => {
        if (!room) return { ok: false, error: "Not connected to the live room." }
        if (!content.trim()) return { ok: false, error: "Message is empty." }

        let replyPreview: ReplyPreview | null = null
        if (replyToId) {
            replyPreview = await fetchReplyPreview(replyToId)
        }

        const insertPayload: Record<string, unknown> = {
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

        const { data: inserted, error } = await supabase
            .from('live_podcast_messages')
            .insert(insertPayload)
            .select('id, created_at')
            .single()

        if (error || !inserted) {
            console.error("Failed to save live podcast message", error)
            return { ok: false, error: "Failed to send message." }
        }

        const messageData: LiveMessage = {
            id: inserted.id,
            podcast_id: podcastId,
            sender_id: currentUserId,
            sender_name: senderName,
            sender_avartar_url: senderAvatarUrl,
            content: content.trim(),
            message_type: 'text',
            created_at: inserted.created_at,
            reply_to_id: replyToId ?? null,
            reply_preview: replyPreview,
            edited_at: null,
            isLocal: true,
        }

        setMessages(prev => {
            if (prev.some((message) => message.id === messageData.id)) return prev
            return [...prev, messageData]
        })

        const encoder = new TextEncoder()
        room.localParticipant.publishData(
            encoder.encode(JSON.stringify({ type: 'CHAT', ...messageData })),
            { reliable: true }
        )

        return { ok: true }
    }, [room, podcastId, currentUserId, fetchReplyPreview])

    /**
     * Edits a message. Enforces the 10-minute window on the client — if the
     * message is older than 10 minutes, we do NOT make the API call at all.
     */
    const editMessage = useCallback(async (message: LiveMessage, newContent: string): Promise<ChatActionResult> => {
        console.log("[useRoomChat] editMessage called", {
            messageId: message.id,
            currentUserId,
            newContent,
            roomConnected: !!room,
            fullMessage: message,
        })

        if (!room) return { ok: false, error: "Not connected to the live room." }
        if (!newContent.trim()) return { ok: false, error: "Message is empty." }
        if (message.message_type === 'system') return { ok: false, error: "System messages cannot be edited." }

        const validUuid = isUuid(message.id)
        console.log("[useRoomChat] editMessage uuid check", { validUuid, messageId: message.id })
        if (!validUuid) {
            return { ok: false, error: "This message can't be edited — it was sent by an older version of the app." }
        }

        const createdAt = new Date(message.created_at).getTime()
        const ageMs = Date.now() - createdAt
        console.log("[useRoomChat] editMessage time check", {
            createdAt,
            ageMs,
            editWindowMs: EDIT_WINDOW_MS,
            withinWindow: !Number.isNaN(createdAt) && ageMs <= EDIT_WINDOW_MS,
            created_atRaw: message.created_at,
        })
        if (!Number.isNaN(createdAt) && ageMs > EDIT_WINDOW_MS) {
            return { ok: false, error: "You can only edit a message within 10 minutes of sending it." }
        }

        const editedAt = new Date().toISOString()

        console.log("[useRoomChat] editMessage calling supabase update", {
            id: message.id,
            senderId: currentUserId,
            editTransport: 'database RPC with direct-update fallback',
            updatePayload: { content: newContent.trim(), edited_at: editedAt },
        })

        // The RPC makes the ownership and edit-window checks inside
        // PostgreSQL. Fall back only while an older backend is being deployed.
        const rpcResult = await supabase.rpc('edit_live_podcast_message', {
            p_message_id: message.id,
            p_content: newContent.trim(),
        })
        const rpcMissing = rpcResult.error?.code === 'PGRST202' ||
            rpcResult.error?.message?.toLowerCase().includes('could not find the function')
        let data = rpcResult.data as { id: string } | { id: string }[] | null
        let error = rpcResult.error
        if (rpcMissing) {
            console.warn('[useRoomChat] Edit RPC is not deployed; using direct update fallback.')
            const fallback = await supabase
                .from('live_podcast_messages')
                .update({ content: newContent.trim(), edited_at: editedAt })
                .eq('id', message.id)
                .eq('sender_id', currentUserId)
                .select('id')
                .maybeSingle()
            data = fallback.data
            error = fallback.error
        }

        const updatedMessage = Array.isArray(data) ? data[0] ?? null : data
        console.log("[useRoomChat] editMessage supabase result", {
            data: updatedMessage,
            error,
            errorCode: error?.code ?? null,
            errorDetails: error?.details ?? null,
            errorHint: error?.hint ?? null,
            matchedRows: updatedMessage ? 1 : 0,
        })

        if (error) {
            console.error("[useRoomChat] editMessage failed with error:", {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
            })
            return { ok: false, error: `Failed to edit message: ${error.message}` }
        }

        // update matched ZERO rows — the most likely cause of "silent" edit failure:
        //  - the message id isn't in the DB (legacy fake id slipped through)
        //  - RLS policy blocks UPDATE for this user
        //  - sender_id mismatch (editing someone else's message)
        if (!updatedMessage) {
            console.warn(
                "[useRoomChat] editMessage: update matched 0 rows. Check RLS policies on live_podcast_messages (UPDATE) and that id=",
                message.id,
                "sender_id=",
                currentUserId,
                "exists."
            )
            return { ok: false, error: "Message not found or you don't have permission to edit it." }
        }

        console.log("[useRoomChat] editMessage succeeded, broadcasting EDIT_MESSAGE", {
            messageId: message.id,
            newContent: newContent.trim(),
            editedAt,
        })

        setMessages(prev => prev.map(msg =>
            msg.id === message.id
                ? { ...msg, content: newContent.trim(), edited_at: editedAt }
                : msg
        ))

        const encoder = new TextEncoder()
        room.localParticipant.publishData(
            encoder.encode(JSON.stringify({
                type: 'EDIT_MESSAGE',
                messageId: message.id,
                newContent: newContent.trim(),
                editedAt,
                fromId: currentUserId,
            })),
            { reliable: true }
        )

        return { ok: true }
    }, [room, currentUserId])

    /**
     * Deletes a message. Admins may delete any message; everyone else may only
     * delete their own.
     */
    const deleteMessage = useCallback(async (message: LiveMessage): Promise<ChatActionResult> => {
        if (!room) return { ok: false, error: "Not connected to the live room." }
        if (message.message_type === 'system') return { ok: false, error: "System messages cannot be deleted." }
        if (!isUuid(message.id)) {
            return { ok: false, error: "This message can't be deleted — it was sent by an older version of the app." }
        }

        const isAdmin = currentUserRole === 'admin'

        let query = supabase
            .from('live_podcast_messages')
            .delete()
            .eq('id', message.id)

        // If not admin, only allow deleting own messages
        if (!isAdmin) {
            query = query.eq('sender_id', currentUserId)
        }

        const { error } = await query

        if (error) {
            console.error("Failed to delete message", error)
            return { ok: false, error: "Failed to delete message." }
        }

        setMessages(prev => prev.filter(msg => msg.id !== message.id))

        const encoder = new TextEncoder()
        room.localParticipant.publishData(
            encoder.encode(JSON.stringify({
                type: 'DELETE_MESSAGE',
                messageId: message.id,
                fromId: currentUserId,
            })),
            { reliable: true }
        )

        return { ok: true }
    }, [room, currentUserId, currentUserRole])

    const canDeleteMessage = useCallback((message: LiveMessage) => {
        if (message.message_type === 'system') return false
        if (!isUuid(message.id)) return false
        return currentUserId === message.sender_id || currentUserRole === 'admin'
    }, [currentUserId, currentUserRole])

    const canEditMessage = useCallback((message: LiveMessage) => {
        if (message.message_type === 'system') {
            console.log("[useRoomChat] canEditMessage: false (system message)", { id: message.id })
            return false
        }
        if (!isUuid(message.id)) {
            console.log("[useRoomChat] canEditMessage: false (not a valid UUID)", { id: message.id })
            return false
        }
        if (currentUserId !== message.sender_id) {
            console.log("[useRoomChat] canEditMessage: false (not own message)", {
                id: message.id,
                currentUserId,
                senderId: message.sender_id,
            })
            return false
        }

        const createdAt = new Date(message.created_at).getTime()
        if (Number.isNaN(createdAt)) {
            console.log("[useRoomChat] canEditMessage: false (invalid created_at)", { id: message.id, created_at: message.created_at })
            return false
        }
        const withinWindow = Date.now() - createdAt <= EDIT_WINDOW_MS
        console.log("[useRoomChat] canEditMessage", {
            id: message.id,
            withinWindow,
            ageMs: Date.now() - createdAt,
            editWindowMs: EDIT_WINDOW_MS,
        })
        return withinWindow
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

    /** Persist a room event. Only the host should call this so reconnecting
     * clients see one durable, chronological event rather than duplicates. */
    const sendSystemMessage = useCallback(async (content: string, eventKey?: string): Promise<ChatActionResult> => {
        if (!room) return { ok: false, error: "Not connected to the live room." }
        const key = eventKey ?? content
        const now = Date.now()
        const lastSentAt = recentSystemEventsRef.current.get(key)
        // LiveKit can emit a disconnect alongside a track cleanup event. Keep
        // one durable room event for a participant transition, not two.
        if (lastSentAt && now - lastSentAt < 5_000) {
            console.log('[useRoomChat] Deduplicated system room event', { key, content })
            return { ok: true }
        }
        recentSystemEventsRef.current.set(key, now)
        const { data: inserted, error } = await supabase
            .from('live_podcast_messages')
            .insert({
                podcast_id: podcastId,
                sender_id: currentUserId,
                sender_name: 'System',
                sender_avartar_url: null,
                content,
                message_type: 'system',
            })
            .select('*')
            .single()

        if (error || !inserted) {
            console.error('[useRoomChat] Could not persist system message', {
                podcastId, currentUserId, content, error: error?.message, code: error?.code, details: error?.details,
            })
            return { ok: false, error: error?.message ?? 'Could not save room event.' }
        }

        const message: LiveMessage = { ...inserted, reply_preview: null, isLocal: false }
        setMessages(prev => prev.some(item => item.id === message.id) ? prev : [...prev, message])
        try {
            await room.localParticipant.publishData(
                new TextEncoder().encode(JSON.stringify({ type: 'CHAT', ...message })),
                { reliable: true }
            )
        } catch (broadcastError) {
            // Persistence succeeded; history is still correct even if a peer
            // misses the immediate LiveKit notification.
            console.error('[useRoomChat] System message saved but broadcast failed', broadcastError)
        }
        return { ok: true }
    }, [room, podcastId, currentUserId])

    return {
        messages,
        isLoading,
        sendMessage,
        sendImage,
        editMessage,
        deleteMessage,
        canDeleteMessage,
        canEditMessage,
        addSystemMessage,
        sendSystemMessage,
    }
}
