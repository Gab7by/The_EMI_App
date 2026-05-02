import { RoomSignal } from "@/types/livekit-types";
import type { Room } from "livekit-client";
import { supabase } from "./supabase";

const logFunctionErrorResponse = async (
    label: string,
    error: unknown,
    responseOverride?: unknown
) => {
    const response =
        responseOverride ??
        (error as { response?: Response })?.response

    if (!response) {
        console.error(label, error)
        return
    }

    try {
        const typedResponse = response as Response
        const bodyText =
            typeof typedResponse.text === "function"
                ? await typedResponse.text()
                : JSON.stringify(response)

        console.error(label, {
            status: typedResponse.status,
            statusText: typedResponse.statusText,
            bodyText,
            rawResponse: response,
        })
    } catch (responseError) {
        console.error(label, {
            rawResponse: response,
            responseError,
        })
    }
}

export const sendSignal = async (room: Room, signal: RoomSignal) => {
    const encoder = new TextEncoder()

    const data = encoder.encode(JSON.stringify(signal))

    await room.localParticipant.publishData(
        data,
        {
            reliable: true
        }
    )
}

export const raiseHand = async (
    room: Room,
    userId: string,
    userName: string
) => {
    await sendSignal(room, {
        type: 'RAISE_HAND',
        fromId: userId,
        fromName: userName
    })
}

export const lowerHand = async (
    room: Room,
    userId: string,
    userName: string
) => {
    await sendSignal(room, {
        type: 'LOWER_HAND',
        fromId: userId,
        fromName: userName
    })
}

export const approveSpeaker = async (
    room: Room,
    hostId: string,
    hostName: string,
    participantId: string,
    roomName: string,
    podcastId: string
) => {
    console.log("approveSpeaker params", {
        hostId,
        participantId,
        roomName,
        podcastId,
    })

    const {data, error} = await supabase.functions.invoke('livekit-grant-speaker', {
        body: {
            roomName,
            participantIdentity: participantId,
            podcastId
        }
    })

    if (error) {
        console.error('Failed to grant speaker permission: ', error.message, {
            roomName,
            participantIdentity: participantId,
            podcastId,
        })
        await logFunctionErrorResponse("Grant speaker response body", error)
        return false
    }

    console.log("approveSpeaker response", data)

    await sendSignal(room, {
        type: 'HAND_APPROVED',
        fromId: hostId,
        fromName: hostName,
        toId: participantId
    })

    return true
}

export const sendSessionEnded = async (
    room: Room,
    hostId: string,
    hostName: string
) => {
    await sendSignal(room, {
        type: 'SESSION_ENDED',
        fromId: hostId,
        fromName: hostName
    })
}

export const revokeSpeaker = async (
    room: Room,
    hostId: string,
    hostName: string,
    participantId: string,
    roomName: string,
    podcastId: string
) => {
    console.log("revokeSpeaker params", {
        hostId,
        participantId,
        roomName,
        podcastId,
    })

    const {data, error} = await supabase.functions.invoke(
        "livekit-revoke-speaker",
        {
            body: {
                roomName,
                participantIdentity: participantId,
                podcastId
            }
        }
    )

    if (error) {
        console.error("Failed to revoke speaker permission: ", error.message, {
            roomName,
            participantIdentity: participantId,
            podcastId,
        })
        await logFunctionErrorResponse("Revoke speaker response body", error)
        return false
    }

    console.log("revokeSpeaker response", data)

    await sendSignal(room, {
        type: 'SPEAKER_REVOKED',
        fromId: hostId,
        fromName: hostName,
        toId: participantId
    })

    return true
}

export const testGrantSpeaker = async (
    roomName: string,
    participantIdentity: string,
    podcastId: string
) => {
    console.log("Testing livekit-grant-speaker with:", {
        roomName,
        participantIdentity,
        podcastId,
    })

    const result = await supabase.functions.invoke("livekit-grant-speaker", {
        body: {
            roomName,
            participantIdentity,
            podcastId,
        }
    })

    console.log("livekit-grant-speaker test result:", result)

    if (result.error) {
        await logFunctionErrorResponse(
            "livekit-grant-speaker test response body",
            result.error,
            result.response
        )
    }

    return result
}

export const testRevokeSpeaker = async (
    roomName: string,
    participantIdentity: string,
    podcastId: string
) => {
    console.log("Testing livekit-revoke-speaker with:", {
        roomName,
        participantIdentity,
        podcastId,
    })

    const result = await supabase.functions.invoke("livekit-revoke-speaker", {
        body: {
            roomName,
            participantIdentity,
            podcastId,
        }
    })

    console.log("livekit-revoke-speaker test result:", result)

    if (result.error) {
        await logFunctionErrorResponse(
            "livekit-revoke-speaker test response body",
            result.error,
            result.response
        )
    }

    return result
}
